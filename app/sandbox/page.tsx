'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertCircle, TriangleAlert } from 'lucide-react';
import ErrorReporter from '@/components/ErrorReporter';

export default function SandboxPage() {
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressPreview, setCompressPreview] = useState<string | null>(null);
  const [compressFormat, setCompressFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [compressQuality, setCompressQuality] = useState<number>(80);
  
  const [resizeImage, setResizeImage] = useState<File | null>(null);
  const [resizePreview, setResizePreview] = useState<string | null>(null);
  const [resizeWidth, setResizeWidth] = useState<string>('');
  const [resizeHeight, setResizeHeight] = useState<string>('');
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  
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

  const handleCompressFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCompressFile(file);
    if (file) {
      setCompressPreview(URL.createObjectURL(file));
    } else {
      setCompressPreview(null);
    }
  };

  const handleResizeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResizeImage(file);
    if (file) {
      setResizePreview(URL.createObjectURL(file));
    } else {
      setResizePreview(null);
    }
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfFile(file);
    if (file) {
      setPdfPreview(URL.createObjectURL(file));
    } else {
      setPdfPreview(null);
    }
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
    <div className="max-w-7xl mx-auto px-6 py-12 mb-20 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 pb-8 border-b border-slate-200"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-6 font-mono">
          <TriangleAlert size={14} />
          <span>Diagnostic Mode</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
          Image Studio <br />
          <span className="text-slate-500 font-light">Test Harness</span>
        </h1>
        <p className="text-slate-600 max-w-2xl text-lg">
           Execute these tools to test the environment. Intentional errors will trigger the Mamba RCA pipeline.
        </p>
      </motion.div>

      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 hide-scrollbar" id="tools">
        {[
          { id: 'compress', label: 'Image Compression' },
          { id: 'resize', label: 'Dimension Resize' },
          { id: 'pdf', label: 'PDF Generation' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 font-medium text-sm rounded transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-black text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 flex flex-col gap-6"
        >
          {activeTab === 'compress' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Compression Agent</h2>
                  <p className="text-slate-500 text-sm">Target Endpoint</p>
                </div>
                <div className="hidden sm:block px-3 py-1 bg-slate-50 rounded border border-slate-200 font-mono text-xs text-slate-600">
                  /api/compress/route.ts
                </div>
              </div>
              
              <div className="border-2 border-dashed border-slate-200 rounded p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors mb-8 group cursor-pointer relative min-h-[200px] flex flex-col items-center justify-center overflow-hidden">
                <input 
                  type="file" 
                  id="compress-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  onChange={handleCompressFileChange}
                />
                {compressPreview ? (
                  <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={compressPreview} alt="Preview" className="max-h-[250px] object-contain rounded shadow-sm" />
                ) : (
                  <div className="flex flex-col items-center pointer-events-none">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded flex items-center justify-center shadow-sm mb-4">
                       <UploadCloud className="text-slate-400" size={20} />
                    </div>
                    <span className="font-semibold text-slate-800 mb-1">Upload Image File</span>
                    <span className="text-sm text-slate-500">JPEG, PNG, WEBP</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Output Format</label>
                  <div className="relative">
                    <select
                      value={compressFormat}
                      onChange={(e) => setCompressFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                      className="w-full p-3 appearance-none border border-slate-200 rounded outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-700 font-medium text-sm"
                    >
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WEBP</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                      ▼
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700">Quality</label>
                    <span className="text-sm font-mono text-slate-500">{compressQuality}%</span>
                  </div>
                  <div className="pt-2">
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={compressQuality}
                      onChange={(e) => setCompressQuality(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-100">
                 <button 
                   onClick={handleCompress}
                   disabled={!compressFile}
                   className="pro-button px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Execute
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'resize' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Resize Matcher</h2>
                  <p className="text-slate-500 text-sm">Target Endpoint</p>
                </div>
                <div className="hidden sm:block px-3 py-1 bg-slate-50 rounded border border-slate-200 font-mono text-xs text-slate-600">
                  /api/resize/route.ts
                </div>
              </div>
              
              <div className="border-2 border-dashed border-slate-200 rounded p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors mb-8 group cursor-pointer relative min-h-[200px] flex flex-col items-center justify-center overflow-hidden">
                <input
                  type="file"
                  id="resize-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleResizeFileChange}
                />
                {resizePreview ? (
                  <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={resizePreview} alt="Preview" className="max-h-[250px] object-contain rounded shadow-sm" />
                ) : (
                  <div className="flex flex-col items-center pointer-events-none">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded flex items-center justify-center shadow-sm mb-4">
                      <UploadCloud className="text-slate-400" size={20} />
                    </div>
                    <span className="font-semibold text-slate-800 mb-1">Upload Image File</span>
                    <span className="text-sm text-slate-500">JPEG, PNG, WEBP</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Width</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 800"
                    value={resizeWidth}
                    onChange={(e) => setResizeWidth(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-black bg-white text-slate-900 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Height</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 600"
                    value={resizeHeight}
                    onChange={(e) => setResizeHeight(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-black bg-white text-slate-900 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                  onClick={handleResize}
                  disabled={!resizeImage || (!resizeWidth && !resizeHeight)}
                  className="pro-button px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Execute
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pdf' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">PDF Converter</h2>
                  <p className="text-slate-500 text-sm">Target Endpoint</p>
                </div>
                <div className="hidden sm:block px-3 py-1 bg-slate-50 rounded border border-slate-200 font-mono text-xs text-slate-600">
                  /api/pdf/route.ts
                </div>
              </div>
              
              <div className="border-2 border-dashed border-slate-200 rounded p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors mb-8 group cursor-pointer relative min-h-[200px] flex flex-col items-center justify-center overflow-hidden">
                <input
                  type="file"
                  id="pdf-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handlePdfFileChange}
                />
                {pdfPreview ? (
                  <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={pdfPreview} alt="Preview" className="max-h-[250px] object-contain rounded shadow-sm" />
                ) : (
                  <div className="flex flex-col items-center pointer-events-none">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded flex items-center justify-center shadow-sm mb-4">
                      <UploadCloud className="text-slate-400" size={20} />
                    </div>
                    <span className="font-semibold text-slate-800 mb-1">Upload Image File</span>
                    <span className="text-sm text-slate-500">Converts to PDF</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                  onClick={handlePdf}
                  disabled={!pdfFile}
                  className="pro-button px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Execute
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <div className="xl:col-span-1">
          {errorState ? (
            <ErrorReporter 
              errorMessage={errorState.message}
              requestId={errorState.requestId}
              tool={errorState.tool}
              fileName={errorState.fileName}
              onDismiss={() => setErrorState(null)}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-6 h-full flex flex-col items-center justify-center text-center text-slate-500 min-h-[300px]">
              <AlertCircle size={32} className="mb-4 text-slate-300" />
              <h3 className="font-semibold text-slate-700 mb-1">Diagnostic Log</h3>
              <p className="text-sm text-slate-500">RCA faults will be captured here upon execution failure.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}