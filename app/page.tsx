'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ArchitectureFlow from '../components/ArchitectureFlow';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Box, Activity, ShieldCheck, Code, Database } from 'lucide-react';

export default function LandingPage() {
  const fullText = "Automated Root Cause\nAnalysis Pipeline.";
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let currentText = '';
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < fullText.length) {
        currentText += fullText[index];
        setTypedText(currentText);
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 50); // Speed of typing

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="font-sans bg-white text-slate-900 min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-black flex items-center justify-center rounded">
              <span className="text-white font-bold text-lg leading-none">M</span>
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900">Mamba <span className="font-light text-slate-500">RCA</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
            <Link href="#architecture" className="hover:text-black transition-colors">Architecture</Link>
            <Link href="#sandbox" className="hover:text-black transition-colors">Image Studio Sandbox</Link>
            <Link href="/requests" className="hover:text-black transition-colors">Dashboard</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/requests" className="pro-button px-5 py-2.5 text-sm bg-black text-white hover:bg-slate-800">
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 overflow-hidden border-b border-slate-100 bg-slate-50/30 min-h-[85vh]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-white -z-10"></div>
          
          <div className="max-w-5xl mx-auto text-center z-10 w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold mb-8 shadow-sm">
              <Activity size={14} className="text-slate-900" />
              <span>Deterministic Intelligence Layer</span>
            </motion.div>
            
            <div className="h-[140px] md:h-[180px] flex flex-col items-center justify-center mb-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] whitespace-pre-wrap">
                {typedText.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <br />}
                    {i === 1 ? <span className="text-slate-400">{line}</span> : line}
                  </React.Fragment>
                ))}
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="inline-block w-[3px] h-[0.9em] bg-slate-900 align-middle ml-1 -mt-2"
                />
              </h1>
            </div>
            
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.8 }} className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10">
              Transform raw bug reports and screenshots into actionable engineering insights using multi-agent orchestration. The system performs deep code reading, analyzes test cases, and automatically generates detailed GitHub reports and patch PRs.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 2.0 }} className="flex flex-wrap justify-center gap-4">
              <Link href="/requests" className="pro-button px-8 py-3.5 text-base flex items-center gap-2 shadow-lg shadow-black/5 hover:shadow-black/10">
                Launch Dashboard <ArrowRight size={18} />
              </Link>
              <Link href="/sandbox" className="pro-button-secondary px-8 py-3.5 text-base flex items-center gap-2 bg-white">
                <Box size={18} className="text-slate-400" /> Try the Sandbox
              </Link>
            </motion.div>
          </div>
        </section>

        {/* The Sandbox Explanation */}
        <section id="sandbox" className="py-24 px-6 bg-white relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">
                  Image Studio: <br />The Active Test Environment
                </h2>
                <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                  To demonstrate Mamba RCA's capabilities, we have deployed <strong className="text-slate-900 font-semibold">Image Studio</strong> — a functioning image processing application serving as our live sandbox.
                </p>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                  It contains intentional vulnerabilities and zero-day faults (like a typo in the compression route). When a failure occurs in the sandbox, Mamba RCA intercepts the error, traces the exact line number via its OpenCode agent, and generates a patch PR.
                </p>
                
                <Link href="/sandbox" className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Enter the Sandbox Environment <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="relative">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-2">
                      <Terminal size={20} className="text-slate-400" />
                      <span className="font-mono text-sm font-semibold text-slate-700">sandbox_status</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                    </span>
                  </div>
                  <div className="font-mono text-sm text-slate-600 space-y-3">
                    <p><span className="text-blue-500">{">"}</span> Initializing Image Studio container...</p>
                    <p><span className="text-blue-500">{">"}</span> Loading compression route handlers...</p>
                    <p className="text-amber-600"><span className="text-amber-500">{">"}</span> WARNING: Intentional fault injected at line 42</p>
                    <p><span className="text-blue-500">{">"}</span> Mamba RCA agent listening on port 8080</p>
                    <p className="animate-pulse">_</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Technology Stack */}
        <section className="py-24 px-6 border-t border-slate-200 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Core Technology Stack</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Mamba RCA leverages best-in-class primitives to deliver a coherent and scalable experience.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Next.js", desc: "Core Framework", iconUrl: "https://cdn.simpleicons.org/nextdotjs/000000" },
                { name: "FastAPI", desc: "Python Core", iconUrl: "https://cdn.simpleicons.org/fastapi/009688" },
                { name: "MongoDB", desc: "Vector Search", iconUrl: "https://cdn.simpleicons.org/mongodb/47A248" },
                { name: "Cloudflare", desc: "R2 Storage", iconUrl: "https://cdn.simpleicons.org/cloudflare/F38020" },
                { name: "MCP", desc: "Model Context", iconUrl: "https://cdn.simpleicons.org/anthropic/000000" },
                { name: "LangGraph", desc: "Agentic Flow", iconUrl: "https://cdn.simpleicons.org/langchain/1C3C3C" },
                { name: "OpenCode", desc: "RCA Agent Tree", iconUrl: "https://cdn.simpleicons.org/github/181717" },
                { name: "React", desc: "UI Core", iconUrl: "https://cdn.simpleicons.org/react/61DAFB" }
              ].map((tech, i) => (
                <div key={i} className="pro-card p-6 flex flex-col items-start hover:border-slate-400 hover:bg-white transition-all duration-300 group cursor-default">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-4 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform duration-300">
                    <img src={tech.iconUrl} alt={tech.name} className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">{tech.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="py-24 px-6 border-t border-slate-200 bg-white subtle-grid">
          <div className="flex justify-center mb-16">
            <div className="max-w-4xl text-center bg-white/80 p-6 rounded-2xl backdrop-blur-sm border border-slate-100 shadow-sm">
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Pipeline Architecture</h2>
               <p className="text-slate-600 text-lg mx-auto">A FastAPI-powered pipeline using Gemini for multimodal structuring and embeddings, and MongoDB vector search for RAG-driven OpenCode RCA.</p>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto h-[600px] border border-slate-200 rounded-xl bg-white shadow-md relative overflow-hidden">
             <div className="absolute top-0 left-0 bg-white text-slate-500 px-4 py-2 text-xs font-semibold z-10 border-b border-r border-slate-200 rounded-br-lg font-mono">System Node Graph</div>
             {/* Render the React Flow Architecture graph */}
             <ArchitectureFlow />
          </div>
        </section>

        {/* Dashboard Explanation */}
        <section className="py-24 px-6 border-t border-slate-200 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-6 font-mono">
                  <Database size={14} /> Observability
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">Trace the Orchestrator</h2>
                <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                  The dashboard is the window into the orchestrator. It monitors the execution paths, triage logic, and artifact generation for every ticket or fault processed.
                </p>
                <Link href="/requests" className="pro-button px-6 py-3 text-sm flex items-center w-fit gap-2 bg-blue-600 hover:bg-blue-700 text-white border-transparent">
                  View Live Dashboard <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="pro-card p-8 bg-white border-slate-200 hover:border-slate-300">
                  <Activity size={24} className="text-blue-500 mb-5" />
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">Real-time Tracing</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">Track execution steps from Gemini multimodal ingestion and embedding generation to RAG routing and OpenCode execution.</p>
                </div>
                <div className="pro-card p-8 bg-white border-slate-200 hover:border-slate-300">
                  <ShieldCheck size={24} className="text-emerald-500 mb-5" />
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">Vector Deduplication</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">See exactly when the system halts runaway computation by matching against previous fault events in MongoDB.</p>
                </div>
                <div className="pro-card p-8 bg-white border-slate-200 hover:border-slate-300">
                  <Code size={24} className="text-slate-800 mb-5" />
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">OpenCode Harness</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">Review the RCA Engine's reasoning as it maps fault boundaries across the codebase and formulates Pull Requests.</p>
                </div>
                <div className="pro-card p-8 bg-white border-slate-200 hover:border-slate-300">
                  <Box size={24} className="text-indigo-500 mb-5" />
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">Artifact Storage</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">Directly access structural logs and visual evidence stored efficiently in Cloudflare R2 object storage.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs leading-none">M</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-sm">Mamba RCA</span>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} Mamba Intelligence Orchestration Layer.
          </div>
          <div className="flex gap-4 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}