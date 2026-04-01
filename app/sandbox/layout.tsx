'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TriangleAlert } from 'lucide-react';

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="font-sans bg-slate-50 text-slate-900 min-h-screen flex flex-col"
      >
          <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
            {/* Top Warning Banner */}
            <div className="bg-amber-50 border-b border-amber-200 py-2 overflow-hidden flex w-full">
              <motion.div 
                animate={{ x: ["0%", "-50%"] }} 
                transition={{ ease: "linear", duration: 60, repeat: Infinity }}
                className="flex whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700 w-fit items-center"
              >
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center shrink-0">
                    <span className="shrink-0 px-2 flex items-center gap-1.5"><TriangleAlert size={12} /> ACTIVE SANDBOX ENVIRONMENT • VULNERABILITIES ARE INTENTIONAL • NO REAL DATA SHALL BE UPLOADED •</span>
                    <span className="shrink-0 px-2 flex items-center gap-1.5"><TriangleAlert size={12} /> ACTIVE SANDBOX ENVIRONMENT • VULNERABILITIES ARE INTENTIONAL • NO REAL DATA SHALL BE UPLOADED •</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-black flex items-center justify-center rounded">
                    <span className="text-white font-bold text-lg leading-none">M</span>
                  </div>
                  <span className="font-semibold text-xl tracking-tight text-slate-900 hidden sm:inline">Mamba <span className="font-light text-slate-500">RCA</span></span>
                </Link>
                <div className="hidden md:block w-px h-6 bg-slate-200"></div>
                <div className="hidden md:block">
                  <div className="font-semibold text-sm text-slate-900">Image Studio</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Test Sandbox</div>
                </div>
              </div>

              <nav className="flex items-center gap-3">
                <Link href="/" className="pro-button-secondary px-4 py-2 text-xs">
                  Exit Sandbox
                </Link>
                <Link href="/requests" className="pro-button px-4 py-2 text-xs">
                  Dashboard
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t border-slate-200 bg-white text-slate-500 py-10 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-mono text-xs">
              <p>© {new Date().getFullYear()} Mamba RCA • Isolated Environment</p>
              <p className="text-slate-400">Node: Sandbox-01</p>
            </div>
          </footer>
      </motion.div>
    </AnimatePresence>
  );
}