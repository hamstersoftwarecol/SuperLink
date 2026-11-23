import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';

import { DashboardLayoutComponent } from './features/dashboard/layout/dashboard-layout.component';
import { OverviewComponent } from './features/dashboard/overview/overview.component';
import { OrderListComponent } from './features/dashboard/orders/order-list/order-list.component';
import { OrderDetailComponent } from './features/dashboard/orders/order-detail/order-detail.component';
import { ProductListComponent } from './features/dashboard/products/product-list/product-list.component';
import { ProductFormComponent } from './features/dashboard/products/product-form/product-form.component';
import { CustomerListComponent } from './features/dashboard/customers/customer-list/customer-list.component';
import { AnalyticsComponent } from './features/dashboard/analytics/analytics.component';

import { UserListComponent } from './features/admin/users/user-list/user-list.component';
import { UserFormComponent } from './features/admin/users/user-form/user-form.component';
import { RoleManagerComponent } from './features/admin/roles/role-manager.component';
import { SettingsComponent } from './features/admin/settings/settings.component';

import { ProductPageComponent } from './features/public/product-page/product-page.component';
import { OrderSuccessComponent } from './features/public/order-success/order-success.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Public product pages (no auth)
  { path: 't/:tenantSlug/:productSlug', component: ProductPageComponent },
  { path: 't/:tenantSlug/:productSlug/gracias', component: OrderSuccessComponent },

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'orders', component: OrderListComponent },
      { path: 'orders/:id', component: OrderDetailComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'products/new', component: ProductFormComponent },
      { path: 'products/:id/edit', component: ProductFormComponent },
      { path: 'customers', component: CustomerListComponent },
      { path: 'analytics', component: AnalyticsComponent },
    ]
  },
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'super_admin'] },
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UserListComponent },
      { path: 'users/:id', component: UserFormComponent },
      { path: 'roles', component: RoleManagerComponent },
      { path: 'settings', component: SettingsComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
