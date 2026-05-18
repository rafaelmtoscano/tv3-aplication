// src/components/DemoAuthGate/index.tsx
//
// Proteção de acesso à demo via Firebase Auth (email + senha).
// Lista de usuários gerenciada via Firebase Console — não precisa deploy.
//
// IMPORTANTE: esta é proteção de UI, não de assets. Quem souber abrir
// DevTools vê o código-fonte. Suficiente para demo restrita a stakeholders;
// não substitui proteção de servidor para dados sensíveis.
//
// TODO: quando o projeto sair de demo, considerar:
//   - Migrar para Netlify Password Protection (Pro) ou Identity
//   - Combinar com Firestore Security Rules para proteger dados reais

import { useEffect, useState, type FormEvent } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { firebaseApp } from '../../lib/firebase';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const auth = getAuth(firebaseApp);

// Persiste a sessão entre reloads (até signOut explícito)
setPersistence(auth, browserLocalPersistence).catch(() => {
  /* fallback silencioso para sessão de aba */
});

interface DemoAuthGateProps {
  children: React.ReactNode;
}

type Status = 'checking' | 'signed-out' | 'signed-in';

export function DemoAuthGate({ children }: DemoAuthGateProps) {
  const [status, setStatus] = useState<Status>('checking');
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Listener de autenticação
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setStatus(u ? 'signed-in' : 'signed-out');
    });
    return unsub;
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged vai disparar e setar signed-in
    } catch (err) {
      // Mensagens genéricas para não vazar quem é cadastrado
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('E-mail ou senha incorretos.');
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente em alguns minutos.');
      } else if (code === 'auth/network-request-failed') {
        setError('Sem conexão. Verifique sua internet.');
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  }

  // Loading inicial (verificando localStorage / token)
  if (status === 'checking') {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle} />
      </div>
    );
  }

  // Autenticado → renderiza o app + botão discreto de logout no canto
  if (status === 'signed-in' && user) {
    return (
      <>
        {children}
        <button
          type="button"
          onClick={() => signOut(auth)}
          style={logoutButtonStyle}
          aria-label="Sair da demo"
          title={`Logado como ${user.email} — clique para sair`}
        >
          ⎋
        </button>
      </>
    );
  }

  // Não autenticado → tela de login
  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ ...typography.display.medium, color: colors.text.primaryInverse, margin: 0 }}>
          TV 3.0
        </h1>
        <p style={{ ...typography.body.medium, color: colors.text.secondaryInverse, marginTop: 16 }}>
          Acesso restrito à demo
        </p>
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          autoFocus
          autoComplete="email"
          aria-label="E-mail"
          placeholder="E-mail"
          required
          style={inputStyle(!!error)}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          autoComplete="current-password"
          aria-label="Senha"
          placeholder="Senha"
          required
          style={inputStyle(!!error)}
        />
        {error && (
          <span style={errorStyle} role="alert">
            {error}
          </span>
        )}
        <button type="submit" disabled={submitting} style={submitButtonStyle(submitting)}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────── styles ───────────────────────────

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: colors.background.baseInverse,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: 24,
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const loadingStyle: React.CSSProperties = {
  ...containerStyle,
};

const spinnerStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  border: `4px solid ${colors.line.dark}`,
  borderTopColor: colors.background.primary,
  borderRadius: '50%',
  animation: 'tv3-auth-spin 0.9s linear infinite',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
  maxWidth: 400,
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  ...typography.body.large,
  padding: '20px 24px',
  borderRadius: 12,
  border: hasError ? `2px solid #ff4d4f` : `2px solid ${colors.line.dark}`,
  backgroundColor: 'rgba(255,255,255,0.04)',
  color: colors.text.primaryInverse,
  outline: 'none',
});

const errorStyle: React.CSSProperties = {
  ...typography.body.small,
  color: '#ff4d4f',
  textAlign: 'center',
};

const submitButtonStyle = (submitting: boolean): React.CSSProperties => ({
  ...typography.body.large,
  padding: '20px 24px',
  borderRadius: 12,
  border: 'none',
  backgroundColor: colors.background.primary,
  color: colors.text.primary,
  cursor: submitting ? 'wait' : 'pointer',
  opacity: submitting ? 0.7 : 1,
  fontWeight: 600,
});

const logoutButtonStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 12,
  right: 12,
  width: 32,
  height: 32,
  borderRadius: '50%',
  border: 'none',
  backgroundColor: 'rgba(255,255,255,0.08)',
  color: colors.text.primaryInverse,
  cursor: 'pointer',
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  opacity: 0.3,
  transition: 'opacity 0.2s',
};

// Animação do spinner — inject CSS uma vez
if (typeof document !== 'undefined' && !document.getElementById('tv3-auth-keyframes')) {
  const style = document.createElement('style');
  style.id = 'tv3-auth-keyframes';
  style.textContent = `@keyframes tv3-auth-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}