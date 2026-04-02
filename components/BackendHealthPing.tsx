'use client';

import { useEffect } from 'react';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_JDI_BACKEND_URL ?? 'http://localhost:8000';
const HEALTH_PATH = process.env.NEXT_PUBLIC_BACKEND_HEALTH_PATH ?? '/health';

let hasPingedThisPageLoad = false;

export default function BackendHealthPing() {
  useEffect(() => {
    // React strict mode can run effects twice in dev, so gate duplicate pings.
    if (hasPingedThisPageLoad) {
      return;
    }

    hasPingedThisPageLoad = true;

    const normalizedPath = HEALTH_PATH.startsWith('/') ? HEALTH_PATH : `/${HEALTH_PATH}`;
    const healthUrl = `${BACKEND_BASE_URL}${normalizedPath}`;

    void fetch(healthUrl, {
      method: 'GET',
      cache: 'no-store',
      keepalive: true,
      headers: {
        Accept: 'application/json, text/plain, */*',
      },
    }).catch(() => {
      // Do not interrupt the UI if the backend is unavailable or blocked by CORS.
    });
  }, []);

  return null;
}
