import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MutableRefObject } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';
import { mockPharmacies, type Pharmacy } from '../../data/pharmacies';
import { usePharmacyLocation } from '../../hooks/usePharmacyLocation';
import { usePharmacyRenovationAlerts } from '../../hooks/usePharmacyRenovationAlerts';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import type { MainZone } from '../../hooks/useFocusNavigation';

interface PharmaciesProps {
  mainZone: MainZone;
  mainItemIndex: number;
  isActive: boolean;
  onExit: () => void;
}

type ViewTab = 'farmacias' | 'historico';

function formatDays(days: number) {
  if (days === 0) return 'vence hoje';
  if (days < 0) return `atrasada há ${Math.abs(days)} dias`;
  if (days === 1) return '1 dia restante';
  return `${days} dias restantes`;
}

function formatLastVisit(date: Date) {
  const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'há 1 dia';
  return `há ${diff} dias`;
}

function MapController({ activePharmacy, mapRef, markersRef }: {
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
    if (!activePharmacy) return;
    map.flyTo([activePharmacy.latitude, activePharmacy.longitude], 15, {
      animate: true,
      duration: 0.8,
    });

    const marker = markersRef.current[activePharmacy.id];
    marker?.openPopup();
  }, [activePharmacy, map, markersRef]);

  return null;
}

