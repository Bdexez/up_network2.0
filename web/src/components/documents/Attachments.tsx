import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Paperclip, Trash2, Upload } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useWrite } from '../../lib/hooks';
import { useFileDownload } from '../../lib/download';
import { formatDateTime } from '../../lib/format';
import { P } from '../../lib/permissions';
import type { Attachment, AttachmentEntity } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { EmptyState, Spinner } from '../ui/Surface';

/**
 * Pièces jointes d'un objet. Volontairement autonome : la fiche tiers comme
 * les fiches de document l'intègrent telle quelle.
 */
export function Attachments({
  entity,
  entityId,
}: {
  entity: AttachmentEntity;
  entityId: number;
}) {
  const { can } = useAuth();
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const download = useFileDownload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const attachments = useQuery({
    queryKey: ['attachments', entity, entityId],
    queryFn: async () =>
      (
        await api.get<Attachment[]>('/attachments', {
          params: { entity, entityId },
        })
      ).data,
    enabled: can(P.attachmentsRead),
  });

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/attachments/${id}`)).data,
    { invalidate: [['attachments']], success: 'Pièce jointe supprimée' },
  );

  const upload = async (file: File) => {
    setUploading(true);
    try {
      // Le fichier voyage en multipart : on laisse le navigateur poser
      // lui-même le Content-Type avec sa frontière.
      const form = new FormData();
      form.append('file', file);
      form.append('entity', entity);
      form.append('entityId', String(entityId));

      await api.post('/attachments', form, {
        headers: { 'Content-Type': undefined },
      });

      await queryClient.invalidateQueries({ queryKey: ['attachments'] });
      notify('Pièce jointe ajoutée');
    } catch (error) {
      notify(errorMessage(error, 'Envoi impossible'), 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (!can(P.attachmentsRead)) return null;

  return (
    <section className="rounded-lg border border-line">
      <header className="flex items-center gap-2 border-b border-line px-3 py-2">
        <Paperclip size={15} className="text-ink-3" aria-hidden />
        <h3 className="text-[13px] font-semibold text-ink">Pièces jointes</h3>
        <span className="ml-auto text-xs text-ink-3">
          {attachments.data?.length ?? 0}
        </span>
        {can(P.attachmentsCreate) && (
          <>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            <Button
              size="sm"
              icon={<Upload size={13} />}
              loading={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Ajouter
            </Button>
          </>
        )}
      </header>

      {attachments.isLoading ? (
        <Spinner label="Chargement…" />
      ) : (attachments.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Aucun fichier"
          description="PDF, images, Word, Excel — 10 Mo maximum."
        />
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {attachments.data?.map((attachment) => (
            <li key={attachment.id} className="flex items-center gap-3 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-ink">{attachment.fileName}</p>
                <p className="text-[11px] text-ink-3">
                  {formatSize(attachment.size)} · {attachment.uploadedBy.username} ·{' '}
                  {formatDateTime(attachment.createdAt)}
                </p>
              </div>

              <Button
                size="sm"
                variant="ghost"
                aria-label={`Télécharger ${attachment.fileName}`}
                loading={download.pendingId === attachment.id}
                onClick={() =>
                  void download.download(
                    `/attachments/${attachment.id}/download`,
                    attachment.fileName,
                    attachment.id,
                  )
                }
                icon={<Download size={13} />}
              />

              {can(P.attachmentsDelete) && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Supprimer ${attachment.fileName}`}
                  onClick={() => remove.mutate(attachment.id)}
                  icon={<Trash2 size={13} />}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}
