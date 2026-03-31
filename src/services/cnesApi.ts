// Serviço de integração com CNES/DATASUS e IBGE
// Documentação CNES: https://apidadosabertos.saude.gov.br/v1/#/
// Documentação IBGE: https://servicodados.ibge.gov.br/api/docs/localidades

import type { Pharmacy } from '../data/pharmacies';

// ── Tipos da resposta CNES ────────────────────────────────────────────────

interface CnesAuthResponse {
  access_token: string;
  token_type: string;
}

interface CnesEstabelecimento {
  co_cnes: string;
  no_fantasia: string;
  no_logradouro: string;
  nu_endereco: string;
  no_bairro: string;
  no_municipio: string;
  co_estado_gestor: string;
  nu_cep: string;
  nu_telefone?: string;
  nu_latitude?: string;
  nu_longitude?: string;
  // tp_unidade: '70' = Farmácia, '72' = Farmácia Popular Própria
  tp_unidade: string;
}

interface CnesResponse {
  total: number;
  estabelecimentos: CnesEstabelecimento[];
}

interface IbgeMunicipio {
  id: number;
  nome: string;
  microrregiao: { mesorregiao: { UF: { sigla: string } } };
}

// ── Constantes ────────────────────────────────────────────────────────────

const CNES_BASE = 'https://apidadosabertos.saude.gov.br';
const IBGE_BASE = 'https://servicodados.ibge.gov.br/api/v1';

// Credencial pública do DATASUS — não é segredo, está na documentação oficial
// TODO: mover para variável de ambiente se a política mudar
const CNES_USERNAME = 'dados.abertos';
const CNES_PASSWORD = 'dados.abertos';

// Tipos de unidade CNES que representam farmácias do Farmácia Popular
// 70 = Farmácia, 72 = Farmácia Popular (Rede Própria)
const PHARMACY_UNIT_TYPES = ['70', '72'];

// ── Auth ──────────────────────────────────────────────────────────────────

// Token em memória — evita auth a cada chamada durante a sessão
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }

  const res = await fetch(`${CNES_BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: CNES_USERNAME, password: CNES_PASSWORD }),
  });

  if (!res.ok) {
    throw new Error(`CNES auth falhou: ${res.status}`);
  }

  const data: CnesAuthResponse = await res.json();

  // Token expira em 50min (margem de 10min para o padrão JWT de 1h)
  cachedToken = { value: data.access_token, expiresAt: now + 50 * 60 * 1000 };
  return data.access_token;
}

// ── IBGE — código do município ────────────────────────────────────────────

// TODO: adicionar cache em sessionStorage para evitar chamada repetida
export async function getCodigoIbge(city: string, state: string): Promise<number | null> {
  const res = await fetch(
    `${IBGE_BASE}/localidades/estados/${state}/municipios`,
    { headers: { Accept: 'application/json' } }
  );

  if (!res.ok) return null;

  const municipios: IbgeMunicipio[] = await res.json();

  // Normaliza para comparação — remove acentos e caixa
  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const match = municipios.find((m) => normalize(m.nome) === normalize(city));
  return match?.id ?? null;
}

// ── CNES — farmácias por município ────────────────────────────────────────

function mapCnesParaPharmacy(est: CnesEstabelecimento): Pharmacy | null {
  const lat = est.nu_latitude ? parseFloat(est.nu_latitude) : null;
  const lon = est.nu_longitude ? parseFloat(est.nu_longitude) : null;

  // Descarta estabelecimentos sem coordenadas — não aparecem no mapa
  if (!lat || !lon || lat === 0 || lon === 0) return null;

  const uf = est.co_estado_gestor ?? '';
  const cep = est.nu_cep
    ? `${est.nu_cep.slice(0, 5)}-${est.nu_cep.slice(5)}`
    : '';

  const address = [est.no_logradouro, est.nu_endereco].filter(Boolean).join(', ');

  return {
    id: est.co_cnes,
    cnes: est.co_cnes,
    name: est.no_fantasia || `Farmácia CNES ${est.co_cnes}`,
    address,
    neighborhood: est.no_bairro ?? '',
    city: est.no_municipio ?? '',
    state: uf,
    cep,
    phone: est.nu_telefone ?? undefined,
    // CNES não retorna horários por estabelecimento — mantém array vazio
    // TODO: enriquecer com Google Places API se disponível
    horarios: [],
    // CNES não retorna status em tempo real — assume Aberto como padrão
    // TODO: integrar com horários reais quando disponível
    status: 'Aberto' as const,
    tipo: est.tp_unidade === '72' ? 'Rede Própria' : 'Credenciada',
    latitude: lat,
    longitude: lon,
  };
}

// ── Função principal ──────────────────────────────────────────────────────

export interface FetchPharmaciesOptions {
  city: string;
  state: string;
  limit?: number;
}

export async function fetchPharmaciesByCity(
  options: FetchPharmaciesOptions
): Promise<Pharmacy[]> {
  const { city, state, limit = 20 } = options;

  // 1. Busca código IBGE do município
  const codigoIbge = await getCodigoIbge(city, state);
  if (!codigoIbge) {
    throw new Error(`Município não encontrado: ${city}/${state}`);
  }

  // 2. Obtém token de autenticação
  const token = await getAuthToken();

  // 3. Busca estabelecimentos do tipo farmácia no município
  // A API suporta filtro por tp_unidade mas pode variar — buscamos ambos os tipos
  const results = await Promise.all(
    PHARMACY_UNIT_TYPES.map((tipo) =>
      fetch(
        `${CNES_BASE}/cnes/estabelecimentos?co_municipio_gestor=${codigoIbge}&tp_unidade=${tipo}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      )
        .then((r) => (r.ok ? (r.json() as Promise<CnesResponse>) : null))
        .catch(() => null)
    )
  );

  // 4. Consolida, mapeia e filtra nulos
  const all = results
    .filter(Boolean)
    .flatMap((r) => r!.estabelecimentos ?? [])
    .map(mapCnesParaPharmacy)
    .filter((p): p is Pharmacy => p !== null);

  // Remove duplicatas por CNES
  const seen = new Set<string>();
  return all.filter((p) => {
    if (seen.has(p.cnes)) return false;
    seen.add(p.cnes);
    return true;
  });
}
