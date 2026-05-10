import React from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface NotificationItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  timestamp?: string;
  onEnter?: () => void;
}

interface NotificationCardProps {
  item: NotificationItem;
  isFocused: boolean;
}

export function NotificationCard({ item, isFocused }: NotificationCardProps) {
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: '24px 24px 24px 16px',
    borderRadius: 24,
    background: isFocused ? colors.background.primary : 'transparent',
    transition: 'background 0.2s ease',
  };

  const iconBoxStyle: React.CSSProperties = {
    width: 80,
    height: 80,
    borderRadius: 17.6,
    background: isFocused ? colors.background.base : colors.line.dark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.2s ease',
    overflow: 'hidden',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minWidth: 0,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  };

  const titleStyle: React.CSSProperties = {
    ...typography.headline.medium,
    fontWeight: 500,
    color: isFocused ? colors.text.primary : colors.text.primaryInverse,
  };

  const timestampStyle: React.CSSProperties = {
    ...typography.headline.small,
    fontWeight: 500,
    color: isFocused ? colors.text.disabled : colors.text.secondaryInverse,
    opacity: isFocused ? 1 : 0.57,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  const descriptionStyle: React.CSSProperties = {
    ...typography.headline.small,
    fontWeight: 500,
    color: isFocused ? colors.text.secondary : colors.text.primaryInverse,
    margin: 0,
    maxHeight: 75,
    overflow: 'hidden',
  };

  return (
    <div style={cardStyle}>
      {item.icon && (
        <div style={iconBoxStyle}>
          {item.icon}
        </div>
      )}
      <div style={contentStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>{item.title}</span>
          <span style={timestampStyle}>{item.timestamp ?? 'agora'}</span>
        </div>
        <p style={descriptionStyle}>{item.description}</p>
      </div>
    </div>
  );
}
