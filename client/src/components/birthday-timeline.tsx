import { Person } from "@shared/schema";

interface BirthdayTimelineProps {
  people: Person[];
  onMonthClick: (month: string) => void;
  selectedMonth: string | null;
}

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

const monthAbbr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];

export default function BirthdayTimeline({ people, onMonthClick, selectedMonth }: BirthdayTimelineProps) {
  const getBirthdayCount = (month: string) => {
    return people.filter(person => person.month === month).length;
  };

  const getPeopleForMonth = (month: string) => {
    return people.filter(person => person.month === month)
      .sort((a, b) => (a.day || 0) - (b.day || 0));
  };

  const renderMonth = (monthIndex: number, isTopRow: boolean, isFirst: boolean, isLast: boolean) => {
    const month = monthNames[monthIndex];
    const count = getBirthdayCount(month);
    const monthPeople = getPeopleForMonth(month);
    const isSelected = selectedMonth === month;
    
    let chevronClass = 'timeline-chevron';
    
    return (
      <div key={month} className="relative">
        <div 
          className={`timeline-month ${monthColors[month as keyof typeof monthColors]} h-16 flex items-center justify-center font-semibold text-sm cursor-pointer ${isSelected ? 'ring-2 ring-rose-400' : ''}`}
          onClick={() => onMonthClick(month)}
        >
          <span className="text-white font-bold drop-shadow-sm">
            {monthAbbr[monthIndex]}
          </span>
          {count > 0 && (
            <div className={`absolute ${isTopRow ? '-bottom-2' : '-top-2'} left-1/2 transform -translate-x-1/2`}>
              <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center birthday-indicator border-2 border-white shadow-sm">
                <span className="text-xs font-bold text-white">{count}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Top Row Months */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        {[0, 1, 2, 3, 4, 5].map((monthIndex, index) => 
          renderMonth(monthIndex, true, index === 0, index === 5)
        )}
      </div>

      {/* Bottom Row Months */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {[6, 7, 8, 9, 10, 11].map((monthIndex, index) => 
          renderMonth(monthIndex, false, index === 0, index === 5)
        )}
      </div>
      
      {selectedMonth && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Showing birthdays for <span className="text-rose-600 font-semibold">{selectedMonth}</span>
            <button 
              onClick={() => onMonthClick(selectedMonth)}
              className="ml-2 text-rose-500 hover:text-rose-400 underline"
            >
              Clear filter
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
