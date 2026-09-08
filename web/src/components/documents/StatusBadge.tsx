import { Badge } from '../ui/Surface';
import type { StatusFlow } from '../../lib/documents';

/** Badge piloté par le cycle de vie du document : libellé et teinte au même endroit. */
export function StatusBadge<S extends string>({
  status,
  flow,
}: {
  status: S;
  flow: StatusFlow<S>;
}) {
  const meta = flow.meta[status];
  return <Badge tone={meta?.tone ?? 'neutral'}>{meta?.label ?? status}</Badge>;
}