export default function Pharmacies({ mainZone, mainItemIndex, isActive, onExit }: PharmaciesProps) {
  const { govBrUser, isLoggedIn, isGovBrConnected, loginMock, connectGovBrMock } = useAuth();
  const { location } = usePharmacyLocation(govBrUser?.cep);
  const alerts = usePharmacyRenovationAlerts(govBrUser?.dispensacoes ?? []);
  const [activeTab, setActiveTab] = useState<ViewTab>('farmacias');
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

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

    const top = [...counts.values()].sort((a, b) => b.visits - a.visits || b.lastDate.getTime() - a.lastDate.getTime())[0];
    return top ?? null;
  }, [govBrUser]);

  const orderedPharmacies = useMemo(() => {
    if (!isGovBrConnected || !habitualPharmacy) return mockPharmacies;
    return [habitualPharmacy.pharmacy, ...mockPharmacies.filter((item) => item.id !== habitualPharmacy.pharmacy.id)];
  }, [habitualPharmacy, isGovBrConnected]);

  const focusedIndex = mainZone === 'rail-0' ? mainItemIndex : 0;
  const activePharmacy = orderedPharmacies[focusedIndex] ?? orderedPharmacies[0];
  const mostUrgentAlert = alerts[0] ?? null;
  const locationLabel = location ? `${location.city}/${location.state}` : 'João Pessoa/PB';
  const isFullMode = isLoggedIn && isGovBrConnected;

  useEffect(() => {
    if (!isActive) return;
    setActiveTab('farmacias');
  }, [isActive]);

  useEffect(() => {
    if (!isFullMode && activeTab === 'historico') {
      setActiveTab('farmacias');
    }
  }, [activeTab, isFullMode]);

  const pageStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    background: colors.background.baseInverse,
    display: 'flex',
    flexDirection: 'column',
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    gap: '32px',
    padding: '32px 40px 40px 32px',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  const leftColumnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: 0,
    overflow: 'hidden',
  };

  const rightColumnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: 0,
    overflow: 'hidden',
  };

  const headerCardStyle: CSSProperties = {
    borderRadius: '28px',
    border: `1px solid ${colors.line.dark}`,
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const railStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingBottom: '12px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    scrollBehavior: 'smooth',
  };

  const cardBaseStyle = (focused: boolean): CSSProperties => ({
    width: '332px',
    flexShrink: 0,
    borderRadius: '24px',
    border: focused ? `2px solid ${colors.background.brandPrimary}` : `1px solid ${colors.line.dark}`,
    background: focused ? 'rgba(30, 167, 253, 0.12)' : 'rgba(255, 255, 255, 0.04)',
    padding: '18px',
    transform: focused ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'transform 0.25s ease, border-color 0.25s ease, background 0.25s ease',
    boxSizing: 'border-box',
    color: colors.text.primaryInverse,
  });

  const detailCardStyle: CSSProperties = {
    borderRadius: '28px',
    border: `1px solid ${colors.line.dark}`,
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minHeight: 0,
    overflow: 'hidden',
  };

  const panelCardStyle: CSSProperties = {
    borderRadius: '24px',
    border: `1px solid ${colors.line.dark}`,
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const bannerStyle = isLoggedIn && !isGovBrConnected
    ? {
        background: 'rgba(30, 167, 253, 0.08)',
        border: '1px solid rgba(30, 167, 253, 0.2)',
      }
    : {
        background: 'rgba(255, 255, 255, 0.04)',
        border: `1px solid ${colors.line.dark}`,
      };

  const urgentStyle: CSSProperties = {
    borderRadius: '24px',
    border: mostUrgentAlert?.urgency === 'urgent' ? `1px solid ${colors.feedback.error}` : '1px solid #F5C542',
    background: mostUrgentAlert?.urgency === 'urgent' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 197, 66, 0.12)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const markerIcon = (focused: boolean) =>
    L.divIcon({
      className: '',
      html: `
        <div style="width:18px;height:18px;border-radius:999px;background:${focused ? colors.background.brandPrimary : colors.background.primary};border:2px solid rgba(17,23,43,0.35);box-shadow:0 8px 24px rgba(0,0,0,0.3);"></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

  return (
    <main style={pageStyle}>
      <div style={{ height: '88px', flexShrink: 0 }} />

      <div style={contentStyle}>
        <section style={leftColumnStyle}>
          <div style={headerCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ ...typography.label.small, color: colors.text.secondaryInverse, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Farmácias próximas
                </span>
                <h1 style={{ ...typography.headline.large, color: colors.text.primaryInverse, margin: 0 }}>
                  Onde retirar seus medicamentos
                </h1>
              </div>
              <button
                type="button"
                onClick={onExit}
                style={{
                  border: `1px solid ${colors.line.dark}`,
                  background: 'transparent',
                  color: colors.text.primaryInverse,
                  borderRadius: '999px',
                  padding: '12px 16px',
                  ...typography.label.small,
                }}
              >
                Voltar
              </button>
            </div>

            <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: 0 }}>
              Região detectada: {locationLabel}
            </p>
          </div>

          {!isLoggedIn && (
            <div style={{ ...panelCardStyle, ...bannerStyle }}>
              <span style={{ ...typography.headline.small, color: colors.text.primaryInverse }}>Faça login para ver mais</span>
              <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: 0 }}>
                Veja seu histórico, identifique sua farmácia habitual e receba alertas de renovação.
              </p>
              <button
                type="button"
                onClick={loginMock}
                style={{
                  alignSelf: 'flex-start',
                  border: 'none',
                  borderRadius: '999px',
                  background: colors.background.primary,
                  color: colors.text.primary,
                  padding: '12px 18px',
                  ...typography.label.small,
                }}
              >
                Entrar no app
              </button>
            </div>
          )}

          {isLoggedIn && !isGovBrConnected && (
            <div style={{ ...panelCardStyle, ...bannerStyle }}>
              <span style={{ ...typography.headline.small, color: colors.text.primaryInverse }}>Conecte o gov.br para ver seu histórico</span>
              <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: 0 }}>
                Conecte o gov.br para ver seu histórico de medicamentos e receber alertas de renovação.
              </p>
              <button
                type="button"
                onClick={connectGovBrMock}
                style={{
                  alignSelf: 'flex-start',
                  border: 'none',
                  borderRadius: '999px',
                  background: colors.background.brandPrimary,
                  color: colors.text.primaryInverse,
                  padding: '12px 18px',
                  ...typography.label.small,
                }}
              >
                Conectar gov.br
              </button>
            </div>
          )}

          <div style={railStyle} className="pharmacies-rail-hide-scrollbar">
            {orderedPharmacies.map((pharmacy, index) => {
              const focused = focusedIndex === index;
              const isHabitual = isFullMode && habitualPharmacy?.pharmacy.id === pharmacy.id;

              return (
                <button
                  key={pharmacy.id}
                  type="button"
                  style={cardBaseStyle(focused)}
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.flyTo([pharmacy.latitude, pharmacy.longitude], 15, { animate: true, duration: 0.8 });
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                      <span style={{ ...typography.headline.small, color: colors.text.primaryInverse, margin: 0 }}>{pharmacy.name}</span>
                      <span style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: 0 }}>
                        {pharmacy.neighborhood} · {pharmacy.city}/{pharmacy.state}
                      </span>
                    </div>
                    {isHabitual && (
                      <span style={{
                        borderRadius: '999px',
                        background: 'rgba(16, 185, 129, 0.16)',
                        color: colors.text.primaryInverse,
                        padding: '6px 10px',
                        ...typography.label.small,
                        whiteSpace: 'nowrap',
                        height: 'fit-content',
                      }}>
                        Habitual
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ ...typography.body.small, color: colors.text.primaryInverse }}>{pharmacy.address}</span>
                    <span style={{ ...typography.body.small, color: colors.text.secondaryInverse }}>{pharmacy.phone}</span>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <span style={{ ...typography.label.small, color: colors.text.secondaryInverse }}>CNES {pharmacy.cnes}</span>
                    {isHabitual && habitualPharmacy && (
                      <span style={{ ...typography.label.small, color: colors.text.primaryInverse }}>
                        última visita {formatLastVisit(habitualPharmacy.lastDate)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section style={rightColumnStyle}>
          <div style={detailCardStyle}>
            {isFullMode && mostUrgentAlert && (
              <div style={urgentStyle}>
                <span style={{ ...typography.headline.small, color: colors.text.primaryInverse }}>Renovação necessária</span>
                <p style={{ ...typography.body.small, color: colors.text.primaryInverse, margin: 0 }}>
                  {mostUrgentAlert.dispensacao.medicamento} · {formatDays(mostUrgentAlert.daysLeft)}
                </p>
                <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: 0 }}>
                  {mostUrgentAlert.dispensacao.indicacao} • {mostUrgentAlert.dispensacao.farmaciaName}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('historico')}
                  style={{
                    alignSelf: 'flex-start',
                    border: 'none',
                    borderRadius: '999px',
                    background: colors.background.primary,
                    color: colors.text.primary,
                    padding: '12px 18px',
                    ...typography.label.small,
                  }}
                >
                  Ver histórico
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', minHeight: 0 }}>
              <div style={{ ...panelCardStyle, padding: 0, overflow: 'hidden' }}>
                <MapContainer
                  center={[activePharmacy.latitude, activePharmacy.longitude]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ width: '100%', height: '220px' }}
                >
                  <MapController activePharmacy={activePharmacy} mapRef={mapRef} markersRef={markerRefs} />
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  {orderedPharmacies.map((pharmacy, index) => {
                    const focused = focusedIndex === index;
                    return (
                      <Marker
                        key={pharmacy.id}
                        position={[pharmacy.latitude, pharmacy.longitude]}
                        icon={markerIcon(focused)}
                        ref={(marker) => {
                          markerRefs.current[pharmacy.id] = marker;
                        }}
                      >
                        <Popup>
                          {pharmacy.name}
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              <div style={panelCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ ...typography.label.small, color: colors.text.secondaryInverse, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Detalhe da farmácia
                    </span>
                    <h2 style={{ ...typography.headline.large, color: colors.text.primaryInverse, margin: 0 }}>
                      {activePharmacy.name}
                    </h2>
                  </div>
                  <span style={{
                    borderRadius: '999px',
                    background: 'rgba(30, 167, 253, 0.16)',
                    color: colors.text.primaryInverse,
                    padding: '8px 12px',
                    ...typography.label.small,
                  }}>
                    {activePharmacy.city}/{activePharmacy.state}
                  </span>
                </div>

                <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: 0 }}>
                  {activePharmacy.address} • {activePharmacy.neighborhood}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                  {activePharmacy.horarios.map((horario) => (
                    <div key={`${activePharmacy.id}-${horario.dias}`} style={{ borderRadius: '18px', background: colors.background.primaryInverse, padding: '14px' }}>
                      <div style={{ ...typography.label.small, color: colors.text.secondaryInverse }}>{horario.dias}</div>
                      <div style={{ ...typography.body.small, color: colors.text.primaryInverse }}>{horario.abre} às {horario.fecha}</div>
                    </div>
                  ))}
                </div>
              </div>

              {isFullMode && activeTab === 'historico' && (
                <div style={panelCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <h3 style={{ ...typography.headline.small, color: colors.text.primaryInverse, margin: 0 }}>Meu histórico</h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('farmacias')}
                      style={{
                        border: 'none',
                        borderRadius: '999px',
                        background: colors.background.primaryInverse,
                        color: colors.text.primaryInverse,
                        padding: '10px 14px',
                        ...typography.label.small,
                      }}
                    >
                      Voltar às farmácias
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
                    {alerts.map((alert) => (
                      <div key={alert.dispensacao.id} style={{ borderRadius: '20px', border: `1px solid ${colors.line.dark}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <strong style={{ ...typography.body.small, color: colors.text.primaryInverse }}>{alert.dispensacao.medicamento}</strong>
                          <span style={{
                            borderRadius: '999px',
                            background: alert.urgency === 'urgent' ? 'rgba(239, 68, 68, 0.2)' : alert.urgency === 'warn' ? 'rgba(245, 197, 66, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: colors.text.primaryInverse,
                            padding: '6px 10px',
                            ...typography.label.small,
                            whiteSpace: 'nowrap',
                          }}>
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
                </div>
              )}

              {isFullMode && govBrUser && (
                <div style={panelCardStyle}>
                  <h3 style={{ ...typography.headline.small, color: colors.text.primaryInverse, margin: 0 }}>CNS e condições</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                    <div style={{ borderRadius: '18px', background: colors.background.primaryInverse, padding: '16px' }}>
                      <div style={{ ...typography.label.small, color: colors.text.secondaryInverse }}>CNS</div>
                      <div style={{ ...typography.body.small, color: colors.text.primaryInverse }}>{govBrUser.cns}</div>
                    </div>
                    <div style={{ borderRadius: '18px', background: colors.background.primaryInverse, padding: '16px' }}>
                      <div style={{ ...typography.label.small, color: colors.text.secondaryInverse }}>CEP</div>
                      <div style={{ ...typography.body.small, color: colors.text.primaryInverse }}>{govBrUser.cep}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {govBrUser.condicoes.map((condicao) => (
                      <span key={condicao} style={{ borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', color: colors.text.primaryInverse, padding: '10px 14px', ...typography.label.small }}>
                        {condicao}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .pharmacies-rail-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}
