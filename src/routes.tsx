import { RouteObject } from "react-router-dom";
import Index from "./pages/Index";
import QretaForm from "./pages/QretaForm";
import AbalatMzgebaForm from "./pages/AbalatMzgebaForm";
import MembershipApplicationLetter from "./pages/MembershipApplicationLetter";
import ReportSubmissionPage from "./pages/ReportSubmissionPage";
import ProjectsPage from "./pages/ProjectsPage";
import SleEgnaPage from "./pages/SleEgnaPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import AbalatPage from "./pages/admin/AbalatPage";
import QretaPage from "./pages/admin/QretaPage";
import ReportPage from "./pages/admin/ReportPage";
import SettingsPage from "./pages/admin/SettingsPage";
import AllAchievements from "./pages/AllAchievements";
import DocumentsPage from "./pages/DocumentsPage";
import UploadMembers from "./pages/UploadMembers";
import MembershipRequestsPage from "./pages/admin/MembershipRequestsPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Index />
  },
  {
    path: "/qreta",
    element: <QretaForm />
  },
  {
    path: "/abalat-mzgeba",
    element: <MembershipApplicationLetter />
  },
  {
    path: "/abalat-mzgeba/form",
    element: <AbalatMzgebaForm />
  },
  {
    path: "/report",
    element: <ReportSubmissionPage />
  },
  {
    path: "/projects",
    element: <ProjectsPage />
  },
  {
    path: "/sle-egna",
    element: <SleEgnaPage />
  },
  {
    path: "/documents",
    element: <DocumentsPage />
  },
  {
    path: "/contact",
    element: <ContactPage />
  },
  {
    path: "/achievements",
    element: <AllAchievements />
  },
  {
    path: "/upload-members",
    element: <UploadMembers />
  },
  // Admin Routes
  {
    path: "/admin/login",
    element: <Login />
  },
  {
    path: "/admin/dashboard",
    element: <Dashboard />
  },
  {
    path: "/admin/abalat",
    element: <AbalatPage />
  },
  {
    path: "/admin/membership-requests",
    element: <MembershipRequestsPage />
  },
  {
    path: "/admin/qreta",
    element: <QretaPage />
  },
  {
    path: "/admin/reports",
    element: <ReportPage />
  },
  {
    path: "/admin/settings",
    element: <SettingsPage />
  },
  {
    path: "*",
    element: <NotFound />
  }
]; 