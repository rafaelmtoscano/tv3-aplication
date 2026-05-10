import React, { forwardRef, useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle } from 'react';
import { VideoPlayer } from '../VideoPlayer';
import { TileButton } from '../TileButton';
import { ActionButton } from '../ActionButton';
import { EPGRail } from '../EPGRail';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { allSchedules, getUpcomingPrograms, getCurrentProgram } from '../../data/schedule';
import { CloseIcon } from '../../icons';
import { useSettings } from '../../context/SettingsContext';
import type { EPGEntry } from '../../data/schedule';

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
  singleChannel?: boolean;
  onExit?: () => void;
  onChannelChange?: (channelId: string) => void;
  onOpenResources?: () => void;
  onControlsVisibilityChange?: (visible: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const PLACEHOLDER_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"><rect width="120" height="80" rx="8" fill="%23334155"/><rect x="40" y="28" width="40" height="24" rx="4" fill="%2364748b"/><circle cx="60" cy="40" r="8" fill="%2394a3b8"/></svg>';

export const LivePlayer = React.memo(
  forwardRef<HTMLDivElement, LivePlayerProps>(
    ({ channels = [], initialChannelId, singleChannel = false, onExit, onChannelChange, onOpenResources, onControlsVisibilityChange, disabled = false, className }, ref) => {
      const { settings } = useSettings();
      const [activeChannelId, setActiveChannelId] = useState(
        initialChannelId || channels[0]?.id
      );
      const [focusedIndex, setFocusedIndex] = useState(channels.length > 0 ? 1 : 0);
      const [controlsVisible, setControlsVisible] = useState(true);
      const [showEPG, setShowEPG] = useState(false);
      const [epgFocusedIndex, setEpgFocusedIndex] = useState(0);
      // singleChannel: posição na rail unificada. -1 = botão Sair, 0..N = EPG cards
      const [singleFocusIndex, setSingleFocusIndex] = useState(-1);
      const [reminderEntry, setReminderEntry] = useState<EPGEntry | null>(null);

      const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
      const containerRef = useRef<HTMLDivElement>(null);

      const activeChannel = useMemo(
        () => channels.find((c) => c.id === activeChannelId) || channels[0],
        [channels, activeChannelId]
      );

      const currentProgram = useMemo(() => {
        const schedule = allSchedules[activeChannelId];
        if (!schedule) return null;
        return getCurrentProgram(schedule);
      }, [activeChannelId]);

      const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setControlsVisible(true);
        onControlsVisibilityChange?.(true);
        timeoutRef.current = setTimeout(() => {
          setControlsVisible(false);
          onControlsVisibilityChange?.(false);
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

      const handleChannelChange = useCallback((id: string) => {
        setActiveChannelId(id);
        onChannelChange?.(id);
      }, [onChannelChange]);

      const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        resetTimer();

        // Prevent navigation keys from leaking to global handler
        const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Backspace', ' '];
        if (navKeys.includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }

        // Reminder modal takes priority
        if (reminderEntry !== null) {
          if (e.key === 'Escape' || e.key === 'Backspace') {
            e.preventDefault();
            e.stopPropagation();
            setReminderEntry(null);
          }
          return;
        }

        // ─── singleChannel: rail unificada [Sair, EPG0, EPG1, ...] ─────────
        if (singleChannel) {
          // índices: -2 = Recursos (se disponível), -1 = Sair, 0..7 = EPG cards
          const minIndex = onOpenResources ? -2 : -1;
          switch (e.key) {
            case 'ArrowRight':
              setSingleFocusIndex((i) => Math.min(i + 1, 7));
              break;

            case 'ArrowLeft':
              setSingleFocusIndex((i) => Math.max(i - 1, minIndex));
              break;

            case 'Enter':
            case ' ':
              if (singleFocusIndex === -2 && onOpenResources) {
                // Recursos
                e.nativeEvent.stopImmediatePropagation();
                onOpenResources();
              } else if (singleFocusIndex === -1) {
                // Sair
                e.nativeEvent.stopImmediatePropagation();
                onExit?.();
              } else {
                // EPG card
                const epgEntries = getUpcomingPrograms(allSchedules[activeChannel.id], 8);
                const entry = epgEntries[singleFocusIndex];
                if (entry) setReminderEntry(entry);
              }
              break;

            case 'Escape':
            case 'Backspace':
              e.nativeEvent.stopImmediatePropagation();
              onExit?.();
              break;

            default:
              break;
          }
          return;
        }

        // ─── multiChannel: comportamento original ──────────────────────────
        switch (e.key) {
          case 'ArrowDown':
            if (controlsVisible && !showEPG) {
              e.preventDefault();
              setShowEPG(true);
              setEpgFocusedIndex(0);
            }
            break;

          case 'ArrowUp':
            if (showEPG) {
              e.preventDefault();
              setShowEPG(false);
            }
            break;

          case 'ArrowRight':
            if (showEPG) {
              e.preventDefault();
              const epgMax = onOpenResources ? 8 : 7; // 0..7 = EPG cards, 8 = Recursos
              setEpgFocusedIndex((i) => Math.min(i + 1, epgMax));
            } else {
              setFocusedIndex((prev) => {
                const next = Math.min(prev + 1, channels.length);
                // Troca canal instantaneamente ao navegar (index 0 = Sair)
                if (next > 0 && channels[next - 1]) {
                  handleChannelChange(channels[next - 1].id);
                }
                return next;
              });
            }
            break;

          case 'ArrowLeft':
            if (showEPG) {
              e.preventDefault();
              setEpgFocusedIndex((i) => Math.max(i - 1, 0));
            } else {
              setFocusedIndex((prev) => {
                const next = Math.max(prev - 1, 0);
                // Troca canal instantaneamente ao navegar (index 0 = Sair)
                if (next > 0 && channels[next - 1]) {
                  handleChannelChange(channels[next - 1].id);
                }
                return next;
              });
            }
            break;

          case 'Enter':
            if (showEPG) {
              e.preventDefault();
              if (onOpenResources && epgFocusedIndex === 8) {
                e.nativeEvent.stopImmediatePropagation();
                onOpenResources();
              } else {
                const epgEntries = getUpcomingPrograms(allSchedules[activeChannel.id], 8);
                const entry = epgEntries[epgFocusedIndex];
                if (entry) setReminderEntry(entry);
              }
            } else {
              if (focusedIndex === 0) {
                e.nativeEvent.stopImmediatePropagation();
                onExit?.();
              } else if (channels[focusedIndex - 1]) {
                handleChannelChange(channels[focusedIndex - 1].id);
              }
            }
            break;

          case ' ':
            if (!showEPG) {
              if (focusedIndex === 0) {
                e.nativeEvent.stopImmediatePropagation();
                onExit?.();
              } else if (channels[focusedIndex - 1]) {
                handleChannelChange(channels[focusedIndex - 1].id);
              }
            }
            break;

          case 'Escape':
          case 'Backspace':
            e.nativeEvent.stopImmediatePropagation();
            if (showEPG) {
              setShowEPG(false);
            } else {
              onExit?.();
            }
            break;

          default:
            break;
        }
      }, [controlsVisible, showEPG, singleChannel, singleFocusIndex, channels, activeChannel, focusedIndex, epgFocusedIndex, reminderEntry, resetTimer, onExit, handleChannelChange, onOpenResources, disabled]);

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
        marginBottom: 0,
      };

      const toggleLabelStyle: React.CSSProperties = {
        ...typography.body.medium,
        color: colors.text.secondaryInverse,
        marginBottom: 8,
      };

      const railContainerStyle: React.CSSProperties = {
        opacity: 1,
        transition: 'opacity 0.3s ease-out',
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
        height: '312px',
        paddingBlock: '32px',
        marginBlock: '-32px',
        boxSizing: 'content-box',
      };

      const reminderOverlayStyle: React.CSSProperties = {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };

      const reminderCardStyle: React.CSSProperties = {
        background: colors.background.baseInverse,
        borderRadius: 24,
        padding: 48,
        maxWidth: 600,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        boxSizing: 'border-box',
      };

      const reminderTitleStyle: React.CSSProperties = {
        ...typography.headline.large,
        color: colors.text.primaryInverse,
        margin: 0,
      };

      const reminderSubtitleStyle: React.CSSProperties = {
        ...typography.body.medium,
        color: colors.text.secondaryInverse,
        margin: 0,
      };

      const reminderActionsStyle: React.CSSProperties = {
        display: 'flex',
        gap: 16,
      };

      return (
        <div
          ref={containerRef}
          style={containerStyle}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onBlur={() => containerRef.current?.focus()}
          className={className}
        >
          {/* Video Layer */}
          <VideoPlayer
            src={activeChannel.streamUrl}
            muted={false}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
          />

          {/* Scrim Layer */}
          <div style={scrimStyle} />

          {/* Controls Layer */}
          <div style={controlsLayerStyle}>
            <div style={topRowStyle}>
              <div style={liveTagStyle}>Ao vivo</div>
              {settings.ccEnabled && (
                <span style={{
                  ...typography.label.small,
                  color: colors.text.primaryInverse,
                  background: colors.background.brandPrimary,
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 600,
                  marginLeft: 12,
                }}>CC</span>
              )}
            </div>

            <div style={bottomSectionStyle}>
              <div style={nowWatchingStyle}>
                Assistindo {activeChannel.name}
                {currentProgram && (
                  <div style={{
                    ...typography.body.medium,
                    color: colors.text.secondaryInverse,
                    marginTop: 4,
                  }}>
                    {currentProgram.title}
                  </div>
                )}
              </div>

              <div style={toggleLabelStyle}>
                {singleChannel ? 'Programação' : (showEPG ? 'Canais ▲' : 'Programação ▼')}
              </div>

              <div style={railContainerStyle}>
                {singleChannel ? (
                  /* ── singleChannel: Sair + EPG lado a lado ── */
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'center', height: '312px' }}>
                    {onOpenResources && (
                      <div style={{ flexShrink: 0 }}>
                        <TileButton
                          variant="icon-label"
                          label="Recursos"
                          icon={<span style={{ fontSize: 28 }}>☰</span>}
                          isFocused={singleFocusIndex === -2}
                          onClick={() => onOpenResources?.()}
                        />
                      </div>
                    )}
                    <div style={{ flexShrink: 0 }}>
                      <TileButton
                        variant="icon-label"
                        label="Sair"
                        icon={<CloseIcon size={32} />}
                        isFocused={singleFocusIndex === -1}
                        onClick={() => onExit?.()}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <EPGRail
                        channelId={activeChannel.id}
                        channelLogo={activeChannel.logo}
                        channelName={activeChannel.name}
                        focusedIndex={singleFocusIndex >= 0 ? singleFocusIndex : -1}
                        onFocusedIndexChange={(i) => setSingleFocusIndex(i)}
                        onItemClick={(entry) => setReminderEntry(entry)}
                        cardBackground={colors.background.baseInverse}
                      />
                    </div>
                  </div>
                ) : !showEPG ? (
                  /* ── multiChannel: rail de canais ── */
                  <div style={railWrapperStyle}>
                    <TileButton
                      variant="icon-label"
                      label="Sair"
                      icon={<CloseIcon size={32} />}
                      isFocused={focusedIndex === 0}
                      onClick={() => onExit?.()}
                    />
                    {channels.map((channel, i) => (
                      <div
                        key={channel.id}
                        style={{
                          outline: activeChannelId === channel.id && focusedIndex !== i + 1
                            ? '3px solid rgba(255,255,255,0.4)'
                            : 'none',
                          transition: 'outline 0.2s ease',
                          flexShrink: 0,
                        }}
                      >
                        <TileButton
                          variant="image"
                          image={channel.logoFull || channel.logo || PLACEHOLDER_LOGO}
                          label={channel.name}
                          alt={channel.name}
                          isFocused={focusedIndex === i + 1}
                          onClick={() => handleChannelChange(channel.id)}
                          imageObjectFit="contain"
                          backgroundColor={channel.backgroundColor}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ── multiChannel: EPG expandida ── */
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'center', height: '312px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <EPGRail
                        channelId={activeChannel.id}
                        channelLogo={activeChannel.logo}
                        channelName={activeChannel.name}
                        focusedIndex={epgFocusedIndex <= 7 ? epgFocusedIndex : -1}
                        onFocusedIndexChange={setEpgFocusedIndex}
                        onNavigateUp={() => setShowEPG(false)}
                        onItemClick={(entry) => setReminderEntry(entry)}
                        cardBackground={colors.background.baseInverse}
                      />
                    </div>
                    {onOpenResources && (
                      <div style={{ flexShrink: 0 }}>
                        <TileButton
                          variant="icon-label"
                          label="Recursos"
                          icon={<span style={{ fontSize: 28 }}>☰</span>}
                          isFocused={epgFocusedIndex === 8}
                          onClick={() => onOpenResources?.()}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reminder Modal */}
          {reminderEntry && (
            <div style={reminderOverlayStyle}>
              <div style={reminderCardStyle}>
                <span style={reminderTitleStyle}>{reminderEntry.title}</span>
                <span style={reminderSubtitleStyle}>
                  {reminderEntry.time} – {reminderEntry.endTime}
                </span>
                <div style={reminderActionsStyle}>
                  <ActionButton
                    label="Cancelar"
                    state="idle"
                    onClick={() => setReminderEntry(null)}
                  />
                  <ActionButton
                    label="Adicionar lembrete"
                    state="focus"
                    onClick={() => {
                      // TODO: implementar notificação
                      setReminderEntry(null);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
  )
);

LivePlayer.displayName = 'LivePlayer';
