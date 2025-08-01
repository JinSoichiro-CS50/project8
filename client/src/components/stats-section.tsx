import { Person } from "@shared/schema";
import { getDaysUntilBirthday } from "@/lib/date-utils";

interface StatsSectionProps {
  people: Person[];
  onFilterClick: (filterType: 'today' | 'thisWeek' | 'next30Days' | 'all') => void;
}

export default function StatsSection({ people, onFilterClick }: StatsSectionProps) {
  const todayCount = people.filter(person => {
    if (!person.month || !person.day) return false;
    const days = getDaysUntilBirthday(person.month, person.day);
    return days === 0;
  }).length;

  const thisWeekCount = people.filter(person => {
    if (!person.month || !person.day) return false;
    const days = getDaysUntilBirthday(person.month, person.day);
    return days <= 7 && days >= 0;
  }).length;
  
  const next30DaysCount = people.filter(person => {
    if (!person.month || !person.day) return false;
    const days = getDaysUntilBirthday(person.month, person.day);
    return days <= 30 && days > 0;
  }).length;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          className="bg-card border border-border rounded-xl p-6 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onFilterClick('today')}
        >
          <div className="text-3xl font-bold text-rose-600">{todayCount}</div>
          <div className="text-muted-foreground mt-1">Today</div>
        </div>
        <div 
          className="bg-card border border-border rounded-xl p-6 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onFilterClick('thisWeek')}
        >
          <div className="text-3xl font-bold text-rose-600">{thisWeekCount}</div>
          <div className="text-muted-foreground mt-1">This Week</div>
        </div>
        <div 
          className="bg-card border border-border rounded-xl p-6 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onFilterClick('next30Days')}
        >
          <div className="text-3xl font-bold text-rose-600">{next30DaysCount}</div>
          <div className="text-muted-foreground mt-1">Next 30 Days</div>
        </div>
        <div 
          className="bg-card border border-border rounded-xl p-6 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onFilterClick('all')}
        >
          <div className="text-3xl font-bold text-rose-600">{people.length}</div>
          <div className="text-muted-foreground mt-1">Total People</div>
        </div>
      </div>
    </section>
  );
}
