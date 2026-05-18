import { useEffect, useState } from 'react';
import { BRAZILIAN_STATES } from '../data/settings';

export type UserLocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; uf: string; nome: string }
  | { status: 'error' };

const CACHE_KEY = 'tv3:location:cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
const FETCH_TIMEOUT_MS = 3000;

interface CachedLocation {
  uf: string;
  nome: string;
  ts: number;
}

function readCache(): CachedLocation | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedLocation;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(uf: string, nome: string) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ uf, nome, ts: Date.now() }));
  } catch {
    /* ignore */
  }
}

function ufNome(uf: string): string | null {
  return BRAZILIAN_STATES.find((s) => s.uf === uf)?.name ?? null;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function tryIpapi(): Promise<{ uf: string; nome: string } | null> {
  try {
    const res = await fetchWithTimeout('https://ipapi.co/json/', FETCH_TIMEOUT_MS);
    if (!res || !res.ok) return null;
    const data = await res.json();
    if (data?.country_code !== 'BR') return null;
    const region: string | undefined = data?.region_code; // ex.: "PB" ou "BR-PB"
    const uf = region?.replace(/^BR-/, '');
    if (!uf || uf.length !== 2) return null;
    const nome = ufNome(uf);
    if (!nome) return null;
    return { uf, nome };
  } catch {
    return null;
  }
}

async function tryIpinfo(): Promise<{ uf: string; nome: string } | null> {
  try {
    const res = await fetchWithTimeout('https://ipinfo.io/json', FETCH_TIMEOUT_MS);
    if (!res || !res.ok) return null;
    const data = await res.json();
    if (data?.country !== 'BR') return null;
    const uf: string | undefined = data?.region && typeof data.region === 'string'
      ? BRAZILIAN_STATES.find((s) => s.name.toLowerCase() === String(data.region).toLowerCase())?.uf
      : undefined;
    if (!uf) return null;
    const nome = ufNome(uf);
    if (!nome) return null;
    return { uf, nome };
  } catch {
    return null;
  }
}

export function useUserLocation(): UserLocationState {
  const [state, setState] = useState<UserLocationState>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;

    const cached = readCache();
    if (cached) {
      setState({ status: 'success', uf: cached.uf, nome: cached.nome });
      return;
    }

    setState({ status: 'loading' });

    (async () => {
      const result = (await tryIpapi()) ?? (await tryIpinfo());
      if (cancelled) return;
      if (result) {
        writeCache(result.uf, result.nome);
        setState({ status: 'success', uf: result.uf, nome: result.nome });
      } else {
        setState({ status: 'error' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
