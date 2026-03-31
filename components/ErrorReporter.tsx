'use client';

import React, { useState, useRef } from 'react';
import { AlertTriangle, X, Bug, Send, Camera, Loader2, CheckCircle2, ChevronDown, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorReporterProps {
  /** The error message from the API */
  errorMessage: string;
  /** The request ID returned from the API (X-Request-Id header or JSON body) */
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
  const [submitError, setSubmitError] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // ── Capture screenshot ──────────────────────────────────────────────────────
  const captureScreenshot = async () => {
    setStep('capturing');
    try {
      // Dynamic import so html2canvas is never SSR'd
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: false,
        scale: window.devicePixelRatio || 1,
        logging: false,
      });
      canvas.toBlob(blob => {
        if (blob) {
          setScreenshot(blob);
          const url = URL.createObjectURL(blob);
          setScreenshotUrl(url);
        }
        setStep('open');
      }, 'image/png');
    } catch {
      // Screenshot failed — continue without it
      setStep('open');
    }
  };

  const openModal = async () => {
    setStep('capturing');
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

      try {
        sessionStorage.setItem(
          `request-dashboard:${resolvedRequestId}`,
          JSON.stringify({ ticket: data })
        );
      } catch {
        // Non-blocking cache write failure.
      }

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
    setEmail('');
    setExtraInfo('');
    setSubmitError('');
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Inline error banner ──────────────────────────────────────────────── */}
      <div style={{
        marginTop: 16,
        padding: '14px 18px',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
      }}>
        <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#b91c1c', margin: '0 0 4px' }}>
            Processing failed
          </p>
          <p style={{ fontSize: 13, color: '#991b1b', margin: '0 0 8px', lineHeight: 1.5, wordBreak: 'break-word' }}>
            {errorMessage}
          </p>
          {requestId && (
            <p style={{ fontSize: 11, color: '#ef4444', margin: '0 0 10px', fontFamily: 'monospace', background: '#fee2e2', padding: '2px 8px', borderRadius: 6, display: 'inline-block' }}>
              ID: {requestId}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={openModal}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 10,
                background: '#ef4444', color: '#fff',
                border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                boxShadow: '0 2px 8px rgba(239,68,68,0.25)',
                transition: 'background 0.2s',
              }}
            >
              <Bug size={15} /> Report to AI
            </button>
            <button
              onClick={onDismiss}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10,
                background: 'transparent', color: '#991b1b',
                border: '1px solid #fecaca', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                transition: 'background 0.2s',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal backdrop ───────────────────────────────────────────────────── */}
      {(step === 'open' || step === 'capturing' || step === 'submitting' || step === 'success') && (
        <div
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
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>This will create a JDI ticket in our AI triage system</p>
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
                <button onClick={handleClose} className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
                  Done
                </button>
              </div>
            )}

            {/* ── Capturing state ───────────────────────────────────────────── */}
            {step === 'capturing' && (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <Loader2 size={36} style={{ color: '#ef4444', animation: 'spin 1s linear infinite', margin: '0 auto 16px', display: 'block' }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 6px' }}>Capturing screenshot…</p>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>This takes less than a second</p>
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
                        {tool.toUpperCase()} Error · Image Studio
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
                      <Camera size={14} style={{ color: '#94a3b8' }} /> Screenshot captured
                    </p>
                    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                      <img src={screenshotUrl} alt="Screenshot" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                        Auto-captured
                      </div>
                    </div>
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
                    onFocus={e => (e.target.style.borderColor = '#ef4444')}
                    onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>

                {/* Additional info */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    Additional context <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What were you trying to do? What did you expect to happen?"
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
                    onFocus={e => (e.target.style.borderColor = '#ef4444')}
                    onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>

                {/* What will be sent (collapsible info) */}
                <details style={{ marginBottom: 20 }}>
                  <summary style={{ fontSize: 12, color: '#94a3b8', cursor: 'pointer', fontWeight: 500, listStyle: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ChevronDown size={13} /> What gets sent to AI triage
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
                    <p style={{ margin: 0, color: '#64748b' }}>
                      Route: <strong>JDI</strong> · Type: <strong>Image Studio</strong>
                    </p>
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
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Sending to JDI triage system</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
