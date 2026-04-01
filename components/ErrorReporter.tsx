'use client';

import React, { useState, useRef } from 'react';
import { AlertTriangle, X, Bug, Send, Camera, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorReporterProps {
  /** The error message from the API */
  errorMessage: string;
  /** The request ID returned from the API */
  requestId: string;
  /** Which tool triggered the error */
  tool: 'compress' | 'resize' | 'pdf';
  /** Original file name */
  fileName?: string;
  /** Called when user dismisses the error entirely */
  onDismiss: () => void;
}

type ReportStep = 'idle' | 'open' | 'capturing' | 'submitting' | 'success' | 'error';

const BACKEND_URL = process.env.NEXT_PUBLIC_JDI_BACKEND_URL ?? 'http://localhost:8000';

export default function ErrorReporter({
  errorMessage,
  requestId,
  tool,
  fileName,
  onDismiss,
}: ErrorReporterProps) {
  const router = useRouter();
  const [step, setStep] = useState<ReportStep>('idle');
  const [email, setEmail] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [screenshot, setScreenshot] = useState<Blob | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // ── Capture screenshot ──────────────────────────────────────────────────────
  const captureScreenshot = async () => {
    setStep('capturing');
    setScreenshotError('');
    
    // Small delay to ensure the "Capturing" overlay is rendered
    await new Promise(r => setTimeout(r, 100));

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.body, {
        backgroundColor: '#ffffff',
        foreignObjectRendering: true,
        useCORS: true,
        allowTaint: false,
        scale: 1,
        logging: false,
        removeContainer: true,
        ignoreElements: (element) => element.id === 'error-reporter-modal',
      });

      // Use toDataURL for instant preview
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshotUrl(dataUrl);

      // Also get the blob for the actual submission
      canvas.toBlob(blob => {
        if (blob) setScreenshot(blob);
      }, 'image/png');

      setStep('open');
    } catch (err) {
      console.error('Screenshot capture failed:', err);
      setScreenshotError(
        err instanceof Error
          ? `Preview unavailable: ${err.message}`
          : 'Preview unavailable: screenshot capture failed.'
      );
      setStep('open');
    }
  };

  const openModal = async () => {
    await captureScreenshot();
  };

  // ── Build issue description ─────────────────────────────────────────────────
  const buildDescription = (): string => {
    const lines = [
      `Tool: ${tool.toUpperCase()}`,
      `Error: ${errorMessage}`,
      `Request ID: ${requestId}`,
      fileName ? `File: ${fileName}` : null,
      extraInfo ? `\nAdditional info:\n${extraInfo}` : null,
    ].filter(Boolean);
    return lines.join('\n');
  };

  // ── Submit ticket ───────────────────────────────────────────────────────────
  const submitReport = async () => {
    if (!email || !email.includes('@')) {
      setSubmitError('Please enter a valid email address.');
      return;
    }
    setStep('submitting');
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('requestId', requestId || crypto.randomUUID());
      formData.append('userEmail', email.trim());
      formData.append('requestType', 'Bug Report');
      formData.append('issueDescription', buildDescription());
      formData.append('primaryChoice', 'JDI');
      formData.append('reviewType', 'Image Studio');

      if (screenshot) {
        formData.append('issuePhotos', screenshot, 'screenshot.png');
      }

      const res = await fetch(`${BACKEND_URL}/api/tickets/ingest`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail ?? 'Submission failed');
      }

      const resolvedRequestId = (data.requestId ?? requestId) || crypto.randomUUID();
      setSubmittedId(resolvedRequestId);

      router.push(`/requests?requestId=${encodeURIComponent(resolvedRequestId)}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
      setStep('open');
    }
  };

  // ── Dismiss both the reporter and underlying error banner ──────────────────
  const handleClose = () => {
    if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    setStep('idle');
    setScreenshot(null);
    setScreenshotUrl(null);
    setScreenshotError('');
    setEmail('');
    setExtraInfo('');
    setSubmitError('');
  };

  return (
    <>
      {/* ── Inline error banner ──────────────────────────────────────────────── */}
      <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-rose-900 mb-1">Processing failed</p>
            <p className="text-xs text-rose-700 leading-relaxed break-words mb-2">{errorMessage}</p>
            {requestId && (
              <p className="inline-block px-2 py-0.5 bg-rose-100 text-rose-600 font-mono text-[10px] rounded border border-rose-200">
                ID: {requestId}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openModal}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-rose-700 transition-colors"
          >
            <Bug size={14} /> Report to AI
          </button>
          <button
            onClick={onDismiss}
            className="inline-flex items-center justify-center px-4 py-2 bg-transparent text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100/50 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* ── Modal backdrop ───────────────────────────────────────────────────── */}
      {(step === 'open' || step === 'capturing' || step === 'submitting' || step === 'success') && (
        <div
          id="error-reporter-modal"
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div
            ref={modalRef}
            style={{
              background: '#fff',
              borderRadius: 22,
              width: '100%', maxWidth: 560,
              boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* ── Modal header ─────────────────────────────────────────────── */}
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bug size={20} style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 16, margin: 0, color: '#0f172a' }}>Report to AI</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Deterministic RCA Engine</p>
                </div>
              </div>
              {step !== 'submitting' && (
                <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 8, display: 'flex' }}>
                  <X size={20} />
                </button>
              )}
            </div>

            {/* ── Success state ─────────────────────────────────────────────── */}
            {step === 'success' && (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle2 size={32} style={{ color: '#16a34a' }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Report submitted!</h3>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 16px', lineHeight: 1.6 }}>
                  Your ticket has been sent to our AI triage system. The team will analyze it shortly.
                </p>
                {submittedId && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Ticket ID</span>
                    <code style={{ fontSize: 12, color: '#0f172a', fontFamily: 'monospace' }}>{submittedId}</code>
                  </div>
                )}
                <br />
                <button onClick={handleClose} className="pro-button px-8 py-2.5 text-sm">
                  Done
                </button>
              </div>
            )}

            {/* ── Capturing state ───────────────────────────────────────────── */}
            {step === 'capturing' && (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <Loader2 size={36} style={{ color: '#ef4444', animation: 'spin 1s linear infinite', margin: '0 auto 16px', display: 'block' }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 6px' }}>Capturing system state…</p>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Analyzing visual context</p>
              </div>
            )}

            {/* ── Main form ─────────────────────────────────────────────────── */}
            {step === 'open' && (
              <div style={{ padding: '20px 24px 24px', overflowY: 'auto' }}>

                {/* Error summary card */}
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                        {tool.toUpperCase()} Fault Detected
                      </p>
                      <p style={{ fontSize: 13, color: '#991b1b', margin: '0 0 6px', wordBreak: 'break-word' }}>{errorMessage}</p>
                      <code style={{ fontSize: 11, color: '#b91c1c', fontFamily: 'monospace' }}>req: {requestId}</code>
                    </div>
                  </div>
                </div>

                {/* Screenshot preview */}
                {screenshotUrl && (
                  <div style={{ marginBottom: 18 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Camera size={14} style={{ color: '#94a3b8' }} /> Visual Context Preview
                    </p>
                    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#f8fafc' }}>
                      <img src={screenshotUrl} alt="Screenshot" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', display: 'block' }} />
                      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                        Auto-captured State
                      </div>
                    </div>
                  </div>
                )}

                {!screenshotUrl && screenshotError && (
                  <div style={{ marginBottom: 18, padding: '12px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#9a3412', margin: '0 0 4px' }}>
                      Website preview unavailable
                    </p>
                    <p style={{ fontSize: 12, color: '#c2410c', margin: 0, lineHeight: 1.6 }}>
                      {screenshotError}
                    </p>
                  </div>
                )}

                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    Your email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid #e2e8f0', borderRadius: 10,
                      fontSize: 14, color: '#0f172a',
                      background: '#f8fafc', outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Additional info */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    Additional context <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What were you trying to do?"
                    value={extraInfo}
                    onChange={e => setExtraInfo(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid #e2e8f0', borderRadius: 10,
                      fontSize: 13, color: '#0f172a',
                      background: '#f8fafc', outline: 'none',
                      fontFamily: 'inherit', resize: 'vertical',
                      boxSizing: 'border-box', lineHeight: 1.6,
                    }}
                  />
                </div>

                {/* What will be sent (collapsible info) */}
                <details style={{ marginBottom: 20 }}>
                  <summary style={{ fontSize: 12, color: '#94a3b8', cursor: 'pointer', fontWeight: 500, listStyle: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ChevronDown size={13} /> Multi-agent Triage Payload
                  </summary>
                  <div style={{ marginTop: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#475569', lineHeight: 1.7 }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Sent automatically:</p>
                    <ul style={{ margin: '0 0 8px', paddingLeft: 16 }}>
                      <li>Tool type: <strong>{tool}</strong></li>
                      <li>Error message</li>
                      <li>Request ID: <code style={{ fontFamily: 'monospace' }}>{requestId}</code></li>
                      {fileName && <li>File name: {fileName}</li>}
                      {screenshotUrl && <li>Screenshot (PNG)</li>}
                    </ul>
                  </div>
                </details>

                {/* Error */}
                {submitError && (
                  <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#b91c1c' }}>
                    ⚠️ {submitError}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={submitReport}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '12px 20px', borderRadius: 12,
                      background: '#ef4444', color: '#fff',
                      border: 'none', cursor: 'pointer',
                      fontSize: 14, fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(239,68,68,0.25)',
                      transition: 'background 0.2s',
                    }}
                  >
                    <Send size={15} /> Submit Report
                  </button>
                  <button
                    onClick={() => captureScreenshot()}
                    title="Retake screenshot"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '12px 14px', borderRadius: 12,
                      background: '#f8fafc', color: '#475569',
                      border: '1.5px solid #e2e8f0', cursor: 'pointer',
                      fontSize: 14, transition: 'all 0.2s',
                    }}
                  >
                    <Camera size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* Submitting state */}
            {step === 'submitting' && (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <Loader2 size={36} style={{ color: '#ef4444', animation: 'spin 1s linear infinite', margin: '0 auto 16px', display: 'block' }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 6px' }}>Submitting report…</p>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Initializing multi-agent pipeline</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
