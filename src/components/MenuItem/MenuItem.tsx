import React, { useState, forwardRef, memo, useCallback } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface MenuItemProps {
  /**
   * Icon to display (28x28px)
   */
  icon: React.ReactNode;
  /**
   * Text label
   */
  label: string;
  /**
   * Current state of the menu item
   */
  state?: 'idle' | 'selected' | 'disabled';
  /**
   * Whether the sidebar is expanded (shows label)
   */
  expanded?: boolean;
  /**
   * External focus state override
   */
  isFocused?: boolean;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Focus handler
   */
  onFocus?: () => void;
  /**
   * Blur handler
   */
  onBlur?: () => void;
  /**
   * Accessibility label
   */
  'aria-label'?: string;
  /**
   * Custom tab index
   */
  tabIndex?: number;
  /**
   * Custom class name
   */
  className?: string;
}

export const MenuItem = memo(
  forwardRef<HTMLButtonElement, MenuItemProps>(
    (
      {
        icon,
        label,
        state = 'idle',
        expanded = false,
        isFocused: isFocusedProp,
        onClick,
        onFocus,
        onBlur,
        'aria-label': ariaLabel,
        tabIndex,
        className,
      },
      ref
    ) => {
      const isFocused = isFocusedProp ?? false;

      const isDisabled = state === 'disabled';
      const isSelected = state === 'selected';

      // State priority: disabled -> focused -> selected -> idle
      let containerBg: string = 'transparent';
      let contentColor: string = colors.text.primaryInverse;

      if (isDisabled) {
        containerBg = 'transparent';
        contentColor = colors.text.primaryInverse;
      } else if (isFocused) {
        containerBg = colors.background.primary;
        contentColor = colors.text.primary;
      } else if (isSelected) {
        containerBg = colors.line.dark;
        contentColor = colors.text.primaryInverse;
      }

      const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderRadius: '100px',
        backgroundColor: containerBg,
        border: 'none',
        outline: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
        overflow: 'hidden',
        opacity: isDisabled ? 0.4 : 1,
        textAlign: 'left',
        textDecoration: 'none',
        boxSizing: 'border-box',
      };

      const innerRowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
      };

      const iconContainerStyle: React.CSSProperties = {
        width: '56px',
        height: '56px',
        minWidth: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '100px',
        flexShrink: 0,
        color: contentColor,
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease',
        transform: isFocused ? 'scale(1.1)' : 'scale(1)',
      };

      const labelStyle: React.CSSProperties = {
        ...typography.headline.medium,
        color: contentColor,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        opacity: expanded ? 1 : 0,
        maxWidth: expanded ? '400px' : '0px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      };

      // Clone icon to apply currentColor if it's an SVG-like element
      const renderIcon = () => {
        if (React.isValidElement(icon)) {
          return React.cloneElement(icon as React.ReactElement, {
            style: {
              width: '28px',
              height: '28px',
              display: 'block',
              ...((icon.props as any).style || {}),
            },
          } as any);
        }
        return icon;
      };

      return (
        <button
          ref={ref}
          type="button"
          style={containerStyle}
          className={className}
          onClick={isDisabled ? undefined : onClick}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={isDisabled}
          tabIndex={isDisabled ? -1 : tabIndex}
          aria-label={ariaLabel || label}
        >
          <div style={innerRowStyle}>
            <div style={iconContainerStyle}>{renderIcon()}</div>
            <span style={labelStyle}>{label}</span>
          </div>
        </button>
      );
    }
  )
);

MenuItem.displayName = 'MenuItem';
