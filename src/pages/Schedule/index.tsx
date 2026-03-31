import React, { useState, useRef, useEffect, useCallback } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { EPGRail } from '../../components/EPGRail';
import { channels } from '../../data/channels';

interface ScheduleProps {
  isActive: boolean;
  isSidebarExpanded?: boolean;
  mainItemIndex: number;
  onLiveChannel?: (channelId: string) => void;
}

const HEADER_HEIGHT = 120;
const RAIL_BLOCK_HEIGHT = 240;
const SCROLL_OFFSET = 80;

const scheduledChannelIds = ['tv-camara', 'canal-gov', 'tv-brasil'];
const scheduledChannels = scheduledChannelIds
  .map(id => channels.find(c => c.id === id))
  .filter(Boolean) as typeof channels;

const formatDate = (): string => {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formatted = formatter.format(new Date());
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export default function Schedule({ isActive, isSidebarExpanded, onLiveChannel }: ScheduleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeRailIndex, setActiveRailIndex] = useState(0);
  const [railFocusedIndex, setRailFocusedIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    if (isActive) {
      containerRef.current?.focus();
    }
  }, [isActive]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const brasiliaTime = new Date(currentTime.getTime() + (currentTime.getTimezoneOffset() + (-3 * 60)) * 60000);
  const timeString = brasiliaTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isSidebarExpanded) return;
      switch (e.key) {
        case 'ArrowDown':
          if (activeRailIndex < scheduledChannels.length - 1) {
            e.preventDefault();
            e.stopPropagation();
            setActiveRailIndex(r => r + 1);
            setRailFocusedIndex(0);
          }
          break;
        case 'ArrowUp':
          if (activeRailIndex > 0) {
            e.preventDefault();
            e.stopPropagation();
            setActiveRailIndex(r => r - 1);
            setRailFocusedIndex(0);
          }
          break;
        case 'ArrowLeft':
          if (railFocusedIndex > 0) {
            e.preventDefault();
            e.stopPropagation();
            setRailFocusedIndex(i => i - 1);
          }
          // railFocusedIndex === 0: não bloquear — propagar para sidebar
          break;
        case 'ArrowRight':
          if (railFocusedIndex < 7) {
            e.preventDefault();
            e.stopPropagation();
            setRailFocusedIndex(i => i + 1);
          }
          break;
        case 'Enter': {
          e.preventDefault();
          e.stopPropagation();
          const channel = scheduledChannels[activeRailIndex];
          if (!channel) break;
          if (railFocusedIndex === 0 && onLiveChannel) {
            onLiveChannel(channel.id);
          }
          break;
        }
        default:
          break;
      }
    },
    [activeRailIndex, railFocusedIndex, onLiveChannel, isSidebarExpanded]
  );

  const scrollY =
    activeRailIndex === 0
      ? 0
      : activeRailIndex * RAIL_BLOCK_HEIGHT - SCROLL_OFFSET;

  const pageStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    background: colors.background.baseInverse,
    outline: 'none',
  };

  const scrollWrapperStyle: React.CSSProperties = {
    transform: `translateY(-${scrollY}px)`,
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    paddingLeft: 136,
    paddingRight: 64,
    paddingTop: 48,
  };

  const headerStyle: React.CSSProperties = {
    height: HEADER_HEIGHT,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 24,
    position: 'relative',
  };

  const clockStyle: React.CSSProperties = {
    position: 'absolute',
    top: 48,
    right: 64,
    ...typography.display.medium,
    color: colors.text.primaryInverse,
    margin: 0,
  };

  const titleStyle: React.CSSProperties = {
    ...typography.display.medium,
    color: colors.text.primaryInverse,
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    ...typography.body.large,
    color: colors.text.secondaryInverse,
    margin: 0,
  };

  const railBlockStyle: React.CSSProperties = {
    marginBottom: 32,
  };

  const channelLabelStyle: React.CSSProperties = {
    ...typography.headline.small,
    color: colors.text.secondaryInverse,
    marginBottom: 8,
  };

  return (
    <div
      ref={containerRef}
      style={pageStyle}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div style={scrollWrapperStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Programação</h1>
          <p style={subtitleStyle}>{formatDate()}</p>
          <div style={clockStyle}>{timeString}</div>
        </div>

        {scheduledChannels.map((channel, i) => (
          <div key={channel.id} style={railBlockStyle}>
            <div style={channelLabelStyle}>{channel.name}</div>
            <EPGRail
              channelId={channel.id}
              channelLogo={channel.logo}
              channelName={channel.name}
              focusedIndex={activeRailIndex === i ? railFocusedIndex : -1}
              onFocusedIndexChange={(idx) => setRailFocusedIndex(idx)}
              onNavigateUp={() => {
                if (activeRailIndex > 0) {
                  setActiveRailIndex(r => r - 1);
                  setRailFocusedIndex(0);
                }
              }}
              onNavigateDown={() => {
                if (activeRailIndex < scheduledChannels.length - 1) {
                  setActiveRailIndex(r => r + 1);
                  setRailFocusedIndex(0);
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
