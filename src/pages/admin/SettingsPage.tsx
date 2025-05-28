import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, UserPlus, Check } from "lucide-react";
import { z } from "zod";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  
  useEffect(() => {
    document.title = "አስተዳዳሪ ቅንብሮች";
    
    const checkSession = async () => {
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

  const validateForm = () => {
    setError("");
    
    try {
      // Validate email
      const emailSchema = z.string().email("የኢሜል አድራሻው ትክክል አይደለም");
      emailSchema.parse(email);
      
      // Validate password
      if (password.length < 6) {
        throw new Error("የይለፍ ቃሉ ቢያንስ 6 ፊደላት መሆን አለበት");
      }
      
      // Confirm passwords match
      if (password !== confirmPassword) {
        throw new Error("የይለፍ ቃሎቹ አይመሳሰሉም");
      }
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };
  
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Try to create user account (Supabase Auth)
      // Handle cases where the user might exist in Auth but not in the admins table
      let authUserExistsOrCreated = false;
      let authErrorMessage = '';

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        authErrorMessage = authError.message;
        // Check if the error is specifically 'User already registered'
        if (authError.message.toLowerCase().includes('user already registered')) {
           authUserExistsOrCreated = true; // User exists in Auth, we can proceed to check/add to admins table
        } else {
           // It's a different Auth error, log and re-throw/handle as a sign-up failure
           console.error("Supabase Auth signUp error:", authError);
           throw new Error('የተጠቃሚ መለያ መፍጠር አልተቻለም: ' + authError.message);
        }
      } else if (authData?.user) {
         // User was successfully created in Auth
         authUserExistsOrCreated = true;
      }

      // --- Debugging Log 1 ---
      console.log('After Auth SignUp/Check: authUserExistsOrCreated=', authUserExistsOrCreated, 'Auth Error Message:', authErrorMessage);
      // --- End Debugging Log 1 ---

      // --- Additional Debugging Log ---
      console.log('Auth Data User:', authData?.user);
      // --- End Additional Debugging Log ---

      // Only proceed if the user was created in Auth or already exists in Auth
      if (!authUserExistsOrCreated) {
           // This case should ideally be covered by the error checks above,
           // but include as a safeguard.
           throw new Error('የተጠቃሚ መለያ መፍጠር ወይም ማረጋገጥ አልተቻለም');
      }

      // 2. Add user email to admins table
      // If the insert fails with a unique constraint violation (23505),
      // it means the admin email already exists in our table.
      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          email: email
        });
      
      if (insertError) {
         // --- Debugging Log 2 ---
         console.error('Insert Error Object:', insertError);
         console.error('Insert Error Code:', insertError.code);
         console.error('Insert Error Message:', insertError.message);
         // --- End Debugging Log 2 ---

         // Handle duplicate key error (email already exists in admins table)
         if (insertError.code === '23505') {
           console.log("Admin already exists error:", insertError);
           // Show a non-destructive toast for duplicate email
           toast({
             title: "Existing Admin",
             description: "ይህ ኢሜይል ያስቀድሞ አስተዳዳሪ ነው", // This email is already an admin
             variant: "default", // Use default variant for existing admin
           });
           // Do NOT re-throw the error, submission was handled gracefully
         } else {
            // For other insert errors, throw the error to be caught by the general catch block
            throw insertError;
         }
      }
      
      // 3. Success! If we reached here, both Auth (or existence check) and admins insert were successful.
      toast({
        title: "አዲስ አስተዳዳሪ ተፈጥሯል",
        description: `አስተዳዳሪ ${email} ተሳክቷል`,
        variant: "default"
      });
      
      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      // This catch block handles errors thrown from any step above (excluding the handled 23505 insert error)
      toast({
        title: "ስህተት ተፈጥሯል",
        description: error.message || "አስተዳዳሪ መፍጠር አልተቻለም",
        variant: "destructive"
      });
      console.error("Failed to add admin (caught error):", error);
    } finally {
      // Note: setIsSubmitting(false) is also called in the 23505 handler,
      // so this ensures it's always reset.
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-blue mx-auto"></div>
          <p className="mt-4 text-brand-black">በመጫን ላይ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300 ease-in-out">
        <div className="p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header section */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight">ቅንብሮች</h1>
              <p className="text-gray-500 mt-1.5">የስርዓቱን ቅንብሮች ያስተዳድሩ</p>
            </div>
            
            {/* Add Admin Card */}
            <Card className="mb-10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="text-brand-blue" size={20} />
                  አዲስ አስተዳዳሪ ጨምር
                </CardTitle>
                <CardDescription>
                  አዲስ የአስተዳዳሪ መለያ ይፍጠሩ። አዲስ የተፈጠሩ አስተዳዳሪዎች የስርዓቱን ሁሉንም ክፍሎች መድረስ ይችላሉ።
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAdmin}>
                  <div className="grid gap-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-3">
                        <AlertTriangle size={20} className="mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">የኢሜል አድራሻ</Label>
                      <Input 
                        id="email"
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">የይለፍ ቃል</Label>
                      <Input 
                        id="password"
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                        required
                      />
                      <p className="text-xs text-gray-500">የይለፍ ቃሉ ቢያንስ 6 ፊደላት መሆን አለበት</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">የይለፍ ቃል ያረጋግጡ</Label>
                      <Input 
                        id="confirmPassword"
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mt-6 bg-brand-blue hover:bg-brand-blue/90 text-white w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        በሂደት ላይ...
                      </>
                    ) : (
                      <>
                        <Check size={18} className="mr-2" />
                        አስተዳዳሪ ፍጠር
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
