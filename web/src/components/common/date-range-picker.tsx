import React from 'react';
import { Calendar, CalendarProps } from '../ui/calendar';

interface Props {}

const DateRangePicker = (props: Props & CalendarProps) => {
  return (
    <div className="flex gap-2">
      <div id="shortcuts" className="w-28 pl-2 pt-2">
        <div
          role="button"
          className="text-sm hover:bg-slate-100 p-2 font-medium w-full rounded-md"
          onClick={() => {}}
        >
          Past 24 hours
        </div>
        <div
          role="button"
          className="text-sm hover:bg-slate-100 p-2 font-medium w-full rounded-md"
        >
          Past week
        </div>
        <div
          role="button"
          className="text-sm hover:bg-slate-100 p-2 font-medium w-full rounded-md"
        >
          Past month
        </div>
        <div
          role="button"
          className="text-sm hover:bg-slate-100 p-2 font-medium w-full rounded-md"
        >
          Past year
        </div>
        <div
          role="button"
          className="text-sm hover:bg-slate-100 p-2 font-medium w-full rounded-md"
        >
          Anytime
        </div>
      </div>
      <div>
        <Calendar {...props} />
      </div>
    </div>
  );
};

export default DateRangePicker;
