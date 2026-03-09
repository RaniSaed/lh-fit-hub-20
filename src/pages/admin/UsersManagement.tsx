import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { userService, progressService, type User } from '@/services/mockData';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Trash2, Edit2, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const UsersManagement: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isSuperadmin = currentUser?.role === 'superadmin';

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formUsername, setFormUsername] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [hasMedical, setHasMedical] = useState(false);
  const [formMedical, setFormMedical] = useState('');

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await userService.add({
      username: formUsername,
      phone: formPhone,
      password: formPassword,
      medicalHistory: hasMedical ? formMedical : undefined,
    });
    setIsAddUserOpen(false);
    setFormUsername(''); setFormPhone(''); setFormPassword(''); setHasMedical(false); setFormMedical('');
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

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormPhone(user.phone);
    setHasMedical(!!user.medicalHistory);
    setFormMedical(user.medicalHistory || '');
    setIsEditUserOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteUserOpen(true);
  };

  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">{t('users')}</h1>
        {isSuperadmin && (
          <Button onClick={() => setIsAddUserOpen(true)} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add User
          </Button>
        )}
      </div>

      <Input placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('username')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('phone')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('progressTracker')}</th>
              {isSuperadmin && <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>}
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
                {isSuperadmin && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(user)}>
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteModal(user)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={isSuperadmin ? 4 : 3} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
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
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
              <Button type="submit">Add User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
          </DialogHeader>
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
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">Are you sure you want to delete <strong>{selectedUser?.username}</strong>? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteUserOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default UsersManagement;
