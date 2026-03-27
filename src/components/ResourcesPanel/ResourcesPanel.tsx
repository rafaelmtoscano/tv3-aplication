import { useEffect, useCallback, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export type ResourceType = 'voting' | 'poll' | 'hearing';

export interface Resource {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  type: ResourceType;
}

export interface ResourcesPanelProps {
  resources: Resource[];
  onSelect: (type: ResourceType) => void;
  onClose: () => void;
}

export function ResourcesPanel({ resources, onSelect, onClose }: ResourcesPanelProps) {
  // focusIndex: 0..resources.length-1 = itens, resources.length = Fechar
  const [focusIndex, setFocusIndex] = useState(0);
  const closeRef = useRef(onClose);
  const selectRef = useRef(onSelect);
  closeRef.current = onClose;
  selectRef.current = onSelect;

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopImmediatePropagation();
      closeRef.current();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.stopImmediatePropagation();
      setFocusIndex(i => Math.min(i + 1, resources.length));
    }
    if (e.key === 'ArrowUp') {
      e.stopImmediatePropagation();
      setFocusIndex(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') {
      e.stopImmediatePropagation();
      if (focusIndex === resources.length) {
        closeRef.current();
      } else {
        selectRef.current(resources[focusIndex].type);
      }
    }
  }, [focusIndex, resources]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [handleKey]);

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: 48,
    right: 56,
    zIndex: 300,
    width: 480,
    background: '#0D1220',
    border: `1px solid ${colors.line.dark}`,
    borderRadius: 24,
    padding: '36px 0 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    animation: 'resourcesSlideIn 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
  };

  const headerStyle: React.CSSProperties = {
    ...typography.headline.medium,
    color: colors.text.primaryInverse,
    fontWeight: 600,
    padding: '0 32px 20px',
    borderBottom: `1px solid ${colors.line.dark}`,
    marginBottom: 8,
  };

  return (
    <>
      <style>{`
        @keyframes resourcesSlideIn {
          from { opacity: 0; transform: translateX(32px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
      <div style={panelStyle}>
        <div style={headerStyle}>
          {resources.length} {resources.length === 1 ? 'recurso disponível:' : 'recursos disponíveis:'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 12px', gap: 4 }}>
          {resources.map((resource, i) => {
            const isFocused = focusIndex === i;
            const itemStyle: React.CSSProperties = {
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              padding: '20px 20px',
              borderRadius: 16,
              background: isFocused ? colors.background.primary : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            };
            const iconBoxStyle: React.CSSProperties = {
              width: 56,
              height: 56,
              borderRadius: 12,
              background: isFocused ? colors.background.base : colors.background.primaryInverse,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s ease',
            };
            const titleColor = isFocused ? colors.text.primary : colors.text.primaryInverse;
            const descColor = isFocused ? colors.text.secondary : colors.text.secondaryInverse;

            return (
              <div
                key={resource.id}
                style={itemStyle}
                onClick={() => onSelect(resource.type)}
              >
                <div style={iconBoxStyle}>{resource.icon}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ ...typography.body.large, color: titleColor, fontWeight: 600 }}>
                    {resource.title}
                  </span>
                  <span style={{ ...typography.body.medium, color: descColor }}>
                    {resource.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button
            style={{
              padding: '14px 48px',
              borderRadius: 100,
              border: 'none',
              background: focusIndex === resources.length
                ? colors.background.primary
                : 'transparent',
              color: focusIndex === resources.length
                ? colors.text.primary
                : colors.text.primaryInverse,
              ...typography.body.large,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s ease, transform 0.15s ease',
              transform: focusIndex === resources.length ? 'scale(1.05)' : 'scale(1)',
            }}
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}
