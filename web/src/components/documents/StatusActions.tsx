import { Button } from '../ui/Button';
import type { StatusFlow } from '../../lib/documents';

/**
 * Boutons de transition proposés pour le statut courant. Ils reflètent le
 * cycle de vie déclaré côté interface ; l'API revalide de son côté.
 */
export function StatusActions<S extends string>({
  status,
  flow,
  disabled,
  onChange,
}: {
  status: S;
  flow: StatusFlow<S>;
  disabled?: boolean;
  onChange: (next: S) => void;
}) {
  const next = flow.transitions[status] ?? [];
  if (next.length === 0) return null;

  return (
    <>
      {next.map((target) => (
        <Button
          key={target}
          size="sm"
          variant={flow.meta[target].tone === 'critical' ? 'danger' : 'secondary'}
          disabled={disabled}
          onClick={() => onChange(target)}
        >
          {transitionLabel(flow.meta[target].label)}
        </Button>
      ))}
    </>
  );
}

/** « Validé » → « Valider », etc. : un bouton porte un verbe. */
function transitionLabel(label: string) {
  const verbs: Record<string, string> = {
    Brouillon: 'Repasser en brouillon',
    Validé: 'Valider',
    Validée: 'Valider',
    Signé: 'Marquer signé',
    Refusé: 'Marquer refusé',
    Commandée: 'Passer commande',
    Impayée: 'Valider',
    Annulée: 'Annuler',
  };
  return verbs[label] ?? label;
}
