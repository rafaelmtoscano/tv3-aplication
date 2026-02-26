import React, { useState, forwardRef, memo } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface ContentCardProps {
  /** Component variant */
  variant?: 'image' | 'image-text';
  /** Background image URL */
  image?: string;
  /** Optional logo image URL (top-left) */
  logo?: string;
  /** Category text (bottom-left) */
  label?: string;
  /** Time/date text (bottom-left) */
  timestamp?: string;
  /** Content title (bottom-left) */
  title?: string;
  /** Shows "Ao vivo" badge (top-right) */
  isLive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** External accessibility label */
  'aria-label'?: string;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
  /** External CSS class */
  className?: string;
  /** Manual focus override (mainly for Storybook) */
  isFocused?: boolean;
}

/**
 * ContentCard component for 10-foot TV UI carousel navigation.
 * Grows from center on focus with a spring animation.
 */
export const ContentCard = memo(
  forwardRef<HTMLButtonElement, ContentCardProps>(
    (
      {
        variant = 'image',
        image,
        logo,
        label,
        timestamp,
        title,
        isLive = false,
        onClick,
        onFocus,
        onBlur,
        'aria-label': ariaLabel,
        tabIndex = 0,
        className,
        isFocused: isFocusedProp,
      },
      ref
    ) => {
      const [isInternalFocused, setIsInternalFocused] = useState(false);
      const isFocused = isFocusedProp ?? isInternalFocused;

      const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
        setIsInternalFocused(true);
        onFocus?.();
      };

      const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
        setIsInternalFocused(false);
        onBlur?.();
      };

      const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: isFocused ? '564px' : '448px',
        height: isFocused ? '312px' : '248px',
        borderRadius: '27.13px',
        border: isFocused ? `8px solid ${colors.background.primary}` : 'none',
        boxShadow: isFocused ? '0 16px 48px rgba(0, 0, 0, 0.6)' : 'none',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        overflow: 'hidden',
        cursor: 'pointer',
        outline: 'none',
        background: colors.background.baseInverse,
        transition: 'all 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
        transformOrigin: 'center center',
        zIndex: isFocused ? 10 : 1,
      };

      const imageStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0,
        transition: 'transform 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
        transform: isFocused ? 'scale(1.05)' : 'scale(1)',
      };

      const scrimStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '70%',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
        display: 'block',
      };

      const contentLayerStyle: React.CSSProperties = {
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      };

      const topRowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
      };

      const liveTagStyle: React.CSSProperties = {
        background: '#E52207',
        borderRadius: '8px',
        padding: '4px 10px',
        color: '#FFF',
        fontFamily: typography.body.large.fontFamily,
        fontSize: '24px',
        fontWeight: 500,
        lineHeight: '145%',
        letterSpacing: '0.24px',
      };

      const bottomRowStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        alignItems: 'flex-start',
      };

      return (
        <button
          ref={ref}
          type="button"
          style={containerStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={onClick}
          tabIndex={tabIndex}
          className={className}
          aria-label={ariaLabel || title || 'Content card'}
        >
          {image && <img src={image} alt="" style={imageStyle} />}
          
          <div style={scrimStyle} />

          <div style={contentLayerStyle}>
            <div style={topRowStyle}>
              {logo ? (
                <img src={logo} alt="" style={{ height: '32px', objectFit: 'contain' }} />
              ) : (
                <div />
              )}
              {isLive && <div style={liveTagStyle}>Ao vivo</div>}
            </div>

            {variant === 'image-text' && (
              <div style={bottomRowStyle}>
                {label && (
                  <span style={{ ...typography.label.small, color: colors.text.primaryInverse }}>
                    {label}
                  </span>
                )}
                {timestamp && (
                  <span
                    style={{
                      ...typography.body.small,
                      color: colors.text.primaryInverse,
                      fontSize: '16px',
                      fontWeight: 500,
                      lineHeight: '145%',
                      letterSpacing: '0.2px',
                    }}
                  >
                    {timestamp}
                  </span>
                )}
                {title && (
                  <span
                    style={{
                      ...typography.body.large,
                      color: colors.text.primaryInverse,
                      fontSize: '24px',
                      fontWeight: 500,
                      lineHeight: '145%',
                      letterSpacing: '0.24px',
                    }}
                  >
                    {title}
                  </span>
                )}
              </div>
            )}
          </div>
        </button>
      );
    }
  )
);

ContentCard.displayName = 'ContentCard';
