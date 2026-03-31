import { useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
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

// ── style helpers ────────────────────────────────────────────────────────────

const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  borderRadius: '12px',
  border: `1px solid ${colors.line.dark}`,
  background: 'rgba(255,255,255,0.04)',
  ...extra,
});

const pill = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  ...typography.label.small,
  borderRadius: '999px',
  padding: '3px 10px',
  ...extra,
});

interface PharmaciesProps {
  mainZone: MainZone;
  mainItemIndex: number;
  isActive: boolean;
  onExit: () => void;
}

type ViewTab = 'farmacias' | 'historico';

function formatDays(days: number) {
  if (days === 0) return 'vence hoje';
  if (days < 0) return `atrasada há ${Math.abs(days)}d`;
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
    return () => { mapRef.current = null; };
  }, [map, mapRef]);

  useEffect(() => {
    if (!activePharmacy) return;
    map.flyTo([activePharmacy.latitude, activePharmacy.longitude], 15, { animate: true, duration: 0.8 });
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
        if (retirada > current.lastDate) current.lastDate = retirada;
      }
    }
    return [...counts.values()].sort((a, b) => b.visits - a.visits || b.lastDate.getTime() - a.lastDate.getTime())[0] ?? null;
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
    if (!isFullMode && activeTab === 'historico') setActiveTab('farmacias');
  }, [activeTab, isFullMode]);

  // ── helpers ──────────────────────────────────────────────────────────────

  const markerIcon = (focused: boolean) =>

  const markerIcon = (focused: boolean) =>
    L.divIcon({
      className: '',
      html: `<div style="width:14px;height:14px;border-radius:999px;background:${focused ? colors.background.brandPrimary : colors.background.primary};border:2px solid rgba(17,23,43,0.4);box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    return (
      <main style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: colors.background.baseInverse,
        display: 'grid',
        gridTemplateColumns: '88px 380px 1fr',
        gridTemplateRows: 'auto auto 1fr',
      }}>

        {/* col 1: sidebar spacer */}
        <div style={{ gridColumn: '1', gridRow: '1 / -1' }} />

        {/* ── ROW 1: HEADER ── */}
        <div style={{ gridColumn: '2', gridRow: '1', padding: '20px 16px 0 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ ...typography.headline.medium, color: colors.text.primaryInverse, margin: 0 }}>
            Retirada de Medicamentos
          </h1>
          <span style={{ ...typography.label.small, color: colors.text.disabledInverse }}>
            Região detectada: {locationLabel}
          </span>
        </div>

        <div style={{ gridColumn: '3', gridRow: '1', padding: '20px 32px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          {isGovBrConnected && govBrUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${colors.line.dark}`, borderRadius: '999px', padding: '5px 14px 5px 6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '999px', background: colors.background.brandPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', ...typography.label.small, color: colors.text.primaryInverse, flexShrink: 0 }}>
                {govBrUser.name.charAt(0)}
              </div>
              <span style={{ ...typography.label.small, color: colors.text.secondaryInverse }}>{govBrUser.name}</span>
              <span style={pill({ background: 'rgba(16,185,129,0.15)', color: '#4ade80' })}>gov.br</span>
            </div>
          )}
          <button type="button" onClick={onExit} style={{ border: `1px solid ${colors.line.dark}`, background: 'transparent', color: colors.text.primaryInverse, borderRadius: '999px', padding: '8px 20px', ...typography.label.small, cursor: 'pointer', fontFamily: 'inherit' }}>
            Voltar
          </button>
        </div>

        {/* ── ROW 2: ALERT BAR ── */}
        {isFullMode && mostUrgentAlert ? (
          <div style={{
            gridColumn: '2 / 4', gridRow: '2', margin: '10px 32px 0 24px',
            ...card({
              padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '14px',
              background: mostUrgentAlert.urgency === 'urgent' ? 'rgba(239,68,68,0.10)' : 'rgba(245,197,66,0.10)',
              border: `1px solid ${mostUrgentAlert.urgency === 'urgent' ? 'rgba(239,68,68,0.3)' : 'rgba(245,197,66,0.3)'}`,
            }),
          }}>
            <span style={{ ...typography.body.small, color: colors.text.primaryInverse, flex: 1 }}>
              <strong>{mostUrgentAlert.dispensacao.medicamento}</strong> — {formatDays(mostUrgentAlert.daysLeft)}. Considere retirar em breve.
            </span>
            <button type="button" onClick={() => setActiveTab('historico')} style={{ border: 'none', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', color: colors.text.primaryInverse, padding: '6px 14px', ...typography.label.small, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Ver histórico
            </button>
          </div>
        ) : (
          <div style={{ gridColumn: '2 / 4', gridRow: '2' }} />
        )}

        {/* ── ROW 3 COL 2: ESQUERDA — tabs + banner + lista ── */}
        <div style={{ gridColumn: '2', gridRow: '3', padding: '12px 16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0, overflow: 'hidden' }}>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', padding: '4px', width: 'fit-content', flexShrink: 0 }}>
            {(['farmacias', ...(isFullMode ? ['historico'] : [])] as ViewTab[]).map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{
                padding: '6px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'background 0.15s', ...typography.label.small,
                background: activeTab === tab ? colors.background.primary : 'transparent',
                color: activeTab === tab ? colors.text.primary : colors.text.disabledInverse,
              }}>
                {tab === 'farmacias' ? 'Próximas' : 'Meu histórico'}
              </button>
            ))}
          </div>

          {!isLoggedIn && (
            <div style={card({ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 })}>
              <div style={{ ...typography.headline.small, color: colors.text.primaryInverse }}>Faça login para ver mais</div>
              <div style={{ ...typography.body.small, color: colors.text.disabledInverse }}>Veja histórico, farmácia habitual e alertas de renovação.</div>
              <button type="button" onClick={loginMock} style={{ alignSelf: 'flex-start', border: 'none', borderRadius: '999px', background: colors.background.primary, color: colors.text.primary, padding: '8px 18px', ...typography.label.small, cursor: 'pointer', fontFamily: 'inherit' }}>
                Entrar no app
              </button>
            </div>
          )}

          {isLoggedIn && !isGovBrConnected && (
            <div style={card({ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, background: 'rgba(30,167,253,0.06)', border: '1px solid rgba(30,167,253,0.2)' })}>
              <div style={{ ...typography.headline.small, color: colors.text.primaryInverse }}>Mais dados com o gov.br</div>
              <div style={{ ...typography.body.small, color: colors.text.disabledInverse }}>Conecte para ver histórico HÓRUS, farmácia habitual e alertas.</div>
              <button type="button" onClick={connectGovBrMock} style={{ alignSelf: 'flex-start', border: 'none', borderRadius: '999px', background: colors.background.brandPrimary, color: colors.text.primaryInverse, padding: '8px 18px', ...typography.label.small, cursor: 'pointer', fontFamily: 'inherit' }}>
                Conectar gov.br
              </button>
            </div>
          )}

          {activeTab === 'farmacias' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {isFullMode && habitualPharmacy && (
                <div style={{ ...typography.label.small, color: colors.text.disabledInverse, padding: '0 4px 4px', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>
                  Sua farmácia habitual
                </div>
              )}
              {orderedPharmacies.map((pharmacy, index) => {
                const focused = focusedIndex === index;
                const isHabitual = isFullMode && habitualPharmacy?.pharmacy.id === pharmacy.id;
                return (
                  <button key={pharmacy.id} type="button"
                    onClick={() => mapRef.current?.flyTo([pharmacy.latitude, pharmacy.longitude], 15, { animate: true, duration: 0.7 })}
                    style={{
                      width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                      background: focused ? colors.background.primary : isHabitual ? 'rgba(30,167,253,0.06)' : 'transparent',
                      border: focused ? 'none' : isHabitual ? '1px solid rgba(30,167,253,0.2)' : '1px solid transparent',
                      borderRadius: '10px', padding: '10px 12px',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      transition: 'background 0.15s', boxSizing: 'border-box', flexShrink: 0,
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
                    <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                      {isHabitual && <span style={pill({ background: 'rgba(16,185,129,0.15)', color: '#4ade80' })}>Habitual</span>}
                      <span style={pill({ background: pharmacy.status === 'Aberto' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)', color: pharmacy.status === 'Aberto' ? '#4ade80' : colors.text.disabledInverse })}>
                        {pharmacy.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'historico' && isFullMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div style={{ ...typography.label.small, color: colors.text.disabledInverse, padding: '0 4px 2px', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>
                Dispensações · HÓRUS / DATASUS
              </div>
              {alerts.map((alert) => {
                const fg = alert.urgency === 'urgent' ? '#f87171' : alert.urgency === 'warn' ? '#fbbf24' : '#4ade80';
                const bg = alert.urgency === 'urgent' ? 'rgba(239,68,68,0.12)' : alert.urgency === 'warn' ? 'rgba(245,197,66,0.12)' : 'rgba(16,185,129,0.10)';
                return (
                  <div key={alert.dispensacao.id} style={card({ padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 })}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '999px', background: fg, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...typography.body.small, color: colors.text.primaryInverse }}>{alert.dispensacao.medicamento}</div>
                      <div style={{ ...typography.label.small, color: colors.text.disabledInverse, marginTop: '1px' }}>
                        {alert.dispensacao.indicacao} · {new Date(alert.dispensacao.dataRetirada).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <span style={pill({ background: bg, color: fg, whiteSpace: 'nowrap' })}>{formatDays(alert.daysLeft)}</span>
                  </div>
                );
              })}
              {govBrUser && (
                <div style={card({ padding: '12px 14px', marginTop: '4px', flexShrink: 0 })}>
                  <div style={{ ...typography.label.small, color: colors.text.disabledInverse, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>CNS · Condições</div>
                  <div style={{ ...typography.body.small, color: colors.text.secondaryInverse, marginBottom: '8px' }}>{govBrUser.cns}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {govBrUser.condicoes.map((c) => (
                      <span key={c} style={pill({ background: 'rgba(255,255,255,0.07)', border: `1px solid ${colors.line.dark}`, color: colors.text.secondaryInverse })}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── ROW 3 COL 3: DIREITA — mapa + detalhe ── */}
        <div style={{ gridColumn: '3', gridRow: '3', padding: '12px 32px 24px 16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0, overflow: 'hidden' }}>

          <div style={{ ...card({ padding: 0, overflow: 'hidden' }), height: '220px', flexShrink: 0 }}>
            <MapContainer center={[activePharmacy.latitude, activePharmacy.longitude]} zoom={15} scrollWheelZoom={false} style={{ width: '100%', height: '220px' }}>
              <MapController activePharmacy={activePharmacy} mapRef={mapRef} markersRef={markerRefs} />
              <TileLayer attribution="&copy; OpenStreetMap contributors &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {orderedPharmacies.map((pharmacy, index) => (
                <Marker key={pharmacy.id} position={[pharmacy.latitude, pharmacy.longitude]} icon={markerIcon(focusedIndex === index)} ref={(m) => { markerRefs.current[pharmacy.id] = m; }}>
                  <Popup>{pharmacy.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div style={card({ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0, overflow: 'hidden' })}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexShrink: 0 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...typography.label.small, color: colors.text.disabledInverse, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Detalhe da farmácia</div>
                <h2 style={{ ...typography.headline.medium, color: colors.text.primaryInverse, margin: 0 }}>{activePharmacy.name}</h2>
                <p style={{ ...typography.body.small, color: colors.text.disabledInverse, margin: '4px 0 0' }}>{activePharmacy.address} · {activePharmacy.neighborhood}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <span style={pill({ background: 'rgba(30,167,253,0.15)', color: '#60a5fa', border: '1px solid rgba(30,167,253,0.25)' })}>
                  {activePharmacy.city}/{activePharmacy.state}
                </span>
                {activePharmacy.phone && <span style={{ ...typography.label.small, color: colors.text.disabledInverse }}>{activePharmacy.phone}</span>}
              </div>
            </div>

            <div style={{ height: '1px', background: colors.line.dark, flexShrink: 0 }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', flexShrink: 0 }}>
              {activePharmacy.horarios.map((horario) => (
                <div key={`${activePharmacy.id}-${horario.dias}`} style={card({ padding: '10px 12px' })}>
                  <div style={{ ...typography.label.small, color: colors.text.disabledInverse, marginBottom: '3px' }}>{horario.dias}</div>
                  <div style={{ ...typography.body.small, color: colors.text.primaryInverse }}>{horario.abre} às {horario.fecha}</div>
                </div>
              ))}
            </div>

            {isFullMode && habitualPharmacy?.pharmacy.id === activePharmacy.id && (
              <div style={{ padding: '9px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', flexShrink: 0 }}>
                <span style={{ ...typography.body.small, color: '#4ade80' }}>
                  ✓ Sua farmácia habitual · última visita {formatLastVisit(habitualPharmacy.lastDate)}
                </span>
              </div>
            )}

            {activePharmacy.cnes && (
              <div style={{ marginTop: 'auto', flexShrink: 0 }}>
                <span style={{ ...typography.label.small, color: colors.text.disabledInverse }}>CNES {activePharmacy.cnes}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }