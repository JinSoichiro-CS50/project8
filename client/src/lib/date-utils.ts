export function getDaysUntilBirthday(month: string, day: number): number {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = monthNames.indexOf(month);
  
  if (monthIndex === -1) return 0;
  
  const today = new Date();
  const thisYear = today.getFullYear();
  let birthday = new Date(thisYear, monthIndex, day);
  
  // If birthday has passed this year, calculate for next year
  if (birthday < today) {
    birthday = new Date(thisYear + 1, monthIndex, day);
  }
  
  const timeDiff = birthday.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

export function formatBirthdayDate(month: string | null, day: number | null, year: number | null): string {
  if (!month || !day) return 'Date not set';
  
  if (year) {
    return `${month} ${day}, ${year}`;
  }
  
  return `${month} ${day}`;
}

export function calculateAge(year: number | null): number | null {
  if (!year) return null;
  return new Date().getFullYear() - year;
}
