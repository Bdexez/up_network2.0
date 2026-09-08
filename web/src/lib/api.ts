import axios, { AxiosError } from 'axios';

const TOKEN_KEY = 'upnet.token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* navigation privée : la session reste en mémoire */
  }
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Diffusé quand l'API renvoie 401 : l'AuthProvider déconnecte alors la session. */
export const UNAUTHORIZED_EVENT = 'upnet:unauthorized';

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    // On ne déconnecte pas sur l'écran de login : l'erreur y est affichée telle quelle.
    if (status === 401 && !url.includes('/auth/login')) {
      setToken(null);
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
