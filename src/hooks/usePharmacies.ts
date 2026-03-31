// Hook que orquestra a busca de farmácias:
// 1. Usa localização detectada (IP ou CEP)
// 2. Chama a API CNES em produção
// 3. Faz fallback para mockPharmacies em desenvolvimento ou em caso de erro
// 4. Expõe estado de loading e erro para a UI

import { useEffect, useRef, useState } from 'react';
import { mockPharmacies, type Pharmacy } from '../data/pharmacies';
import { fetchPharmaciesByCity } from '../services/cnesApi';
import type { PharmacyLocation } from './usePharmacyLocation';

export interface UsePharmaciesResult {
  pharmacies: Pharmacy[];
  loading: boolean;
  error: string | null;
  // true quando dados vêm dos mocks (dev/fallback), false quando são da API real
  isMockData: boolean;
}

// Em desenvolvimento (localhost), usa mocks por padrão para evitar
// dependência da API CNES durante o build e hot reload
const IS_DEV = import.meta.env.DEV;

export function usePharmacies(location: PharmacyLocation | null): UsePharmaciesResult {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(mockPharmacies);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(true);

  // useRef para evitar race condition em chamadas consecutivas
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!location) return;

    // Em desenvolvimento, não faz chamada real — mantém mocks
    if (IS_DEV) {
      // TODO: remover esta guarda quando quiser testar a API real em desenvolvimento
      // Basta comentar o bloco abaixo
      setPharmacies(mockPharmacies);
      setIsMockData(true);
      return;
    }

    // Cancela chamada anterior se location mudar rapidamente
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    fetchPharmaciesByCity({ city: location.city, state: location.state })
      .then((data) => {
        if (data.length === 0) {
          // API retornou vazio — mantém mocks com aviso
          setPharmacies(mockPharmacies);
          setIsMockData(true);
          setError(`Nenhuma farmácia encontrada via CNES para ${location.city}/${location.state}. Exibindo dados de exemplo.`);
        } else {
          setPharmacies(data);
          setIsMockData(false);
          setError(null);
        }
      })
      .catch((err: Error) => {
        // Fallback silencioso para mocks — UI não quebra
        setPharmacies(mockPharmacies);
        setIsMockData(true);
        setError(`Dados de exemplo (API indisponível: ${err.message})`);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      abortRef.current?.abort();
    };
  }, [location?.city, location?.state]);

  return { pharmacies, loading, error, isMockData };
}
