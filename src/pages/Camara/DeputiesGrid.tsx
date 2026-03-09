import React, { useState, useEffect, useMemo, useRef } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { CircleButton } from '../../components/CircleButton/CircleButton';
import type { Deputy } from '../../data/deputies';

const HEADER_HEIGHT = 168;
const RAIL_HEIGHT = 530;
const SCROLL_OFFSET = 80;
const SKELETON_COUNT = 8;

const REGION_STATES: Record<string, string[]> = {
  'Norte':        ['AC','AM','AP','PA','RO','RR','TO'],
  'Nordeste':     ['AL','BA','CE','MA','PB','PE','PI','RN','SE'],
  'Centro-Oeste': ['DF','GO','MS','MT'],
  'Sudeste':      ['ES','MG','RJ','SP'],
  'Sul':          ['PR','RS','SC'],
};

function getRegion(state: string): string {
  for (const [region, states] of Object.entries(REGION_STATES)) {
    if (states.includes(state)) return region;
  }
  return 'Outros';
}

// Tab definition: index 0 = Voltar (special), 1..N = filter tabs
type TabId = 'partido' | 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';

const TABS: { id: TabId; label: string }[] = [
  { id: 'partido',       label: 'Partido' },
  { id: 'Norte',         label: 'Norte' },
  { id: 'Nordeste',      label: 'Nordeste' },
  { id: 'Centro-Oeste',  label: 'Centro-Oeste' },
  { id: 'Sudeste',       label: 'Sudeste' },
  { id: 'Sul',           label: 'Sul' },
];
// navIndex 0 = Voltar, navIndex 1..6 = TABS[0..5]
const NAV_TOTAL = 1 + TABS.length;

