import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { SearchIcon } from '../../icons';
import { ContentCard } from '../../components/ContentCard/ContentCard';
import { EPGCard } from '../../components/EPGCard/EPGCard';
import { channels } from '../../data/channels';
import { allSchedules, getUpcomingPrograms } from '../../data/schedule';
import type { EPGEntry } from '../../data/schedule';

interface SearchProps {
  isActive: boolean;
  onLiveChannel?: (channelId: string) => void;
  onWatchVideo?: (videoUrl: string, title?: string, logo?: string, channelName?: string) => void;
}

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L','⌫'],
  ['Z','X','C','V','B','N','M','.','-','_'],
];

// Last row handled separately: ESPAÇO + 🔍

const RAIL_HEIGHT = 280;

interface RailData {
  id: string;
  title: string;
  items: unknown[];
  type: 'channels' | 'content' | 'schedule';
}

export default function Search({ isActive, onLiveChannel, onWatchVideo }: SearchProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [keyboardRow, setKeyboardRow] = useState(0);
  const [keyboardCol, setKeyboardCol] = useState(0);
  const [zone, setZone] = useState<'keyboard' | 'results'>('keyboard');
  const [activeRailIndex, setActiveRailIndex] = useState(0);
  const [railFocusedIndex, setRailFocusedIndex] = useState(0);

  // Refs for scrollIntoView on result cards
  const cardRefsMap = useRef<Map<string, (HTMLDivElement | null)[]>>(new Map());

  // Reset state when page becomes active
  useEffect(() => {
    if (isActive) {
      setKeyboardRow(0);
      setKeyboardCol(0);
      setZone('keyboard');
      setActiveRailIndex(0);
      setRailFocusedIndex(0);
      containerRef.current?.focus();
    }
  }, [isActive]);

  // Search logic
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    const matchedChannels = channels.filter(c =>
      !q || c.name.toLowerCase().includes(q) || c.id.includes(q)
    );

    const matchedContent = q
      ? channels.flatMap(ch =>
          (ch.programs || [])
            .filter(p => p.title.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q))
            .map(p => ({ ...p, channelId: ch.id, channelName: ch.name, logo: ch.logo }))
        ).slice(0, 20)
      : [];

    const matchedSchedule: (EPGEntry & { channelId: string; channelName?: string; logo?: string })[] = q
      ? Object.entries(allSchedules).flatMap(([channelId, schedule]) => {
          const ch = channels.find(c => c.id === channelId);
          return getUpcomingPrograms(schedule, 20)
            .filter(e => e.title.toLowerCase().includes(q))
            .map(e => ({ ...e, channelId, channelName: ch?.name, logo: ch?.logo }));
        }).slice(0, 20)
      : [];

    return { matchedChannels, matchedContent, matchedSchedule };
  }, [query]);

  // Build active rails
  const activeRails = useMemo(() => {
    const rails: RailData[] = [];
    if (results.matchedChannels.length > 0) {
      rails.push({
        id: 'channels',
        title: query ? 'Canais' : 'Todos os canais',
        items: results.matchedChannels,
        type: 'channels',
      });
    }
    if (results.matchedContent.length > 0 && query) {
      rails.push({
        id: 'content',
        title: 'Conteúdos',
        items: results.matchedContent,
        type: 'content',
      });
    }
    if (results.matchedSchedule.length > 0) {
      rails.push({
        id: 'schedule',
        title: 'Programação',
        items: results.matchedSchedule,
        type: 'schedule',
      });
    }
    return rails;
  }, [results, query]);

  // Clamp rail indices when rails change
  useEffect(() => {
    if (activeRailIndex >= activeRails.length && activeRails.length > 0) {
      setActiveRailIndex(0);
      setRailFocusedIndex(0);
    }
  }, [activeRails.length, activeRailIndex]);

  // ScrollIntoView for focused result card
  useEffect(() => {
    if (zone !== 'results') return;
    const rail = activeRails[activeRailIndex];
    if (!rail) return;
    const refs = cardRefsMap.current.get(rail.id);
    if (refs && refs[railFocusedIndex]) {
      refs[railFocusedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [zone, activeRailIndex, railFocusedIndex, activeRails]);

  // Get row length for keyboard navigation
  const getRowLength = useCallback((row: number) => {
    if (row < 3) return KEYBOARD_ROWS[row].length;
    return 2; // ESPAÇO (0) and 🔍 (1)
  }, []);

  // Get key label at row,col
  const getKeyAt = useCallback((row: number, col: number): string => {
    if (row < 3) return KEYBOARD_ROWS[row][col] || '';
    return col === 0 ? 'ESPAÇO' : '🔍';
  }, []);

  // Execute key action
  const executeKey = useCallback((key: string) => {
    if (key === '⌫') {
      setQuery(q => q.slice(0, -1));
    } else if (key === 'ESPAÇO') {
      setQuery(q => (q + ' ').slice(0, 40));
    } else if (key === '🔍') {
      if (activeRails.length > 0) {
        setZone('results');
        setActiveRailIndex(0);
        setRailFocusedIndex(0);
      }
    } else if (key.length === 1) {
      setQuery(q => (q + key.toLowerCase()).slice(0, 40));
    }
  }, [activeRails.length]);

  // Execute Enter on a result
  const executeResultEnter = useCallback(() => {
    const rail = activeRails[activeRailIndex];
    if (!rail) return;

    if (rail.type === 'channels') {
      const channel = results.matchedChannels[railFocusedIndex];
      if (channel?.streamUrl && onLiveChannel) {
        onLiveChannel(channel.id);
      }
    } else if (rail.type === 'content') {
      const prog = results.matchedContent[railFocusedIndex];
      if (prog?.videoUrl && onWatchVideo) {
        onWatchVideo(prog.videoUrl, prog.title, prog.logo, prog.channelName);
      }
    }
    // schedule: no action yet
  }, [activeRails, activeRailIndex, railFocusedIndex, results, onLiveChannel, onWatchVideo]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Physical keyboard shortcuts (always active)
    if (e.key === 'Backspace') {
      e.preventDefault();
      setQuery(q => q.slice(0, -1));
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (query) {
        setQuery('');
      }
      return;
    }

    // Printable character - append to query (unless Arrow or Enter)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey &&
        !['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter',' '].includes(e.key)) {
      e.preventDefault();
      setQuery(q => (q + e.key.toLowerCase()).slice(0, 40));
      setZone('keyboard');
      return;
    }

    if (zone === 'keyboard') {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (keyboardRow > 0) {
            const newRow = keyboardRow - 1;
            setKeyboardRow(newRow);
            setKeyboardCol(c => Math.min(c, getRowLength(newRow) - 1));
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (keyboardRow < 3) {
            const newRow = keyboardRow + 1;
            setKeyboardRow(newRow);
            setKeyboardCol(c => Math.min(c, getRowLength(newRow) - 1));
          } else if (activeRails.length > 0) {
            setZone('results');
            setActiveRailIndex(0);
            setRailFocusedIndex(0);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (keyboardCol > 0) {
            setKeyboardCol(c => c - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (keyboardCol < getRowLength(keyboardRow) - 1) {
            setKeyboardCol(c => c + 1);
          } else if (activeRails.length > 0) {
            setZone('results');
            setActiveRailIndex(0);
            setRailFocusedIndex(0);
          }
          break;
        case 'Enter':
          e.preventDefault();
          executeKey(getKeyAt(keyboardRow, keyboardCol));
          break;
        default:
          break;
      }
    } else {
      // zone === 'results'
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (activeRailIndex > 0) {
            setActiveRailIndex(r => r - 1);
            setRailFocusedIndex(0);
          } else {
            setZone('keyboard');
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (activeRailIndex < activeRails.length - 1) {
            setActiveRailIndex(r => r + 1);
            setRailFocusedIndex(0);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (railFocusedIndex > 0) {
            setRailFocusedIndex(i => i - 1);
          } else {
            setZone('keyboard');
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          {
            const rail = activeRails[activeRailIndex];
            if (rail && railFocusedIndex < Math.min(rail.items.length - 1, 9)) {
              setRailFocusedIndex(i => i + 1);
            }
          }
          break;
        case 'Enter':
          e.preventDefault();
          executeResultEnter();
          break;
        default:
          break;
      }
    }
  }, [zone, keyboardRow, keyboardCol, activeRails, activeRailIndex, railFocusedIndex, query, getRowLength, getKeyAt, executeKey, executeResultEnter]);

  // Styles
  const rootStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: colors.background.baseInverse,
    display: 'flex',
    flexDirection: 'column',
    outline: 'none',
  };

  const inputBarStyle: React.CSSProperties = {
    height: '96px',
    paddingLeft: '136px',
    paddingRight: '64px',
    paddingTop: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0,
  };

  const mainAreaStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 0,
  };

  const keyboardColumnStyle: React.CSSProperties = {
    width: '520px',
    flexShrink: 0,
    paddingLeft: '136px',
    paddingRight: '24px',
    paddingTop: '24px',
    overflow: 'hidden',
  };

  const resultsColumnStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    paddingLeft: '32px',
    paddingRight: '64px',
    paddingTop: 0,
    position: 'relative',
  };

  // Virtual scroll for results
  const scrollY = zone === 'results' && activeRailIndex > 0
    ? activeRailIndex * RAIL_HEIGHT - 80
    : 0;

  const resultsContentStyle: React.CSSProperties = {
    transform: `translateY(-${scrollY}px)`,
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    paddingTop: '8px',
  };

  const renderKeyboard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
            {row.map((key, colIdx) => {
              const isFocused = zone === 'keyboard' && keyboardRow === rowIdx && keyboardCol === colIdx;
              return (
                <button
                  key={key}
                  type="button"
                  tabIndex={-1}
                  style={{
                    width: '30px',
                    height: '42px',
                    flexShrink: 0,
                    borderRadius: '6px',
                    background: isFocused ? colors.background.brandPrimary : 'rgba(255,255,255,0.08)',
                    color: colors.text.primaryInverse,
                    ...typography.body.small,
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background 0.2s ease',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => executeKey(key)}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
        {/* Last row: ESPAÇO + 🔍 */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            tabIndex={-1}
            style={{
              height: '42px',
              flex: 1,
              borderRadius: '6px',
              background: zone === 'keyboard' && keyboardRow === 3 && keyboardCol === 0
                ? colors.background.brandPrimary
                : 'rgba(255,255,255,0.08)',
              color: colors.text.primaryInverse,
              ...typography.body.small,
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 0.2s ease',
            }}
            onClick={() => executeKey('ESPAÇO')}
          >
            ESPAÇO
          </button>
          <button
            type="button"
            tabIndex={-1}
            style={{
              height: '42px',
              width: '72px',
              borderRadius: '6px',
              background: zone === 'keyboard' && keyboardRow === 3 && keyboardCol === 1
                ? colors.background.brandPrimary
                : 'rgba(255,255,255,0.08)',
              color: colors.text.primaryInverse,
              ...typography.body.small,
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => executeKey('🔍')}
          >
            <SearchIcon size={20} color={colors.text.primaryInverse} />
          </button>
        </div>
      </div>
    );
  };

  const setCardRef = (railId: string, index: number, el: HTMLDivElement | null) => {
    if (!cardRefsMap.current.has(railId)) {
      cardRefsMap.current.set(railId, []);
    }
    const refs = cardRefsMap.current.get(railId)!;
    refs[index] = el;
  };

  const renderRails = () => {
    if (query.length > 0 && activeRails.length === 0) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
        }}>
          <span style={{
            ...typography.body.large,
            color: colors.text.secondaryInverse,
          }}>
            Nenhum resultado para &quot;{query}&quot;
          </span>
        </div>
      );
    }

    return (
      <div style={resultsContentStyle}>
        {activeRails.map((rail, railIdx) => (
          <div key={rail.id}>
            <div style={{
              ...typography.headline.small,
              color: colors.text.secondaryInverse,
              marginBottom: '12px',
            }}>
              {rail.title}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '16px',
                overflowX: 'hidden',
                overflowY: 'visible',
                position: 'relative',
                height: rail.type === 'channels' ? '110px' : rail.type === 'schedule' ? '196px' : '260px',
                alignItems: 'center',
              }}
            >
              {rail.type === 'channels' && results.matchedChannels.map((ch, cardIdx) => {
                const isFocused = zone === 'results' && activeRailIndex === railIdx && railFocusedIndex === cardIdx;
                return (
                  <div
                    key={ch.id}
                    ref={(el) => setCardRef(rail.id, cardIdx, el)}
                    style={{
                      width: '160px',
                      height: '90px',
                      flexShrink: 0,
                      borderRadius: '12px',
                      background: ch.backgroundColor || 'rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isFocused ? `3px solid ${colors.background.brandPrimary}` : '3px solid transparent',
                      transition: 'border 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (ch.streamUrl && onLiveChannel) onLiveChannel(ch.id);
                    }}
                  >
                    <img
                      src={ch.logo}
                      alt={ch.name}
                      style={{
                        maxWidth: '120px',
                        maxHeight: '60px',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                );
              })}
              {rail.type === 'content' && results.matchedContent.map((prog, cardIdx) => {
                const isFocused = zone === 'results' && activeRailIndex === railIdx && railFocusedIndex === cardIdx;
                return (
                  <div
                    key={`${prog.channelId}-${prog.id}`}
                    ref={(el) => setCardRef(rail.id, cardIdx, el)}
                    style={{ flexShrink: 0 }}
                  >
                    <ContentCard
                      variant="image-text"
                      image={prog.thumbnail}
                      title={prog.title}
                      label={prog.category}
                      logo={prog.logo}
                      isFocused={isFocused}
                      tabIndex={-1}
                      onClick={() => {
                        if (prog.videoUrl && onWatchVideo) onWatchVideo(prog.videoUrl, prog.title, prog.logo, prog.channelName);
                      }}
                    />
                  </div>
                );
              })}
              {rail.type === 'schedule' && results.matchedSchedule.map((entry, cardIdx) => {
                const isFocused = zone === 'results' && activeRailIndex === railIdx && railFocusedIndex === cardIdx;
                return (
                  <div
                    key={`${entry.channelId}-${entry.time}-${cardIdx}`}
                    ref={(el) => setCardRef(rail.id, cardIdx, el)}
                    style={{ flexShrink: 0 }}
                  >
                    <EPGCard
                      variant="next"
                      startTime={entry.time}
                      endTime={entry.endTime}
                      title={entry.title}
                      channelName={entry.channelName}
                      isFocused={isFocused}
                      tabIndex={-1}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      style={rootStyle}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Input bar */}
      <div style={inputBarStyle}>
        <SearchIcon size={32} color={colors.text.secondaryInverse} />
        <div style={{
          ...typography.headline.large,
          color: query ? colors.text.primaryInverse : colors.text.disabledInverse,
          display: 'flex',
          alignItems: 'center',
        }}>
          {query ? (
            <>
              <span>{query}</span>
              <span style={{
                color: colors.background.brandPrimary,
                animation: 'blink 1s step-end infinite',
                marginLeft: '2px',
              }}>|</span>
            </>
          ) : (
            <span>Buscar canais, programas...</span>
          )}
        </div>
      </div>

      {/* Main area */}
      <div style={mainAreaStyle}>
        {/* Virtual keyboard */}
        <div style={keyboardColumnStyle}>
          {renderKeyboard()}
        </div>

        {/* Results */}
        <div style={resultsColumnStyle}>
          {renderRails()}
        </div>
      </div>
    </div>
  );
}
