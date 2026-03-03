import React, { useState, forwardRef, memo } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface EPGCardProps {
  /** Variant of the card: 'now' for current program, 'next' for upcoming */
  variant: 'now' | 'next';
  /** URL for the channel logo image (only shown in 'now' variant) */
  channelLogo?: string;
  /** Name of the channel (used for alt text) */
  channelName?: string;
  /** Day prefix (e.g. "Seg") */
  day?: string;
  /** Start time of the program (e.g. "09:30") */
  startTime: string;
  /** End time of the program (e.g. "10:00") */
  endTime: string;
  /** Title of the program */
  title: string;
  /** Progress percentage (0-100, only shown in 'now' variant) */
  progressPercent?: number;
  /** Manual focus override */
  isFocused?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
  /** External CSS class */
  className?: string;
  /** Override the background color for the 'next' variant */
  backgroundOverride?: string;
}

/**
 * EPGCard component for 10-foot TV UI Electronic Program Guide.
 */
export const EPGCard = memo(
  forwardRef<HTMLButtonElement, EPGCardProps>(
    (
      {
        variant,
        channelLogo,
        channelName,
        day,
        startTime,
        endTime,
        title,
        progressPercent = 0,
        isFocused: isFocusedProp,
        onClick,
        onFocus,
        onBlur,
        tabIndex = 0,
        className,
        backgroundOverride,
      },
      ref
    ) => {
      const [isInternalFocused, setIsInternalFocused] = useState(false);
      const isFocused = isFocusedProp ?? isInternalFocused;

      const handleFocus = () => {
        setIsInternalFocused(true);
        onFocus?.();
      };

      const handleBlur = () => {
        setIsInternalFocused(false);
        onBlur?.();
      };

      // Dimensions based on variant and focus state
      const width = variant === 'now' 
        ? (isFocused ? '540px' : '510px') 
        : (isFocused ? '360px' : '340px');
      
      const height = isFocused ? '188px' : '172px';

      const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        width,
        height,
        padding: '24px',
        borderRadius: '16px',
        background: variant === 'now' ? colors.background.primary : (backgroundOverride ?? 'rgba(255, 255, 255, 0.06)'),
        color: variant === 'now' ? colors.text.primary : colors.text.primaryInverse,
        border: isFocused ? `3px solid ${colors.background.brandPrimary}` : '3px solid transparent',
        boxShadow: isFocused ? '0 16px 48px rgba(0, 0, 0, 0.6)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
        cursor: 'pointer',
        outline: 'none',
        alignItems: 'center',
        gap: '24px',
        textAlign: 'left',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        zIndex: isFocused ? 10 : 1,
      };

      const contentStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        justifyContent: 'space-between',
        overflow: 'hidden',
      };

      const topRowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      };

      const timestampText = `${day ? day + ' ' : ''}${startTime} – ${endTime}`;

      const titleStyle: React.CSSProperties = {
        ...typography.headline.medium,
        color: 'inherit',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        margin: '8px 0',
        flexGrow: 1,
      };

      const progressTrackStyle: React.CSSProperties = {
        width: '100%',
        height: '4px',
        borderRadius: '2px',
        background: colors.line.dark,
        marginTop: '8px',
        overflow: 'hidden',
      };

      const progressFillStyle: React.CSSProperties = {
        width: `${Math.min(100, Math.max(0, progressPercent))}%`,
        height: '100%',
        borderRadius: '2px',
        background: colors.background.brandPrimary,
        transition: 'width 0.3s ease',
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
          aria-label={`${title} on ${channelName || 'channel'} from ${startTime} to ${endTime}`}
        >
          {variant === 'now' && channelLogo && (
            <img 
              src={channelLogo} 
              alt={channelName || ''} 
              style={{ height: '80px', maxWidth: '120px', objectFit: 'contain' }} 
            />
          )}
          <div style={contentStyle}>
            <div style={topRowStyle}>
              <span style={{ ...typography.body.small, color: 'inherit' }}>
                {timestampText}
              </span>
              {variant === 'now' && (
                <span style={{ 
                  ...typography.label.small, 
                  fontWeight: 700, 
                  color: 'inherit' 
                }}>
                  Agora na TV
                </span>
              )}
            </div>
            <span style={titleStyle}>{title}</span>
            {variant === 'now' && (
              <div style={progressTrackStyle}>
                <div style={progressFillStyle} />
              </div>
            )}
          </div>
        </button>
      );
    }
  )
);

EPGCard.displayName = 'EPGCard';
