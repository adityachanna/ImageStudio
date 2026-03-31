'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="font-mono bg-[var(--bg-base)] text-[var(--text-main)] min-h-screen flex flex-col"
      >
          <header className="sticky top-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border-strong)] shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              
              <div className="flex items-center gap-4">
                <Link href="/" className="font-display text-xl font-semibold tracking-tight text-slate-800 hover:opacity-80 transition-opacity">
                  Mamba<span className="text-[var(--accent)]">_RCA</span>
                </Link>
                <div className="w-px h-8 bg-[var(--border-strong)]"></div>
                <div>
                  <div className="font-display font-medium text-sm text-slate-900 leading-none mb-1">IMAGE_STUDIO</div>
                  <div className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">Bug-Infested Sandbox</div>
                </div>
              </div>

              <nav className="flex items-center gap-3">
                <Link href="/requests" className="px-4 py-2 border border-blue-200 bg-blue-50 text-xs font-medium text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                  Tickets / DB
                </Link>
                <Link href="/" className="px-4 py-2 border border-[var(--border-strong)] bg-white text-xs font-medium text-slate-700 rounded-md hover:bg-slate-50 transition-colors">
                  Return to Base
                </Link>
                <a href="#tools" className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors shadow-sm">
                  Access Tools
                </a>
              </nav>
            </div>
            
            <div className="border-t border-amber-200 bg-amber-50 py-1.5 overflow-hidden flex w-full">
              <motion.div 
                animate={{ x: ["0%", "-50%"] }} 
                transition={{ ease: "linear", duration: 60, repeat: Infinity }}
                className="flex whitespace-nowrap font-medium uppercase text-amber-700 text-xs w-fit"
              >
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex shrink-0">
                    <span className="shrink-0 px-2 tracking-widest">WARNING: ACTIVE SANDBOX ENVIRONMENT • VULNERABILITIES ARE INTENTIONAL • NO REAL DATA SHALL BE UPLOADED • </span>
                    <span className="shrink-0 px-2 tracking-widest">WARNING: ACTIVE SANDBOX ENVIRONMENT • VULNERABILITIES ARE INTENTIONAL • NO REAL DATA SHALL BE UPLOADED • </span>
                    <span className="shrink-0 px-2 tracking-widest">WARNING: ACTIVE SANDBOX ENVIRONMENT • VULNERABILITIES ARE INTENTIONAL • NO REAL DATA SHALL BE UPLOADED • </span>
                    <span className="shrink-0 px-2 tracking-widest">WARNING: ACTIVE SANDBOX ENVIRONMENT • VULNERABILITIES ARE INTENTIONAL • NO REAL DATA SHALL BE UPLOADED • </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t border-[var(--border-strong)] bg-white text-slate-500 py-10 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p>© {new Date().getFullYear()} Mamba RCA Sandbox Environment.</p>
              <p className="text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-medium text-xs">Environment: Isolated</p>
            </div>
          </footer>
      </motion.div>
    </AnimatePresence>
  );
}