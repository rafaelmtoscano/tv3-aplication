import React from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ContentRail } from '../../components/ContentRail';
import { channels } from '../../data/channels';

interface Props {
  isActive: boolean;
  mainItemIndex: number;
}

export default function MyChannels({ isActive, mainItemIndex }: Props) {
  const containerStyle: React.CSSProperties = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.background.baseInverse,
    gap: '40px',
    padding: '0 64px',
  };

  const titleStyle: React.CSSProperties = {
    ...typography.headline.large,
    color: colors.text.primaryInverse,
    alignSelf: 'flex-start',
  };

  const railItems = channels.map(ch => ({
    id: ch.id,
    image: ch.logo,
    logo: ch.logo,
    label: ch.name,
    isLive: !!(ch.streamUrl && ch.streamUrl.length > 0),
  }));

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Meus canais</h2>
      <div style={{ width: '100%' }}>
        <ContentRail
          title="Todos os canais"
          variant="image"
          items={railItems}
          focusedIndex={isActive ? mainItemIndex : -1}
        />
      </div>
    </div>
  );
}
