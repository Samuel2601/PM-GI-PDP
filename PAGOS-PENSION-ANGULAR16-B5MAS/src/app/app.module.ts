import { LOCALE_ID, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';

import { IndexStudentsComponent } from './components/students/index-students/index-students.component';
import { CreateStudentsComponent } from './components/students/create-students/create-students.component';
import { EditStudentsComponent } from './components/students/edit-students/edit-students.component';
import { CreateAdminsComponent } from './components/admins/create-admins/create-admins.component';
import { EditAdminsComponent } from './components/admins/edit-admins/edit-admins.component';
import { IndexAdminsComponent } from './components/admins/index-admins/index-admins.component';
import { IndexPaymentsComponent } from './components/payments/index-payments/index-payments.component';
import { ShowPaymentsComponent } from './components/payments/show-payments/show-payments.component';
import { CreatePaymentsComponent } from './components/payments/create-payments/create-payments.component';
import { LoginComponent } from './components/user/login/login.component';
import { ForgotPasswordComponent } from './components/user/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './components/user/new-password/new-password.component';
import { RegistroComponent } from './components/user/registro/registro.component';
import { SidebarLogComponent } from './components/user/sidebar-log/sidebar-log.component';
import { SidebarComponent } from './components/menu/sidebar/sidebar.component';
import { TopnavComponent } from './components/menu/topnav/topnav.component';
import { StundesPaymentsComponent } from './components/dashboard/stundes-payments/stundes-payments.component';
import { SalesAnualComponent } from './components/dashboard/sales-anual/sales-anual.component';
import { ControlDocumentComponent } from './components/dashboard/control-document/control-document.component';
import { ControlAdminsComponent } from './components/dashboard/control-admins/control-admins.component';
import { PanelAdminComponent } from './components/panel-admin/panel-admin.component';
import { SchoolYearConfigComponent } from './components/config/school-year-config/school-year-config.component';
import { BillingComponent } from './components/config/billing/billing.component';
import { SupplierComponent } from './components/financier/supplier/supplier.component';
import { DischargeComponent } from './components/financier/discharge/discharge.component';
import { LinkHeaderComponent } from './components/helpers/link-header/link-header.component';
import { IndexDocumentComponent } from './components/document/index-document/index-document.component';
import { DetailStudentsComponent } from './components/students/detail-students/detail-students.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
  NgbModule,
  NgbPaginationModule,
  NgbDropdown,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxTinymceModule } from 'ngx-tinymce';

import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import localeES from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { MenuDashboardComponent } from './components/dashboard/menu-dashboard/menu-dashboard.component';

registerLocaleData(localeES, 'es');
import { NgxFileDropModule } from 'ngx-file-drop';
import './polyfills/polyfills';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GraficSpComponent } from './components/dashboard/stundes-payments/grafic-sp/grafic-sp.component';
import { ReporPensionComponent } from './components/dashboard/stundes-payments/repor-pension/repor-pension.component';

import { EditorModule } from '@tinymce/tinymce-angular';
import { PersonsModule } from './components/contifico/persons/persons.module';

@NgModule({
  declarations: [
    AppComponent,
    IndexStudentsComponent,
    CreateStudentsComponent,
    EditStudentsComponent,
    CreateAdminsComponent,
    EditAdminsComponent,
    IndexAdminsComponent,
    IndexPaymentsComponent,
    ShowPaymentsComponent,
    CreatePaymentsComponent,
    LoginComponent,
    ForgotPasswordComponent,
    NewPasswordComponent,
    RegistroComponent,
    SidebarLogComponent,
    SidebarComponent,
    TopnavComponent,
    StundesPaymentsComponent,
    SalesAnualComponent,
    ControlDocumentComponent,
    ControlAdminsComponent,
    PanelAdminComponent,
    SchoolYearConfigComponent,
    BillingComponent,
    SupplierComponent,
    DischargeComponent,
    LinkHeaderComponent,
    IndexDocumentComponent,
    DetailStudentsComponent,
    MenuDashboardComponent,
    DashboardComponent,
    GraficSpComponent,
    ReporPensionComponent,
  ],
  imports: [
    EditorModule,
    NgxFileDropModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    NgbPaginationModule,
    NgxTinymceModule.forRoot({
      //baseURL: './assets/tinymce/',
      // or cdn
      baseURL: '//cdnjs.cloudflare.com/ajax/libs/tinymce/5.7.1/',
    }),
    CommonModule,
    NgbDropdown,
    PersonsModule,
    ReactiveFormsModule,
  ],
  exports: [],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
