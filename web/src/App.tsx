import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth, RequirePermission } from './auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { P } from './lib/permissions';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PartnersPage } from './pages/PartnersPage';
import { ProductsPage } from './pages/ProductsPage';
import { QuotesPage } from './pages/sales/QuotesPage';
import { OrdersPage } from './pages/sales/OrdersPage';
import { InvoicesPage } from './pages/sales/InvoicesPage';
import { PurchasesPage } from './pages/sales/PurchasesPage';
import { StockPage } from './pages/stock/StockPage';
import { WarehousesPage } from './pages/stock/WarehousesPage';
import { LeadsPage } from './pages/crm/LeadsPage';
import { PipelinePage } from './pages/crm/PipelinePage';
import { ActivitiesPage } from './pages/crm/ActivitiesPage';
import { UsersPage } from './pages/settings/UsersPage';
import { RolesPage } from './pages/settings/RolesPage';
import { CompanyPage } from './pages/settings/CompanyPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
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
