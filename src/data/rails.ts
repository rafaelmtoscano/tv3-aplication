// TODO: substituir por chamada à API
export type RailCardVariant = 'image' | 'image-text';

export interface RailCard {
  id: string;
  channelId?: string;
  image: string;
  logo?: string;
  title?: string;
  label?: string;
  timestamp?: string;
  isLive?: boolean;
}

export interface Rail {
  id: string;
  title: string;
  order: number;
  cardVariant: RailCardVariant;
  cards: RailCard[];
}

export const rails: Rail[] = [
  {
    id: 'live-tv',
    title: 'TV ao vivo',
    order: 1,
    cardVariant: 'image',
    cards: [
      { id: 'live-1', channelId: 'tv-camara', isLive: true, image: 'https://picsum.photos/seed/live-1/640/360', title: 'TV Câmara' },
      { id: 'live-2', channelId: 'tv-brasil', isLive: true, image: 'https://picsum.photos/seed/live-2/640/360', title: 'TV Brasil' },
      { id: 'live-3', channelId: 'tv-justica', isLive: true, image: 'https://picsum.photos/seed/live-3/640/360', title: 'TV Justiça' },
      { id: 'live-4', channelId: 'tv-senado', isLive: true, image: 'https://picsum.photos/seed/live-4/640/360', title: 'TV Senado' },
      { id: 'live-5', channelId: 'canal-gov', isLive: true, image: 'https://picsum.photos/seed/live-5/640/360', title: 'Canal Gov' },
      { id: 'live-6', channelId: 'nbr', isLive: true, image: 'https://picsum.photos/seed/live-6/640/360', title: 'NBR' },
    ]
  },
  {
    id: 'recommended',
    title: 'Recomendados para você',
    order: 2,
    cardVariant: 'image-text',
    cards: [
      { id: 'rec-1', image: 'https://picsum.photos/seed/tv-camara-1/640/360', title: 'A Voz do Brasil', label: 'TV Câmara', timestamp: '20:00' },
      { id: 'rec-2', image: 'https://picsum.photos/seed/tv-brasil-2/640/360', title: 'Cine Nacional', label: 'TV Brasil', timestamp: '22:00' },
      { id: 'rec-3', image: 'https://picsum.photos/seed/tv-justica-1/640/360', title: 'Sessão STF', label: 'TV Justiça', timestamp: '14:00' },
      { id: 'rec-4', image: 'https://picsum.photos/seed/tv-senado-3/640/360', title: 'Argumento', label: 'TV Senado', timestamp: '18:30' },
      { id: 'rec-5', image: 'https://picsum.photos/seed/canal-gov-2/640/360', title: 'Brasil Hoje', label: 'Canal Gov', timestamp: '19:00' },
      { id: 'rec-6', image: 'https://picsum.photos/seed/nbr-2/640/360', title: 'Educação Brasileira', label: 'NBR', timestamp: '16:00' },
    ]
  }
];
