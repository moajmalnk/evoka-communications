import { useState, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
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
  const [tempHour, setTempHour] = useState<string>('12');
  const [tempMinute, setTempMinute] = useState<string>('00');
  const [tempPeriod, setTempPeriod] = useState<'AM' | 'PM'>('AM');

  // Initialize temp values when value changes
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      setTempHour(displayHour.toString().padStart(2, '0'));
      setTempMinute(minutes);
      setTempPeriod(period);
    } else {
      // Set default values when no time is selected
      setTempHour('12');
      setTempMinute('00');
      setTempPeriod('AM');
    }
  }, [value]);

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const handleTimeConfirm = () => {
    if (tempHour && tempMinute) {
      const hour24 = tempPeriod === 'AM' 
        ? (tempHour === '12' ? 0 : parseInt(tempHour))
        : (tempHour === '12' ? 12 : parseInt(tempHour) + 12);
      const timeString = `${hour24.toString().padStart(2, '0')}:${tempMinute}`;
      onChange(timeString);
      setIsOpen(false);
    }
  };


  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = Math.floor(now.getMinutes() / 5) * 5;
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hours}:${minutesStr}`;
  };


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
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-lg">Select Time</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onChange(getCurrentTime());
                setIsOpen(false);
              }}
              className="h-8 px-3"
            >
              <Clock className="mr-2 h-3 w-3" />
              Now
            </Button>
          </div>
          
          {/* Time Input */}
          <div className="space-y-4">
            
            <div className="flex items-center gap-3">
              {/* Hour Input */}
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Hour</label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={tempHour}
                  onChange={(e) => setTempHour(e.target.value)}
                  placeholder="12"
                  className="h-9 text-center"
                />
              </div>
              
              <div className="text-lg font-bold text-muted-foreground mt-6">:</div>
              
              {/* Minute Input */}
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Minute</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={tempMinute}
                  onChange={(e) => setTempMinute(e.target.value.padStart(2, '0'))}
                  placeholder="00"
                  className="h-9 text-center"
                />
              </div>
              
              {/* AM/PM Toggle */}
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Period</label>
                <div className="flex border rounded-md h-9">
                  <Button
                    variant={tempPeriod === 'AM' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTempPeriod('AM')}
                    className="flex-1 h-9 rounded-r-none text-xs"
                  >
                    AM
                  </Button>
                  <Button
                    variant={tempPeriod === 'PM' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTempPeriod('PM')}
                    className="flex-1 h-9 rounded-l-none text-xs"
                  >
                    PM
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Confirm Button */}
            <Button
              onClick={handleTimeConfirm}
              disabled={!tempHour || !tempMinute || tempHour === '' || tempMinute === ''}
              className="w-full h-9"
            >
              <Check className="mr-2 h-3 w-3" />
              Set Time
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
