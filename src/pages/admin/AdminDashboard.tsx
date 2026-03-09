import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Dumbbell, TrendingUp, UserCog, Users } from 'lucide-react';

const cards = [
  { key: 'personalTraining', path: '/admin/training', icon: Dumbbell, color: 'gradient-pink' },
  { key: 'progressTracker', path: '/admin/progress', icon: TrendingUp, color: 'gradient-blue' },
  { key: 'coaches', path: '/admin/coaches', icon: UserCog, color: 'gradient-pink' },
  { key: 'users', path: '/admin/users', icon: Users, color: 'gradient-blue' },
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          {t('welcome')}, {user?.username} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {user?.role === 'superadmin' ? 'Superadmin' : 'Coach'} {t('dashboard')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {cards.map((card, i) => (
          <motion.button
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(card.path)}
            className={`${card.color} text-primary-foreground p-6 rounded-xl shadow-card hover:scale-[1.02] transition-transform text-left`}
          >
            <card.icon className="w-8 h-8 mb-3 opacity-80" />
            <span className="font-display font-semibold text-lg">{t(card.key)}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
