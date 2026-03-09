import React, { useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  workoutDates: string[]; // ISO Strings or YYYY-MM-DD
}

const CalendarStrip: React.FC<CalendarStripProps> = ({ selectedDate, onSelectDate, workoutDates }) => {
  const { lang, t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate 14 days centered around today (7 past, today, 6 future)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = -7; i <= 6; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
    }
    return dates;
  };

  const datesList = generateDates();

  // Scroll active date into view on mount
  useEffect(() => {
    if (scrollRef.current) {
        const activeElement = scrollRef.current.querySelector('[data-active="true"]');
        if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, []);

  const formatDateString = (d: Date) => {
    // E.g. "2024-06-01" to match our mock data structure
    return d.toISOString().split('T')[0];
  };

  const getDayName = (d: Date) => {
      const enDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      return t(enDays[d.getDay()]);
  };

  const isSameDay = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() && 
             d1.getMonth() === d2.getMonth() && 
             d1.getDate() === d2.getDate();
  };

  const isToday = (d: Date) => {
      return isSameDay(d, new Date());
  };

  return (
    <div className="w-full overflow-hidden bg-card border-b border-border py-4">
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide snap-x relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {datesList.map((d, i) => {
          const isActive = isSameDay(d, selectedDate);
          const dateStr = formatDateString(d);
          const hasWorkout = workoutDates.includes(dateStr);
          const todayMarker = isToday(d);

          return (
            <motion.button
              key={i}
              data-active={isActive}
              onClick={() => onSelectDate(d)}
              whileTap={{ scale: 0.95 }}
              className={`
                snap-center shrink-0 flex flex-col items-center justify-center p-3 w-16 h-20 rounded-[20px] transition-all relative border
                ${isActive 
                    ? 'bg-[#FF69B4] text-white border-transparent shadow-lg shadow-[#FF69B4]/20' 
                    : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
                }
              `}
            >
              {todayMarker && !isActive && (
                  <span className="absolute top-1 text-[10px] font-bold text-primary">Today</span>
              )}
              {todayMarker && isActive && (
                  <span className="absolute top-1 text-[10px] font-bold text-white/80">Today</span>
              )}

              <span className={`text-xs font-medium uppercase tracking-wider ${isActive ? 'text-white/90' : 'text-muted-foreground/70'} mt-1`}>
                {getDayName(d)}
              </span>
              <span className={`text-xl font-display font-bold mt-0.5 ${isActive ? 'text-white' : 'text-foreground'}`}>
                {d.getDate()}
              </span>

              {/* Workout Indicator Dot */}
              <div className="h-2 w-full flex items-center justify-center mt-1">
                  {hasWorkout && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#B0E0E6]'}`} />
                  )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarStrip;
