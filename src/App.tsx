import React, { useState, useMemo, useCallback, useRef } from 'react';
import Home from './pages/Home/index';
import Live from './pages/Live/index';
import WatchPage from './pages/Watch/index';
import Search from './pages/Search/index';
import Schedule from './pages/Schedule/index';
import Apps from './pages/Apps/index';
import Settings from './pages/Settings/index';
import Help from './pages/Help/index';
import Camara from './pages/Camara/index';
import DeputiesGrid from './pages/Camara/DeputiesGrid';
import DeputyDetail from './pages/Camara/DeputyDetail';
import { Sidebar } from './components/Sidebar';
import type { SidebarItem, SidebarSign } from './components/Sidebar';
import { useFocusNavigation } from './hooks/useFocusNavigation';
import type { FocusState } from './hooks/useFocusNavigation';
import { useCamaraAPI } from './hooks/useCamaraAPI';
import { homeData } from './data/home';
import { channels } from './data/channels';
import { colors } from './styles/colors';
import { SearchIcon, HomeIcon, LiveIcon, GridIcon, AppsIcon, SettingsIcon, HelpIcon, PersonIcon } from './icons';

type PageId = 'home' | 'search' | 'live' | 'schedule' | 'apps' | 'settings' | 'help' | 'apps-camara' | 'my-channels';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [livePage, setLivePage] = useState<{ channelId: string; singleChannel?: boolean } | null>(null);
  const [watchPage, setWatchPage] = useState<{ videoUrl: string; title?: string; logo?: string; channelName?: string } | null>(null);
  const [showDeputiesGrid, setShowDeputiesGrid] = useState(false);
  const [selectedDeputy, setSelectedDeputy] = useState<import('./data/deputies').Deputy | null>(null);
  const { deputiesList: deputies, loading: deputiesLoading } = useCamaraAPI();
  const sidebarItems: SidebarItem[] = useMemo(() => [
    { id: 'search', icon: <SearchIcon />, label: 'Busca' },
    { id: 'home', icon: <HomeIcon />, label: 'Início' },
    { id: 'live', icon: <LiveIcon />, label: 'Ao vivo' },
    { id: 'schedule', icon: <GridIcon />, label: 'Programação' },
    { id: 'apps', icon: <AppsIcon />, label: 'Serviços' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Configurações' },
    { id: 'help', icon: <HelpIcon />, label: 'Ajuda' },
  ], []);

  const heroLength = currentPage === 'apps-camara' ? 1 : homeData.hero.length;
  const railLengths = useMemo(() =>
    currentPage === 'apps-camara'
      ? [deputies.length + 1, 10] // +1 for "Ver todos"
      : homeData.rails.map((r) => r.cards.length),
    [currentPage, deputies.length]
  );

  const sidebarItemIds = useMemo(() => sidebarItems.map((i) => i.id), [sidebarItems]);

  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  const handleSidebarSelect = useCallback((id: string) => {
    if (id === 'avatar') return;
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
      }
    }
  }, []);

  const {
    isSidebarExpanded,
    mainZone,
    mainItemIndex,
    sidebarIndex,
    resetToMain,
  } = useFocusNavigation({
    heroLength,
    railLengths,
    sidebarItemIds,
    sidebarLength: sidebarItems.length + 1,
    activeSidebarId: currentPage,
    onEnter: useCallback((state: FocusState) => {
      const currentPage = currentPageRef.current;
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
      if (currentPage === 'home') {
        if (state.mainZone === 'hero') {
          const slide = homeData.hero[state.mainItemIndex];
          if (slide?.isLive) {
            setLivePage({ channelId: slide.channelId, singleChannel: true });
          } else if (slide?.videoUrl) {
            setWatchPage({ videoUrl: slide.videoUrl, title: slide.title, logo: slide.logo, channelName: slide.channelId });
          }
        }
        if (state.mainZone === 'rail-0') {
          // rail-0 = TV ao vivo
          const card = homeData.rails[0].cards[state.mainItemIndex];
          if (card?.streamUrl) {
            setLivePage({ channelId: card.channelId });
          }
        }
        // Video rails (rail-1, rail-2, rail-3, etc.)
        const zoneMatch = state.mainZone.match(/^rail-(\d+)$/);
        if (zoneMatch) {
          const railIndex = parseInt(zoneMatch[1]);
          if (railIndex >= 1) {
            const card = homeData.rails[railIndex]?.cards[state.mainItemIndex];
            if (card?.videoUrl) {
              setWatchPage({ videoUrl: card.videoUrl, title: card.title, logo: card.logo, channelName: card.channelName });
            }
          }
        }
      }
    }, []),
    onSidebarSelect: handleSidebarSelect,
  });

  const sidebarSign: SidebarSign = useMemo(() => ({
    variant: 'icon',
    icon: <PersonIcon size={28} />,
  }), []);

  const hasOverlay = !!(showDeputiesGrid || selectedDeputy || watchPage || livePage);

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
    width: '88px',
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
            onServiceSelect={(serviceId) => {
              if (serviceId === 'camara-deputados') setCurrentPage('apps-camara');
            }}
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
          activeItemId={currentPage}
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

      {selectedDeputy && (
        <DeputyDetail
          deputy={selectedDeputy}
          isActive={true}
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
          onExit={() => {
            setLivePage(null);
            resetToMain();
          }}
        />
      )}
    </>
  );
}
