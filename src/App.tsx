import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoginForm } from "@/components/auth/LoginForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Projects } from "@/pages/Projects";
import { Tasks } from "@/pages/Tasks";
import { WorkSubmissions } from "@/pages/WorkSubmissions";
import WorkApprovals from "@/pages/WorkApprovals";
import { Invoicing } from "@/pages/Invoicing";
import { Employees } from "@/pages/Employees";
import { Clients } from "@/pages/Clients";
import { GeneralManager } from "@/pages/GeneralManager";
import { HR } from "@/pages/HR";
import { ProjectCoordinator } from "@/pages/ProjectCoordinator";
import { Attendance } from "@/pages/Attendance";
import { Reports } from "@/pages/Reports";
import { Finance } from "@/pages/Finance";
import { LeaveManagement } from "@/pages/LeaveManagement";
import { Payroll } from "@/pages/Payroll";
import { Settings } from "@/pages/Settings";
import { Profile } from "@/pages/Profile";
import { Notifications } from "@/pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginForm />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
              </Route>
              
              <Route path="/projects" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Projects />} />
              </Route>
              
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Tasks />} />
              </Route>
              
              <Route path="/work-submissions" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<WorkSubmissions />} />
              </Route>
              
              <Route path="/work-approvals" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<WorkApprovals />} />
              </Route>
              
              <Route path="/invoicing" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Invoicing />} />
              </Route>
              
              <Route path="/employees" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Employees />} />
              </Route>
              
              <Route path="/clients" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Clients />} />
              </Route>
              
              <Route path="/general-manager" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<GeneralManager />} />
              </Route>
              
              <Route path="/hr" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<HR />} />
              </Route>
              
              <Route path="/project-coordinator" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<ProjectCoordinator />} />
              </Route>
              
              <Route path="/attendance" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Attendance />} />
              </Route>
              
              <Route path="/reports" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Reports />} />
              </Route>
              
              <Route path="/finance" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Finance />} />
              </Route>
              
              <Route path="/leave-management" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<LeaveManagement />} />
              </Route>
              
              <Route path="/payroll" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Payroll />} />
              </Route>
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Settings />} />
              </Route>
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Profile />} />
              </Route>
              
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Notifications />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
