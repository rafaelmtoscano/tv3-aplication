import React, { forwardRef, memo } from 'react';
import { colors } from '../../styles/colors';

export interface SignProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'icon' | 'image';
  icon?: React.ReactNode;
  image?: string;
  alt?: string;
  isFocused: boolean;
  state?: 'idle' | 'selected' | 'disabled';
  className?: string;
}

export const Sign = memo(
  forwardRef<HTMLButtonElement, SignProps>(
    (
      {
        variant = 'icon',
        icon,
        image,
        alt,
        isFocused,
        state = 'idle',
        onClick,
        onFocus,
        onBlur,
        className,
        disabled: externalDisabled,
        tabIndex,
        'aria-label': ariaLabel,
        style: externalStyle,
        ...props
      },
      ref
    ) => {
      const isDisabled = state === 'disabled' || externalDisabled;
      const isSelected = state === 'selected';

      const getBaseStyles = (): React.CSSProperties => {
        if (isDisabled) {
          return {
            background: 'transparent',
            opacity: 0.4,
            cursor: 'not-allowed',
          };
        }
        if (isFocused) {
          return {
            background: colors.background.primary,
          };
        }
        if (isSelected) {
          return {
            background: colors.line.dark,
          };
        }
        // Idle
        return {
          background: 'transparent',
        };
      };

      const getIconColor = () => {
        if (isFocused) {
          return colors.text.primary;
        }
        return colors.text.primaryInverse;
      };

      const containerStyle: React.CSSProperties = {
        width: '72px',
        height: '72px',
        borderRadius: '100px',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: 'none',
        outline: 'none',
        boxSizing: 'border-box',
        overflow: 'hidden',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...getBaseStyles(),
        ...externalStyle,
      };

      const iconSlotStyle: React.CSSProperties = {
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: getIconColor(),
      };

      const imageStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '100px',
      };

      return (
        <button
          ref={ref}
          type="button"
          style={containerStyle}
          className={className}
          onClick={onClick}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={isDisabled}
          tabIndex={isDisabled ? -1 : tabIndex}
          aria-label={ariaLabel || alt}
          {...props}
        >
          {variant === 'icon' && icon && (
            <div style={iconSlotStyle}>
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement, {
                    style: {
                      width: '100%',
                      height: '100%',
                      ...((icon.props as any).style || {}),
                    },
                  } as any)
                : icon}
            </div>
          )}
          {variant === 'image' && image && <img src={image} alt={alt || ''} style={imageStyle} />}
        </button>
      );
    }
  )
);

Sign.displayName = 'Sign';
