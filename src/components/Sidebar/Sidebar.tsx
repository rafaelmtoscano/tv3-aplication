import React, { useState, useRef, forwardRef, memo, useCallback } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { MenuItem } from '../MenuItem';
import { Sign } from '../Sign';

export interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

export interface SidebarSign {
  variant: 'icon' | 'image';
  icon?: React.ReactNode;
  image?: string;
  alt?: string;
}

export interface SidebarProps {
  /**
   * App name displayed at top
   */
  logoName: string;
  /**
   * Second line of logo
   */
  logoSubtitle?: string;
  /**
   * Navigation items
   */
  items: SidebarItem[];
  /**
   * Sign component configuration (avatar/user icon)
   */
  sign?: SidebarSign;
  /**
   * Whether the sidebar is expanded (controlled)
   */
  expanded?: boolean;
  /**
   * Callback when expanded state changes
   */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Callback when an item is clicked
   */
  onItemClick?: (id: string) => void;
  /**
   * Currently active item ID
   */
  activeItemId?: string;
  /**
   * Currently focused item ID (from external navigation)
   */
  focusedItemId?: string;
  /**
   * Custom class name
   */
  className?: string;
}

export const Sidebar = memo(
  forwardRef<HTMLDivElement, SidebarProps>(
    (
      {
        logoName,
        logoSubtitle,
        items,
        sign,
        expanded: externalExpanded,
        onExpandedChange,
        onItemClick,
        activeItemId,
        focusedItemId,
        className,
      },
      ref
    ) => {
      const [internalExpanded, setInternalExpanded] = useState(false);
      const isExpanded = externalExpanded ?? internalExpanded;

      const containerRef = useRef<HTMLDivElement>(null);

      // Update internal state and call callback
      const setExpanded = useCallback(
        (val: boolean) => {
          if (val !== isExpanded) {
            setInternalExpanded(val);
            onExpandedChange?.(val);
          }
        },
        [isExpanded, onExpandedChange]
      );

      const handleFocus = useCallback(() => {
        setExpanded(true);
      }, [setExpanded]);

      const handleBlur = useCallback(
        (e: React.FocusEvent) => {
          // Only collapse if the new focused element is NOT inside the sidebar
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setExpanded(false);
          }
        },
        [setExpanded]
      );

      // Styles
      const outerWrapperStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
        display: 'flex',
        pointerEvents: 'none',
      };

      const gradientOverlayStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: isExpanded ? '280px' : '80px', // Animates with sidebar
        height: '100%',
        width: isExpanded ? '50vw' : '0',
        background: 'linear-gradient(270deg, rgba(17, 23, 43, 0) 0%, #11172B 100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
        opacity: isExpanded ? 1 : 0,
      };

      const sidebarPanelStyle: React.CSSProperties = {
        position: 'relative',
        zIndex: 1,
        width: isExpanded ? '280px' : '80px',
        height: '100vh',
        background: colors.background.baseInverse,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '40px 0',
        gap: '32px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        pointerEvents: 'all',
        boxSizing: 'border-box',
      };

      const logoAreaStyle: React.CSSProperties = {
        padding: '0 4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%',
        paddingLeft: '16px',
        boxSizing: 'border-box',
      };

      const logoTextStyle: React.CSSProperties = {
        fontFamily: typography.body.large.fontFamily,
        fontWeight: 300,
        fontSize: '18px',
        lineHeight: '100%',
        color: colors.text.primaryInverse,
        whiteSpace: 'nowrap',
        opacity: 0.7,
      };

      const logoSubtitleStyle: React.CSSProperties = {
        ...logoTextStyle,
        fontWeight: 700,
        opacity: 1,
      };

      const navbarStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        flex: 1,
        padding: '0 4px',
        boxSizing: 'border-box',
      };

      const signAreaStyle: React.CSSProperties = {
        padding: '0 4px',
        width: '100%',
        boxSizing: 'border-box',
      };

      return (
        <div style={outerWrapperStyle} className={className}>
          <div style={gradientOverlayStyle} />
          <div
            ref={(node) => {
              // Combine refs
              (containerRef as any).current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as any).current = node;
            }}
            style={sidebarPanelStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {/* Logo area */}
            <div style={logoAreaStyle}>
              {isExpanded ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F680bef2f7f7c478aa70cb7cb92870b4d"
                  alt="Plataforma Comum"
                  style={{ height: '32px', width: 'auto', display: 'block' }}
                />
              ) : (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F70849a385e8142a190c2aad42c525fcb"
                  alt="Plataforma Comum"
                  style={{ height: '32px', width: 'auto', display: 'block' }}
                />
              )}
            </div>

            {/* Sign area */}
            {sign && (
              <div style={signAreaStyle}>
                <Sign
                  variant={sign.variant}
                  icon={sign.icon}
                  image={sign.image}
                  alt={sign.alt}
                  style={{ marginLeft: '4px' }}
                  isFocused={focusedItemId === 'avatar'}
                  state={activeItemId === 'avatar' ? 'selected' : 'idle'}
                  onClick={() => onItemClick?.('avatar')}
                />
              </div>
            )}

            {/* Navbar area */}
            <nav style={navbarStyle}>
              {items.map((item) => (
                <MenuItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  expanded={isExpanded}
                  isFocused={focusedItemId === item.id}
                  state={activeItemId === item.id ? 'selected' : item.disabled ? 'disabled' : 'idle'}
                  onClick={() => onItemClick?.(item.id)}
                />
              ))}
            </nav>
          </div>
        </div>
      );
    }
  )
);

Sidebar.displayName = 'Sidebar';
