'use client';

import {
  type ReactNode,
  Suspense,
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  GitBranch,
  LayoutDashboard,
  RefreshCw,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';

type DateLike = string | { $date?: string } | null | undefined;

type StatusEntry = {
  status?: string;
  step?: string;
  message?: string;
  at?: DateLike;
};

type RoutingDecision = {
  flow?: string;
  rationale?: string;
  matched_request_id?: string | null;
  matched_score?: number | null;
  confidence?: string;
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
  userEmail?: string;
  createdAt?: DateLike;
  updatedAt?: DateLike;
  receivedImageCount?: number;
  intake?: {
    submittedAt?: DateLike;
    receivedImageCount?: number;
  };
  storage?: {
    route?: string;
    problemsPrefix?: string;
    imageCount?: number;
  };
  analysis?: {
    model?: string;
    imageCount?: number;
  };
  triage?: {
    summary?: string;
    structuredProblem?: string;
    errorType?: string;
    errorCode?: string;
    severity?: string;
    systemContext?: string;
    pageContext?: string;
    impactScope?: string;
    impactAssessment?: string;
    preliminaryAssessment?: string;
    imageEvidence?: string[];
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
      status?: string;
      decision?: RoutingDecision;
    };
  };
  flowDecision?: RoutingDecision;
  rca?: {
    eligible?: boolean;
    status?: string;
    summary?: string;
    result?: {
      source?: string;
      report?: string;
      repoDir?: string;
      matchedRequestId?: string;
      score?: number;
    };
  };
  github?: {
    status?: string;
    mode?: string;
    repository?: string;
    issueNumber?: number;
    issueUrl?: string;
    commentUrl?: string;
    issueTitle?: string;
  };
  inputArtifact?: unknown;
  outputArtifact?: unknown;
  logArtifacts?: unknown[];
  imageObjects?: unknown[];
  imagePayloadUrls?: string[];
  artifactUrls?: {
    input?: string[];
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

type TimelineEntry = {
  id: string;
  title: string;
  status: string;
  message: string;
  at: string;
};

type GithubLink = {
  url: string;
  label: string;
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

function humanize(value?: string | null): string {
  if (!value) return 'N/A';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseTicket(payload: unknown): Ticket | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as StatusApiResponse;
  if (root.ticket && typeof root.ticket === 'object') return root.ticket as Ticket;
  return null;
}

function hasArtifact(value: unknown): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function isTerminalTicket(ticket: Ticket | null): boolean {
  if (!ticket) return false;

  const normalizedStatus = (ticket.status ?? '').toLowerCase();
  const normalizedStep = (ticket.currentStep ?? '').toLowerCase();
  const rcaStatus = (ticket.workflow?.rca?.status ?? ticket.rca?.status ?? '').toLowerCase();
  const dedupStatus = (ticket.workflow?.dedup?.status ?? '').toLowerCase();

  if (['completed', 'failed', 'error', 'cancelled'].includes(normalizedStatus)) return true;
  if (['rca_completed', 'dedup_matched'].includes(normalizedStep)) return true;
  if (['completed', 'skipped_duplicate'].includes(rcaStatus)) return true;
  if (dedupStatus === 'matched') return true;

  return false;
}

function collectGithubUrls(value: unknown, urls = new Set<string>()): Set<string> {
  if (!value) return urls;

  if (typeof value === 'string') {
    const matches = value.match(/https?:\/\/github\.com\/[^\s"'<>]+/gi) ?? [];
    for (const match of matches) {
      urls.add(match.replace(/[),.;]+$/, ''));
    }
    return urls;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectGithubUrls(item, urls);
    return urls;
  }

  if (typeof value === 'object') {
    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      collectGithubUrls(nestedValue, urls);
    }
  }

  return urls;
}

function classifyGithubLink(url: string): string {
  if (/#issuecomment-\d+/i.test(url) || /\/pull\/\d+#discussion_r\d+/i.test(url)) {
    return 'GitHub Comment';
  }
  if (/\/issues\/\d+/i.test(url)) return 'GitHub Issue';
  if (/\/pull\/\d+/i.test(url)) return 'GitHub Pull Request';
  return 'GitHub Link';
}

function getStatusTone(status?: string | null): 'emerald' | 'amber' | 'rose' | 'slate' {
  const normalized = (status ?? '').toLowerCase();
  if (['completed', 'success'].includes(normalized)) return 'emerald';
  if (['failed', 'error'].includes(normalized)) return 'rose';
  if (['processing', 'running', 'queued', 'pending'].includes(normalized)) return 'amber';
  return 'slate';
}

const revealTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
};

async function fetchTicketPayload(requestId: string): Promise<Ticket> {
  const res = await fetch(`/api/request-status/${encodeURIComponent(requestId)}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Could not load the selected request from the status API.');
  }

  const data = (await res.json()) as unknown;
  const parsed = parseTicket(data);

  if (!parsed) {
    throw new Error('Ticket payload shape is unexpected.');
  }

  return parsed;
}

function RequestsDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inputId, setInputId] = useState('');
  const [activeRequestId, setActiveRequestId] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [recent, setRecent] = useState<RecentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
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
          setRecentError('Could not load recent requests from the backend.');
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

    void loadRecent();

    return () => {
      mounted = false;
    };
  }, []);

  async function requestAndApplyTicket(requestId: string, background = false) {
    if (!requestId) return;

    if (background) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
      setTicket(null);
    }

    setError('');

    try {
      const parsed = await fetchTicketPayload(requestId);

      startTransition(() => {
        setTicket(parsed);
        setLastRefreshedAt(new Date().toISOString());
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error while loading the selected request.';
      startTransition(() => {
        setTicket(null);
        setError(message);
      });
    } finally {
      if (background) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }

  const loadTicket = useEffectEvent(async (requestId: string, background = false) => {
    await requestAndApplyTicket(requestId, background);
  });

  useEffect(() => {
    if (!activeRequestId) return;
    void loadTicket(activeRequestId);
  }, [activeRequestId]);

  const shouldPoll = useMemo(() => {
    if (!activeRequestId) return false;
    if (!ticket) return false;
    return !isTerminalTicket(ticket);
  }, [activeRequestId, ticket]);

  useEffect(() => {
    if (!activeRequestId || !shouldPoll) return;

    const intervalId = window.setInterval(() => {
      void loadTicket(activeRequestId, true);
    }, 10_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeRequestId, shouldPoll]);

  const routingDecision = useMemo(
    () => ticket?.flowDecision ?? ticket?.workflow?.rag?.decision ?? null,
    [ticket]
  );

  const rcaInvoked = useMemo(() => {
    if (!ticket) return false;
    const workflowRcaStatus = ticket.workflow?.rca?.status?.toLowerCase() ?? '';
    const topLevelRcaStatus = ticket.rca?.status?.toLowerCase() ?? '';
    return (
      workflowRcaStatus === 'completed' ||
      topLevelRcaStatus === 'completed' ||
      ticket.currentStep === 'rca_completed'
    );
  }, [ticket]);

  const rcaSkippedDuplicate = useMemo(() => {
    if (!ticket) return false;
    const workflowRcaStatus = ticket.workflow?.rca?.status?.toLowerCase() ?? '';
    const dedupStatus = ticket.workflow?.dedup?.status?.toLowerCase() ?? '';
    return workflowRcaStatus === 'skipped_duplicate' || dedupStatus === 'matched' || ticket.currentStep === 'dedup_matched';
  }, [ticket]);

  const timeline = useMemo<TimelineEntry[]>(() => {
    return (ticket?.statusHistory ?? []).map((step, idx) => ({
      id: `${step.step ?? 'step'}-${idx}`,
      title: stepLabels[step.step ?? ''] ?? humanize(step.step) ?? 'Step',
      status: humanize(step.status) ?? 'Processing',
      message: step.message ?? '',
      at: readDate(step.at),
    }));
  }, [ticket]);

  const githubLinks = useMemo<GithubLink[]>(() => {
    if (!ticket) return [];

    return Array.from(collectGithubUrls(ticket))
      .map((url) => ({ url, label: classifyGithubLink(url) }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [ticket]);

  const summaryHeadline = ticket?.triage?.summary ?? ticket?.statusMessage ?? 'Selected request';
  const currentStepLabel = stepLabels[ticket?.currentStep ?? ''] ?? humanize(ticket?.currentStep) ?? 'N/A';
  const requestStatusLabel = humanize(ticket?.status) ?? 'N/A';
  const refreshLabel = lastRefreshedAt ? readDate(lastRefreshedAt) : 'Waiting for first response';
  const imageCount =
    ticket?.storage?.imageCount ??
    ticket?.analysis?.imageCount ??
    ticket?.intake?.receivedImageCount ??
    ticket?.receivedImageCount ??
    ticket?.imageObjects?.length ??
    ticket?.imagePayloadUrls?.length ??
    0;

  const inputReady = hasArtifact(ticket?.inputArtifact) || (ticket?.artifactUrls?.input?.length ?? 0) > 0;
  const outputReady = hasArtifact(ticket?.outputArtifact) || (ticket?.artifactUrls?.output?.length ?? 0) > 0;
  const logsReady = (ticket?.logArtifacts?.length ?? 0) > 0 || (ticket?.artifactUrls?.logs?.length ?? 0) > 0;

  function returnToDashboard() {
    setInputId('');
    setActiveRequestId('');
    setTicket(null);
    setError('');
    setLastRefreshedAt(null);
    router.replace('/requests', { scroll: false });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(148,163,184,0.18),_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] text-slate-900">
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-black">
                <span className="text-lg font-bold leading-none text-white">M</span>
              </div>
              <span className="hidden text-xl font-semibold tracking-tight text-slate-900 sm:inline">
                Mamba <span className="font-light text-slate-500">RCA</span>
              </span>
            </Link>
            <div className="hidden h-6 w-px bg-slate-200 md:block" />
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 md:flex">
              <LayoutDashboard size={14} />
              Dashboard
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="pro-button-secondary hidden px-4 py-2 text-xs sm:flex">
              Home
            </Link>
            <Link href="/sandbox" className="pro-button hidden px-4 py-2 text-xs sm:flex">
              Sandbox
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pb-20 pt-24">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={revealTransition}
          className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,255,255,0.78)),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_34%)] px-8 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
        >
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.06),transparent_68%)]" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Operator Console
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Request Observability
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
                Inspect the active request, monitor pipeline progression, and verify whether outputs,
                logs, and RCA handoff artifacts have been captured.
              </p>
            </div>

            {activeRequestId ? (
              <div className="flex flex-wrap items-center gap-2 lg:max-w-sm lg:justify-end">
                <StatusPill tone="slate">Request loaded</StatusPill>
                <StatusPill tone={shouldPoll ? 'amber' : 'emerald'}>
                  {shouldPoll ? 'Polling every 10s' : 'Stable'}
                </StatusPill>
                <StatusPill tone="slate">{lastRefreshedAt ? `Updated ${refreshLabel}` : 'Waiting for refresh'}</StatusPill>
              </div>
            ) : null}
          </div>
        </motion.header>

        <MotionSection
          delay={0.05}
          className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-sm"
        >
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="slate">
                <Activity size={12} />
                Request Lookup
              </StatusPill>
              {activeRequestId ? (
                <StatusPill tone={shouldPoll ? 'amber' : 'emerald'}>
                  <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                  {shouldPoll ? 'Polling every 10s' : 'Polling stopped'}
                </StatusPill>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!!activeRequestId && (
                <button
                  onClick={() => void requestAndApplyTicket(activeRequestId, true)}
                  className="pro-button-secondary gap-2 px-3 py-2 text-xs"
                  disabled={loading || isRefreshing}
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  Refresh
                </button>
              )}
              {!!activeRequestId && (
                <button
                  onClick={returnToDashboard}
                  className="pro-button-secondary px-3 py-2 text-xs"
                >
                  Back to Dashboard
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <div className="pl-3 text-slate-400">
              <Search size={20} />
            </div>
            <input
              value={inputId}
              onChange={(event) => setInputId(event.target.value)}
              placeholder="Enter a request ID"
              className="w-full border-none bg-transparent py-2 font-mono text-sm text-slate-900 outline-none placeholder:text-slate-400"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setActiveRequestId(inputId.trim());
                }
              }}
            />
            <button onClick={() => setActiveRequestId(inputId.trim())} className="pro-button px-5 py-2 text-sm">
              Open Request
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-500">
            <span>
              {loading
                ? 'Loading request from the status API...'
                : activeRequestId
                  ? `Viewing ${activeRequestId}`
                  : 'Pick one of the recent requests or paste a request ID.'}
            </span>
            {!!error && (
              <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            )}
            {!!recentError && !activeRequestId && (
              <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {recentError}
              </p>
            )}
          </div>
        </MotionSection>

        {!activeRequestId && (
          <MotionSection
            delay={0.1}
            className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <Clock3 size={18} className="text-slate-400" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recent Requests</h2>
                <p className="text-sm text-slate-500">Latest pipeline traffic from the backend status feed.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {recent.length === 0 && (
                <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-500">
                  No recent requests found.
                </p>
              )}

              {recent.map((item) => (
                <motion.button
                  key={item.requestId}
                  onClick={() => {
                    setInputId(item.requestId);
                    setActiveRequestId(item.requestId);
                  }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="grid gap-4 rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 text-left shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-colors hover:border-slate-300 hover:bg-slate-50 md:grid-cols-[1.3fr_0.8fr_0.8fr]"
                >
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-900">{item.requestId}</span>
                      {item.requestType ? <StatusPill tone="slate">{item.requestType}</StatusPill> : null}
                      {item.reviewType ? <StatusPill tone="slate">{item.reviewType}</StatusPill> : null}
                    </div>
                    <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">{humanize(item.status)}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Current Step</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {stepLabels[item.currentStep ?? ''] ?? humanize(item.currentStep)}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </MotionSection>
        )}

        {activeRequestId && loading && !ticket && (
          <MotionSection className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">Fetching request details...</p>
          </MotionSection>
        )}

        {ticket && (
          <div className="grid gap-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-8 xl:grid xl:grid-cols-[1.25fr_0.75fr]">
                <div>
                  <button
                    onClick={returnToDashboard}
                    className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-white"
                  >
                    <LayoutDashboard size={12} />
                    Back to Dashboard
                  </button>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <StatusPill tone={getStatusTone(ticket.status)}>
                      {rcaInvoked ? <CheckCircle2 size={12} /> : rcaSkippedDuplicate ? <Clock3 size={12} /> : <Activity size={12} />}
                      {requestStatusLabel}
                    </StatusPill>
                    <StatusPill tone="slate">{currentStepLabel}</StatusPill>
                    {ticket.reviewType ? <StatusPill tone="slate">{ticket.reviewType}</StatusPill> : null}
                    {ticket.primaryChoice ? <StatusPill tone="slate">{ticket.primaryChoice}</StatusPill> : null}
                  </div>

                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Selected Request
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[2rem]">
                    {summaryHeadline}
                  </h2>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                    {ticket.statusMessage ?? 'Waiting for the next status transition from the pipeline.'}
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricTile
                      label="Request ID"
                      value={ticket.requestId ?? 'N/A'}
                      helper={ticket.requestType ?? 'Unknown type'}
                      mono
                    />
                    <MetricTile
                      label="Created"
                      value={readDate(ticket.createdAt)}
                      helper={ticket.pipelineVersion ?? 'Pipeline version unavailable'}
                    />
                    <MetricTile
                      label="Last Updated"
                      value={readDate(ticket.updatedAt)}
                      helper={`Refreshed ${refreshLabel}`}
                    />
                    <MetricTile
                      label="Images"
                      value={String(imageCount)}
                      helper={imageCount === 1 ? 'Screenshot attached' : 'Screenshots attached'}
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Execution Summary
                  </p>

                  {rcaInvoked && (
                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-900">RCA completed</p>
                          <p className="mt-1 text-sm leading-6 text-emerald-800">
                            {ticket.workflow?.rca?.summary ??
                              ticket.rca?.summary ??
                              'OpenCode RCA finished and produced an analysis output.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {rcaSkippedDuplicate && (
                    <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                      <div className="flex items-start gap-3">
                        <Clock3 size={18} className="mt-0.5 shrink-0 text-sky-600" />
                        <div>
                          <p className="font-medium text-sky-900">Duplicate path selected</p>
                          <p className="mt-1 text-sm leading-6 text-sky-800">
                            Matched request:{' '}
                            <span className="font-mono text-xs">
                              {ticket.workflow?.dedup?.matchedRecordId ??
                                routingDecision?.matched_request_id ??
                                ticket.rca?.result?.matchedRequestId ??
                                'N/A'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!rcaInvoked && !rcaSkippedDuplicate && (
                    <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <Activity size={18} className="mt-0.5 shrink-0 text-amber-600" />
                        <div>
                          <p className="font-medium text-amber-900">Trace in progress</p>
                          <p className="mt-1 text-sm leading-6 text-amber-800">
                            The request is still moving through the orchestration pipeline.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-3">
                    <SummaryRow label="Flow" value={routingDecision?.flow ?? ticket.rca?.result?.source ?? 'Pending'} />
                    <SummaryRow
                      label="Decision Status"
                      value={
                        ticket.workflow?.rag?.status ??
                        ticket.workflow?.rca?.status ??
                        ticket.workflow?.dedup?.status ??
                        ticket.rca?.status ??
                        ticket.status
                      }
                    />
                    <SummaryRow label="Repo Dir" value={ticket.rca?.result?.repoDir ?? 'Not assigned yet'} mono />
                    <SummaryRow
                      label="Matched ID"
                      value={
                        ticket.workflow?.dedup?.matchedRecordId ??
                        routingDecision?.matched_request_id ??
                        ticket.rca?.result?.matchedRequestId ??
                        'N/A'
                      }
                      mono
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <FileText size={18} className="text-slate-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Incident Context</h3>
                    <p className="text-sm text-slate-500">AI extracted signal from the intake payload and screenshots.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Error Type" value={ticket.triage?.errorType} />
                  <Field label="Severity" value={ticket.triage?.severity} />
                  <Field label="Error Code" value={ticket.triage?.errorCode} />
                  <Field label="System Context" value={ticket.triage?.systemContext} />
                  <Field label="Page Context" value={ticket.triage?.pageContext} />
                  <Field label="Impact Scope" value={ticket.triage?.impactScope} />
                </div>

                {ticket.triage?.structuredProblem && (
                  <ProseBlock label="Structured Problem" value={ticket.triage.structuredProblem} />
                )}

                {ticket.triage?.impactAssessment && (
                  <ProseBlock label="Impact Assessment" value={ticket.triage.impactAssessment} />
                )}

                {ticket.triage?.preliminaryAssessment && (
                  <ProseBlock label="Preliminary Assessment" value={ticket.triage.preliminaryAssessment} />
                )}
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <Activity size={18} className="text-slate-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Routing and Links</h3>
                    <p className="text-sm text-slate-500">Decision data and downstream references exposed on the ticket.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Planned Flow" value={routingDecision?.flow} />
                  <Field label="Confidence" value={routingDecision?.confidence} />
                  <Field
                    label="Match Score"
                    value={
                      routingDecision?.matched_score != null
                        ? String(routingDecision.matched_score)
                        : ticket.rca?.result?.score != null
                          ? String(ticket.rca.result.score)
                          : undefined
                    }
                  />
                  <Field label="RCA Source" value={ticket.rca?.result?.source} />
                  <Field label="GitHub Status" value={ticket.github?.status} />
                  <Field label="Repository" value={ticket.github?.repository} />
                  <Field label="GitHub Mode" value={ticket.github?.mode} />
                  <Field
                    label="Issue Number"
                    value={ticket.github?.issueNumber != null ? `#${ticket.github.issueNumber}` : undefined}
                  />
                </div>

                {routingDecision?.rationale && (
                  <ProseBlock label="Routing Rationale" value={routingDecision.rationale} />
                )}

                {ticket.github?.issueTitle && (
                  <ProseBlock label="GitHub Issue" value={ticket.github.issueTitle} />
                )}

                {githubLinks.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      GitHub References
                    </p>
                    {githubLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <GitBranch size={16} className="text-slate-500" />
                          {link.label}
                        </span>
                        <span className="flex items-center gap-2 font-mono text-xs text-slate-500">
                          Open
                          <ExternalLink size={14} />
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <Activity size={18} className="text-slate-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Artifact Ingestion</h3>
                    <p className="text-sm text-slate-500">
                      Storage stays private. The dashboard reports capture state only.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <ArtifactRow
                    label="Input Artifact"
                    status={inputReady ? 'Ingested' : shouldPoll ? 'Pending' : 'Unavailable'}
                    tone={inputReady ? 'emerald' : shouldPoll ? 'amber' : 'slate'}
                    helper="Structured intake payload persisted for downstream processing."
                  />
                  <ArtifactRow
                    label="Output Artifact"
                    status={outputReady ? 'Ingested' : shouldPoll ? 'Pending' : 'Unavailable'}
                    tone={outputReady ? 'emerald' : shouldPoll ? 'amber' : 'slate'}
                    helper="Generated RCA report or derived pipeline output."
                  />
                  <ArtifactRow
                    label="System Logs"
                    status={logsReady ? 'Ingested' : shouldPoll ? 'Pending' : 'Unavailable'}
                    tone={logsReady ? 'emerald' : shouldPoll ? 'amber' : 'slate'}
                    helper="Runtime logs attached to the request history."
                  />
                  <ArtifactRow
                    label="Received Images"
                    status={String(imageCount)}
                    tone={imageCount > 0 ? 'emerald' : 'slate'}
                    helper={imageCount > 0 ? 'Image payload evidence captured.' : 'No images attached to this request.'}
                  />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Storage Route" value={ticket.storage?.route ?? ticket.primaryChoice} />
                  <Field label="Problems Prefix" value={ticket.storage?.problemsPrefix} mono />
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <FileText size={18} className="text-slate-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Evidence and Gaps</h3>
                    <p className="text-sm text-slate-500">Useful extracted observations and missing information.</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <ListBlock
                    title="Image Evidence"
                    items={ticket.triage?.imageEvidence ?? []}
                    emptyLabel="No image evidence extracted."
                  />
                  <ListBlock
                    title="Data Gaps"
                    items={ticket.triage?.dataGaps ?? []}
                    emptyLabel="No outstanding data gaps."
                  />
                </div>
              </section>
            </div>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Pipeline Timeline</h3>
                  <p className="text-sm text-slate-500">
                    Ordered execution events from request intake through RCA completion.
                  </p>
                </div>
                <StatusPill tone={shouldPoll ? 'amber' : 'slate'}>
                  {shouldPoll ? 'Tracking live updates' : 'Stable history'}
                </StatusPill>
              </div>

              <div className="space-y-4">
                {timeline.length === 0 && (
                  <p className="text-sm text-slate-500">No timeline data available for this request.</p>
                )}

                {timeline.map((item, index) => {
                  const isLatest = index === timeline.length - 1;
                  const activeTone = isLatest && shouldPoll ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white';

                  return (
                    <div key={item.id} className="relative pl-8">
                      {index !== timeline.length - 1 && (
                        <div className="absolute left-[13px] top-7 bottom-[-18px] w-px bg-slate-200" />
                      )}

                      <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white">
                        <div className={`h-2.5 w-2.5 rounded-full ${isLatest && shouldPoll ? 'bg-amber-500' : 'bg-slate-800'}`} />
                      </div>

                      <div className={`rounded-2xl border p-4 ${activeTone}`}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                              <StatusPill tone={isLatest && shouldPoll ? 'amber' : 'slate'}>
                                {item.status}
                              </StatusPill>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {item.message || 'Processing step.'}
                            </p>
                          </div>
                          <span className="font-mono text-xs text-slate-500">{item.at}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-24">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading requests dashboard...</p>
        </section>
      </main>
    </div>
  );
}

function MotionSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...revealTransition, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function StatusPill({
  children,
  tone = 'slate',
}: {
  children: ReactNode;
  tone?: 'emerald' | 'amber' | 'rose' | 'slate';
}) {
  const toneClasses = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

function MetricTile({
  label,
  value,
  helper,
  mono = false,
}: {
  label: string;
  value: string;
  helper: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold text-slate-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function SummaryRow({ label, value, mono = false }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span className={`text-right text-sm text-slate-700 ${mono ? 'font-mono text-xs' : 'font-medium'}`}>
        {value || 'N/A'}
      </span>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-2 break-words text-sm text-slate-900 ${mono ? 'font-mono text-xs' : 'font-medium'}`}>
        {value || 'N/A'}
      </p>
    </div>
  );
}

function ProseBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-sm leading-7 text-slate-700">{value}</p>
    </div>
  );
}

function ArtifactRow({
  label,
  status,
  tone,
  helper,
}: {
  label: string;
  status: string;
  tone: 'emerald' | 'amber' | 'rose' | 'slate';
  helper: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{helper}</p>
      </div>
      <StatusPill tone={tone}>{status}</StatusPill>
    </div>
  );
}

function ListBlock({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{title}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.slice(0, 5).map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
