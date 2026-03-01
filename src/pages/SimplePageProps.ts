import { MainZone } from '../hooks/useFocusNavigation';

export interface SimplePageProps {
  isActive: boolean;
  mainZone: MainZone;
  mainItemIndex: number;
}
