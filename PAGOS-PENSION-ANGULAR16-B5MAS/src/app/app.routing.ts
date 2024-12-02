import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { DashboardComponent } from './components/dashboard/dashboard.component';

import { LoginComponent } from './components/user/login/login.component';
import { RegistroComponent } from './components/user/registro/registro.component';
import { IndexStudentsComponent } from './components/students/index-students/index-students.component';
import { IndexDocumentComponent } from './components/document/index-document/index-document.component';

import { AuthGuard } from '../app/guards/auth.guard';

import { SchoolYearConfigComponent } from './components/config/school-year-config/school-year-config.component';
import { IndexPaymentsComponent } from './components/payments/index-payments/index-payments.component';
import { CreatePaymentsComponent } from './components/payments/create-payments/create-payments.component';
import { ShowPaymentsComponent } from './components/payments/show-payments/show-payments.component';

import { EditStudentsComponent } from './components/students/edit-students/edit-students.component';

import { DetailStudentsComponent } from './components/students/detail-students/detail-students.component';
import { CreateStudentsComponent } from './components/students/create-students/create-students.component';

import { IndexAdminsComponent } from './components/admins/index-admins/index-admins.component';
import { EditAdminsComponent } from './components/admins/edit-admins/edit-admins.component';
import { CreateAdminsComponent } from './components/admins/create-admins/create-admins.component';

import { ForgotPasswordComponent } from './components/user/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './components/user/new-password/new-password.component';
import { PanelAdminComponent } from './components/panel-admin/panel-admin.component';

import { DischargeComponent } from './components/financier/discharge/discharge.component';
import { SupplierComponent } from './components/financier/supplier/supplier.component';
import { BillingComponent } from './components/config/billing/billing.component';

import { ReporPensionComponent } from './components/dashboard/stundes-payments/repor-pension/repor-pension.component';

const appRoute: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'reporte/:id',
    component: ReporPensionComponent,
    canActivate: [AuthGuard],
  },
  { path: 'control', component: PanelAdminComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },

  //{ path: 'registrate', component: RegistroComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'new-password/:id',
    component: NewPasswordComponent,
  },
  {
    path: 'estudiantes',
    component: IndexStudentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'estudiantes/create',
    component: CreateStudentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'estudiantes/edit/:id',
    component: EditStudentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'estudiantes/detalle/:id',
    component: DetailStudentsComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'administrativo',
    component: IndexAdminsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'administrativo/create',
    component: CreateAdminsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'administrativo/edit/:id',
    component: EditAdminsComponent,
    canActivate: [AuthGuard],
  },

  //{ path: 'egresos', component: DischargeComponent, canActivate: [AuthGuard] },
  //{ path: 'proveedores', component: SupplierComponent, canActivate: [AuthGuard] },

  {
    path: 'documentos',
    component: IndexDocumentComponent,
    canActivate: [AuthGuard],
  },
  //{path: 'documentos/create', component: CreateDocumentoComponent, canActivate:[AuthGuard]},
  //{path: 'documentos/edit/:id', component: EditDocumentoComponent, canActivate:[AuthGuard]},

  {
    path: 'pagos',
    component: IndexPaymentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'pagos/create',
    component: CreatePaymentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'pagos/:id',
    component: ShowPaymentsComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'configuraciones',
    component: SchoolYearConfigComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'facturacion',
    component: BillingComponent,
    canActivate: [AuthGuard],
  },

  /* {path: '**', component: NotFoundComponent}, */
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoute);
