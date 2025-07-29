import { Person } from "@shared/schema";

interface BirthdayTimelineProps {
  people: Person[];
  onMonthClick: (month: string) => void;
  selectedMonth: string | null;
}

const monthAbbr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];

export default function BirthdayTimeline({ people, onMonthClick, selectedMonth }: BirthdayTimelineProps) {
  const getBirthdayCount = (month: string) => {
    return people.filter(person => person.month === month).length;
  };

  const renderMonth = (monthIndex: number, isTopRow: boolean) => {
    const month = monthNames[monthIndex];
    const count = getBirthdayCount(month);
    const isSelected = selectedMonth === month;

    return (
      <div key={month} className="relative">
        <div 
          className={`timeline-chevron h-12 flex items-center justify-center font-medium text-sm relative cursor-pointer transition-all transform ${
            isSelected 
              ? 'bg-primary text-primary-foreground scale-105 shadow-md' 
              : count > 0 
                ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:scale-102'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-102'
          }`}
          onClick={() => onMonthClick(month)}
        >
          <span className="tracking-wide">
            {monthAbbr[monthIndex]}
          </span>
          {count > 0 && (
            <div className={`absolute ${isTopRow ? '-bottom-1' : '-top-1'} right-2`}>
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                <span className="text-xs font-semibold text-primary-foreground">{count}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Top Row Months */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {[0, 1, 2, 3, 4, 5].map((monthIndex) => 
          renderMonth(monthIndex, true)
        )}
      </div>

      {/* Bottom Row Months */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {[6, 7, 8, 9, 10, 11].map((monthIndex) => 
          renderMonth(monthIndex, false)
        )}
      </div>

      {selectedMonth && (
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Showing birthdays for <span className="text-primary font-medium">{selectedMonth}</span>
            <button 
              onClick={() => onMonthClick(selectedMonth)}
              className="ml-2 text-primary hover:text-primary/80 underline underline-offset-2"
            >
              Clear filter
            </button>
          </p>
        </div>
      )}
    </div>
  );
}