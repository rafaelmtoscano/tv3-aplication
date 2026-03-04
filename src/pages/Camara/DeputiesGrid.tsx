import React, { useState, useEffect, useRef, useMemo } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { CircleButton } from '../../components/CircleButton/CircleButton';
import { deputies } from '../../data/deputies';
import type { Deputy } from '../../data/deputies';

interface DeputiesGridProps {
  onBack: () => void;
  onDeputySelect: (deputyId: string) => void;
}

type FilterType = 'estados' | 'partido';
type HeaderFocus = 'back' | 'estados' | 'partido';
type FocusZone = 'header' | 'grid';

interface DeputyGroup {
  label: string;
  deputies: Deputy[];
}

const GROUP_HEIGHT = 420; // px — CircleButton idle 248px + label 30px + gap 16px + group label + margin

export default function DeputiesGrid({ onBack, onDeputySelect }: DeputiesGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('estados');
  const [headerFocus, setHeaderFocus] = useState<HeaderFocus>('estados');
  const [focusZone, setFocusZone] = useState<FocusZone>('header');
  const [gridRow, setGridRow] = useState(0);
  const [gridCol, setGridCol] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const groups: DeputyGroup[] = useMemo(() => {
    const key: keyof Deputy = activeFilter === 'estados' ? 'state' : 'party';
    const map = new Map<string, Deputy[]>();
    deputies.forEach(dep => {
      const k = dep[key] as string;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(dep);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
      .map(([label, deps]) => ({ label, deputies: deps }));
  }, [activeFilter]);

  // Auto-focus container on mount
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Virtual scroll: start scrolling after row 1
  useEffect(() => {
    if (focusZone === 'grid' && gridRow > 1) {
      setScrollY((gridRow - 1) * GROUP_HEIGHT);
    } else {
      setScrollY(0);
    }
  }, [focusZone, gridRow]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (focusZone === 'header') {
      switch (e.key) {
        case 'ArrowLeft':
          if (headerFocus === 'partido') setHeaderFocus('estados');
          else if (headerFocus === 'estados') setHeaderFocus('back');
          break;
        case 'ArrowRight':
          if (headerFocus === 'back') setHeaderFocus('estados');
          else if (headerFocus === 'estados') setHeaderFocus('partido');
          break;
        case 'ArrowDown':
          setFocusZone('grid');
          setGridRow(0);
          setGridCol(0);
          break;
        case 'Enter':
          if (headerFocus === 'back') onBack();
          else if (headerFocus === 'estados') setActiveFilter('estados');
          else if (headerFocus === 'partido') setActiveFilter('partido');
          break;
        case 'Escape':
          onBack();
          break;
      }
    } else {
      // focusZone === 'grid'
      switch (e.key) {
        case 'ArrowUp':
          if (gridRow > 0) setGridRow(r => r - 1);
          else setFocusZone('header');
          break;
        case 'ArrowDown':
          if (gridRow < groups.length - 1) setGridRow(r => r + 1);
          break;
        case 'ArrowLeft':
          if (gridCol > 0) setGridCol(c => c - 1);
          break;
        case 'ArrowRight': {
          const maxCol = (groups[gridRow]?.deputies.length ?? 1) - 1;
          if (gridCol < maxCol) setGridCol(c => c + 1);
          break;
        }
        case 'Enter': {
          const dep = groups[gridRow]?.deputies[gridCol];
          if (dep) onDeputySelect(dep.id);
          break;
        }
        case 'Escape':
          onBack();
          break;
      }
    }
  };

  const isTabFocused = (tab: HeaderFocus) =>
    focusZone === 'header' && headerFocus === tab;

  const isBackFocused = focusZone === 'header' && headerFocus === 'back';

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="deputies-grid-root"
      onKeyDown={handleKeyDown}
    >
      <style>{`
        .deputies-grid-root {
          position: fixed;
          inset: 0;
          background: #0D1B12;
          overflow: hidden;
          outline: none;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .deputies-grid-header {
          height: 80px;
          display: flex;
          align-items: center;
          padding: 0 136px;
          position: relative;
          flex-shrink: 0;
          background: rgba(0,0,0,0.2);
        }
        .deputies-grid-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 8px;
          border: 2px solid transparent;
          transition: border-color 0.2s, background 0.2s;
          color: #FFF;
          z-index: 1;
        }
        .deputies-grid-back-btn.focused {
          border-color: ${colors.background.brandPrimary};
          background: rgba(30, 167, 253, 0.12);
        }
        .deputies-grid-tabs {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .deputies-grid-tab {
          padding: 10px 32px;
          border-radius: 24px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          border: 2px solid transparent;
        }
        .deputies-grid-tab.active {
          background: #FFF;
          color: #0D1B12;
        }
        .deputies-grid-tab.inactive {
          background: transparent;
          color: rgba(255,255,255,0.6);
        }
        .deputies-grid-tab.focused-inactive {
          border-color: ${colors.background.brandPrimary};
          background: rgba(30, 167, 253, 0.12);
          color: #FFF;
        }

        /* Content */
        .deputies-grid-content {
          flex: 1;
          overflow: hidden;
          padding: 32px 64px 32px 136px;
        }
        .deputies-grid-scroll-inner {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .deputies-group {
          margin-bottom: 40px;
        }
        .deputies-group-label {
          color: rgba(255,255,255,0.6);
          margin-bottom: 16px;
        }
        .deputies-group-row {
          display: flex;
          flex-direction: row;
          gap: 24px;
          flex-wrap: nowrap;
        }
      `}</style>

      {/* Header */}
      <div className="deputies-grid-header">
        {/* Back button */}
        <div
          className={`deputies-grid-back-btn${isBackFocused ? ' focused' : ''}`}
          onClick={onBack}
        >
          <span style={{ ...typography.body.large }}>← Voltar</span>
        </div>

        {/* Filter tabs */}
        <div className="deputies-grid-tabs">
          {(['estados', 'partido'] as FilterType[]).map(filter => {
            const isActive = activeFilter === filter;
            const isFocused = isTabFocused(filter);
            const tabClass = isActive
              ? 'deputies-grid-tab active'
              : isFocused
                ? 'deputies-grid-tab focused-inactive'
                : 'deputies-grid-tab inactive';
            const label = filter === 'estados' ? 'Estados' : 'Partido';
            return (
              <div
                key={filter}
                className={tabClass}
                onClick={() => setActiveFilter(filter)}
              >
                <span style={{ ...typography.body.large }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="deputies-grid-content">
        <div
          className="deputies-grid-scroll-inner"
          style={{ transform: `translateY(-${scrollY}px)` }}
        >
          {groups.map((group, groupIndex) => (
            <div key={group.label} className="deputies-group">
              <div
                className="deputies-group-label"
                style={{ ...typography.headline.small }}
              >
                {group.label}
              </div>
              <div className="deputies-group-row">
                {group.deputies.map((dep, depIndex) => (
                  <CircleButton
                    key={dep.id}
                    image={dep.photo}
                    label={dep.name}
                    isFocused={
                      focusZone === 'grid' &&
                      gridRow === groupIndex &&
                      gridCol === depIndex
                    }
                    onClick={() => onDeputySelect(dep.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
