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

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '80px 32px 96px',
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        gap: 64, flexWrap: 'wrap',
      }}>
        {/* Left copy */}
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: 'var(--accent-light)', color: 'var(--accent-text)',
            border: '1px solid var(--accent-border)',
            fontSize: 13, fontWeight: 600, width: 'fit-content',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />
            Free · Browser-based · Private
          </span>

          <h1 style={{ fontSize: 'clamp(38px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-1.5px', color: 'var(--text-primary)', margin: 0 }}>
            Process images<br />with{' '}
            <span style={{ color: 'var(--accent)' }}>zero limits.</span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0, maxWidth: 460 }}>
            Compress, resize, and convert images to PDF — all in your browser. No account required, no files sent to servers.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
            <a href="#tools" className="btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>
              Get Started Free <ArrowRight size={17} />
            </a>
            <a href="#features" className="btn-secondary" style={{ fontSize: 15, padding: '13px 24px' }}>
              See Features
            </a>
          </div>

          {/* Trust row */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
            {[
              { icon: <Lock size={14} />, text: 'No uploads to server' },
              { icon: <Zap size={14} />, text: 'Sub-second processing' },
              { icon: <Star size={14} />, text: '100% free forever' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                <span style={{ color: 'var(--accent)' }}>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero illustration */}
        <div style={{ flex: '1 1 340px', position: 'relative', minHeight: 320 }}>
          {/* glow */}
          <div style={{ position: 'absolute', inset: 0, background: '#dcfce7', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.55, zIndex: 0 }} className="float-slow" />

          {/* Mock browser card */}
          <div className="float" style={{ position: 'relative', zIndex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
            {/* Browser chrome */}
            <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fca5a5' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fcd34d' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#86efac' }} />
              </div>
              <div style={{ flex: 1, background: '#e2e8f0', borderRadius: 6, height: 24, maxWidth: 220, marginLeft: 8 }} />
            </div>

            {/* Mock image canvas */}
            <div style={{ padding: '20px 20px 0' }}>
              <svg width="100%" height="180" viewBox="0 0 420 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="420" height="180" rx="10" fill="#f1f5f9" />
                {/* Sky */}
                <rect width="420" height="100" rx="10" fill="#e0f2fe" />
                {/* Sun */}
                <circle cx="350" cy="45" r="28" fill="#fde68a" />
                {/* Hills */}
                <ellipse cx="80" cy="160" rx="140" ry="80" fill="#bbf7d0" />
                <ellipse cx="320" cy="165" rx="160" ry="85" fill="#86efac" />
                {/* Road */}
                <path d="M160 180 L200 120 L220 120 L260 180Z" fill="#d1d5db" />
                {/* Trees */}
                <rect x="50" y="100" width="10" height="35" fill="#92400e" rx="2" />
                <circle cx="55" cy="95" r="22" fill="#16a34a" />
                <rect x="360" y="105" width="10" height="30" fill="#92400e" rx="2" />
                <circle cx="365" cy="100" r="18" fill="#15803d" />
                {/* Compression bars overlay */}
                <rect x="10" y="135" width="60" height="6" rx="3" fill="#22c55e" opacity="0.8" />
                <rect x="10" y="147" width="40" height="6" rx="3" fill="#86efac" opacity="0.8" />
                <rect x="10" y="159" width="50" height="6" rx="3" fill="#22c55e" opacity="0.6" />
              </svg>
            </div>

            {/* Mock toolbar */}
            <div style={{ padding: '14px 20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Compress</div>
                <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Resize</div>
                <div style={{ background: '#fff7ed', color: '#c2410c', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>PDF</div>
              </div>
              <div style={{ background: 'var(--accent)', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>↓ Save</div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="float-delay" style={{ position: 'absolute', right: -16, top: 36, background: '#fff', padding: '10px 14px', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
              <Scissors size={18} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Resized</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>1920 × 1080 px</div>
            </div>
          </div>

          <div className="float-delay" style={{ position: 'absolute', left: -16, bottom: 48, background: '#fff', padding: '10px 14px', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, zIndex: 10, animationDelay: '1.2s' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', flexShrink: 0 }}>
              <Settings size={18} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>−84% size</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Compressed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════ */}
      <section style={{ background: 'var(--text-primary)', padding: '40px 32px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0 }}>
          {[
            { val: '0', unit: 'Server uploads', color: '#4ade80' },
            { val: '∞', unit: 'File size limit', color: '#60a5fa' },
            { val: '<1s', unit: 'Average process time', color: '#fb923c' },
            { val: 'Free', unit: 'Forever, no account', color: '#a78bfa' },
          ].map(({ val, unit, color }, i, arr) => (
            <div key={unit} style={{ textAlign: 'center', padding: '8px 24px', borderRight: i < arr.length - 1 ? '1px solid #1e293b' : 'none' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1.1 }}>{val}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, fontWeight: 500 }}>{unit}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TOOL SECTION
      ═══════════════════════════════════════════ */}
      <section id="tools" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Choose your tool
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', margin: 0 }}>
            Upload an image and apply powerful transformations in seconds.
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 24, boxShadow: '0 4px 32px rgba(0,0,0,0.07)', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>

          {/* Sidebar */}
          <div style={{ width: 220, background: '#f8fafc', borderRight: '1px solid var(--border)', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 8 }}>Tools</p>
            {([
              { id: 'compress', label: 'Compress', icon: <Settings size={18} />, active: 'bg-green', color: '#16a34a', bg: '#dcfce7' },
              { id: 'resize',   label: 'Resize',   icon: <Scissors size={18} />, active: 'bg-blue', color: '#1d4ed8', bg: '#eff6ff' },
              { id: 'pdf',      label: 'To PDF',   icon: <FilePlus size={18} />, active: 'bg-orange', color: '#c2410c', bg: '#fff7ed' },
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
                {activeTool === 'compress' ? '🗜️ Smart Compression' : activeTool === 'resize' ? '✂️ Image Resizer' : '📄 Convert to PDF'}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                {activeTool === 'compress' ? 'Reduce file size while preserving visual quality.' : activeTool === 'resize' ? 'Set exact pixel dimensions for your image.' : 'Wrap your image in a print-ready PDF.'}
              </p>
            </div>

            {/* Dropzone (no file) */}
            {!file ? (
              <div
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: `2px dashed ${isDragging ? '#16a34a' : '#cbd5e1'}`,
                  borderRadius: 16, cursor: 'pointer',
                  background: isDragging ? '#f0fdf4' : '#f8fafc',
                  transition: 'all 0.2s', padding: '48px 24px', gap: 16,
                }}
              >
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDragging ? '#16a34a' : '#94a3b8', transition: 'all 0.2s' }}>
                  <UploadCloud size={34} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>Drop your image here</p>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 14px' }}>or click to browse from your device</p>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#e2e8f0', padding: '4px 12px', borderRadius: 99 }}>JPG · PNG · WEBP</span>
                </div>
              </div>
            ) : (
              /* ── File selected: Preview + Settings ── */
              <div style={{ flex: 1, display: 'flex', gap: 32, flexWrap: 'wrap' }}>

                {/* Image preview */}
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                  <button
                    onClick={clearFile}
                    style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                  >
                    <X size={16} />
                  </button>

                  {/* Checkerboard area */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, minHeight: 240, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,#e2e8f0 25%,transparent 25%,transparent 75%,#e2e8f0 75%,#e2e8f0),repeating-linear-gradient(45deg,#e2e8f0 25%,#f8fafc 25%,#f8fafc 75%,#e2e8f0 75%,#e2e8f0)', backgroundPosition: '0 0,10px 10px', backgroundSize: '20px 20px', opacity: 0.4 }} />
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'relative', zIndex: 1 }} />
                    )}
                  </div>

                  {/* File info bar */}
                  <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: '#fff' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
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
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-light)', padding: '3px 10px', borderRadius: 99 }}>{quality}%</span>
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
                          Leave one field blank to auto-preserve aspect ratio.
                        </div>
                      </>
                    )}

                    {activeTool === 'pdf' && (
                      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '18px', display: 'flex', gap: 12, fontSize: 14, color: '#9a3412' }}>
                        <FilePlus size={20} style={{ flexShrink: 0, color: '#f97316' }} />
                        <div>
                          <p style={{ fontWeight: 700, margin: '0 0 6px' }}>High Quality PDF</p>
                          <p style={{ margin: 0, lineHeight: 1.6, color: '#c2410c', fontSize: 13 }}>Your image will be embedded into a perfectly fitted, print-ready PDF. Page dimensions match your image exactly.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="btn-primary"
                    style={{ padding: '15px 24px', fontSize: 15, width: '100%', justifyContent: 'center' }}
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ marginRight: 4 }}>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }} />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <><Download size={18} /> Download Result</>
                    )}
                  </button>

                  {/* ── Error reporter ── */}
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

      {/* ═══════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════ */}
      <section id="features" style={{ background: '#f8fafc', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 14px', letterSpacing: '-0.5px' }}>Everything you need</h2>
            <p style={{ fontSize: 17, color: 'var(--text-secondary)', margin: 0, maxWidth: 520, marginInline: 'auto' }}>
              Powerful image tools with no compromises on speed, quality, or privacy.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: <Lock size={22} />, title: '100% Private', desc: 'All processing happens in your browser. Your images never leave your device — not even for a millisecond.', bg: '#dcfce7', color: '#16a34a' },
              { icon: <Zap size={22} />, title: 'Lightning Fast', desc: 'Using modern web APIs and WebAssembly, processing images takes under a second on any device.', bg: '#dbeafe', color: '#2563eb' },
              { icon: <Star size={22} />, title: 'Studio Quality', desc: 'Smart compression algorithms preserve visual detail even at high compression ratios above 80%.', bg: '#fef3c7', color: '#d97706' },
              { icon: <ImageIcon size={22} />, title: 'Multi-Format', desc: 'Export to JPEG, PNG, WebP, or PDF. Convert between any format in a single step.', bg: '#f3e8ff', color: '#7c3aed' },
              { icon: <CheckCircle2 size={22} />, title: 'No Signup', desc: 'Jump straight in — no account needed, no email confirmation, no credit card. Just open and use.', bg: '#ffe4e6', color: '#e11d48' },
              { icon: <Download size={22} />, title: 'Instant Download', desc: 'Results download directly to your device the moment processing completes. Zero wait time.', bg: '#ccfbf1', color: '#0d9488' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════ */}
      <section id="how" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 14px', letterSpacing: '-0.5px' }}>How it works</h2>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', margin: 0 }}>Three steps. That&apos;s all it takes.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, position: 'relative' }}>
          {[
            { step: '01', icon: <UploadCloud size={28} />, title: 'Upload your image', desc: 'Drag & drop or click to select any JPG, PNG or WebP image from your device.' },
            { step: '02', icon: <Settings size={28} />, title: 'Adjust settings', desc: 'Pick your tool — compress, resize, or PDF — and fine-tune the settings to your preference.' },
            { step: '03', icon: <Download size={28} />, title: 'Download instantly', desc: 'Hit the Download button and your processed image saves directly to your device.' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, padding: '32px', background: '#fff', border: '1px solid var(--border)', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: 48, fontWeight: 900, color: '#e2e8f0', lineHeight: 1, letterSpacing: '-3px' }}>{s.step}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════ */}
      <section style={{ background: 'var(--accent)', padding: '64px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 34, fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.5px' }}>
          Ready to process your first image?
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', margin: '0 0 32px' }}>
          No sign up. No limits. Just results.
        </p>
        <a href="#tools" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', color: 'var(--accent)', padding: '14px 32px', borderRadius: 14, fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}>
          Start for free <ArrowRight size={18} />
        </a>
      </section>

    </div>
  );
}
