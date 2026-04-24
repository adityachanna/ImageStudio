import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { generateRequestId, uploadInput, uploadOutput, uploadLog } from '@/lib/r2';
import { saveRequestRecord } from '@/lib/requestStore';

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const logLines: string[] = [];

  const log = (msg: string) => {
    const line = `[resize] ${msg}`;
    console.log(line);
    logLines.push(line);
  };

  try {
    log(`Request started — requestId=${requestId}`);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const widthStr  = formData.get('width')  as string | null;
    const heightStr = formData.get('height') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const width  = widthStr  ? parseInt(widthStr,  10) : undefined;
    const height = heightStr ? parseInt(heightStr, 10) : undefined;

    if (!width && !height) {
      return NextResponse.json({ error: 'Width or Height must be provided' }, { status: 400 });
    }

    log(`Received file: ${file.name} (${(file.size / 1024).toFixed(1)} KB), target=${width ?? '?'}x${height ?? '?'}`);

    const mimeType = file.type;
    const ext = mimeType.replace('image/', '');
    const sharpFormat = (ext === 'jpg' ? 'jpeg' : ext) as 'jpeg' | 'png' | 'webp' | 'gif' | 'avif';

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // ── Upload INPUT to R2 ──────────────────────────────────────────────────
    let inputUpload;
    try {
      inputUpload = await uploadInput(requestId, file.name, inputBuffer, mimeType || 'image/jpeg');
      log(`Input uploaded to R2: ${inputUpload.key}`);
    } catch (err) {
      log(`R2 input upload failed (non-fatal): ${err}`);
    }

    // ── Process with sharp ──────────────────────────────────────────────────
    const outputBuffer = await sharp(inputBuffer)
      .resize({ width, height, fit: sharp.fit.inside, withoutEnlargement: true })
      .toFormat(sharpFormat)
      .toBuffer();

    const metadata = await sharp(outputBuffer).metadata();
    log(`Resize done. Output=${metadata.width}x${metadata.height}, size=${outputBuffer.length}B`);

    // ── Upload OUTPUT to R2 ─────────────────────────────────────────────────
    const outputFileName = `resized.${sharpFormat}`;
    let outputUpload;
    try {
      outputUpload = await uploadOutput(requestId, outputFileName, outputBuffer, mimeType);
      log(`Output uploaded to R2: ${outputUpload.key}`);
    } catch (err) {
      log(`R2 output upload failed (non-fatal): ${err}`);
    }

    // ── Upload LOG to R2 ────────────────────────────────────────────────────
    let logUpload;
    try {
      logUpload = await uploadLog(requestId, logLines.join(' | '));
    } catch (err) {
      console.error('R2 log upload failed (non-fatal):', err);
    }

    // ── Save record locally ─────────────────────────────────────────────────
    try {
      saveRequestRecord({
        requestId,
        tool: 'resize',
        originalFileName: file.name,
        createdAt: new Date().toISOString(),
        inputKey:  inputUpload?.key  ?? '',
        outputKey: outputUpload?.key ?? '',
        logKey:    logUpload?.key    ?? '',
        inputUrl:  inputUpload?.objectUrl  ?? '',
        outputUrl: outputUpload?.objectUrl ?? '',
        logUrl:    logUpload?.objectUrl    ?? '',
      });
    } catch (err) {
      console.error('Local store save failed (non-fatal):', err);
    }

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="resized.${sharpFormat}"`,
        'X-Request-Id': requestId,
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Resize error:', errMsg);
    try { await uploadLog(requestId, `ERROR: ${errMsg}`); } catch {}
    return NextResponse.json({ error: 'Failed to resize image', requestId }, { status: 500 });
  }
}
