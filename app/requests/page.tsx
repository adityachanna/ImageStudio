'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock3, Database, ExternalLink, Search, XCircle, LayoutDashboard, FileText, Activity } from 'lucide-react';

type DateLike = string | { $date?: string } | null | undefined;

type StatusEntry = {
  status?: string;
  step?: string;
  message?: string;
  at?: DateLike;
};

type Ticket = {
  requestId?: string;
  status?: string;
  currentStep?: string;
  statusMessage?: string;
  requestType?: string;
  reviewType?: string;
  primaryChoice?: string;
  documentType?: string;
  pipelineVersion?: string;
  createdAt?: DateLike;
  updatedAt?: DateLike;
  intake?: {
    issueFingerprint?: string;
    issueDescriptionHash?: string;
    submittedAt?: DateLike;
    receivedImageCount?: number;
  };
  triage?: {
    summary?: string;
    structuredProblem?: string;
    errorType?: string;
    severity?: string;
    systemContext?: string;
    pageContext?: string;
    impactAssessment?: string;
    dataGaps?: string[];
  };
  workflow?: {
    dedup?: {
      status?: string;
      matchedRecordId?: string | null;
    };
    rca?: {
      eligible?: boolean;
      status?: string;
      summary?: string;
    };
    rag?: {
      decision?: {
        flow?: string;
        rationale?: string;
        matched_request_id?: string | null;
        matched_score?: number | null;
      };
    };
  };
  rca?: {
    eligible?: boolean;
    status?: string;
    result?: {
      source?: string;
      matchedRequestId?: string;
      score?: number;
    };
  };
  artifactUrls?: {
    output?: string[];
    logs?: string[];
  };
  statusHistory?: StatusEntry[];
};

type StatusApiResponse = {
  ticket?: unknown;
};

type RecentRecord = {
  requestId: string;
  requestType?: string;
  reviewType?: string;
  status?: string;
  currentStep?: string;
  createdAt: string;
};

type RecentPayload = {
  records?: RecentRecord[];
};

const stepLabels: Record<string, string> = {
  received: 'Received',
  uploading_images: 'Uploading Images',
  saving_input: 'Saving Input',
  analyzing: 'AI Structuring',
  saving_output: 'Saving Output',
  rag_routing: 'RAG Routing',
  opencode_rca: 'OpenCode RCA',
  repo_sync: 'Repo Sync',
  rca_completed: 'RCA Completed',
  dedup_matched: 'Duplicate Matched',
};

function readDate(value: DateLike): string {
  if (!value) return 'N/A';
  const iso = typeof value === 'string' ? value : value.$date;
  if (!iso) return 'N/A';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
}

function parseTicket(payload: unknown): Ticket | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as StatusApiResponse;
  if (root.ticket && typeof root.ticket === 'object') return root.ticket as Ticket;
  return null;
}

