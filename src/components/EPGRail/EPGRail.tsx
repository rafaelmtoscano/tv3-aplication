import React, { useState, forwardRef, memo, useRef, useEffect, useMemo } from 'react';
import { EPGCard } from '../EPGCard/EPGCard';
import { allSchedules, getUpcomingPrograms, EPGEntry } from '../../data/schedule';

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

const getBrasiliaDate = (now: Date = new Date()): Date => {
  const brasiliaOffset = -3 * 60; // UTC-3
  const utcMs = now.getTime();
  const brasiliaDate = new Date(utcMs + (now.getTimezoneOffset() + brasiliaOffset) * 60000);
  return brasiliaDate;
};

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/**
 * EPGRail component showing a single channel's current and upcoming programs.
 * Architecture matches ContentRail for consistent TV navigation.
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
      const scrollContainerRef = useRef<HTMLDivElement>(null);

      // Data Resolution
      const schedule = allSchedules[channelId];
      
      const entries = useMemo(() => {
        if (!schedule) return [];
        return getUpcomingPrograms(schedule, 8);
      }, [schedule]);

      // Progress calculation for the 'now' card
      const progressPercent = useMemo(() => {
        if (!entries.length) return 0;
        const now = getBrasiliaDate();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = timeToMinutes(entries[0].time);
        const progress = ((currentMinutes - startMinutes) / entries[0].durationMinutes) * 100;
        return Math.min(100, Math.max(0, progress));
      }, [entries]);

      const dayLabel = useMemo(() => {
        const now = getBrasiliaDate();
        return DAY_ABBR[now.getDay()];
      }, []);

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

      if (!schedule || entries.length === 0) {
        return null;
      }

      const handleCardFocus = (index: number) => {
        if (!isControlled) {
          setInternalFocusedIndex(index);
        }
        onFocusedIndexChange?.(index);
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        // If nothing is focused yet, allow navigation to start
        const currentIndex = focusedIndex === -1 ? 0 : focusedIndex;

        switch (e.key) {
          case 'ArrowLeft':
            if (currentIndex > 0) {
              e.preventDefault();
              handleCardFocus(currentIndex - 1);
            }
            break;
          case 'ArrowRight':
            if (currentIndex < entries.length - 1) {
              e.preventDefault();
              handleCardFocus(currentIndex + 1);
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
          default:
            break;
        }
      };

      const containerStyle: React.CSSProperties = {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'visible',
        overflowY: 'visible',
      };

      const outerSpaceStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        height: '196px', // Idle card 172px + breathing room
        overflow: 'visible',
      };

      const scrollContainerStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        overflowY: 'visible',
        padding: '0 64px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        scrollBehavior: 'smooth',
        alignItems: 'center',
        boxSizing: 'border-box',
      };

      return (
        <div
          ref={ref}
          className={className}
          style={containerStyle}
          onKeyDown={handleKeyDown}
        >
          <div style={outerSpaceStyle}>
            <div ref={scrollContainerRef} className="hide-scrollbar" style={scrollContainerStyle}>
              {entries.map((entry, index) => (
                <div 
                  key={`${channelId}-${entry.time}-${index}`} 
                  ref={(el) => { cardWrapperRefs.current[index] = el; }}
                  style={{ flexShrink: 0 }}
                >
                  <EPGCard
                    variant={index === 0 ? 'now' : 'next'}
                    channelLogo={channelLogo}
                    channelName={channelName}
                    day={dayLabel}
                    startTime={entry.time}
                    endTime={entry.endTime}
                    title={entry.title}
                    progressPercent={index === 0 ? progressPercent : 0}
                    isFocused={focusedIndex === index}
                    tabIndex={focusedIndex === index || (focusedIndex === -1 && index === 0) ? 0 : -1}
                    onFocus={() => handleCardFocus(index)}
                    onBlur={() => !isControlled && setInternalFocusedIndex(-1)}
                    onClick={() => onItemClick?.(entry)}
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
