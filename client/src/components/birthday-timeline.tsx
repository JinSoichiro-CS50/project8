import { Person } from "@shared/schema";

interface BirthdayTimelineProps {
  people: Person[];
  onMonthClick: (month: string) => void;
  selectedMonth: string | null;
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
    if (isFirst) chevronClass = 'timeline-chevron-first';
    
    return (
      <div key={month} className="relative">
        <div 
          className={`${chevronClass} bg-gradient-to-r ${monthColors[month as keyof typeof monthColors]} h-16 flex items-center justify-center text-white font-bold text-sm relative cursor-pointer transition-all transform ${isSelected ? 'scale-105 shadow-lg' : 'hover:scale-102'}`}
          onClick={() => onMonthClick(month)}
        >
          <span className={month === 'September' || month === 'December' || month === 'January' || month === 'November' ? 'text-black' : 'text-white'}>
            {monthAbbr[monthIndex]}
          </span>
          {count > 0 && (
            <div className={`absolute ${isTopRow ? '-bottom-2' : '-top-2'} left-1/2 transform -translate-x-1/2`}>
              <div className={`w-4 h-4 bg-gradient-to-r ${monthColors[month as keyof typeof monthColors]} rounded-full flex items-center justify-center animate-pulse border-2 border-white`}>
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
          <p className="text-blue-200">
            Showing birthdays for <span className="text-yellow-400 font-semibold">{selectedMonth}</span>
            <button 
              onClick={() => onMonthClick(selectedMonth)}
              className="ml-2 text-yellow-400 hover:text-yellow-300 underline"
            >
              Clear filter
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