function RequestsDashboardContent() {
  const searchParams = useSearchParams();

  const [inputId, setInputId] = useState('');
  const [activeRequestId, setActiveRequestId] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [recent, setRecent] = useState<RecentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentError, setRecentError] = useState('');

  useEffect(() => {
    const fromQuery = searchParams.get('requestId') ?? '';
    if (!fromQuery) return;
    setInputId(fromQuery);
    setActiveRequestId(fromQuery);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    async function loadRecent() {
      try {
        setRecentError('');
        const res = await fetch('/api/request-status/recent?limit=5', { cache: 'no-store' });
        if (!res.ok) {
          if (!mounted) return;
          setRecent([]);
          setRecentError('Could not load recent requests from FastAPI endpoint.');
          return;
        }

        const payload = (await res.json()) as RecentPayload;
        const latest = (payload.records ?? []).slice(0, 5);
        if (!mounted) return;

        setRecent(latest);
      } catch {
        if (!mounted) return;
        setRecent([]);
        setRecentError('Network error while loading recent requests.');
      }
    }

    loadRecent();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeRequestId) return;

    let mounted = true;

    async function loadTicket() {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`/api/request-status/${encodeURIComponent(activeRequestId)}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          if (!mounted) return;
          setTicket(null);
          setError('Could not load ticket from Mongo-backed API.');
          return;
        }

        const data = (await res.json()) as unknown;
        const parsed = parseTicket(data);

        if (!mounted) return;
        if (!parsed) {
          setTicket(null);
          setError('Ticket payload shape is unexpected.');
          return;
        }

        setTicket(parsed);
      } catch {
        if (!mounted) return;
        setTicket(null);
        setError('Network error while loading ticket.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTicket();
    return () => {
      mounted = false;
    };
  }, [activeRequestId]);

  const rcaInvoked = useMemo(() => {
    if (!ticket) return false;
    const workflowRcaStatus = ticket.workflow?.rca?.status?.toLowerCase() ?? '';
    return workflowRcaStatus === 'completed' || ticket.currentStep === 'rca_completed';
  }, [ticket]);

  const rcaSkippedDuplicate = useMemo(() => {
    if (!ticket) return false;
    const workflowRcaStatus = ticket.workflow?.rca?.status?.toLowerCase() ?? '';
    const dedupStatus = ticket.workflow?.dedup?.status?.toLowerCase() ?? '';
    return workflowRcaStatus === 'skipped_duplicate' || dedupStatus === 'matched' || ticket.currentStep === 'dedup_matched';
  }, [ticket]);

  const timeline = useMemo(() => {
    return (ticket?.statusHistory ?? []).map((step, idx) => ({
      id: `${step.step ?? 'step'}-${idx}`,
      title: stepLabels[step.step ?? ''] ?? step.step ?? 'Step',
      status: step.status ?? 'processing',
      message: step.message ?? '',
      at: readDate(step.at),
      done: (step.status ?? '').toLowerCase() === 'completed',
    }));
  }, [ticket]);

  return (
    <div className="font-sans bg-slate-50 text-slate-900 min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-black flex items-center justify-center rounded">
                <span className="text-white font-bold text-lg leading-none">M</span>
              </div>
              <span className="font-semibold text-xl tracking-tight text-slate-900 hidden sm:inline">Mamba <span className="font-light text-slate-500">RCA</span></span>
            </Link>
            <div className="hidden md:block w-px h-6 bg-slate-200"></div>
            <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded">
              <LayoutDashboard size={14} /> Orchestrator Dashboard
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="pro-button-secondary px-4 py-2 text-xs hidden sm:flex items-center">Home</Link>
            <Link href="/sandbox" className="pro-button px-4 py-2 text-xs hidden sm:flex items-center">Sandbox</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">Observability Dashboard</h1>
          <p className="text-slate-500 text-lg">Monitor the Mamba RCA pipeline and sandbox error traces.</p>
        </header>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <Activity size={12} /> Live Trace Active
              </span>
              {!!activeRequestId && (
                <button 
                  onClick={() => { setInputId(''); setActiveRequestId(''); setTicket(null); setError(''); }} 
                  className="pro-button-secondary px-3 py-1.5 text-xs"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="pl-3 text-slate-400">
              <Search size={20} />
            </div>
            <input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Enter Request ID (e.g. req-12345)"
              className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-mono text-sm py-2"
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveRequestId(inputId.trim()); }}
            />
            <button 
              onClick={() => setActiveRequestId(inputId.trim())} 
              className="pro-button px-6 py-2 text-sm"
            >
              Trace Request
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-500 font-medium">
              {loading ? 'Fetching records from MongoDB...' : activeRequestId ? `Viewing ID: ${activeRequestId}` : 'Enter an ID or select from recent sandbox requests.'}
            </p>
            {!!error && <p className="mt-2 text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded border border-rose-100">{error}</p>}
            {!!recentError && !activeRequestId && <p className="mt-2 text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded border border-rose-100">{recentError}</p>}
          </div>
        </section>

        {!activeRequestId && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock3 size={18} className="text-slate-400" /> Recent Faults & Requests
          </h2>
          <div className="grid gap-3">
            {recent.length === 0 && <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded border border-slate-100 text-center">No recent requests found in the system.</p>}
            {recent.map((item) => (
              <button
                key={item.requestId}
                onClick={() => {
                  setInputId(item.requestId);
                  setActiveRequestId(item.requestId);
                }}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded border transition-all text-left group
                  ${activeRequestId === item.requestId 
                    ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-slate-900">{item.requestId}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700 transition-colors">
                      {item.requestType ?? 'ticket'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 sm:text-right">
                  <p className="text-sm font-medium text-slate-700 capitalize">
                    {item.status ?? 'Processing'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {stepLabels[item.currentStep ?? ''] ?? item.currentStep ?? 'N/A'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
        )}

        {ticket && (
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Pipeline Resolution</h2>
              {rcaInvoked && (
                <div className="flex gap-4 items-start p-4 rounded bg-slate-50 border border-slate-200">
                  <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">RCA Engine Active</h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{ticket.workflow?.rca?.summary ?? ticket.statusMessage ?? 'OpenCode executed source analysis.'}</p>
                  </div>
                </div>
              )}
              {rcaSkippedDuplicate && (
                <div className="flex gap-4 items-start p-4 rounded bg-slate-50 border border-slate-200">
                  <Clock3 size={24} className="text-blue-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Vector Deduplication Match</h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Halting computation. Matched existing record: <span className="font-mono bg-slate-200 px-1 py-0.5 rounded text-xs">{ticket.workflow?.dedup?.matchedRecordId ?? ticket.rca?.result?.matchedRequestId ?? 'N/A'}</span>
                    </p>
                  </div>
                </div>
              )}
              {!rcaInvoked && !rcaSkippedDuplicate && (
                <div className="flex gap-4 items-start p-4 rounded bg-slate-50 border border-slate-200">
                  <XCircle size={24} className="text-slate-400 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Trace In Progress</h3>
                    <p className="text-sm text-slate-600 mt-1">Status: {ticket.status ?? 'N/A'} | Step: {ticket.currentStep ?? 'N/A'}</p>
                  </div>
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Trace Identity</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Request ID" value={ticket.requestId} mono />
                  <Field label="Status" value={ticket.status} />
                  <Field label="Current Step" value={ticket.currentStep} />
                  <Field label="Request Type" value={ticket.requestType} />
                  <Field label="Created At" value={readDate(ticket.createdAt)} />
                  <Field label="Updated At" value={readDate(ticket.updatedAt)} />
                </div>
              </section>

              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Orchestrator Routing</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Planned Flow" value={ticket.workflow?.rag?.decision?.flow ?? 'N/A'} />
                  <Field label="Decision Status" value={ticket.workflow?.dedup?.status ?? ticket.workflow?.rca?.status ?? 'N/A'} />
                  <Field
                    label="Matched ID"
                    mono
                    value={
                      ticket.workflow?.dedup?.matchedRecordId ??
                      ticket.workflow?.rag?.decision?.matched_request_id ??
                      ticket.rca?.result?.matchedRequestId ??
                      'N/A'
                    }
                  />
                  <Field
                    label="Match Score"
                    value={
                      ticket.workflow?.rag?.decision?.matched_score != null
                        ? String(ticket.workflow?.rag?.decision?.matched_score)
                        : ticket.rca?.result?.score != null
                        ? String(ticket.rca?.result?.score)
                        : 'N/A'
                    }
                  />
                </div>
                
                {ticket.workflow?.rag?.decision?.rationale && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rationale</p>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">{ticket.workflow.rag.decision.rationale}</p>
                  </div>
                )}
              </section>
            </div>

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-slate-400" /> AI Triage Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Field label="Summary" value={ticket.triage?.summary} />
                <Field label="Error Type" value={ticket.triage?.errorType} />
                <Field label="Severity" value={ticket.triage?.severity} />
                <Field label="System Context" value={ticket.triage?.systemContext} />
              </div>

              {ticket.triage?.structuredProblem && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Structured Problem</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded border border-slate-100">{ticket.triage.structuredProblem}</p>
                </div>
              )}

              {ticket.triage?.impactAssessment && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Impact Assessment</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded border border-slate-100">{ticket.triage.impactAssessment}</p>
                </div>
              )}

              {(ticket.triage?.dataGaps?.length ?? 0) > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Data Gaps</p>
                  <ul className="space-y-2">
                    {ticket.triage?.dataGaps?.slice(0, 4).map((gap, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Intake Signatures</h2>
                <div className="grid gap-4">
                  <Field label="Issue Fingerprint" value={ticket.intake?.issueFingerprint} mono />
                  <Field label="Description Hash" value={ticket.intake?.issueDescriptionHash} mono />
                  <Field label="Received Images" value={String(ticket.intake?.receivedImageCount ?? 0)} />
                </div>
              </section>

              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Artifacts & Storage</h2>
                <p className="text-sm text-slate-500 mb-6">Storage objects managed by Cloudflare R2.</p>
                
                <div className="flex flex-wrap gap-3 mt-auto">
                  {ticket.artifactUrls?.output?.[0] ? (
                    <a href={ticket.artifactUrls.output[0]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded text-sm font-medium text-slate-700 transition-colors">
                      <Database size={16} className="text-slate-600" /> Output Artifact <ExternalLink size={14} className="text-slate-400" />
                    </a>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded text-sm font-medium text-slate-400">
                      <Database size={16} /> No Output Artifacts
                    </div>
                  )}
                  {ticket.artifactUrls?.logs?.[0] ? (
                    <a href={ticket.artifactUrls.logs[0]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded text-sm font-medium text-slate-700 transition-colors">
                      <Database size={16} className="text-slate-600" /> System Logs <ExternalLink size={14} className="text-slate-400" />
                    </a>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded text-sm font-medium text-slate-400">
                      <Database size={16} /> No Log Artifacts
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Pipeline Timeline</h2>
              <div className="space-y-4">
                {timeline.length === 0 && <p className="text-sm text-slate-500">No timeline data available.</p>}
                {timeline.map((item, i) => (
                  <div key={item.id} className="relative pl-6 pb-4 last:pb-0">
                    {/* Timeline line */}
                    {i !== timeline.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-200" />
                    )}
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center
                      ${item.done ? 'border-slate-800' : 'border-slate-300'}`}
                    >
                      {item.done && <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />}
                    </div>
                    
                    <div className={`p-4 rounded border ${item.done ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'}`}>
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                        <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">{item.at}</span>
                      </div>
                      <p className="text-sm text-slate-600">{item.message || 'Processing step.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default function RequestsDashboardPage() {
  return (
    <Suspense fallback={<RequestsDashboardFallback />}>
      <RequestsDashboardContent />
    </Suspense>
  );
}

function RequestsDashboardFallback() {
  return (
    <div className="font-sans bg-slate-50 text-slate-900 min-h-screen">
      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm text-slate-500">Loading requests dashboard...</p>
        </section>
      </main>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex flex-col justify-center">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
      <span className={`text-sm text-slate-900 ${mono ? 'font-mono text-xs bg-slate-50 px-2 py-1 rounded border border-slate-200' : 'font-medium'} break-words`}>
        {value || 'N/A'}
      </span>
    </div>
  );
}