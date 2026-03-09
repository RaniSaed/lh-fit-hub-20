import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LHLogo } from '@/components/LHLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Languages } from 'lucide-react';

const Login: React.FC = () => {
  const { login, signup, loading } = useAuth();
  const { t, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState<'client' | 'admin' | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!username || !phone || !password) { setError('All fields are required'); return; }
      const user = await signup(username, phone, password);
      if (user) navigate('/client/dashboard');
    } else {
      const user = await login(username, password);
      if (!user) { setError('Invalid credentials'); return; }
      if (role === 'admin' && user.role === 'client') { setError('Not an admin account'); return; }
      if (user.role === 'client') navigate('/client/dashboard');
      else navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <button onClick={toggleLang} className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
        <Languages className="w-4 h-4" />
        {t('translateArabic')}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <LHLogo size="lg" />
          <p className="text-muted-foreground mt-2 text-sm">Gym & Personal Training</p>
        </div>

        <AnimatePresence mode="wait">
          {!role ? (
            <motion.div key="role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-center text-muted-foreground mb-6">{t('login')} as</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setRole('client')}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary transition-all shadow-card hover:shadow-pink group"
                >
                  <User className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-display font-semibold text-foreground">{t('client')}</span>
                </button>
                <button
                  onClick={() => { setRole('admin'); setMode('signin'); }}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-secondary transition-all shadow-card group"
                >
                  <Shield className="w-10 h-10 text-muted-foreground group-hover:text-secondary transition-colors" />
                  <span className="font-display font-semibold text-foreground">{t('admin')}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-xl border border-border p-6 shadow-card bg-card">
                {role === 'client' && (
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setMode('signin')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'signin' ? 'gradient-pink text-primary-foreground shadow-pink' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {t('login')}
                    </button>
                    <button
                      onClick={() => setMode('signup')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'signup' ? 'gradient-pink text-primary-foreground shadow-pink' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {t('signup')}
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">{t('username')}</label>
                    <Input value={username} onChange={e => setUsername(e.target.value)} className="mt-1" />
                  </div>
                  {mode === 'signup' && (
                    <div>
                      <label className="text-sm font-medium text-foreground">{t('phone')}</label>
                      <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-foreground">{t('password')}</label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1" />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full gradient-pink text-primary-foreground shadow-pink hover:opacity-90 transition-opacity" disabled={loading}>
                    {loading ? '...' : mode === 'signup' ? t('signup') : t('login')}
                  </Button>
                </form>

                <button onClick={() => { setRole(null); setError(''); }} className="mt-4 text-sm text-muted-foreground hover:text-foreground w-full text-center">
                  ← Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
