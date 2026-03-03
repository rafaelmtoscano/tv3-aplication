import React from 'react';
import { LivePlayer } from '../../components/LivePlayer';
import { channels } from '../../data/channels';

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
  return (
    <LivePlayer
      channels={liveChannels}
      initialChannelId={initialChannelId}
      singleChannel={singleChannel}
      onExit={onExit}
    />
  );
}
