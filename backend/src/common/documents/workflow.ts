import { BadRequestException } from '@nestjs/common';

/**
 * Transitions autorisées entre statuts, déclarées une fois par type de document.
 * Un statut absent de la table est terminal.
 */
export type TransitionMap<S extends string> = Partial<Record<S, S[]>>;

export function assertTransition<S extends string>(
  current: S,
  next: S,
  transitions: TransitionMap<S>,
  labels: Record<S, string>,
): void {
  if (current === next) return;

  const allowed = transitions[current] ?? [];
  if (!allowed.includes(next)) {
    const from = labels[current] ?? current;
    const to = labels[next] ?? next;
    const options = allowed.length
      ? allowed.map((status) => labels[status] ?? status).join(', ')
      : 'aucun';
    throw new BadRequestException(
      `Transition impossible : « ${from} » → « ${to} ». Suites possibles : ${options}.`,
    );
  }
}

/** Un document figé ne doit plus voir ses lignes ou ses montants changer. */
export function assertEditable<S extends string>(
  current: S,
  editableStatuses: readonly S[],
  labels: Record<S, string>,
): void {
  if (!editableStatuses.includes(current)) {
    throw new BadRequestException(
      `Document au statut « ${labels[current] ?? current} » : il n'est plus modifiable.`,
    );
  }
}
