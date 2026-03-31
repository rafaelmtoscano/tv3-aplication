import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { doc, updateDoc } from 'firebase/firestore';

// TODO: importar instância do Firestore quando Firebase estiver configurado no projeto
// import { db } from '../lib/firebase';

export interface Dispensacao {
  id: string;
  medicamento: string;
  indicacao: string;
  dataRetirada: string;
  farmaciaName: string;
  farmaciaCnes: string;
  quantidade: number;
}

export interface GovBrUser {
  // Dados reais retornados pelo gov.br OAuth (nível Prata)
  // TODO: substituir por chamada real ao endpoint gov.br
  name: string;
  cpfMasked: string;
  cns: string;
  cep: string;
  city: string;
  state: string;
  // Dados HÓRUS — histórico de dispensações do Farmácia Popular por CPF
  // TODO: substituir por GET /horus/dispensacoes?cpf={cpf} via DATASUS
  dispensacoes: Dispensacao[];
  condicoes: string[];
}

export interface AppUser {
  id: string;
  sessionCode: string | null;
}

interface AuthContextValue {
  appUser: AppUser | null;
  govBrUser: GovBrUser | null;
  isLoggedIn: boolean;
  isGovBrConnected: boolean;
  loginMock: () => void;
  connectGovBrMock: () => void;
  disconnectGovBr: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── MOCK DATA ──────────────────────────────────────────────────────────────
// TODO: substituir por chamada real à API gov.br OAuth + CADSUS + HÓRUS
const MOCK_GOVBR_USER: GovBrUser = {
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

const MOCK_APP_USER: AppUser = {
  id: 'user-mock-001',
  sessionCode: 'TV42',
};
// ── FIM MOCK DATA ──────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [govBrUser, setGovBrUser] = useState<GovBrUser | null>(null);

  const loginMock = useCallback(() => {
    setAppUser(MOCK_APP_USER);
  }, []);

  const connectGovBrMock = useCallback(async () => {
    setGovBrUser(MOCK_GOVBR_USER);
    // Publica no Firestore para que a segunda tela saiba que gov.br foi autenticado
    // A segunda tela escuta sessions/{sessionCode} via onSnapshot
    // TODO: descomentar quando Firebase estiver configurado
    // if (MOCK_APP_USER.sessionCode) {
    //   await updateDoc(doc(db, 'sessions', MOCK_APP_USER.sessionCode), {
    //     govBrConnected: true,
    //     govBrUserName: MOCK_GOVBR_USER.name,
    //     govBrConnectedAt: new Date().toISOString(),
    //   });
    // }
  }, []);

  const disconnectGovBr = useCallback(async () => {
    setGovBrUser(null);
    // TODO: descomentar quando Firebase estiver configurado
    // if (appUser?.sessionCode) {
    //   await updateDoc(doc(db, 'sessions', appUser.sessionCode), {
    //     govBrConnected: false,
    //     govBrUserName: null,
    //   });
    // }
  }, []);

  const logout = useCallback(() => {
    setAppUser(null);
    setGovBrUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        appUser,
        govBrUser,
        isLoggedIn: appUser !== null,
        isGovBrConnected: govBrUser !== null,
        loginMock,
        connectGovBrMock,
        disconnectGovBr,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
