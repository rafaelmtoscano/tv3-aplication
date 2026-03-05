import React, { useState, useEffect, useMemo, useRef } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { CircleButton } from '../../components/CircleButton/CircleButton';
import { useCamaraAPI } from '../../hooks/useCamaraAPI';
import type { Deputy } from '../../data/deputies';

const HEADER_HEIGHT = 120;
const RAIL_HEIGHT = 530;
const SCROLL_OFFSET = 80;

export interface DeputiesGridProps {
  isActive: boolean;
  isSidebarExpanded?: boolean;
  onBack: () => void;
  onDeputySelect: (deputy: Deputy) => void;
}

type FilterMode = 'estado' | 'partido';

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export default function DeputiesGrid({ isActive, isSidebarExpanded, onBack, onDeputySelect }: DeputiesGridProps) {
  const { deputiesList: deputies, loading } = useCamaraAPI();
  const [filterMode, setFilterMode] = useState<FilterMode>('estado');
  const [focusRegion, setFocusRegion] = useState<'nav' | 'grid'>('grid');
  const [navIndex, setNavIndex] = useState(0);
  const [railIndex, setRailIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => {
    if (!deputies.length) return [];
    const grouped = filterMode === 'estado'
      ? groupBy(deputies, d => d.state)
      : groupBy(deputies, d => d.party);
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, items]) => ({ label, items }));
  }, [deputies, filterMode]);

  useEffect(() => {
    if (!isActive) return;
    if (focusRegion === 'nav') {
      setScrollY(0);
    } else {
      const y = HEADER_HEIGHT + RAIL_HEIGHT * railIndex - SCROLL_OFFSET;
      setScrollY(Math.max(0, y));
    }
  }, [focusRegion, railIndex, isActive]);

  useEffect(() => {
    if (isActive) containerRef.current?.focus();
  }, [isActive]);

  useEffect(() => {
    setRailIndex(0);
    setItemIndex(0);
    setFocusRegion('grid');
  }, [filterMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSidebarExpanded) return;
    const currentGroup = groups[railIndex];
    const groupLength = currentGroup?.items.length ?? 0;
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (focusRegion === 'grid') {
          if (railIndex > 0) { setRailIndex(r => r - 1); setItemIndex(0); }
          else { setFocusRegion('nav'); setNavIndex(0); }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (focusRegion === 'nav') { setFocusRegion('grid'); setRailIndex(0); setItemIndex(0); }
        else if (railIndex < groups.length - 1) { setRailIndex(r => r + 1); setItemIndex(0); }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (focusRegion === 'nav') setNavIndex(n => Math.max(0, n - 1));
        else if (itemIndex > 0) setItemIndex(i => i - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (focusRegion === 'nav') setNavIndex(n => Math.min(2, n + 1));
        else if (itemIndex < groupLength - 1) setItemIndex(i => i + 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusRegion === 'nav') {
          if (navIndex === 0) onBack();
          if (navIndex === 1) setFilterMode('estado');
          if (navIndex === 2) setFilterMode('partido');
        } else {
          const dep = currentGroup?.items[itemIndex];
          if (dep) onDeputySelect(dep);
        }
        break;
      case 'Escape':
      case 'Backspace':
        e.preventDefault();
        onBack();
        break;
    }
  };

  const backBtnStyle = (focused: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8,
    color: focused ? colors.background.brandPrimary : colors.text.primaryInverse,
    ...typography.body.large,
    background: 'none',
    border: focused ? `2px solid ${colors.background.brandPrimary}` : '2px solid transparent',
    borderRadius: 12, padding: '8px 20px', cursor: 'pointer', outline: 'none',
    transition: 'all 0.2s ease-out',
  });

  const filterBtnStyle = (active: boolean, focused: boolean): React.CSSProperties => ({
    ...typography.body.large,
    color: active ? colors.background.baseInverse : colors.text.primaryInverse,
    background: active ? colors.text.primaryInverse : 'rgba(255,255,255,0.08)',
    border: focused ? `2px solid ${colors.background.brandPrimary}` : '2px solid transparent',
    borderRadius: 40, padding: '10px 32px', cursor: 'pointer', outline: 'none',
    transition: 'all 0.2s ease-out',
  });

  return (
    <div ref={containerRef} tabIndex={0} style={{ position: 'fixed', inset: 0, background: colors.background.baseInverse, overflow: 'hidden', outline: 'none' }} onKeyDown={handleKeyDown}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, transform: `translateY(-${scrollY}px)`, transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>

        {/* Header */}
        <div style={{ height: HEADER_HEIGHT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, position: 'relative' }}>
          <span style={{ ...typography.headline.large, color: colors.text.primaryInverse }}>📺 TV CÂMARA</span>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingLeft: 64, position: 'relative' }}>
            <button style={backBtnStyle(focusRegion === 'nav' && navIndex === 0)} onClick={onBack}>← Voltar</button>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 16 }}>
              <button style={filterBtnStyle(filterMode === 'estado', focusRegion === 'nav' && navIndex === 1)} onClick={() => setFilterMode('estado')}>Estados</button>
              <button style={filterBtnStyle(filterMode === 'partido', focusRegion === 'nav' && navIndex === 2)} onClick={() => setFilterMode('partido')}>Partido</button>
            </div>
          </div>
        </div>

        {/* Rails */}
        {loading ? (
          <p style={{ ...typography.body.large, color: colors.text.secondaryInverse, paddingLeft: 64, paddingTop: 48 }}>Carregando deputados...</p>
        ) : (
          groups.map((group, gIdx) => (
            <div key={group.label} style={{ paddingTop: 40, overflow: 'visible' }}>
              <h2 style={{ ...typography.headline.large, color: colors.text.primaryInverse, paddingLeft: 64, margin: '0 0 32px 0' }}>{group.label}</h2>
              <div style={{ height: 366, overflow: 'visible' }}>
                <div style={{ display: 'flex', flexDirection: 'row', paddingLeft: 64, gap: 32, overflow: 'visible', alignItems: 'center', height: '100%' }}>
                  {group.items.map((dep, dIdx) => {
                    const isFocused = focusRegion === 'grid' && railIndex === gIdx && itemIndex === dIdx;
                    return (
                      <div key={dep.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <CircleButton image={dep.photo} label={dep.name} isFocused={isFocused} onClick={() => onDeputySelect(dep)} />
                        <span style={{ ...typography.body.small, color: colors.text.secondaryInverse, marginTop: 4, textAlign: 'center' as const }}>
                          {filterMode === 'estado' ? dep.party : dep.state}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ height: 40 }} />
            </div>
          ))
        )}
        <div style={{ height: 120 }} />
      </div>
    </div>
  );
}
