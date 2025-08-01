import { type Person, type InsertPerson } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllPeople(): Promise<Person[]>;
  getPerson(id: string): Promise<Person | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: string, person: Partial<InsertPerson>): Promise<Person | undefined>;
  deletePerson(id: string): Promise<boolean>;
  importPeople(people: InsertPerson[]): Promise<Person[]>;
}

export class MemStorage implements IStorage {
  private people: Map<string, Person>;

  constructor() {
    this.people = new Map();
    this.seedInitialData();
  }

  private seedInitialData() {
    // Import the CSV data as initial data
    const initialPeople: InsertPerson[] = [
      { firstName: "Robert", lastName: "Sevilla", month: "November", day: 25, year: 1964 },
      { firstName: "Imelda", lastName: "Sevilla", month: "November", day: 6, year: 1965 },
      { firstName: "Colleen", lastName: "Sevilla", month: "December", day: 18, year: 2002 },
      { firstName: "Egay", lastName: "De Guzman", month: "July", day: 12, year: null },
      { firstName: "Oyang", lastName: "De Guzman", month: "May", day: 27, year: null },
      { firstName: "Daniel", lastName: "De Guzman", month: "February", day: 6, year: null },
      { firstName: "Ryan", lastName: "De Guzman", month: "July", day: 22, year: null },
      { firstName: "Eric", lastName: "De Guzman", month: "May", day: 26, year: null },
      { firstName: "Nat", lastName: "De Guzman", month: "October", day: 5, year: null },
      { firstName: "Nestor", lastName: "Tiongson", month: "October", day: 8, year: null },
      { firstName: "Ruby", lastName: "Tiongson", month: "February", day: 2, year: null },
      { firstName: "Candice", lastName: "Tiongson", month: "June", day: 1, year: 1992 },
      { firstName: "Caitlin", lastName: "Tiongson", month: "October", day: 24, year: null },
      { firstName: "Adrian", lastName: "Tiongson", month: "July", day: 27, year: null },
      { firstName: "Mark", lastName: "Mejia", month: "September", day: 20, year: null },
      { firstName: "Michael", lastName: "Mejia", month: "December", day: 8, year: null },
      { firstName: "Aida", lastName: "Mejia", month: "July", day: 11, year: null },
      { firstName: "Toper", lastName: "Porto", month: "December", day: 19, year: null },
      { firstName: "Angel", lastName: "Porto", month: "January", day: 11, year: null },
      { firstName: "Tala", lastName: "Porto", month: "January", day: 5, year: null },
      { firstName: "Alon", lastName: "Porto", month: "January", day: 4, year: null },
      { firstName: "Rap", lastName: "Sevilla", month: "June", day: 10, year: 1996 },
      { firstName: "Alex", lastName: "Sevilla", month: null, day: null, year: null },
      { firstName: "Steven", lastName: "Kuo", month: "March", day: 20, year: null },
      { firstName: "Patricia", lastName: "Kuo", month: "December", day: 16, year: null }
    ];

    initialPeople.forEach(person => {
      const id = randomUUID();
      const personRecord: Person = {
        id,
        firstName: person.firstName,
        lastName: person.lastName,
        month: person.month ?? null,
        day: person.day ?? null,
        year: person.year ?? null,
      };
      this.people.set(id, personRecord);
    });
  }

  async getAllPeople(): Promise<Person[]> {
    return Array.from(this.people.values());
  }

  async getPerson(id: string): Promise<Person | undefined> {
    return this.people.get(id);
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const id = randomUUID();
    const person: Person = {
      id,
      firstName: insertPerson.firstName,
      lastName: insertPerson.lastName,
      month: insertPerson.month ?? null,
      day: insertPerson.day ?? null,
      year: insertPerson.year ?? null,
    };
    this.people.set(id, person);
    return person;
  }

  async updatePerson(id: string, updates: Partial<InsertPerson>): Promise<Person | undefined> {
    const existingPerson = this.people.get(id);
    if (!existingPerson) {
      return undefined;
    }
    const updatedPerson = { ...existingPerson, ...updates };
    this.people.set(id, updatedPerson);
    return updatedPerson;
  }

  async deletePerson(id: string): Promise<boolean> {
    return this.people.delete(id);
  }

  async importPeople(peopleToImport: InsertPerson[]): Promise<Person[]> {
    const importedPeople: Person[] = [];
    
    peopleToImport.forEach(person => {
      const id = randomUUID();
      const newPerson: Person = {
        id,
        firstName: person.firstName,
        lastName: person.lastName,
        month: person.month ?? null,
        day: person.day ?? null,
        year: person.year ?? null,
      };
      this.people.set(id, newPerson);
      importedPeople.push(newPerson);
    });
    
    return importedPeople;
  }
}

export const storage = new MemStorage();
