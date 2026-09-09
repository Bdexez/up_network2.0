import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'upnet.token';
const REFRESH_KEY = 'upnet.refresh';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

/** Client sans intercepteur : sert à rafraîchir sans boucler sur soi-même. */
const bare = axios.create({ baseURL: api.defaults.baseURL });

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* navigation privée : la session reste en mémoire */
  }
}

export const getToken = () => read(TOKEN_KEY);
export const getRefreshToken = () => read(REFRESH_KEY);

export function setSession(accessToken: string | null, refreshToken?: string | null) {
  write(TOKEN_KEY, accessToken);
  if (refreshToken !== undefined) write(REFRESH_KEY, refreshToken);
}

export function clearSession() {
  write(TOKEN_KEY, null);
  write(REFRESH_KEY, null);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Diffusé quand la session est définitivement perdue. */
export const UNAUTHORIZED_EVENT = 'upnet:unauthorized';

/**
 * Un seul rafraîchissement à la fois : si trois requêtes échouent ensemble,
 * elles attendent le même échange plutôt que d'en déclencher trois — la
 * rotation invaliderait alors les deux autres et fermerait la session.
 */
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await bare.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    );
    setSession(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearSession();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;
    const url = config?.url ?? '';

    // Sur l'écran de connexion, l'erreur s'affiche telle quelle.
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/refresh');

    if (status === 401 && config && !config._retried && !isAuthRoute) {
      config._retried = true;

      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });
      const token = await refreshing;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return api.request(config);
      }

      clearSession();
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  },
);

/** Extrait un message lisible d'une erreur Axios (Nest renvoie parfois un tableau). */
export function errorMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (typeof data?.message === 'string') return data.message;
    if (error.code === 'ERR_NETWORK') {
      return "Impossible de joindre l'API. Vérifiez qu'elle tourne sur " + api.defaults.baseURL;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
