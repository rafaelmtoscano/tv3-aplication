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

export default function DeputiesGrid({
  isActive,
  isSidebarExpanded,
  onBack,
  onDeputySelect,
}: DeputiesGridProps) {
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
          if (railIndex > 0) {
            setRailIndex(r => r - 1);
            setItemIndex(0);
          } else {
            setFocusRegion('nav');
            setNavIndex(0);
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (focusRegion === 'nav') {
          setFocusRegion('grid');
          setRailIndex(0);
          setItemIndex(0);
        } else if (railIndex < groups.length - 1) {
          setRailIndex(r => r + 1);
          setItemIndex(0);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (focusRegion === 'nav') {
          setNavIndex(n => Math.max(0, n - 1));
        } else if (itemIndex > 0) {
          setItemIndex(i => i - 1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (focusRegion === 'nav') {
          setNavIndex(n => Math.min(2, n + 1));
        } else if (itemIndex < groupLength - 1) {
          setItemIndex(i => i + 1);
        }
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

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="deputies-grid-root"
      onKeyDown={handleKeyDown}
    >
      <div
        className="deputies-grid-scroll-track"
        style={{ transform: `translateY(-${scrollY}px)` }}
      >
        {/* Header */}
        <div className="deputies-grid-header">
          <div className="deputies-grid-logo">
            <svg width="67" height="67" viewBox="0 0 67 67" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M33.5 0C52.0016 0 66.9999 14.9984 67 33.5C67 52.0016 52.0016 67 33.5 67C14.9984 66.9999 0 52.0016 0 33.5C6.9711e-05 14.9985 14.9985 6.97201e-05 33.5 0ZM9.69109 36.456H23.7581V57.147H28.1925V32.2687H9.63584L9.69109 36.456ZM53.5553 32.1303C53.5608 32.2109 54.6747 48.7872 37.5889 52.3202V32.2687H32.5646L32.5672 57.1241C32.6565 57.1298 57.2151 58.6727 58.2583 32.188L53.5553 32.1303Z" fill="white"/>
            </svg>
            <svg width="196" height="31" viewBox="0 0 196 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M178.673 30.3995H173.422L181.424 7.2207H187.739L195.729 30.3995H190.478L184.672 12.5174H184.491L178.673 30.3995ZM178.345 21.2887H190.749V25.1141H178.345V21.2887Z" fill="white"/>
              <path d="M153.766 30.3995V7.2207H162.91C164.661 7.2207 166.155 7.53383 167.392 8.16008C168.637 8.77878 169.584 9.65779 170.233 10.7971C170.889 11.9289 171.218 13.2606 171.218 14.7923C171.218 16.3315 170.886 17.6557 170.222 18.7648C169.558 19.8664 168.596 20.7115 167.336 21.3C166.083 21.8885 164.567 22.1828 162.786 22.1828H156.663V18.2442H161.994C162.929 18.2442 163.706 18.1159 164.325 17.8594C164.944 17.6029 165.404 17.2181 165.706 16.705C166.015 16.1919 166.17 15.5543 166.17 14.7923C166.17 14.0227 166.015 13.3738 165.706 12.8456C165.404 12.3175 164.94 11.9176 164.314 11.6459C163.695 11.3668 162.914 11.2272 161.971 11.2272H158.666V30.3995H153.766ZM166.283 19.8513L172.044 30.3995H166.634L160.998 19.8513H166.283Z" fill="white"/>
              <path d="M133.916 30.3995H128.664L136.666 7.2207H142.981L150.971 30.3995H145.72L139.914 12.5174H139.733L133.916 30.3995ZM133.587 21.2887H145.992V25.1141H133.587V21.2887Z" fill="white"/>
              <path d="M100.758 7.2207H106.801L113.185 22.7939H113.456L119.84 7.2207H125.883V30.3995H121.13V15.3129H120.937L114.939 30.2863H111.702L105.704 15.2563H105.511V30.3995H100.758V7.2207Z" fill="white"/>
              <path d="M80.9155 30.3995H75.6641L83.6657 7.22073H89.981L97.9714 30.3995H92.7199L86.9139 12.5174H86.7328L80.9155 30.3995ZM80.5873 21.2887H92.9915V25.1141H80.5873V21.2887ZM89.0982 5.13826L86.8234 2.37673L84.5485 5.13826H80.4402V4.97981L85.0238 0H88.6116L93.2066 4.97981V5.13826H89.0982Z" fill="white"/>
              <path d="M73.843 15.336H68.8858C68.7953 14.6947 68.6104 14.125 68.3312 13.627C68.0521 13.1215 67.6937 12.6914 67.2561 12.3368C66.8184 11.9822 66.3129 11.7106 65.7395 11.5219C65.1736 11.3333 64.5587 11.239 63.8947 11.239C62.695 11.239 61.65 11.537 60.7597 12.1331C59.8693 12.7216 59.179 13.5818 58.6885 14.7135C58.1981 15.8378 57.9529 17.2035 57.9529 18.8106C57.9529 20.463 58.1981 21.8513 58.6885 22.9755C59.1865 24.0997 59.8807 24.9486 60.771 25.522C61.6613 26.0954 62.6912 26.3821 63.8607 26.3821C64.5172 26.3821 65.1246 26.2954 65.6829 26.1218C66.2488 25.9483 66.7505 25.6955 67.1882 25.3636C67.6258 25.024 67.9879 24.6128 68.2747 24.1299C68.5689 23.647 68.7726 23.0962 68.8858 22.4775L73.843 22.5002C73.7147 23.564 73.3941 24.5902 72.881 25.5786C72.3755 26.5595 71.6926 27.4385 70.8325 28.2156C69.9799 28.9852 68.9613 29.5964 67.7767 30.0491C66.5996 30.4943 65.2679 30.7168 63.7815 30.7168C61.7141 30.7168 59.8656 30.2491 58.2358 29.3135C56.6136 28.3778 55.3309 27.0235 54.3878 25.2504C53.4522 23.4773 52.9844 21.3307 52.9844 18.8106C52.9844 16.2829 53.4597 14.1326 54.4104 12.3595C55.3611 10.5863 56.6513 9.23575 58.2811 8.3077C59.9108 7.3721 61.7443 6.9043 63.7815 6.9043C65.1245 6.9043 66.3695 7.09293 67.5164 7.47018C68.6708 7.84744 69.6932 8.39824 70.5835 9.12258C71.4738 9.83937 72.1981 10.7184 72.7565 11.7596C73.3224 12.8008 73.6845 13.993 73.843 15.336Z" fill="white"/>
              <path d="M26.3579 7.2207L31.9602 24.8311H32.1752L37.7888 7.2207H43.2214L35.231 30.3995H28.9157L20.9141 7.2207H26.3579Z" fill="white"/>
              <path d="M0 11.2611V7.2207H19.0365V11.2611H11.9402V30.3995H7.09623V11.2611H0Z" fill="white"/>
            </svg>
          </div>
          <div className="deputies-grid-nav">
            <button
              className={`deputies-grid-back-btn${focusRegion === 'nav' && navIndex === 0 ? ' deputies-grid-back-btn--focused' : ''}`}
              onClick={onBack}
            >
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 16L0 8L8 0L9.86667 1.93333L5.13333 6.66667H21.3333V9.33333H5.13333L9.86667 14.0667L8 16Z" fill="currentColor"/>
              </svg>
              Voltar
            </button>
            <div className="deputies-grid-filters">
              <button
                className={`deputies-grid-filter-btn${filterMode === 'estado' ? ' deputies-grid-filter-btn--active' : ''}${focusRegion === 'nav' && navIndex === 1 ? ' deputies-grid-filter-btn--focused' : ''}`}
                onClick={() => setFilterMode('estado')}
              >
                Estados
              </button>
              <button
                className={`deputies-grid-filter-btn${filterMode === 'partido' ? ' deputies-grid-filter-btn--active' : ''}${focusRegion === 'nav' && navIndex === 2 ? ' deputies-grid-filter-btn--focused' : ''}`}
                onClick={() => setFilterMode('partido')}
              >
                Partido
              </button>
            </div>
          </div>
        </div>

        {/* Rails */}
        {loading ? (
          <div className="deputies-grid-loading">
            <p>Carregando deputados...</p>
          </div>
        ) : (
          groups.map((group, gIdx) => (
            <div key={group.label} className="deputies-grid-group">
              <h2 className="deputies-grid-group-label">
                {group.label}
              </h2>
              <div className="deputies-grid-group-rail">
                <div className="deputies-grid-group-rail-inner">
                  {group.items.map((dep, dIdx) => {
                    const isFocused = focusRegion === 'grid' && railIndex === gIdx && itemIndex === dIdx;
                    return (
                      <div key={dep.id} className="deputies-grid-deputy-item">
                        <CircleButton
                          image={dep.photo}
                          label={dep.name}
                          isFocused={isFocused}
                          onClick={() => onDeputySelect(dep)}
                        />
                        <span className="deputies-grid-deputy-sublabel">
                          {filterMode === 'estado' ? dep.party : dep.state}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="deputies-grid-group-spacer" />
            </div>
          ))
        )}
        <div className="deputies-grid-bottom-spacer" />
      </div>

      <style>{`
        .deputies-grid-root {
          position: fixed;
          inset: 0;
          background: ${colors.background.baseInverse};
          overflow: hidden;
          outline: none;
        }
        .deputies-grid-scroll-track {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .deputies-grid-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 48px 48px 0;
        }
        .deputies-grid-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .deputies-grid-nav {
          display: flex;
          align-items: center;
          width: 100%;
          position: relative;
          padding: 0 16px;
        }
        .deputies-grid-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${colors.text.primaryInverse};
          font-family: ${typography.headline.medium.fontFamily};
          font-weight: ${typography.headline.medium.fontWeight};
          font-size: ${typography.headline.medium.fontSize};
          line-height: ${typography.headline.medium.lineHeight};
          background: none;
          border: 2px solid transparent;
          border-radius: 32px;
          padding: 8px 24px 8px 8px;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease-out;
        }
        .deputies-grid-back-btn--focused {
          color: ${colors.background.brandPrimary};
          border-color: ${colors.background.brandPrimary};
        }
        .deputies-grid-filters {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 16px;
        }
        .deputies-grid-filter-btn {
          font-family: ${typography.headline.medium.fontFamily};
          font-weight: ${typography.headline.medium.fontWeight};
          font-size: ${typography.headline.medium.fontSize};
          line-height: ${typography.headline.medium.lineHeight};
          color: ${colors.text.primaryInverse};
          background: transparent;
          border: 2px solid transparent;
          border-radius: 100px;
          height: 72px;
          padding: 0 24px;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease-out;
        }
        .deputies-grid-filter-btn--active {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .deputies-grid-filter-btn--focused {
          border-color: ${colors.background.brandPrimary};
        }
        .deputies-grid-loading {
          padding: 48px 64px;
          font-family: ${typography.body.large.fontFamily};
          font-size: ${typography.body.large.fontSize};
          color: ${colors.text.secondaryInverse};
        }
        .deputies-grid-group {
          padding-top: 40px;
          overflow: visible;
        }
        .deputies-grid-group-label {
          font-family: ${typography.body.large.fontFamily};
          font-weight: ${typography.body.large.fontWeight};
          font-size: ${typography.body.large.fontSize};
          line-height: ${typography.body.large.lineHeight};
          color: ${colors.text.primaryInverse};
          padding-left: 48px;
          margin: 0 0 32px 0;
        }
        .deputies-grid-group-rail {
          height: 366px;
          overflow: visible;
        }
        .deputies-grid-group-rail-inner {
          display: flex;
          flex-direction: row;
          padding-left: 48px;
          gap: 24px;
          overflow: visible;
          align-items: center;
          height: 100%;
        }
        .deputies-grid-deputy-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        .deputies-grid-deputy-sublabel {
          font-family: ${typography.label.small.fontFamily};
          font-weight: ${typography.label.small.fontWeight};
          font-size: ${typography.label.small.fontSize};
          line-height: ${typography.label.small.lineHeight};
          color: ${colors.text.secondaryInverse};
          margin-top: 4px;
          text-align: center;
        }
        .deputies-grid-group-spacer {
          height: 40px;
        }
        .deputies-grid-bottom-spacer {
          height: 120px;
        }
      `}</style>
    </div>
  );
}
