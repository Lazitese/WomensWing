import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";

const loginFormSchema = z.object({
  email: z.string().email({ message: "ኢሜይል አድራሻው ትክክለኛ አይደለም" }),
  password: z.string().min(6, { message: "የይለፍ ቃሉ ቢያንስ 6 ፊደላት ሊኖረው ይገባል" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verify admin status
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('email', session.user.email)
          .single();
        
        if (!adminError && adminData) {
          // Already logged in as admin, redirect to dashboard
          navigate('/admin/dashboard');
        } else {
          // Not an admin, sign out
          await supabase.auth.signOut();
        }
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) {
        throw error;
      }
      
      if (!authData.user) {
        throw new Error('No user returned from authentication');
      }
      
      // Verify admin status
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', data.email)
        .single();
      
      if (adminError || !adminData) {
        await supabase.auth.signOut();
        throw new Error('የአስተዳዳሪ መዳረሻ የለዎትም');
      }
      
      toast({
        title: "ግባ ተሳክቷል",
        description: "ወደ አስተዳዳሪ ዳሽቦርድ እንኳን በደህና መጡ!",
      });
      
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "ግባ አልተሳካም",
        description: error.message || "ኢሜይል ወይም የይለፍ ቃል ትክክል አይደለም",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <img 
          src="/images/Logo Beltsegena.jpg" 
          alt="Prosperity Party Women's Wing Logo" 
          className="h-16 w-auto mx-auto mb-3"
        />
        <h1 className="text-2xl font-bold">
          <span className="text-gov-gold">ብልጽግና ፓርቲ</span> <span className="text-gov-dark">ሴቶች ክንፍ</span>
        </h1>
      </div>
      
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-t-4 border-t-gov-accent animate-fade-in-up">
          <CardHeader className="bg-white text-gov-dark pb-2">
            <CardTitle className="text-2xl font-bold">አስተዳዳሪ ግባ</CardTitle>
            <CardDescription className="text-gray-500">
              ወደ አስተዳዳሪ ዳሽቦርድ ለመግባት የመለያ መረጃዎን ያስገቡ
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ኢሜይል</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ኢሜይል አድራሻዎን ያስገቡ" 
                          autoComplete="email"
                          className="border-gray-300 focus:border-gov-accent focus:ring-gov-accent"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>የይለፍ ቃል</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="የይለፍ ቃልዎን ያስገቡ" 
                          autoComplete="current-password"
                          className="border-gray-300 focus:border-gov-accent focus:ring-gov-accent"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-gov-accent hover:bg-gov-accent/90 gap-2 mt-2"
                  disabled={isSubmitting}
                >
                  <LogIn size={16} />
                  {isSubmitting ? "እየገባ ነው..." : "ግባ"}
                </Button>
                
                <div className="text-center text-sm text-gray-500 mt-4">
                  <a 
                    href="/" 
                    className="hover:text-gov-accent transition-colors"
                  >
                    ወደ ዋና ገጽ ተመለስ
                  </a>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
