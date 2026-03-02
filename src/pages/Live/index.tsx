import React from 'react';
import { LivePlayer } from '../../components/LivePlayer';
import { channels } from '../../data/channels';

interface LivePageProps {
  isActive?: boolean;
  mainItemIndex?: number;
  initialChannelId?: string;
  onExit?: () => void;
}

const liveChannels = channels
  .filter(ch => ch.streamUrl && ch.streamUrl.length > 0)
  .map(ch => ({
    id: ch.id,
    name: ch.name,
    logo: ch.logo,
    logoFull: ch.logoFull,
    streamUrl: ch.streamUrl!,
  }));

export default function LivePage({ initialChannelId, onExit }: LivePageProps) {
  return (
    <LivePlayer
      channels={liveChannels}
      initialChannelId={initialChannelId}
      onExit={onExit}
    />
  );
}
