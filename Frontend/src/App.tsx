import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PersonalTraining from "./pages/admin/PersonalTraining";
import ProgressTracker from "./pages/admin/ProgressTracker";
import CoachesManagement from "./pages/admin/CoachesManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import ClientDashboard from "./pages/client/ClientDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role === 'client') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ClientGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'client') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="training" element={<PersonalTraining />} />
                <Route path="progress" element={<ProgressTracker />} />
                <Route path="coaches" element={<CoachesManagement />} />
                <Route path="users" element={<UsersManagement />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
              <Route path="/client/dashboard" element={<ClientGuard><ClientDashboard /></ClientGuard>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
