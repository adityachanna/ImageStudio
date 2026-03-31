import { NextResponse } from 'next/server';

type AnyObject = Record<string, unknown>;

type RecentTicket = {
  requestId: string;
  createdAt: string;
  requestType?: string;
  reviewType?: string;
  status?: string;
  currentStep?: string;
};

function readDate(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const maybeDate = (value as { $date?: unknown }).$date;
    if (typeof maybeDate === 'string') return maybeDate;
  }
  return '';
}

function normalizeArray(payload: unknown): AnyObject[] {
  if (Array.isArray(payload)) return payload.filter((x): x is AnyObject => !!x && typeof x === 'object');
  if (!payload || typeof payload !== 'object') return [];

  const root = payload as AnyObject;
  const candidates = [root.records, root.tickets, root.items, root.data, root.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((x): x is AnyObject => !!x && typeof x === 'object');
    }
  }
  return [];
}

function mapRecentRows(rows: AnyObject[], limit: number): RecentTicket[] {
  return rows
    .map((item) => ({
      requestId: typeof item.requestId === 'string' ? item.requestId : '',
      requestType: typeof item.requestType === 'string' ? item.requestType : undefined,
      reviewType: typeof item.reviewType === 'string' ? item.reviewType : undefined,
      status: typeof item.status === 'string' ? item.status : undefined,
      currentStep: typeof item.currentStep === 'string' ? item.currentStep : undefined,
      createdAt:
        readDate(item.createdAt) ||
        readDate(item.updatedAt) ||
        readDate(item.submittedAt) ||
        readDate((item as { intake?: { submittedAt?: unknown } }).intake?.submittedAt),
    }))
    .filter((x) => x.requestId)
    .slice(0, limit);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get('limit') ?? '5');
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(20, rawLimit)) : 5;

  const backend = (
    process.env.JDI_BACKEND_URL ??
    process.env.NEXT_PUBLIC_JDI_BACKEND_URL ??
    'http://127.0.0.1:8000'
  ).replace(/\/$/, '');
  const endpoint = `${backend}/api/tickets/recent/list`;

  try {
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: `FastAPI recent endpoint failed with status ${res.status}.`, records: [] },
        { status: res.status }
      );
    }

    const payload = (await res.json()) as unknown;
    const rows = normalizeArray(payload);
    const records = mapRecentRows(rows, limit);

    return NextResponse.json({ source: `fastapi:${endpoint}`, records }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      error: 'Failed to fetch recent requests from FastAPI endpoint.',
      detail: errorMessage,
      records: []
    }, { status: 500 });
  }
}
