export interface Service {
  id: string;
  name: string;
  image: string;
  backgroundColor?: string;
  available: boolean;
  /** se true, não aparece no grid de Apps (mantido no código para reativar fácil) */
  hidden?: boolean;
}

// Ordenado alfabeticamente por nome (A-Z)
export const services: Service[] = [
  {
    id: 'camara-deputados',
    name: 'Câmara dos Deputados',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F2d6f36d6d3a649a7a40cb7209ecd1b99',
    backgroundColor: '#FFFFFF',
    available: true,
    hidden: true,
  },
  {
    id: 'informacoes-parlamentares',
    name: 'Informações Parlamentares',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F66e39fb2677244fd9ff53b8610accd43',
    backgroundColor: '#FFFFFF',
    available: false,
  },
  {
    id: 'senado-federal',
    name: 'Senado Federal',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2Fe7a36c5af61249fe89306f2d8b7e027f',
    backgroundColor: '#1A1A2E',
    available: true,
    hidden: true,
  },
  {
    id: 'meu-sus',
    name: 'Meu SUS Digital',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F95bcaa39988142a7b7151bf68d3116c5',
    backgroundColor: '#FFFFFF',
    available: true,
  },
  {
    id: 'bolsa-familia',
    name: 'Programa Bolsa Família',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2Fc877b887dd484b31bbab0b6b5bb28423',
    backgroundColor: '#FFFFFF',
    available: false,
  },
  {
    id: 'qualifica-pro',
    name: 'QualificaPro',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F10a56d67b80d489cb9bb028a594f8e27',
    backgroundColor: '#FFFFFF',
    available: true,
  },
];
