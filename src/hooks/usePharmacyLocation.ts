import { useEffect, useMemo, useState } from 'react';

export interface PharmacyLocation {
  city: string;
  state: string;
  cep: string;
  latitude: number;
  longitude: number;
}

export interface UsePharmacyLocationResult {
  location: PharmacyLocation | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_LOCATION: PharmacyLocation = {
  city: 'João Pessoa',
  state: 'PB',
  cep: '58039-000',
  latitude: -7.1195,
  longitude: -34.845,
};

export function usePharmacyLocation(cep?: string): UsePharmacyLocationResult {
  const [location, setLocation] = useState<PharmacyLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedCep = useMemo(() => cep?.replace(/\D/g, '') ?? '', [cep]);

  useEffect(() => {
    let cancelled = false;

    const resolveLocation = async () => {
      setLoading(true);
      setError(null);

      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        if (!ipResponse.ok) {
          throw new Error('Falha ao consultar localização por IP');
        }

        const ipData = await ipResponse.json();
        let nextLocation: PharmacyLocation = {
          city: ipData.city || DEFAULT_LOCATION.city,
          state: ipData.region_code || ipData.region || DEFAULT_LOCATION.state,
          cep: ipData.postal || normalizedCep || DEFAULT_LOCATION.cep,
          latitude: typeof ipData.latitude === 'number' ? ipData.latitude : DEFAULT_LOCATION.latitude,
          longitude: typeof ipData.longitude === 'number' ? ipData.longitude : DEFAULT_LOCATION.longitude,
        };

        if (normalizedCep) {
          const cepResponse = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`);
          if (cepResponse.ok) {
            const cepData = await cepResponse.json();
            if (!cepData.erro) {
              nextLocation = {
                ...nextLocation,
                city: cepData.localidade || nextLocation.city,
                state: cepData.uf || nextLocation.state,
                cep: cepData.cep || nextLocation.cep,
              };
            }
          }
        }

        if (!cancelled) {
          setLocation(nextLocation);
        }
      } catch (err) {
        if (!cancelled) {
          setLocation({ ...DEFAULT_LOCATION, cep: normalizedCep || DEFAULT_LOCATION.cep });
          setError(err instanceof Error ? err.message : 'Não foi possível obter a localização');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void resolveLocation();

    return () => {
      cancelled = true;
    };
  }, [normalizedCep]);

  return { location, loading, error };
}
