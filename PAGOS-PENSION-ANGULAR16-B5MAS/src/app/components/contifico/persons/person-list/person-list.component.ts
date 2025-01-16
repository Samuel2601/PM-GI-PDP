import { Component } from '@angular/core';
import { Person } from '../models/person.model';
import { PersonService } from 'src/app/service/confitico/person.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.scss'],
})
export class PersonListComponent {
  persons: Person[] = [];

  constructor(private personService: PersonService, private router: Router) {}

  ngOnInit(): void {
    console.log('ngOnInit');
    this.loadPersons();
  }

  loadPersons(): void {
    this.personService.getPersons().subscribe({
      next: (data) => {
        this.persons = data;
        console.log('Persons loaded:', this.persons);
      },
      error: (error) => console.error('Error loading persons:', error),
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/personas/create']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/personas/edit', id]);
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/personas/detail', id]);
  }
}
