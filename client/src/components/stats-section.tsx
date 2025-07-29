import { Person } from "@shared/schema";
import { getDaysUntilBirthday } from "@/lib/date-utils";

interface StatsSectionProps {
  people: Person[];
}

export default function StatsSection({ people }: StatsSectionProps) {
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  
  const thisMonthCount = people.filter(person => person.month === currentMonth).length;
  
  const upcomingCount = people.filter(person => {
    if (!person.month || !person.day) return false;
    const days = getDaysUntilBirthday(person.month, person.day);
    return days <= 30 && days > 0;
  }).length;
  
  const todayCount = people.filter(person => {
    if (!person.month || !person.day) return false;
    const days = getDaysUntilBirthday(person.month, person.day);
    return days === 0;
  }).length;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-rose-600">{people.length}</div>
          <div className="text-muted-foreground mt-1">Total People</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-rose-600">{thisMonthCount}</div>
          <div className="text-muted-foreground mt-1">This Month</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-rose-600">{upcomingCount}</div>
          <div className="text-muted-foreground mt-1">Next 30 Days</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-rose-600">{todayCount}</div>
          <div className="text-muted-foreground mt-1">Today</div>
        </div>
      </div>
    </section>
  );
}
