import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { RequireAuth, RequirePermission } from './auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { P } from './lib/permissions';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * Les écrans sont chargés à la demande : le tableau de bord n'a pas besoin
 * d'embarquer l'éditeur de lignes, le pipeline ou l'écran des rôles. Seules
 * la connexion et la coquille applicative sont dans le lot initial.
 */
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const PartnersPage = lazy(() =>
  import('./pages/PartnersPage').then((m) => ({ default: m.PartnersPage })),
);
const PartnerDetailPage = lazy(() =>
  import('./pages/PartnerDetailPage').then((m) => ({ default: m.PartnerDetailPage })),
);
const ProductsPage = lazy(() =>
  import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })),
);
const LeadsPage = lazy(() =>
  import('./pages/crm/LeadsPage').then((m) => ({ default: m.LeadsPage })),
);
const PipelinePage = lazy(() =>
  import('./pages/crm/PipelinePage').then((m) => ({ default: m.PipelinePage })),
);
const ActivitiesPage = lazy(() =>
  import('./pages/crm/ActivitiesPage').then((m) => ({ default: m.ActivitiesPage })),
);
const QuotesPage = lazy(() =>
  import('./pages/sales/QuotesPage').then((m) => ({ default: m.QuotesPage })),
);
const OrdersPage = lazy(() =>
  import('./pages/sales/OrdersPage').then((m) => ({ default: m.OrdersPage })),
);
const InvoicesPage = lazy(() =>
  import('./pages/sales/InvoicesPage').then((m) => ({ default: m.InvoicesPage })),
);
const PurchasesPage = lazy(() =>
  import('./pages/sales/PurchasesPage').then((m) => ({ default: m.PurchasesPage })),
);
const StockPage = lazy(() =>
  import('./pages/stock/StockPage').then((m) => ({ default: m.StockPage })),
);
const WarehousesPage = lazy(() =>
  import('./pages/stock/WarehousesPage').then((m) => ({ default: m.WarehousesPage })),
);
const UsersPage = lazy(() =>
  import('./pages/settings/UsersPage').then((m) => ({ default: m.UsersPage })),
);
const RolesPage = lazy(() =>
  import('./pages/settings/RolesPage').then((m) => ({ default: m.RolesPage })),
);
const CompanyPage = lazy(() =>
  import('./pages/settings/CompanyPage').then((m) => ({ default: m.CompanyPage })),
);
const ReportsPage = lazy(() =>
  import('./pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })),
);
const ProjectsPage = lazy(() =>
  import('./pages/projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
);
const ProjectDetailPage = lazy(() =>
  import('./pages/projects/ProjectDetailPage').then((m) => ({
    default: m.ProjectDetailPage,
  })),
);
const EmployeesPage = lazy(() =>
  import('./pages/hr/EmployeesPage').then((m) => ({ default: m.EmployeesPage })),
);
const LeavePage = lazy(() =>
  import('./pages/hr/LeavePage').then((m) => ({ default: m.LeavePage })),
);
const ExpensesPage = lazy(() =>
  import('./pages/hr/ExpensesPage').then((m) => ({ default: m.ExpensesPage })),
);

function PageFallback() {
  return (
    <div className="grid min-h-64 place-items-center">
      <Loader2 size={20} className="animate-spin text-ink-3" aria-label="Chargement" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route
          element={
            <Suspense fallback={<PageFallback />}>
              <AppLayout />
            </Suspense>
          }
        >
          <Route element={<RequirePermission permission={P.dashboard} />}>
            <Route index element={<DashboardPage />} />
          </Route>

          <Route element={<RequirePermission permission={P.leadsRead} />}>
            <Route path="crm/pistes" element={<LeadsPage />} />
          </Route>
          <Route element={<RequirePermission permission={P.opportunitiesRead} />}>
            <Route path="crm/pipeline" element={<PipelinePage />} />
          </Route>
          <Route element={<RequirePermission permission={P.activitiesRead} />}>
            <Route path="crm/activites" element={<ActivitiesPage />} />
          </Route>
          <Route element={<RequirePermission permission={P.partnersRead} />}>
            <Route path="clients" element={<PartnersPage />} />
            <Route path="clients/:id" element={<PartnerDetailPage />} />
          </Route>

          <Route element={<RequirePermission permission={P.quotesRead} />}>
            <Route path="devis" element={<QuotesPage />} />
          </Route>
          <Route element={<RequirePermission permission={P.ordersRead} />}>
            <Route path="commandes" element={<OrdersPage />} />
          </Route>
          <Route element={<RequirePermission permission={P.invoicesRead} />}>
            <Route path="factures" element={<InvoicesPage />} />
          </Route>

          <Route element={<RequirePermission permission={P.purchasesRead} />}>
            <Route path="achats" element={<PurchasesPage />} />
          </Route>
          <Route element={<RequirePermission permission={P.productsRead} />}>
            <Route path="produits" element={<ProductsPage />} />
          </Route>
          <Route element={<RequirePermission permission={P.stockRead} />}>
            <Route path="stock" element={<StockPage />} />
          </Route>
          <Route element={<RequirePermission permission={P.warehousesRead} />}>
            <Route path="entrepots" element={<WarehousesPage />} />
          </Route>

          <Route element={<RequirePermission permission={P.projectsRead} />}>
            <Route path="projets" element={<ProjectsPage />} />
            <Route path="projets/:id" element={<ProjectDetailPage />} />
          </Route>

          <Route element={<RequirePermission permission={P.employeesRead} />}>
            <Route path="rh/employes" element={<EmployeesPage />} />
          </Route>
          <Route element={<RequirePermission permission={P.leaveRead} />}>
            <Route path="rh/conges" element={<LeavePage />} />
          </Route>
          <Route element={<RequirePermission permission={P.expensesRead} />}>
            <Route path="rh/notes-de-frais" element={<ExpensesPage />} />
          </Route>

          <Route element={<RequirePermission permission={P.reportsRead} />}>
            <Route path="etats" element={<ReportsPage />} />
          </Route>

          <Route element={<RequirePermission permission={P.usersRead} />}>
            <Route path="reglages/utilisateurs" element={<UsersPage />} />
          </Route>
          <Route element={<RequirePermission permission={P.rolesRead} />}>
            <Route path="reglages/roles" element={<RolesPage />} />
          </Route>
          <Route element={<RequirePermission permission={P.companyRead} />}>
            <Route path="reglages/societe" element={<CompanyPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
