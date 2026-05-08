import { useState, useEffect } from 'react';
import {
  fetchDeputies,
  mapAPIToDeputy,
  deputies as staticDeputies,
} from '../data/deputies';
import type { Deputy } from '../data/deputies';

/**
 * Hook to manage Câmara dos Deputados API data.
 * Handles initial list fetching with graceful fallback to static data
 * when the network/API is unavailable (e.g., sandbox without egress).
 */
export function useCamaraAPI() {
  const [deputiesList, setDeputiesList] = useState<Deputy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const list = await fetchDeputies({ itens: 513 });
        if (cancelled) return;
        const mapped = list.map((d) => mapAPIToDeputy(d, null, [], [], []));
        setDeputiesList(mapped);
      } catch (err) {
        if (cancelled) return;
        // Network or CORS failure — fall back to bundled static data so the
        // UI keeps working in offline / sandboxed environments.
        console.warn(
          '[useCamaraAPI] Falling back to static deputies:',
          err instanceof Error ? err.message : err
        );
        setDeputiesList(staticDeputies);
        setError(err instanceof Error ? err.message : 'Erro ao carregar deputados');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { deputiesList, loading, error };
}
