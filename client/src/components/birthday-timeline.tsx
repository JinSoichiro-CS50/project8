import { Person } from "@shared/schema";

interface BirthdayTimelineProps {
  people: Person[];
  onMonthClick: (month: string) => void;
  selectedMonth: string | null;
}

const monthColors = {
  'January': 'from-rose-200 to-rose-300',
  'February': 'from-rose-200 to-rose-300', 
  'March': 'from-rose-200 to-rose-300',
  'April': 'from-rose-200 to-rose-300',
  'May': 'from-rose-200 to-rose-300',
  'June': 'from-rose-200 to-rose-300',
  'July': 'from-rose-200 to-rose-300',
  'August': 'from-rose-200 to-rose-300',
  'September': 'from-rose-200 to-rose-300',
  'October': 'from-rose-200 to-rose-300',
  'November': 'from-rose-200 to-rose-300',
  'December': 'from-rose-200 to-rose-300'
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
          <span className="text-rose-800">
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
        
        {/* Names and dates display */}
        {monthPeople.length > 0 && (
          <div className={`absolute ${isTopRow ? 'top-20' : 'bottom-20'} left-1/2 transform -translate-x-1/2 z-10`}>
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-rose-100 min-w-48">
              <h4 className="font-semibold text-rose-700 text-sm mb-3 text-center">{month}</h4>
              <div className="space-y-2">
                {monthPeople.map((person) => (
                  <div key={person.id} className="text-sm text-gray-700 flex justify-between items-center">
                    <span className="font-medium">{person.firstName} {person.lastName}</span>
                    <span className="text-rose-500 font-semibold text-xs bg-rose-50 px-2 py-1 rounded-full">{person.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
