import React, { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'en' | 'ar';

interface Translations {
  [key: string]: { en: string; ar: string };
}

const translations: Translations = {
  login: { en: 'Login', ar: 'تسجيل الدخول' },
  signup: { en: 'Sign Up', ar: 'إنشاء حساب' },
  username: { en: 'Username', ar: 'اسم المستخدم' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  phone: { en: 'Phone Number', ar: 'رقم الهاتف' },
  client: { en: 'Client', ar: 'عميل' },
  admin: { en: 'Admin', ar: 'مدير' },
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  personalTraining: { en: 'Personal Training', ar: 'التدريب الشخصي' },
  progressTracker: { en: 'Progress Tracker', ar: 'متتبع التقدم' },
  coaches: { en: 'Coaches', ar: 'المدربين' },
  users: { en: 'Users', ar: 'المستخدمين' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  add: { en: 'Add', ar: 'إضافة' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  search: { en: 'Search...', ar: 'بحث...' },
  selectUser: { en: 'Select User', ar: 'اختر مستخدم' },
  startDate: { en: 'Start Date', ar: 'تاريخ البدء' },
  trainingType: { en: 'Training Type', ar: 'نوع التدريب' },
  fullBody: { en: 'Full Body', ar: 'تمرين كامل' },
  upperLower: { en: 'Upper/Lower Split', ar: 'تقسيم علوي/سفلي' },
  chest: { en: 'Chest', ar: 'صدر' },
  back: { en: 'Back', ar: 'ظهر' },
  shoulders: { en: 'Shoulders', ar: 'أكتاف' },
  arms: { en: 'Arms', ar: 'ذراعين' },
  abs: { en: 'Abs', ar: 'بطن' },
  legs: { en: 'Legs', ar: 'أرجل' },
  cardio: { en: 'Cardio', ar: 'تمارين هوائية' },
  upperBody: { en: 'Upper Body', ar: 'الجزء العلوي' },
  lowerBody: { en: 'Lower Body', ar: 'الجزء السفلي' },
  machineName: { en: 'Machine #', ar: 'رقم الجهاز' },
  exerciseName: { en: 'Exercise Name', ar: 'اسم التمرين' },
  setsReps: { en: 'Sets × Reps', ar: 'مجموعات × تكرارات' },
  videoLink: { en: 'Video Link', ar: 'رابط الفيديو' },
  coachNotes: { en: 'Coach Notes', ar: 'ملاحظات المدرب' },
  assignCoach: { en: 'Assign Coach', ar: 'تعيين مدرب' },
  createPlan: { en: 'Create Plan', ar: 'إنشاء برنامج' },
  downloadPDF: { en: 'Download PDF', ar: 'تحميل PDF' },
  exportPDF: { en: 'Export PDF', ar: 'تصدير PDF' },
  medicalWarning: { en: '⚠ This client has a medical condition', ar: '⚠ هذا العميل لديه حالة طبية' },
  viewPersonalInfo: { en: 'View Personal Info', ar: 'عرض المعلومات الشخصية' },
  welcome: { en: 'Welcome', ar: 'مرحباً' },
  myWorkout: { en: 'My Workout Plan', ar: 'برنامج تدريبي' },
  noplan: { en: 'No training plan assigned yet.', ar: 'لم يتم تعيين برنامج تدريبي بعد.' },
  translateArabic: { en: 'العربية', ar: 'English' },
  addRow: { en: 'Add Row', ar: 'إضافة صف' },
  sets: { en: 'Sets', ar: 'مجموعات' },
  reps: { en: 'Reps', ar: 'تكرارات' },
  dragDropVideo: { en: 'Drag & drop exercise video or click to browse (MP4, MOV supported)', ar: 'اسحب وأفلت فيديو التمرين أو انقر للتصفح (يدعم MP4, MOV)' },
  uploadSuccess: { en: 'Upload Success', ar: 'تم الرفع بنجاح' },
  restDay: { en: 'Rest Day! 🛋️ Keep up the recovery.', ar: 'يوم راحة! 🛋️ استمر في التعافي.' },
  todaysWorkout: { en: "Today's Workout", ar: 'تمرين اليوم' },
  sun: { en: 'Sun', ar: 'أحد' },
  mon: { en: 'Mon', ar: 'إثن' },
  tue: { en: 'Tue', ar: 'ثلا' },
  wed: { en: 'Wed', ar: 'أرب' },
  thu: { en: 'Thu', ar: 'خمي' },
  fri: { en: 'Fri', ar: 'جمع' },
  sat: { en: 'Sat', ar: 'سبت' },
  jan: { en: 'Jan', ar: 'يناير' },
  feb: { en: 'Feb', ar: 'فبراير' },
  mar: { en: 'Mar', ar: 'مارس' },
  apr: { en: 'Apr', ar: 'أبريل' },
  may: { en: 'May', ar: 'مايو' },
  jun: { en: 'Jun', ar: 'يونيو' },
  jul: { en: 'Jul', ar: 'يوليو' },
  aug: { en: 'Aug', ar: 'أغسطس' },
  sep: { en: 'Sep', ar: 'سبتمبر' },
  oct: { en: 'Oct', ar: 'أكتوبر' },
  nov: { en: 'Nov', ar: 'نوفمبر' },
  dec: { en: 'Dec', ar: 'ديسمبر' },
  // Progress Tracker Additions
  workoutPlan: { en: 'Workout Plan', ar: 'خطة التمرين' },
  weight: { en: 'Weight', ar: 'משקל' }, // Using Hebrew as requested for specifics
  bodyFat: { en: 'Body Fat %', ar: 'אחוז שומן' },
  measurements: { en: 'Measurements (cm)', ar: 'מידות (ס"מ)' },
  upperAbs: { en: 'Upper Abs', ar: 'בטן עליונה' },
  midAbs: { en: 'Middle Abs', ar: 'בטן אמצעית' },
  lowerAbs: { en: 'Lower Abs', ar: 'בטן תחתונה' },
  rightArm: { en: 'Right Arm', ar: 'זרוע ימין' },
  leftArm: { en: 'Left Arm', ar: 'זרוע שמאל' },
  thighs: { en: 'Thighs', ar: 'ירכיים' },
  rightThigh: { en: 'Right Thigh', ar: 'ירך ימין' },
  leftThigh: { en: 'Left Thigh', ar: 'ירך שמאל' },
  glutes: { en: 'Glutes', ar: 'עכוז' },
  noMeasurementsRecorded: { en: 'No measurements recorded for this date.', ar: 'לא נרשמו מדדים לתאריך זה.' },
};

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>('en');
  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');
  const t = (key: string) => translations[key]?.[lang] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be within LanguageProvider');
  return ctx;
};
