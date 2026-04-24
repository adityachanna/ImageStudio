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

    // Validate file size (non-empty and under 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds maximum size of 50MB' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WEBP, GIF` },
        { status: 400 }
      );
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
      // Map quality (1-100) to compressionLevel (0-9) for PNG lossless compression
      const compressionLevel = Math.max(0, Math.min(9, Math.round((100 - quality) / 11)));
      outputBuffer = await sharp(inputBuffer).png({ compressionLevel }).toBuffer();
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
      // Log to console for monitoring but don't fail the request
      // The user still gets the file directly in the response
    }

    // Warn if R2 storage is not functional
    if (!outputUpload) {
      log('WARNING: Output was not persisted to R2. User received direct response only.');
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
    const errStack = error instanceof Error ? error.stack : '';
    console.error('Compression error:', errMsg, errStack);

    // Categorize error for better user feedback
    let userMessage = 'Compression failed due to an unexpected error.';
    if (errMsg.includes('Input buffer contains unsupported image format')) {
      userMessage = 'The file appears to be corrupted or is not a valid image.';
    } else if (errMsg.includes('VipsError') || errMsg.includes('sharp')) {
      userMessage = 'Image processing failed. The file may be corrupted or in an unsupported format.';
    } else if (errMsg.includes('timeout') || errMsg.includes('ETIMEDOUT')) {
      userMessage = 'Image processing timed out. Try a smaller image or lower quality setting.';
    } else if (errMsg.includes('memory') || errMsg.includes('Memory')) {
      userMessage = 'Image is too large to process. Try a smaller file or dimensions.';
    }

    try { await uploadLog(requestId, `ERROR: ${errMsg}`); } catch {}
    return NextResponse.json(
      { error: userMessage, detail: errMsg, requestId },
      { status: 500 }
    );
  }
}
