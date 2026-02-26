import { useState, useEffect, useCallback, useRef } from 'react';

export type SidebarFocusIndex = number; // índice do item ativo na sidebar

export type MainZone = 'hero' | 'rail-0' | 'rail-1' | 'my-space';

export interface FocusState {
  region: 'sidebar' | 'main';
  // Estado da sidebar
  sidebarIndex: number;
  // Estado da main
  mainZone: MainZone;
  mainItemIndex: number;
}

export interface UseFocusNavigationOptions {
  heroLength: number;
  railLengths: number[];
  sidebarLength: number;
}

export interface UseFocusNavigationReturn {
  focusState: FocusState;
  isSidebarExpanded: boolean;
  // helpers derivados para facilitar uso nos componentes
  isInSidebar: boolean;
  mainZone: MainZone;
  mainItemIndex: number;
  sidebarIndex: number;
}

export const useFocusNavigation = ({
  heroLength,
  railLengths,
  sidebarLength,
}: UseFocusNavigationOptions): UseFocusNavigationReturn => {
  const [focusState, setFocusState] = useState<FocusState>({
    region: 'main',
    sidebarIndex: 0,
    mainZone: 'hero',
    mainItemIndex: 0,
  });

  // Usar useRef para acessar os valores atuais de focusState dentro do listener sem re-criar o efeito
  const focusStateRef = useRef<FocusState>(focusState);
  useEffect(() => {
    focusStateRef.current = focusState;
  }, [focusState]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { region, sidebarIndex, mainZone, mainItemIndex } = focusStateRef.current;

      // Impedir scroll padrão do browser para teclas de navegação
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }

      if (region === 'main') {
        switch (event.key) {
          case 'ArrowLeft':
            if (mainItemIndex > 0) {
              setFocusState((prev) => ({ ...prev, mainItemIndex: mainItemIndex - 1 }));
            } else if (mainItemIndex === 0) {
              setFocusState((prev) => ({ ...prev, region: 'sidebar' }));
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

          default:
            break;
        }
      } else if (region === 'sidebar') {
        switch (event.key) {
          case 'ArrowUp':
            if (sidebarIndex > 0) {
              setFocusState((prev) => ({ ...prev, sidebarIndex: sidebarIndex - 1 }));
            }
            break;

          case 'ArrowDown':
            if (sidebarIndex < sidebarLength - 1) {
              setFocusState((prev) => ({ ...prev, sidebarIndex: sidebarIndex + 1 }));
            }
            break;

          case 'ArrowRight':
          case 'Escape':
            setFocusState((prev) => ({ ...prev, region: 'main' }));
            break;

          case 'Enter':
            // Confirmação (será implementada depois)
            break;

          default:
            break;
        }
      }
    },
    [heroLength, railLengths, sidebarLength]
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
  };
};
