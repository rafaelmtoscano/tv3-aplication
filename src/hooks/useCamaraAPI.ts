import { useState, useEffect } from 'react';
import {
  fetchDeputies,
  mapAPIToDeputy,
} from '../data/deputies';
import type { Deputy } from '../data/deputies';

/**
 * Hook to manage Câmara dos Deputados API data.
 * Handles initial list fetching.
 */
export function useCamaraAPI() {
  const [deputiesList, setDeputiesList] = useState<Deputy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchDeputies({ itens: 513 });
        // Map initial summaries to Deputy interface
        const mapped = list.map(d => mapAPIToDeputy(d, null, [], [], []));
        setDeputiesList(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar deputados');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { deputiesList, loading, error };
}
