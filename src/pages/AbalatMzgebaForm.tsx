import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const abalatMzgebaFormSchema = z.object({
  full_name: z.string().min(2, { message: "ሙሉ ስም መጻፍ አለብዎት" }),
  age: z.string().refine((val) => {
    const age = parseInt(val);
    return !isNaN(age) && age >= 18 && age <= 100;
  }, { message: "እድሜዎ ከ18 አመት በላይ መሆን አለበት" }),
  phone: z.string().min(10, { message: "የሞባይል ቁጥር ትክክለኛ አይደለም" }),
  email: z.string().email({ message: "የኢሜይል አድራሻ ትክክለኛ አይደለም" }).optional().or(z.literal('')),
  woreda: z.string().min(1, { message: "ወረዳ ማስገባት አለብዎት" }),
  kebele: z.string().min(1, { message: "ብሎክ ማስገባት አለብዎት" }),
  education_level: z.string().min(2, { message: "የትምህርት ደረጃዎን መጻፍ አለብዎት" }),
  occupation: z.string().min(2, { message: "ሙያዎን መጻፍ አለብዎት" }),
  photo: z.any().optional(),
});

type AbalatMzgebaFormValues = z.infer<typeof abalatMzgebaFormSchema>;

const AbalatMzgebaForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AbalatMzgebaFormValues>({
    resolver: zodResolver(abalatMzgebaFormSchema),
    defaultValues: {
      full_name: "",
      age: "",
      phone: "",
      email: "",
      woreda: "",
      kebele: "",
      education_level: "",
      occupation: "",
    },
  });

  const onSubmit = async (data: AbalatMzgebaFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Insert into Supabase
      const { error } = await supabase
        .from('abalat_mzgeba_submissions')
        .insert({
          full_name: data.full_name,
          phone: data.phone,
          email: data.email || null,
          woreda: data.woreda,
          kebele: data.kebele,
          age: parseInt(data.age),
          education_level: data.education_level,
          occupation: data.occupation,
          status: 'pending',
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "ምዝገባው ተልኳል",
        description: "የአባልነት ምዝገባዎ በተሳካ ሁኔታ ተልኳል። በቅርቡ እናገኝዎታለን።",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "ምዝገባው አልተላከም",
        description: "የአባልነት ምዝገባዎን በመላክ ላይ ችግር ተፈጥሯል። እባክዎ ዳግም ይሞክሩ።",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow py-20 bg-gray-50">
        <div className="container-gov max-w-3xl mx-auto">
          <Card className="shadow-lg animate-fade-in-up">
            <CardHeader className="bg-gov-medium text-white">
              <CardTitle className="text-2xl font-bold">የአባላት ምዝገባ ቅጽ</CardTitle>
              <CardDescription className="text-white/80">
                የብልጽግና ፓርቲ ሴቶች ክንፍ አባል ለመሆን ይህንን ቅጽ ይሙሉ
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ሙሉ ስም</FormLabel>
                        <FormControl>
                          <Input placeholder="ሙሉ ስምዎን ያስገቡ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>እድሜ</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="እድሜዎን ያስገቡ" {...field} />
                          </FormControl>
                          <FormDescription>
                            እድሜዎ ቢያንስ 18 አመት መሆን አለበት
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ስልክ ቁጥር</FormLabel>
                          <FormControl>
                            <Input placeholder="የሞባይል ስልክ ቁጥርዎን ያስገቡ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ኢሜይል (አማራጭ)</FormLabel>
                        <FormControl>
                          <Input placeholder="ኢሜይል አድራሻዎን ያስገቡ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="woreda"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ወረዳ</FormLabel>
                          <FormControl>
                            <Input placeholder="ለምሳሌ፡ ወረዳ 03" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="kebele"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ብሎክ</FormLabel>
                          <FormControl>
                            <Input placeholder="ለምሳሌ፡ ብሎክ 01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="education_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>የትምህርት ደረጃ</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="የትምህርት ደረጃዎን ይምረጡ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="primary">የመጀመሪያ ደረጃ</SelectItem>
                              <SelectItem value="secondary">ሁለተኛ ደረጃ</SelectItem>
                              <SelectItem value="certificate">ሰርተፊኬት</SelectItem>
                              <SelectItem value="diploma">ዲፕሎማ</SelectItem>
                              <SelectItem value="degree">ዲግሪ</SelectItem>
                              <SelectItem value="masters">ማስተርስ</SelectItem>
                              <SelectItem value="phd">ዶክተሬት</SelectItem>
                              <SelectItem value="other">ሌላ</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ሙያ</FormLabel>
                          <FormControl>
                            <Input placeholder="ሙያዎን ያስገቡ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gov-accent hover:bg-gov-accent/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "እየተላከ ነው..." : "ምዝገባውን አጠናቅ"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AbalatMzgebaForm;
