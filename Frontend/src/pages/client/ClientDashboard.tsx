import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { trainingPlanService, userService, progressService, type TrainingPlan, type ProgressEntry } from '@/services/mockData';
import { LHLogo } from '@/components/LHLogo';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Languages, Download, Play, Dumbbell, Activity, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import VideoPlayer from '@/components/video/VideoPlayer';
import FullCalendar from '@/components/dashboard/FullCalendar';
import { ProgressAnalytics } from '@/components/dashboard/ProgressAnalytics';

const ClientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'workout' | 'progress'>('workout');
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);
  const [activeProgress, setActiveProgress] = useState<ProgressEntry | null>(null);
  const [coachName, setCoachName] = useState('');

  // Normalize local Date to YYYY-MM-DD
  const toDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Parse YYYY-MM-DD back into local Date at Midnight
  const parseDateStr = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    // month is 0-indexed in Date constructor
    return new Date(year, month - 1, day);
  };

  const getDatesInRange = (startStr: string, endStr?: string): string[] => {
    if (!endStr) return [startStr];
    const dates: string[] = [];
    let current = parseDateStr(startStr);
    const end = parseDateStr(endStr);

    // Safety break, max 1000 days
    let limit = 0;
    while (current <= end && limit < 1000) {
      dates.push(toDateStr(current));
      current.setDate(current.getDate() + 1);
      limit++;
    }
    return dates;
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        progressService.getByUser(user.id),
        trainingPlanService.getByUser(user.id)
      ]).then(([history, userPlans]) => {
        setProgressHistory(history);
        setPlans(userPlans);

        const todayStr = toDateStr(new Date());

        const hasPlanToday = userPlans.some(p => getDatesInRange(p.startDate, p.endDate).includes(todayStr));
        const hasProgressToday = history.some(p => getDatesInRange(p.date, p.endDate).includes(todayStr));

        // Default to today if there is a plan or progress entry for today
        if (hasPlanToday || hasProgressToday) {
          setSelectedDate(new Date()); // Today
        } else if (userPlans.length > 0 || history.length > 0) {
          // Find most recent past date from both plans and progress history
          const allDates = [
            ...userPlans.flatMap(p => getDatesInRange(p.startDate, p.endDate)),
            ...history.flatMap(p => getDatesInRange(p.date, p.endDate))
          ];

          // Deduplicate and sort descending
          const uniqueSortedDates = Array.from(new Set(allDates)).sort((a, b) => {
            const dateA = parseDateStr(a).getTime();
            const dateB = parseDateStr(b).getTime();
            return dateB - dateA;
          });

          if (uniqueSortedDates.length > 0) {
            setSelectedDate(parseDateStr(uniqueSortedDates[0]));
          }
        }
      });
    }
  }, [user]);

  useEffect(() => {
    const targetStr = toDateStr(selectedDate);

    // Workout Map
    const plan = plans.find(p => getDatesInRange(p.startDate, p.endDate).includes(targetStr));
    setActivePlan(plan || null);

    // Progress Map
    const prog = progressHistory.find(p => getDatesInRange(p.date, p.endDate).includes(targetStr));
    setActiveProgress(prog || null);

    if (plan) {
      userService.getById(plan.assignedCoach).then(c => setCoachName(c?.username || ''));
    }
  }, [selectedDate, plans, progressHistory]);

  const handleLogout = () => { logout(); navigate('/'); };

  const downloadPDF = () => {
    if (!activePlan) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('LH Training Program', 14, 20);
    doc.setFontSize(12);
    doc.text(`Client: ${user?.username}`, 14, 30);
    doc.text(`Coach: ${coachName}`, 14, 37);
    doc.text(`Start: ${activePlan.startDate}`, 14, 44);

    let y = 55;
    activePlan.muscleGroups.forEach(group => {
      doc.setFontSize(14);
      doc.text(group.name, 14, y);
      y += 5;
      autoTable(doc, {
        startY: y,
        head: [['Machine #', 'Exercise', 'Sets × Reps']],
        body: group.exercises.map(e => [e.machineNumber, e.name, `${e.sets}×${e.reps}`]),
        theme: 'grid',
        headStyles: { fillColor: [214, 105, 134] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    });

    if (activePlan.coachNotes) {
      doc.setFontSize(12);
      doc.text(`Coach Notes: ${activePlan.coachNotes}`, 14, y);
    }

    doc.save('training-program.pdf');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Premium Sticky Glass Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 glass-header">
        <LHLogo size="sm" />
        <div className="flex items-center gap-3">
          <button onClick={toggleLang} className="p-2.5 rounded-xl text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-all duration-300">
            <Languages className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="p-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <FullCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        workoutDates={plans.flatMap(p => getDatesInRange(p.startDate, p.endDate))}
        progressDates={progressHistory.flatMap(p => getDatesInRange(p.date, p.endDate))}
      />

      {/* Floating Segmented View Tabs */}
      <div className="flex justify-center mt-8 mb-4 gap-4 px-4 max-w-3xl mx-auto overflow-x-auto scrollbar-hide relative z-10">
        <div className="glass p-1.5 rounded-full flex gap-2 w-full max-w-sm ml-auto mr-auto border border-border/40 shadow-xl">
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-500 ease-in-out ${activeTab === 'workout'
              ? 'gradient-pink text-primary-foreground shadow-pink scale-[1.02]'
              : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              }`}
          >
            <Dumbbell className="w-4 h-4" />
            {t('workoutPlan')}
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-500 ease-in-out ${activeTab === 'progress'
              ? 'gradient-blue text-primary-foreground shadow-blue scale-[1.02]'
              : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              }`}
          >
            <TrendingUp className="w-4 h-4" />
            {t('progressTracker')}
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 md:px-8 pb-12 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'workout' && (
            <motion.div
              key="view-workout"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {!activePlan ? (
                <div className="mt-8 text-center bg-card p-10 rounded-2xl border border-border shadow-sm mx-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🛋️</span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-foreground mb-2">Rest Day!</h2>
                  <p className="text-muted-foreground">{t('restDay')}</p>
                </div>
              ) : (
                <motion.div
                  key={activePlan.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-display font-bold text-foreground">
                        {t('todaysWorkout')}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Coach: <span className="text-foreground font-medium">{coachName}</span>
                      </p>
                    </div>
                    <Button onClick={downloadPDF} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      <Download className="w-4 h-4 mr-1" /> {t('downloadPDF')}
                    </Button>
                  </div>

                  {activePlan.muscleGroups.filter(group => group.exercises && group.exercises.length > 0).map((group, gi) => (
                    <div
                      key={gi}
                      className="bg-card border border-border rounded-xl overflow-hidden shadow-card"
                    >
                      <div className="px-5 py-3 gradient-pink">
                        <h3 className="font-display font-semibold text-primary-foreground">{group.name}</h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {group.exercises.map(ex => (
                          <div key={ex.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border">
                            <VideoPlayer videoUrl={ex.videoUrl} exerciseName={ex.name} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm">{ex.name}</p>
                              <p className="text-xs text-muted-foreground">Machine #{ex.machineNumber}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-primary">{ex.sets}×{ex.reps}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Cardio */}
                  <div className="bg-card border border-border rounded-xl p-5 shadow-card">
                    <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full gradient-blue inline-block" />
                      {t('cardio')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Start: {activePlan.cardio.startDuration} · End: {activePlan.cardio.endDuration}
                      {activePlan.cardio.totalHours && ` · Total: ${activePlan.cardio.totalHours}`}
                    </p>
                  </div>

                  {activePlan.coachNotes && (
                    <div className="bg-card border border-border rounded-xl p-5 shadow-card">
                      <h3 className="font-display font-semibold text-foreground mb-2">{t('coachNotes')}</h3>
                      <p className="text-sm text-muted-foreground">{activePlan.coachNotes}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="view-progress"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {!activeProgress ? (
                <div className="mt-8 text-center bg-card p-10 rounded-2xl border border-border shadow-sm mx-4">
                  <div className="w-20 h-20 bg-muted flex items-center justify-center mx-auto mb-6 rounded-2xl rotate-3">
                    <Activity className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">{t('noMeasurementsRecorded')}</p>
                </div>
              ) : (
                <ProgressAnalytics
                  activeProgress={activeProgress}
                  progressHistory={progressHistory}
                  user={user}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ClientDashboard;
