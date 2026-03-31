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
  govBrConnected: boolean;
  updateChannel: (data: Partial<SecondScreenChannelData>) => void;
  updateVoting: (votacaoId: string | null, active: boolean) => void;
}

function generateCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function useSecondScreen(tvName = 'TV Sala'): UseSecondScreenReturn {
  const [sessionCode] = useState<string>(generateCode);
  const [isMobileConnected, setIsMobileConnected] = useState(false);
  const [govBrConnected, setGovBrConnected] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const sessionRef = doc(db, 'sessions', sessionCode);

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
    }).catch(console.error);

    unsubRef.current = onSnapshot(sessionRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (data.mobileConnected === true) {
        setIsMobileConnected(true);
      }
      setGovBrConnected((data.govBrConnected as boolean) ?? false);
    });

    return () => {
      unsubRef.current?.();
      deleteDoc(sessionRef).catch(console.error);
    };
  }, [sessionCode, tvName]);

  const updateChannel = useCallback((data: Partial<SecondScreenChannelData>) => {
    updateDoc(doc(db, 'sessions', sessionCode), {
      ...data,
      updatedAt: serverTimestamp(),
    }).catch(console.error);
  }, [sessionCode]);

  const updateVoting = useCallback(async (votacaoId: string | null, active: boolean) => {
    // Atualiza sessão
    updateDoc(doc(db, 'sessions', sessionCode), {
      votingActive: active,
      votacaoId,
      updatedAt: serverTimestamp(),
    }).catch(console.error);

    // Se votação ativa, garante que o documento votes/{votacaoId} existe
    if (active && votacaoId) {
      const voteRef = doc(db, 'votes', votacaoId);
      const snap = await getDoc(voteRef).catch(() => null);
      if (!snap?.exists()) {
        // Cria documento de votação para o mobile consumir via onSnapshot
        setDoc(voteRef, {
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
        }).catch(console.error);
      }
    }
  }, [sessionCode]);

  return { sessionCode, isMobileConnected, govBrConnected, updateChannel, updateVoting };
}
