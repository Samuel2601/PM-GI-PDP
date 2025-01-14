import { Component } from '@angular/core';
import { Person } from '../models/person.model';
import { PersonService } from 'src/app/service/confitico/person.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss'],
})
export class PersonDetailComponent {
  person!: Person;

  constructor(
    private personService: PersonService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadPerson(id);
  }

  loadPerson(id: string): void {
    this.personService.getPersonById(id).subscribe({
      next: (person) => (this.person = person),
      error: (error) => console.error('Error loading person:', error),
    });
  }

  getTipoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      N: 'Natural',
      J: 'Jurídica',
      I: 'Sin ID',
      P: 'Placa',
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  }

  navigateToEdit(): void {
    this.router.navigate(['/persons/edit', this.person.id]);
  }

  goBack(): void {
    this.router.navigate(['/persons']);
  }
}