export interface DeputiesGridProps {
  isActive: boolean;
  isSidebarExpanded?: boolean;
  deputies: Deputy[];
  loading: boolean;
  onBack: () => void;
  onDeputySelect: (deputy: Deputy) => void;
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
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
      <div style={{ padding: '0 48px' }}>
        <div className="deputies-shimmer" style={{ height: 24, width: 140, borderRadius: 8, marginBottom: 32 }} />
        <div style={{ height: 310, overflow: 'visible' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', height: '100%' }}>
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

// ─── Component ───────────────────────────────────────────────────────────────
export default function DeputiesGrid({
  isActive, isSidebarExpanded, deputies, loading, onBack, onDeputySelect,
}: DeputiesGridProps) {
  const [activeTab, setActiveTab] = useState<TabId>('partido');
  const [focusRegion, setFocusRegion] = useState<'nav' | 'grid'>('nav');
  const [navIndex, setNavIndex] = useState(1);   // 0=Voltar, 1..6=tabs — inicia na primeira tab
  const [railIndex, setRailIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[][]>([]);

  // ─── Groups by active tab ─────────────────────────────────────────────────
  const groups = useMemo(() => {
    if (!deputies.length) return [];

    if (activeTab === 'partido') {
      const grouped = groupBy(deputies, d => d.party);
      return Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, items]) => ({ label, items: items.sort((a, b) => a.name.localeCompare(b.name)) }));
    }

    // Region tab — sub-group by state within that region
    const regionDeputies = deputies.filter(d => getRegion(d.state) === activeTab);
    const byState = groupBy(regionDeputies, d => d.state);
    const stateOrder = REGION_STATES[activeTab] || [];
    return stateOrder
      .filter(s => byState[s])
      .map(s => ({ label: s, items: byState[s].sort((a, b) => a.name.localeCompare(b.name)) }));
  }, [deputies, activeTab]);

  // ─── Scroll virtual ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return;
    if (focusRegion === 'nav') {
      setScrollY(0);
    } else {
      const y = HEADER_HEIGHT + RAIL_HEIGHT * railIndex - SCROLL_OFFSET;
      setScrollY(Math.max(0, y));
    }
  }, [focusRegion, railIndex, isActive]);

  // Focus container on open
  useEffect(() => {
    if (isActive) containerRef.current?.focus();
  }, [isActive]);

  // Reset grid position when tab changes
  useEffect(() => {
    setRailIndex(0);
    setItemIndex(0);
    itemRefs.current = [];
  }, [activeTab]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusRegion !== 'grid') return;
    const el = itemRefs.current[railIndex]?.[itemIndex];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [focusRegion, railIndex, itemIndex]);

  // ─── Apply tab change immediately on nav focus ────────────────────────────
  const applyTab = (nIdx: number) => {
    if (nIdx === 0) return; // Voltar — sem troca de tab
    const tab = TABS[nIdx - 1];
    if (tab) setActiveTab(tab.id);
  };

  // ─── Keyboard ────────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSidebarExpanded) return;
    const groupLength = groups[railIndex]?.items.length ?? 0;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault(); e.stopPropagation();
        if (focusRegion === 'grid') {
          if (railIndex > 0) { setRailIndex(r => r - 1); setItemIndex(0); }
          else {
            const activeTabIdx = TABS.findIndex(t => t.id === activeTab);
            setFocusRegion('nav');
            setNavIndex(activeTabIdx >= 0 ? activeTabIdx + 1 : 1);
          }
        }
        break;

      case 'ArrowDown':
        e.preventDefault(); e.stopPropagation();
        if (focusRegion === 'nav') {
          setFocusRegion('grid'); setRailIndex(0); setItemIndex(0);
        } else if (railIndex < groups.length - 1) {
          setRailIndex(r => r + 1); setItemIndex(0);
        }
        break;

      case 'ArrowLeft':
        e.preventDefault(); e.stopPropagation();
        if (focusRegion === 'nav') {
          const next = Math.max(0, navIndex - 1);
          setNavIndex(next);
          applyTab(next);
        } else if (itemIndex > 0) {
          setItemIndex(i => i - 1);
        } else {
          // Primeiro item da rail → sobe para nav
          setFocusRegion('nav'); setNavIndex(1);
        }
        break;

      case 'ArrowRight':
        e.preventDefault(); e.stopPropagation();
        if (focusRegion === 'nav') {
          const next = Math.min(NAV_TOTAL - 1, navIndex + 1);
          setNavIndex(next);
          applyTab(next);
        } else if (itemIndex < groupLength - 1) {
          setItemIndex(i => i + 1);
        }
        break;

      case 'Enter':
        e.preventDefault(); e.stopPropagation();
        if (focusRegion === 'nav') {
          if (navIndex === 0) onBack();
        } else {
          const dep = groups[railIndex]?.items[itemIndex];
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

  // ─── Styles ──────────────────────────────────────────────────────────────
  const backBtnStyle = (focused: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10,
    color: focused ? colors.background.brandPrimary : colors.text.primaryInverse,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 28,
    fontWeight: 500,
    lineHeight: '120%',
    background: 'none',
    border: focused ? `4px solid ${colors.background.brandPrimary}` : '4px solid transparent',
    borderRadius: 32, paddingRight: 32, paddingLeft: 0, height: 72, cursor: 'pointer', outline: 'none',
    transition: 'all 0.2s ease-out', flexShrink: 0,
  });

  const tabBtnStyle = (active: boolean, focused: boolean): React.CSSProperties => ({
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 28,
    fontWeight: 500,
    lineHeight: '120%',
    color: active ? '#11172B' : colors.text.primaryInverse,
    background: active ? '#FFF' : 'transparent',
    border: focused ? `4px solid ${colors.background.brandPrimary}` : (active ? '4px solid #FFF' : '4px solid transparent'),
    borderRadius: 100, padding: '0 24px', height: 72, cursor: 'pointer', outline: 'none',
    transition: 'all 0.2s ease-out', flexShrink: 0,
    display: 'flex', alignItems: 'center',
  });

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={{ position: 'fixed', inset: 0, background: colors.background.baseInverse, overflow: 'hidden', outline: 'none' }}
      onKeyDown={handleKeyDown}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        transform: `translateY(-${scrollY}px)`,
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>

        {/* ── Header ── */}
        <div style={{ height: HEADER_HEIGHT, display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 48, gap: 180 }}>
          {/* Voltar */}
          <button style={backBtnStyle(focusRegion === 'nav' && navIndex === 0)} onClick={onBack}>
            <div style={{ display: 'flex', width: 72, height: 72, justifyContent: 'center', alignItems: 'center', borderRadius: 100 }}>
              <svg width="32" height="32" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 16L0 8L8 0L9.86667 1.93333L5.13333 6.66667H21.3333V9.33333H5.13333L9.86667 14.0667L8 16Z" fill="currentColor"/>
              </svg>
            </div>
            Voltar
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32, overflowX: 'visible' }}>
            {/* Tabs */}
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                style={tabBtnStyle(activeTab === tab.id, focusRegion === 'nav' && navIndex === i + 1)}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Skeleton ── */}
        {loading && <><SkeletonRail /><SkeletonRail /><SkeletonRail /></>}

        {/* ── Rails ── */}
        {!loading && (
          <div style={{ padding: '16px 48px' }}>
            {groups.map((group, gIdx) => {
              const isRailFocused = focusRegion === 'grid' && railIndex === gIdx;
              return (
                <div key={group.label} style={{ marginBottom: 40 }}>
                  <h2 style={{ ...typography.body.large, color: colors.text.primaryInverse, margin: '0 0 40px 0' }}>
                    {group.label}
                  </h2>

                  {/* Two-div scroll pattern */}
                  <div style={{
                    position: 'relative', width: '100%',
                    height: isRailFocused ? '380px' : '310px',
                    transition: 'height 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
                    overflow: 'visible',
                  }}>
                    <div
                      className="deputy-grid-rail"
                      style={{
                        position: 'absolute', inset: 0,
                        display: 'flex',
                        gap: 24, overflowX: 'auto', overflowY: 'visible',
                        alignItems: 'center', scrollbarWidth: 'none',
                        msOverflowStyle: 'none', scrollBehavior: 'smooth',
                        boxSizing: 'border-box',
                      }}
                    >
                      {group.items.map((dep, dIdx) => {
                        const isFocused = isRailFocused && itemIndex === dIdx;
                        return (
                          <div
                            key={dep.id}
                            ref={(el) => {
                              if (!itemRefs.current[gIdx]) itemRefs.current[gIdx] = [];
                              itemRefs.current[gIdx][dIdx] = el;
                            }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
                          >
                            <CircleButton
                              image={dep.photo}
                              label={dep.name}
                              isFocused={isFocused}
                              onClick={() => onDeputySelect(dep)}
                            />
                            <span style={{ ...typography.body.small, color: colors.text.secondaryInverse, marginTop: 4, textAlign: 'center' as const }}>
                              {activeTab === 'partido' ? dep.state : `${dep.party} · ${dep.state}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: 120 }} />
      </div>

      <style>{`.deputy-grid-rail::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
