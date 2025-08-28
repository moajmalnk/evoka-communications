import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomCalendarProps {
  date?: Date;
  onDateChange?: (date: Date) => void;
  variant?: 'default' | 'compact' | 'inline' | 'date-display';
  className?: string;
  showIcon?: boolean;
  format?: 'short' | 'long' | 'relative';
}

export function CustomCalendar({ 
  date = new Date(),
  onDateChange,
  variant = 'default',
  className = '',
  showIcon = true,
  format = 'short'
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(date);
  const [currentMonth, setCurrentMonth] = useState(new Date(date.getFullYear(), date.getMonth(), 1));

  const formatDate = (date: Date, format: string) => {
    switch (format) {
      case 'long':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'relative':
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectDate = (date: Date) => {
    setCurrentDate(date);
    onDateChange?.(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === currentDate.toDateString();
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        {showIcon && <CalendarIcon className="h-4 w-4 text-muted-foreground" />}
        <span className="font-medium">{formatDate(currentDate, format)}</span>
      </div>
    );
  }

  if (variant === 'date-display') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showIcon && <CalendarIcon className="h-4 w-4 text-muted-foreground" />}
        <div className="flex flex-col">
          <span className="font-medium">{formatDate(currentDate, format)}</span>
          {format === 'short' && (
            <span className="text-xs text-muted-foreground">
              {currentDate.toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    const days = getDaysInMonth(currentMonth);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <div className={cn("p-4 bg-background border rounded-lg shadow-sm", className)}>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={index} className="text-center">
              {day ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-xs",
                    isToday(day) && "bg-primary text-primary-foreground font-bold",
                    isSelected(day) && "ring-2 ring-primary ring-offset-2",
                    !isToday(day) && !isSelected(day) && "hover:bg-muted"
                  )}
                  onClick={() => selectDate(day)}
                >
                  {day.getDate()}
                </Button>
              ) : (
                <div className="h-8 w-8" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default variant - simple date display
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && <CalendarIcon className="h-4 w-4 text-muted-foreground" />}
      <span className="font-medium">{formatDate(currentDate, format)}</span>
    </div>
  );
}
