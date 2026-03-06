import React, { useState, useEffect, useMemo, useRef } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { CircleButton } from '../../components/CircleButton/CircleButton';
import type { Deputy } from '../../data/deputies';

const SIDEBAR_WIDTH = 88;
const CONTENT_PADDING = 64;
const LEFT_OFFSET = SIDEBAR_WIDTH + CONTENT_PADDING;
const HEADER_HEIGHT = 140;
const RAIL_HEIGHT = 530;
const SCROLL_OFFSET = 80;
const SKELETON_COUNT = 8;

export interface DeputiesGridProps {
  isActive: boolean;
  isSidebarExpanded?: boolean;
  deputies: Deputy[];
  loading: boolean;
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

function SkeletonRail() {
  return (
    <>
      <style>{`
        @keyframes deputies-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .deputies-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 600px 100%;
          animation: deputies-shimmer 1.4s ease-in-out infinite;
        }
      `}</style>
      <div style={{ paddingTop: 40, overflow: 'visible' }}>
        <div className="deputies-shimmer" style={{ height: 24, width: 120, borderRadius: 8, marginLeft: LEFT_OFFSET, marginBottom: 32 }} />
        <div style={{ height: 366, overflow: 'visible' }}>
          <div style={{ display: 'flex', flexDirection: 'row', paddingLeft: LEFT_OFFSET, gap: 32, alignItems: 'flex-end', height: '100%' }}>
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div className="deputies-shimmer" style={{ width: 248, height: 248, borderRadius: '50%' }} />
                <div className="deputies-shimmer" style={{ width: 100, height: 16, borderRadius: 6, marginTop: 12 }} />
                <div className="deputies-shimmer" style={{ width: 60, height: 14, borderRadius: 6, marginTop: 6 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function DeputiesGrid({ isActive, isSidebarExpanded, deputies, loading, onBack, onDeputySelect }: DeputiesGridProps) {
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
        e.preventDefault(); e.stopPropagation();
        if (focusRegion === 'grid') {
          if (railIndex > 0) { setRailIndex(r => r - 1); setItemIndex(0); }
          else { setFocusRegion('nav'); setNavIndex(1); }
        }
        break;
      case 'ArrowDown':
        e.preventDefault(); e.stopPropagation();
        if (focusRegion === 'nav') { setFocusRegion('grid'); setRailIndex(0); setItemIndex(0); }
        else if (railIndex < groups.length - 1) { setRailIndex(r => r + 1); setItemIndex(0); }
        break;
      case 'ArrowLeft':
        e.preventDefault(); e.stopPropagation();
        if (focusRegion === 'nav') setNavIndex(n => Math.max(0, n - 1));
        else if (itemIndex > 0) setItemIndex(i => i - 1);
        break;
      case 'ArrowRight':
        e.preventDefault(); e.stopPropagation();
        if (focusRegion === 'nav') setNavIndex(n => Math.min(2, n + 1));
        else if (itemIndex < groupLength - 1) setItemIndex(i => i + 1);
        break;
      case 'Enter':
        e.preventDefault(); e.stopPropagation();
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
        e.preventDefault(); e.stopPropagation();
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
    transition: 'all 0.2s ease-out', flexShrink: 0,
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

        <div style={{ height: HEADER_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, paddingLeft: LEFT_OFFSET }}>
          <span style={{ ...typography.headline.large, color: colors.text.primaryInverse }}>TV CÂMARA</span>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <button style={backBtnStyle(focusRegion === 'nav' && navIndex === 0)} onClick={onBack}>← Voltar</button>
            <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 16 }}>
              <button style={filterBtnStyle(filterMode === 'estado', focusRegion === 'nav' && navIndex === 1)} onClick={() => setFilterMode('estado')}>Estados</button>
              <button style={filterBtnStyle(filterMode === 'partido', focusRegion === 'nav' && navIndex === 2)} onClick={() => setFilterMode('partido')}>Partido</button>
            </div>
          </div>
        </div>

        {loading && <><SkeletonRail /><SkeletonRail /></>}

        {!loading && groups.map((group, gIdx) => (
          <div key={group.label} style={{ paddingTop: 40, overflow: 'visible' }}>
            <h2 style={{ ...typography.headline.large, color: colors.text.primaryInverse, paddingLeft: LEFT_OFFSET, margin: '0 0 32px 0' }}>{group.label}</h2>
            <div style={{ height: 366, overflow: 'visible' }}>
              <div style={{ display: 'flex', flexDirection: 'row', paddingLeft: LEFT_OFFSET, gap: 32, overflow: 'visible', alignItems: 'flex-end', height: '100%' }}>
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
        ))}

        <div style={{ height: 120 }} />
      </div>
    </div>
  );
}
