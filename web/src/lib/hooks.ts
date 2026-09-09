import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api, errorMessage } from './api';
import { useToast } from '../components/ui/Toast';
import type { Paginated } from './types';

/**
 * Liste non paginée : réservée aux endpoints qui renvoient un tableau brut
 * (`/…/options`, entrepôts, rôles). Pour une liste paginée, voir `usePage`.
 */
export function useList<T>(key: QueryKey, path: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: params ? [...key, params] : key,
    queryFn: async () => (await api.get<T[]>(path, { params })).data,
  });
}

/**
 * Liste paginée. Renvoie l'enveloppe complète ; `items` est un tableau vide
 * tant que la première page n'est pas chargée, ce qui évite les gardes
 * `?? []` dans chaque écran.
 */
export function usePage<T>(
  key: QueryKey,
  path: string,
  params: Record<string, unknown> = {},
) {
  const query = useQuery({
    queryKey: [...key, params],
    queryFn: async () => (await api.get<Paginated<T>>(path, { params })).data,
    // La page précédente reste affichée pendant le chargement de la suivante :
    // le tableau ne clignote pas à chaque changement de page.
    placeholderData: (previous) => previous,
  });

  return {
    ...query,
    items: query.data?.items ?? [],
    page: query.data?.page ?? 1,
    totalPages: query.data?.totalPages ?? 1,
    total: query.data?.total ?? 0,
  };
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

/**
 * État de pagination d'un écran. `reset` est à appeler quand un filtre change :
 * rester en page 4 après avoir filtré donnerait une liste vide.
 */
export function usePagination(perPage = 25) {
  const [page, setPage] = useState(1);
  return {
    page,
    perPage,
    setPage,
    reset: () => setPage(1),
    params: { page, perPage },
  };
}
