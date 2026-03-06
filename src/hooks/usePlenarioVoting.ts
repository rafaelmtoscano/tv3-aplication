// src/hooks/usePlenarioVoting.ts
// Hook que detecta sessão plenária ativa, faz polling e gerencia o voto social do usuário.

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchSessaoCompleta,
  getSavedVote,
  saveVote,
  removeVote,
} from '../data/plenario';
import type { SessaoAtiva, VotoSocial } from '../data/plenario';
import { getCurrentProgram, tvCamaraSchedule } from '../data/schedule';

const POLLING_INTERVAL = 60_000;
const INITIAL_DELAY = 5_000;

export type VotingPhase =
  | 'idle'
  | 'loading'
  | 'question'
  | 'results'
  | 'error';

export interface UsePlenarioVotingReturn {
  phase: VotingPhase;
  sessao: SessaoAtiva | null;
  userVote: 'sim' | 'nao' | null;
  vote: (choice: 'sim' | 'nao') => void;
  changeVote: () => void;
  dismiss: () => void;
  canDismiss: boolean;
}

export function usePlenarioVoting(isActive: boolean): UsePlenarioVotingReturn {
  const [phase, setPhase] = useState<VotingPhase>('idle');
  const [sessao, setSessao] = useState<SessaoAtiva | null>(null);
  const [userVote, setUserVote] = useState<'sim' | 'nao' | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const isPlenariaNoSchedule = useCallback((): boolean => {
    const current = getCurrentProgram(tvCamaraSchedule);
    if (!current) return false;
    const title = current.title.toLowerCase();
    return (
      (title.includes('sessão deliberativa') || title.includes('sessão plenária')) &&
      (current.isLive === true)
    );
  }, []);

  const fetchAndUpdate = useCallback(async () => {
    if (!isMountedRef.current) return;

    if (!isPlenariaNoSchedule()) {
      if (isMountedRef.current) {
        setPhase('idle');
        setSessao(null);
      }
      return;
    }

    if (isMountedRef.current) setPhase('loading');

    try {
      const data = await fetchSessaoCompleta();
      if (!isMountedRef.current) return;

      if (!data) {
        setPhase('idle');
        setSessao(null);
        return;
      }

      setSessao(data);

      const votacaoId = data.votacaoAtiva?.id ?? null;
      const saved = votacaoId ? getSavedVote(votacaoId) : null;

      if (saved) {
        setUserVote(saved.userVote);
        setPhase('results');
      } else {
        setUserVote(null);
        setPhase('question');
      }
    } catch {
      if (isMountedRef.current) setPhase('error');
    }
  }, [isPlenariaNoSchedule]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!isActive) {
      setPhase('idle');
      setSessao(null);
      setUserVote(null);
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (delayRef.current) clearTimeout(delayRef.current);
      return;
    }

    delayRef.current = setTimeout(() => {
      fetchAndUpdate();
      pollingRef.current = setInterval(fetchAndUpdate, POLLING_INTERVAL);
    }, INITIAL_DELAY);

    return () => {
      isMountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (delayRef.current) clearTimeout(delayRef.current);
    };
  }, [isActive, fetchAndUpdate]);

  // Reage a nova votacaoAtiva detectada no polling
  useEffect(() => {
    if (!sessao?.votacaoAtiva) return;
    const votacaoId = sessao.votacaoAtiva.id;
    const saved = getSavedVote(votacaoId);
    if (!saved && phase === 'results') {
      setUserVote(null);
      setPhase('question');
    }
  }, [sessao?.votacaoAtiva?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const vote = useCallback(
    (choice: 'sim' | 'nao') => {
      if (!sessao?.votacaoAtiva) return;
      const votoSocial: VotoSocial = {
        votacaoId: sessao.votacaoAtiva.id,
        userVote: choice,
        timestamp: Date.now(),
        eventId: sessao.eventId,
      };
      saveVote(votoSocial);
      setUserVote(choice);
      setPhase('results');
    },
    [sessao]
  );

  const changeVote = useCallback(() => {
    if (!sessao?.votacaoAtiva) return;
    removeVote(sessao.votacaoAtiva.id);
    setUserVote(null);
    setPhase('question');
  }, [sessao]);

  const dismiss = useCallback(() => {
    setPhase('idle');
  }, []);

  return {
    phase,
    sessao,
    userVote,
    vote,
    changeVote,
    dismiss,
    canDismiss: phase === 'results',
  };
}
