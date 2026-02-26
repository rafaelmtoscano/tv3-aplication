import React, { useState, useRef, forwardRef, memo, useEffect, useCallback } from 'react';
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
        className,
      },
      ref
    ) => {
      const [internalExpanded, setInternalExpanded] = useState(false);
      const isExpanded = externalExpanded ?? internalExpanded;

      const containerRef = useRef<HTMLDivElement>(null);
      const signRef = useRef<HTMLButtonElement>(null);
      const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

      const handleKeyDown = (e: React.KeyboardEvent) => {
        const currentIndex = itemRefs.current.findIndex((el) => el === document.activeElement);
        const isSignFocused = signRef.current === document.activeElement;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (isSignFocused) {
            itemRefs.current[0]?.focus();
          } else if (currentIndex < items.length - 1) {
            itemRefs.current[currentIndex + 1]?.focus();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentIndex === 0) {
            signRef.current?.focus();
          } else if (currentIndex > 0) {
            itemRefs.current[currentIndex - 1]?.focus();
          }
        } else if (e.key === 'ArrowRight' && isExpanded) {
          e.preventDefault();
          setExpanded(false);
          // Move focus to main content (first focusable element after sidebar)
          const mainContent = document.querySelector(
            'main, [data-main-content], #main-content'
          ) as HTMLElement;
          mainContent?.focus();
        }
      };

      // Handle ArrowLeft to enter sidebar
      useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowLeft') {
            const isFocusInSidebar = containerRef.current?.contains(document.activeElement);
            if (!isFocusInSidebar) {
              e.preventDefault();
              if (sign) {
                signRef.current?.focus();
              } else {
                itemRefs.current[0]?.focus();
              }
            }
          }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
      }, [sign, items.length]);

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
        left: isExpanded ? '340px' : '80px', // Animates with sidebar
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
        width: isExpanded ? '340px' : '80px',
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
        fontSize: '24px',
        lineHeight: '100%',
        color: colors.text.primaryInverse,
        whiteSpace: 'nowrap',
        opacity: isExpanded ? 0.7 : 0,
        transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      };

      const logoSubtitleStyle: React.CSSProperties = {
        ...logoTextStyle,
        fontWeight: 700,
        opacity: isExpanded ? 1 : 0,
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
            onKeyDown={handleKeyDown}
          >
            {/* Logo area */}
            <div style={logoAreaStyle}>
              <div style={logoTextStyle}>{logoName}</div>
              {logoSubtitle && <div style={logoSubtitleStyle}>{logoSubtitle}</div>}
            </div>

            {/* Sign area */}
            {sign && (
              <div style={signAreaStyle}>
                <Sign
                  ref={signRef}
                  variant={sign.variant}
                  icon={sign.icon}
                  image={sign.image}
                  alt={sign.alt}
                  style={{ marginLeft: '4px' }}
                />
              </div>
            )}

            {/* Navbar area */}
            <nav style={navbarStyle}>
              {items.map((item, index) => (
                <MenuItem
                  key={item.id}
                  ref={(el) => { itemRefs.current[index] = el; }}
                  icon={item.icon}
                  label={item.label}
                  expanded={isExpanded}
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
