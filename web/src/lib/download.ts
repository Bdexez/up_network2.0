import { useState } from 'react';
import { api, errorMessage } from './api';
import { useToast } from '../components/ui/Toast';

/**
 * Télécharge un fichier servi par une route protégée.
 *
 * Un simple lien ne conviendrait pas : il ne porterait pas l'en-tête
 * Authorization. On récupère donc le blob, puis on déclenche l'enregistrement.
 */
export function useFileDownload() {
  const { notify } = useToast();
  const [pendingId, setPendingId] = useState<string | number | null>(null);

  const download = async (url: string, fileName: string, id: string | number = url) => {
    setPendingId(id);
    try {
      const response = await api.get<Blob>(url, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(response.data);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      notify(errorMessage(error, 'Téléchargement impossible'), 'error');
    } finally {
      setPendingId(null);
    }
  };

  return { download, pendingId };
}
