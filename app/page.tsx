'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ArchitectureFlow from '../components/ArchitectureFlow';

const MOCK_CONSOLE_LOGS = [
  { text: "[SYSTEM] Booting Mamba RCA Agentic Core...", color: "text-slate-400" },
  { text: "[SYSTEM] Establishing connection to incident data lake...", color: "text-slate-400" },
  { text: "✓ Connected. Waiting for incoming telemetry.", color: "text-green-400" },
];

const RCA_PROCESS_ROUTINE = [
  { text: "➜ RECEIVED: Image Studio Alert #405 - Resizer Crash", color: "text-blue-400" },
  { text: "[GEMINI_AGENT] Analyzing visual artifact: 'Spinner stalled on 4MB image'.", color: "text-slate-400" },
  { text: "[ROUTER] Extracting vector chunks. Checking embedding space...", color: "text-slate-400" },
  { text: "✓ No exact duplicates found. Triggering Zero-Day RCA protocols.", color: "text-green-400" },
  { text: "[OPENCODE] Checking out target branch... Scanning app/api/resize/route.ts", color: "text-yellow-400" },
  { text: "[OPENCODE] Trace match. Found unhandled bounds object: sharp(undefined)", color: "text-error" },
  { text: "➜ GENERATING PROPOSAL: Inject type assertion and bounds check before sharp() execution.", color: "text-primary-fixed-dim" },
  { text: "[SYSTEM] Automated PR created. Ready for engineering review.", color: "text-green-400" },
];

