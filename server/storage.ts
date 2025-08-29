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
      { firstName: "Daniel", lastName: "De Guzman", month: "February", day: 6, year: 1996 },
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
      { firstName: "Rap", lastName: "Sevilla", month: "June", day: 10, year: 1995 },
      { firstName: "Alex", lastName: "Sevilla", month: "February", day: 15, year: 1996 },
      { firstName: "Steven", lastName: "Kuo", month: "March", day: 20, year: 1989 },
      { firstName: "Patricia", lastName: "Kuo", month: "December", day: 16, year: 1991 },
      { firstName: "Boss", lastName: "Mejia", month: "January", day: 4, year: null },
      { firstName: "Aiyan", lastName: "De Guzman", month: "May", day: 15, year: null },
      { firstName: "Sharmain", lastName: "De Guzman", month: "January", day: 1, year: null },
      { firstName: "Jackie", lastName: "De Guzman", month: "March", day: 22, year: null },
      { firstName: "Gene", lastName: "Sendin", month: "July", day: 17, year: null },
      { firstName: "Marissa", lastName: "Ongtao", month: "June", day: 28, year: null },
      { firstName: "Larry", lastName: "Ongtao", month: "August", day: 4, year: null },
      { firstName: "Muling", lastName: "Tiongson", month: "June", day: 1, year: null },
      { firstName: "Bkim", lastName: "Maniquis", month: "July", day: 4, year: 1992 },
      { firstName: "Ellen", lastName: "Ongtao", month: "May", day: 11, year: null },
      { firstName: "Boy", lastName: "Ongtao", month: "January", day: 8, year: null },
      { firstName: "Marla", lastName: "Ongtao", month: "December", day: 27, year: null },
      { firstName: "Shannen", lastName: "Espinosa", month: "August", day: 28, year: null },
      { firstName: "Kate", lastName: "Espinosa", month: "September", day: 15, year: null },
      { firstName: "Gelo", lastName: "De Leon", month: "December", day: 13, year: null },
      { firstName: "Fred", lastName: "Espinosa", month: "December", day: 13, year: null },
      { firstName: "Net", lastName: "Espinosa", month: "December", day: 13, year: null },
      { firstName: "Pia", lastName: "Espinosa", month: "September", day: 23, year: null },
      { firstName: "Ralph", lastName: "Espinosa", month: "October", day: 24, year: null },
      { firstName: "Andre", lastName: "Espinosa", month: "December", day: 18, year: null },
      { firstName: "Jaymee", lastName: "Talag", month: "January", day: 19, year: null },
      { firstName: "Nikkei", lastName: "Espinosa", month: "August", day: 18, year: null },
      { firstName: "聖文 (Mao)", lastName: "毛", month: "August", day: 13, year: 1989 },
      { firstName: "韋翔 (Glen)", lastName: "馮", month: "August", day: 16, year: null },
      { firstName: "俊宏 (Robert)", lastName: "盧", month: "September", day: 7, year: null },
      { firstName: "竣為 (Derek)", lastName: "莊", month: "September", day: 11, year: 1988 },
      { firstName: "君旭 (AJ)", lastName: "顏", month: "October", day: 19, year: null },
      { firstName: "心為 (Marco)", lastName: "謝", month: "November", day: 8, year: 1995 },
      { firstName: "Clay", lastName: "Danner", month: "November", day: 25, year: null },
      { firstName: "彥志 (David)", lastName: "郭", month: "November", day: 27, year: 1997 },
      { firstName: "紹君 (Allen)", lastName: "郭", month: "September", day: 17, year: 1990 },
      { firstName: "常康 (Dad)", lastName: "郭", month: "November", day: 11, year: 1958 },
      { firstName: "小珂 (Mom)", lastName: "林", month: "December", day: 26, year: 1958 },
      { firstName: "柏暐 (Wilber)", lastName: "何", month: "December", day: 15, year: 1988 },
      { firstName: "榮聖 (Sam)", lastName: "張", month: "December", day: 29, year: 1988 },
      { firstName: "善任", lastName: "楊", month: "January", day: 7, year: 1989 },
      { firstName: "益銘 (Vincent)", lastName: "許", month: "January", day: 11, year: null },
      { firstName: "偉男 (Justin)", lastName: "Liao", month: "January", day: 18, year: 1989 },
      { firstName: "晧庭 (Ted)", lastName: "洪", month: "January", day: 30, year: 1984 },
      { firstName: "凱成 (Cheng)", lastName: "何", month: "January", day: 23, year: 1987 },
      { firstName: "松庭 (Fred)", lastName: "傅", month: "February", day: 18, year: 1989 },
      { firstName: "胤成 (Jerry)", lastName: "黃", month: "February", day: 22, year: 1989 },
      { firstName: "棋評 (Nick)", lastName: "詹", month: "June", day: 15, year: 1989 },
      { firstName: "攸淇 (Yuki)", lastName: "楊", month: "November", day: 14, year: 1989 },
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
      // Shannen's children
      { parent1: "Shannen Espinosa", parent2: null, children: ["Pia Espinosa"] },
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