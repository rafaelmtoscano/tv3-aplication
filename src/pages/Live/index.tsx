import { useEffect, useRef } from 'react';
import { LivePlayer } from '../../components/LivePlayer';
import { channels } from '../../data/channels';
import { usePlenarioVoting } from '../../hooks/usePlenarioVoting';
import { VotingOverlay } from './components/VotingOverlay';

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

  // Detect if it is TV Câmara channel
  const isTvCamara = (initialChannelId ?? liveChannels[0]?.id) === 'tv-camara';

  const voting = usePlenarioVoting(isTvCamara && !!isActive);

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
    </div>
  );
}
