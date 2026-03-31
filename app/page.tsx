'use client';

import React from 'react';
import Link from 'next/link';
import ArchitectureFlow from '../components/ArchitectureFlow';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="font-mono bg-[var(--bg-base)] text-black min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-[var(--bg-surface)] border-b border-[var(--border-strong)] shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-display font-semibold text-xl tracking-tight text-slate-800">Mamba<span className="text-[var(--accent)]">_RCA</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[var(--text-muted)]">
            <Link href="#architecture" className="hover:text-[var(--text-main)] transition-colors">Architecture</Link>
            <Link href="/sandbox" className="hover:text-[var(--text-main)] transition-colors">Sandbox</Link>
            <Link href="/requests" className="hover:text-[var(--text-main)] transition-colors">Tickets / DB</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/requests" className="pro-button px-5 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700">
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <div className="bg-slate-100 border-b border-[var(--border-strong)] py-2 overflow-hidden flex w-full">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ ease: "linear", duration: 80, repeat: Infinity }}
            className="flex whitespace-nowrap font-medium text-[var(--text-muted)] text-xs w-fit"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex shrink-0">
                <span className="shrink-0 px-2 tracking-widest text-[#3b82f6]">HIGH-PERFORMANCE PIPELINE • DETERMINISTIC AGENTIC CORE • MULTIMODAL INGESTION • ROOT CAUSE ANALYSIS • ZERO-DAY EXPLOIT RESOLUTION •</span>
                <span className="shrink-0 px-2 tracking-widest text-[#3b82f6]">HIGH-PERFORMANCE PIPELINE • DETERMINISTIC AGENTIC CORE • MULTIMODAL INGESTION • ROOT CAUSE ANALYSIS • ZERO-DAY EXPLOIT RESOLUTION •</span>
                <span className="shrink-0 px-2 tracking-widest text-[#3b82f6]">HIGH-PERFORMANCE PIPELINE • DETERMINISTIC AGENTIC CORE • MULTIMODAL INGESTION • ROOT CAUSE ANALYSIS • ZERO-DAY EXPLOIT RESOLUTION •</span>
                <span className="shrink-0 px-2 tracking-widest text-[#3b82f6]">HIGH-PERFORMANCE PIPELINE • DETERMINISTIC AGENTIC CORE • MULTIMODAL INGESTION • ROOT CAUSE ANALYSIS • ZERO-DAY EXPLOIT RESOLUTION •</span>
              </div>
            ))}
          </motion.div>
        </div>

        <section id="architecture" className="relative min-h-[80vh] flex flex-col items-center justify-center p-6 subtle-grid border-b border-[var(--border-strong)] bg-white">
          <div className="max-w-5xl mx-auto text-center z-10 w-full mb-12">
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900 leading-tight">
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="block">The Engine of</motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-[var(--accent)] block">Resolution.</motion.span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="max-w-2xl mx-auto text-lg text-[var(--text-muted)] mb-10">
              Automated Root Cause Analysis for modern resilient architectures. We pull the failure directly from the source code.
            </motion.p>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="flex flex-wrap justify-center gap-4">
              <Link href="/requests" className="pro-button text-base px-8 py-3 bg-blue-600 text-white shadow-md">
                Open Tickets / DB
              </Link>
            </motion.div>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }} className="w-full max-w-7xl h-[500px] border border-[var(--border-strong)] rounded-xl bg-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 left-0 bg-slate-50 text-[var(--text-muted)] px-4 py-2 text-xs font-semibold z-10 border-b border-r border-[var(--border-strong)] rounded-br-lg">System Architecture Node Graph</div>
             <ArchitectureFlow />
          </motion.div>
        </section>

        <section className="py-24 px-6 border-b border-[var(--border-strong)] bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-12 border-b border-[var(--border-strong)] pb-4">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-slate-800 tracking-tight">Data Execution Path</h2>
              <span className="text-sm font-medium text-[var(--text-muted)] px-3 py-1 bg-slate-200 rounded-full">Phase 1</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="pro-card p-8">
                <span className="text-4xl font-display font-bold block mb-4 text-[var(--accent)] opacity-80">01.</span>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Multimodal Ingestion</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">Flash parses raw visual evidence and technical logs to structure absolute constraints.</p>
              </div>
              <div className="pro-card p-8">
                <span className="text-4xl font-display font-bold block mb-4 text-[var(--accent)] opacity-80">02.</span>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Vector Deduplication</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">MongoDB clusters map the exact crash trace against previous events to halt runaway computation.</p>
              </div>
              <div className="pro-card p-8">
                <span className="text-4xl font-display font-bold block mb-4 text-[var(--accent)] opacity-80">03.</span>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-slate-900">Code Harness</h3>
                  <span className="text-[10px] font-medium text-[var(--accent)] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">OpenCode</span>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">The deterministic RCA engine operates directly inside the AST mapping fault boundaries to generate patch pull requests directly over MCP.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 bg-white subtle-grid">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-12 border-b border-[var(--border-strong)] pb-4">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-slate-800 tracking-tight">System Stack</h2>
              <span className="text-sm font-medium text-[var(--text-muted)] px-3 py-1 bg-slate-100 rounded-full">Phase 2</span>
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
                <div key={i} className="pro-card p-6 flex flex-col items-start hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors group">
                  <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center mb-4 border border-[var(--border-strong)] group-hover:bg-white transition-colors">
                    {/* Applying a slight opacity so it blends nicely, but keeps original distinct brand colors if loaded via CDN */}
                    <img src={tech.iconUrl} alt={tech.name} className="w-6 h-6 object-contain" />
                  </div>
                  <h4 className="font-medium text-slate-900 mb-1">{tech.name}</h4>
                  <p className="text-xs text-[var(--text-muted)]">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <span className="font-display text-2xl font-semibold tracking-tight text-white block mb-1">Mamba<span className="text-[var(--accent)]">_RCA</span></span>
            <span className="text-sm text-slate-500">Intelligence Orchestration Layer</span>
          </div>
          <div className="text-sm flex flex-col items-end gap-2">
            <span className="bg-slate-800 px-3 py-1 rounded-md mb-2">Terminal 0x1</span>
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Status: Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}