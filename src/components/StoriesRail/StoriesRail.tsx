import React, { useState, useRef, useEffect } from 'react';
import { StoryCard } from '../StoryCard';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface StoryItem {
  id: string;
  videoUrl: string;
  videoType?: 'mp4' | 'youtube';
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

const IDLE_HEIGHT = 440;
const FOCUSED_HEIGHT = 554; // altura quando qualquer item está em foco
const TRANSITION = '0.4s cubic-bezier(0.4, 0, 0.2, 1)';

export function StoriesRail({
  title,
  items,
  focusedIndex,
  onFocusedIndexChange,
}: StoriesRailProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const railRef = useRef<HTMLDivElement>(null);

  const hasFocused = focusedIndex >= 0;
  const railHeight = hasFocused ? FOCUSED_HEIGHT : IDLE_HEIGHT;

  const handleEnded = (index: number) => {
    if (index < items.length - 1) {
      setActiveIndex(index + 1);
      onFocusedIndexChange?.(index + 1);
    } else {
      setActiveIndex(-1);
    }
  };

  // When focus moves while a video is playing, follow with activeIndex
  useEffect(() => {
    if (focusedIndex >= 0 && activeIndex >= 0 && activeIndex !== focusedIndex) {
      setActiveIndex(focusedIndex);
    }
  }, [focusedIndex]);

  // Stop playback when focus leaves the rail
  useEffect(() => {
    if (focusedIndex < 0) {
      setActiveIndex(-1);
    }
  }, [focusedIndex]);

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
    height: railHeight + 64,
    paddingTop: 32,
    paddingBottom: 32,
    transition: `height ${TRANSITION}`,
    overflow: 'visible',
    boxSizing: 'border-box',
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
    padding: '32px 64px',
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
              videoType={item.videoType}
              thumbnail={item.thumbnail}
              title={item.title}
              duration={item.duration}
              isFocused={focusedIndex === i}
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
