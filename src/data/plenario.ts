// src/data/plenario.ts
// Dados e funções para integração com a API de plenárias da Câmara dos Deputados
// TODO: substituir mocks por chamadas à API quando em produção

const API_BASE = 'https://dadosabertos.camara.leg.br/api/v2';

// ─────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────

export interface PlenarioEvento {
  id: number;
  dataHoraInicio: string;        // ISO 8601
  dataHoraFim: string | null;
  situacao: string;              // 'Iniciado' | 'Encerrado' | 'Convocado' | etc.
  descricao: string | null;
  localExterno: string | null;
  uri: string;
}

export interface PautaItem {
  ordem: number;
  regime: string;
  titulo: string;                // ex: "PL 1234/2024"
  ementa: string;                // descrição completa
  situacaoItem: string;          // 'Votada' | 'Retirada' | 'Pendente' | etc.
  proposicao_: {
    id: number | null;
    siglaTipo: string;
    numero: string;
    ano: number;
    uri: string | null;
  } | null;
}

export interface Votacao {
  id: string;
  uri: string;
  data: string;                  // 'YYYY-MM-DD'
  dataHoraRegistro: string;      // ISO 8601
  siglaOrgao: string;
  descricao: string;             // ementa resumida — usar como pergunta
  aprovacao: number | null;      // 1 = aprovado, 0 = rejeitado, null = em andamento
  placar: {
    sim: number;
    nao: number;
    abstencao: number;
  } | null;
}

export interface SessaoAtiva {
  eventId: number;
  descricao: string;
  situacao: string;
  votacaoAtiva: Votacao | null;
  pauta: PautaItem[];
}

// ─────────────────────────────────────────────
// FUNÇÕES DA API
// ─────────────────────────────────────────────

/**
 * Busca eventos do tipo Sessão Deliberativa para hoje.
 * Retorna o primeiro evento com situacao === 'Iniciado', ou null.
 */
export async function fetchSessaoAtiva(): Promise<PlenarioEvento | null> {
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  const url =
    `${API_BASE}/eventos` +
    `?tipoEvento=Sess%C3%A3o%20Deliberativa` +
    `&dataInicio=${today}` +
    `&dataFim=${today}` +
    `&ordem=DESC` +
    `&orderBy=dataHoraInicio` +
    `&itens=5`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar eventos: ${res.status}`);
  const json = await res.json();
  const eventos: PlenarioEvento[] = json.dados ?? [];

  return eventos.find(e => e.situacao === 'Iniciado') ?? null;
}

/**
 * Busca a pauta de um evento específico.
 */
export async function fetchPautaEvento(eventId: number): Promise<PautaItem[]> {
  const url = `${API_BASE}/eventos/${eventId}/pauta`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar pauta: ${res.status}`);
  const json = await res.json();
  return json.dados ?? [];
}

/**
 * Busca a votação mais recente de um evento.
 * Prioriza votações em andamento (aprovacao === null).
 * Retorna null se não houver votações.
 */
export async function fetchVotacaoAtiva(eventId: number): Promise<Votacao | null> {
  const url =
    `${API_BASE}/votacoes` +
    `?idEvento=${eventId}` +
    `&ordem=DESC` +
    `&orderBy=dataHoraRegistro` +
    `&itens=5`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar votações: ${res.status}`);
  const json = await res.json();
  const votacoes: Votacao[] = json.dados ?? [];

  if (!votacoes.length) return null;

  // Prioriza votação em andamento
  const emAndamento = votacoes.find(v => v.aprovacao === null);
  return emAndamento ?? votacoes[0];
}

/**
 * Orquestra as três chamadas e retorna o estado completo da sessão.
 * Usa Promise.allSettled para resiliência — falha parcial não quebra o overlay.
 */
export async function fetchSessaoCompleta(): Promise<SessaoAtiva | null> {
  const evento = await fetchSessaoAtiva();
  if (!evento) return null;

  const [pautaResult, votacaoResult] = await Promise.allSettled([
    fetchPautaEvento(evento.id),
    fetchVotacaoAtiva(evento.id),
  ]);

  return {
    eventId: evento.id,
    descricao: evento.descricao ?? 'Sessão Deliberativa',
    situacao: evento.situacao,
    pauta: pautaResult.status === 'fulfilled' ? pautaResult.value : [],
    votacaoAtiva: votacaoResult.status === 'fulfilled' ? votacaoResult.value : null,
  };
}

// ─────────────────────────────────────────────
// STORAGE — votos do usuário (localStorage)
// ─────────────────────────────────────────────

const STORAGE_KEY = 'tv3:social-votes';

export interface VotoSocial {
  votacaoId: string;
  userVote: 'sim' | 'nao';
  timestamp: number;
  eventId: number;
}

export function getSavedVote(votacaoId: string): VotoSocial | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const votes: VotoSocial[] = JSON.parse(raw);
    return votes.find(v => v.votacaoId === votacaoId) ?? null;
  } catch {
    return null;
  }
}

export function saveVote(vote: VotoSocial): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const votes: VotoSocial[] = raw ? JSON.parse(raw) : [];
    const idx = votes.findIndex(v => v.votacaoId === vote.votacaoId);
    if (idx !== -1) {
      votes[idx] = vote; // substitui voto existente
    } else {
      votes.push(vote);
    }
    // Mantém apenas os últimos 50 votos para não inflar o storage
    const trimmed = votes.slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // silencia erros de storage (modo privado, quota, etc.)
  }
}

export function removeVote(votacaoId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const votes: VotoSocial[] = JSON.parse(raw);
    const filtered = votes.filter(v => v.votacaoId !== votacaoId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // silencia erros de storage
  }
}
