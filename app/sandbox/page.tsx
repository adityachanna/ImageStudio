'use client';

import React, { useState, useRef } from 'react';
import { Settings, Scissors, FilePlus, UploadCloud, CheckCircle2, X, ArrowRight, Image as ImageIcon, Download, Zap, Lock, Star } from 'lucide-react';
import ErrorReporter from '@/components/ErrorReporter';

type ToolType = 'compress' | 'resize' | 'pdf';

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolType>('compress');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string; requestId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [format, setFormat] = useState('jpeg');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  };

  const processFile = (f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    setErrorInfo(null);
    try {
      let endpoint = '';
      if (activeTool === 'compress') {
        endpoint = '/api/compress';
        formData.append('quality', quality.toString());
        formData.append('format', format);
      } else if (activeTool === 'resize') {
        endpoint = '/api/resize';
        if (width) formData.append('width', width);
        if (height) formData.append('height', height);
      } else {
        endpoint = '/api/pdf';
      }
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const reqId = res.headers.get('X-Request-Id') ?? '';
      if (!res.ok) {
        let errMsg = 'Processing failed';
        try { const j = await res.json(); errMsg = j?.error ?? errMsg; } catch {}
        setErrorInfo({ message: errMsg, requestId: reqId });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imagestudio_${activeTool}_result.${activeTool === 'pdf' ? 'pdf' : activeTool === 'compress' ? format : file.name.split('.').pop() || 'jpg'}`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error';
      setErrorInfo({ message: msg, requestId: '' });
    }
    finally { setProcessing(false); }
  };

  return (
    <div style={{ width: '100%' }}>

      {/* Context Header */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 32px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)',
            fontSize: 11, fontWeight: 700, width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.1em'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', display: 'block' }} />
            Mamba RCA Testbed
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-1.5px', color: 'var(--text-primary)', margin: '16px 0 16px' }}>
            The Bug-Infested <span style={{ color: 'var(--color-primary)' }}>Sandbox</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 auto', maxWidth: 600 }}>
            This functional Image Studio contains intentional logic flaws designed specifically to test Mamba RCA ingestion and diagnostics.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TOOL SECTION
      ═══════════════════════════════════════════ */}
      <section id="tools" style={{ maxWidth: 1120, margin: '0 auto', padding: '0px 32px 80px' }}>
        <div style={{ 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border)', 
          borderRadius: 24, 
          boxShadow: 'var(--shadow-md)', 
          overflow: 'hidden', 
          display: 'flex', 
          flexWrap: 'wrap' 
        }}>

          {/* Sidebar */}
          <div style={{ width: 220, background: 'var(--bg-base)', borderRight: '1px solid var(--border)', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 8 }}>Vulnerable APIs</p>
            {([
              { id: 'compress', label: 'Compress', icon: <Settings size={18} />, color: '#16a34a', bg: '#dcfce7' },
              { id: 'resize',   label: 'Resize',   icon: <Scissors size={18} />, color: '#1d4ed8', bg: '#eff6ff' },
              { id: 'pdf',      label: 'To PDF',   icon: <FilePlus size={18} />, color: '#c2410c', bg: '#fff7ed' },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id as ToolType)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 12,
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                  textAlign: 'left', transition: 'all 0.18s',
                  background: activeTool === t.id ? t.bg : 'transparent',
                  color: activeTool === t.id ? t.color : 'var(--text-secondary)',
                }}
              >
                <span style={{ color: activeTool === t.id ? t.color : 'var(--text-muted)' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Main area */}
          <div style={{ flex: 1, padding: '36px 40px', display: 'flex', flexDirection: 'column', minHeight: 520, minWidth: 0 }}>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                {activeTool === 'compress' ? 'Trigger: Smart Compression Fail' : activeTool === 'resize' ? 'Trigger: Image Resizer Crash' : 'Trigger: Convert to PDF'}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                {activeTool === 'compress' ? 'Intentional case-sensitivity logic trap in the API.' : activeTool === 'resize' ? 'Pass undefined bounds to trigger a server 500.' : 'Wrap your image in a print-ready PDF.'}
              </p>
            </div>

            {/* Dropzone (no file) */}
            {!file ? (
              <div
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--border-strong)'}`,
                  borderRadius: 16, cursor: 'pointer',
                  background: isDragging ? 'var(--color-surface-container-low)' : 'var(--bg-base)',
                  transition: 'all 0.2s', padding: '48px 24px', gap: 16,
                }}
              >
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '1.5px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDragging ? 'var(--color-primary)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                  <UploadCloud size={34} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>Drop your evidence here</p>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 14px' }}>or click to browse from your device</p>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'var(--bg-subtle)', padding: '4px 12px', borderRadius: 99 }}>JPG · PNG · WEBP</span>
                </div>
              </div>
            ) : (
              /* ── File selected: Preview + Settings ── */
              <div style={{ flex: 1, display: 'flex', gap: 32, flexWrap: 'wrap' }}>

                {/* Image preview */}
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                  <button
                    onClick={clearFile}
                    style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyItems: 'center', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.15s' }}
                  >
                    <X size={16} />
                  </button>

                  {/* Checkerboard area */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, minHeight: 240, position: 'relative' }}>
                    <div className="dot-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'relative', zIndex: 1 }} />
                    )}
                  </div>

                  {/* File info bar */}
                  <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--color-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                      <ImageIcon size={20} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || 'image'}</p>
                    </div>
                  </div>
                </div>

                {/* Settings panel */}
                <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {activeTool === 'compress' && (
                      <>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Compression Level</label>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: 99 }}>{quality}%</span>
                          </div>
                          <input type="range" min="1" max="100" value={quality} onChange={e => setQuality(+e.target.value)} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontWeight: 500 }}>
                            <span>Smaller file</span><span>Better quality</span>
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 10 }}>Output Format</label>
                          <div style={{ position: 'relative' }}>
                            <select value={format} onChange={e => setFormat(e.target.value)}>
                              <option value="jpeg">JPEG — Best compatibility</option>
                              <option value="png">PNG — Lossless</option>
                              <option value="webp">WebP — Smallest size</option>
                            </select>
                            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: 12 }}>▾</span>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTool === 'resize' && (
                      <>
                        <div>
                          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 10 }}>Width <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(px)</span></label>
                          <input type="number" placeholder="e.g. 1920" value={width} onChange={e => setWidth(e.target.value)} />
                        </div>
                        <div>
                          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 10 }}>Height <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(px)</span></label>
                          <input type="number" placeholder="e.g. 1080" value={height} onChange={e => setHeight(e.target.value)} />
                        </div>
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 10, fontSize: 13, color: '#1d4ed8' }}>
                          <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: 1, color: '#3b82f6' }} />
                          Leave one field blank to trigger auto-bounds routing.
                        </div>
                      </>
                    )}

                    {activeTool === 'pdf' && (
                      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '18px', display: 'flex', gap: 12, fontSize: 14, color: '#9a3412' }}>
                        <FilePlus size={20} style={{ flexShrink: 0, color: '#f97316' }} />
                        <div>
                          <p style={{ fontWeight: 700, margin: '0 0 6px' }}>PDF Packaging</p>
                          <p style={{ margin: 0, lineHeight: 1.6, color: '#c2410c', fontSize: 13 }}>Your image will be embedded in a PDF.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="btn-primary"
                    style={{ padding: '15px 24px', fontSize: 15, width: '100%', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', border: 'none' }}
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ marginRight: 4 }}>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }} />
                        </svg>
                        Executing API...
                      </>
                    ) : (
                      <><Download size={18} /> Execute Target API</>
                    )}
                  </button>

                  {errorInfo && (
                    <ErrorReporter
                      errorMessage={errorInfo.message}
                      requestId={errorInfo.requestId}
                      tool={activeTool}
                      fileName={file?.name}
                      onDismiss={() => setErrorInfo(null)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
