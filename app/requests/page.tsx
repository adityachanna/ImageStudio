'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock3, Database, ExternalLink, Search, XCircle } from 'lucide-react';

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

export default function RequestsDashboardPage() {
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
    <main style={{ minHeight: '100vh', padding: '28px 20px 64px', background: 'linear-gradient(180deg, #f8fafc 0%, #eef4fb 100%)' }}>
      <section style={{ maxWidth: 1120, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              MongoDB Ticket Dashboard
            </p>
            <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(28px,4vw,42px)', lineHeight: 1.05, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
              LLM View + Important Fields
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/" style={navButtonStyle}>Home</Link>
            <Link href="/sandbox" style={navButtonStyle}>Sandbox</Link>
          </div>
        </header>

        <section style={{ ...cardStyle, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ ...badgeStyle, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
              FastAPI Recent List
            </span>
            <span style={{ ...badgeStyle, background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}>
              Last 5 Recent
            </span>
            {!!activeRequestId && (
              <button onClick={() => { setInputId(''); setActiveRequestId(''); setTicket(null); setError(''); }} style={secondaryButtonStyle}>
                Back To Recent
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={16} color="#64748b" />
            <input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Paste requestId"
              style={{ width: '100%', border: '1px solid #d8dee9', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', background: '#fff' }}
            />
            <button onClick={() => setActiveRequestId(inputId.trim())} style={primaryButtonStyle}>Load</button>
          </div>

          <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
            {loading ? 'Loading ticket...' : activeRequestId ? `Showing requestId: ${activeRequestId}` : 'Enter requestId or pick from recent live tickets.'}
          </p>
          {!!error && <p style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>{error}</p>}
          {!!recentError && !activeRequestId && <p style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>{recentError}</p>}
        </section>

        {!activeRequestId && (
        <section style={{ ...cardStyle, marginTop: 12 }}>
          <h2 style={sectionTitleStyle}>Last 5 Recent Requests (FastAPI)</h2>
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {recent.length === 0 && <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>No recent requests found.</p>}
            {recent.map((item) => (
              <button
                key={item.requestId}
                onClick={() => {
                  setInputId(item.requestId);
                  setActiveRequestId(item.requestId);
                }}
                style={{
                  border: '1px solid #dbe3ef',
                  background: activeRequestId === item.requestId ? '#eaf2ff' : '#fff',
                  borderRadius: 10,
                  padding: '9px 10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                  {(item.requestType ?? 'ticket').toLowerCase()} · {new Date(item.createdAt).toLocaleString()}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#0f172a', fontWeight: 700 }}>{item.requestId}</p>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
                  {(item.reviewType ?? 'N/A')} · {(item.status ?? 'N/A')} · {stepLabels[item.currentStep ?? ''] ?? item.currentStep ?? 'N/A'}
                </p>
              </button>
            ))}
          </div>
        </section>
        )}

        {ticket && (
          <>
            <section style={{ ...cardStyle, marginTop: 12, display: 'grid', gap: 10 }}>
              <h2 style={sectionTitleStyle}>Workflow Outcome</h2>
              {rcaInvoked && (
                <div style={outcomeGreenStyle}>
                  <CheckCircle2 size={18} />
                  <div>
                    <p style={outcomeTitleStyle}>RCA Agent Invoked</p>
                    <p style={outcomeSubStyle}>{ticket.workflow?.rca?.summary ?? ticket.statusMessage ?? 'OpenCode RCA completed.'}</p>
                  </div>
                </div>
              )}
              {rcaSkippedDuplicate && (
                <div style={outcomeBlueStyle}>
                  <Clock3 size={18} />
                  <div>
                    <p style={outcomeTitleStyle}>RCA Agent Not Invoked</p>
                    <p style={outcomeSubStyle}>
                      Duplicate matched: {ticket.workflow?.dedup?.matchedRecordId ?? ticket.rca?.result?.matchedRequestId ?? 'N/A'}
                    </p>
                  </div>
                </div>
              )}
              {!rcaInvoked && !rcaSkippedDuplicate && (
                <div style={outcomeGrayStyle}>
                  <XCircle size={18} />
                  <div>
                    <p style={outcomeTitleStyle}>Outcome Unclear</p>
                    <p style={outcomeSubStyle}>Status: {ticket.status ?? 'N/A'} | Step: {ticket.currentStep ?? 'N/A'}</p>
                  </div>
                </div>
              )}
            </section>

            <section style={{ ...cardStyle, marginTop: 12 }}>
              <h2 style={sectionTitleStyle}>Core Ticket Fields</h2>
              <div style={gridStyle}>
                <Field label="requestId" value={ticket.requestId} />
                <Field label="status" value={ticket.status} />
                <Field label="currentStep" value={ticket.currentStep} />
                <Field label="requestType" value={ticket.requestType} />
                <Field label="reviewType" value={ticket.reviewType} />
                <Field label="primaryChoice" value={ticket.primaryChoice} />
                <Field label="documentType" value={ticket.documentType} />
                <Field label="pipelineVersion" value={ticket.pipelineVersion} />
                <Field label="createdAt" value={readDate(ticket.createdAt)} />
                <Field label="updatedAt" value={readDate(ticket.updatedAt)} />
              </div>
            </section>

            <section style={{ ...cardStyle, marginTop: 12 }}>
              <h2 style={sectionTitleStyle}>Plan (Flow Decision)</h2>
              <div style={gridStyle}>
                <Field label="plannedFlow" value={ticket.workflow?.rag?.decision?.flow ?? 'N/A'} />
                <Field label="decisionStatus" value={ticket.workflow?.dedup?.status ?? ticket.workflow?.rca?.status ?? 'N/A'} />
                <Field
                  label="matchedRequestId"
                  value={
                    ticket.workflow?.dedup?.matchedRecordId ??
                    ticket.workflow?.rag?.decision?.matched_request_id ??
                    ticket.rca?.result?.matchedRequestId ??
                    'N/A'
                  }
                />
                <Field
                  label="matchScore"
                  value={
                    ticket.workflow?.rag?.decision?.matched_score != null
                      ? String(ticket.workflow?.rag?.decision?.matched_score)
                      : ticket.rca?.result?.score != null
                      ? String(ticket.rca?.result?.score)
                      : 'N/A'
                  }
                />
              </div>

              <p style={longTextLabelStyle}>rationale</p>
              <p style={longTextValueStyle}>{ticket.workflow?.rag?.decision?.rationale ?? 'N/A'}</p>

              <p style={longTextLabelStyle}>executionSummary</p>
              <p style={longTextValueStyle}>{ticket.workflow?.rca?.summary ?? ticket.statusMessage ?? 'N/A'}</p>
            </section>

            <section style={{ ...cardStyle, marginTop: 12 }}>
              <h2 style={sectionTitleStyle}>LLM Sees (Triage View)</h2>
              <div style={gridStyle}>
                <Field label="summary" value={ticket.triage?.summary} />
                <Field label="errorType" value={ticket.triage?.errorType} />
                <Field label="severity" value={ticket.triage?.severity} />
                <Field label="systemContext" value={ticket.triage?.systemContext} />
                <Field label="pageContext" value={ticket.triage?.pageContext} />
              </div>

              <p style={longTextLabelStyle}>structuredProblem</p>
              <p style={longTextValueStyle}>{ticket.triage?.structuredProblem ?? 'N/A'}</p>

              <p style={longTextLabelStyle}>impactAssessment</p>
              <p style={longTextValueStyle}>{ticket.triage?.impactAssessment ?? 'N/A'}</p>

              {(ticket.triage?.dataGaps?.length ?? 0) > 0 && (
                <>
                  <p style={longTextLabelStyle}>dataGaps</p>
                  <ul style={{ margin: '4px 0 0', color: '#334155', fontSize: 13 }}>
                    {ticket.triage?.dataGaps?.slice(0, 4).map((gap) => (
                      <li key={gap}>{gap}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section style={{ ...cardStyle, marginTop: 12 }}>
              <h2 style={sectionTitleStyle}>Intake + Fingerprints</h2>
              <div style={gridStyle}>
                <Field label="issueFingerprint" value={ticket.intake?.issueFingerprint} mono />
                <Field label="issueDescriptionHash" value={ticket.intake?.issueDescriptionHash} mono />
                <Field label="submittedAt" value={readDate(ticket.intake?.submittedAt)} />
                <Field label="receivedImageCount" value={String(ticket.intake?.receivedImageCount ?? 0)} />
              </div>
            </section>

            <section style={{ ...cardStyle, marginTop: 12 }}>
              <h2 style={sectionTitleStyle}>Artifacts</h2>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {ticket.artifactUrls?.output?.[0] && (
                  <a href={ticket.artifactUrls.output[0]} target="_blank" rel="noreferrer" style={artifactStyle}>
                    <Database size={14} /> Output <ExternalLink size={12} />
                  </a>
                )}
                {ticket.artifactUrls?.logs?.[0] && (
                  <a href={ticket.artifactUrls.logs[0]} target="_blank" rel="noreferrer" style={artifactStyle}>
                    <Database size={14} /> Logs <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </section>

            <section style={{ ...cardStyle, marginTop: 12 }}>
              <h2 style={sectionTitleStyle}>Status Timeline</h2>
              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                {timeline.map((item) => (
                  <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 10px', background: item.done ? '#ecfdf5' : '#fff' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.title}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#475569' }}>{item.message}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>{item.at}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function Field({ label, value, mono = false }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 10px', background: '#fff' }}>
      <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700 }}>
        {label}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#0f172a', fontWeight: 600, fontFamily: mono ? 'var(--font-mono)' : 'inherit', wordBreak: 'break-word' }}>
        {value || 'N/A'}
      </p>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid #dce4ee',
  borderRadius: 14,
  padding: 14,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 17,
  fontFamily: 'var(--font-display)',
  color: '#0f172a',
};

const gridStyle: React.CSSProperties = {
  marginTop: 10,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 8,
};

const primaryButtonStyle: React.CSSProperties = {
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  lineHeight: 1,
};

const badgeStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1,
};

const navButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const secondaryButtonStyle: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  lineHeight: 1,
};

const outcomeTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: '#0f172a',
  fontWeight: 700,
};

const outcomeSubStyle: React.CSSProperties = {
  margin: '2px 0 0',
  fontSize: 13,
  color: '#334155',
};

const outcomeGreenStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-start',
  border: '1px solid #bbf7d0',
  background: '#f0fdf4',
  borderRadius: 10,
  padding: 10,
};

const outcomeBlueStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-start',
  border: '1px solid #bfdbfe',
  background: '#eff6ff',
  borderRadius: 10,
  padding: 10,
};

const outcomeGrayStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-start',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  borderRadius: 10,
  padding: 10,
};

const longTextLabelStyle: React.CSSProperties = {
  margin: '10px 0 0',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#64748b',
  fontWeight: 700,
};

const longTextValueStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 13,
  color: '#1f2937',
  lineHeight: 1.6,
};

const artifactStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#1e3a8a',
  border: '1px solid #bfdbfe',
  background: '#eff6ff',
  borderRadius: 999,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 700,
  display: 'inline-flex',
  gap: 6,
  alignItems: 'center',
};
