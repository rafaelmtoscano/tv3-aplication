import type { GovBrUser } from '../context/AuthContext';

export interface GovBrProfile {
  id: string;
  name: string;
  avatar: string;
  relation: 'Titular' | 'Dependente';
  data: GovBrUser;
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────
// TODO: substituir por chamada real à API gov.br + CADSUS + HÓRUS
const TITULAR_DATA: GovBrUser = {
  name: 'Maria Ferreira',
  cpfMasked: '***.***.123-**',
  cns: '7 0542 1087 1234 5',
  cep: '58039-000',
  city: 'João Pessoa',
  state: 'PB',
  condicoes: ['Hipertensão arterial', 'Diabetes tipo 2', 'Dislipidemia'],
  dispensacoes: [
    {
      id: 'd-1',
      medicamento: 'Losartana 50mg',
      indicacao: 'Hipertensão',
      dataRetirada: '2026-03-04',
      farmaciaName: 'Drogasil – Tambaú',
      farmaciaCnes: '2537934',
      quantidade: 30,
    },
    {
      id: 'd-2',
      medicamento: 'Metformina 850mg',
      indicacao: 'Diabetes tipo 2',
      dataRetirada: '2026-03-01',
      farmaciaName: 'Drogasil – Tambaú',
      farmaciaCnes: '2537934',
      quantidade: 30,
    },
    {
      id: 'd-3',
      medicamento: 'AAS 100mg',
      indicacao: 'Prevenção cardiovascular',
      dataRetirada: '2026-02-04',
      farmaciaName: 'Drogasil – Tambaú',
      farmaciaCnes: '2537934',
      quantidade: 30,
    },
    {
      id: 'd-4',
      medicamento: 'Atorvastatina 20mg',
      indicacao: 'Dislipidemia',
      dataRetirada: '2026-02-04',
      farmaciaName: 'Drogasil – Tambaú',
      farmaciaCnes: '2537934',
      quantidade: 30,
    },
  ],
};

const DEP1_DATA: GovBrUser = {
  name: 'João Ferreira',
  cpfMasked: '***.***.456-**',
  cns: '7 0542 1087 5678 9',
  cep: '58039-000',
  city: 'João Pessoa',
  state: 'PB',
  condicoes: ['Asma leve persistente'],
  dispensacoes: [
    {
      id: 'd1-1',
      medicamento: 'Budesonida 200mcg (inalador)',
      indicacao: 'Asma',
      dataRetirada: '2026-02-22',
      farmaciaName: 'UBS Tambaú',
      farmaciaCnes: '2537111',
      quantidade: 1,
    },
    {
      id: 'd1-2',
      medicamento: 'Salbutamol 100mcg (spray)',
      indicacao: 'Asma — resgate',
      dataRetirada: '2026-01-18',
      farmaciaName: 'UBS Tambaú',
      farmaciaCnes: '2537111',
      quantidade: 1,
    },
  ],
};

const DEP2_DATA: GovBrUser = {
  name: 'Helena Ferreira',
  cpfMasked: '***.***.789-**',
  cns: '7 0542 1087 9012 3',
  cep: '58039-000',
  city: 'João Pessoa',
  state: 'PB',
  condicoes: ['Anemia ferropriva'],
  dispensacoes: [
    {
      id: 'd2-1',
      medicamento: 'Sulfato ferroso 40mg',
      indicacao: 'Anemia',
      dataRetirada: '2026-03-10',
      farmaciaName: 'UBS Tambaú',
      farmaciaCnes: '2537111',
      quantidade: 60,
    },
  ],
};
// ── FIM MOCK DATA ──────────────────────────────────────────────────────────

export const GOVBR_PROFILES: GovBrProfile[] = [
  {
    id: 'titular',
    name: 'Maria Ferreira',
    relation: 'Titular',
    avatar:
      'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F16c0a867110f4acdb55cbc0e28831f6d?format=webp&width=800&height=1200',
    data: TITULAR_DATA,
  },
  {
    id: 'dependente1',
    name: 'João Ferreira',
    relation: 'Dependente',
    avatar: 'https://images.pexels.com/photos/33617003/pexels-photo-33617003.jpeg?auto=compress&cs=tinysrgb&w=800',
    data: DEP1_DATA,
  },
  {
    id: 'dependente2',
    name: 'Helena Ferreira',
    relation: 'Dependente',
    avatar: 'https://images.pexels.com/photos/10044874/pexels-photo-10044874.jpeg?auto=compress&cs=tinysrgb&w=800',
    data: DEP2_DATA,
  },
];