export default function LandingPage() {
  const [logs, setLogs] = useState(MOCK_CONSOLE_LOGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);



  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isProcessing) return;

    setLogs(prev => [...prev, { text: `> ${inputVal}`, color: "text-white" }]);
    setInputVal('');
    setIsProcessing(true);

    let step = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (step < RCA_PROCESS_ROUTINE.length) {
        setLogs(prev => [...(prev || []), RCA_PROCESS_ROUTINE[step]]);
        step++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsProcessing(false);
        setLogs(prev => [...(prev || []), { text: "✓ RCA Complete. Awaiting next input.", color: "text-green-400" }]);
      }
    }, 600);
  };

  return (
    <div className="bg-background font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
      {/* Top Navigation Shell */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-3xl border-b border-slate-100/50 shadow-sm">
        <div className="flex justify-between items-center max-w-[1440px] mx-auto px-12 h-32">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Mamba RCA" className="h-28 w-auto px-4 object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-8 font-headline font-medium text-sm tracking-tight text-slate-600">
            <Link href="#" className="font-semibold text-primary border-b-2 border-primary pb-1">Solutions</Link>
            <Link href="/sandbox" className="hover:text-primary transition-colors">Demo Sandbox</Link>
            <Link href="#" className="hover:text-primary transition-colors">Docs</Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-600 hover:text-primary transition-all duration-300 font-headline font-medium text-sm">Login</button>
            <Link href="/sandbox" className="inline-flex items-center justify-center bg-primary text-white px-5 py-2.5 rounded-lg font-headline font-semibold text-sm shadow-md hover:bg-black transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section: Architectural Blueprint */}
        <section className="relative min-h-[921px] flex items-center overflow-hidden py-20 px-6">
          <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40"></div>
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
            
            {/* Left: Headline Editorial */}
            <div className="lg:col-span-12 lg:mb-20 text-center max-w-4xl mx-auto">
              <h1 className="font-headline text-6xl lg:text-8xl font-black text-[#0f172a] leading-[0.95] tracking-tight mb-10">
                The <span className="text-primary italic">Orchestrated</span> Intelligence Layer.
              </h1>
              <p className="font-body text-xl lg:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                Mamba RCA synthesizes deterministic autonomous agents into a high-performance pipeline. We instantly root-cause issues by pulling code directly from your repo.
              </p>
              <div className="flex flex-wrap justify-center gap-6 items-center">
                <Link href="/sandbox" className="inline-flex items-center justify-center bg-primary text-white px-10 py-5 rounded-2xl font-headline font-bold text-lg shadow-[0_20px_50px_rgba(0,88,190,0.3)] hover:scale-105 transition-all">
                  Get Started →
                </Link>
                <button className="inline-flex items-center justify-center gap-2 bg-slate-50 text-slate-600 px-10 py-5 rounded-2xl font-headline font-bold text-lg hover:bg-slate-100 transition-all border border-slate-200">
                  View Demo
                </button>
              </div>
            </div>

            {/* Full Width Architecture Diagram */}
            <div className="lg:col-span-12 relative flex items-center justify-center min-h-[600px] mt-10">
              <div className="w-full h-[700px] z-20">
                <ArchitectureFlow />
              </div>
            </div>

          </div>
        </section>

        {/* Global Interactive Console */}
        <section className="py-24 px-6 bg-white relative border-t border-slate-200" id="console">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">Live Pipeline Console</h2>
              <p className="font-body text-slate-600 text-lg mb-8 leading-relaxed">
                Connect directly to the Mamba RCA daemon. 
                Type an issue and watch the workflow resolve the ticket in real-time through our orchestrated toolchain.
              </p>
              <ul className="space-y-4 font-body text-slate-700">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <span><strong>Zero-Day Tracking:</strong> Automated source-code analysis limits manual triage.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <span><strong>Deduplication:</strong> Prevents massive runaway compute by linking existing tickets.</span>
                </li>
              </ul>
            </div>
            
            <div className="h-[550px] w-full bg-[#0f172a] shadow-2xl rounded-2xl overflow-hidden border border-slate-800 flex flex-col">
              {/* Console Header */}
              <div className="bg-[#1e293b] px-4 py-3 flex items-center justify-between border-b border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="ml-2 text-[11px] font-mono text-slate-400 font-semibold tracking-wider">mamba-engine / interactive-shell</span>
                </div>
                <div className="flex items-center gap-2 text-primary-fixed-dim text-xs font-bold bg-primary/10 px-3 py-1 rounded-md">
                  <span>LIVE</span>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                </div>
              </div>

              {/* Console Output Room */}
              <div className="flex-1 p-6 font-mono text-[13px] leading-relaxed overflow-y-auto w-full custom-scrollbar space-y-2">
                {logs.filter(Boolean).map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={i} 
                    className={`${log?.color || ''}`}
                  >
                    {log?.text}
                  </motion.div>
                ))}
                {isProcessing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500 animate-pulse">
                    Analyzing stream...
                  </motion.div>
                )}
              </div>

              {/* Console Input Bar */}
              <div className="bg-[#0f172a] border-t border-slate-700/50 p-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-[#1e293b] rounded-lg p-2 border border-slate-600/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                  <span className="text-green-400 font-mono ml-2 font-bold">~</span>
                  <input 
                    type="text" 
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Type an issue (e.g. 'Compression route throws 500')"
                    className="flex-1 bg-transparent border-none outline-none text-slate-200 font-mono text-[13px] placeholder-slate-600 disabled:opacity-50"
                  />
                  <button 
                    type="submit" 
                    disabled={isProcessing || !inputVal.trim()}
                    className="bg-primary hover:bg-primary-container text-on-primary px-4 py-1.5 rounded-md font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Execute
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Project Workflow Info */}
        <section className="py-24 px-6 bg-slate-50 relative border-t border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">The "Person-in-the-Loop" Flow</h2>
              <p className="font-body text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                Watch how a ticket moves through the dual-layered diagnostic pipeline, from the moment a bug is submitted to the exact code changes proposed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Phase A */}
              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold mb-6">A</div>
                <h3 className="font-headline text-xl font-bold mb-3">Submission & Ingestion</h3>
                <p className="font-body text-slate-600 mb-4 text-sm leading-relaxed">A user details a crash (e.g., "Resizer fails on 4MB images") and attaches a visual artifact. The backend pushes these directly to S3 and establishes a Pending ticket.</p>
              </div>

              {/* Phase B */}
              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 hover:border-indigo-500/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold mb-6">B</div>
                <h3 className="font-headline text-xl font-bold mb-3">Multimodal Structuring</h3>
                <p className="font-body text-slate-600 mb-4 text-sm leading-relaxed">Gemini Flash reads the screenshot and description. It generates a "Normalized Incident Record", safely extracting exact errors, active features, and severity metrics.</p>
              </div>

              {/* Phase C */}
              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 hover:border-blue-500/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold mb-6">C</div>
                <h3 className="font-headline text-xl font-bold mb-3">RAG & Deduplication</h3>
                <p className="font-body text-slate-600 mb-4 text-sm leading-relaxed">A mathematical embedding traces the MongoDB cluster over the last 60 days. If the signature matches precisely, it links the duplicate and halts to prevent runaway compute.</p>
              </div>

              {/* Phase D */}
              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 hover:border-green-600/50 transition-colors lg:col-span-2">
                <div className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center font-bold mb-6">D</div>
                <h3 className="font-headline text-xl font-bold mb-3">OpenCode Root Cause Analysis</h3>
                <p className="font-body text-slate-600 mb-4 text-sm leading-relaxed">
                  The backend spins up the target GitHub repo and copies artifacts to input directories. OpenCode steps directly inside the codebase, aggressively grepping for the logic path of the crash. <br/><br/>
                  <b>It reports the Exact Cause, generates an Implementation Plan, and reviews potential Side-Effects.</b>
                </p>
              </div>

              {/* Phase E */}
              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 hover:border-slate-700/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold mb-6">E</div>
                <h3 className="font-headline text-xl font-bold mb-3">DB Finalization</h3>
                <p className="font-body text-slate-600 mb-4 text-sm leading-relaxed">The frontend updates live state immediately. Developers review the full AI execution transcript directly alongside the finalized markdown engineering report.</p>
              </div>
            </div>

            {/* Tech Stack Banner */}
            <div className="mt-16 bg-[#0a192f] rounded-3xl p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/10 -rotate-6 scale-150 origin-left blur-3xl"></div>
              <div className="relative z-10 md:w-2/3 mb-8 md:mb-0">
                <h3 className="font-headline text-3xl font-extrabold text-white mb-4">Core Technology Stack</h3>
                <div className="flex flex-wrap gap-2 text-sm font-label font-bold text-slate-300">
                  <span className="bg-white/10 px-3 py-1.5 rounded text-white">Next.js</span>
                  <span className="bg-white/10 px-3 py-1.5 rounded text-white">FastAPI (Python)</span>
                  <span className="bg-white/10 px-3 py-1.5 rounded text-white">MongoDB Vector Search</span>
                  <span className="bg-white/10 px-3 py-1.5 rounded text-white">Cloudflare R2 / S3</span>
                  <span className="bg-white/10 px-3 py-1.5 rounded text-white">Gemini 2.0 Flash</span>
                  <span className="bg-white/10 px-3 py-1.5 rounded text-white">OpenRouter (Nemotron)</span>
                </div>
              </div>
              <div className="relative z-10 shrink-0">
                <Link href="/sandbox" className="btn-primary" style={{ margin: 0 }}>Start Live Sandbox Demo</Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
