import { Person } from "@shared/schema";

interface BirthdayTimelineProps {
  people: Person[];
  onMonthClick: (month: string) => void;
  selectedMonth: string | null;
}

const monthColors = {
  'January': 'from-orange-400 to-orange-500',
  'February': 'from-yellow-400 to-yellow-500', 
  'March': 'from-green-500 to-green-600',
  'April': 'from-cyan-400 to-cyan-500',
  'May': 'from-pink-400 to-pink-500',
  'June': 'from-blue-500 to-blue-600',
  'July': 'from-orange-400 to-orange-500',
  'August': 'from-yellow-400 to-yellow-500',
  'September': 'from-green-500 to-green-600',
  'October': 'from-cyan-400 to-cyan-500',
  'November': 'from-pink-400 to-pink-500',
  'December': 'from-blue-500 to-blue-600'
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
          className={`timeline-month bg-gradient-to-r ${monthColors[month as keyof typeof monthColors]} h-16 flex items-center justify-center font-semibold text-sm cursor-pointer ${isSelected ? 'ring-2 ring-rose-400' : ''}`}
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
