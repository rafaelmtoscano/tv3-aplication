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
    id: 'meu-sus',
    name: 'Meu SUS Digital',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F1559b2a74c06497f890a54d658b867cd',
    backgroundColor: '#FFFFFF',
    available: false,
  },
  {
    id: 'bolsa-familia',
    name: 'Programa Bolsa Família',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F7d75906fca034667bb7c4bc51a15ede1',
    backgroundColor: '#FFFFFF',
    available: false,
  },
];
