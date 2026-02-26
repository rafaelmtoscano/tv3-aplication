import { useState, useEffect, useCallback, useRef } from 'react';

export type FocusZone = 'sidebar' | 'hero' | 'rail-0' | 'rail-1' | 'my-space';

export interface FocusState {
  zone: FocusZone;
  itemIndex: number;
}

export interface UseFocusNavigationOptions {
  heroLength: number;      // número de slides no hero
  railLengths: number[];   // número de cards por rail, ex: [6, 6]
}

export interface UseFocusNavigationReturn {
  focusState: FocusState;
  isSidebarExpanded: boolean;
  setFocusState: (state: FocusState) => void;
}

export const useFocusNavigation = ({
  heroLength,
  railLengths,
}: UseFocusNavigationOptions): UseFocusNavigationReturn => {
  const [focusState, setFocusState] = useState<FocusState>({
    zone: 'hero',
    itemIndex: 0,
  });

  // Usar useRef para acessar os valores atuais de focusState dentro do listener sem re-criar o efeito
  const focusStateRef = useRef<FocusState>(focusState);
  useEffect(() => {
    focusStateRef.current = focusState;
  }, [focusState]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { zone, itemIndex } = focusStateRef.current;

      switch (event.key) {
        case 'ArrowRight':
          if (zone === 'sidebar') {
            setFocusState({ zone: 'hero', itemIndex: 0 });
          } else if (zone === 'hero') {
            if (itemIndex < heroLength - 1) {
              setFocusState({ zone: 'hero', itemIndex: itemIndex + 1 });
            }
          } else if (zone === 'rail-0') {
            if (itemIndex < (railLengths[0] || 0) - 1) {
              setFocusState({ zone: 'rail-0', itemIndex: itemIndex + 1 });
            }
          } else if (zone === 'rail-1') {
            if (itemIndex < (railLengths[1] || 0) - 1) {
              setFocusState({ zone: 'rail-1', itemIndex: itemIndex + 1 });
            }
          }
          break;

        case 'ArrowLeft':
          if (itemIndex > 0) {
            setFocusState({ zone, itemIndex: itemIndex - 1 });
          } else if (itemIndex === 0 && zone !== 'sidebar') {
            setFocusState({ zone: 'sidebar', itemIndex: 0 });
          }
          break;

        case 'ArrowDown':
          if (zone === 'hero') {
            setFocusState({ zone: 'rail-0', itemIndex: 0 });
          } else if (zone === 'rail-0') {
            setFocusState({ zone: 'rail-1', itemIndex: 0 });
          } else if (zone === 'rail-1') {
            setFocusState({ zone: 'my-space', itemIndex: 0 });
          }
          break;

        case 'ArrowUp':
          if (zone === 'rail-0') {
            setFocusState({ zone: 'hero', itemIndex: 0 });
          } else if (zone === 'rail-1') {
            setFocusState({ zone: 'rail-0', itemIndex: 0 });
          } else if (zone === 'my-space') {
            setFocusState({ zone: 'rail-1', itemIndex: 0 });
          }
          break;

        case 'Escape':
          if (zone !== 'hero') {
            setFocusState({ zone: 'hero', itemIndex: 0 });
          }
          break;

        default:
          break;
      }
    },
    [heroLength, railLengths]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    focusState,
    isSidebarExpanded: focusState.zone === 'sidebar',
    setFocusState,
  };
};
