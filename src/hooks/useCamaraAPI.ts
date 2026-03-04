import { useState, useEffect } from 'react';
import { 
  deputies as staticDeputies, 
  fetchDeputies, 
  fetchDeputyDetail, 
  fetchDeputyProposals, 
  fetchDeputySpeeches, 
  fetchDeputyAgenda, 
  mapAPIToDeputy, 
  getDeputyById,
  Deputy,
  DeputyAPI
} from '../data/deputies';

/**
 * Hook to manage Câmara dos Deputados API data.
 * Handles initial list fetching and full data retrieval on selection.
 */
export function useCamaraAPI() {
  const [deputiesList, setDeputiesList] = useState<Deputy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchDeputies({ itens: 12 });
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

  /**
   * Fetches full data for a selected deputy and registers it in the global cache.
   * This ensures DeputyDetail.tsx can find the data via getDeputyById.
   */
  const selectDeputyData = async (summary: Deputy): Promise<string> => {
    if (!summary.apiId) return summary.id;

    try {
      const [detail, proposals, speeches, agenda] = await Promise.all([
        fetchDeputyDetail(summary.apiId),
        fetchDeputyProposals(summary.apiId),
        fetchDeputySpeeches(summary.apiId),
        fetchDeputyAgenda(summary.apiId)
      ]);

      const apiSummary: DeputyAPI = {
        id: summary.apiId,
        nome: summary.name,
        siglaPartido: summary.party,
        siglaUf: summary.state,
        urlFoto: summary.photo,
        email: ''
      };

      const full = mapAPIToDeputy(apiSummary, detail, proposals, speeches, agenda);
      
      // Update the global static list so getDeputyById(full.id) works in DeputyDetail.tsx
      const existingIdx = staticDeputies.findIndex(d => d.id === full.id);
      if (existingIdx !== -1) {
        staticDeputies[existingIdx] = full;
      } else {
        staticDeputies.push(full);
      }

      return full.id;
    } catch (err) {
      console.error('Error fetching full deputy details:', err);
      // Return the summary id anyway, but the detail page might be sparse
      return summary.id;
    }
  };

  return { deputiesList, loading, error, selectDeputyData };
}
