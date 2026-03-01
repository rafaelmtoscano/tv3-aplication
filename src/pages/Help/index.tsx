import React from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ContentRail } from '../../components/ContentRail';
import { rails } from '../../data/rails';
import { SimplePageProps } from '../SimplePageProps';

interface Props extends SimplePageProps {
  mainItemIndex: number;
}

export default function Help({ isActive, mainItemIndex }: Props) {
  const containerStyle: React.CSSProperties = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.background.baseInverse,
    gap: '40px',
  };

  const textStyle: React.CSSProperties = {
    ...typography.display.medium,
    color: colors.text.primaryInverse,
  };

  const railItems = rails[0].cards.map(card => ({
    id: card.id,
    image: card.image,
    title: card.title,
    isLive: card.isLive,
    logo: card.logo,
    label: card.label,
    timestamp: card.timestamp,
  }));

  return (
    <div style={containerStyle}>
      <span style={textStyle}>Ajuda</span>
      <div style={{ width: '100%' }}>
        <ContentRail
          title={rails[0].title}
          variant={rails[0].cardVariant}
          items={railItems}
          focusedIndex={isActive ? mainItemIndex : -1}
        />
      </div>
    </div>
  );
}
