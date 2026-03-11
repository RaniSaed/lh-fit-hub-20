import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FullCalendarProps {
    selectedDate: Date;
    onSelectDate: (d: Date) => void;
    workoutDates: string[]; // YYYY-MM-DD
    progressDates?: string[]; // YYYY-MM-DD
}

const FullCalendar: React.FC<FullCalendarProps> = ({ selectedDate, onSelectDate, workoutDates, progressDates = [] }) => {
    const { lang, t } = useLanguage();

    // Track the currently viewed month (independent of the selected date's month)
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

    const formatDateString = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const isToday = (d: Date) => isSameDay(d, new Date());

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getStartingDayOfWeek = (year: number, month: number) => {
        return new Date(year, month, 1).getDay(); // 0 is Sunday
    };

    // Generate the grid arrays
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const startingDay = getStartingDayOfWeek(year, month);

    const calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = startingDay - 1; i >= 0; i--) {
        calendarDays.push({
            date: new Date(year, month - 1, prevMonthDays - i),
            isCurrentMonth: false,
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({
            date: new Date(year, month, i),
            isCurrentMonth: true,
        });
    }

    // Next month padding (to complete a grid of 6 rows, so 42 cells total)
    const paddingNeeded = 42 - calendarDays.length;
    for (let i = 1; i <= paddingNeeded; i++) {
        calendarDays.push({
            date: new Date(year, month + 1, i),
            isCurrentMonth: false,
        });
    }

    const enDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="w-full glass border-b border-border/50 py-8 px-4 md:px-8 shadow-sm relative z-0">
            <div className="max-w-3xl mx-auto">
                {/* Header navigation */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={prevMonth}
                        className="p-2.5 rounded-full glass hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-all duration-300 shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">
                        {monthNames[month]} {year}
                    </h2>

                    <button
                        onClick={nextMonth}
                        className="p-2.5 rounded-full glass hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-all duration-300 shadow-sm"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
                    {enDays.map((day, i) => (
                        <div key={i} className="text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest py-2">
                            {t(day)}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                    {calendarDays.map((item, i) => {
                        const { date, isCurrentMonth } = item;
                        const isActive = isSameDay(date, selectedDate);
                        const dateStr = formatDateString(date);
                        const hasWorkout = workoutDates.includes(dateStr);
                        const hasProgress = progressDates.includes(dateStr);
                        const todayMarker = isToday(date);

                        return (
                            <motion.button
                                key={i}
                                onClick={() => onSelectDate(date)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                  relative flex flex-col items-center justify-center p-2 h-[4.5rem] sm:h-20 rounded-2xl transition-all duration-300 border
                  ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
                  ${isActive
                                        ? 'gradient-pink text-white border-transparent shadow-pink drop-shadow-md z-10'
                                        : todayMarker
                                            ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                                            : 'bg-card/50 text-foreground border-transparent hover:bg-foreground/5 hover:shadow-sm'
                                    }
                `}
                            >
                                <span className={`text-base font-semibold ${isActive ? 'text-white' : ''}`}>
                                    {date.getDate()}
                                </span>

                                {/* Indicators */}
                                <div className="flex items-center justify-center mt-1 gap-1 h-3 mt-auto mb-1">
                                    {hasWorkout && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#B0E0E6]'}`} />
                                    )}
                                    {hasProgress && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/90' : 'bg-[#FF69B4]'}`} />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FullCalendar;
