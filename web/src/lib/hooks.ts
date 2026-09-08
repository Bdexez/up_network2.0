import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api, errorMessage } from './api';
import { useToast } from '../components/ui/Toast';

/** Liste générique : GET sur `path` avec des paramètres optionnels. */
export function useList<T>(key: QueryKey, path: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: params ? [...key, params] : key,
    queryFn: async () => (await api.get<T[]>(path, { params })).data,
  });
}

/**
 * Mutation d'écriture : invalide les clés fournies, notifie, remonte l'erreur
 * lisible plutôt que l'objet Axios brut.
 */
export function useWrite<TVariables, TData = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: { invalidate: QueryKey[]; success?: string },
) {
  const queryClient = useQueryClient();
  const { notify } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      for (const key of options.invalidate) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
      if (options.success) notify(options.success);
    },
    onError: (error) => notify(errorMessage(error), 'error'),
  });
}

/** Valeur retardée, pour ne pas requêter à chaque frappe dans une recherche. */
export function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
