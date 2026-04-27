// TODO: substituir por chamada à API /votacoes/{id}/votos
export interface DeputyVote {
  id: string;
  name: string;
  party: string;
  state: string;
  photo: string;
  vote: 'sim' | 'nao' | 'abstencao';
}

export interface VotingResult {
  title: string;
  sim: number;
  nao: number;
  abstencao: number;
  deputies: DeputyVote[];
  createdAt?: string; // ISO 8601
}

export const mockVotingResult: VotingResult = {
  title: 'Votação em andamento',
  sim: 5,
  nao: 5,
  abstencao: 5,
  deputies: Array.from({ length: 12 }, (_, i) => ({
    id: `dep-${i}`,
    name: 'Arthur Lira',
    party: 'PSDB',
    state: 'RN',
    photo: 'https://www.camara.leg.br/internet/deputado/bandep/204554.jpg',
    vote: i % 3 === 0 ? 'sim' : i % 3 === 1 ? 'nao' : 'abstencao',
  })),
};
