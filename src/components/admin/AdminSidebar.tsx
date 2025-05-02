
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
  Settings
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
              ? "bg-brand-blue/20 text-brand-white font-medium" 
              : "text-brand-white/80 hover:bg-brand-blue/15 hover:text-brand-white",
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
        className="rounded-full w-10 h-10 bg-brand-white shadow-md"
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
          className="lg:hidden fixed inset-0 bg-brand-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full shadow-xl transition-all duration-300 ease-in-out",
          "bg-no-repeat bg-cover bg-center before:absolute before:inset-0 before:bg-gradient-to-b before:from-brand-blue/95 before:to-brand-black/95 before:z-0",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ backgroundImage: 'url(/lovable-uploads/17a6c911-3900-4b0d-9c32-b31531c6a430.png)' }}
      >
        {/* Logo section */}
        <div className={cn(
          "flex items-center h-20 border-b border-brand-yellow/10 px-4 relative z-10",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className={cn(
            "flex items-center", 
            collapsed ? "justify-center w-full" : "gap-2"
          )}>
            <div className="flex items-center justify-center h-11 w-11 bg-brand-white rounded-lg shadow-md">
              <img 
                src="/images/prosperity-party-logo.svg" 
                alt="Prosperity Party Logo" 
                className="h-7 w-auto"
              />
            </div>
            {!collapsed && (
              <h1 className="text-sm font-bold ml-2.5">
                <span className="text-brand-yellow">ብልጽግና ፓርቲ</span> <span className="text-brand-white">ሴቶች ክንፍ</span>
              </h1>
            )}
          </div>
          
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full lg:flex hidden text-brand-white/70 hover:text-brand-white hover:bg-brand-white/10 relative z-10"
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>
        
        {/* Navigation links */}
        <div className="py-6 flex flex-col h-[calc(100%-5rem)] justify-between relative z-10">
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
          
          {/* User profile section */}
          <div className="px-3 mb-4">
            {!collapsed && (
              <div className="bg-brand-blue/15 rounded-xl p-3.5 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-yellow">
                  
                  </div>
                  <div className="flex flex-col">
                   
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Expand button & Logout */}
          <div className="px-3 mb-4 space-y-2">
            {collapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center p-3 lg:flex hidden text-brand-white/70 hover:text-brand-white hover:bg-brand-white/10"
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
