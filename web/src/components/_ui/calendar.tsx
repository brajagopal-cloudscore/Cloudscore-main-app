'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { differenceInCalendarDays } from 'date-fns';

export type CalendarProps = DayPickerProps & {
  /**
   * In the year view, the number of years to display at once.
   * @default 12
   */
  yearRange?: number;

  /**
   * Wether to show the year switcher in the caption.
   * @default true
   */
  showYearSwitcher?: boolean;

  monthsClassName?: string;
  monthCaptionClassName?: string;
  weekdaysClassName?: string;
  weekdayClassName?: string;
  monthClassName?: string;
  captionClassName?: string;
  captionLabelClassName?: string;
  buttonNextClassName?: string;
  buttonPreviousClassName?: string;
  navClassName?: string;
  monthGridClassName?: string;
  weekClassName?: string;
  dayClassName?: string;
  dayButtonClassName?: string;
  rangeStartClassName?: string;
  rangeEndClassName?: string;
  selectedClassName?: string;
  todayClassName?: string;
  outsideClassName?: string;
  disabledClassName?: string;
  rangeMiddleClassName?: string;
  hiddenClassName?: string;
};

type NavView = 'days' | 'years';

/**
 * A custom calendar component built on top of react-day-picker.
 * @param props The props for the calendar.
 * @default yearRange 12
 * @returns
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showYearSwitcher = true,
  yearRange = 12,
  ...props
}: CalendarProps) {
  const [navView, setNavView] = React.useState<NavView>('days');
  const [displayYears, setDisplayYears] = React.useState<{
    from: number;
    to: number;
  }>(
    React.useMemo(() => {
      const currentYear = new Date().getFullYear();
      return {
        from: currentYear - 10,
        to: currentYear,
      };
    }, [yearRange])
  );
  
  const [month, setMonth] = React.useState<Date>(props.defaultMonth || new Date());
  const nextMonth = React.useMemo(() => {
    const next = new Date(month);
    next.setMonth(next.getMonth() + 1);
    return next;
  }, [month]);
  
  const previousMonth = React.useMemo(() => {
    const prev = new Date(month);
    prev.setMonth(prev.getMonth() - 1);
    return prev;
  }, [month]);

  // Handle month navigation
  const handlePreviousMonth = () => {
    const prev = new Date(month);
    prev.setMonth(prev.getMonth() - 1);
    setMonth(prev);
    if (props.onMonthChange) {
      props.onMonthChange(prev);
    }
  };

  const handleNextMonth = () => {
    const next = new Date(month);
    next.setMonth(next.getMonth() + 1);
    setMonth(next);
    if (props.onMonthChange) {
      props.onMonthChange(next);
    }
  };

  // Combined classnames for styling
  const nav_button = cn(
    buttonVariants({ variant: 'outline' }),
    'h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100'
  );

  return (
    <div className="w-auto p-2">
      {navView === 'years' ? (
        <div>
          <div className="relative flex items-center justify-center pt-1">
            <Button
              className="h-6 w-full truncate text-xs font-medium"
              variant="ghost"
              size="sm"
              onClick={() => setNavView('days')}
            >
              {displayYears.from} - {displayYears.to}
            </Button>
            <Button
              variant="outline"
              className="absolute left-1 h-6 w-6 bg-transparent p-0 opacity-80 hover:opacity-100"
              onClick={() => {
                setDisplayYears((prev) => {
                  const newFrom = Math.max(prev.from - yearRange, new Date().getFullYear() - 10);
                  return {
                    from: newFrom,
                    to: newFrom + Math.min(yearRange, prev.to - newFrom)
                  };
                });
              }}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              className="absolute right-1 h-6 w-6 bg-transparent p-0 opacity-80 hover:opacity-100"
              onClick={() => {
                setDisplayYears((prev) => {
                  const currentYear = new Date().getFullYear();
                  const newTo = Math.min(prev.to + yearRange, currentYear);
                  return {
                    from: Math.max(newTo - yearRange, currentYear - 10),
                    to: newTo
                  };
                });
              }}
              disabled={displayYears.to >= new Date().getFullYear()}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-y-1 mx-auto mt-2">
            {Array.from(
              { length: displayYears.to - displayYears.from + 1 },
              (_, i) => {
                const year = displayYears.from + i;
                const currentYear = new Date().getFullYear();
                const isCurrentYear = year === currentYear;
                
                // Skip years beyond current year
                if (year > currentYear) {
                  return null;
                }
                
                return (
                  <Button
                    key={i}
                    className={cn(
                      'h-6 w-full text-xs font-normal',
                      isCurrentYear && 'bg-accent font-medium text-accent-foreground'
                    )}
                    variant="ghost"
                    onClick={() => {
                      const newDate = new Date(month);
                      newDate.setFullYear(year);
                      setMonth(newDate);
                      setNavView('days');
                      if (props.onMonthChange) {
                        props.onMonthChange(newDate);
                      }
                    }}
                  >
                    {year}
                  </Button>
                );
              }
            )}
          </div>
        </div>
      ) : (
        <DayPicker
          showOutsideDays={showOutsideDays}
          className={cn('', className)}
          month={month}
          onMonthChange={setMonth}
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0',
            month: 'space-y-2',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-xs font-medium',
            nav: 'space-x-1 flex items-center',
            nav_button,
            nav_button_previous: 'absolute left-1',
            nav_button_next: 'absolute right-1',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex',
            head_cell: 'text-muted-foreground rounded-md w-7 font-normal text-[0.7rem]',
            row: 'flex w-full mt-1',
            cell: 'h-7 w-7 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: cn(
              buttonVariants({ variant: 'ghost' }),
              'h-7 w-7 p-0 font-normal text-xs aria-selected:opacity-100'
            ),
            day_range_end: 'day-range-end',
            day_selected: 'bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white',
            day_today: 'bg-accent text-accent-foreground',
            day_outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-black/50 aria-selected:text-white aria-selected:opacity-30',
            day_disabled: 'text-muted-foreground opacity-50',
            day_range_middle: 'aria-selected:bg-black/10 aria-selected:text-black',
            day_hidden: 'invisible',
            ...classNames,
          }}
          components={{
            IconLeft: () => <ChevronLeft className="h-3 w-3" />,
            IconRight: () => <ChevronRight className="h-3 w-3" />,
            Caption: ({ displayMonth }) => (
              <div className="flex justify-center pt-1 relative items-center">
                <Button
                  className="h-6 text-xs font-medium"
                  variant="ghost"
                  onClick={() => setNavView('years')}
                >
                  {format(displayMonth)}
                </Button>
                <div className="flex absolute left-1">
                  <Button
                    variant="outline"
                    className="h-6 w-6 bg-transparent p-0 opacity-80 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviousMonth();
                    }}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex absolute right-1">
                  <Button
                    variant="outline"
                    className="h-6 w-6 bg-transparent p-0 opacity-80 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextMonth();
                    }}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ),
          }}
          {...props}
        />
      )}
    </div>
  );
}

// Helper function to format the month display
function format(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

Calendar.displayName = 'Calendar';

export { Calendar };
