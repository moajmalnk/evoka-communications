import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CustomClockProps {
  showIcon?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export function CustomClock({ 
  showIcon = true, 
  className = '', 
  variant = 'default' 
}: CustomClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    
    switch (variant) {
      case 'compact':
        return `${hours}:${minutes}`;
      case 'detailed':
        return `${hours}:${minutes}:${seconds}`;
      default:
        return `${hours}:${minutes}`;
    }
  };

  const formatDate = () => {
    return time.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        {showIcon && <Clock className="h-4 w-4 text-muted-foreground" />}
        <span className="font-mono font-medium">{formatTime()}</span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg ${className}`}>
        {showIcon && <Clock className="h-5 w-5 text-primary" />}
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-primary">
            {formatTime()}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Clock className="h-4 w-4 text-muted-foreground" />}
      <div className="flex flex-col">
        <span className="font-mono font-medium">{formatTime()}</span>
        <span className="text-xs text-muted-foreground">{formatDate()}</span>
      </div>
    </div>
  );
}
