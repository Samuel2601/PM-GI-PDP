import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonListComponent } from './person-list/person-list.component';
import { PersonFormComponent } from './person-form/person-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PersonDetailComponent } from './person-detail/person-detail.component';
import { PersonsRoutingModule } from './persons-routing.module';

@NgModule({
  declarations: [
    PersonListComponent,
    PersonFormComponent,
    PersonDetailComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, PersonsRoutingModule],
  exports: [],
})
export class PersonsModule {}
