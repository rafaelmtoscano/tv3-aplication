import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { SplashScreen } from './components/SplashScreen';
import Home from './pages/Home/index';
import Live from './pages/Live/index';
import WatchPage from './pages/Watch/index';
import Search from './pages/Search/index';
import Schedule from './pages/Schedule/index';
import Apps from './pages/Apps/index';
import Settings from './pages/Settings/index';
import Help from './pages/Help/index';
import Pharmacies from './pages/Pharmacies';
import AccountPage from './pages/Account';
import { NotificationPanel } from './components/NotificationPanel';
import type { NotificationItem } from './components/NotificationPanel';
import Camara from './pages/Camara/index';
import Senado from './pages/Senado/index';
import DeputiesGrid from './pages/Camara/DeputiesGrid';
import SenatorsGrid from './pages/Senado/SenatorsGrid';
import DeputyDetail from './pages/Camara/DeputyDetail';
import { Sidebar } from './components/Sidebar';
import type { SidebarItem, SidebarSign } from './components/Sidebar';
import { useFocusNavigation } from './hooks/useFocusNavigation';
import type { FocusState } from './hooks/useFocusNavigation';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useCamaraAPI } from './hooks/useCamaraAPI';
import { useSenadoAPI } from './hooks/useSenadoAPI';
import { useSecondScreen } from './hooks/useSecondScreen';
import type { SecondScreenChannelData } from './hooks/useSecondScreen';
import { homeData } from './data/home';
import { services } from './data/services';
import { nationalStories } from './data/stories';
import { mockPharmacies } from './data/pharmacies';
import { channels, syncChannelsFromSupabase } from './data/channels';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { SearchIcon, HomeIcon, LiveIcon, GridIcon, AppsIcon, SettingsIcon, HelpIcon, PersonIcon } from './icons';

type PageId = 'home' | 'search' | 'live' | 'schedule' | 'apps' | 'pharmacies' | 'settings' | 'help' | 'apps-camara' | 'apps-senado' | 'my-channels' | 'account';

// ── AppContent ─────────────────────────────────────────────────────────────
// Contains all app logic. Mounted inside AuthProvider so it can call useAuth().

interface AppContentProps {
  isMobileGovBrConnected: boolean;
  sessionCode: string;
  isMobileConnected: boolean;
  updateChannel: (data: Partial<SecondScreenChannelData>) => void;
  updateVoting: (votacaoId: string | null, active: boolean) => void;
}

