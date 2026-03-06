// TODO: substituir por chamada à API

import { channels } from './channels';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface HeroSlide {
  id: string;
  mediaType: 'image' | 'video';
  mediaSrc: string;       // thumbnail ou streamUrl
  logo?: string;
  isLive?: boolean;
  classification?: 'L' | '10' | '12' | '14' | '16' | '18';
  signal?: 'HD' | '4K';
  title: string;
  description?: string;
  buttonLabel?: string;
  channelId: string;      // referência ao canal de origem
  videoUrl?: string;      // URL de destino ao pressionar Enter
}

export interface RailCard {
  id: string;
  channelId: string;
  channelName: string;
  logo: string;
  backgroundColor: string;  // cor do canal (usada em cards só-imagem)
  image: string;             // thumbnail do vídeo ou frame do ao vivo
  title?: string;
  label?: string;            // categoria
  timestamp?: string;
  isLive?: boolean;
  videoUrl?: string;
  streamUrl?: string;
}

export interface Rail {
  id: string;
  title: string;
  variant: 'image' | 'image-text';
  cards: RailCard[];
}

export interface HomeData {
  hero: HeroSlide[];
  rails: Rail[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getChannel(id: string) {
  return channels.find(c => c.id === id)!;
}

// ─── Hero: 1 ao vivo + 3 vídeos ───────────────────────────────────────────────

// TODO: substituir por chamada à API — ordenar por audiência/destaque
const heroSlides: HeroSlide[] = [
  // Slide 1 — TV Brasil ao vivo
  (() => {
    const ch = getChannel('tv-brasil');
    return {
      id: 'hero-live-tv-brasil',
      mediaType: 'video' as const,
      mediaSrc: ch.streamUrl!,
      logo: ch.logo,
      isLive: true,
      signal: 'HD' as const,
      classification: 'L' as const,
      title: ch.programs![0].title,
      description: 'Acompanhe ao vivo a programação da TV Brasil com conteúdo jornalístico de qualidade.',
      buttonLabel: 'Assistir ao vivo',
      channelId: ch.id,
    };
  })(),

  // Slide 2 — Canal Gov destaque
  (() => {
    const ch = getChannel('canal-gov');
    const prog = ch.programs![0];
    return {
      id: 'hero-canal-gov-1',
      mediaType: 'image' as const,
      mediaSrc: prog.thumbnail,
      logo: ch.logo,
      signal: 'HD' as const,
      classification: 'L' as const,
      title: prog.title,
      description: 'Acompanhe as principais notícias e ações do Governo Federal no Canal Gov.',
      buttonLabel: 'Assistir agora',
      channelId: ch.id,
      videoUrl: prog.videoUrl,
    };
  })(),

  // Slide 3 — TV Câmara destaque
  (() => {
    const ch = getChannel('tv-camara');
    const prog = ch.programs![0];
    return {
      id: 'hero-tv-camara-1',
      mediaType: 'image' as const,
      mediaSrc: prog.thumbnail,
      logo: ch.logo,
      signal: 'HD' as const,
      classification: 'L' as const,
      title: prog.title,
      description: 'Acompanhe os debates, sessões e programas da TV Câmara, a televisão do Poder Legislativo.',
      buttonLabel: 'Assistir agora',
      channelId: ch.id,
      videoUrl: prog.videoUrl,
    };
  })(),

  // Slide 4 — TV MEC destaque
  (() => {
    const ch = getChannel('tv-mec');
    const prog = ch.programs![0];
    return {
      id: 'hero-tv-mec-1',
      mediaType: 'image' as const,
      mediaSrc: prog.thumbnail,
      logo: ch.logo,
      signal: 'HD' as const,
      classification: 'L' as const,
      title: prog.title,
      description: 'Conteúdo educativo do Ministério da Educação para estudantes e professores de todo o Brasil.',
      buttonLabel: 'Assistir agora',
      channelId: ch.id,
      videoUrl: prog.videoUrl,
    };
  })(),
];

// ─── Rail 1 — TV ao vivo (variant: image, só canais com streamUrl) ────────────

// TODO: substituir por chamada à API — filtrar canais ao vivo ativos em tempo real
const liveRail: Rail = {
  id: 'live-tv',
  title: 'TV ao vivo',
  variant: 'image',
  cards: channels
    .filter(ch => ch.streamUrl && ch.streamUrl.length > 0)
    .map(ch => ({
      id: `live-${ch.id}`,
      channelId: ch.id,
      channelName: ch.name,
      logo: ch.logo,
      backgroundColor: ch.backgroundColor,
      image: ch.logoFull,        // card só-imagem: exibe logoFull sobre cor do canal
      isLive: true,
      streamUrl: ch.streamUrl,
    })),
};

// ─── Rail 2 — Publicados recentemente (últimos 15 dias simulado) ──────────────

// TODO: substituir por chamada à API com filtro de data real
// Simulação: pega o 2º programa de cada canal (índice 1) como "publicado recentemente"
const recentRail: Rail = {
  id: 'recent',
  title: 'Publicados recentemente',
  variant: 'image-text',
  cards: channels.flatMap(ch => {
    const prog = ch.programs?.[1];
    if (!prog) return [];
    return [{
      id: `recent-${prog.id}`,
      channelId: ch.id,
      channelName: ch.name,
      logo: ch.logo,
      backgroundColor: ch.backgroundColor,
      image: prog.thumbnail,
      title: prog.title,
      label: prog.category,
      isLive: false,
      videoUrl: prog.videoUrl,
    }];
  }),
};

// ─── Rail 3 — Política & Democracia ──────────────────────────────────────────

// Categorias: Política (TV Câmara, TV Senado) + Governo (Canal Gov) + Direito (TV Justiça)
// TODO: substituir por chamada à API com tag 'politica-democracia'
const politicsRail: Rail = {
  id: 'politics',
  title: 'Política & Democracia',
  variant: 'image-text',
  cards: channels
    .filter(ch => ['tv-camara', 'tv-senado', 'canal-gov', 'tv-justica'].includes(ch.id))
    .flatMap(ch => {
      const prog = ch.programs?.[2];
      if (!prog) return [];
      return [{
        id: `politics-${prog.id}`,
        channelId: ch.id,
        channelName: ch.name,
        logo: ch.logo,
        backgroundColor: ch.backgroundColor,
        image: prog.thumbnail,
        title: prog.title,
        label: prog.category,
        isLive: false,
        videoUrl: prog.videoUrl,
      }];
    }),
};

// ─── Rail 4 — Educação & Jornalismo ──────────────────────────────────────────

// Categorias: Educação (TV MEC) + Jornalismo (TV Brasil)
// TODO: substituir por chamada à API with tag 'educacao-jornalismo'
const educationRail: Rail = {
  id: 'education',
  title: 'Educação & Jornalismo',
  variant: 'image-text',
  cards: channels
    .filter(ch => ['tv-mec', 'tv-brasil'].includes(ch.id))
    .flatMap(ch =>
      (ch.programs || []).slice(2, 8).map(prog => ({
        id: `edu-${prog.id}`,
        channelId: ch.id,
        channelName: ch.name,
        logo: ch.logo,
        backgroundColor: ch.backgroundColor,
        image: prog.thumbnail,
        title: prog.title,
        label: prog.category,
        isLive: false,
        videoUrl: prog.videoUrl,
      }))
    ),
};

// ─── Export principal ─────────────────────────────────────────────────────────

// TODO: substituir por chamada à API
export const homeData: HomeData = {
  hero: heroSlides,
  rails: [liveRail, recentRail, politicsRail, educationRail],
};
