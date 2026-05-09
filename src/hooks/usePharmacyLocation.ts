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

      const fallback: PharmacyLocation = { ...DEFAULT_LOCATION, cep: normalizedCep || DEFAULT_LOCATION.cep };

      // In development / sandboxed preview, external geo-IP services are blocked.
      // Skip network calls and use the default location directly.
      if (import.meta.env.DEV) {
        if (!cancelled) {
          setLocation(fallback);
          setLoading(false);
        }
        return;
      }

      try {
        let nextLocation = { ...fallback };

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          try {
            const ipResponse = await fetch('https://ipapi.co/json/', { signal: controller.signal });
            clearTimeout(timeout);
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
            clearTimeout(timeout);
            // IP lookup failed silently — use default location
          }
        } catch {
          // Outer catch for safety
        }

        if (cancelled) return;

        if (normalizedCep) {
          try {
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
          } catch {
            // CEP lookup failed silently
          }
        }

        if (!cancelled) {
          setLocation(nextLocation);
        }
      } catch {
        if (!cancelled) {
          setLocation(fallback);
          setError('Não foi possível obter a localização');
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
