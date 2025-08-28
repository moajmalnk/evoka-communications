import { useState } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CustomTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomTimePicker({ 
  value, 
  onChange, 
  placeholder = "Select time",
  className = '',
  disabled = false
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string>('');
  const [selectedMinute, setSelectedMinute] = useState<string>('');

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const generateHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i.toString().padStart(2, '0'));
    }
    return hours;
  };

  const generateMinutes = () => {
    const minutes = [];
    for (let i = 0; i < 60; i += 5) {
      minutes.push(i.toString().padStart(2, '0'));
    }
    return minutes;
  };

  const handleTimeSelect = (hour: string, minute: string) => {
    const timeString = `${hour}:${minute}`;
    onChange(timeString);
    setIsOpen(false);
  };

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    if (selectedMinute) {
      handleTimeSelect(hour, selectedMinute);
    }
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    if (selectedHour) {
      handleTimeSelect(selectedHour, minute);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = Math.floor(now.getMinutes() / 5) * 5;
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hours}:${minutesStr}`;
  };

  const hours = generateHours();
  const minutes = generateMinutes();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground",
            "hover:bg-accent hover:text-accent-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          <span className="truncate">
            {value ? formatTime(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] xs:w-[320px] sm:w-[400px] md:w-[480px] lg:w-[520px] p-0" align="start">
        <div className="p-3 sm:p-4 md:p-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h4 className="font-semibold text-lg sm:text-xl">Select Time</h4>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onChange(getCurrentTime());
                setIsOpen(false);
              }}
              className="h-9 px-3 w-full sm:w-auto"
            >
              <Clock className="mr-2 h-4 w-4" />
              Now
            </Button>
          </div>
          
          {/* Time Selection Grid */}
          <div className="space-y-4 sm:space-y-6">
            {/* Hours Section */}
            <div>
             
              
              {/* AM Hours */}
              <div className="mb-3 sm:mb-4">
                <h6 className="text-xs font-medium text-muted-foreground mb-2">Morning (AM)</h6>
                <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5 sm:gap-2">
                  {hours.slice(0, 12).map((hour) => {
                    const displayHour = parseInt(hour) === 0 ? 12 : parseInt(hour);
                    const isSelected = value?.startsWith(hour);
                    
                    return (
                      <Button
                        key={hour}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-9 sm:h-10 md:h-11 w-full justify-center text-xs sm:text-sm font-medium transition-all duration-200 min-w-0",
                          isSelected && "ring-2 ring-primary ring-offset-1 sm:ring-offset-2"
                        )}
                        onClick={() => handleHourSelect(hour)}
                      >
                        <span className="truncate">{displayHour}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              {/* PM Hours */}
              <div>
                <h6 className="text-xs font-medium text-muted-foreground mb-2">Afternoon/Evening (PM)</h6>
                <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5 sm:gap-2">
                  {hours.slice(12).map((hour) => {
                    const displayHour = parseInt(hour) === 12 ? 12 : parseInt(hour) - 12;
                    const isSelected = value?.startsWith(hour);
                    
                    return (
                      <Button
                        key={hour}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-9 sm:h-10 md:h-11 w-full justify-center text-xs sm:text-sm font-medium transition-all duration-200 min-w-0",
                          isSelected && "ring-2 ring-primary ring-offset-1 sm:ring-offset-2"
                        )}
                        onClick={() => handleHourSelect(hour)}
                      >
                        <span className="truncate">{displayHour}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Minutes Section */}
            <div>
              <h5 className="text-sm font-medium text-foreground mb-3">Minute</h5>
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5 sm:gap-2">
                {minutes.map((minute) => {
                  const isSelected = value?.endsWith(minute);
                  
                  return (
                    <Button
                      key={minute}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-9 sm:h-10 md:h-11 w-full justify-center text-xs sm:text-sm font-medium transition-all duration-200 min-w-0",
                        isSelected && "ring-2 ring-primary ring-offset-1 sm:ring-offset-2"
                      )}
                      onClick={() => handleMinuteSelect(minute)}
                    >
                      <span className="truncate">{minute}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
