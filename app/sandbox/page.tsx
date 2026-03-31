'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ErrorReporter from '@/components/ErrorReporter';

export default function SandboxPage() {
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressFormat, setCompressFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [compressQuality, setCompressQuality] = useState<number>(80);
  const [resizeImage, setResizeImage] = useState<File | null>(null);
  const [resizeWidth, setResizeWidth] = useState<string>('');
  const [resizeHeight, setResizeHeight] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  const [activeTab, setActiveTab] = useState('compress');
  const [errorState, setErrorState] = useState<{
    message: string;
    requestId: string;
    tool: 'compress' | 'resize' | 'pdf';
    fileName?: string;
  } | null>(null);

  const downloadBlobResponse = async (res: Response, fallbackName: string) => {
    const blob = await res.blob();
    const disposition = res.headers.get('content-disposition') || '';
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const fileName = match?.[1] || fallbackName;

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  };

  const handleCompress = async () => {
    if (!compressFile) return;
    try {
      const formData = new FormData();
      formData.append('file', compressFile);
      formData.append('format', compressFormat);
      formData.append('quality', String(compressQuality));
      const res = await fetch('/api/compress', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        setErrorState({
          message: data.error || 'Compression Failed',
          requestId: data.requestId || 'req-' + Math.random().toString(36).slice(2, 9),
          tool: 'compress',
          fileName: compressFile.name
        });
      } else {
        await downloadBlobResponse(res, `compressed.${compressFormat}`);
      }
    } catch (err: any) {
      setErrorState({
        message: err.message || 'Network error',
        requestId: 'req-' + Math.random().toString(36).slice(2, 9),
        tool: 'compress',
        fileName: compressFile.name
      });
    }
  };

  const handleResize = async () => {
    try {
      if (!resizeImage || (!resizeWidth && !resizeHeight)) return;
      const formData = new FormData();
      formData.append('file', resizeImage);
      if (resizeWidth) formData.append('width', resizeWidth);
      if (resizeHeight) formData.append('height', resizeHeight);
      const res = await fetch('/api/resize', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        setErrorState({ message: data.error || 'Resize Failed', requestId: data.requestId || 'req-' + Math.random().toString(36).slice(2, 9), tool: 'resize' });
      } else {
        const resizeExtension = resizeImage.type.split('/')[1] || 'jpg';
        await downloadBlobResponse(res, `resized.${resizeExtension}`);
      }
    } catch (err: any) {
      setErrorState({ message: err.message || 'Network error', requestId: 'req-' + Math.random().toString(36).slice(2, 9), tool: 'resize' });
    }
  };

  const handlePdf = async () => {
    try {
      if (!pdfFile) return;
      const formData = new FormData();
      formData.append('file', pdfFile);
      const res = await fetch('/api/pdf', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        setErrorState({ message: data.error || 'PDF Failed', requestId: data.requestId || 'req-' + Math.random().toString(36).slice(2, 9), tool: 'pdf', fileName: pdfFile.name });
      } else {
        await downloadBlobResponse(res, 'converted.pdf');
      }
    } catch (err: any) {
      setErrorState({ message: err.message || 'Network error', requestId: 'req-' + Math.random().toString(36).slice(2, 9), tool: 'pdf', fileName: pdfFile?.name });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 mb-20 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 border-b border-[var(--border-strong)] pb-8"
      >
        <span className="bg-rose-50 text-rose-500 border border-rose-200 px-3 py-1 font-semibold text-xs rounded-full uppercase tracking-wider mb-4 inline-block">Active Zone</span>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-none mb-4">
          Diagnostic<br />
          <span className="text-[var(--accent)] font-medium">Console.</span>
        </h1>
        <p className="text-slate-500 max-w-2xl text-lg font-medium">
           Execute these tools to purposely trigger backend API errors. Mamba_RCA will intercept, trace the exact file and line number, and generate a fix.
        </p>
      </motion.div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-4" id="tools">
        {['compress', 'resize', 'pdf'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold uppercase tracking-wider text-sm rounded-lg transition-all border ${activeTab === tab ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-600 border-[var(--border-strong)] hover:bg-slate-50'}`}
          >
            {tab === 'compress' ? 'Compression Tool' : tab === 'resize' ? 'Image Dimension Match' : 'PDF Converter'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 flex flex-col gap-6"
        >
          {activeTab === 'compress' && (
            <div className="pro-card p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 font-display">Compression Agent</h2>
              <p className="text-slate-500 mb-6 text-sm">Target: <code className="bg-slate-100 px-1 rounded">/api/compress/route.ts</code></p>
              
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <input 
                  type="file" 
                  id="compress-upload"
                  className="hidden" 
                  onChange={(e) => setCompressFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="compress-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm mb-4">
                     <span className="material-symbols-outlined text-slate-400">upload_file</span>
                  </div>
                  <span className="font-semibold text-slate-700">{compressFile ? compressFile.name : 'Select Image File'}</span>
                  <span className="text-sm text-slate-500 mt-1">JPEG, PNG, WEBP</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Output Format</label>
                  <select
                    value={compressFormat}
                    onChange={(e) => setCompressFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                    className="w-full p-3 border border-[var(--border-strong)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--accent)] bg-white"
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WEBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Quality ({compressQuality})</label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={compressQuality}
                    onChange={(e) => setCompressQuality(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                 <button 
                   onClick={handleCompress}
                   className="pro-button px-6 py-3 bg-[var(--accent)] text-white shadow-sm hover:shadow-md"
                 >
                   Execute Compression
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'resize' && (
            <div className="pro-card p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 font-display">Image Dimension Match</h2>
              <p className="text-slate-500 mb-6 text-sm">Target: <code className="bg-slate-100 px-1 rounded">/api/resize/route.ts</code></p>
              <div className="flex flex-col gap-4">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <input
                    type="file"
                    id="resize-upload"
                    className="hidden"
                    onChange={(e) => setResizeImage(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="resize-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm mb-4">
                      <span className="material-symbols-outlined text-slate-400">upload_file</span>
                    </div>
                    <span className="font-semibold text-slate-700">{resizeImage ? resizeImage.name : 'Select Image File'}</span>
                    <span className="text-sm text-slate-500 mt-1">JPEG, PNG, WEBP</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    min={1}
                    placeholder="Width (optional)"
                    value={resizeWidth}
                    onChange={(e) => setResizeWidth(e.target.value)}
                    className="w-full p-4 border border-[var(--border-strong)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Height (optional)"
                    value={resizeHeight}
                    onChange={(e) => setResizeHeight(e.target.value)}
                    className="w-full p-4 border border-[var(--border-strong)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleResize}
                    className="pro-button px-6 py-3 bg-[var(--accent)] text-white shadow-sm hover:shadow-md"
                  >
                    Execute Resize Fit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pdf' && (
            <div className="pro-card p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 font-display">PDF Converter</h2>
              <p className="text-slate-500 mb-6 text-sm">Target: <code className="bg-slate-100 px-1 rounded">/api/pdf/route.ts</code></p>
              <div className="flex flex-col gap-4">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <input
                    type="file"
                    id="pdf-upload"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm mb-4">
                      <span className="material-symbols-outlined text-slate-400">upload_file</span>
                    </div>
                    <span className="font-semibold text-slate-700">{pdfFile ? pdfFile.name : 'Select Image File'}</span>
                    <span className="text-sm text-slate-500 mt-1">JPEG, PNG, WEBP -&gt; PDF</span>
                  </label>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handlePdf}
                    className="pro-button px-6 py-3 bg-[var(--accent)] text-white shadow-sm hover:shadow-md"
                  >
                    Generate Document
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="lg:col-span-1">
          {errorState && (
            <ErrorReporter 
              errorMessage={errorState.message}
              requestId={errorState.requestId}
              tool={errorState.tool}
              fileName={errorState.fileName}
              onDismiss={() => setErrorState(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}