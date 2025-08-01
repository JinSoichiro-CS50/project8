import { Person } from "@shared/schema";
import { getDaysUntilBirthday } from "@/lib/date-utils";
import { Edit, Trash2 } from "lucide-react";

interface BirthdayCardProps {
  person: Person;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
}

// Clean minimal design - all months use the same subtle rose accent
const monthColors = {
  'January': 'bg-[#FF8C42]',      // Orange
  'February': 'bg-[#FFD93D]',     // Yellow
  'March': 'bg-[#A4B86A]',        // Olive Green
  'April': 'bg-[#6ECEB2]',        // Cyan
  'May': 'bg-[#EE6C9D]',          // Pink
  'June': 'bg-[#3AA9DB]',         // Blue
  'July': 'bg-[#FF8C42]',         // Orange (repeat)
  'August': 'bg-[#FFD93D]',       // Yellow (repeat)
  'September': 'bg-[#A4B86A]',    // Olive Green (repeat)
  'October': 'bg-[#6ECEB2]',      // Cyan (repeat)
  'November': 'bg-[#EE6C9D]',     // Pink (repeat)
  'December': 'bg-[#3AA9DB]'      // Blue (repeat)
};

export default function BirthdayCard({ person, onEdit, onDelete }: BirthdayCardProps) {
  if (!person.month || !person.day) return null;
  
  const age = person.year ? new Date().getFullYear() - person.year : null;
  const ageText = age ? `(${age} years old)` : '';
  const daysUntil = getDaysUntilBirthday(person.month, person.day);

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md card-hover transition-all">
      <div className={`${monthColors[person.month as keyof typeof monthColors] || 'bg-gray-400'} h-2 rounded-full mb-4`}></div>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {person.firstName} {person.lastName}
          </h3>
          <p className="text-muted-foreground text-sm">
            {person.month} {person.day} {ageText}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(person)}
            className="text-primary hover:text-primary/80 p-1 rounded transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDelete(person)}
            className="text-destructive hover:text-destructive/80 p-1 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {daysUntil === 0 ? (
          <span className="text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">🎉 Today!</span>
        ) : (
          `${daysUntil} days until birthday`
        )}
      </div>
    </div>
  );
}
