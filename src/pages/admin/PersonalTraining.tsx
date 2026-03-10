import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { userService, trainingPlanService, type User, type MuscleGroup, type Exercise } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import VideoUpload from '@/components/video/VideoUpload';

const fullBodyGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Abs', 'Legs'];
const upperGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Abs'];
const lowerGroups = ['Legs', 'Abs'];

const emptyExercise = (): Exercise => ({
  id: String(Date.now() + Math.random()),
  machineNumber: '',
  name: '',
  videoUrl: '',
  sets: 3,
  reps: 12,
});

const PersonalTraining: React.FC = () => {
  const { t } = useLanguage();
  const [clients, setClients] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [trainingType, setTrainingType] = useState<'fullbody' | 'upper_lower'>('fullbody');
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [cardioStart, setCardioStart] = useState('10-15 min');
  const [cardioEnd, setCardioEnd] = useState('20-30 min');
  const [cardioTotal, setCardioTotal] = useState('1 hour');
  const [coachNotes, setCoachNotes] = useState('');
  const [assignedCoach, setAssignedCoach] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);
  const [existingPlanId, setExistingPlanId] = useState<string | null>(null);

  useEffect(() => {
    userService.getAll().then(setClients);
    userService.getAllAdmins().then(setAdmins);
  }, []);

  useEffect(() => {
    const groups = trainingType === 'fullbody' ? fullBodyGroups : [...upperGroups, ...lowerGroups];
    setMuscleGroups(groups.map(name => ({ name, exercises: [emptyExercise()] })));
  }, [trainingType]);

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
    const client = clients.find(c => c.id === userId);
    setSelectedClient(client || null);
  };

  const addExercise = (groupIdx: number) => {
    const updated = [...muscleGroups];
    updated[groupIdx].exercises.push(emptyExercise());
    setMuscleGroups(updated);
  };

  const removeExercise = (groupIdx: number, exIdx: number) => {
    const updated = [...muscleGroups];
    updated[groupIdx].exercises.splice(exIdx, 1);
    setMuscleGroups(updated);
  };

  const updateExercise = (groupIdx: number, exIdx: number, field: keyof Exercise, value: string | number) => {
    const updated = [...muscleGroups];
    (updated[groupIdx].exercises[exIdx] as any)[field] = value;
    setMuscleGroups(updated);
  };

  const handlePreSubmit = async () => {
    if (!selectedUser || !startDate) { toast.error('Please select a user and start date'); return; }

    const existing = await trainingPlanService.getByUser(selectedUser);
    const overlapping = existing.find(p => p.startDate === startDate);

    if (overlapping) {
      setExistingPlanId(overlapping.id);
      setShowOverwriteModal(true);
      return;
    }

    await executeSubmit();
  };

  const executeSubmit = async (overwriteId?: string) => {
    await trainingPlanService.create({
      assignedTo: selectedUser,
      assignedCoach: assignedCoach,
      startDate,
      endDate: endDate || undefined,
      type: trainingType,
      muscleGroups,
      cardio: { startDuration: cardioStart, endDuration: cardioEnd, totalHours: cardioTotal },
      coachNotes,
    }, overwriteId);
    toast.success('Training plan saved!');
    setShowOverwriteModal(false);
    setExistingPlanId(null);
  };

  const filteredClients = clients.filter(c => c.username.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">{t('personalTraining')}</h1>

      {/* User Selection */}
      <div className="glass rounded-3xl p-6 sm:p-8 mb-6 shadow-card">
        <label className="text-sm font-medium text-foreground">{t('selectUser')}</label>
        <Input
          placeholder={t('search')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="mt-2 mb-2"
        />
        {searchQuery && (
          <div className="border border-border rounded-lg max-h-40 overflow-auto">
            {filteredClients.map(c => (
              <button
                key={c.id}
                onClick={() => { handleSelectUser(c.id); setSearchQuery(c.username); }}
                className="w-full text-left px-4 py-2 hover:bg-muted text-sm text-foreground transition-colors"
              >
                {c.username} — {c.phone}
              </button>
            ))}
          </div>
        )}

        {selectedClient?.medicalHistory && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
              <AlertTriangle className="w-5 h-5" />
              {t('medicalWarning')}
            </div>
            <button onClick={() => setShowMedicalModal(true)} className="text-sm text-primary underline mt-1 flex items-center gap-1">
              <Eye className="w-3 h-3" /> {t('viewPersonalInfo')}
            </button>
          </motion.div>
        )}

        {showMedicalModal && selectedClient?.medicalHistory && (
          <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMedicalModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card rounded-xl p-6 max-w-md w-full shadow-card" onClick={e => e.stopPropagation()}>
              <h3 className="font-display font-bold text-foreground text-lg mb-2">Medical History</h3>
              <p className="text-foreground text-sm">{selectedClient.medicalHistory}</p>
              <p className="text-muted-foreground text-sm mt-2">Phone: {selectedClient.phone}</p>
              <Button onClick={() => setShowMedicalModal(false)} className="mt-4 gradient-pink text-primary-foreground">Close</Button>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium text-foreground">{t('startDate')}</label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">End Date (Optional)</label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1" min={startDate} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">{t('trainingType')}</label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setTrainingType('fullbody')}
                className={`flex-1 py-2 text-sm rounded-lg border transition-all ${trainingType === 'fullbody' ? 'gradient-pink text-primary-foreground border-transparent shadow-pink' : 'border-border text-foreground'}`}
              >
                {t('fullBody')}
              </button>
              <button
                onClick={() => setTrainingType('upper_lower')}
                className={`flex-1 py-2 text-sm rounded-lg border transition-all ${trainingType === 'upper_lower' ? 'gradient-pink text-primary-foreground border-transparent shadow-pink' : 'border-border text-foreground'}`}
              >
                {t('upperLower')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Muscle Groups */}
      {trainingType === 'upper_lower' && (
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">{t('upperBody')}</h2>
      )}

      {muscleGroups.map((group, gi) => {
        const isLowerStart = trainingType === 'upper_lower' && group.name === 'Legs';
        return (
          <React.Fragment key={gi}>
            {isLowerStart && (
              <h2 className="text-lg font-display font-semibold text-foreground mb-3 mt-6">{t('lowerBody')}</h2>
            )}
            <div className="bg-card border border-border rounded-xl p-5 mb-4 shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full gradient-pink inline-block" />
                {t(group.name.toLowerCase()) || group.name}
              </h3>

              {group.exercises.map((ex, ei) => (
                <div key={ex.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-2 items-start border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="sm:col-span-3 space-y-2">
                    <Input placeholder={t('machineName')} value={ex.machineNumber} onChange={e => updateExercise(gi, ei, 'machineNumber', e.target.value)} className="text-sm" />
                    <Input placeholder={t('exerciseName')} value={ex.name} onChange={e => updateExercise(gi, ei, 'name', e.target.value)} className="text-sm" />
                  </div>

                  <div className="sm:col-span-5 h-full">
                    <VideoUpload videoUrl={ex.videoUrl} onChange={(val) => updateExercise(gi, ei, 'videoUrl', val)} />
                  </div>

                  <div className="sm:col-span-3 flex gap-1 h-full items-center">
                    <Input type="number" placeholder={t('sets')} value={ex.sets} onChange={e => updateExercise(gi, ei, 'sets', Number(e.target.value))} className="text-sm w-16" />
                    <span className="self-center text-muted-foreground">×</span>
                    <Input type="number" placeholder={t('reps')} value={ex.reps} onChange={e => updateExercise(gi, ei, 'reps', Number(e.target.value))} className="text-sm w-16" />
                  </div>

                  <div className="sm:col-span-1 h-full flex items-center justify-end">
                    <button onClick={() => removeExercise(gi, ei)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={() => addExercise(gi)} className="flex items-center gap-1 text-sm text-primary hover:underline mt-2">
                <Plus className="w-4 h-4" /> {t('add')} Exercise
              </button>
            </div>
          </React.Fragment>
        );
      })}

      {/* Cardio */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full gradient-blue inline-block" />
          {t('cardio')}
        </h3>
        {trainingType === 'fullbody' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Start of Day Duration</label>
              <Input value={cardioStart} onChange={e => setCardioStart(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">End of Day Duration</label>
              <Input value={cardioEnd} onChange={e => setCardioEnd(e.target.value)} className="mt-1" />
            </div>
          </div>
        ) : (
          <div>
            <label className="text-sm text-muted-foreground">Total Hours per Day</label>
            <Input value={cardioTotal} onChange={e => setCardioTotal(e.target.value)} className="mt-1" />
          </div>
        )}
      </div>

      {/* Coach Notes & Assignment */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-card space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">{t('coachNotes')}</label>
          <Textarea value={coachNotes} onChange={e => setCoachNotes(e.target.value)} className="mt-1" rows={3} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">{t('assignCoach')}</label>
          <select
            value={assignedCoach}
            onChange={e => setAssignedCoach(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm"
          >
            <option value="">-- Select --</option>
            {admins.map(a => (
              <option key={a.id} value={a.id}>{a.username}</option>
            ))}
          </select>
        </div>
      </div>

      <Button onClick={handlePreSubmit} className="gradient-pink text-primary-foreground shadow-pink hover:opacity-90 w-full sm:w-auto px-8 py-3">
        {t('createPlan')}
      </Button>

      {/* Overwrite Confirmation Modal */}
      {showOverwriteModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setShowOverwriteModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass border border-border/40 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-foreground text-xl mb-2">Be Careful!</h3>
            <p className="text-muted-foreground text-sm mb-6">
              You are about to override a training plan that already exists on <strong className="text-foreground">{startDate}</strong> for this user. Are you sure you want to replace it?
            </p>
            <div className="flex gap-3 grid-cols-2 w-full">
              <Button onClick={() => setShowOverwriteModal(false)} variant="outline" className="flex-1 rounded-xl">No</Button>
              <Button onClick={() => executeSubmit(existingPlanId || undefined)} className="flex-1 gradient-pink text-white shadow-pink rounded-xl">Yes, Replace</Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default PersonalTraining;
