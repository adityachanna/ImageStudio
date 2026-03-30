import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { generateRequestId, uploadInput, uploadOutput, uploadLog } from '@/lib/r2';
import { saveRequestRecord } from '@/lib/requestStore';

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const logLines: string[] = [];

  const log = (msg: string) => {
    const line = `[pdf] ${msg}`;
    console.log(line);
    logLines.push(line);
  };

  try {
    log(`Request started — requestId=${requestId}`);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mimeType = file.type;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType)) {
      return NextResponse.json(
        { error: 'Unsupported format. Please use JPG or PNG.' },
        { status: 400 }
      );
    }

    log(`Received file: ${file.name} (${(file.size / 1024).toFixed(1)} KB), type=${mimeType}`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const inputBuffer = Buffer.from(arrayBuffer);

    // ── Upload INPUT to R2 ──────────────────────────────────────────────────
    let inputUpload;
    try {
      inputUpload = await uploadInput(requestId, file.name, inputBuffer, mimeType);
      log(`Input uploaded to R2: ${inputUpload.key}`);
    } catch (err) {
      log(`R2 input upload failed (non-fatal): ${err}`);
    }

    // ── Build PDF ───────────────────────────────────────────────────────────
    const pdfDoc = await PDFDocument.create();
    let pdfImage;
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      pdfImage = await pdfDoc.embedJpg(buffer);
    } else {
      pdfImage = await pdfDoc.embedPng(buffer);
    }

    const { width, height } = pdfImage.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(pdfImage, { x: 0, y: 0, width, height });

    const pdfBytes = await pdfDoc.save();
    const outputBuffer = Buffer.from(pdfBytes);
    log(`PDF built: ${width}x${height}pt, size=${outputBuffer.length}B`);

    // ── Upload OUTPUT to R2 ─────────────────────────────────────────────────
    const outputFileName = 'converted.pdf';
    let outputUpload;
    try {
      outputUpload = await uploadOutput(requestId, outputFileName, outputBuffer, 'application/pdf');
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
        tool: 'pdf',
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

    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="converted.pdf"`,
        'X-Request-Id': requestId,
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('PDF conversion error:', errMsg);
    try { await uploadLog(requestId, `ERROR: ${errMsg}`); } catch {}
    return NextResponse.json({ error: 'Failed to convert to PDF', requestId }, { status: 500 });
  }
}
