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
    const controller = new AbortController();
    const { signal } = controller;

    const resolveLocation = async () => {
      setLoading(true);
      setError(null);

      try {
        let nextLocation: PharmacyLocation = { ...DEFAULT_LOCATION, cep: normalizedCep || DEFAULT_LOCATION.cep };

        try {
          const ipResponse = await fetch('https://ipapi.co/json/', { signal });
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            nextLocation = {
              city: ipData.city || DEFAULT_LOCATION.city,
              state: ipData.region_code || ipData.region || DEFAULT_LOCATION.state,
              cep: ipData.postal || normalizedCep || DEFAULT_LOCATION.cep,
              latitude: typeof ipData.latitude === 'number' ? ipData.latitude : DEFAULT_LOCATION.latitude,
              longitude: typeof ipData.longitude === 'number' ? ipData.longitude : DEFAULT_LOCATION.longitude,
            };
          }
        } catch {
          // IP lookup failed silently — use default location
        }

        if (signal.aborted) return;

        if (normalizedCep) {
          try {
            const cepResponse = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`, { signal });
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
          } catch {
            // CEP lookup failed silently — keep current nextLocation
          }
        }

        if (!signal.aborted) {
          setLocation(nextLocation);
        }
      } catch {
        if (!signal.aborted) {
          setLocation({ ...DEFAULT_LOCATION, cep: normalizedCep || DEFAULT_LOCATION.cep });
          setError('Não foi possível obter a localização');
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    void resolveLocation();

    return () => {
      controller.abort();
    };
  }, [normalizedCep]);

  return { location, loading, error };
}
