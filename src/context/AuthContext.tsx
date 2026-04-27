import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GOVBR_PROFILES } from '../data/govBrProfiles';

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
  activeProfileId: string;
  switchProfile: (profileId: string) => void;
  loginMock: () => void;
  connectGovBrMock: () => void;
  disconnectGovBr: () => void;
  logout: () => void;
  publishActiveFeature: (feature: string | null) => Promise<void>;
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

export function AuthProvider({ children, sessionCode }: { children: ReactNode; sessionCode: string }) {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [govBrUser, setGovBrUser] = useState<GovBrUser | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string>('titular');

  const loginMock = useCallback(() => {
    setAppUser(MOCK_APP_USER);
  }, []);

  const switchProfile = useCallback((profileId: string) => {
    const profile = GOVBR_PROFILES.find((p) => p.id === profileId);
    if (!profile) return;
    setGovBrUser(profile.data);
    setActiveProfileId(profile.id);
  }, []);

  const connectGovBrMock = useCallback(async () => {
    setGovBrUser(MOCK_GOVBR_USER);
    setActiveProfileId('titular');
    if (sessionCode) {
      await updateDoc(doc(db, 'sessions', sessionCode), {
        govBrConnected: true,
        govBrUserName: MOCK_GOVBR_USER.name,
        govBrConnectedAt: new Date().toISOString(),
      }).catch((error) => {
        // Non-critical: second screen synchronization failed
        console.warn('[AuthContext] Failed to sync GovBr connection:', error?.code || error?.message);
      });
    }
  }, [sessionCode]);

  const disconnectGovBr = useCallback(async () => {
    setGovBrUser(null);
    if (sessionCode) {
      await updateDoc(doc(db, 'sessions', sessionCode), {
        govBrConnected: false,
        govBrUserName: null,
      }).catch((error) => {
        // Non-critical: second screen synchronization failed
        console.warn('[AuthContext] Failed to sync GovBr disconnection:', error?.code || error?.message);
      });
    }
  }, [sessionCode]);

  const publishActiveFeature = useCallback(async (feature: string | null) => {
    const code = sessionCode || (appUser?.sessionCode ?? null);
    if (!code) return;
    try {
      await updateDoc(doc(db, 'sessions', code), { activeFeature: feature });
    } catch (err) {
      console.warn('[AuthContext] Firestore activeFeature update falhou:', err);
    }
  }, [sessionCode, appUser]);

  const logout = useCallback(() => {
    setAppUser(null);
    setGovBrUser(null);
    setActiveProfileId('titular');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        appUser,
        govBrUser,
        isLoggedIn: appUser !== null,
        isGovBrConnected: govBrUser !== null,
        activeProfileId,
        switchProfile,
        loginMock,
        connectGovBrMock,
        disconnectGovBr,
        logout,
        publishActiveFeature,
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
