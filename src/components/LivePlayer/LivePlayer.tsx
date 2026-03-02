import React, { forwardRef, useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle } from 'react';
import { VideoPlayer } from '../VideoPlayer';
import { TileButton } from '../TileButton';
import { HomeIcon } from '../../icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface LiveChannel {
  id: string;
  name: string;
  logo?: string;
  logoFull?: string;
  backgroundColor?: string;
  streamUrl: string;
}

export interface LivePlayerProps {
  channels: LiveChannel[];
  initialChannelId?: string;
  onExit?: () => void;
  className?: string;
}

const PLACEHOLDER_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"><rect width="120" height="80" rx="8" fill="%23334155"/><rect x="40" y="28" width="40" height="24" rx="4" fill="%2364748b"/><circle cx="60" cy="40" r="8" fill="%2394a3b8"/></svg>';

export const LivePlayer = React.memo(
  forwardRef<HTMLDivElement, LivePlayerProps>(
    ({ channels = [], initialChannelId, onExit, className }, ref) => {
      const [activeChannelId, setActiveChannelId] = useState(
        initialChannelId || channels[0]?.id
      );
      const [focusedIndex, setFocusedIndex] = useState(channels.length > 0 ? 1 : 0);
      const [controlsVisible, setControlsVisible] = useState(true);
      
      const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
      const containerRef = useRef<HTMLDivElement>(null);

      const activeChannel = useMemo(
        () => channels.find((c) => c.id === activeChannelId) || channels[0],
        [channels, activeChannelId]
      );

      const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setControlsVisible(true);
        timeoutRef.current = setTimeout(() => {
          setControlsVisible(false);
        }, 5000);
      }, []);

      useImperativeHandle(ref, () => containerRef.current!);

      useEffect(() => {
        resetTimer();
        containerRef.current?.focus();
        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }, [resetTimer]);

      const handleKeyDown = (e: React.KeyboardEvent) => {
        resetTimer();
        
        switch (e.key) {
          case 'ArrowRight':
            setFocusedIndex((i) => Math.min(i + 1, channels.length));
            break;
          case 'ArrowLeft':
            setFocusedIndex((i) => Math.max(i - 1, 0));
            break;
          case 'Enter':
          case ' ':
            if (focusedIndex === 0) {
              onExit?.();
            } else if (channels[focusedIndex - 1]) {
              setActiveChannelId(channels[focusedIndex - 1].id);
            }
            break;
          case 'Escape':
          case 'Backspace':
            onExit?.();
            break;
          default:
            break;
        }
      };

      if (!activeChannel) return null;

      const containerStyle: React.CSSProperties = {
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
        outline: 'none',
      };

      const scrimStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '50%',
        background: 'linear-gradient(0deg, rgba(17,23,43,0.95) 0%, rgba(17,23,43,0.0) 100%)',
        pointerEvents: 'none',
        opacity: controlsVisible ? 1 : 0,
        transition: 'opacity 0.4s ease-in-out',
        zIndex: 1,
      };

      const liveTagStyle: React.CSSProperties = {
        background: '#E52207',
        borderRadius: '8px',
        padding: '4px 16px',
        color: '#FFF',
        ...typography.body.large,
      };

      const topRowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      };

      const controlsLayerStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 64px',
        boxSizing: 'border-box',
        opacity: controlsVisible ? 1 : 0,
        pointerEvents: controlsVisible ? 'auto' : 'none',
        transition: 'opacity 0.4s ease-in-out',
        zIndex: 2,
      };

      const bottomSectionStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      };

      const nowWatchingStyle: React.CSSProperties = {
        color: colors.text.primaryInverse,
        ...typography.body.large,
      };

      const railWrapperStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        gap: '24px',
        alignItems: 'center',
        overflowX: 'hidden',
        overflowY: 'visible',
        flexWrap: 'nowrap',
        width: '100%',
        height: '312px', // fixed at focused TileButton height
        paddingBlock: '32px',
        marginBlock: '-32px',
        boxSizing: 'content-box',
      };

      return (
        <div
          ref={containerRef}
          style={containerStyle}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className={className}
        >
          {/* Video Layer */}
          <VideoPlayer
            src={activeChannel.streamUrl}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
          />

          {/* Scrim Layer */}
          <div style={scrimStyle} />

          {/* Controls Layer */}
          <div style={controlsLayerStyle}>
            <div style={topRowStyle}>
              <div style={liveTagStyle}>Ao vivo</div>
            </div>

            <div style={bottomSectionStyle}>
              <div style={nowWatchingStyle}>
                Assistindo: {activeChannel.name}
              </div>

              <div style={railWrapperStyle}>
                <TileButton
                  variant="icon-label"
                  icon={<HomeIcon size={32} />}
                  label="Tela de início"
                  isFocused={focusedIndex === 0}
                  onClick={() => onExit?.()}
                />

                {channels.map((channel, i) => (
                  <div
                    key={channel.id}
                    style={{
                      borderRadius: '16px',
                      background: channel.backgroundColor,
                      outline: activeChannelId === channel.id && focusedIndex !== i + 1
                        ? '3px solid rgba(255,255,255,0.4)'
                        : 'none',
                      transition: 'outline 0.2s ease',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <TileButton
                      variant="image"
                      image={channel.logoFull || channel.logo || PLACEHOLDER_LOGO}
                      label={channel.name}
                      alt={channel.name}
                      isFocused={focusedIndex === i + 1}
                      onClick={() => setActiveChannelId(channel.id)}
                      imageObjectFit="contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
  )
);

LivePlayer.displayName = 'LivePlayer';
