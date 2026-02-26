import React, { forwardRef, memo, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface CircleButtonProps {
  /** The source URL for the image. */
  image: string;
  /** Accessibility text for the image. */
  alt?: string;
  /** Optional text label to display below the circle. */
  label?: string;
  /** Click handler for the button. */
  onClick?: () => void;
  /** Focus handler for the button. */
  onFocus?: () => void;
  /** Blur handler for the button. */
  onBlur?: () => void;
  /** Optional class name for external overrides. */
  className?: string;
  /** Optional accessibility label (falls back to label or alt). */
  'aria-label'?: string;
  /** Tab index for keyboard navigation. */
  tabIndex?: number;
  /** Manual override for the focused state (useful for Storybook). */
  isFocused?: boolean;
}

/**
 * CircleButton component for TV/10-foot UI navigation.
 * No hover states — only idle and focus states driven by keyboard/remote control.
 */
export const CircleButton = memo(
  forwardRef<HTMLButtonElement, CircleButtonProps>(
    (
      {
        image,
        alt,
        label,
        onClick,
        onFocus,
        onBlur,
        className,
        'aria-label': ariaLabel,
        tabIndex,
        isFocused: isFocusedProp,
      },
      ref
    ) => {
      const [internalFocused, setInternalFocused] = useState(false);
      const isFocused = isFocusedProp !== undefined ? isFocusedProp : internalFocused;

      const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
        setInternalFocused(true);
        onFocus?.();
      };

      const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
        setInternalFocused(false);
        onBlur?.();
      };

      const finalAriaLabel = ariaLabel || label || alt;

      // Wrapper button style (stays transparent)
      const buttonStyle: React.CSSProperties = {
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: 'pointer',
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        overflow: 'visible', // Critical to allow circle to grow without clipping
      };

      // Circle style (transitions on focus)
      const circleStyle: React.CSSProperties = {
        width: isFocused ? '312px' : '248px',
        height: isFocused ? '312px' : '248px',
        borderRadius: '1000px',
        overflow: 'hidden',
        boxShadow: isFocused ? '0 8px 32px rgba(0, 0, 0, 0.4)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transformOrigin: 'center center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)', // Fallback while loading
      };

      // Image style (fills the circle)
      const imageStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      };

      // Label style (stays the same in both states)
      const labelStyle: React.CSSProperties = {
        ...typography.body.large,
        color: colors.text.primaryInverse,
        height: '30px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        margin: 0,
      };

      return (
        <button
          ref={ref}
          className={className}
          onClick={onClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={finalAriaLabel}
          tabIndex={tabIndex}
          style={buttonStyle}
        >
          <div style={circleStyle}>
            <img src={image} alt={alt || ''} style={imageStyle} />
          </div>
          {label && <p style={labelStyle}>{label}</p>}
        </button>
      );
    }
  )
);

CircleButton.displayName = 'CircleButton';
