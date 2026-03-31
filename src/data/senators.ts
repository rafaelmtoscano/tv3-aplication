// src/data/senators.ts
// Dados dos senadores para a aplicação TV Senado

export interface SenatorBiography {
  fullName: string;
  birthDate: string;
  birthplace: string;
  education: string;
}

export interface SenatorProposal {
  id: string;
  author: string;
  summary: string;
  year: number;
  status: 'Em tramitação' | 'Aprovada' | 'Arquivada' | 'Sancionada';
}

export interface Senator {
  id: string;
  apiId?: number;
  name: string;
  displayName: string;
  party: string;
  state: string;
  photo: string;
  biography: SenatorBiography;
  proposals: SenatorProposal[];
}

export const senators: Senator[] = [];

const SENADO_API = 'https://legis.senado.leg.br/dadosabertos';

interface SenatorRaw {
  IdentificacaoParlamentar: {
    CodigoParlamentar: string;
    CodigoPublicoNaLegAtual?: string;
    NomeParlamentar: string;
    NomeCompletoParlamentar?: string;
    FormaTratamento?: string;
    UrlFotoParlamentar?: string;
    SiglaPartidoParlamentar?: string;
    UfParlamentar?: string;
  };
}

export function mapAPIToSenator(raw: SenatorRaw): Senator {
  const ident = raw.IdentificacaoParlamentar;
  const fullName = ident.NomeCompletoParlamentar ?? ident.NomeParlamentar;
  const slug = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return {
    id: `senador-${ident.CodigoParlamentar || ident.CodigoPublicoNaLegAtual || slug}`,
    apiId: Number(ident.CodigoParlamentar) || Number(ident.CodigoPublicoNaLegAtual) || undefined,
    name: ident.NomeParlamentar,
    displayName: `${ident.FormaTratamento?.trim() || 'Senador'} ${ident.NomeParlamentar}`,
    party: ident.SiglaPartidoParlamentar || '',
    state: ident.UfParlamentar || '',
    photo: (ident.UrlFotoParlamentar || '').replace(/^http:/, 'https:'),
    biography: {
      fullName,
      birthDate: '',
      birthplace: '',
      education: '',
    },
    proposals: [],
  };
}

export async function fetchSenators(): Promise<SenatorRaw[]> {
  const res = await fetch(`${SENADO_API}/senador/lista/atual.json`);
  if (!res.ok) throw new Error(`Senado API error: ${res.status}`);
  const json = await res.json();
  const raw = json?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar;
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}
