import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import HomeRouter from "./pages/HomeRouter";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import Directory from "./pages/Directory";
import Playground from "./pages/Playground";
import GTCIUpload from "./pages/GTCIUpload";
import ProjectWorkflow from "./pages/ProjectWorkflow";
import PendingResponse from "./pages/PendingResponse";
import InProcessMatters from "./pages/InProcessMatters";
import GTCIDashboard from "./pages/GTCIDashboard";
import GTCIStrategicAnalysis from "./pages/GTCIStrategicAnalysis";
import TriathleteGoal from "./pages/TriathleteGoal";
import TodoPage from "./pages/TodoPage";
import LeavePlanner from "./pages/LeavePlanner";
import PreviousMeetings from "./pages/PreviousMeetings";
import AttachmentOverseas from "./pages/AttachmentOverseas";
import FinancialPlan from "./pages/FinancialPlan";
import MatterLogsScorecard from "./pages/MatterLogsScorecard";
import NotesPage from "./pages/NotesPage";
import ManpowerAKPI from "./pages/ManpowerAKPI";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  const isPublic = location.pathname === '/auth' || location.pathname === '/reset-password';

  // Public pages without sidebar
  if (isPublic) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    );
  }

  // All other pages with sidebar - protected routes
  return (
    <ProtectedRoute>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomeRouter />} />
          <Route path="/attachment-overseas" element={<AttachmentOverseas />} />
          <Route path="/in-process" element={<InProcessMatters />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/gtci-upload" element={<GTCIUpload />} />
          <Route path="/project-workflow" element={<ProjectWorkflow />} />
          <Route path="/pending-response" element={<PendingResponse />} />
          <Route path="/gtci" element={<GTCIDashboard />} />
          <Route path="/gtci-strategic" element={<GTCIStrategicAnalysis />} />
          <Route path="/triathlete-goal" element={<TriathleteGoal />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/leave-planner" element={<LeavePlanner />} />
          <Route path="/previous-meetings" element={<PreviousMeetings />} />
          <Route path="/financial-plan" element={<FinancialPlan />} />
          <Route path="/matter-logs" element={<MatterLogsScorecard />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/manpower-akpi" element={<ManpowerAKPI />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
