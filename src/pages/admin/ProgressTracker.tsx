import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { userService, progressService, type User, type ProgressEntry } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const columns = [
  { key: 'date', he: 'תאריך' },
  { key: 'weight', he: 'משקל' },
  { key: 'fatPercent', he: 'אחוז שומן' },
  { key: 'upperAbs', he: 'בטן עליונה' },
  { key: 'midAbs', he: 'בטן אמצע' },
  { key: 'lowerAbs', he: 'בטן תחתונה' },
  { key: 'rightArm', he: 'זרוע ימין' },
  { key: 'leftArm', he: 'זרוע שמאל' },
  { key: 'rightThigh', he: 'ירך ימין' },
  { key: 'leftThigh', he: 'ירך שמאל' },
  { key: 'glutes', he: 'עכוז' },
  { key: 'chest', he: 'חזה' },
];

const ProgressTracker: React.FC = () => {
  const { t } = useLanguage();
  const [clients, setClients] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRow, setNewRow] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { userService.getAll().then(setClients); }, []);

  useEffect(() => {
    if (selectedUser) {
      progressService.getByUser(selectedUser).then(setEntries);
    }
  }, [selectedUser]);

  const filteredClients = clients.filter(c => c.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddRow = async () => {
    if (!selectedUser) return;
    const now = new Date();
    const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const entry = await progressService.addEntry({
      userId: selectedUser,
      date: newRow.date || localDateStr,
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
    });
    setEntries([...entries, entry]);
    setNewRow({});
    setShowAdd(false);
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
      head: [columns.map(c => c.he)],
      body: entries.map(e => columns.map(c => (e as any)[c.key] || '')),
    });
    doc.save('progress.pdf');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">{t('progressTracker')}</h1>

      <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-card">
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
          <div className="overflow-x-auto bg-card border border-border rounded-xl shadow-card">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-4 mt-4 shadow-card">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {columns.map(c => (
                  <div key={c.key}>
                    <label className="text-xs text-muted-foreground">{c.he}</label>
                    <Input
                      type={c.key === 'date' ? 'date' : 'text'}
                      value={newRow[c.key] || ''}
                      onChange={e => setNewRow({ ...newRow, [c.key]: e.target.value })}
                      className="mt-0.5 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddRow} className="gradient-pink text-primary-foreground shadow-pink">{t('save')}</Button>
                <Button variant="outline" onClick={() => setShowAdd(false)}>{t('cancel')}</Button>
              </div>
            </motion.div>
          )}

          <div className="flex gap-2 mt-4">
            <Button onClick={() => setShowAdd(true)} className="gradient-pink text-primary-foreground shadow-pink">{t('addRow')}</Button>
            <Button variant="outline" onClick={exportPDF} className="border-secondary text-secondary-foreground">{t('exportPDF')}</Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressTracker;
