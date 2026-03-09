import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { trainingPlanService, userService, type TrainingPlan } from '@/services/mockData';
import { LHLogo } from '@/components/LHLogo';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LogOut, Languages, Download, Play, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import VideoPlayer from '@/components/video/VideoPlayer';
import CalendarStrip from '@/components/dashboard/CalendarStrip';
import { AnimatePresence } from 'framer-motion';

const ClientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);
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

  useEffect(() => {
    if (user) {
      trainingPlanService.getByUser(user.id).then(userPlans => {
        setPlans(userPlans);
        // Default to today or most recent plan if available
        if (userPlans.length > 0) {
            const todayStr = toDateStr(new Date());
            const hasToday = userPlans.find(p => p.startDate === todayStr);
            if (!hasToday) {
                // Find most recent past date
                const sorted = [...userPlans].sort((a, b) => {
                  const dateA = parseDateStr(a.startDate).getTime();
                  const dateB = parseDateStr(b.startDate).getTime();
                  return dateB - dateA;
                });
                setSelectedDate(parseDateStr(sorted[0].startDate));
            }
        }
      });
    }
  }, [user]);

  useEffect(() => {
    const targetStr = toDateStr(selectedDate);
    const plan = plans.find(p => p.startDate === targetStr);
    setActivePlan(plan || null);
    
    if (plan) {
        userService.getById(plan.assignedCoach).then(c => setCoachName(c?.username || ''));
    }
  }, [selectedDate, plans]);

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
        headStyles: { fillColor: [255, 105, 180] },
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
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        <LHLogo size="sm" />
        <div className="flex items-center gap-2">
          <button onClick={toggleLang} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <Languages className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <CalendarStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        workoutDates={plans.map(p => p.startDate)}
      />

      <main className="max-w-3xl mx-auto p-4 md:p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {!activePlan ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              className="mt-12 text-center bg-card p-10 rounded-2xl border border-border shadow-sm mx-4"
            >
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🛋️</span>
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-2">Rest Day!</h2>
              <p className="text-muted-foreground">{t('restDay')}</p>
            </motion.div>
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

              {activePlan.muscleGroups.map((group, gi) => (
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
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ClientDashboard;
