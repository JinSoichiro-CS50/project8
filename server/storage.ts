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
  private familyTreeData: any = { nodes: [], relationships: [] };

  constructor() {
    this.people = new Map();
    this.seedInitialData();
  }

  private seedInitialData() {
    // Import the CSV data as initial data with family relationships
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
      { firstName: "Mark", lastName: "Mejia", month: "September", day: 20, year: 1988 },
      { firstName: "Michael", lastName: "Mejia", month: "December", day: 8, year: null },
      { firstName: "Aida", lastName: "Mejia", month: "July", day: 11, year: null },
      { firstName: "Toper", lastName: "Porto", month: "December", day: 19, year: null },
      { firstName: "Angel", lastName: "Porto", month: "January", day: 11, year: null },
      { firstName: "Tala", lastName: "Porto", month: "January", day: 5, year: null },
      { firstName: "Alon", lastName: "Porto", month: "January", day: 4, year: null },
      { firstName: "Rap", lastName: "Sevilla", month: "June", day: 10, year: 1996 },
      { firstName: "Alex", lastName: "Sevilla", month: "February", day: 15, year: null },
      { firstName: "Steven", lastName: "Kuo", month: "March", day: 20, year: null },
      { firstName: "Patricia", lastName: "Kuo", month: "December", day: 16, year: null },
      { firstName: "Boss", lastName: "Mejia", month: null, day: null, year: null },
      { firstName: "Aiyan", lastName: "De Guzman", month: null, day: null, year: null },
      { firstName: "Sharmain", lastName: "De Guzman", month: null, day: null, year: null },
      { firstName: "Jackie", lastName: "De Guzman", month: null, day: null, year: null },
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
    
    // Set up family tree with relationships based on CSV data
    this.setupFamilyTreeFromCSV();
  }

  private setupFamilyTreeFromCSV() {
    const allPeople = Array.from(this.people.values());
    const nodes = allPeople.map((person, index) => ({
      ...person,
      position: {
        x: 200 + (index % 6) * 250,
        y: 150 + Math.floor(index / 6) * 200
      }
    }));

    // Create family connections based on the CSV relationships
    const connections: any[] = [];
    let connectionId = 0;

    // Helper function to find person by name
    const findPersonByName = (firstName: string, lastName: string) => {
      return allPeople.find(p => p.firstName === firstName && p.lastName === lastName);
    };

    // Create spouse connections
    const spouseConnections = [
      { person1: "Robert Sevilla", person2: "Imelda Sevilla" },
      { person1: "Egay De Guzman", person2: "Oyang De Guzman" },
      { person1: "Nestor Tiongson", person2: "Ruby Tiongson" },
      { person1: "Rap Sevilla", person2: "Alex Sevilla" },
      { person1: "Steven Kuo", person2: "Patricia Kuo" },
      { person1: "Ryan De Guzman", person2: "Sharmain De Guzman" },
      { person1: "Eric De Guzman", person2: "Jackie De Guzman" },
    ];

    spouseConnections.forEach(conn => {
      const [firstName1, lastName1] = conn.person1.split(' ');
      const [firstName2, lastName2] = conn.person2.split(' ');
      const person1 = findPersonByName(firstName1, lastName1);
      const person2 = findPersonByName(firstName2, lastName2);
      
      if (person1 && person2) {
        connections.push({
          id: `spouse-${connectionId++}`,
          fromPersonId: person1.id,
          toPersonId: person2.id,
          type: 'spouse'
        });
      }
    });

    // Create parent-child connections
    const parentChildConnections = [
      // Robert & Imelda's children
      { parent1: "Robert Sevilla", parent2: "Imelda Sevilla", children: ["Patricia Kuo", "Rap Sevilla", "Colleen Sevilla"] },
      // Egay & Oyang's children
      { parent1: "Egay De Guzman", parent2: "Oyang De Guzman", children: ["Daniel De Guzman", "Ryan De Guzman", "Eric De Guzman", "Nat De Guzman"] },
      // Nestor & Ruby's children
      { parent1: "Nestor Tiongson", parent2: "Ruby Tiongson", children: ["Candice Tiongson", "Caitlin Tiongson", "Adrian Tiongson"] },
      // Aida's children
      { parent1: "Aida Mejia", parent2: null, children: ["Boss Mejia", "Michael Mejia", "Angel Porto", "Mark Mejia"] },
      // Toper's children
      { parent1: "Toper Porto", parent2: null, children: ["Tala Porto", "Alon Porto"] },
      // Angel's children
      { parent1: "Angel Porto", parent2: null, children: ["Tala Porto", "Alon Porto"] },
      // Ryan & Sharmain's children
      { parent1: "Ryan De Guzman", parent2: "Sharmain De Guzman", children: ["Aiyan De Guzman"] },
    ];

    parentChildConnections.forEach(family => {
      const [firstName1, lastName1] = family.parent1.split(' ');
      const parent1 = findPersonByName(firstName1, lastName1);
      let parent2 = null;
      
      if (family.parent2) {
        const [firstName2, lastName2] = family.parent2.split(' ');
        parent2 = findPersonByName(firstName2, lastName2);
      }

      family.children.forEach(childName => {
        const [childFirstName, childLastName] = childName.split(' ');
        const child = findPersonByName(childFirstName, childLastName);
        
        if (parent1 && child) {
          connections.push({
            id: `parent-child-${connectionId++}`,
            fromPersonId: parent1.id,
            toPersonId: child.id,
            type: 'parent-child'
          });
        }
        
        if (parent2 && child) {
          connections.push({
            id: `parent-child-${connectionId++}`,
            fromPersonId: parent2.id,
            toPersonId: child.id,
            type: 'parent-child'
          });
        }
      });
    });

    this.familyTreeData = { nodes, connections };
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

  async getFamilyTree(): Promise<any> {
    return this.familyTreeData;
  }

  async saveFamilyTree(data: any): Promise<any> {
    this.familyTreeData = data;
    return data;
  }
}

export const storage = new MemStorage();