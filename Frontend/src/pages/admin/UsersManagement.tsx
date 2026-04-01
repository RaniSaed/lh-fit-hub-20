import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { userService, progressService, type User } from '@/services/mockData';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Trash2, Edit2, UserPlus, KeyRound, Power } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${isActive
        ? 'bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30'
        : 'bg-red-500/15 text-red-500 ring-1 ring-red-500/30'
      }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const UsersManagement: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isSuperadmin = currentUser?.role === 'superadmin';

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formUsername, setFormUsername] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [hasMedical, setHasMedical] = useState(false);
  const [formMedical, setFormMedical] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchUsers = async () => {
    const allUsers = await userService.getAll();
    setUsers(allUsers);
    const map: Record<string, boolean> = {};
    for (const u of allUsers) {
      const entries = await progressService.getByUser(u.id);
      map[u.id] = entries.length > 0;
    }
    setProgressMap(map);
  };

  useEffect(() => { fetchUsers(); }, []);

  // Optimistic toggle — update UI immediately, sync with server in background
  const handleToggleStatus = async (user: User) => {
    const newStatus = !user.isActive;
    setTogglingId(user.id);
    // Optimistic local update
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u));
    try {
      await userService.toggleStatus(user.id);
    } catch {
      // Revert on failure
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !newStatus } : u));
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await userService.add({
      username: formUsername,
      phone: formPhone,
      password: formPassword,
      medicalHistory: hasMedical ? formMedical : undefined,
      isActive: formIsActive,
    });
    setIsAddUserOpen(false);
    setFormUsername(''); setFormPhone(''); setFormPassword('');
    setHasMedical(false); setFormMedical(''); setFormIsActive(true);
    fetchUsers();
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    await userService.update(selectedUser.id, {
      phone: formPhone,
      medicalHistory: hasMedical ? formMedical : undefined,
    });
    setIsEditUserOpen(false);
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    await userService.remove(selectedUser.id);
    setIsDeleteUserOpen(false);
    fetchUsers();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    await userService.update(selectedUser.id, { password: formPassword });
    setIsResetPasswordOpen(false);
    setFormPassword('');
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormPhone(user.phone);
    setHasMedical(!!user.medicalHistory);
    setFormMedical(user.medicalHistory || '');
    setIsEditUserOpen(true);
  };

  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">{t('users')}</h1>
        {isSuperadmin && (
          <Button onClick={() => setIsAddUserOpen(true)} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add User</span>
          </Button>
        )}
      </div>

      <Input placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />

      {/* ── DESKTOP TABLE (hidden on mobile) ── */}
      <div className="hidden md:block bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('username')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('phone')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('progressTracker')}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{user.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.phone}</td>
                <td className="px-4 py-3">
                  <StatusBadge isActive={user.isActive} />
                </td>
                <td className="px-4 py-3">
                  {progressMap[user.id] && (
                    <button onClick={() => navigate('/admin/progress')} className="flex items-center gap-1 text-primary text-sm hover:underline">
                      <TrendingUp className="w-4 h-4" /> View
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => handleToggleStatus(user)}
                      disabled={togglingId === user.id}
                      title={user.isActive ? 'Deactivate user' : 'Activate user'}
                    />
                    {isSuperadmin && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedUser(user); setFormPassword(''); setIsResetPasswordOpen(true); }}>
                          <KeyRound className="w-4 h-4 text-emerald-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(user)}>
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedUser(user); setIsDeleteUserOpen(true); }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS (shown only on small screens) ── */}
      <div className="md:hidden space-y-3">
        <AnimatePresence>
          {filtered.map(user => (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-card border border-border rounded-xl p-4 shadow-card"
            >
              {/* Top row: name + badge */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{user.username}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{user.phone}</p>
                </div>
                <StatusBadge isActive={user.isActive} />
              </div>

              {/* Large tap-friendly toggle button */}
              <button
                onClick={() => handleToggleStatus(user)}
                disabled={togglingId === user.id}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 ${user.isActive
                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 ring-1 ring-red-500/30'
                    : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 ring-1 ring-emerald-500/30'
                  }`}
              >
                <Power className={`w-4 h-4 ${togglingId === user.id ? 'animate-spin' : ''}`} />
                {togglingId === user.id
                  ? 'Updating...'
                  : user.isActive
                    ? 'Tap to Deactivate'
                    : 'Tap to Activate'}
              </button>

              {/* Secondary actions row */}
              {isSuperadmin && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  {progressMap[user.id] && (
                    <button onClick={() => navigate('/admin/progress')} className="flex items-center gap-1 text-primary text-xs hover:underline mr-auto">
                      <TrendingUp className="w-3.5 h-3.5" /> Progress
                    </button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setSelectedUser(user); setFormPassword(''); setIsResetPasswordOpen(true); }}>
                    <KeyRound className="w-4 h-4 text-emerald-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => openEditModal(user)}>
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setSelectedUser(user); setIsDeleteUserOpen(true); }}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No users found</p>
        )}
      </div>

      {/* ── ADD USER MODAL ── */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input required value={formUsername} onChange={e => setFormUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input required value={formPhone} onChange={e => setFormPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input required type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Medical Condition</Label>
              <Switch checked={hasMedical} onCheckedChange={setHasMedical} />
            </div>
            {hasMedical && (
              <div className="space-y-2">
                <Label>Details</Label>
                <Input required value={formMedical} onChange={e => setFormMedical(e.target.value)} />
              </div>
            )}
            {/* Account Status toggle */}
            <div className={`flex items-center justify-between rounded-lg border px-3 py-3 transition-colors ${formIsActive ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
              <div>
                <p className="text-sm font-medium text-foreground">Account Status</p>
                <p className={`text-xs mt-0.5 ${formIsActive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formIsActive ? '✓ Active — user can log in' : '✗ Inactive — login will be blocked'}
                </p>
              </div>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
              <Button type="submit">Add User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── EDIT USER MODAL ── */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User: {selectedUser?.username}</DialogTitle></DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input required value={formPhone} onChange={e => setFormPhone(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Medical Condition</Label>
              <Switch checked={hasMedical} onCheckedChange={setHasMedical} />
            </div>
            {hasMedical && (
              <div className="space-y-2">
                <Label>Details</Label>
                <Input required value={formMedical} onChange={e => setFormMedical(e.target.value)} />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── DELETE MODAL ── */}
      <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-muted-foreground py-4">Are you sure you want to delete <strong>{selectedUser?.username}</strong>? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteUserOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── RESET PASSWORD MODAL ── */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password: {selectedUser?.username}</DialogTitle></DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input required type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} />
              <p className="text-xs text-muted-foreground">This will permanently overwrite the user's password.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsResetPasswordOpen(false)}>Cancel</Button>
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default UsersManagement;
