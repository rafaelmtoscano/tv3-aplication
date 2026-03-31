import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MutableRefObject } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';
import { mockPharmacies, type Pharmacy } from '../../data/pharmacies';
import { usePharmacyLocation } from '../../hooks/usePharmacyLocation';
import { usePharmacies } from '../../hooks/usePharmacies';
import { usePharmacyRenovationAlerts } from '../../hooks/usePharmacyRenovationAlerts';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ChevronLeftIcon } from '../../icons';
import type { MainZone } from '../../hooks/useFocusNavigation';

interface PharmaciesProps {
  mainZone: MainZone;
  mainItemIndex: number;
  isActive: boolean;
  onExit: () => void;
}

type ViewTab = 'farmacias' | 'historico';
type NavSection = 'back' | 'chips' | 'list';

function formatDays(days: number) {
  if (days === 0) return 'vence hoje';
  if (days < 0) return `atrasada há ${Math.abs(days)} dias`;
  if (days === 1) return '1 dia restante';
  return `${days} dias restantes`;
}

function MapController({
  activePharmacy,
  mapRef,
  markersRef,
}: {
  activePharmacy: Pharmacy;
  mapRef: MutableRefObject<L.Map | null>;
  markersRef: MutableRefObject<Record<string, L.Marker | null>>;
}) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);

  useEffect(() => {
    map.flyTo([activePharmacy.latitude, activePharmacy.longitude], 15, {
      animate: true,
      duration: 0.8,
    });
    markersRef.current[activePharmacy.id]?.openPopup();
  }, [activePharmacy, map, markersRef]);

  return null;
}

