// src/data/senado.ts
// Dados e funções para integração com a API de plenárias do Senado Federal
// Espelho de src/data/plenario.ts — adaptado para a API do Senado
// TODO: substituir mocks por chamadas à API quando em produção

import type { SessaoAtiva, Votacao, PautaItem } from './plenario';

const API_BASE = 'https://legis.senado.leg.br/dadosabertos';
const FORCE_VOTING = import.meta.env.VITE_FORCE_SENADO_VOTING === 'true';

// ─────────────────────────────────────────────
// INTERFACES INTERNAS
// ─────────────────────────────────────────────

interface SenadoSessaoRaw {
  codigo: string;
  data: string;
  tipo: string;
  situacao: string;
  descricao: string | null;
}

// ─────────────────────────────────────────────
// FUNÇÕES DA API
// ─────────────────────────────────────────────

function getToday(): string {
  return new Date().toISOString().split('T')[0].replace(/-/g, '');
}

async function fetchSessaoAtivaSenado(): Promise<SenadoSessaoRaw | null> {
  if (FORCE_VOTING) {
    return {
      codigo: 'DEMO-001',
      data: getToday(),
      tipo: 'Deliberativa Ordinária',
      situacao: 'Em andamento',
      descricao: 'Sessão Deliberativa Ordinária — Demo',
    };
  }

  const today = getToday();
  const url = `${API_BASE}/plenario/lista/votacao/${today}/${today}.json`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();

    const sessoes = json?.VotacaoPlenarioLista?.Plenario?.Sessoes?.Sessao;
    if (!sessoes) return null;

    const lista = Array.isArray(sessoes) ? sessoes : [sessoes];
    const ativa = lista.find((s: any) =>
      s.SituacaoSessao === 'Em andamento' ||
      s.SituacaoSessao === 'Aberta' ||
      s.Votacoes?.Votacao
    );

    if (!ativa) return null;

    return {
      codigo: ativa.CodigoSessao ?? '',
      data: ativa.DataSessao ?? today,
      tipo: ativa.TipoSessao ?? '',
      situacao: ativa.SituacaoSessao ?? '',
      descricao: ativa.DescricaoSessao ?? null,
    };
  } catch {
    return null;
  }
}

async function fetchVotacaoAtivaSenado(
  sessaoCodigo: string
): Promise<Votacao | null> {
  if (FORCE_VOTING) {
    return {
      id: 'VOT-SENADO-DEMO-001',
      uri: '',
      data: new Date().toISOString().split('T')[0],
      dataHoraRegistro: new Date().toISOString(),
      siglaOrgao: 'PLEN-SENADO',
      descricao: 'PL 1234/2024 — Regulamentação de Inteligência Artificial no Serviço Público',
      aprovacao: null,
      placar: { sim: 42, nao: 18, abstencao: 5 },
    };
  }

  const url = `${API_BASE}/plenario/votacao/votacao/${sessaoCodigo}.json`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();

    const votacoes = json?.VotacaoPlenario?.Plenario?.SessoesPlenario
      ?.SessaoPlenaria?.VotacoesNominais?.VotacaoNominal;

    if (!votacoes) return null;

    const lista = Array.isArray(votacoes) ? votacoes : [votacoes];
    const ultima = lista[lista.length - 1];

    const sim = parseInt(ultima?.TotaisVotos?.TotalVotosSim ?? '0');
    const nao = parseInt(ultima?.TotaisVotos?.TotalVotosNao ?? '0');
    const abs = parseInt(ultima?.TotaisVotos?.TotalAbstencoes ?? '0');

    return {
      id: ultima?.CodigoVotacao ?? '',
      uri: '',
      data: ultima?.DataVotacao ?? new Date().toISOString().split('T')[0],
      dataHoraRegistro: new Date().toISOString(),
      siglaOrgao: 'PLEN-SENADO',
      descricao: ultima?.DescricaoVotacao ?? '',
      aprovacao: null,
      placar: { sim, nao, abstencao: abs },
    };
  } catch {
    return null;
  }
}

/**
 * Busca sessão completa do Senado com votação ativa.
 * Mapeia os dados para a shape SessaoAtiva da Câmara para compatibilidade
 * com o VotingOverlay existente.
 */
export async function fetchSessaoCompletaSenado(): Promise<SessaoAtiva | null> {
  const sessao = await fetchSessaoAtivaSenado();
  if (!sessao) return null;

  const votacao = await fetchVotacaoAtivaSenado(sessao.codigo);

  return {
    eventId: parseInt(sessao.codigo) || 0,
    descricao: sessao.descricao ?? sessao.tipo,
    situacao: sessao.situacao,
    votacaoAtiva: votacao,
    pauta: [],
  };
}

// ─────────────────────────────────────────────
// VOTO SOCIAL (localStorage — chave separada da Câmara)
// ─────────────────────────────────────────────

export interface VotoSocialSenado {
  votacaoId: string;
  userVote: 'sim' | 'nao';
  timestamp: number;
}

const SENADO_STORAGE_KEY = 'tv3:senado-social-votes';

export function getSavedVoteSenado(votacaoId: string): VotoSocialSenado | null {
  try {
    const raw = localStorage.getItem(SENADO_STORAGE_KEY);
    if (!raw) return null;
    const votes: VotoSocialSenado[] = JSON.parse(raw);
    return votes.find(v => v.votacaoId === votacaoId) ?? null;
  } catch {
    return null;
  }
}

export function saveVoteSenado(vote: VotoSocialSenado): void {
  try {
    const raw = localStorage.getItem(SENADO_STORAGE_KEY);
    const votes: VotoSocialSenado[] = raw ? JSON.parse(raw) : [];
    const idx = votes.findIndex(v => v.votacaoId === vote.votacaoId);
    if (idx !== -1) {
      votes[idx] = vote;
    } else {
      votes.push(vote);
    }
    const trimmed = votes.slice(-50);
    localStorage.setItem(SENADO_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function removeVoteSenado(votacaoId: string): void {
  try {
    const raw = localStorage.getItem(SENADO_STORAGE_KEY);
    if (!raw) return;
    const votes: VotoSocialSenado[] = JSON.parse(raw);
    const filtered = votes.filter(v => v.votacaoId !== votacaoId);
    localStorage.setItem(SENADO_STORAGE_KEY, JSON.stringify(filtered));
  } catch {}
}
