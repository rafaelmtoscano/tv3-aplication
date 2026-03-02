import React from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

interface Props {
  isActive: boolean;
}

export default function Settings({ isActive }: Props) {
  const containerStyle: React.CSSProperties = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.background.baseInverse,
    gap: '8px',
  };

  const titleStyle: React.CSSProperties = {
    ...typography.display.medium,
    color: colors.text.primaryInverse,
  };

  const subtitleStyle: React.CSSProperties = {
    ...typography.body.large,
    color: colors.text.secondaryInverse,
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Configurações</h1>
      <p style={subtitleStyle}>Em breve</p>
    </div>
  );
}
