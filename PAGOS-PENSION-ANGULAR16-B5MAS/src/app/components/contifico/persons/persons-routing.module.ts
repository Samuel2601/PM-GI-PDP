// persons/persons-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonListComponent } from './person-list/person-list.component';
import { PersonFormComponent } from './person-form/person-form.component';
import { PersonDetailComponent } from './person-detail/person-detail.component';

const routes: Routes = [
  {
    path: '',
    component: PersonListComponent,
  },
  {
    path: 'crear',
    component: PersonFormComponent,
  },
  {
    path: 'editar/:id',
    component: PersonFormComponent,
  },
  {
    path: 'detalle/:id',
    component: PersonDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonsRoutingModule {}
