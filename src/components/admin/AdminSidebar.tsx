import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  LogOut, 
  BarChart2, 
  MessageSquare, 
  Users, 
  FileText,
  Menu,
  X,
  Settings,
  UserPlus,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  collapsed?: boolean;
};

const NavItem = ({ icon, label, onClick, active, collapsed }: NavItemProps) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 py-3 transition-all duration-200 mb-1.5 rounded-lg",
            active 
              ? "bg-gov-light/20 text-white font-medium" 
              : "text-white/80 hover:bg-gov-light/15 hover:text-white",
            collapsed ? "px-3" : "px-4"
          )}
          onClick={onClick}
        >
          <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
            {icon}
            {!collapsed && <span className="ml-2.5 font-medium">{label}</span>}
          </div>
        </Button>
      </TooltipTrigger>
      {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  </TooltipProvider>
);

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Close mobile sidebar when location changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "ወጣ ተሳክቷል",
        description: "በተሳካ ሁኔታ ወጥተዋል",
      });
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "ወጣ አልተሳካም",
        description: "ወጣ ላይ ችግር ተፈጥሯል",
        variant: "destructive",
      });
    }
  };
  
  const isActive = (path: string) => location.pathname === path;
  
  const sidebarItems = [
    {
      icon: <BarChart2 size={collapsed ? 22 : 20} />,
      label: "ዳሽቦርድ",
      onClick: () => navigate('/admin/dashboard'),
      active: isActive('/admin/dashboard')
    },
    {
      icon: <MessageSquare size={collapsed ? 22 : 20} />,
      label: "ጥቆማዎች",
      onClick: () => navigate('/admin/qreta'),
      active: isActive('/admin/qreta')
    },
    {
      icon: <Users size={collapsed ? 22 : 20} />,
      label: "አባላት",
      onClick: () => navigate('/admin/abalat'),
      active: isActive('/admin/abalat')
    },
    {
      icon: <UserPlus size={collapsed ? 22 : 20} />,
      label: "የአባልነት ጥያቄዎች",
      onClick: () => navigate('/admin/membership-requests'),
      active: isActive('/admin/membership-requests')
    },
    {
      icon: <FileText size={collapsed ? 22 : 20} />,
      label: "ሪፖርቶች",
      onClick: () => navigate('/admin/reports'),
      active: isActive('/admin/reports')
    },
    {
      icon: <Settings size={collapsed ? 22 : 20} />,
      label: "ቅንብሮች",
      onClick: () => navigate('/admin/settings'),
      active: isActive('/admin/settings')
    }
  ];
  
  // Mobile header toggle button
  const MobileToggle = () => (
    <div className="lg:hidden fixed top-4 left-4 z-50">
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full w-10 h-10 bg-white shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>
    </div>
  );
  
  return (
    <>
      <MobileToggle />
      
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-gradient-to-b from-gov-dark to-gov-medium shadow-xl transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo section */}
        <div className={cn(
          "flex items-center h-20 border-b border-white/10 px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className={cn(
            "flex items-center", 
            collapsed ? "justify-center w-full" : "gap-2"
          )}>
            <div className="flex items-center justify-center h-11 w-11 bg-white rounded-lg shadow-md">
              <img 
                src="/images/Logo Beltsegena.jpg" 
                alt="Prosperity Party Women's Wing Logo" 
                className="h-9 w-9"
              />
            </div>
            {!collapsed && (
              <h1 className="text-sm font-bold ml-2.5">
                <span className="text-gov-gold">ብልጽግና ፓርቲ</span> <span className="text-white">ሴቶች ክንፍ</span>
              </h1>
            )}
          </div>
          
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full lg:flex hidden text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>
        
        {/* Navigation links */}
        <div className="py-6 flex flex-col h-[calc(100%-5rem)] justify-between">
          <nav className="space-y-0.5 px-3">
            {sidebarItems.map((item, index) => (
              <NavItem
                key={index}
                icon={item.icon}
                label={item.label}
                onClick={item.onClick}
                active={item.active}
                collapsed={collapsed}
              />
            ))}
          </nav>
          
          {/* Expand button & Logout */}
          <div className="px-3 mb-4 space-y-2">
            {collapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center p-3 lg:flex hidden text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setCollapsed(false)}
              >
                <ChevronLeft size={16} className="rotate-180" />
              </Button>
            )}
            
            <NavItem
              icon={<LogOut size={collapsed ? 22 : 20} />}
              label="ውጣ"
              onClick={handleLogout}
              collapsed={collapsed}
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar; 