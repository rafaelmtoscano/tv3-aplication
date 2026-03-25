import { useEffect, useRef, useState, useCallback } from 'react';
import {
  doc, setDoc, updateDoc, onSnapshot,
  serverTimestamp, deleteDoc
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
  updateChannel: (data: Partial<SecondScreenChannelData>) => void;
  updateVoting: (votacaoId: string | null, active: boolean) => void;
}

function generateCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function useSecondScreen(tvName = 'TV Sala'): UseSecondScreenReturn {
  const [sessionCode] = useState<string>(generateCode);
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch(console.error);

    unsubRef.current = onSnapshot(sessionRef, () => {
      // Reservado para reagir a comandos do celular (ex: troca de canal)
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

  const updateVoting = useCallback((votacaoId: string | null, active: boolean) => {
    updateDoc(doc(db, 'sessions', sessionCode), {
      votingActive: active,
      votacaoId,
      updatedAt: serverTimestamp(),
    }).catch(console.error);
  }, [sessionCode]);

  return { sessionCode, updateChannel, updateVoting };
}
