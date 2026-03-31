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

    return [...counts.values()].sort((a, b) => b.visits - a.visits || b.lastDate.getTime() - a.lastDate.getTime())[0] ?? null;
  }, [govBrUser]);

  const orderedPharmacies = useMemo(() => {
    if (!isGovBrConnected || !habitualPharmacy) return mockPharmacies;
    return [habitualPharmacy.pharmacy, ...mockPharmacies.filter((item) => item.id !== habitualPharmacy.pharmacy.id)];
  }, [habitualPharmacy, isGovBrConnected]);

  const focusedIndex = mainZone === 'rail-0' ? mainItemIndex : -1;
  const activePharmacy = orderedPharmacies[focusedIndex] ?? orderedPharmacies[0];
  const mostUrgentAlert = alerts[0] ?? null;
  const locationLabel = location ? `${location.city}/${location.state}` : 'João Pessoa/PB';
  const isFullMode = isLoggedIn && isGovBrConnected;

  useEffect(() => {
    if (isActive) {
      setActiveTab('farmacias');
    }
  }, [isActive]);

  useEffect(() => {
    if (!isFullMode && activeTab === 'historico') {
      setActiveTab('farmacias');
    }
  }, [activeTab, isFullMode]);

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
    gridTemplateColumns: '88px 380px 1fr',
  };

  const leftColumnStyle: CSSProperties = {
    gridColumn: '2',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px 16px 24px 24px',
    minHeight: 0,
    overflow: 'hidden',
  };

  const rightColumnStyle: CSSProperties = {
    gridColumn: '3',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px 32px 24px 16px',
    minHeight: 0,
    overflow: 'hidden',
  };

  return (
    <main style={pageStyle}>
      <div style={{ gridColumn: '1', gridRow: '1 / -1' }} />

      <div style={leftColumnStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px' }}>
          <h1 style={{ ...typography.headline.medium, color: colors.text.primaryInverse, margin: 0 }}>
            Retirada de Medicamentos
          </h1>
          <span style={{ ...typography.label.small, color: colors.text.disabledInverse }}>
            Região detectada: {locationLabel}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!isLoggedIn && (
            <div style={{ ...cardStyle(), padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ ...typography.headline.small, color: colors.text.primaryInverse }}>Faça login para ver mais</div>
              <div style={{ ...typography.body.small, color: colors.text.disabledInverse }}>
                Veja histórico, farmácia habitual e alertas de renovação.
              </div>
              <button
                type="button"
                onClick={loginMock}
                style={{
                  alignSelf: 'flex-start',
                  border: 'none',
                  borderRadius: '999px',
                  background: colors.background.primary,
                  color: colors.text.primary,
                  padding: '8px 18px',
                  ...typography.label.small,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Entrar no app
              </button>
            </div>
          )}

          {isLoggedIn && !isGovBrConnected && (
            <div style={{ ...cardStyle(), padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(30,167,253,0.06)', border: '1px solid rgba(30,167,253,0.2)' }}>
              <div style={{ ...typography.headline.small, color: colors.text.primaryInverse }}>Conecte o gov.br para ver seu histórico</div>
              <div style={{ ...typography.body.small, color: colors.text.disabledInverse }}>
                Conecte para ver histórico HÓRUS, farmácia habitual e alertas.
              </div>
              <button
                type="button"
                onClick={connectGovBrMock}
                style={{
                  alignSelf: 'flex-start',
                  border: 'none',
                  borderRadius: '999px',
                  background: colors.background.brandPrimary,
                  color: colors.text.primaryInverse,
                  padding: '8px 18px',
                  ...typography.label.small,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Conectar gov.br
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', padding: '4px', width: 'fit-content' }}>
          <button
            type="button"
            onClick={() => setActiveTab('farmacias')}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '6px 16px',
              background: activeTab === 'farmacias' ? colors.background.primary : 'transparent',
              color: activeTab === 'farmacias' ? colors.text.primary : colors.text.disabledInverse,
              ...typography.label.small,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Próximas
          </button>
          {isFullMode && (
            <button
              type="button"
              onClick={() => setActiveTab('historico')}
              style={{
                border: 'none',
                borderRadius: '999px',
                padding: '6px 16px',
                background: activeTab === 'historico' ? colors.background.primary : 'transparent',
                color: activeTab === 'historico' ? colors.text.primary : colors.text.disabledInverse,
                ...typography.label.small,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Meu histórico
            </button>
          )}
        </div>

        {activeTab === 'farmacias' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0, overflow: 'hidden' }}>
            {isFullMode && habitualPharmacy && (
              <div style={{ ...typography.label.small, color: colors.text.disabledInverse, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Sua farmácia habitual
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden', minHeight: 0 }}>
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
                      borderRadius: '14px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxSizing: 'border-box',
                      flexShrink: 0,
                      border: focused ? 'none' : isHabitual ? '1px solid rgba(30,167,253,0.2)' : '1px solid transparent',
                      background: focused ? colors.background.primary : isHabitual ? 'rgba(30,167,253,0.06)' : 'transparent',
                    }}
                  >
                    <div style={{ width: '7px', height: '7px', borderRadius: '999px', flexShrink: 0, background: focused ? colors.background.brandPrimary : colors.text.disabledInverse }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...typography.body.small, color: focused ? colors.text.primary : colors.text.primaryInverse, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pharmacy.name}
                      </div>
                      <div style={{ ...typography.label.small, color: focused ? colors.text.secondary : colors.text.disabledInverse, marginTop: '1px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0, overflow: 'hidden' }}>
            {alerts.map((alert) => (
              <div key={alert.dispensacao.id} style={{ ...cardStyle(), padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <strong style={{ ...typography.body.small, color: colors.text.primaryInverse }}>{alert.dispensacao.medicamento}</strong>
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

        <button
          type="button"
          onClick={onExit}
          style={{
            marginTop: 'auto',
            alignSelf: 'flex-start',
            border: `1px solid ${colors.line.dark}`,
            background: 'transparent',
            color: colors.text.primaryInverse,
            borderRadius: '999px',
            padding: '8px 20px',
            ...typography.label.small,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Voltar
        </button>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', minHeight: 0 }}>
          <div style={{ ...cardStyle(), padding: 0, overflow: 'hidden' }}>
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
