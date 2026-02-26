import React, { forwardRef, useState, memo } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'text' | 'icon-text';
  label: string;
  icon?: React.ReactNode;
  state?: 'idle' | 'selected' | 'disabled';
  className?: string;
}

export const ActionButton = memo(
  forwardRef<HTMLButtonElement, ActionButtonProps>(
    (
      {
        variant = 'text',
        label,
        icon,
        state = 'idle',
        onClick,
        onFocus,
        onBlur,
        className,
        disabled: externalDisabled,
        tabIndex,
        'aria-label': ariaLabel,
        ...props
      },
      ref
    ) => {
      const [isFocused, setIsFocused] = useState(false);

      const isDisabled = state === 'disabled' || externalDisabled;
      const isSelected = state === 'selected';

      const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      };

      const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      };

      // Styles based on state
      const getBaseStyles = (): React.CSSProperties => {
        if (isDisabled) {
          return {
            background: 'transparent',
            border: '4px solid transparent',
            color: colors.text.primaryInverse,
            opacity: 0.4,
            cursor: 'not-allowed',
          };
        }
        if (isFocused) {
          return {
            background: colors.background.primary,
            border: `4px solid ${colors.background.primary}`,
            color: colors.text.primary,
          };
        }
        if (isSelected) {
          return {
            background: colors.line.dark,
            border: `4px solid ${colors.line.dark}`,
            color: colors.text.primaryInverse,
          };
        }
        // Idle
        return {
          background: 'transparent',
          border: '4px solid transparent',
          color: colors.text.primaryInverse,
        };
      };

      const containerStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '32px',
        cursor: 'pointer',
        padding: variant === 'text' ? '0.5rem 1.5rem 0.5rem 0.5rem' : '0.25rem',
        gap: variant === 'icon-text' ? '0.63rem' : '0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        boxSizing: 'border-box',
        ...getBaseStyles(),
      };

      const textStyle: React.CSSProperties = {
        ...typography.headline.medium,
        color: 'inherit',
        margin: 0,
        whiteSpace: 'nowrap',
        paddingRight: variant === 'icon-text' ? '1.5rem' : '0',
      };

      const iconContainerStyle: React.CSSProperties = {
        width: '4.5rem',
        height: '4.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      };

      return (
        <button
          ref={ref}
          type="button"
          style={containerStyle}
          className={className}
          onClick={onClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={isDisabled}
          tabIndex={isDisabled ? -1 : tabIndex}
          aria-label={ariaLabel || label}
          {...props}
        >
          {variant === 'icon-text' && icon && <div style={iconContainerStyle}>{icon}</div>}
          <span style={textStyle}>{label}</span>
        </button>
      );
    }
  )
);

ActionButton.displayName = 'ActionButton';