export default function Pharmacies({ mainZone, mainItemIndex, isActive, onExit }: PharmaciesProps) {
  const { govBrUser, isGovBrConnected } = useAuth();
  const { location } = usePharmacyLocation(govBrUser?.cep);
  const { pharmacies: apiPharmacies, loading: pharmaciesLoading, error: pharmaciesError, isMockData } = usePharmacies(location);
  const alerts = usePharmacyRenovationAlerts(govBrUser?.dispensacoes ?? []);
  const [activeTab, setActiveTab] = useState<ViewTab>('farmacias');
  const [navSection, setNavSection] = useState<NavSection>('list');
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const listRef = useRef<HTMLDivElement>(null);

  const habitualPharmacy = useMemo(() => {
    if (!govBrUser) return null;

    const counts = new Map<string, { pharmacy: Pharmacy; visits: number; lastDate: Date }>();
    for (const dispensacao of govBrUser.dispensacoes) {
      const pharmacy = mockPharmacies.find((item) => item.cnes === dispensacao.farmaciaCnes);
      if (!pharmacy) continue;

      const current = counts.get(pharmacy.id);
      const retirada = new Date(dispensacao.dataRetirada);

      if (!current) {
        counts.set(pharmacy.id, { pharmacy, visits: 1, lastDate: retirada });
      } else {
        current.visits += 1;
        if (retirada > current.lastDate) {
          current.lastDate = retirada;
        }
      }
    }

    return [...counts.values()].sort((a, b) => b.visits - a.visits || b.lastDate.getTime() - a.lastDate.getTime())[0] ?? null;
  }, [govBrUser]);

  const orderedPharmacies = useMemo(() => {
    if (!isGovBrConnected || !habitualPharmacy) return apiPharmacies;
    return [habitualPharmacy.pharmacy, ...apiPharmacies.filter((item) => item.id !== habitualPharmacy.pharmacy.id)];
  }, [habitualPharmacy, isGovBrConnected, apiPharmacies]);

  const focusedIndex = navSection === 'list' && mainZone === 'rail-0' ? mainItemIndex : -1;
  const activePharmacy = orderedPharmacies[focusedIndex >= 0 ? focusedIndex : 0];
  const mostUrgentAlert = alerts[0] ?? null;
  const locationLabel = location ? `${location.city}/${location.state}` : 'João Pessoa/PB';
  const isFullMode = isGovBrConnected;

  // Reset to list focus when page becomes active
  useEffect(() => {
    if (isActive) {
      setActiveTab('farmacias');
      setNavSection('list');
    }
  }, [isActive]);

  // Sync navSection back to list when parent navigation returns to rail-0
  useEffect(() => {
    if (mainZone === 'rail-0' && navSection !== 'list') {
      // Only auto-sync if mainItemIndex changed (real navigation happened)
    }
  }, [mainZone, mainItemIndex, navSection]);

  useEffect(() => {
    if (!isFullMode && activeTab === 'historico') {
      setActiveTab('farmacias');
    }
  }, [activeTab, isFullMode]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [focusedIndex]);

  const cardStyle = (focused = false): CSSProperties => ({
    borderRadius: '16px',
    border: focused ? `1px solid ${colors.background.brandPrimary}` : `1px solid ${colors.line.dark}`,
    background: focused ? 'rgba(30, 167, 253, 0.12)' : 'rgba(255, 255, 255, 0.04)',
    transition: 'all 0.2s ease',
  });

  const pillStyle = (background: string, color: string): CSSProperties => ({
    borderRadius: '999px',
    padding: '4px 10px',
    background,
    color,
    ...typography.label.small,
  });

  const tabChipStyle = (active: boolean, focused: boolean): CSSProperties => ({
    border: focused ? `2px solid ${colors.background.primary}` : '2px solid transparent',
    borderRadius: '100px',
    padding: '10px 22px',
    background: focused
      ? colors.background.primary
      : active
        ? 'rgba(255,255,255,0.20)'
        : 'rgba(255,255,255,0.08)',
    color: focused
      ? colors.text.primary
      : active
        ? colors.text.primaryInverse
        : colors.text.secondaryInverse,
    ...typography.headline.small,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  });

  const markerIcon = (focused: boolean) =>
    L.divIcon({
      className: '',
      html: `<div style="width:14px;height:14px;border-radius:999px;background:${focused ? colors.background.brandPrimary : colors.background.primary};border:2px solid rgba(17,23,43,0.4);box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

  const pageStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    background: colors.background.baseInverse,
    display: 'grid',
    gridTemplateColumns: '88px 1fr 1fr',
  };

  const leftColumnStyle: CSSProperties = {
    gridColumn: '2',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '48px 16px 24px 48px',
    minHeight: 0,
    overflow: 'hidden',
  };

  const rightColumnStyle: CSSProperties = {
    gridColumn: '3',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '48px 64px 24px 16px',
    minHeight: 0,
    overflow: 'hidden',
  };

  // Refs for capture-phase keyboard handler (avoid re-registering on every state change)
  const navSectionRef = useRef(navSection);
  navSectionRef.current = navSection;
  const mainItemIndexRef = useRef(mainItemIndex);
  mainItemIndexRef.current = mainItemIndex;
  const focusedIndexRef = useRef(focusedIndex);
  focusedIndexRef.current = focusedIndex;
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isActiveRef.current) return;

      // Escape/Backspace always exits
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onExitRef.current();
        return;
      }

      const section = navSectionRef.current;
      const itemIdx = mainItemIndexRef.current;
      const focIdx = focusedIndexRef.current;

      // Zone transitions: list → chips → back (ArrowUp) and back → chips → list (ArrowDown)
      if (e.key === 'ArrowUp') {
        if (section === 'list' && (itemIdx === 0 || focIdx <= 0)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setNavSection('chips');
          return;
        }
        if (section === 'chips') {
          e.preventDefault();
          e.stopImmediatePropagation();
          setNavSection('back');
          return;
        }
      }

      if (e.key === 'ArrowDown') {
        if (section === 'back') {
          e.preventDefault();
          e.stopImmediatePropagation();
          setNavSection('chips');
          return;
        }
        if (section === 'chips') {
          e.preventDefault();
          e.stopImmediatePropagation();
          setNavSection('list');
          return;
        }
      }

      // Enter/Space actions per zone
      if (e.key === 'Enter' || e.key === ' ') {
        if (section === 'back') {
          e.preventDefault();
          e.stopImmediatePropagation();
          onExitRef.current();
          return;
        }
      }
    };

    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, []);

  return (
    <main style={pageStyle}>
      <style>{`.pharmacy-list::-webkit-scrollbar { display: none; }`}</style>
      <div style={{ gridColumn: '1', gridRow: '1 / -1' }} />

      <div style={leftColumnStyle}>
        <button
          type="button"
          onClick={onExit}
          tabIndex={0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            alignSelf: 'flex-start',
            background: navSection === 'back' ? 'rgba(255,255,255,0.12)' : 'none',
            border: navSection === 'back' ? `2px solid ${colors.background.primary}` : '2px solid transparent',
            color: colors.text.primaryInverse,
            cursor: 'pointer',
            padding: '8px 16px 8px 10px',
            borderRadius: '100px',
            ...typography.body.medium,
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
        >
          <ChevronLeftIcon size={24} color={colors.text.primaryInverse} />
          Voltar
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h1 style={{ ...typography.display.medium, color: colors.text.primaryInverse, margin: 0, lineHeight: 1 }}>
            Retirada de Medicamentos
          </h1>
          <span style={{ ...typography.label.small, color: colors.text.disabledInverse }}>
            Região detectada: {locationLabel}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', width: 'fit-content', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('farmacias')}
            style={tabChipStyle(activeTab === 'farmacias', navSection === 'chips' && activeTab === 'farmacias')}
          >
            Próximas
          </button>
          {isFullMode && (
            <button
              type="button"
              onClick={() => setActiveTab('historico')}
              style={tabChipStyle(activeTab === 'historico', navSection === 'chips' && activeTab === 'historico')}
            >
              Meu histórico
            </button>
          )}
        </div>

        {activeTab === 'farmacias' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0, overflow: 'hidden', marginTop: '4px' }}>
            {isFullMode && habitualPharmacy && (
              <div style={{ ...typography.label.small, color: colors.text.disabledInverse, textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>
                Sua farmácia habitual
              </div>
            )}

            <div
              ref={listRef}
              className="pharmacy-list"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                overflowY: 'auto',
                minHeight: 0,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {orderedPharmacies.map((pharmacy, index) => {
                const focused = focusedIndex === index;
                const isHabitual = isFullMode && habitualPharmacy?.pharmacy.id === pharmacy.id;

                return (
                  <button
                    key={pharmacy.id}
                    type="button"
                    onClick={() => mapRef.current?.flyTo([pharmacy.latitude, pharmacy.longitude], 15, { animate: true, duration: 0.7 })}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxSizing: 'border-box',
                      flexShrink: 0,
                      border: focused ? 'none' : isHabitual ? '1px solid rgba(30,167,253,0.2)' : '1px solid transparent',
                      background: focused ? colors.background.primary : isHabitual ? 'rgba(30,167,253,0.06)' : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '999px', flexShrink: 0, background: focused ? colors.background.brandPrimary : colors.text.disabledInverse }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...typography.body.medium, color: focused ? colors.text.primary : colors.text.primaryInverse, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pharmacy.name}
                      </div>
                      <div style={{ ...typography.body.small, color: focused ? colors.text.secondary : colors.text.disabledInverse, marginTop: '2px' }}>
                        {pharmacy.neighborhood} · {pharmacy.cep}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      {isHabitual && <span style={pillStyle('rgba(16,185,129,0.15)', '#4ade80')}>Habitual</span>}
                      <span
                        style={pillStyle(
                          'rgba(255,255,255,0.06)',
                          colors.text.disabledInverse
                        )}
                      >
                        {pharmacy.city}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'historico' && isFullMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {alerts.map((alert) => (
              <div key={alert.dispensacao.id} style={{ ...cardStyle(), padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <strong style={{ ...typography.body.medium, color: colors.text.primaryInverse }}>{alert.dispensacao.medicamento}</strong>
                  <span
                    style={{
                      ...pillStyle(
                        alert.urgency === 'urgent' ? 'rgba(239,68,68,0.2)' : alert.urgency === 'warn' ? 'rgba(245,197,66,0.2)' : 'rgba(16,185,129,0.2)',
                        colors.text.primaryInverse
                      ),
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDays(alert.daysLeft)}
                  </span>
                </div>
                <span style={{ ...typography.body.small, color: colors.text.secondaryInverse }}>{alert.dispensacao.indicacao}</span>
                <span style={{ ...typography.body.small, color: colors.text.secondaryInverse }}>
                  {alert.dispensacao.farmaciaName} • retirada em {new Date(alert.dispensacao.dataRetirada).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

      <div style={rightColumnStyle}>
        {isFullMode && mostUrgentAlert ? (
          <div
            style={{
              ...cardStyle(),
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: mostUrgentAlert.urgency === 'urgent' ? 'rgba(239,68,68,0.10)' : 'rgba(245,197,66,0.10)',
              border: `1px solid ${mostUrgentAlert.urgency === 'urgent' ? 'rgba(239,68,68,0.3)' : 'rgba(245,197,66,0.3)'}`,
            }}
          >
            <span style={{ ...typography.body.small, color: colors.text.primaryInverse, flex: 1 }}>
              <strong>{mostUrgentAlert.dispensacao.medicamento}</strong> — {formatDays(mostUrgentAlert.daysLeft)}.
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('historico')}
              style={{
                border: 'none',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.1)',
                color: colors.text.primaryInverse,
                padding: '6px 14px',
                ...typography.label.small,
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              Ver histórico
            </button>
          </div>
        ) : (
          <div style={{ height: '48px' }} />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', minHeight: 0, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div style={{ ...cardStyle(), padding: 0, overflow: 'hidden' }}>
            <MapContainer
              center={[activePharmacy.latitude, activePharmacy.longitude]}
              zoom={15}
              scrollWheelZoom={false}
              zoomControl={false}
              attributionControl={false}
              style={{ width: '100%', height: '220px' }}
            >
              <MapController activePharmacy={activePharmacy} mapRef={mapRef} markersRef={markerRefs} />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {orderedPharmacies.map((pharmacy, index) => (
                <Marker
                  key={pharmacy.id}
                  position={[pharmacy.latitude, pharmacy.longitude]}
                  icon={markerIcon(focusedIndex === index)}
                  ref={(marker) => {
                    markerRefs.current[pharmacy.id] = marker;
                  }}
                >
                  <Popup>{pharmacy.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div style={{ ...cardStyle(), padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ ...typography.label.small, color: colors.text.secondaryInverse, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Detalhe da farmácia
                </span>
                <h2 style={{ ...typography.headline.large, color: colors.text.primaryInverse, margin: 0 }}>
                  {activePharmacy.name}
                </h2>
              </div>
              <span style={pillStyle('rgba(30,167,253,0.16)', colors.text.primaryInverse)}>
                {activePharmacy.city}/{activePharmacy.state}
              </span>
            </div>

            <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: 0 }}>
              {activePharmacy.address} • {activePharmacy.neighborhood}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              {activePharmacy.horarios.map((horario) => (
                <div key={`${activePharmacy.id}-${horario.dias}`} style={{ borderRadius: '16px', background: colors.background.primaryInverse, padding: '14px' }}>
                  <div style={{ ...typography.label.small, color: colors.text.secondaryInverse }}>{horario.dias}</div>
                  <div style={{ ...typography.body.small, color: colors.text.primaryInverse }}>{horario.abre} às {horario.fecha}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicador de fonte dos dados — visível apenas quando relevante */}
          {(pharmaciesLoading || pharmaciesError || !isMockData) && (
            <div style={{
              position: 'absolute', bottom: '16px', right: '16px',
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${colors.line.dark}`,
              ...typography.label.small,
              color: colors.text.disabledInverse,
              zIndex: 10,
            }}>
              {pharmaciesLoading && '⏳ Carregando farmácias...'}
              {!pharmaciesLoading && pharmaciesError && `ℹ ${pharmaciesError}`}
              {!pharmaciesLoading && !pharmaciesError && !isMockData && '✓ Dados CNES/DATASUS'}
            </div>
          )}

          {isFullMode && govBrUser && (
            <div style={{ ...cardStyle(), padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ ...typography.headline.small, color: colors.text.primaryInverse, margin: 0 }}>CNS e condições</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                <div style={{ borderRadius: '16px', background: colors.background.primaryInverse, padding: '16px' }}>
                  <div style={{ ...typography.label.small, color: colors.text.secondaryInverse }}>CNS</div>
                  <div style={{ ...typography.body.small, color: colors.text.primaryInverse }}>{govBrUser.cns}</div>
                </div>
                <div style={{ borderRadius: '16px', background: colors.background.primaryInverse, padding: '16px' }}>
                  <div style={{ ...typography.label.small, color: colors.text.secondaryInverse }}>CEP</div>
                  <div style={{ ...typography.body.small, color: colors.text.primaryInverse }}>{govBrUser.cep}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {govBrUser.condicoes.map((condicao) => (
                  <span key={condicao} style={pillStyle('rgba(255,255,255,0.08)', colors.text.primaryInverse)}>
                    {condicao}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
