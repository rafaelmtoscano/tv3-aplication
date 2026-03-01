// TODO: substituir por chamada à API
export interface HeroSlide {
  id: string;
  channelId: string;
  title: string;
  description: string;
  backgroundImage: string;
  badge?: string;
  ctaLabel: string;
  streamUrl: string;
}

export const heroSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    channelId: 'tv-camara',
    title: 'Sessão Plenária ao Vivo',
    description: 'Acompanhe as votações e debates importantes que acontecem hoje na Câmara dos Deputados.',
    backgroundImage: 'https://picsum.photos/seed/hero1/1920/1080',
    badge: 'AO VIVO',
    ctaLabel: 'Assistir Agora',
    streamUrl: 'https://canalgov-stream.ebc.com.br/GOV-avc1_1800000=10000.m3u8'
  },
  {
    id: 'slide-2',
    channelId: 'tv-brasil',
    title: 'Especial Cine Nacional',
    description: 'O melhor do cinema brasileiro você encontra aqui. Grandes clássicos e produções contemporâneas.',
    backgroundImage: 'https://picsum.photos/seed/hero2/1920/1080',
    ctaLabel: 'Ver Mais',
    streamUrl: 'https://placeholder-hls-stream.m3u8'
  },
  {
    id: 'slide-3',
    channelId: 'tv-senado',
    title: 'Entrevista Exclusiva',
    description: 'Debates sobre as novas reformas propostas e o impacto na economia brasileira.',
    backgroundImage: 'https://picsum.photos/seed/hero3/1920/1080',
    badge: 'RECOMENDADO',
    ctaLabel: 'Acompanhar',
    streamUrl: 'https://placeholder-hls-stream.m3u8'
  },
  {
    id: 'slide-4',
    channelId: 'canal-gov',
    title: 'Ações do Governo Federal',
    description: 'Fique por dentro das principais notícias e ações que transformam o Brasil todos os dias.',
    backgroundImage: 'https://picsum.photos/seed/hero4/1920/1080',
    ctaLabel: 'Saiba Mais',
    streamUrl: 'https://placeholder-hls-stream.m3u8'
  }
];
