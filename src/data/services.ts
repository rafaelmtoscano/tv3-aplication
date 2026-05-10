export interface Service {
  id: string;
  name: string;
  image: string;
  backgroundColor?: string;
  available: boolean;
}

// Ordenado alfabeticamente por nome (A-Z)
export const services: Service[] = [
  {
    id: 'camara-deputados',
    name: 'Câmara dos Deputados',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F2d6f36d6d3a649a7a40cb7209ecd1b99',
    backgroundColor: '#FFFFFF',
    available: true,
  },
  {
    id: 'senado-federal',
    name: 'Senado Federal',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2Fe7a36c5af61249fe89306f2d8b7e027f',
    backgroundColor: '#1A1A2E',
    available: true,
  },
  {
    id: 'meu-sus',
    name: 'Meu SUS Digital',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F6794bf7239fa451a80b8a5d48fdf4409',
    backgroundColor: '#FFFFFF',
    available: true,
  },
  {
    id: 'bolsa-familia',
    name: 'Programa Bolsa Família',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F1635d624a0b649199507910ade185e36',
    backgroundColor: '#FFFFFF',
    available: false,
  },
];
