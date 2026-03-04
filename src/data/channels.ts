// TODO: substituir por chamada à API

export interface Program {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration?: string;
  category?: string;
  description?: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  logoFull: string;
  backgroundColor: string;
  streamUrl?: string;
  programs?: Program[];
}

// TODO: substituir por chamada à API
export const channels: Channel[] = [
  {
    id: 'tv-mec',
    name: 'TV MEC',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F9e0a62eeec2a4e2aaa1fe8ab565197bc?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F9e0a62eeec2a4e2aaa1fe8ab565197bc?format=webp&width=480&height=192',
    backgroundColor: '#3A2452',
    streamUrl: '',
    programs: [
      { id: 'tv-mec-1', title: 'Programa tv-mec-1', thumbnail: 'https://i.ytimg.com/vi/sPnSXbh7Fwc/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=sPnSXbh7Fwc', category: 'Educação' },
      { id: 'tv-mec-2', title: 'Programa tv-mec-2', thumbnail: 'https://i.ytimg.com/vi/qbsWB133gXs/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=qbsWB133gXs', category: 'Educação' },
      { id: 'tv-mec-3', title: 'Programa tv-mec-3', thumbnail: 'https://i.ytimg.com/vi/SZ_N2QBnaGc/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=SZ_N2QBnaGc', category: 'Educação' },
      { id: 'tv-mec-4', title: 'Programa tv-mec-4', thumbnail: 'https://i.ytimg.com/vi/pZqmvnMzQ-U/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=pZqmvnMzQ-U', category: 'Educação' },
      { id: 'tv-mec-5', title: 'Programa tv-mec-5', thumbnail: 'https://i.ytimg.com/vi/X_c4BXOCTm4/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=X_c4BXOCTm4', category: 'Educação' },
      { id: 'tv-mec-6', title: 'Programa tv-mec-6', thumbnail: 'https://i.ytimg.com/vi/UQ-NHhipRXU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=UQ-NHhipRXU', category: 'Educação' },
      { id: 'tv-mec-7', title: 'Programa tv-mec-7', thumbnail: 'https://i.ytimg.com/vi/DvlfkXkPDbg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=DvlfkXkPDbg', category: 'Educação' },
      { id: 'tv-mec-8', title: 'Programa tv-mec-8', thumbnail: 'https://i.ytimg.com/vi/fjiwwei3tmI/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=fjiwwei3tmI', category: 'Educação' },
    ],
  },
  {
    id: 'tv-camara',
    name: 'TV Câmara',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F42f9421675e545838eedabcd6fe2da8b?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F64a9563fa6b74e149a27e7d4b91da1c1?format=webp&width=800&height=450',
    backgroundColor: '#FFFFFF',
    streamUrl: 'https://stream3.camara.gov.br/tv1/manifest.m3u8',
    programs: [
      { id: 'tv-camara-1', title: 'Programa tv-camara-1', thumbnail: 'https://i.ytimg.com/vi/b7QbtVgLheQ/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=b7QbtVgLheQ', category: 'Política' },
      { id: 'tv-camara-2', title: 'Programa tv-camara-2', thumbnail: 'https://i.ytimg.com/vi/gQH2OODFdJQ/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=gQH2OODFdJQ', category: 'Política' },
      { id: 'tv-camara-3', title: 'Programa tv-camara-3', thumbnail: 'https://i.ytimg.com/vi/v3BOh7Rmkds/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=v3BOh7Rmkds', category: 'Política' },
      { id: 'tv-camara-4', title: 'Programa tv-camara-4', thumbnail: 'https://i.ytimg.com/vi/89CDuEpszNU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=89CDuEpszNU', category: 'Política' },
      { id: 'tv-camara-5', title: 'Programa tv-camara-5', thumbnail: 'https://i.ytimg.com/vi/_w0aev5Td0Y/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=_w0aev5Td0Y', category: 'Política' },
      { id: 'tv-camara-6', title: 'Programa tv-camara-6', thumbnail: 'https://i.ytimg.com/vi/zviXmCNTFDA/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=zviXmCNTFDA', category: 'Política' },
      { id: 'tv-camara-7', title: 'Programa tv-camara-7', thumbnail: 'https://i.ytimg.com/vi/CYTAeHUTopE/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=CYTAeHUTopE', category: 'Política' },
      { id: 'tv-camara-8', title: 'Programa tv-camara-8', thumbnail: 'https://i.ytimg.com/vi/mwotgXrURus/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=mwotgXrURus', category: 'Política' },
      { id: 'tv-camara-9', title: 'Programa tv-camara-9', thumbnail: 'https://i.ytimg.com/vi/Aaq1NTccS98/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=Aaq1NTccS98', category: 'Política' },
      { id: 'tv-camara-10', title: 'Programa tv-camara-10', thumbnail: 'https://i.ytimg.com/vi/pfJ_8Hea6uk/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=pfJ_8Hea6uk', category: 'Política' },
    ],
  },
  {
    id: 'tv-brasil',
    name: 'TV Brasil',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F40e646594c6c430a94ef7b5ff7f589c0?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F5c8223094974421f98bc81f062e7b025?format=webp&width=800&height=450',
    backgroundColor: '#EEBE08',
    streamUrl: 'https://tvbrasil-stream.ebc.com.br/EBC_HD-avc1_3000000=10004.m3u8',
    programs: [
      { id: 'tv-brasil-1', title: 'Programa tv-brasil-1', thumbnail: 'https://i.ytimg.com/vi/tu0fMZNKQQs/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=tu0fMZNKQQs', category: 'Jornalismo' },
      { id: 'tv-brasil-2', title: 'Programa tv-brasil-2', thumbnail: 'https://i.ytimg.com/vi/dcyFeAErXdg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=dcyFeAErXdg', category: 'Jornalismo' },
      { id: 'tv-brasil-3', title: 'Programa tv-brasil-3', thumbnail: 'https://i.ytimg.com/vi/9rzXNAO8UJs/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=9rzXNAO8UJs', category: 'Jornalismo' },
      { id: 'tv-brasil-4', title: 'Programa tv-brasil-4', thumbnail: 'https://i.ytimg.com/vi/EA8UNjRfFXg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=EA8UNjRfFXg', category: 'Jornalismo' },
      { id: 'tv-brasil-5', title: 'Programa tv-brasil-5', thumbnail: 'https://i.ytimg.com/vi/obAlpll5VzY/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=obAlpll5VzY', category: 'Jornalismo' },
      { id: 'tv-brasil-6', title: 'Programa tv-brasil-6', thumbnail: 'https://i.ytimg.com/vi/-FpmgoHgsqI/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=-FpmgoHgsqI', category: 'Jornalismo' },
      { id: 'tv-brasil-7', title: 'Programa tv-brasil-7', thumbnail: 'https://i.ytimg.com/vi/Z2iDSTaGMYg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=Z2iDSTaGMYg', category: 'Jornalismo' },
      { id: 'tv-brasil-8', title: 'Programa tv-brasil-8', thumbnail: 'https://i.ytimg.com/vi/J00rb9EctZE/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=J00rb9EctZE', category: 'Jornalismo' },
      { id: 'tv-brasil-9', title: 'Programa tv-brasil-9', thumbnail: 'https://i.ytimg.com/vi/Jx603TFQdqM/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=Jx603TFQdqM', category: 'Jornalismo' },
      { id: 'tv-brasil-10', title: 'Programa tv-brasil-10', thumbnail: 'https://i.ytimg.com/vi/ok5jksQ-Kr8/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=ok5jksQ-Kr8', category: 'Jornalismo' },
    ],
  },
  {
    id: 'canal-gov',
    name: 'Canal Gov',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F655d4a3ff4a041e490aa5ba1378906bd?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2Fa6eaef1fb7db406593cd2e64dfafb0a5?format=webp&width=800&height=450',
    backgroundColor: '#0D448C',
    streamUrl: 'https://canalgov-stream.ebc.com.br/GOV-avc1_1800000=10000.m3u8',
    programs: [
      { id: 'canal-gov-1', title: 'Programa canal-gov-1', thumbnail: 'https://i.ytimg.com/vi/mu7heQQ3ekU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=mu7heQQ3ekU', category: 'Governo' },
      { id: 'canal-gov-2', title: 'Programa canal-gov-2', thumbnail: 'https://i.ytimg.com/vi/-igsD2VQZkE/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=-igsD2VQZkE', category: 'Governo' },
      { id: 'canal-gov-3', title: 'Programa canal-gov-3', thumbnail: 'https://i.ytimg.com/vi/zBCIThuYt50/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=zBCIThuYt50', category: 'Governo' },
      { id: 'canal-gov-4', title: 'Programa canal-gov-4', thumbnail: 'https://i.ytimg.com/vi/sZZWHuMZNac/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=sZZWHuMZNac', category: 'Governo' },
      { id: 'canal-gov-5', title: 'Programa canal-gov-5', thumbnail: 'https://i.ytimg.com/vi/ricnqTWC7xU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=ricnqTWC7xU', category: 'Governo' },
      { id: 'canal-gov-6', title: 'Programa canal-gov-6', thumbnail: 'https://i.ytimg.com/vi/X5yCbNURbYM/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=X5yCbNURbYM', category: 'Governo' },
      { id: 'canal-gov-7', title: 'Programa canal-gov-7', thumbnail: 'https://i.ytimg.com/vi/xye1jN9LcM8/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=xye1jN9LcM8', category: 'Governo' },
      { id: 'canal-gov-8', title: 'Programa canal-gov-8', thumbnail: 'https://i.ytimg.com/vi/mJLhPLdy454/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=mJLhPLdy454', category: 'Governo' },
      { id: 'canal-gov-9', title: 'Programa canal-gov-9', thumbnail: 'https://i.ytimg.com/vi/I1RSF4YgAX0/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=I1RSF4YgAX0', category: 'Governo' },
      { id: 'canal-gov-10', title: 'Programa canal-gov-10', thumbnail: 'https://i.ytimg.com/vi/OSwyDZTzJXg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=OSwyDZTzJXg', category: 'Governo' },
    ],
  },
  {
    id: 'tv-justica',
    name: 'TV Justiça',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2Ff721c15dcde24ceeba9ee7e1152d9921?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F8c6042eefaa9409593860cbbde83aad5?format=webp&width=800&height=450',
    backgroundColor: '#084987',
    streamUrl: '',
    programs: [
      { id: 'tv-justica-1', title: 'Programa tv-justica-1', thumbnail: 'https://i.ytimg.com/vi/g1HEMB-9fXM/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=g1HEMB-9fXM', category: 'Direito' },
      { id: 'tv-justica-2', title: 'Programa tv-justica-2', thumbnail: 'https://i.ytimg.com/vi/6SJXwIgk9mM/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=6SJXwIgk9mM', category: 'Direito' },
      { id: 'tv-justica-3', title: 'Programa tv-justica-3', thumbnail: 'https://i.ytimg.com/vi/RHPYpH_q3Cs/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=RHPYpH_q3Cs', category: 'Direito' },
      { id: 'tv-justica-4', title: 'Programa tv-justica-4', thumbnail: 'https://i.ytimg.com/vi/idrRfcqm_Zk/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=idrRfcqm_Zk', category: 'Direito' },
      { id: 'tv-justica-5', title: 'Programa tv-justica-5', thumbnail: 'https://i.ytimg.com/vi/l36FAGFmQ2E/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=l36FAGFmQ2E', category: 'Direito' },
      { id: 'tv-justica-6', title: 'Programa tv-justica-6', thumbnail: 'https://i.ytimg.com/vi/TyJoEHRJNBA/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=TyJoEHRJNBA', category: 'Direito' },
      { id: 'tv-justica-7', title: 'Programa tv-justica-7', thumbnail: 'https://i.ytimg.com/vi/D9U70oCtvj4/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=D9U70oCtvj4', category: 'Direito' },
      { id: 'tv-justica-8', title: 'Programa tv-justica-8', thumbnail: 'https://i.ytimg.com/vi/jSxUmZFtuec/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=jSxUmZFtuec', category: 'Direito' },
      { id: 'tv-justica-9', title: 'Programa tv-justica-9', thumbnail: 'https://i.ytimg.com/vi/8d1PJ-GphJ0/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=8d1PJ-GphJ0', category: 'Direito' },
      { id: 'tv-justica-10', title: 'Programa tv-justica-10', thumbnail: 'https://i.ytimg.com/vi/z7sl02rSJBU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=z7sl02rSJBU', category: 'Direito' },
    ],
  },
  {
    id: 'tv-senado',
    name: 'TV Senado',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2Fefb11e9bb9114a46b23813f61e4f1df8?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F71bea8998b7d494ea2da48d509a33111?format=webp&width=800&height=450',
    backgroundColor: '#FFFFFF',
    streamUrl: '',
    programs: [
      { id: 'tv-senado-1', title: 'Programa tv-senado-1', thumbnail: 'https://i.ytimg.com/vi/C2m7YOXnA4o/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=C2m7YOXnA4o', category: 'Política' },
      { id: 'tv-senado-2', title: 'Programa tv-senado-2', thumbnail: 'https://i.ytimg.com/vi/iSouHkfOypE/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=iSouHkfOypE', category: 'Política' },
      { id: 'tv-senado-3', title: 'Programa tv-senado-3', thumbnail: 'https://i.ytimg.com/vi/_xXFu4k3WRU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=_xXFu4k3WRU', category: 'Política' },
      { id: 'tv-senado-4', title: 'Programa tv-senado-4', thumbnail: 'https://i.ytimg.com/vi/SCmQlxfIRLc/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=SCmQlxfIRLc', category: 'Política' },
      { id: 'tv-senado-5', title: 'Programa tv-senado-5', thumbnail: 'https://i.ytimg.com/vi/UUn05qqJdQg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=UUn05qqJdQg', category: 'Política' },
      { id: 'tv-senado-6', title: 'Programa tv-senado-6', thumbnail: 'https://i.ytimg.com/vi/aShqP_MDagw/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=aShqP_MDagw', category: 'Política' },
      { id: 'tv-senado-7', title: 'Programa tv-senado-7', thumbnail: 'https://i.ytimg.com/vi/3po6QyN0f9A/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=3po6QyN0f9A', category: 'Política' },
      { id: 'tv-senado-8', title: 'Programa tv-senado-8', thumbnail: 'https://i.ytimg.com/vi/_xNNCQQR4Tk/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=_xNNCQQR4Tk', category: 'Política' },
      { id: 'tv-senado-9', title: 'Programa tv-senado-9', thumbnail: 'https://i.ytimg.com/vi/bJSeZt-qLkA/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=bJSeZt-qLkA', category: 'Política' },
    ],
  },
];
