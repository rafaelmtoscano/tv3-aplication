import React, { forwardRef, useState, useMemo, useCallback } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface TileButtonProps {
  /**
   * The variant of the tile button.
   * @default 'icon'
   */
  variant?: 'icon' | 'icon-label' | 'image';
  /**
   * Icon to display (for 'icon' and 'icon-label' variants).
   */
  icon?: React.ReactNode;
  /**
   * Text label to display (for 'icon-label' variant).
   */
  label?: string;
  /**
   * Image URL to display (for 'image' variant).
   */
  image?: string;
  /**
   * Accessibility label for the image.
   */
  alt?: string;
  /**
   * Click handler.
   */
  onClick?: () => void;
  /**
   * Focus handler.
   */
  onFocus?: () => void;
  /**
   * Blur handler.
   */
  onBlur?: () => void;
  /**
   * Additional CSS class name.
   */
  className?: string;
  /**
   * Accessibility label.
   */
  'aria-label'?: string;
  /**
   * Keyboard tab index.
   */
  tabIndex?: number;
  /**
   * Manual override for focus state (mostly for Storybook/demonstration).
   */
  isFocused?: boolean;
  /**
   * Object fit for the image variant.
   * @default 'cover'
   */
  imageObjectFit?: 'cover' | 'contain';
}

export const TileButton = React.memo(
  forwardRef<HTMLButtonElement, TileButtonProps>(
    (
      {
        variant = 'icon',
        icon,
        label,
        image,
        alt,
        onClick,
        onFocus,
        onBlur,
        className,
        'aria-label': ariaLabel,
        tabIndex,
        isFocused: forcedFocused,
        imageObjectFit = 'cover',
      },
      ref
    ) => {
      const [isInternalFocused, setIsInternalFocused] = useState(false);
      const isFocused = forcedFocused !== undefined ? forcedFocused : isInternalFocused;

      const handleFocus = useCallback(() => {
        setIsInternalFocused(true);
        onFocus?.();
      }, [onFocus]);

      const handleBlur = useCallback(() => {
        setIsInternalFocused(false);
        onBlur?.();
      }, [onBlur]);

      const buttonStyle = useMemo((): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.63rem',
          borderRadius: '24px',
          transformOrigin: 'center center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
          overflow: 'hidden',
          position: 'relative',
        };

        const stateStyle: React.CSSProperties = isFocused
          ? {
              width: '312px',
              height: '312px',
              background: colors.background.primary,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              color: colors.text.primary,
              zIndex: 10,
            }
          : {
              width: '248px',
              height: '248px',
              background: colors.line.dark,
              boxShadow: 'none',
              color: colors.text.primaryInverse,
              zIndex: 1,
            };

        return { ...baseStyle, ...stateStyle };
      }, [isFocused]);

      const iconSize = variant === 'icon' ? '120px' : '80px';
      const iconContainerStyle: React.CSSProperties = {
        width: iconSize,
        height: iconSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      };

      const labelStyle: React.CSSProperties = {
        ...typography.headline.medium,
        color: 'inherit',
        margin: 0,
        textAlign: 'center',
      };

      const imageStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: imageObjectFit,
        position: 'absolute',
        top: 0,
        left: 0,
      };

      const finalAriaLabel = ariaLabel || label || alt;

      return (
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={tabIndex}
          aria-label={finalAriaLabel}
          style={buttonStyle}
          className={className}
        >
          {variant === 'image' && image && (
            <img src={image} alt={alt || ''} style={imageStyle} />
          )}

          {variant !== 'image' && (
            <>
              {icon && (
                <div style={iconContainerStyle}>
                  {React.isValidElement(icon)
                    ? React.cloneElement(icon as React.ReactElement, {
                        // Pass color inherit if possible, or width/height
                        style: {
                          width: '100%',
                          height: '100%',
                          ...((icon.props as any).style || {}),
                        },
                      } as any)
                    : icon}
                </div>
              )}
              {variant === 'icon-label' && label && (
                <span style={labelStyle}>{label}</span>
              )}
            </>
          )}
        </button>
      );
    }
  )
);

TileButton.displayName = 'TileButton';
