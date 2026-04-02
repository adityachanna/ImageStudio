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

function resolveBackendBaseUrl(): string | null {
  const candidates = [process.env.JDI_BACKEND_URL, process.env.NEXT_PUBLIC_JDI_BACKEND_URL]
    .map((value) => value?.trim())
    .filter((value): value is string => !!value);

  if (candidates.length === 0) {
    // Local default only; production must provide an explicit backend URL.
    return process.env.NODE_ENV === 'production' ? null : 'http://127.0.0.1:8000';
  }

  return candidates[0].replace(/\/$/, '');
}

async function tryFetchRecent(endpoint: string): Promise<{ ok: boolean; payload?: unknown; detail?: string }> {
  try {
    const res = await fetch(endpoint, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    const bodyText = await res.text();
    let payload: unknown = null;

    if (bodyText) {
      try {
        payload = JSON.parse(bodyText) as unknown;
      } catch {
        payload = { raw: bodyText };
      }
    }

    if (!res.ok) {
      const detail = typeof payload === 'object' && payload && 'detail' in (payload as Record<string, unknown>)
        ? String((payload as Record<string, unknown>).detail)
        : `status ${res.status}`;
      return { ok: false, detail };
    }

    return { ok: true, payload };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { ok: false, detail };
  }
}

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

  const backend = resolveBackendBaseUrl();
  if (!backend) {
    return NextResponse.json(
      {
        error: 'Backend URL is not configured. Set JDI_BACKEND_URL (or NEXT_PUBLIC_JDI_BACKEND_URL).',
        records: [],
      },
      { status: 500 }
    );
  }

  const endpoints = [
    `${backend}/api/tickets/recent/list?limit=${limit}`,
    `${backend}/api/tickets/recent/list`,
    `${backend}/api/tickets/recent?limit=${limit}`,
    `${backend}/api/tickets/recent`,
  ];

  try {
    const failures: string[] = [];
    for (const endpoint of endpoints) {
      const result = await tryFetchRecent(endpoint);
      if (!result.ok) {
        failures.push(`${endpoint} -> ${result.detail ?? 'request failed'}`);
        continue;
      }

      const rows = normalizeArray(result.payload);
      const records = mapRecentRows(rows, limit);

      return NextResponse.json({ source: `fastapi:${endpoint}`, records }, { status: 200 });
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch recent requests from FastAPI endpoint.',
        detail: failures.join(' | '),
        records: [],
      },
      { status: 502 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to fetch recent requests from FastAPI endpoint.',
        detail: errorMessage,
        records: [],
      },
      { status: 500 }
    );
  }
}
