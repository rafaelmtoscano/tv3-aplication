export interface PharmacyHorario {
  dias: string;
  abre: string;
  fecha: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  phone: string;
  cnes: string;
  latitude: number;
  longitude: number;
  horarios: PharmacyHorario[];
}

export interface PharmacyPageState {
  focusedIndex: number;
  activeTab: 'farmacias' | 'historico';
}

export const mockPharmacies: Pharmacy[] = [
  {
    id: 'farmacia-drogasil-tambau',
    name: 'Drogasil — Tambaú',
    address: 'Av. Epitácio Pessoa, 2000',
    neighborhood: 'Tambaú',
    city: 'João Pessoa',
    state: 'PB',
    cep: '58039-000',
    phone: '(83) 3214-2210',
    cnes: '2537934',
    latitude: -7.1169,
    longitude: -34.8273,
    horarios: [
      { dias: 'Segunda a sexta', abre: '07:00', fecha: '22:00' },
      { dias: 'Sábado', abre: '08:00', fecha: '22:00' },
      { dias: 'Domingo', abre: '08:00', fecha: '20:00' },
    ],
  },
  {
    id: 'farmacia-pague-menos-cabo-branco',
    name: 'Pague Menos — Cabo Branco',
    address: 'Rua Rodrigues de Aquino, 128',
    neighborhood: 'Cabo Branco',
    city: 'João Pessoa',
    state: 'PB',
    cep: '58045-000',
    phone: '(83) 3021-8844',
    cnes: '2537942',
    latitude: -7.1346,
    longitude: -34.8221,
    horarios: [
      { dias: 'Segunda a sábado', abre: '07:30', fecha: '22:00' },
      { dias: 'Domingo', abre: '08:00', fecha: '20:00' },
    ],
  },
  {
    id: 'farmacia-droga-raia-manaira',
    name: 'Droga Raia — Manaíra',
    address: 'Av. Governador Argemiro de Figueiredo, 3120',
    neighborhood: 'Manaíra',
    city: 'João Pessoa',
    state: 'PB',
    cep: '58038-000',
    phone: '(83) 3244-1199',
    cnes: '2537950',
    latitude: -7.0922,
    longitude: -34.8384,
    horarios: [
      { dias: 'Todos os dias', abre: '07:00', fecha: '23:00' },
    ],
  },
  {
    id: 'farmacia-farmagora-centro',
    name: 'Farmagora — Centro',
    address: 'Rua das Trincheiras, 115',
    neighborhood: 'Centro',
    city: 'João Pessoa',
    state: 'PB',
    cep: '58010-100',
    phone: '(83) 3222-6500',
    cnes: '2537968',
    latitude: -7.1206,
    longitude: -34.8814,
    horarios: [
      { dias: 'Segunda a sexta', abre: '07:00', fecha: '20:00' },
      { dias: 'Sábado', abre: '08:00', fecha: '18:00' },
    ],
  },
  {
    id: 'farmacia-rede-facil-bessa',
    name: 'Rede Fácil — Bessa',
    address: 'Av. Artur Monteiro de Paiva, 1010',
    neighborhood: 'Bessa',
    city: 'João Pessoa',
    state: 'PB',
    cep: '58035-000',
    phone: '(83) 3234-9088',
    cnes: '2537976',
    latitude: -7.0836,
    longitude: -34.8338,
    horarios: [
      { dias: 'Segunda a sábado', abre: '07:30', fecha: '21:00' },
      { dias: 'Domingo', abre: '08:00', fecha: '19:00' },
    ],
  },
];