function AppContent({ isMobileGovBrConnected, sessionCode, isMobileConnected, updateChannel, updateVoting }: AppContentProps) {
  const { connectGovBrMock, govBrUser, isGovBrConnected } = useAuth();
  const [showGovBrNotif, setShowGovBrNotif] = useState(false);
  const prevGovBrUserRef = useRef<typeof govBrUser>(null);

  // Bridge: when mobile authenticates gov.br, mirror it into the TV AuthContext
  useEffect(() => {
    if (isMobileGovBrConnected) {
      connectGovBrMock();
    }
  }, [isMobileGovBrConnected, connectGovBrMock]);

  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [livePage, setLivePage] = useState<{ channelId: string; singleChannel?: boolean } | null>(null);
  const [watchPage, setWatchPage] = useState<{ videoUrl: string; title?: string; logo?: string; channelName?: string } | null>(null);
  const [showDeputiesGrid, setShowDeputiesGrid] = useState(false);
  const [showSenatorsGrid, setShowSenatorsGrid] = useState(false);
  const [selectedDeputy, setSelectedDeputy] = useState<import('./data/deputies').Deputy | null>(null);
  const [deputyLoading, setDeputyLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConnectionNotif, setShowConnectionNotif] = useState(false);
  const { deputiesList: deputies, loading: deputiesLoading } = useCamaraAPI();
  const { senatorsList: senators, loading: senatorsLoading } = useSenadoAPI();

  // Detecta quando mobile conecta e exibe notificação
  useEffect(() => {
    if (isMobileConnected) {
      setShowConnectionNotif(true);
    }
  }, [isMobileConnected]);

  // Exibe notificação quando gov.br conecta (transição null → usuário)
  useEffect(() => {
    if (govBrUser && !prevGovBrUserRef.current) {
      setShowGovBrNotif(true);
    }
    prevGovBrUserRef.current = govBrUser;
  }, [govBrUser]);

  // Sincroniza canais com o Supabase na inicialização
  useEffect(() => {
    syncChannelsFromSupabase();
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (currentPage !== 'pharmacies') return;

    const sessionRef = doc(db, 'sessions', sessionCode);
    updateDoc(sessionRef, {
      activeFeature: 'pharmacies',
    }).catch(console.error);

    return () => {
      updateDoc(sessionRef, {
        activeFeature: null,
      }).catch(console.error);
    };
  }, [currentPage, sessionCode]);

  const sidebarItems: SidebarItem[] = useMemo(() => [
    { id: 'search', icon: <SearchIcon />, label: 'Busca' },
    { id: 'home', icon: <HomeIcon />, label: 'Início' },
    { id: 'live', icon: <LiveIcon />, label: 'Ao vivo' },
    { id: 'schedule', icon: <GridIcon />, label: 'Programação' },
    { id: 'apps', icon: <AppsIcon />, label: 'Serviços' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Configurações' },
    { id: 'help', icon: <HelpIcon />, label: 'Ajuda' },
  ], []);

  const heroLength = currentPage === 'apps-camara' || currentPage === 'apps-senado' ? 1 : currentPage === 'pharmacies' ? 0 : homeData.hero.length;
  const railLengths = useMemo(() => {
    if (currentPage === 'apps-camara') {
      return [deputies.length + 1, 10]; // +1 for "Ver todos"
    }
    if (currentPage === 'apps-senado') {
      const tvSenado = channels.find((ch) => ch.id === 'tv-senado');
      return [senators.length + 1, tvSenado?.programs?.length ?? 0];
    }
    if (currentPage === 'pharmacies') {
      return [mockPharmacies.length];
    }
    return [services.length, ...homeData.rails.map((r) => r.cards.length), services.length];
  }, [currentPage, deputies.length, senators.length]);

  const sidebarItemIds = useMemo(() => sidebarItems.map((i) => i.id), [sidebarItems]);

  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  const handleSidebarSelect = useCallback((id: string) => {
    if (id === 'avatar') {
      setCurrentPage('account');
      return;
    }
    if (id === 'live') {
      const firstLiveChannel = channels.find(ch => ch.streamUrl && ch.streamUrl.length > 0);
      if (firstLiveChannel) setLivePage({ channelId: firstLiveChannel.id });
      return;
    }
    setCurrentPage(id as PageId);
  }, []);

  const handleDeputySelect = useCallback(async (deputy: import('./data/deputies').Deputy) => {
    setShowDeputiesGrid(false);
    // Abre imediatamente com dados do resumo (foto, nome, partido)
    // enquanto os dados completos são buscados em background
    setSelectedDeputy(deputy);
    setDeputyLoading(true);
    // Busca propostas, agenda e biografia da API
    if (deputy.apiId) {
      try {
        const [detail, proposals, speeches, agenda] = await Promise.all([
          import('./data/deputies').then(m => m.fetchDeputyDetail(deputy.apiId!)),
          import('./data/deputies').then(m => m.fetchDeputyProposals(deputy.apiId!)),
          import('./data/deputies').then(m => m.fetchDeputySpeeches(deputy.apiId!)),
          import('./data/deputies').then(m => m.fetchDeputyAgenda(deputy.apiId!)),
        ]);
        const { mapAPIToDeputy } = await import('./data/deputies');
        const apiSummary = {
          id: deputy.apiId!,
          nome: deputy.name,
          siglaPartido: deputy.party,
          siglaUf: deputy.state,
          urlFoto: deputy.photo,
          email: '',
        };
        const full = mapAPIToDeputy(apiSummary, detail, proposals, speeches, agenda);
        setSelectedDeputy(full);
      } catch (e) {
        console.error('Erro ao buscar dados completos do deputado:', e);
      } finally {
        setDeputyLoading(false);
      }
    } else {
      setDeputyLoading(false);
    }
  }, []);

  const handleSenatorSelect = useCallback(() => {
    setShowSenatorsGrid(false);
  }, []);

  const handleServiceSelect = useCallback((serviceId: string) => {
    const service = services.find((item) => item.id === serviceId);
    if (!service) return;
    if (!service.available) {
      setToastMessage('Conteúdo indisponível no momento');
      return;
    }
    if (service.id === 'camara-deputados') {
      setCurrentPage('apps-camara');
    }
    if (service.id === 'senado-federal') {
      setCurrentPage('apps-senado');
    }
    if (service.id === 'meu-sus') {
      setCurrentPage('pharmacies');
    }
  }, []);

  const handlePharmaciesEscape = useCallback(() => {
    setCurrentPage('apps');
  }, []);

  const {
    isSidebarExpanded,
    mainZone,
    mainItemIndex,
    sidebarIndex,
    resetToMain,
  } = useFocusNavigation({
    heroLength,
    storiesLength: currentPage === 'home' ? nationalStories.length : 0,
    railLengths,
    sidebarItemIds,
    sidebarLength: sidebarItems.length + 1,
    activeSidebarId: currentPage === 'pharmacies' ? 'apps' : currentPage,
    onEnter: useCallback((state: FocusState) => {
      const currentPage = currentPageRef.current;
      if (currentPage === 'pharmacies') {
        return;
      }
      if (currentPage === 'apps-camara') {
        if (state.mainZone === 'hero') {
          const tvCamara = channels.find(ch => ch.id === 'tv-camara');
          if (tvCamara?.streamUrl) setLivePage({ channelId: 'tv-camara', singleChannel: true });
        }
        if (state.mainZone === 'rail-0') {
          if (state.mainItemIndex === 0) {
            setShowDeputiesGrid(true);
          } else {
            const dep = deputies[state.mainItemIndex - 1];
            if (dep) handleDeputySelect(dep);
          }
        }
        const zoneMatch2 = state.mainZone.match(/^rail-(\d+)$/);
        if (zoneMatch2 && parseInt(zoneMatch2[1]) === 1) {
          const tvCamara = channels.find(ch => ch.id === 'tv-camara');
          const prog = tvCamara?.programs?.[state.mainItemIndex];
          if (prog?.videoUrl) {
            setWatchPage({ videoUrl: prog.videoUrl, title: prog.title, logo: tvCamara?.logo, channelName: 'TV Câmara' });
          }
        }
      }
      if (currentPage === 'apps-senado') {
        if (state.mainZone === 'hero') {
          const tvSenado = channels.find(ch => ch.id === 'tv-senado');
          if (tvSenado?.streamUrl) setLivePage({ channelId: 'tv-senado', singleChannel: true });
        }
        if (state.mainZone === 'rail-0') {
          if (state.mainItemIndex === 0) {
            setShowSenatorsGrid(true);
          } else {
            const senator = senators[state.mainItemIndex - 1];
            if (senator) handleSenatorSelect();
          }
        }
        const zoneMatchSenado = state.mainZone.match(/^rail-(\d+)$/);
        if (zoneMatchSenado && parseInt(zoneMatchSenado[1]) === 1) {
          const tvSenado = channels.find(ch => ch.id === 'tv-senado');
          const prog = tvSenado?.programs?.[state.mainItemIndex];
          if (prog?.videoUrl) {
            setWatchPage({ videoUrl: prog.videoUrl, title: prog.title, logo: tvSenado?.logo, channelName: 'TV Senado' });
          }
        }
      }
      if (currentPage === 'home') {
        if (state.mainZone === 'hero') {
          const slide = homeData.hero[state.mainItemIndex];
          if (slide?.channelId === 'segunda-tela') {
            setCurrentPage('account');
            return;
          }
          if (slide?.isLive) {
            const ch = channels.find(c => c.id === slide.channelId);
            updateChannel({
              channelId: slide.channelId,
              channelName: ch?.name ?? slide.channelId,
              channelColor: ch?.backgroundColor ?? '',
              channelLogo: ch?.logo ?? '',
              programTitle: slide.title ?? '',
              programSubtitle: slide.description ?? '',
              programTime: '',
              isLive: true,
            });
            setLivePage({ channelId: slide.channelId, singleChannel: true });
          } else if (slide?.videoUrl) {
            const ch = channels.find(c => c.id === slide.channelId);
            updateChannel({
              channelId: slide.channelId,
              channelName: ch?.name ?? slide.channelId,
              channelColor: ch?.backgroundColor ?? '',
              channelLogo: ch?.logo ?? '',
              programTitle: slide.title ?? '',
              programSubtitle: slide.description ?? '',
              programTime: '',
              isLive: false,
            });
            setWatchPage({ videoUrl: slide.videoUrl, title: slide.title, logo: slide.logo, channelName: slide.channelId });
          }
        }
        // rail-0 = Serviços (new)
        if (state.mainZone === 'rail-0') {
          const service = services[state.mainItemIndex];
          if (service) {
            handleServiceSelect(service.id);
          }
        }
        if (state.mainZone === 'rail-1') {
          // rail-1 = TV ao vivo
          const card = homeData.rails[0].cards[state.mainItemIndex];
          if (card?.streamUrl) {
            const ch = channels.find(c => c.id === card.channelId);
            updateChannel({
              channelId: card.channelId,
              channelName: card.channelName ?? ch?.name ?? '',
              channelColor: ch?.backgroundColor ?? '',
              channelLogo: card.logo ?? ch?.logo ?? '',
              programTitle: card.title ?? '',
              programSubtitle: '',
              programTime: '',
              isLive: true,
            });
            setLivePage({ channelId: card.channelId });
          }
        }
        // Video rails (rail-2, rail-3, rail-4, etc.)
        const zoneMatch = state.mainZone.match(/^rail-(\d+)$/);
        if (zoneMatch) {
          const railIndex = parseInt(zoneMatch[1]);
          if (railIndex >= 2 && railIndex < homeData.rails.length + 1) {
            const card = homeData.rails[railIndex - 1]?.cards[state.mainItemIndex];
            if (card?.videoUrl) {
              const ch = channels.find(c => c.id === card.channelId);
              updateChannel({
                channelId: card.channelId,
                channelName: card.channelName ?? ch?.name ?? '',
                channelColor: ch?.backgroundColor ?? '',
                channelLogo: card.logo ?? ch?.logo ?? '',
                programTitle: card.title ?? '',
                programSubtitle: '',
                programTime: '',
                isLive: false,
              });
              setWatchPage({ videoUrl: card.videoUrl, title: card.title, logo: card.logo, channelName: card.channelName });
            }
          }
        }

        // rail-5 = Serviços (Gov.br section)
        if (state.mainZone === 'rail-5') {
          const service = services[state.mainItemIndex];
          if (service) {
            handleServiceSelect(service.id);
          }
        }
      }
    }, [deputies, handleDeputySelect, handleSenatorSelect, handleServiceSelect, senators, updateChannel]),
    onSidebarSelect: handleSidebarSelect,
    onEscape: currentPage === 'pharmacies' ? handlePharmaciesEscape : undefined,
    verticalNavigation: currentPage === 'pharmacies',
  });

  const isAuthenticated = isGovBrConnected;

  const sidebarSign: SidebarSign = useMemo(() => {
    if (isGovBrConnected) {
      return {
        variant: 'image' as const,
        image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F16c0a867110f4acdb55cbc0e28831f6d?format=webp&width=800&height=1200',
      };
    }
    return {
      variant: 'icon' as const,
      icon: <PersonIcon size={28} />,
    };
  }, [isGovBrConnected]);

  const hasOverlay = !!(showDeputiesGrid || showSenatorsGrid || selectedDeputy || watchPage || livePage);

  const govBrNotifItems: NotificationItem[] = govBrUser ? [
    {
      id: 'govbr-connected',
      icon: (
        <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#1ea7fd' }}>
          verified_user
        </span>
      ),
      title: 'gov.br conectado',
      description: `Bem-vindo, ${govBrUser.name}. Recursos personalizados desbloqueados.`,
      timestamp: 'agora',
      onEnter: () => {
        setShowGovBrNotif(false);
        setCurrentPage('pharmacies');
      },
    },
  ] : [];

  const connectionNotifItems: NotificationItem[] = [
    {
      id: 'device-connected',
      icon: <span style={{ fontSize: 28 }}>📱</span>,
      title: 'Dispositivo conectado',
      description: 'Um dispositivo foi conectado.',
      timestamp: 'agora',
      onEnter: () => {
        setShowConnectionNotif(false);
        setCurrentPage('account');
      },
    },
  ];

  const rootStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    display: hasOverlay ? 'none' : 'flex',
    flexDirection: 'row',
    background: colors.background.baseInverse,
    overflow: 'hidden',
  };

  const sidebarSpacerStyle: React.CSSProperties = {
    flexShrink: 0,
    width: '120px',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const mainWrapperStyle: React.CSSProperties = {
    flex: 1,
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            mainZone={mainZone}
            mainItemIndex={mainItemIndex}
            isActive={currentPage === 'home'}
          />
        );
      case 'search':
        return (
          <Search
            isActive={currentPage === 'search'}
            isSidebarExpanded={isSidebarExpanded}
            onLiveChannel={(channelId) => setLivePage({ channelId })}
            onWatchVideo={(videoUrl, title, logo, channelName) => setWatchPage({ videoUrl, title, logo, channelName })}
          />
        );
      case 'schedule':
        return (
          <Schedule
            mainItemIndex={mainItemIndex}
            isActive={currentPage === 'schedule'}
            isSidebarExpanded={isSidebarExpanded}
            onLiveChannel={(channelId) => setLivePage({ channelId })}
          />
        );
      case 'apps':
        return (
          <Apps
            isActive={currentPage === 'apps'}
            isSidebarExpanded={isSidebarExpanded}
            onServiceSelect={handleServiceSelect}
          />
        );
      case 'pharmacies':
        return (
          <Pharmacies
            mainZone={mainZone}
            mainItemIndex={mainItemIndex}
            isActive={currentPage === 'pharmacies'}
            onExit={() => setCurrentPage('apps')}
          />
        );
      case 'apps-camara':
        return (
          <Camara
            mainZone={mainZone}
            mainItemIndex={mainItemIndex}
            isActive={currentPage === 'apps-camara'}
            deputies={deputies}
            onOpenGrid={() => setShowDeputiesGrid(true)}
            onDeputySelect={handleDeputySelect}
          />
        );
      case 'apps-senado':
        return (
          <Senado
            mainZone={mainZone}
            mainItemIndex={mainItemIndex}
            isActive={currentPage === 'apps-senado'}
            senators={senators}
            onOpenGrid={() => setShowSenatorsGrid(true)}
            onSenatorSelect={handleSenatorSelect}
          />
        );
      case 'settings':
        return <Settings isActive={currentPage === 'settings'} />;
      case 'help':
        return <Help isActive={currentPage === 'help'} />;
      case 'my-channels':
      case 'live':
      default:
        return <Home mainZone={mainZone} mainItemIndex={mainItemIndex} isActive={(currentPage as string) === 'home'} />;
    }
  };

  return (
    <>
      <div style={rootStyle}>
        <Sidebar
          logoName="Plataforma"
          logoSubtitle="Comum"
          items={sidebarItems}
          sign={sidebarSign}
          expanded={isSidebarExpanded}
          activeItemId={currentPage === 'pharmacies' ? 'apps' : currentPage}
          focusedItemId={isSidebarExpanded ? (sidebarIndex === 0 ? 'avatar' : sidebarItems[sidebarIndex - 1]?.id) : undefined}
          onItemClick={handleSidebarSelect}
        />

        {/* Spacer to prevent content from going under the fixed sidebar collapsed strip */}
        <div style={sidebarSpacerStyle} />

        <div style={mainWrapperStyle}>
          {renderPage()}
        </div>
      </div>

      {showDeputiesGrid && (
        <DeputiesGrid
          isActive={true}
          deputies={deputies}
          loading={deputiesLoading}
          onBack={() => { setShowDeputiesGrid(false); }}
          onDeputySelect={handleDeputySelect}
        />
      )}

      {showSenatorsGrid && (
        <SenatorsGrid
          isActive={true}
          senators={senators}
          loading={senatorsLoading}
          onBack={() => { setShowSenatorsGrid(false); }}
          onSenatorSelect={handleSenatorSelect}
        />
      )}

      {selectedDeputy && (
        <DeputyDetail
          deputy={selectedDeputy}
          isActive={true}
          loading={deputyLoading}
          onBack={() => setSelectedDeputy(null)}
        />
      )}

      {watchPage && (
        <WatchPage
          {...watchPage}
          onExit={() => {
            setWatchPage(null);
            resetToMain();
          }}
        />
      )}

      {livePage && (
        <Live
          initialChannelId={livePage.channelId}
          singleChannel={livePage.singleChannel}
          isActive={true}
          onExit={() => {
            setLivePage(null);
            resetToMain();
          }}
          onUpdateChannel={updateChannel}
          onUpdateVoting={updateVoting}
          isAuthenticated={isAuthenticated}
          onGovAuth={connectGovBrMock}
        />
      )}

      {currentPage === 'account' && (
        <AccountPage
          sessionCode={sessionCode}
          isConnected={isMobileConnected}
          isAuthenticated={isAuthenticated}
          onBack={() => setCurrentPage('home')}
          onSimulateConnection={() => setShowConnectionNotif(true)}
        />
      )}

      {showConnectionNotif && (
        <NotificationPanel
          items={connectionNotifItems}
          showHeader={false}
          onClose={() => setShowConnectionNotif(false)}
          autoHide={5000}
        />
      )}

      {showGovBrNotif && (
        <NotificationPanel
          items={govBrNotifItems}
          showHeader={false}
          onClose={() => setShowGovBrNotif(false)}
          autoHide={7000}
        />
      )}

      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 250,
            background: 'rgba(17, 23, 43, 0.95)',
            borderRadius: '16px',
            padding: '20px 32px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            ...typography.body.large,
            color: colors.text.primaryInverse,
            whiteSpace: 'nowrap',
          }}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}

// ── App (thin shell) ───────────────────────────────────────────────────────
// Calls useSecondScreen, mounts AuthProvider with sessionCode, renders AppContent.

export default function App() {
  const { sessionCode, isMobileConnected, isMobileGovBrConnected, updateChannel, updateVoting } = useSecondScreen();
  const [showSplash, setShowSplash] = useState(true);

  const splashVideoUrl = 'https://cdn.builder.io/o/assets%2F8decac7d217b4e02a090384b68b42488%2Fe2a6a4c0b44745bdb12c9a12bc42833b?alt=media&token=a329235e-8402-461b-9df8-bcdaeaaf1b74&apiKey=8decac7d217b4e02a090384b68b42488';

  if (showSplash) {
    return (
      <SplashScreen
        videoUrl={splashVideoUrl}
        onComplete={() => setShowSplash(false)}
      />
    );
  }

  return (
    <AuthProvider sessionCode={sessionCode}>
      <AppContent
        isMobileGovBrConnected={isMobileGovBrConnected}
        sessionCode={sessionCode}
        isMobileConnected={isMobileConnected}
        updateChannel={updateChannel}
        updateVoting={updateVoting}
      />
    </AuthProvider>
  );
}
