import { useEffect, useRef, useState, useCallback } from 'react';
import { LivePlayer } from '../../components/LivePlayer';
import { channels } from '../../data/channels';
import { usePlenarioVoting } from '../../hooks/usePlenarioVoting';
import { useSenadoVoting } from '../../hooks/useSenadoVoting';
import { ResourcesPanel } from '../../components/ResourcesPanel';
import type { ResourceType } from '../../components/ResourcesPanel';
import { VotingOverlay as ParliamentVotingOverlay } from '../../components/VotingOverlay';
import { PollOverlay } from '../../components/PollOverlay';
import { HearingOverlay } from '../../components/HearingOverlay';
import type { VotingResult } from '../../data/votingMock';
import { fetchVotosDeputados, isVotacaoRecente } from '../../data/plenario';
import { fetchVotosSenadores } from '../../data/senado';
import { activePoll } from '../../data/polls';
import { activeHearing } from '../../data/hearings';

/**
 * Extracts the bill number (e.g., "PL 1/2025") from a voting description
 * Falls back to first 30 characters if no match
 */
function extractBillNumber(descricao?: string): string {
  if (!descricao) return 'Votação';
  const match = descricao.match(/\b(PL|PEC|MP|PLP|PDL)\s*\d+\/\d{4}\b/i);
  return match ? match[0].toUpperCase() : descricao.substring(0, 30) + (descricao.length > 30 ? '…' : '');
}

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
  isAuthenticated?: boolean;
  onGovAuth?: () => void;
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
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function LivePage({ initialChannelId, singleChannel, onExit, isActive, onUpdateChannel, onUpdateVoting, isAuthenticated = false, onGovAuth }: LivePageProps) {
  const livePlayerRef = useRef<HTMLDivElement>(null);
  const resourcesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resourcesShownRef = useRef(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showResourcesPanel, setShowResourcesPanel] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<ResourceType | null>(null);
  const [activeVotingData, setActiveVotingData] = useState<VotingResult | null>(null);
  const [currentChannelId, setCurrentChannelId] = useState(initialChannelId ?? liveChannels[0]?.id ?? 'tv-camara');

  // Detect if it is TV Câmara channel
  const isTvCamara = currentChannelId === 'tv-camara';
  const isTvSenado = currentChannelId === 'tv-senado';
  const hasOverlay = showResourcesPanel || !!activeOverlay;

  // Get current channel to access resources configuration
  const currentChannel = channels.find(ch => ch.id === currentChannelId);
  const channelResources = currentChannel?.resources ?? [];

  const voting = usePlenarioVoting(isTvCamara && !!isActive);
  const senadoVoting = useSenadoVoting(isTvSenado && !!isActive);

  // Sessão ativa (independente da casa) e flag de votação ≤ 48h
  const activeVotacao =
    (isTvCamara ? voting.sessao?.votacaoAtiva : null) ??
    (isTvSenado ? senadoVoting.sessao?.votacaoAtiva : null) ??
    null;
  const hasRecentVoting = isVotacaoRecente(activeVotacao, 48);

  // Construir activePoll a partir da votação ativa (sincronizada com VotingOverlay e programação)
  const activePollData = activeVotacao ? {
    id: activeVotacao.id,
    question: 'Qual sua opinião sobre?',
    bill: extractBillNumber(activeVotacao.descricao),
    billDescription: activeVotacao.descricao,
    options: [
      { id: 'concordo', label: 'Concordo' },
      { id: 'discordo', label: 'Discordo' },
    ],
    createdAt: activeVotacao.dataHoraRegistro,
    votacaoId: activeVotacao.id,
  } : activePoll;

  // Recursos disponíveis — construídos dinamicamente baseado na configuração do canal
  const availableResources = [];

  // Voting — só se canal suporta E há votação recente
  if (channelResources.includes('voting') && hasRecentVoting) {
    availableResources.push({
      id: 'voting',
      icon: <span className="material-symbols-rounded" style={{ fontSize: 24, color: 'currentColor' }}>how_to_vote</span>,
      title: 'Painel de Votação',
      description: 'Acompanhe os votos dos parlamentares',
      type: 'voting' as ResourceType,
    });
  }

  // Poll — só se canal suporta E há votação recente
  if (channelResources.includes('poll') && hasRecentVoting) {
    availableResources.push({
      id: 'poll',
      icon: <span className="material-symbols-rounded" style={{ fontSize: 24, color: 'currentColor' }}>poll</span>,
      title: 'Enquete',
      description: 'Participe da consulta pública',
      type: 'poll' as ResourceType,
    });
  }

  // Hearing — só se canal suporta
  if (channelResources.includes('hearing')) {
    availableResources.push({
      id: 'hearing',
      icon: <span className="material-symbols-rounded" style={{ fontSize: 24, color: 'currentColor' }}>record_voice_over</span>,
      title: 'Audiência Pública',
      description: 'Envie perguntas e comentários',
      type: 'hearing' as ResourceType,
    });
  }

  const handleResourceSelect = useCallback((type: ResourceType) => {
    setShowResourcesPanel(false);
    setActiveOverlay(type);

    if (type === 'voting') {
      const v = activeVotacao;
      if (!v) return;
      setActiveVotingData(null);
      const fetcher = isTvSenado ? fetchVotosSenadores : fetchVotosDeputados;
      fetcher(v.id).then(deputies => {
        setActiveVotingData({
          title: v.descricao || 'Votação em andamento',
          sim: v.placar?.sim ?? 0,
          nao: v.placar?.nao ?? 0,
          abstencao: v.placar?.abstencao ?? 0,
          deputies,
          createdAt: v.dataHoraRegistro,
        });
      }).catch(() => {
        setActiveVotingData({
          title: v.descricao || 'Votação em andamento',
          sim: v.placar?.sim ?? 0,
          nao: v.placar?.nao ?? 0,
          abstencao: v.placar?.abstencao ?? 0,
          deputies: [],
          createdAt: v.dataHoraRegistro,
        });
      });
    }
  }, [activeVotacao, isTvSenado]);

  const handleCloseOverlay = useCallback(() => {
    setActiveOverlay(null);
    setActiveVotingData(null);
  }, []);

  // Timer de 15s — dispara UMA vez por sessão de canal
  // Só inicia quando os controles do player são ocultados (controlsVisible = false)
  useEffect(() => {
    if (!isActive) {
      if (resourcesTimerRef.current) clearTimeout(resourcesTimerRef.current);
      resourcesShownRef.current = false;
      return;
    }
    // Se os controles ainda estão visíveis, não inicia o timer
    if (controlsVisible) {
      if (resourcesTimerRef.current) clearTimeout(resourcesTimerRef.current);
      return;
    }
    // Se já mostrou nesta sessão de canal, não mostra de novo
    if (resourcesShownRef.current) return;
    resourcesTimerRef.current = setTimeout(() => {
      if (!resourcesShownRef.current) {
        resourcesShownRef.current = true;
        setShowResourcesPanel(true);
      }
    }, 15000);
    return () => {
      if (resourcesTimerRef.current) clearTimeout(resourcesTimerRef.current);
    };
  }, [isActive, controlsVisible]);

  // Sincroniza canal ativo com segunda tela ao montar
  useEffect(() => {
    if (!isActive || !onUpdateChannel) return;
    const ch = channels.find(c => c.id === currentChannelId);
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
  }, [isActive, currentChannelId, onUpdateChannel]);

  // Sincroniza estado de votação com segunda tela (Câmara ou Senado)
  useEffect(() => {
    if (!onUpdateVoting) return;
    const votacaoId = voting.sessao?.votacaoAtiva?.id
      ?? senadoVoting.sessao?.votacaoAtiva?.id
      ?? null;
    const active =
      voting.phase === 'intro' || voting.phase === 'question' || voting.phase === 'results' ||
      senadoVoting.phase === 'intro' || senadoVoting.phase === 'question' || senadoVoting.phase === 'results';
    onUpdateVoting(votacaoId, active);
  }, [voting.phase, voting.sessao, senadoVoting.phase, senadoVoting.sessao, onUpdateVoting]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <LivePlayer
        ref={livePlayerRef as any}
        channels={liveChannels}
        initialChannelId={initialChannelId}
        singleChannel={singleChannel}
        onExit={onExit}
        disabled={hasOverlay}
        onOpenResources={hasOverlay ? undefined : () => setShowResourcesPanel(true)}
        onControlsVisibilityChange={(visible) => setControlsVisible(visible)}
        onChannelChange={(channelId) => {
          // Update current channel state
          setCurrentChannelId(channelId);
          // Fechar overlays ao trocar de canal
          setShowResourcesPanel(false);
          setActiveOverlay(null);
          resourcesShownRef.current = false; // permitir novo timer no novo canal
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

      {showResourcesPanel && !activeOverlay && (
        <ResourcesPanel
          resources={availableResources}
          onSelect={handleResourceSelect}
          onClose={() => setShowResourcesPanel(false)}
        />
      )}

      {activeOverlay === 'voting' && (
        <ParliamentVotingOverlay
          data={activeVotingData}
          onClose={handleCloseOverlay}
          onBack={() => { setActiveOverlay(null); setActiveVotingData(null); setShowResourcesPanel(true); }}
        />
      )}

      {activeOverlay === 'poll' && (
        <PollOverlay
          poll={activePollData}
          isAuthenticated={isAuthenticated}
          onClose={handleCloseOverlay}
          onBack={() => { setActiveOverlay(null); setShowResourcesPanel(true); }}
          onGovAuth={onGovAuth ?? (() => {})}
        />
      )}

      {activeOverlay === 'hearing' && (
        <HearingOverlay
          title={activeHearing.title}
          comments={activeHearing.comments}
          isAuthenticated={isAuthenticated}
          onClose={handleCloseOverlay}
          onBack={() => { setActiveOverlay(null); setShowResourcesPanel(true); }}
          onGovAuth={onGovAuth ?? (() => {})}
        />
      )}
    </div>
  );
}
