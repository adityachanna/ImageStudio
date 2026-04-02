'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ArchitectureFlow from '../components/ArchitectureFlow';
import {
  Activity,
  ArrowRight,
  Box,
  Code,
  Database,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

const techStack = [
  { name: 'Next.js', desc: 'Core Framework', iconUrl: 'https://cdn.simpleicons.org/nextdotjs/000000' },
  { name: 'FastAPI', desc: 'Python Core', iconUrl: 'https://cdn.simpleicons.org/fastapi/009688' },
  { name: 'MongoDB', desc: 'Vector Search', iconUrl: 'https://cdn.simpleicons.org/mongodb/47A248' },
  { name: 'Cloudflare', desc: 'R2 Storage', iconUrl: 'https://cdn.simpleicons.org/cloudflare/F38020' },
  { name: 'MCP', desc: 'Model Context', iconUrl: 'https://cdn.simpleicons.org/anthropic/000000' },
  { name: 'LangGraph', desc: 'Agentic Flow', iconUrl: 'https://cdn.simpleicons.org/langchain/1C3C3C' },
  { name: 'OpenCode', desc: 'RCA Agent', iconUrl: 'https://cdn.simpleicons.org/github/181717' },
  { name: 'React', desc: 'UI Core', iconUrl: 'https://cdn.simpleicons.org/react/61DAFB' },
];

const dashboardHighlights = [
  {
    title: 'Real-time tracing',
    body: 'Follow execution from multimodal ingestion through routing, RCA, and issue creation.',
    icon: Activity,
    tone: 'text-blue-600',
  },
  {
    title: 'Dedup decisions',
    body: 'See exactly when the system reuses context instead of spending another full RCA cycle.',
    icon: ShieldCheck,
    tone: 'text-emerald-600',
  },
  {
    title: 'Code-level RCA',
    body: 'Review the OpenCode path that reads the repo, isolates failure points, and drafts fixes.',
    icon: Code,
    tone: 'text-slate-800',
  },
  {
    title: 'Artifact visibility',
    body: 'Track logs, inputs, outputs, and GitHub actions without exposing private storage directly.',
    icon: Database,
    tone: 'text-indigo-600',
  },
];

const reveal = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function LandingPage() {
  const fullText = 'Automated Root Cause\nAnalysis Pipeline.';
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let currentText = '';
    let index = 0;

    const intervalId = window.setInterval(() => {
      if (index < fullText.length) {
        currentText += fullText[index];
        setTypedText(currentText);
        index += 1;
        return;
      }

      window.clearInterval(intervalId);
    }, 45);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_22%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_45%,_#eef2f7_100%)] text-slate-900">
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/88 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-black">
              <span className="text-lg font-bold leading-none text-white">M</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">
              Mamba <span className="font-light text-slate-500">RCA</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="#sandbox" className="transition-colors hover:text-black">Sandbox</Link>
            <Link href="#architecture" className="transition-colors hover:text-black">Architecture</Link>
            <Link href="/requests" className="transition-colors hover:text-black">Dashboard</Link>
          </div>

          <Link href="/requests" className="pro-button px-5 py-2.5 text-sm">
            Open Dashboard
          </Link>
        </div>
      </nav>

      <main className="pt-16">
        <section className="relative min-h-[90vh] overflow-hidden border-b border-slate-100 px-6 pb-24 pt-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(15,23,42,0.10),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.14),transparent_20%),linear-gradient(180deg,#f8fafc_0%,#ffffff_58%,#f1f5f9_100%)]"
          />
          <motion.div
            animate={{ y: [-8, 12, -8] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-[-8%] top-28 h-72 w-72 rounded-full bg-slate-200/60 blur-3xl"
          />
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-[-6%] top-40 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl"
          />

          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm"
              >
                <Activity size={14} className="text-slate-900" />
                Deterministic intelligence layer
              </motion.div>

              <h1 className="text-5xl font-bold leading-[1.02] tracking-tight text-slate-900 md:text-7xl">
                {typedText.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <br />}
                    {index === 1 ? <span className="font-light text-slate-500">{line}</span> : line}
                  </React.Fragment>
                ))}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="ml-1 inline-block h-[0.9em] w-[3px] align-middle bg-slate-900"
                />
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, delay: 1.6 }}
                className="mt-8 max-w-xl text-lg leading-8 text-slate-600 md:text-xl"
              >
                Turn screenshots and bug reports into routed RCA, code-level analysis, and GitHub actions without losing the execution trail.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 1.8 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.18 }}>
                  <Link href="/requests" className="pro-button flex items-center gap-2 px-8 py-3.5 text-base shadow-lg shadow-black/5">
                    Launch Dashboard <ArrowRight size={18} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.18 }}>
                  <Link href="/sandbox" className="pro-button-secondary flex items-center gap-2 bg-white px-8 py-3.5 text-base shadow-sm">
                    <Box size={18} className="text-slate-400" />
                    Try the Sandbox
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
                <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <Terminal size={18} className="text-slate-400" />
                    <span className="font-mono text-sm font-semibold text-slate-700">orchestrator.live</span>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Systems operational
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Current Flow</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">RAG to OpenCode</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Requests move from structuring into dedup, routing, RCA, and GitHub issue creation.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Primary Signal</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">Image Studio faults</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">The sandbox is wired to trigger real RCA paths from intentional runtime failures.</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 font-mono text-sm text-slate-600">
                  <p><span className="text-blue-500">{'>'}</span> intake saved to storage</p>
                  <p><span className="text-blue-500">{'>'}</span> triage summary embedded for retrieval</p>
                  <p><span className="text-blue-500">{'>'}</span> routing decision chooses opencode_rca</p>
                  <p className="text-emerald-700"><span className="text-emerald-500">{'>'}</span> github issue prepared from RCA result</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <RevealSection id="sandbox" className="bg-white px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Sandbox</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Image Studio is the active failure surface.
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                The sandbox is a working image toolchain with intentional faults. When a request fails, the RCA pipeline captures the event, reads the repo, and pushes the result toward GitHub.
              </p>
              <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.18 }} className="mt-8">
                <Link href="/sandbox" className="inline-flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-700">
                  Enter the sandbox <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={reveal}
              className="rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 shadow-[0_22px_70px_rgba(15,23,42,0.08)]"
            >
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <Terminal size={20} className="text-slate-400" />
                  <span className="font-mono text-sm font-semibold text-slate-700">sandbox_status</span>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  Diagnostic mode
                </span>
              </div>
              <div className="space-y-3 font-mono text-sm text-slate-600">
                <p><span className="text-blue-500">{'>'}</span> image pipeline booted</p>
                <p><span className="text-blue-500">{'>'}</span> compression, resize, and pdf routes online</p>
                <p className="text-amber-700"><span className="text-amber-500">{'>'}</span> intentional fault paths preserved for RCA validation</p>
                <p><span className="text-blue-500">{'>'}</span> errors routed into Mamba ingestion</p>
                <p className="animate-pulse">_</p>
              </div>
            </motion.div>
          </div>
        </RevealSection>

        <RevealSection className="border-t border-slate-200 bg-slate-50/60 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Core Technology Stack</h2>
              <p className="mt-4 text-lg text-slate-500">A compact system of framework, storage, routing, and agentic infrastructure.</p>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.38, delay: index * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                    <img src={tech.iconUrl} alt={tech.name} className="h-6 w-6 object-contain" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{tech.name}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">{tech.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection id="architecture" className="subtle-grid border-t border-slate-200 bg-white px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-16 max-w-4xl rounded-[28px] border border-slate-200 bg-white/85 p-8 text-center shadow-sm backdrop-blur-sm">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Pipeline Architecture</h2>
              <p className="mt-4 text-lg text-slate-600">
                FastAPI orchestration, Gemini structuring, MongoDB vector retrieval, and OpenCode RCA in one routed graph.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={reveal}
              className="relative h-[600px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
            >
              <div className="absolute left-0 top-0 z-10 rounded-br-xl border-b border-r border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500">
                System Node Graph
              </div>
              <ArchitectureFlow />
            </motion.div>
          </div>
        </RevealSection>

        <RevealSection className="border-t border-slate-200 bg-slate-50 px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Observability</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                The dashboard is the operating surface.
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Review request health, follow timeline progression, inspect GitHub outcomes, and track whether RCA output was actually produced.
              </p>
              <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.18 }} className="mt-8">
                <Link href="/requests" className="pro-button flex w-fit items-center gap-2 border-transparent bg-blue-600 px-6 py-3 text-sm text-white hover:bg-blue-700">
                  View live dashboard <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {dashboardHighlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.38, delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
                  >
                    <Icon size={24} className={item.tone} />
                    <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </RevealSection>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-black">
              <span className="text-xs font-bold leading-none text-white">M</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900">Mamba RCA</span>
          </div>
          <div className="text-sm font-medium text-slate-500">
            © {new Date().getFullYear()} Mamba Intelligence Orchestration Layer.
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Systems operational
          </span>
        </div>
      </footer>
    </div>
  );
}

function RevealSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={reveal}
      className={className}
    >
      {children}
    </motion.section>
  );
}
