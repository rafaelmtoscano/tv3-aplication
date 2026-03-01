import React from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export default function Settings() {
  const containerStyle: React.CSSProperties = {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.background.baseInverse,
  };

  const textStyle: React.CSSProperties = {
    ...typography.display.medium,
    color: colors.text.primaryInverse,
  };

  return (
    <div style={containerStyle}>
      <span style={textStyle}>Configurações</span>
    </div>
  );
}
