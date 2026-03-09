// src/hooks/usePlenarioVoting.ts
// Hook que detecta sessão plenária ativa, faz polling e gerencia o voto social do usuário.

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchSessaoCompleta, getSavedVote, saveVote, removeVote } from '../data/plenario';
import type { SessaoAtiva, VotoSocial } from '../data/plenario';

const POLLING_INTERVAL = 60_000;
const INITIAL_DELAY = 5_000;

export type VotingPhase =
  | 'idle'
  | 'loading'
  | 'intro'
  | 'details'
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
  goToQuestion: () => void;
  goToDetails: () => void;
  goToIntro: () => void;
}

export function usePlenarioVoting(isActive: boolean): UsePlenarioVotingReturn {
  const [phase, setPhase] = useState<VotingPhase>('idle');
  const [sessao, setSessao] = useState<SessaoAtiva | null>(null);
  const [userVote, setUserVote] = useState<'sim' | 'nao' | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const isFirstLoadRef = useRef(true);
  const lastVotacaoIdRef = useRef<string | null>(null);

  const isPlenariaNoSchedule = useCallback((): boolean => {
    // TODO: em produção, integrar com EPG real para verificar se há sessão plenária
    // Bypass para demo — ativar overlay sempre que houver sessão na API
    return true;
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

    // Show loading only on first run or when explicitly needed
    if (isFirstLoadRef.current && isMountedRef.current) {
      setPhase('loading');
    }

    try {
      let data = await fetchSessaoCompleta();
      if (!isMountedRef.current) return;

      if (!data) {
        // Nenhuma sessão ativa encontrada na API — manter idle
        if (isMountedRef.current) setPhase('idle');
        isFirstLoadRef.current = false;
        return;
      }

      setSessao(data);

      const votacaoId = data.votacaoAtiva?.id ?? null;
      const saved = votacaoId ? getSavedVote(votacaoId) : null;

      // Detect new vote start
      if (votacaoId && lastVotacaoIdRef.current && votacaoId !== lastVotacaoIdRef.current) {
        if (!saved) {
          setUserVote(null);
          setPhase('intro');
        }
      }
      lastVotacaoIdRef.current = votacaoId;

      if (isFirstLoadRef.current) {
        if (saved) {
          setUserVote(saved.userVote);
          setPhase('results');
        } else if (data.votacaoAtiva) {
          setUserVote(null);
          setPhase('intro');
        } else {
          setPhase('idle');
        }
        isFirstLoadRef.current = false;
      } else if (saved && (phase === 'intro' || phase === 'question')) {
        // Sync if voted on another device/tab
        setUserVote(saved.userVote);
        setPhase('results');
      }
    } catch {
      if (isMountedRef.current) setPhase('error');
    }
  }, [isPlenariaNoSchedule, phase]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!isActive) {
      setPhase('idle');
      setSessao(null);
      setUserVote(null);
      isFirstLoadRef.current = true;
      lastVotacaoIdRef.current = null;
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (delayRef.current) clearTimeout(delayRef.current);
      return;
    }

    // Initial delay before first check
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

  const goToQuestion = useCallback(() => setPhase('question'), []);
  const goToDetails = useCallback(() => setPhase('details'), []);
  const goToIntro = useCallback(() => setPhase('intro'), []);

  return {
    phase,
    sessao,
    userVote,
    vote,
    changeVote,
    dismiss,
    goToQuestion,
    goToDetails,
    goToIntro,
  };
}
