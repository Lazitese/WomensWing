import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import QretaForm from "./pages/QretaForm";
import AbalatMzgebaForm from "./pages/AbalatMzgebaForm";
import MembershipApplicationLetter from "./pages/MembershipApplicationLetter";
import ReportForm from "./pages/ReportForm";
import ProjectsPage from "./pages/ProjectsPage";
import SleEgnaPage from "./pages/SleEgnaPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import AbalatPage from "./pages/admin/AbalatPage";
import QretaPage from "./pages/admin/QretaPage";
import ReportPage from "./pages/admin/ReportPage";
import AllAchievements from "./pages/AllAchievements";
import DocumentsPage from "./pages/DocumentsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/qreta" element={<QretaForm />} />
          <Route path="/abalat-mzgeba" element={<MembershipApplicationLetter />} />
          <Route path="/abalat-mzgeba/form" element={<AbalatMzgebaForm />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/sle-egna" element={<SleEgnaPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/achievements" element={<AllAchievements />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/abalat" element={<AbalatPage />} />
          <Route path="/admin/qreta" element={<QretaPage />} />
          <Route path="/admin/reports" element={<ReportPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
