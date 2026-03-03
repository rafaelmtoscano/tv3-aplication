import React, { useState, forwardRef, memo, useRef, useEffect, useMemo } from 'react';
import { allSchedules, getUpcomingPrograms } from '../../data/schedule';
import type { EPGEntry } from '../../data/schedule';
import { EPGCard } from '../EPGCard';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';

export interface EPGRailProps {
  channelId: string;
  channelLogo?: string;
  channelName?: string;
  focusedIndex?: number;           // -1 = no focus; controlled externally
  onFocusedIndexChange?: (index: number) => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onItemClick?: (entry: EPGEntry) => void;
  className?: string;
}

const DAY_ABBR: Record<number, string> = {
  0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb'
};

// Internal helpers mirrored from schedule.ts
function getBrasiliaDate(now: Date = new Date()): Date {
  const brasiliaOffset = -3 * 60;
  const utcMinutes = now.getTime() / 60000 + now.getTimezoneOffset();
  return new Date((utcMinutes + brasiliaOffset) * 60000);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * EPGRail component for a horizontal scrolling program guide rail.
 */
export const EPGRail = memo(
  forwardRef<HTMLDivElement, EPGRailProps>(
    (
      {
        channelId,
        channelLogo,
        channelName,
        focusedIndex: controlledFocusedIndex,
        onFocusedIndexChange,
        onNavigateUp,
        onNavigateDown,
        onItemClick,
        className,
      },
      ref
    ) => {
      const [internalFocusedIndex, setInternalFocusedIndex] = useState(-1);
      const isControlled = controlledFocusedIndex !== undefined;
      const focusedIndex = isControlled ? controlledFocusedIndex : internalFocusedIndex;

      const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);

      const schedule = allSchedules[channelId];

      const { entries, dayAbbr, progressPercent } = useMemo(() => {
        if (!schedule) return { entries: [], dayAbbr: '', progressPercent: 0 };

        const now = new Date();
        const brasiliaDate = getBrasiliaDate(now);
        const upcomingEntries = getUpcomingPrograms(schedule, 8, now);
        
        let progress = 0;
        if (upcomingEntries.length > 0) {
          const currentMinutes = brasiliaDate.getHours() * 60 + brasiliaDate.getMinutes();
          const startMinutes = timeToMinutes(upcomingEntries[0].time);
          progress = Math.min(100, Math.max(0,
            ((currentMinutes - startMinutes) / upcomingEntries[0].durationMinutes) * 100
          ));
        }

        return {
          entries: upcomingEntries,
          dayAbbr: DAY_ABBR[brasiliaDate.getDay()],
          progressPercent: progress,
        };
      }, [schedule, channelId]);

      // Update refs array when entries change
      useEffect(() => {
        cardWrapperRefs.current = cardWrapperRefs.current.slice(0, entries.length);
      }, [entries]);

      // Scroll focused card into view
      useEffect(() => {
        if (focusedIndex >= 0 && cardWrapperRefs.current[focusedIndex]) {
          cardWrapperRefs.current[focusedIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }
      }, [focusedIndex]);

      const handleCardFocus = (index: number) => {
        if (!isControlled) {
          setInternalFocusedIndex(index);
        }
        onFocusedIndexChange?.(index);
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (focusedIndex === -1) return;

        switch (e.key) {
          case 'ArrowLeft':
            if (focusedIndex > 0) {
              e.preventDefault();
              handleCardFocus(focusedIndex - 1);
            }
            break;
          case 'ArrowRight':
            if (focusedIndex < entries.length - 1) {
              e.preventDefault();
              handleCardFocus(focusedIndex + 1);
            }
            break;
          case 'ArrowUp':
            if (onNavigateUp) {
              e.preventDefault();
              onNavigateUp();
            }
            break;
          case 'ArrowDown':
            if (onNavigateDown) {
              e.preventDefault();
              onNavigateDown();
            }
            break;
          case 'Enter':
            if (onItemClick && entries[focusedIndex]) {
              e.preventDefault();
              onItemClick(entries[focusedIndex]);
            }
            break;
          default:
            break;
        }
      };

      if (!schedule || entries.length === 0) return null;

      const outerSpaceStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        height: '196px',
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
      };

      const scrollContainerStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
        overflowX: 'auto',
        overflowY: 'visible',
        padding: '0 64px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        alignItems: 'center',
        boxSizing: 'border-box',
      };

      return (
        <div 
          ref={ref} 
          className={className} 
          style={{ width: '100%', outline: 'none' }}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div style={outerSpaceStyle}>
            <div className="hide-scrollbar" style={scrollContainerStyle}>
              {entries.map((entry, i) => (
                <div 
                  key={`${channelId}-${entry.time}-${i}`} 
                  ref={el => { cardWrapperRefs.current[i] = el; }}
                  style={{ flexShrink: 0 }}
                >
                  <EPGCard
                    variant={i === 0 ? 'now' : 'next'}
                    channelLogo={channelLogo}
                    channelName={channelName}
                    day={dayAbbr}
                    startTime={entry.time}
                    endTime={entry.endTime}
                    title={entry.title}
                    progressPercent={i === 0 ? progressPercent : undefined}
                    isFocused={focusedIndex === i}
                    onFocus={() => handleCardFocus(i)}
                    onBlur={() => !isControlled && setInternalFocusedIndex(-1)}
                    onClick={() => onItemClick?.(entry)}
                    tabIndex={focusedIndex === i || (focusedIndex === -1 && i === 0) ? 0 : -1}
                  />
                </div>
              ))}
            </div>
          </div>

          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      );
    }
  )
);

EPGRail.displayName = 'EPGRail';
