// Unit 9: Lazy Loading + Guards
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './features/auth/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Public routes
  { path: 'login', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },

  // Protected routes (Unit 9 Guards)
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'teams',
    loadChildren: () => import('./features/teams/teams.module').then(m => m.TeamsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'billing',
    loadChildren: () => import('./features/billing/billing.module').then(m => m.BillingModule),
    canActivate: [AuthGuard]
  },

  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
