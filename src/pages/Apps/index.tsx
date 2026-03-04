import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TileButton } from '../../components/TileButton/TileButton';
import { services } from '../../data/services';

interface AppsProps {
  isActive: boolean;
  isSidebarExpanded?: boolean;
  onServiceSelect?: (serviceId: string) => void;
}

export default function Apps({ isActive, isSidebarExpanded, onServiceSelect }: AppsProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setFocusedIndex(0);
      containerRef.current?.focus();
    }
  }, [isActive]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSidebarExpanded) return; // Let global hook handle all keys
    switch (e.key) {
      case 'ArrowLeft':
        if (focusedIndex > 0) {
          e.preventDefault();
          e.stopPropagation();
          setFocusedIndex((i) => i - 1);
        }
        // Let it bubble to sidebar if focusedIndex is 0
        break;
      case 'ArrowRight':
        if (focusedIndex < services.length - 1) {
          e.preventDefault();
          e.stopPropagation();
          setFocusedIndex((i) => i + 1);
        }
        break;
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        const service = services[focusedIndex];
        if (!service.available) {
          setToastMessage('Conteúdo indisponível no momento');
        } else {
          onServiceSelect?.(service.id);
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        // Do not preventDefault or stopPropagation — let bubble to global hook for sidebar nav
        break;
      case 'Escape':
        e.preventDefault();
        // DO NOT stopPropagation — let Escape bubble to useFocusNavigation to close sidebar
        break;
    }
  };

  const formatDate = (): string => {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formatted = formatter.format(new Date());
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    background: colors.background.baseInverse,
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    height: '140px',
    paddingLeft: '136px',
    paddingTop: '48px',
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    ...typography.display.medium,
    color: colors.text.primaryInverse,
    margin: 0,
    lineHeight: 1,
  };

  const subtitleStyle: React.CSSProperties = {
    ...typography.body.large,
    color: colors.text.secondaryInverse,
    margin: '4px 0 0 0',
  };

  const railStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    paddingLeft: '136px',
    paddingTop: '40px',
    alignItems: 'center',
    flex: 1,
    paddingBottom: '120px', // visual balance — header is 120px so this centers the rail
  };

  const toastStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
    background: 'rgba(17, 23, 43, 0.95)',
    borderRadius: '16px',
    padding: '20px 32px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    ...typography.body.large,
    color: colors.text.primaryInverse,
    whiteSpace: 'nowrap',
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={containerStyle}
      onKeyDown={handleKeyDown}
    >
      <div style={headerStyle}>
        <h1 style={titleStyle}>Serviços</h1>
        <p style={subtitleStyle}>{formatDate()}</p>
      </div>

      <div style={railStyle}>
        {services.map((service, i) => (
          <TileButton
            key={service.id}
            variant="image"
            image={service.image}
            imageObjectFit="contain"
            backgroundColor={service.backgroundColor}
            isFocused={focusedIndex === i}
            onClick={() => {
              if (!service.available) {
                setToastMessage('Conteúdo indisponível no momento');
              } else {
                onServiceSelect?.(service.id);
              }
            }}
            alt={service.name}
          />
        ))}
      </div>

      {toastMessage && <div style={toastStyle}>{toastMessage}</div>}
    </div>
  );
}
