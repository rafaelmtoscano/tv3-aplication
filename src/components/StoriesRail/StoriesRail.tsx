import React, { useState, useRef, useEffect } from 'react';
import { StoryCard } from '../StoryCard';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface StoryItem {
  id: string;
  videoUrl: string;
  thumbnail: string;
  title?: string;
  duration?: number;
}

export interface StoriesRailProps {
  title?: string;
  items: StoryItem[];
  focusedIndex: number;
  onFocusedIndexChange?: (index: number) => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
}

const IDLE_HEIGHT = 240;
const ACTIVE_HEIGHT = 420;
const TRANSITION = '0.4s cubic-bezier(0.4, 0, 0.2, 1)';

export function StoriesRail({
  title,
  items,
  focusedIndex,
}: StoriesRailProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const railRef = useRef<HTMLDivElement>(null);

  const hasActive = activeIndex >= 0;
  const railHeight = hasActive ? ACTIVE_HEIGHT : IDLE_HEIGHT;

  // Handle Enter key to start playback
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (focusedIndex < 0) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        setActiveIndex(focusedIndex);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [focusedIndex]);

  // Stop playback when focus leaves the rail
  useEffect(() => {
    if (focusedIndex < 0) {
      setActiveIndex(-1);
    }
  }, [focusedIndex]);

  const handleEnded = (index: number) => {
    if (index < items.length - 1) {
      setActiveIndex(index + 1);
    } else {
      setActiveIndex(-1);
    }
  };

  // Scroll focused card into view
  useEffect(() => {
    if (focusedIndex < 0 || !railRef.current) return;
    const child = railRef.current.children[focusedIndex] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  }, [focusedIndex]);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflow: 'visible',
  };

  const railOuterStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: railHeight,
    transition: `height ${TRANSITION}`,
    overflow: 'visible',
  };

  const railInnerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    overflowX: 'auto',
    overflowY: 'visible',
    padding: '0 64px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    scrollBehavior: 'smooth',
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle}>
      {title && (
        <h2 style={{
          ...typography.headline.large,
          color: colors.text.primaryInverse,
          paddingLeft: '64px',
          margin: 0,
        }}>
          {title}
        </h2>
      )}

      <div style={railOuterStyle}>
        <div ref={railRef} className="stories-rail-hide-scrollbar" style={railInnerStyle}>
          {items.map((item, i) => (
            <StoryCard
              key={item.id}
              id={item.id}
              videoUrl={item.videoUrl}
              thumbnail={item.thumbnail}
              title={item.title}
              duration={item.duration}
              isFocused={focusedIndex === i}
              isActive={activeIndex === i}
              onEnded={() => handleEnded(i)}
            />
          ))}
        </div>
      </div>

      <style>{`
        .stories-rail-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
