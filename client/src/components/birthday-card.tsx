import { Person } from "@shared/schema";
import { getDaysUntilBirthday } from "@/lib/date-utils";
import { Edit, Trash2 } from "lucide-react";

interface BirthdayCardProps {
  person: Person;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
}

const monthColors = {
  'January': 'from-yellow-400 to-yellow-500',
  'February': 'from-orange-400 to-orange-500', 
  'March': 'from-red-500 to-red-600',
  'April': 'from-pink-500 to-pink-600',
  'May': 'from-purple-500 to-purple-600',
  'June': 'from-indigo-500 to-indigo-600',
  'July': 'from-blue-500 to-blue-600',
  'August': 'from-sky-400 to-sky-500',
  'September': 'from-cyan-400 to-cyan-500',
  'October': 'from-green-500 to-green-600',
  'November': 'from-lime-400 to-lime-500',
  'December': 'from-yellow-300 to-yellow-400'
};

export default function BirthdayCard({ person, onEdit, onDelete }: BirthdayCardProps) {
  if (!person.month || !person.day) return null;
  
  const age = person.year ? new Date().getFullYear() - person.year : null;
  const ageText = age ? `(${age} years old)` : '';
  const daysUntil = getDaysUntilBirthday(person.month, person.day);
  const colorGradient = monthColors[person.month as keyof typeof monthColors];

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
      <div className={`bg-gradient-to-r ${colorGradient} h-2 rounded-full mb-4`}></div>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {person.firstName} {person.lastName}
          </h3>
          <p className="text-blue-200 text-sm">
            {person.month} {person.day} {ageText}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(person)}
            className="text-yellow-400 hover:text-yellow-300 p-1 rounded transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDelete(person)}
            className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="text-xs text-blue-200">
        {daysUntil === 0 ? (
          <span className="text-yellow-400 font-semibold">🎉 Today!</span>
        ) : (
          `${daysUntil} days until birthday`
        )}
      </div>
    </div>
  );
}
