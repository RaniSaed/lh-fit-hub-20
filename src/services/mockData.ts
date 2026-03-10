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

// Helper functions for localStorage
const loadData = <T>(key: string, deafultData: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Failed to parse ${key} from localStorage`, e);
      return deafultData;
    }
  }
  return deafultData;
};

const saveData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Service functions
let users = loadData<User>('lh_users', [...mockUsers]);
let coaches = loadData<Coach>('lh_coaches', [...mockCoaches]);
let trainingPlans = loadData<TrainingPlan>('lh_plans', [...mockTrainingPlans]);
let progress = loadData<ProgressEntry>('lh_progress', [...mockProgress]);

export const authService = {
  login: async (username: string, password: string): Promise<User | null> => {
    await new Promise(r => setTimeout(r, 500));
    // 1. Check coaches first
    const coach = coaches.find(c => c.username === username && c.password === password);
    if (coach) {
      // Return a User object for the coach to satisfy the AuthContext interface
      return {
        id: coach.id,
        username: coach.username,
        phone: coach.phone,
        password: coach.password,
        role: 'coach',
        createdAt: new Date().toISOString().split('T')[0] // or a stored date if we start tracking it
      };
    }
    // 2. Check users list
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
  },
  signup: async (username: string, phone: string, password: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 500));
    const newUser: User = {
      id: String(Date.now()),
      username, phone, password,
      role: 'client',
      createdAt: new Date().toISOString().split('T')[0],
    };
    users.push(newUser);
    saveData('lh_users', users);
    return newUser;
  },
};

export const userService = {
  getAll: async (): Promise<User[]> => {
    await new Promise(r => setTimeout(r, 300));
    return users.filter(u => u.role === 'client');
  },
  getById: async (id: string): Promise<User | undefined> => {
    return users.find(u => u.id === id);
  },
  getAllAdmins: async (): Promise<User[]> => {
    return users.filter(u => u.role === 'coach' || u.role === 'superadmin');
  },
  add: async (user: Omit<User, 'id' | 'createdAt' | 'role'> & { role?: User['role'] }): Promise<User> => {
    const newUser: User = {
      ...user,
      id: String(Date.now()),
      role: user.role || 'client',
      createdAt: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    saveData('lh_users', users);
    return newUser;
  },
  update: async (id: string, data: Partial<User>): Promise<User | null> => {
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data };
    saveData('lh_users', users);
    return users[idx];
  },
  remove: async (id: string): Promise<boolean> => {
    users = users.filter(u => u.id !== id);
    saveData('lh_users', users);
    return true;
  },
};

export const coachService = {
  getAll: async (): Promise<Coach[]> => {
    await new Promise(r => setTimeout(r, 300));
    return coaches;
  },
  add: async (coach: Omit<Coach, 'id'>): Promise<Coach> => {
    const newCoach: Coach = { ...coach, id: String(Date.now()) };
    coaches.push(newCoach);
    saveData('lh_coaches', coaches);
    const newUser: User = { ...newCoach, role: 'coach', createdAt: new Date().toISOString().split('T')[0] };
    users.push(newUser);
    saveData('lh_users', users);
    return newCoach;
  },
  update: async (id: string, data: Partial<Coach>): Promise<Coach | null> => {
    const idx = coaches.findIndex(c => c.id === id);
    if (idx === -1) return null;
    coaches[idx] = { ...coaches[idx], ...data };
    saveData('lh_coaches', coaches);
    return coaches[idx];
  },
  remove: async (id: string): Promise<boolean> => {
    coaches = coaches.filter(c => c.id !== id);
    saveData('lh_coaches', coaches);
    users = users.filter(u => u.id !== id);
    saveData('lh_users', users);
    return true;
  },
};

export const trainingPlanService = {
  getAll: async (): Promise<TrainingPlan[]> => {
    await new Promise(r => setTimeout(r, 300));
    return trainingPlans;
  },
  getByUser: async (userId: string): Promise<TrainingPlan[]> => {
    await new Promise(r => setTimeout(r, 300));
    return trainingPlans.filter(tp => tp.assignedTo === userId);
  },
  create: async (plan: Omit<TrainingPlan, 'id' | 'createdAt'>, overwriteId?: string): Promise<TrainingPlan> => {
    if (overwriteId) {
      const idx = trainingPlans.findIndex(p => p.id === overwriteId);
      if (idx !== -1) {
        trainingPlans[idx] = { ...plan, id: overwriteId, createdAt: trainingPlans[idx].createdAt };
        saveData('lh_plans', trainingPlans);
        return trainingPlans[idx];
      }
    }
    const newPlan: TrainingPlan = { ...plan, id: String(Date.now()), createdAt: new Date().toISOString().split('T')[0] };
    trainingPlans.push(newPlan);
    saveData('lh_plans', trainingPlans);
    return newPlan;
  },
};

export const progressService = {
  getByUser: async (userId: string): Promise<ProgressEntry[]> => {
    await new Promise(r => setTimeout(r, 300));
    return progress.filter(p => p.userId === userId);
  },
  addEntry: async (entry: Omit<ProgressEntry, 'id'>, overwriteId?: string): Promise<ProgressEntry> => {
    if (overwriteId) {
      const idx = progress.findIndex(p => p.id === overwriteId);
      if (idx !== -1) {
        progress[idx] = { ...entry, id: overwriteId };
        saveData('lh_progress', progress);
        return progress[idx];
      }
    }
    const newEntry: ProgressEntry = { ...entry, id: String(Date.now()) };
    progress.push(newEntry);
    saveData('lh_progress', progress);
    return newEntry;
  },
};
