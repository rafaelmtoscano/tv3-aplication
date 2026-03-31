// src/types/voting.ts
// Interface compartilhada para hooks de votação (Câmara e Senado)

import type { SessaoAtiva } from '../data/plenario';

export type VotingPhase =
  | 'idle'
  | 'loading'
  | 'intro'
  | 'details'
  | 'question'
  | 'results'
  | 'error';

export interface UseVotingReturn {
  phase: VotingPhase;
  sessao: SessaoAtiva | null;
  userVote: 'sim' | 'nao' | null;
  vote: (choice: 'sim' | 'nao') => void;
  changeVote: () => void;
  dismiss: () => void;
  goToQuestion: () => void;
  goToDetails: () => void;
  goToIntro: () => void;
}
