// src/hooks/useSenadoVoting.ts
// Espelho de usePlenarioVoting.ts — adaptado para a API do Senado Federal

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchSessaoCompletaSenado,
  fetchSessaoHistoricaSenado,
  getSavedVoteSenado,
  saveVoteSenado,
  removeVoteSenado,
} from '../data/senado';
import type { SessaoAtiva } from '../data/plenario';
import type { UseVotingReturn, VotingPhase } from '../types/voting';

const POLLING_INTERVAL = 60_000;
const INITIAL_DELAY = 5_000;

export function useSenadoVoting(enabled: boolean): UseVotingReturn {
  const [phase, setPhase] = useState<VotingPhase>('idle');
  const [sessao, setSessao] = useState<SessaoAtiva | null>(null);
  const [userVote, setUserVote] = useState<'sim' | 'nao' | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const isFirstLoadRef = useRef(true);
  const lastVotacaoIdRef = useRef<string | null>(null);

  const fetchAndUpdate = useCallback(async () => {
    if (!isMountedRef.current) return;

    if (isFirstLoadRef.current && isMountedRef.current) {
      setPhase('loading');
    }

    try {
      const data = await fetchSessaoCompletaSenado();
      if (!isMountedRef.current) return;

      if (!data) {
        // Sem sessão ao vivo — tenta fallback com a última votação dos últimos 7 dias
        const historica = await fetchSessaoHistoricaSenado();
        if (!isMountedRef.current) return;
        if (historica) {
          setSessao(historica);
          setPhase('historico');
        } else {
          setPhase('idle');
        }
        isFirstLoadRef.current = false;
        return;
      }

      setSessao(data);

      const votacaoId = data.votacaoAtiva?.id ?? null;
      const saved = votacaoId ? getSavedVoteSenado(votacaoId) : null;

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
        setUserVote(saved.userVote);
        setPhase('results');
      }
    } catch {
      if (isMountedRef.current) setPhase('error');
    }
  }, [phase]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      setPhase('idle');
      setSessao(null);
      setUserVote(null);
      isFirstLoadRef.current = true;
      lastVotacaoIdRef.current = null;
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
  }, [enabled, fetchAndUpdate]);

  const vote = useCallback(
    (choice: 'sim' | 'nao') => {
      if (!sessao?.votacaoAtiva) return;
      saveVoteSenado({
        votacaoId: sessao.votacaoAtiva.id,
        userVote: choice,
        timestamp: Date.now(),
      });
      setUserVote(choice);
      setPhase('results');
    },
    [sessao]
  );

  const changeVote = useCallback(() => {
    if (!sessao?.votacaoAtiva) return;
    removeVoteSenado(sessao.votacaoAtiva.id);
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
