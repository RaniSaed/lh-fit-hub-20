import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LHLogo } from '@/components/LHLogo';
import { Dumbbell, TrendingUp, Users, UserCog, LogOut, Languages, Menu, X, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const navItems = [
  { key: 'personalTraining', path: '/admin/training', icon: Dumbbell },
  { key: 'progressTracker', path: '/admin/progress', icon: TrendingUp },
  { key: 'coaches', path: '/admin/coaches', icon: UserCog },
  { key: 'users', path: '/admin/users', icon: Users },
];

const AdminLayout: React.FC = () => {
  const { user, logout, changePassword } = useAuth();
  const { t, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!oldPassword || !newPassword) {
      setPasswordError('Both fields are required');
      return;
    }

    const success = await changePassword(oldPassword, newPassword);
    if (success) {
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(false);
      }, 2000);
    } else {
      setPasswordError('Incorrect current password or failed to update');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <LHLogo size="md" />
          <p className="text-xs text-sidebar-foreground/60 mt-1">{t('admin')} Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${active ? 'gradient-pink text-primary-foreground shadow-pink hover:opacity-90 hover:-translate-y-0.5' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-primary'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {t(item.key)}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <button onClick={toggleLang} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-colors">
            <Languages className="w-4 h-4" />
            {t('translateArabic')}
          </button>
          <button onClick={() => setIsPasswordModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-colors">
            <KeyRound className="w-4 h-4" />
            Change Password
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile Header + Glass Drawer */}
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between p-4 glass-header">
          <LHLogo size="sm" />
          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <Languages className="w-5 h-5" />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-[73px] left-0 right-0 z-50 md:hidden glass border-b border-border/50 p-4 space-y-2 rounded-b-3xl shadow-2xl"
          >
            {navItems.map(item => {
              const active = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.key}
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${active ? 'gradient-pink text-primary-foreground shadow-pink' : 'text-foreground hover:bg-foreground/5'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {t(item.key)}
                </button>
              );
            })}
            <button onClick={() => { setIsPasswordModalOpen(true); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-foreground hover:bg-foreground/5 transition-colors mt-4">
              <KeyRound className="w-5 h-5" />
              Change Password
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors mt-2">
              <LogOut className="w-5 h-5" />
              {t('logout')}
            </button>
          </motion.div>
        )}

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-green-500 font-medium">Password updated successfully!</p>}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLayout;
