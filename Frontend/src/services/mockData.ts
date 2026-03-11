export interface User {
  id: string;
  username: string;
  phone: string;
  password: string;
  role: 'client' | 'coach' | 'superadmin';
  medicalHistory?: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  machineNumber: string;
  name: string;
  videoUrl: string;
  sets: number;
  reps: number;
}

export interface MuscleGroup {
  name: string;
  nameHe?: string;
  exercises: Exercise[];
}

export interface CardioConfig {
  startDuration: string;
  endDuration: string;
  totalHours?: string;
}

export interface TrainingPlan {
  id: string;
  assignedTo: string;
  assignedCoach: string;
  startDate: string;
  endDate?: string;
  type: 'fullbody' | 'upper_lower';
  muscleGroups: MuscleGroup[];
  cardio: CardioConfig;
  coachNotes: string;
  createdAt: string;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  endDate?: string;
  weight: string;
  fatPercent: string;
  upperAbs: string;
  midAbs: string;
  lowerAbs: string;
  rightArm: string;
  leftArm: string;
  rightThigh: string;
  leftThigh: string;
  glutes: string;
  chest: string;
}

export interface Coach {
  id: string;
  username: string;
  phone: string;
  password: string;
}

// Mock users
const mockUsers: User[] = [
  { id: '1', username: 'superadmin', phone: '0500000000', password: 'admin123!@#', role: 'superadmin', createdAt: '2024-01-01' },
  { id: '2', username: 'coach_mike', phone: '0501111111', password: 'coach123', role: 'coach', createdAt: '2024-02-01' },
  { id: '3', username: 'john_doe', phone: '0502222222', password: 'client123', role: 'client', medicalHistory: 'Lower back injury - herniated disc L4-L5', createdAt: '2024-03-01' },
  { id: '4', username: 'jane_smith', phone: '0503333333', password: 'client123', role: 'client', createdAt: '2024-03-15' },
  { id: '5', username: 'alex_cohen', phone: '0504444444', password: 'client123', role: 'client', medicalHistory: 'Knee surgery recovery - ACL repair', createdAt: '2024-04-01' },
  { id: '6', username: 'sarah_levi', phone: '0505555555', password: 'client123', role: 'client', createdAt: '2024-04-15' },
];

const mockCoaches: Coach[] = [
  { id: '2', username: 'coach_mike', phone: '0501111111', password: 'coach123' },
];

const mockTrainingPlans: TrainingPlan[] = [
  {
    id: 'tp1',
    assignedTo: '3',
    assignedCoach: '2',
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    type: 'fullbody',
    muscleGroups: [
      {
        name: 'Chest', exercises: [
          { id: 'e1', machineNumber: '12', name: 'Bench Press', videoUrl: '', sets: 4, reps: 12 },
          { id: 'e2', machineNumber: '14', name: 'Chest Fly', videoUrl: '', sets: 3, reps: 15 },
        ]
      },
      {
        name: 'Back', exercises: [
          { id: 'e3', machineNumber: '8', name: 'Lat Pulldown', videoUrl: '', sets: 4, reps: 10 },
        ]
      },
      {
        name: 'Shoulders', exercises: [
          { id: 'e4', machineNumber: '6', name: 'Shoulder Press', videoUrl: '', sets: 3, reps: 12 },
        ]
      },
      {
        name: 'Arms', exercises: [
          { id: 'e5', machineNumber: '22', name: 'Bicep Curl', videoUrl: '', sets: 3, reps: 15 },
        ]
      },
      {
        name: 'Abs', exercises: [
          { id: 'e6', machineNumber: '-', name: 'Crunches', videoUrl: '', sets: 3, reps: 20 },
        ]
      },
      {
        name: 'Legs', exercises: [
          { id: 'e7', machineNumber: '30', name: 'Leg Press', videoUrl: '', sets: 4, reps: 12 },
        ]
      },
    ],
    cardio: { startDuration: '10-15 min', endDuration: '20-30 min' },
    coachNotes: 'Focus on form, avoid heavy weights on back exercises due to medical condition.',
    createdAt: '2024-06-01',
  }
];

