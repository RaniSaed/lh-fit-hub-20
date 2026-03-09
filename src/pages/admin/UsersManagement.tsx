import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { userService, progressService, type User } from '@/services/mockData';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const UsersManagement: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    userService.getAll().then(async (allUsers) => {
      setUsers(allUsers);
      const map: Record<string, boolean> = {};
      for (const u of allUsers) {
        const entries = await progressService.getByUser(u.id);
        map[u.id] = entries.length > 0;
      }
      setProgressMap(map);
    });
  }, []);

  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">{t('users')}</h1>

      <Input placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('username')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('phone')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('progressTracker')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-foreground">{user.username}</td>
                <td className="px-4 py-3 text-foreground">{user.phone}</td>
                <td className="px-4 py-3">
                  {progressMap[user.id] && (
                    <button
                      onClick={() => navigate('/admin/progress')}
                      className="flex items-center gap-1 text-primary text-sm hover:underline"
                    >
                      <TrendingUp className="w-4 h-4" /> View
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default UsersManagement;
