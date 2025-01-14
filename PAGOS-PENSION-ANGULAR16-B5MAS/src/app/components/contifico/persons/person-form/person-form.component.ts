import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonService } from 'src/app/service/confitico/person.service';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss'],
})
export class PersonFormComponent {
  personForm!: FormGroup;
  isEditing = false;
  personId!: string;

  constructor(
    private fb: FormBuilder,
    private personService: PersonService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.personId = this.route.snapshot.params['id'];
    if (this.personId) {
      this.isEditing = true;
      this.loadPerson();
    }
  }

  createForm(): void {
    this.personForm = this.fb.group({
      tipo: ['N', Validators.required],
      razon_social: ['', Validators.required],
      nombre_comercial: [''],
      cedula: ['', Validators.required],
      email: ['', [Validators.email]],
      telefonos: [''],
      direccion: [''],
      es_cliente: [false],
      es_proveedor: [false],
      es_vendedor: [false],
      es_empleado: [false],
      es_extranjero: [false],
    });
  }

  loadPerson(): void {
    this.personService.getPersonById(this.personId).subscribe({
      next: (person) => {
        this.personForm.patchValue(person);
      },
      error: (error) => console.error('Error loading person:', error),
    });
  }

  onSubmit(): void {
    if (this.personForm.valid) {
      const personData = this.personForm.value;

      if (this.isEditing) {
        personData.id = this.personId;
        this.personService.updatePerson(personData).subscribe({
          next: () => this.goBack(),
          error: (error) => console.error('Error updating person:', error),
        });
      } else {
        this.personService.createPerson(personData).subscribe({
          next: () => this.goBack(),
          error: (error) => console.error('Error creating person:', error),
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/persons']);
  }
}
