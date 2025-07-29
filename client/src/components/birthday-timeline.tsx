import { Person } from "@shared/schema";

interface BirthdayTimelineProps {
  people: Person[];
  onMonthClick: (month: string) => void;
  selectedMonth: string | null;
}

const monthColors = {
  'January': 'from-gray-600 to-gray-700',
  'February': 'from-gray-600 to-gray-700', 
  'March': 'from-gray-600 to-gray-700',
  'April': 'from-gray-600 to-gray-700',
  'May': 'from-gray-600 to-gray-700',
  'June': 'from-gray-600 to-gray-700',
  'July': 'from-gray-600 to-gray-700',
  'August': 'from-gray-600 to-gray-700',
  'September': 'from-gray-600 to-gray-700',
  'October': 'from-gray-600 to-gray-700',
  'November': 'from-gray-600 to-gray-700',
  'December': 'from-gray-600 to-gray-700'
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
          className={`${chevronClass} ${isSelected ? 'bg-gray-800' : 'bg-gray-700 hover:bg-gray-600'} h-16 flex items-center justify-center text-white font-medium text-sm relative cursor-pointer transition-all duration-200`}
          onClick={() => onMonthClick(month)}
        >
          <span className="text-white">
            {monthAbbr[monthIndex]}
          </span>
          {count > 0 && (
            <div className={`absolute ${isTopRow ? '-bottom-2' : '-top-2'} left-1/2 transform -translate-x-1/2`}>
              <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <span className="text-xs font-medium text-white">{count}</span>
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
          <p className="text-muted-foreground">
            Showing birthdays for <span className="text-foreground font-medium">{selectedMonth}</span>
            <button 
              onClick={() => onMonthClick(selectedMonth)}
              className="ml-2 text-primary hover:text-primary/80 underline"
            >
              Clear filter
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
