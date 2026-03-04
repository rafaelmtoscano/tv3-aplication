import { useState, useEffect, useRef } from 'react';
import {
  deputies as mockDeputies,
  fetchDeputies,
  fetchDeputyDetail,
  fetchDeputyProposals,
  fetchDeputySpeeches,
  fetchDeputyAgenda,
  mapAPIToDeputy,
} from '../data/deputies';
import type { Deputy } from '../data/deputies';

interface UseDeputiesState {
  deputies: Deputy[];
  loading: boolean;
  error: string | null;
}

export function useDeputies(itens = 6): UseDeputiesState {
  const [state, setState] = useState<UseDeputiesState>({
    deputies: mockDeputies, // exibe mock imediatamente, sem flash
    loading: true,
    error: null,
  });
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function load() {
      try {
        const list = await fetchDeputies({ itens });

        const full = await Promise.all(
          list.map(async (dep) => {
            const [detail, proposals, speeches, agenda] = await Promise.allSettled([
              fetchDeputyDetail(dep.id),
              fetchDeputyProposals(dep.id),
              fetchDeputySpeeches(dep.id),
              fetchDeputyAgenda(dep.id),
            ]);
            return mapAPIToDeputy(
              dep,
              detail.status === 'fulfilled' ? detail.value : null,
              proposals.status === 'fulfilled' ? proposals.value : [],
              speeches.status === 'fulfilled' ? speeches.value : [],
              agenda.status === 'fulfilled' ? agenda.value : []
            );
          })
        );

        if (!cancelledRef.current) {
          setState({ deputies: full, loading: false, error: null });
        }
      } catch (err) {
        // API falhou: mantém mock, não quebra a UI
        if (!cancelledRef.current) {
          setState({ deputies: mockDeputies, loading: false, error: String(err) });
        }
      }
    }

    load();
    return () => { cancelledRef.current = true; };
  }, [itens]);

  return state;
}
