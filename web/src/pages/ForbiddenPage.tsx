import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Card, EmptyState } from '../components/ui/Surface';

export function ForbiddenPage() {
  const { user } = useAuth();

  return (
    <Card>
      <EmptyState
        icon={<ShieldAlert size={28} />}
        title="Accès refusé"
        description={
          user?.role
            ? `Votre rôle « ${user.role.name} » ne donne pas accès à cette page. Demandez à un administrateur d'élargir vos permissions.`
            : "Aucun rôle ne vous est attribué dans cette société. Un administrateur doit vous en assigner un avant que vous puissiez accéder aux données."
        }
      />
    </Card>
  );
}
