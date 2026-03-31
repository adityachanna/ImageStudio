import { NextResponse } from 'next/server';
import { getTicketCollectionCandidates } from '@/lib/mongo';

type TicketEnvelope = {
  ticket?: unknown;
  data?: unknown;
  record?: unknown;
  result?: unknown;
  item?: unknown;
};

function normalizePayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;

  const maybeEnvelope = payload as TicketEnvelope;
  return (
    maybeEnvelope.ticket ??
    maybeEnvelope.data ??
    maybeEnvelope.record ??
    maybeEnvelope.result ??
    maybeEnvelope.item ??
    payload
  );
}

async function tryFetchJson(url: string): Promise<{ ok: boolean; payload: unknown | null }> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { ok: false, payload: null };
    const json = (await res.json()) as unknown;
    return { ok: true, payload: json };
  } catch {
    return { ok: false, payload: null };
  }
}

async function tryBackendFallback(requestId: string) {
  const backend = (
    process.env.JDI_BACKEND_URL ??
    process.env.NEXT_PUBLIC_JDI_BACKEND_URL ??
    'http://localhost:8000'
  ).replace(/\/$/, '');

  const candidates = [
    `${backend}/api/tickets/${requestId}`,
    `${backend}/api/tickets/request/${requestId}`,
    `${backend}/api/tickets/by-request/${requestId}`,
    `${backend}/api/tickets/${requestId}/status`,
  ];

  for (const endpoint of candidates) {
    const result = await tryFetchJson(endpoint);
    if (!result.ok) continue;
    return NextResponse.json(
      { source: `backend:${endpoint}`, ticket: normalizePayload(result.payload) },
      { status: 200 }
    );
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;

  if (!requestId?.trim()) {
    return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
  }

  try {
    const collections = await getTicketCollectionCandidates();
    for (const collection of collections) {
      const ticket = await collection.findOne({ requestId });
      if (ticket) {
        return NextResponse.json(
          { source: `mongodb:${collection.dbName}.${collection.collectionName}`, ticket },
          { status: 200 }
        );
      }
    }

    const fallbackResponse = await tryBackendFallback(requestId);
    if (fallbackResponse) return fallbackResponse;

    return NextResponse.json({ error: 'Request status not found yet.' }, { status: 404 });
  } catch (error) {
    const fallbackResponse = await tryBackendFallback(requestId);
    if (fallbackResponse) return fallbackResponse;

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: 'Failed to fetch ticket from MongoDB and backend.',
      detail: errorMessage
    }, { status: 500 });
  }
}
