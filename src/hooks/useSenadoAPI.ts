import { useEffect, useState } from 'react';
import { fetchSenators, mapAPIToSenator } from '../data/senators';
import type { Senator } from '../data/senators';

export function useSenadoAPI() {
  const [senatorsList, setSenatorsList] = useState<Senator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchSenators();
        const mapped = list.map(mapAPIToSenator).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        setSenatorsList(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar senadores');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { senatorsList, loading, error };
}
