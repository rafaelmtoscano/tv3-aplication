import { useEffect, useRef, useState, useCallback } from 'react';
import { LivePlayer } from '../../components/LivePlayer';
import { channels } from '../../data/channels';
import { usePlenarioVoting } from '../../hooks/usePlenarioVoting';
import { VotingOverlay } from './components/VotingOverlay';
import { ResourcesPanel } from '../../components/ResourcesPanel';
import type { ResourceType } from '../../components/ResourcesPanel';
import { VotingOverlay as ParliamentVotingOverlay } from '../../components/VotingOverlay';
import { HearingOverlay } from '../../components/HearingOverlay';
import { mockVotingResult } from '../../data/votingMock';
import { activeHearing } from '../../data/hearings';

interface LivePageProps {
  isActive?: boolean;
  mainItemIndex?: number;
  initialChannelId?: string;
  singleChannel?: boolean;
  onExit?: () => void;
  onUpdateChannel?: (data: {
    channelId: string;
    channelName: string;
    channelColor: string;
    channelLogo: string;
    programTitle: string;
    programSubtitle: string;
    programTime: string;
    isLive: boolean;
  }) => void;
  onUpdateVoting?: (votacaoId: string | null, active: boolean) => void;
}

const liveChannels = channels
  .filter(ch => ch.streamUrl && ch.streamUrl.length > 0)
  .map(ch => ({
    id: ch.id,
    name: ch.name,
    logo: ch.logo,
    logoFull: ch.logoFull,
    backgroundColor: ch.backgroundColor,
    streamUrl: ch.streamUrl!,
  }));

export default function LivePage({ initialChannelId, singleChannel, onExit, isActive, onUpdateChannel, onUpdateVoting }: LivePageProps) {
  const livePlayerRef = useRef<HTMLDivElement>(null);
  const resourcesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showResourcesPanel, setShowResourcesPanel] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<ResourceType | null>(null);
  const [isAuthenticated] = useState(false); // TODO: conectar ao estado real de auth

  // Recursos disponíveis para demo
  const availableResources = [
    {
      id: 'voting',
      icon: <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)' }}>🗳️</span>,
      title: 'Painel de Votação',
      description: 'Acompanhe a votação dos parlamentares',
      type: 'voting' as ResourceType,
    },
    {
      id: 'hearing',
      icon: <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)' }}>👥</span>,
      title: 'Audiências públicas',
      description: 'Envie dúvidas, comentários ou sugestões',
      type: 'hearing' as ResourceType,
    },
  ];

  const handleResourceSelect = useCallback((type: ResourceType) => {
    setShowResourcesPanel(false);
    setActiveOverlay(type);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setActiveOverlay(null);
  }, []);

  // Detect if it is TV Câmara channel
  const isTvCamara = (initialChannelId ?? liveChannels[0]?.id) === 'tv-camara';

  const voting = usePlenarioVoting(isTvCamara && !!isActive);

  // Timer de 15s para exibir ResourcesPanel automaticamente
  useEffect(() => {
    if (!isActive) {
      if (resourcesTimerRef.current) clearTimeout(resourcesTimerRef.current);
      return;
    }
    resourcesTimerRef.current = setTimeout(() => {
      if (!showResourcesPanel && !activeOverlay) {
        setShowResourcesPanel(true);
      }
    }, 15000);
    return () => {
      if (resourcesTimerRef.current) clearTimeout(resourcesTimerRef.current);
    };
  }, [isActive, showResourcesPanel, activeOverlay]);

  // Sincroniza canal ativo com segunda tela ao montar
  useEffect(() => {
    if (!isActive || !onUpdateChannel) return;
    const ch = channels.find(c => c.id === (initialChannelId ?? liveChannels[0]?.id));
    if (!ch) return;
    onUpdateChannel({
      channelId: ch.id,
      channelName: ch.name,
      channelColor: ch.backgroundColor,
      channelLogo: ch.logo,
      programTitle: '',
      programSubtitle: '',
      programTime: '',
      isLive: true,
    });
  }, [isActive, initialChannelId, onUpdateChannel]);

  // Sincroniza estado de votação com segunda tela
  useEffect(() => {
    if (!onUpdateVoting) return;
    const votacaoId = voting.sessao?.votacaoAtiva?.id ?? null;
    const active = voting.phase === 'intro' || voting.phase === 'question' || voting.phase === 'results';
    onUpdateVoting(votacaoId, active);
  }, [voting.phase, voting.sessao, onUpdateVoting]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <LivePlayer
        ref={livePlayerRef as any}
        channels={liveChannels}
        initialChannelId={initialChannelId}
        singleChannel={singleChannel}
        onExit={onExit}
        onOpenResources={() => setShowResourcesPanel(true)}
        onChannelChange={(channelId) => {
          if (!onUpdateChannel) return;
          const ch = liveChannels.find(c => c.id === channelId);
          if (!ch) return;
          onUpdateChannel({
            channelId: ch.id,
            channelName: ch.name,
            channelColor: ch.backgroundColor ?? '',
            channelLogo: ch.logo ?? '',
            programTitle: '',
            programSubtitle: '',
            programTime: '',
            isLive: true,
          });
        }}
      />

      {isTvCamara && isActive && (
        <VotingOverlay voting={voting} livePlayerRef={livePlayerRef as any} />
      )}

      {showResourcesPanel && !activeOverlay && (
        <ResourcesPanel
          resources={availableResources}
          onSelect={handleResourceSelect}
          onClose={() => setShowResourcesPanel(false)}
        />
      )}

      {activeOverlay === 'voting' && (
        <ParliamentVotingOverlay
          data={mockVotingResult}
          onClose={handleCloseOverlay}
        />
      )}

      {activeOverlay === 'hearing' && (
        <HearingOverlay
          title={activeHearing.title}
          comments={activeHearing.comments}
          isAuthenticated={isAuthenticated}
          onClose={handleCloseOverlay}
          onGovAuth={() => setActiveOverlay(null)}
        />
      )}
    </div>
  );
}
