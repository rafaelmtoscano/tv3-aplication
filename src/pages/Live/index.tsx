import React, { useRef } from 'react';
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

export default function LivePage({ initialChannelId, singleChannel, onExit }: LivePageProps) {
  const livePlayerRef = useRef<HTMLDivElement>(null);
  
  // Detect if it is TV Câmara channel
  const isTvCamara = initialChannelId === 'tv-camara';

  const voting = usePlenarioVoting(isTvCamara);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <LivePlayer
        ref={livePlayerRef}
        channels={liveChannels}
        initialChannelId={initialChannelId}
        singleChannel={singleChannel}
        onExit={onExit}
      />
      
      {isTvCamara && (
        <VotingOverlay voting={voting} livePlayerRef={livePlayerRef} />
      )}
    </div>
  );
}
