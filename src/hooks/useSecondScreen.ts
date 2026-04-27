import { useCallback, useEffect, useRef, useState } from 'react';
import {
  doc, setDoc, updateDoc, onSnapshot,
  serverTimestamp, deleteDoc, getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SecondScreenChannelData {
  channelId: string;
  channelName: string;
  channelColor: string;
  channelLogo: string;
  programTitle: string;
  programSubtitle: string;
  programTime: string;
  isLive: boolean;
}

interface UseSecondScreenReturn {
  sessionCode: string;
  isMobileConnected: boolean;
  isMobileRequesting: boolean;
  isMobileGovBrConnected: boolean;
  updateChannel: (data: Partial<SecondScreenChannelData>) => void;
  updateVoting: (votacaoId: string | null, active: boolean) => void;
}

function generateCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function useSecondScreen(tvName = 'TV Sala'): UseSecondScreenReturn {
  const [sessionCode] = useState<string>(() => generateCode());
  const [isMobileConnected, setIsMobileConnected] = useState(false);
  const [isMobileGovBrConnected, setIsMobileGovBrConnected] = useState(false);
  const [isMobileRequesting, setIsMobileRequesting] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const sessionRef = doc(db, 'sessions', sessionCode);

    // Initialize session document - failure is non-critical
    setDoc(sessionRef, {
      channelId: '',
      channelName: '',
      channelColor: '',
      channelLogo: '',
      programTitle: '',
      programSubtitle: '',
      programTime: '',
      isLive: false,
      tvName,
      votingActive: false,
      votacaoId: null,
      activeFeature: null,
      govBrConnected: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch((error) => {
      // Log Firestore errors but don't crash - app works without second screen
      console.warn('[Second Screen] Failed to initialize session:', error?.code || error?.message);
    });

    // Listen for session updates - failure is non-critical
    const unsubscribe = onSnapshot(
      sessionRef,
      (snap) => {
        if (!isMountedRef.current || !snap.exists()) return;
        const data = snap.data();
        if (data.mobileConnected === true) {
          setIsMobileConnected(true);
        }
        setIsMobileGovBrConnected((data.govBrConnected as boolean) ?? false);
      },
      (error) => {
        // Ignore abort/cleanup errors - these are expected during unmount
        if (error?.code === 'removed' || error?.code === 'aborted' || error?.name === 'AbortError') {
          return;
        }
        // Ignore "cancelled" operations
        if (error?.message?.includes('aborted') || error?.message?.includes('cancelled')) {
          return;
        }
        // Log other Firestore snapshot listener errors but don't crash
        console.warn('[Second Screen] Snapshot listener error:', error?.code || error?.message);
      }
    );

    unsubRef.current = unsubscribe;

    // Escuta pedidos de conexão vindos da segunda tela
    const requestRef = doc(db, 'requests', 'pending');
    const unsubRequest = onSnapshot(
      requestRef,
      (snap) => {
        if (!isMountedRef.current) return;
        if (!snap.exists()) {
          setIsMobileRequesting(false);
          return;
        }
        const data = snap.data();
        const requestedAt = data.requestedAt?.toMillis?.() ?? 0;
        const isRecent = Date.now() - requestedAt < 60_000;
        setIsMobileRequesting(isRecent && data.requesting === true);
      },
      (error) => {
        // Ignore abort/cleanup errors - these are expected during unmount
        if (error?.code === 'removed' || error?.code === 'aborted' || error?.name === 'AbortError') {
          return;
        }
        // Ignore "cancelled" operations
        if (error?.message?.includes('aborted') || error?.message?.includes('cancelled')) {
          return;
        }
        console.warn('[Second Screen] Request listener error:', error?.code || error?.message);
      }
    );

    return () => {
      // Mark component as unmounted first to prevent state updates
      isMountedRef.current = false;

      // Unsubscribe from both listeners immediately
      try {
        unsubRequest();
      } catch (e) {
        // Ignore errors during unsubscription
      }
      try {
        if (unsubRef.current) {
          unsubRef.current();
          unsubRef.current = null;
        }
      } catch (e) {
        // Ignore errors during unsubscription
      }

      // Then clean up the document
      deleteDoc(sessionRef).catch((error) => {
        // Ignore expected cleanup errors
        if (error?.code === 'not-found' || error?.code === 'aborted' || error?.name === 'AbortError') {
          return;
        }
        if (error?.message?.includes('aborted') || error?.message?.includes('cancelled')) {
          return;
        }
        // Log other cleanup errors but don't crash
        console.warn('[Second Screen] Failed to delete session:', error?.code || error?.message);
      });
    };
  }, [sessionCode, tvName]);

  const updateChannel = useCallback((data: Partial<SecondScreenChannelData>) => {
    updateDoc(doc(db, 'sessions', sessionCode), {
      ...data,
      updatedAt: serverTimestamp(),
    }).catch((error) => {
      // Non-critical: second screen synchronization failed
      console.warn('[Second Screen] Failed to update channel:', error?.code || error?.message);
    });
  }, [sessionCode]);

  const updateVoting = useCallback(async (votacaoId: string | null, active: boolean) => {
    try {
      // Atualiza sessão
      await updateDoc(doc(db, 'sessions', sessionCode), {
        votingActive: active,
        votacaoId,
        updatedAt: serverTimestamp(),
      }).catch((error) => {
        console.warn('[Second Screen] Failed to update voting:', error?.code || error?.message);
      });

      // Se votação ativa, garante que o documento votes/{votacaoId} existe
      if (active && votacaoId) {
        const voteRef = doc(db, 'votes', votacaoId);
        const snap = await getDoc(voteRef).catch(() => null);
        if (!snap?.exists()) {
          // Cria documento de votação para o mobile consumir via onSnapshot
          await setDoc(voteRef, {
            question: 'O Plenário deve aprovar o Projeto de Lei 1234/2024, que regulamenta o uso de inteligência artificial no serviço público brasileiro?',
            options: [
              { id: 'sim', label: 'Sim', votes: 287, pct: 66 },
              { id: 'nao', label: 'Não', votes: 134, pct: 31 },
              { id: 'abstencao', label: 'Abstenção', votes: 21, pct: 5 },
            ],
            totalVotes: 442,
            sessionCode,
            status: 'active',
            createdAt: serverTimestamp(),
          }).catch((error) => {
            console.warn('[Second Screen] Failed to create voting document:', error?.code || error?.message);
          });
        }
      }
    } catch (error) {
      console.warn('[Second Screen] Voting operation failed:', error instanceof Error ? error.message : String(error));
    }
  }, [sessionCode]);

  return { sessionCode, isMobileConnected, isMobileRequesting, isMobileGovBrConnected, updateChannel, updateVoting };
}
