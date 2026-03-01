import { useState, useEffect, useCallback, useRef } from 'react';

export type MainZone = 'hero' | 'rail-0' | 'rail-1' | 'my-space';

export interface FocusState {
  region: 'sidebar' | 'main';
  sidebarIndex: number;
  mainZone: MainZone;
  mainItemIndex: number;
}

export interface UseFocusNavigationOptions {
  heroLength: number;
  railLengths: number[];
  sidebarItemIds: string[];   // ids dos itens do menu, SEM o avatar
  sidebarLength: number;      // sidebarItemIds.length + 1 (inclui o avatar)
  activeSidebarId: string;    // id do item correspondente à página atual, ex: 'home'
  onEnter?: (state: FocusState) => void;
  onSidebarSelect?: (id: string) => void;
}

export interface UseFocusNavigationReturn {
  focusState: FocusState;
  isSidebarExpanded: boolean;
  isInSidebar: boolean;
  mainZone: MainZone;
  mainItemIndex: number;
  sidebarIndex: number;
  activeHeroSlide: number;
}

export const useFocusNavigation = ({
  heroLength,
  railLengths,
  sidebarItemIds,
  sidebarLength,
  activeSidebarId,
  onEnter,
  onSidebarSelect,
}: UseFocusNavigationOptions): UseFocusNavigationReturn => {
  const [focusState, setFocusState] = useState<FocusState>({
    region: 'main',
    sidebarIndex: 0,
    mainZone: 'hero',
    mainItemIndex: 0,
  });

  const focusStateRef = useRef<FocusState>(focusState);
  useEffect(() => {
    focusStateRef.current = focusState;
  }, [focusState]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { region, sidebarIndex, mainZone, mainItemIndex } = focusStateRef.current;

      // Impedir scroll padrão do browser para teclas de navegação
      const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'];
      if (navKeys.includes(event.key)) {
        event.preventDefault();
      }

      if (region === 'main') {
        switch (event.key) {
          case 'ArrowLeft':
            if (mainItemIndex > 0) {
              setFocusState((prev) => ({ ...prev, mainItemIndex: mainItemIndex - 1 }));
            } else if (mainItemIndex === 0) {
              // Entrar na sidebar: calcular sidebarIndex buscando activeSidebarId
              const activeIdx = sidebarItemIds.indexOf(activeSidebarId);
              const targetSidebarIndex = activeIdx !== -1 ? activeIdx + 1 : 1;
              setFocusState((prev) => ({
                ...prev,
                region: 'sidebar',
                sidebarIndex: targetSidebarIndex,
              }));
            }
            break;

          case 'ArrowRight': {
            let limit = 0;
            if (mainZone === 'hero') limit = heroLength - 1;
            else if (mainZone === 'rail-0') limit = (railLengths[0] || 0) - 1;
            else if (mainZone === 'rail-1') limit = (railLengths[1] || 0) - 1;
            else if (mainZone === 'my-space') limit = 0;

            if (mainItemIndex < limit) {
              setFocusState((prev) => ({ ...prev, mainItemIndex: mainItemIndex + 1 }));
            }
            break;
          }

          case 'ArrowDown':
            if (mainZone === 'hero') {
              setFocusState((prev) => ({ ...prev, mainZone: 'rail-0', mainItemIndex: 0 }));
            } else if (mainZone === 'rail-0') {
              setFocusState((prev) => ({ ...prev, mainZone: 'rail-1', mainItemIndex: 0 }));
            } else if (mainZone === 'rail-1') {
              setFocusState((prev) => ({ ...prev, mainZone: 'my-space', mainItemIndex: 0 }));
            }
            break;

          case 'ArrowUp':
            if (mainZone === 'rail-0') {
              setFocusState((prev) => ({ ...prev, mainZone: 'hero', mainItemIndex: 0 }));
            } else if (mainZone === 'rail-1') {
              setFocusState((prev) => ({ ...prev, mainZone: 'rail-0', mainItemIndex: 0 }));
            } else if (mainZone === 'my-space') {
              setFocusState((prev) => ({ ...prev, mainZone: 'rail-1', mainItemIndex: 0 }));
            }
            break;

          case 'Escape':
            if (mainZone !== 'hero') {
              setFocusState((prev) => ({ ...prev, mainZone: 'hero', mainItemIndex: 0 }));
            }
            break;

          case 'Enter':
            onEnter?.(focusStateRef.current);
            break;
        }
      } else if (region === 'sidebar') {
        switch (event.key) {
          case 'ArrowUp':
            // Cycle completa
            setFocusState((prev) => ({
              ...prev,
              sidebarIndex: (prev.sidebarIndex - 1 + sidebarLength) % sidebarLength,
            }));
            break;

          case 'ArrowDown':
            // Cycle completa
            setFocusState((prev) => ({
              ...prev,
              sidebarIndex: (prev.sidebarIndex + 1) % sidebarLength,
            }));
            break;

          case 'ArrowRight':
          case 'Escape':
            // Voltar para main restaurando mainZone e mainItemIndex (memória preservada)
            setFocusState((prev) => ({ ...prev, region: 'main' }));
            break;

          case 'Enter': {
            const id = sidebarIndex === 0 ? 'avatar' : sidebarItemIds[sidebarIndex - 1];
            onSidebarSelect?.(id);
            break;
          }
        }
      }
    },
    [heroLength, railLengths, sidebarItemIds, sidebarLength, activeSidebarId, onEnter, onSidebarSelect]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const isInSidebar = focusState.region === 'sidebar';

  return {
    focusState,
    isSidebarExpanded: isInSidebar,
    isInSidebar,
    mainZone: focusState.mainZone,
    mainItemIndex: focusState.mainItemIndex,
    sidebarIndex: focusState.sidebarIndex,
    activeHeroSlide: focusState.mainZone === 'hero' ? focusState.mainItemIndex : 0,
  };
};
