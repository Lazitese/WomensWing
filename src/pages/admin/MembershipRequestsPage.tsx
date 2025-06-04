import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from '@/components/admin/AdminLayout';
import { Session } from "@supabase/supabase-js";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AbalatSubmissions from "@/components/admin/AbalatSubmissions";

export default function MembershipRequestsPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    document.title = "የአባልነት ጥያቄዎች | አስተዳዳሪ";
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (!session) {
          navigate('/admin/login');
          return;
        }
        
        // Verify admin status
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('email', session.user.email)
          .single();
        
        if (error || !data) {
          await supabase.auth.signOut();
          navigate('/admin/login');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        navigate('/admin/login');
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          navigate('/admin/login');
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gov-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gov-dark">የአባልነት ጥያቄዎች</h1>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ፈልግ..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
        </div>

        <AbalatSubmissions searchQuery={searchQuery} />
      </div>
    </AdminLayout>
  );
} 