const mockProgress: ProgressEntry[] = [
  { id: 'p1', userId: '3', date: '2024-06-01', endDate: '2024-06-30', weight: '85', fatPercent: '22', upperAbs: '90', midAbs: '88', lowerAbs: '92', rightArm: '35', leftArm: '34', rightThigh: '58', leftThigh: '57', glutes: '100', chest: '105' },
  { id: 'p2', userId: '3', date: '2024-07-01', endDate: '', weight: '83', fatPercent: '20', upperAbs: '88', midAbs: '86', lowerAbs: '90', rightArm: '36', leftArm: '35', rightThigh: '57', leftThigh: '56', glutes: '99', chest: '104' },
];

// API Base URL — set VITE_API_URL in Vercel env vars to point at your Render backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('lh_access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const authService = {
  login: async (username: string, password: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) return null;
      const data = await res.json();
      localStorage.setItem('lh_access_token', data.token);
      return data.user;
    } catch (e) {
      console.error('Login failed', e);
      return null;
    }
  },
  changePassword: async (oldPass: string, newPass: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ old_password: oldPass, new_password: newPass })
    });
    return res.ok;
  },
};

export const userService = {
  getAll: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/users/`, { headers: getAuthHeaders() });
    return res.json();
  },
  getById: async (id: string): Promise<User | undefined> => {
    const res = await fetch(`${API_URL}/users/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) return undefined;
    return res.json();
  },
  getAllAdmins: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/users/admins`, { headers: getAuthHeaders() });
    return res.json();
  },
  add: async (user: Omit<User, 'id' | 'createdAt' | 'role'> & { role?: User['role'] }): Promise<User> => {
    const res = await fetch(`${API_URL}/users/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user)
    });
    return res.json();
  },
  update: async (id: string, data: Partial<User>): Promise<User | null> => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return res.json();
  },
  remove: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.ok;
  },
};

export const coachService = {
  getAll: async (): Promise<Coach[]> => {
    return userService.getAllAdmins(); // For simplicity, we fetch admins
  },
  add: async (coach: Omit<Coach, 'id'>): Promise<Coach> => {
    return userService.add({ ...coach, role: 'coach' }) as any;
  },
  update: async (id: string, data: Partial<Coach>): Promise<Coach | null> => {
    return userService.update(id, data) as any;
  },
  remove: async (id: string): Promise<boolean> => {
    return userService.remove(id);
  },
};

export const trainingPlanService = {
  getAll: async (): Promise<TrainingPlan[]> => {
    const res = await fetch(`${API_URL}/workouts/`, { headers: getAuthHeaders() });
    return res.json();
  },
  getByUser: async (userId: string): Promise<TrainingPlan[]> => {
    const res = await fetch(`${API_URL}/workouts/?userId=${userId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  create: async (plan: Omit<TrainingPlan, 'id' | 'createdAt'>, overwriteId?: string): Promise<TrainingPlan> => {
    const url = overwriteId ? `${API_URL}/workouts/?overwriteId=${overwriteId}` : `${API_URL}/workouts/`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(plan)
    });
    return res.json();
  },
};

export const progressService = {
  getByUser: async (userId: string): Promise<ProgressEntry[]> => {
    const res = await fetch(`${API_URL}/progress/?userId=${userId}`, { headers: getAuthHeaders() });
    return res.json();
  },
  addEntry: async (entry: Omit<ProgressEntry, 'id'>, overwriteId?: string): Promise<ProgressEntry> => {
    const url = overwriteId ? `${API_URL}/progress/?overwriteId=${overwriteId}` : `${API_URL}/progress/`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entry)
    });
    return res.json();
  },
};
