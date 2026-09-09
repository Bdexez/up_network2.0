import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  api,
  clearSession,
  getRefreshToken,
  getToken,
  setSession,
  UNAUTHORIZED_EVENT,
} from '../lib/api';
import type { Profile, Session } from '../lib/types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companyCode?: string;
}

interface AuthValue {
  user: Profile | null;
  /** true tant que la session enregistrée n'a pas été vérifiée auprès de l'API. */
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  switchCompany: (companyId: number) => Promise<void>;
  refresh: () => Promise<void>;
  can: (permission: string) => boolean;
  canAny: (...permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  /** Ferme la session localement : jetons effacés, cache vidé. */
  const endSession = useCallback(() => {
    clearSession();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  // Réhydrate la session au chargement : le jeton seul ne prouve rien,
  // on redemande le profil à l'API.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get<Profile>('/auth/me');
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) endSession();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, [endSession]);

  // Un 401 sur n'importe quelle requête met fin à la session.
  useEffect(() => {
    const handler = () => {
      setUser(null);
      queryClient.clear();
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, [queryClient]);

  const applySession = useCallback(
    (session: Session) => {
      setSession(session.accessToken, session.refreshToken);
      setUser(session.user);
      queryClient.clear();
    },
    [queryClient],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await api.post<Session>('/auth/login', payload);
      applySession(data);
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      // Le back refuse les champs inconnus : on n'envoie que ceux renseignés.
      const body = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
      );
      const { data } = await api.post<Session>('/auth/register', body);
      applySession(data);
    },
    [applySession],
  );

  const switchCompany = useCallback(
    async (companyId: number) => {
      const { data } = await api.post<Session>('/auth/switch-company', { companyId });
      applySession(data);
    },
    [applySession],
  );

  const refresh = useCallback(async () => {
    const { data } = await api.get<Profile>('/auth/me');
    setUser(data);
  }, []);

  const value = useMemo<AuthValue>(() => {
    const permissions = new Set(user?.permissions ?? []);
    return {
      user,
      loading,
      login,
      register,
      logout: async () => {
        const refreshToken = getRefreshToken();
        // On révoque côté serveur, mais on ferme la session localement quoi
        // qu'il arrive : l'utilisateur ne doit pas rester connecté si l'API
        // est injoignable.
        if (refreshToken) {
          await api.post('/auth/logout', { refreshToken }).catch(() => undefined);
        }
        endSession();
      },
      switchCompany,
      refresh,
      can: (permission) => permissions.has(permission),
      canAny: (...list) => list.some((permission) => permissions.has(permission)),
    };
  }, [user, loading, login, register, endSession, switchCompany, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
}
