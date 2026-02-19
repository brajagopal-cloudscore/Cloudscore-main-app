import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Props {
  date: Date;
  onChange: (date: Date | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DatePicker = ({ date, onChange, open, setOpen }: Props) => {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full">
        <Button
          variant={'outline'}
          className={cn(
            'justify-start text-left font-normal gap-2',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon size="16px" className="text-slate-500" />
          {date ? format(date, 'dd/MM/yyyy') : <span>DD/MM/YYYY</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
