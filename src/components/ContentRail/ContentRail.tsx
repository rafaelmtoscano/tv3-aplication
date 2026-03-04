import React, { useState, forwardRef, memo, useRef, useEffect } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ContentCard } from '../ContentCard';
import type { ContentCardProps } from '../ContentCard';

export interface ContentRailItem extends Omit<ContentCardProps, 'onClick' | 'onFocus' | 'onBlur' | 'isFocused' | 'tabIndex'> {
  id: string;
}

export interface ContentRailProps {
  /** Optional section title */
  title?: string;
  /** Component variant for all cards */
  variant: 'image' | 'image-text';
  /** List of content items */
  items: ContentRailItem[];
  /** Callback for card click */
  onItemClick?: (id: string) => void;
  /** Callback for ArrowUp on the rail */
  onNavigateUp?: () => void;
  /** Callback for ArrowDown on the rail */
  onNavigateDown?: () => void;
  /** Controlled focused index */
  focusedIndex?: number;
  /** Callback for focus index change */
  onFocusedIndexChange?: (index: number) => void;
  /** External CSS class */
  className?: string;
}

/**
 * ContentRail component for a 10-foot TV UI.
 * Handles horizontal scrolling and keyboard navigation between cards.
 */
export const ContentRail = memo(
  forwardRef<HTMLDivElement, ContentRailProps>(
    (
      {
        title,
        variant,
        items,
        onItemClick,
        onNavigateUp,
        onNavigateDown,
        focusedIndex: controlledFocusedIndex,
        onFocusedIndexChange,
        className,
      },
      ref
    ) => {
      const [internalFocusedIndex, setInternalFocusedIndex] = useState(-1);
      const isControlled = controlledFocusedIndex !== undefined;
      const focusedIndex = isControlled ? controlledFocusedIndex : internalFocusedIndex;

      const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
      const scrollContainerRef = useRef<HTMLDivElement>(null);

      // Initialize or update refs array
      useEffect(() => {
        cardRefs.current = cardRefs.current.slice(0, items.length);
      }, [items]);

      // Scroll focused card into view
      useEffect(() => {
        if (focusedIndex >= 0 && cardRefs.current[focusedIndex]) {
          cardRefs.current[focusedIndex]?.scrollIntoView({
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
              cardRefs.current[focusedIndex - 1]?.focus();
            }
            break;
          case 'ArrowRight':
            if (focusedIndex < items.length - 1) {
              e.preventDefault();
              cardRefs.current[focusedIndex + 1]?.focus();
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
        gap: '48px',
        marginBottom: '64px',
        overflowX: 'visible',
        overflowY: 'visible',
      };

      const hasFocus = focusedIndex !== undefined && focusedIndex >= 0;
      const CARD_IDLE_HEIGHT = 248;
      const CARD_FOCUSED_HEIGHT = 312;

      // Outer div: reserves vertical breathing room so focused cards
      // (which grow upward/downward) are never clipped.
      const outerSpaceStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        height: hasFocus ? `${CARD_FOCUSED_HEIGHT}px` : `${CARD_IDLE_HEIGHT}px`,
        transition: 'height 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
        overflow: 'visible',
      };

      // Inner div: horizontal scroll only.
      // NOTE: A single element cannot have overflow-x: auto AND
      // overflow-y: visible at the same time (browser collapses
      // overflow-y to auto/hidden). The two-div split solves this.
      const scrollContainerStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        gap: '48px',
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
        <div ref={ref} className={className} style={containerStyle} onKeyDown={handleKeyDown}>
          {title && (
            <h2
              style={{
                ...typography.display.small,
                color: colors.text.primaryInverse,
                paddingLeft: '64px',
                margin: 0,
              }}
            >
              {title}
            </h2>
          )}

          <div style={outerSpaceStyle}>
            <div ref={scrollContainerRef} className="hide-scrollbar" style={scrollContainerStyle}>
              {items.map((item, index) => (
                <div key={item.id} style={{ flexShrink: 0 }}>
                  <ContentCard
                    ref={(el) => { cardRefs.current[index] = el; }}
                    variant={variant}
                    {...item}
                    tabIndex={focusedIndex === index || (focusedIndex === -1 && index === 0) ? 0 : -1}
                    onFocus={() => handleCardFocus(index)}
                    onBlur={() => !isControlled && setInternalFocusedIndex(-1)}
                    onClick={() => onItemClick?.(item.id)}
                    isFocused={focusedIndex === index}
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

ContentRail.displayName = 'ContentRail';
