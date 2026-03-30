import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { generateRequestId, uploadInput, uploadOutput, uploadLog } from '@/lib/r2';
import { saveRequestRecord } from '@/lib/requestStore';

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const logLines: string[] = [];

  const log = (msg: string) => {
    const line = `[compress] ${msg}`;
    console.log(line);
    logLines.push(line);
  };

  try {
    log(`Request started — requestId=${requestId}`);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const format = (formData.get('format') as string) || 'jpeg';
    const quality = parseInt((formData.get('quality') as string) ?? '80', 10);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    log(`Received file: ${file.name} (${(file.size / 1024).toFixed(1)} KB), format=${format}, quality=${quality}`);

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // ── Upload INPUT to R2 ──────────────────────────────────────────────────
    let inputUpload;
    try {
      inputUpload = await uploadInput(requestId, file.name, inputBuffer, file.type || 'image/jpeg');
      log(`Input uploaded to R2: ${inputUpload.key}`);
    } catch (err) {
      log(`R2 input upload failed (non-fatal): ${err}`);
    }

    // ── Process with sharp ──────────────────────────────────────────────────
    let outputBuffer: Buffer;
    if (format === 'png') {
      outputBuffer = await sharp(inputBuffer).png({ quality }).toBuffer();
    } else if (format === 'webp') {
      outputBuffer = await sharp(inputBuffer).webp({ quality }).toBuffer();
    } else {
      outputBuffer = await sharp(inputBuffer).jpeg({ quality }).toBuffer();
    }

    const savedBytes = inputBuffer.length - outputBuffer.length;
    log(`Compression done. Input=${inputBuffer.length}B, Output=${outputBuffer.length}B, Saved=${savedBytes}B`);

    // ── Upload OUTPUT to R2 ─────────────────────────────────────────────────
    const outputFileName = `compressed.${format}`;
    let outputUpload;
    try {
      outputUpload = await uploadOutput(requestId, outputFileName, outputBuffer, `image/${format}`);
      log(`Output uploaded to R2: ${outputUpload.key}`);
    } catch (err) {
      log(`R2 output upload failed (non-fatal): ${err}`);
    }

    // ── Upload LOG to R2 ────────────────────────────────────────────────────
    let logUpload;
    try {
      logUpload = await uploadLog(requestId, logLines.join(' | '));
      log(`Log uploaded to R2: ${logUpload.key}`);
    } catch (err) {
      console.error('R2 log upload failed (non-fatal):', err);
    }

    // ── Save record locally ─────────────────────────────────────────────────
    try {
      saveRequestRecord({
        requestId,
        tool: 'compress',
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
        'Content-Type': `image/${format}`,
        'Content-Disposition': `attachment; filename="compressed.${format}"`,
        'X-Request-Id': requestId,
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Compression error:', errMsg);
    try { await uploadLog(requestId, `ERROR: ${errMsg}`); } catch {}
    return NextResponse.json({ error: 'Failed to compress image', requestId }, { status: 500 });
  }
}
