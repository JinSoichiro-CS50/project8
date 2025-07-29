import { Person, InsertPerson } from "@shared/schema";

export function downloadCSV(people: Person[]) {
  const headers = ['Last Name', 'First Name', 'Month', 'Day', 'Year'];
  const rows = people.map(person => [
    person.lastName,
    person.firstName,
    person.month || '',
    person.day?.toString() || '',
    person.year?.toString() || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'birthdays.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function parseCSV(csvText: string): InsertPerson[] {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const people: InsertPerson[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    
    if (values.length >= 2) {
      const person: InsertPerson = {
        lastName: values[0] || '',
        firstName: values[1] || '',
        month: values[2] || null,
        day: values[3] ? parseInt(values[3]) : null,
        year: values[4] ? parseInt(values[4]) : null,
      };
      
      if (person.firstName && person.lastName) {
        people.push(person);
      }
    }
  }
  
  return people;
}
