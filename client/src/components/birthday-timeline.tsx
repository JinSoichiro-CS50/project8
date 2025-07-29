import { Person } from "@shared/schema";

interface BirthdayTimelineProps {
  people: Person[];
  onMonthClick: (month: string) => void;
  selectedMonth: string | null;
}

const monthStyles = {
  'January': 'bg-slate-100 text-slate-800 border-slate-200',
  'February': 'bg-slate-150 text-slate-800 border-slate-250', 
  'March': 'bg-slate-200 text-slate-800 border-slate-300',
  'April': 'bg-slate-250 text-slate-800 border-slate-350',
  'May': 'bg-slate-300 text-slate-800 border-slate-400',
  'June': 'bg-slate-350 text-slate-800 border-slate-450',
  'July': 'bg-slate-400 text-white border-slate-500',
  'August': 'bg-slate-450 text-white border-slate-550',
  'September': 'bg-slate-500 text-white border-slate-600',
  'October': 'bg-slate-550 text-white border-slate-650',
  'November': 'bg-slate-600 text-white border-slate-700',
  'December': 'bg-slate-650 text-white border-slate-750'
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
          className={`${chevronClass} ${monthStyles[month as keyof typeof monthStyles]} h-16 flex items-center justify-center font-medium text-sm relative cursor-pointer transition-all transform ${isSelected ? 'scale-105 shadow-lg' : 'hover:scale-102'}`}
          onClick={() => onMonthClick(month)}
        >
          <span>
            {monthAbbr[monthIndex]}
          </span>
          {count > 0 && (
            <div className={`absolute ${isTopRow ? '-bottom-2' : '-top-2'} left-1/2 transform -translate-x-1/2`}>
              <div className={`w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm`}>
                <span className="text-xs font-medium">{count}</span>
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
          <p className="text-slate-600">
            Showing birthdays for <span className="text-slate-800 font-semibold">{selectedMonth}</span>
            <button 
              onClick={() => onMonthClick(selectedMonth)}
              className="ml-2 text-slate-700 hover:text-slate-900 underline transition-colors"
            >
              Clear filter
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
