import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { userService, progressService, type User, type ProgressEntry } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const columns = [
  { key: 'date', he: 'תאריך', en: 'Date' },
  { key: 'endDate', he: 'עד תאריך', en: 'End Date' },
  { key: 'weight', he: 'משקל', en: 'Weight (kg)' },
  { key: 'fatPercent', he: 'אחוז שומן', en: 'Fat %' },
  { key: 'upperAbs', he: 'בטן עליונה', en: 'Upper Abs' },
  { key: 'midAbs', he: 'בטן אמצע', en: 'Mid Abs' },
  { key: 'lowerAbs', he: 'בטן תחתונה', en: 'Lower Abs' },
  { key: 'rightArm', he: 'זרוע ימין', en: 'Right Arm' },
  { key: 'leftArm', he: 'זרוע שמאל', en: 'Left Arm' },
  { key: 'rightThigh', he: 'ירך ימין', en: 'Right Thigh' },
  { key: 'leftThigh', he: 'ירך שמאל', en: 'Left Thigh' },
  { key: 'glutes', he: 'עכוז', en: 'Glutes' },
  { key: 'chest', he: 'חזה', en: 'Chest' },
];

const ProgressTracker: React.FC = () => {
  const { t } = useLanguage();
  const [clients, setClients] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRow, setNewRow] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);
  const [existingProgressId, setExistingProgressId] = useState<string | null>(null);

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  const targetDate = newRow.date || todayStr;

  useEffect(() => { userService.getAll().then(setClients); }, []);

  useEffect(() => {
    if (selectedUser) {
      progressService.getByUser(selectedUser).then(setEntries);
    }
  }, [selectedUser]);

  const filteredClients = clients.filter(c => c.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const handlePreSubmit = async () => {
    if (!selectedUser) return;

    const existing = await progressService.getByUser(selectedUser);
    const overlapping = existing.find(p => p.date === targetDate);

    if (overlapping) {
      setExistingProgressId(overlapping.id);
      setShowOverwriteModal(true);
      return;
    }

    await executeSubmit();
  };

  const executeSubmit = async (overwriteId?: string) => {
    const entry = await progressService.addEntry({
      userId: selectedUser,
      date: targetDate,
      endDate: newRow.endDate || undefined,
      weight: newRow.weight || '',
      fatPercent: newRow.fatPercent || '',
      upperAbs: newRow.upperAbs || '',
      midAbs: newRow.midAbs || '',
      lowerAbs: newRow.lowerAbs || '',
      rightArm: newRow.rightArm || '',
      leftArm: newRow.leftArm || '',
      rightThigh: newRow.rightThigh || '',
      leftThigh: newRow.leftThigh || '',
      glutes: newRow.glutes || '',
      chest: newRow.chest || '',
    }, overwriteId);

    if (overwriteId) {
      setEntries(entries.map(e => e.id === overwriteId ? entry : e));
    } else {
      setEntries([...entries, entry]);
    }

    setNewRow({});
    setShowAdd(false);
    setShowOverwriteModal(false);
    setExistingProgressId(null);
    toast.success('Entry saved!');
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text('Training Progress', 14, 15);
    const client = clients.find(c => c.id === selectedUser);
    if (client) doc.text(`Client: ${client.username}`, 14, 24);

    autoTable(doc, {
      startY: 30,
      head: [columns.map(c => c.en)],
      body: entries.map(e => columns.map(c => (e as any)[c.key] || '')),
      headStyles: {
        fillColor: [16, 127, 123],
        halign: 'center',
      },
      styles: {
        halign: 'center',
      },
    });
    doc.save('progress.pdf');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">{t('progressTracker')}</h1>

      <div className="glass rounded-3xl p-6 sm:p-8 mb-6 shadow-card border-border/40">
        <label className="text-sm font-medium text-foreground">{t('selectUser')}</label>
        <Input placeholder={t('search')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mt-2 mb-2" />
        {searchQuery && !selectedUser && (
          <div className="border border-border rounded-lg max-h-40 overflow-auto">
            {filteredClients.map(c => (
              <button key={c.id} onClick={() => { setSelectedUser(c.id); setSearchQuery(c.username); }}
                className="w-full text-left px-4 py-2 hover:bg-muted text-sm text-foreground transition-colors">
                {c.username}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="overflow-x-auto glass rounded-3xl shadow-card border-border/40 scrollbar-hide">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="border-b border-border">
                  {columns.map(c => (
                    <th key={c.key} className="px-3 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">{c.he}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    {columns.map(c => (
                      <td key={c.key} className="px-3 py-2 text-foreground whitespace-nowrap">{(entry as any)[c.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showAdd && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-6 sm:p-8 mt-6 shadow-card border-border/40">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {columns.map(c => (
                  <div key={c.key}>
                    <label className="text-xs text-muted-foreground">{c.he}</label>
                    <Input
                      type={(c.key === 'date' || c.key === 'endDate') ? 'date' : 'text'}
                      value={newRow[c.key] || ''}
                      onChange={e => setNewRow({ ...newRow, [c.key]: e.target.value })}
                      className="mt-0.5 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handlePreSubmit} className="gradient-pink text-primary-foreground shadow-pink">{t('save')}</Button>
                <Button variant="outline" onClick={() => setShowAdd(false)}>{t('cancel')}</Button>
              </div>
            </motion.div>
          )}

          <div className="flex gap-2 mt-4">
            <Button onClick={() => setShowAdd(true)} className="gradient-pink text-primary-foreground shadow-pink">{t('addRow')}</Button>
            <Button variant="outline" onClick={exportPDF} className="border-secondary text-secondary-foreground">{t('exportPDF')}</Button>
          </div>

          {/* Overwrite Confirmation Modal */}
          {showOverwriteModal && (
            <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setShowOverwriteModal(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass border border-border/40 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-foreground text-xl mb-2">Be Careful!</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  You are about to override a progress tracker entry that already exists on <strong className="text-foreground">{targetDate}</strong> for this user. Are you sure you want to replace it?
                </p>
                <div className="flex gap-3 grid-cols-2 w-full">
                  <Button onClick={() => setShowOverwriteModal(false)} variant="outline" className="flex-1 rounded-xl">No</Button>
                  <Button onClick={() => executeSubmit(existingProgressId || undefined)} className="flex-1 gradient-pink text-white shadow-pink rounded-xl">Yes, Replace</Button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressTracker;
