import { ProjectStatus, TaskStatus } from '@prisma/client';
import type { TransitionMap } from 'src/common/documents/workflow';

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'En cours',
  ON_HOLD: 'En pause',
  CLOSED: 'Clôturé',
};

/** Un projet clôturé peut être rouvert : les avenants existent. */
export const PROJECT_TRANSITIONS: TransitionMap<ProjectStatus> = {
  DRAFT: [ProjectStatus.ACTIVE],
  ACTIVE: [ProjectStatus.ON_HOLD, ProjectStatus.CLOSED],
  ON_HOLD: [ProjectStatus.ACTIVE, ProjectStatus.CLOSED],
  CLOSED: [ProjectStatus.ACTIVE],
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminée',
  CANCELLED: 'Annulée',
};
