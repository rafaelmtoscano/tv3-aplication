// TODO: substituir por chamada à API
export interface Program {
  id: string;
  title: string;
  thumbnail: string;
  duration?: string;
  category?: string;
  description?: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  backgroundColor: string;
  streamUrl?: string;
  programs?: Program[];
}

export const channels: Channel[] = [
  {
    id: 'tv-camara',
    name: 'TV Câmara',
    logo: '',
    backgroundColor: '#F8F8F8',
    streamUrl: 'https://placeholder-hls-stream.m3u8',
    programs: [
      { id: 'camara-1', title: 'A Voz do Brasil', thumbnail: 'https://picsum.photos/seed/tv-camara-1/640/360', duration: '60 min', category: 'Noticiário' },
      { id: 'camara-2', title: 'Sessão Plenária', thumbnail: 'https://picsum.photos/seed/tv-camara-2/640/360', duration: '120 min', category: 'Política' },
      { id: 'camara-3', title: 'Câmara Debate', thumbnail: 'https://picsum.photos/seed/tv-camara-3/640/360', duration: '30 min', category: 'Debate' },
    ]
  },
  {
    id: 'tv-brasil',
    name: 'TV Brasil',
    logo: '',
    backgroundColor: '#F5C400',
    streamUrl: 'https://placeholder-hls-stream.m3u8',
    programs: [
      { id: 'brasil-1', title: 'Brasil Notícias', thumbnail: 'https://picsum.photos/seed/tv-brasil-1/640/360', duration: '45 min', category: 'Jornalismo' },
      { id: 'brasil-2', title: 'Cine Nacional', thumbnail: 'https://picsum.photos/seed/tv-brasil-2/640/360', duration: '90 min', category: 'Filmes' },
      { id: 'brasil-3', title: 'Samba na Gamboa', thumbnail: 'https://picsum.photos/seed/tv-brasil-3/640/360', duration: '60 min', category: 'Musical' },
    ]
  },
  {
    id: 'tv-justica',
    name: 'TV Justiça',
    logo: '',
    backgroundColor: '#003DA5',
    streamUrl: 'https://placeholder-hls-stream.m3u8',
    programs: [
      { id: 'justica-1', title: 'Sessão STF', thumbnail: 'https://picsum.photos/seed/tv-justica-1/640/360', duration: '180 min', category: 'Judiciário' },
      { id: 'justica-2', title: 'Direito em Debate', thumbnail: 'https://picsum.photos/seed/tv-justica-2/640/360', duration: '45 min', category: 'Educação' },
      { id: 'justica-3', title: 'Iluminar', thumbnail: 'https://picsum.photos/seed/tv-justica-3/640/360', duration: '30 min', category: 'Documentário' },
    ]
  },
  {
    id: 'tv-senado',
    name: 'TV Senado',
    logo: '',
    backgroundColor: '#1A1A2E',
    streamUrl: 'https://placeholder-hls-stream.m3u8',
    programs: [
      { id: 'senado-1', title: 'Jornal do Senado', thumbnail: 'https://picsum.photos/seed/tv-senado-1/640/360', duration: '30 min', category: 'Jornalismo' },
      { id: 'senado-2', title: 'Sessão Solene', thumbnail: 'https://picsum.photos/seed/tv-senado-2/640/360', duration: '120 min', category: 'Política' },
      { id: 'senado-3', title: 'Argumento', thumbnail: 'https://picsum.photos/seed/tv-senado-3/640/360', duration: '45 min', category: 'Entrevista' },
    ]
  },
  {
    id: 'canal-gov',
    name: 'Canal Gov',
    logo: '',
    backgroundColor: '#007A33',
    streamUrl: 'https://placeholder-hls-stream.m3u8',
    programs: [
      { id: 'gov-1', title: 'Bom Dia Ministro', thumbnail: 'https://picsum.photos/seed/canal-gov-1/640/360', duration: '60 min', category: 'Governo' },
      { id: 'gov-2', title: 'Brasil Hoje', thumbnail: 'https://picsum.photos/seed/canal-gov-2/640/360', duration: '30 min', category: 'Informativo' },
      { id: 'gov-3', title: 'Agenda do Presidente', thumbnail: 'https://picsum.photos/seed/canal-gov-3/640/360', duration: '15 min', category: 'Institucional' },
    ]
  },
  {
    id: 'nbr',
    name: 'NBR',
    logo: '',
    backgroundColor: '#003366',
    streamUrl: 'https://placeholder-hls-stream.m3u8',
    programs: [
      { id: 'nbr-1', title: 'Informe NBR', thumbnail: 'https://picsum.photos/seed/nbr-1/640/360', duration: '15 min', category: 'Notícias' },
      { id: 'nbr-2', title: 'Educação Brasileira', thumbnail: 'https://picsum.photos/seed/nbr-2/640/360', duration: '45 min', category: 'Educação' },
      { id: 'nbr-3', title: 'NBR Entrevista', thumbnail: 'https://picsum.photos/seed/nbr-3/640/360', duration: '30 min', category: 'Entrevista' },
    ]
  }
];
