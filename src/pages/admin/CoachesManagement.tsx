import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { coachService, type Coach } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const CoachesManagement: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isSuperadmin = user?.role === 'superadmin';
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ username: '', phone: '', password: '' });

  useEffect(() => { coachService.getAll().then(setCoaches); }, []);

  const handleSave = async () => {
    if (!form.username || !form.phone || !form.password) { toast.error('All fields required'); return; }
    if (editId) {
      await coachService.update(editId, form);
      toast.success('Coach updated');
    } else {
      await coachService.add(form);
      toast.success('Coach added');
    }
    coachService.getAll().then(setCoaches);
    setShowForm(false);
    setEditId(null);
    setForm({ username: '', phone: '', password: '' });
  };

  const handleEdit = (coach: Coach) => {
    setForm({ username: coach.username, phone: coach.phone, password: coach.password });
    setEditId(coach.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await coachService.remove(id);
    coachService.getAll().then(setCoaches);
    toast.success('Coach removed');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">{t('coaches')}</h1>
        {isSuperadmin && (
          <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ username: '', phone: '', password: '' }); }} className="gradient-pink text-primary-foreground shadow-pink">
            <Plus className="w-4 h-4 mr-1" /> {t('add')}
          </Button>
        )}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5 mb-6 shadow-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-semibold text-foreground">{editId ? t('edit') : t('add')} Coach</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder={t('username')} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <Input placeholder={t('phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input type="password" placeholder={t('password')} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <Button onClick={handleSave} className="mt-4 gradient-pink text-primary-foreground shadow-pink">{t('save')}</Button>
        </motion.div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('username')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('phone')}</th>
              {isSuperadmin && <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {coaches.map(coach => (
              <tr key={coach.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-foreground">{coach.username}</td>
                <td className="px-4 py-3 text-foreground">{coach.phone}</td>
                {isSuperadmin && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(coach)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(coach.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors ml-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                )}
              </tr>
            ))}
            {coaches.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No coaches yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default CoachesManagement;
