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

const ClientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [coachName, setCoachName] = useState('');

  useEffect(() => {
    if (user) {
      trainingPlanService.getByUser(user.id).then(p => {
        if (p) {
          setPlan(p);
          userService.getById(p.assignedCoach).then(c => setCoachName(c?.username || ''));
        }
      });
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const downloadPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('LH Training Program', 14, 20);
    doc.setFontSize(12);
    doc.text(`Client: ${user?.username}`, 14, 30);
    doc.text(`Coach: ${coachName}`, 14, 37);
    doc.text(`Start: ${plan.startDate}`, 14, 44);

    let y = 55;
    plan.muscleGroups.forEach(group => {
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

    if (plan.coachNotes) {
      doc.setFontSize(12);
      doc.text(`Coach Notes: ${plan.coachNotes}`, 14, y);
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

      <main className="max-w-3xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t('welcome')}, {user?.username} 💪
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t('myWorkout')}</p>
        </motion.div>

        {!plan ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 text-center">
            <Dumbbell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('noplan')}</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Coach: <span className="text-foreground font-medium">{coachName}</span> · Started: <span className="text-foreground font-medium">{plan.startDate}</span>
              </div>
              <Button onClick={downloadPDF} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Download className="w-4 h-4 mr-1" /> {t('downloadPDF')}
              </Button>
            </div>

            {plan.muscleGroups.map((group, gi) => (
              <motion.div
                key={gi}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.08 }}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-card"
              >
                <div className="px-5 py-3 gradient-pink">
                  <h3 className="font-display font-semibold text-primary-foreground">{group.name}</h3>
                </div>
                <div className="p-4 space-y-3">
                  {group.exercises.map(ex => (
                    <div key={ex.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="w-10 h-10 rounded-lg gradient-blue flex items-center justify-center flex-shrink-0">
                        {ex.videoUrl ? (
                          <a href={ex.videoUrl} target="_blank" rel="noreferrer"><Play className="w-5 h-5 text-secondary-foreground" /></a>
                        ) : (
                          <Dumbbell className="w-5 h-5 text-secondary-foreground" />
                        )}
                      </div>
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
              </motion.div>
            ))}

            {/* Cardio */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full gradient-blue inline-block" />
                {t('cardio')}
              </h3>
              <p className="text-sm text-muted-foreground">
                Start: {plan.cardio.startDuration} · End: {plan.cardio.endDuration}
                {plan.cardio.totalHours && ` · Total: ${plan.cardio.totalHours}`}
              </p>
            </div>

            {plan.coachNotes && (
              <div className="bg-card border border-border rounded-xl p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-2">{t('coachNotes')}</h3>
                <p className="text-sm text-muted-foreground">{plan.coachNotes}</p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
