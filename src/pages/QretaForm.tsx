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

const qretaFormSchema = z.object({
  full_name: z.string().min(2, { message: "ሙሉ ስም መጻፍ አለብዎት" }),
  phone: z.string().min(10, { message: "የሞባይል ቁጥር ትክክለኛ አይደለም" }),
  email: z.string().email({ message: "የኢሜይል አድራሻ ትክክለኛ አይደለም" }).optional().or(z.literal('')),
  category: z.string().min(1, { message: "ምድብ መምረጥ አለብዎት" }),
  woreda: z.string().min(1, { message: "ወረዳ ማስገባት አለብዎት" }),
  kebele: z.string().min(1, { message: "ብሎክ ማስገባት አለብዎት" }),
  message: z.string().min(10, { message: "ቢያንስ 10 ፊደላት መጻፍ አለብዎት" }),
  file: z.instanceof(FileList).optional().refine(files => {
    if (!files || files.length === 0) return true;
    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/*', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

    if (file.size > maxSize) {
        return false;
    }

    if (!allowedTypes.some(type => file.type.startsWith(type.split('*')[0] || '') || file.type === type)) {
        return false;
    }

    return true;
  }, { message: "ትክክለኛ የፋይል አይነት ወይም መጠን አይደለም (ከ5MB ያነሰ፣ ምስል/PDF/Word)" }),
});

type QretaFormValues = z.infer<typeof qretaFormSchema>;

const QretaForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<QretaFormValues>({
    resolver: zodResolver(qretaFormSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      category: "",
      woreda: "",
      kebele: "",
      message: "",
    },
  });

  const onSubmit = async (data: QretaFormValues) => {
    setIsSubmitting(true);
    
    let fileUrl: string | null = null;

    try {
      // 1. Handle file upload if a file is selected
      const file = data.file?.[0];
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        // Upload to the 'qreta' bucket, in a 'qreta_submissions' folder
        const filePath = `qreta_submissions/${fileName}`;

        console.log('Uploading file:', { fileName, filePath, fileType: file.type, fileSize: file.size });

        const { error: uploadError } = await supabase.storage
          .from('qreta') // Use the qreta bucket
          .upload(filePath, file);

        if (uploadError) {
          console.error("Supabase Storage upload error (qreta):", uploadError);
          throw new Error(`ፋይል መስቀል አልተቻለም: ${uploadError.message}`);
        }

        // Get the public URL of the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('qreta')
          .getPublicUrl(filePath);
        
        if (publicUrlData) {
          fileUrl = publicUrlData.publicUrl;
          console.log('File uploaded successfully:', { fileUrl });
        } else {
          console.warn("Could not get public URL for uploaded qreta file");
        }
      }

      // 2. Insert into Supabase database (qreta_submissions)
      const { error: insertError } = await supabase
        .from('qreta_submissions')
        .insert({
          full_name: data.full_name,
          phone: data.phone,
          email: data.email || null,
          woreda: data.woreda,
          kebele: data.kebele,
          message: data.message,
          file_url: fileUrl, // Include the file URL
        });
      
      if (insertError) {
        console.error("Supabase database insert error (qreta):", insertError);
        throw new Error(`ጥቆማ ማስገባት አልተቻለም: ${insertError.message}`);
      }
      
      toast({
        title: "ጥቆማዎ ተልኳል",
        description: "ጥቆማዎ በተሳካ ሁኔታ ተልኳል። እናመሰግናለን!",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "ጥቆማው አልተላከም",
        description: "ጥቆማዎን በመላክ ላይ ችግር ተፈጥሯል። እባክዎ ዳግም ይሞክሩ።",
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
              <CardTitle className="text-2xl font-bold">ጥቆማ ቅጽ</CardTitle>
              <CardDescription className="text-white/80">
                አስተያየት፣ ጥቆማ ወይም ቅሬታ ለማስገባት ይህንን ቅጽ ይሙሉ
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ምድብ</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="ምድብ ይምረጡ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="complaint">ቅሬታ</SelectItem>
                            <SelectItem value="suggestion">አስተያየት</SelectItem>
                            <SelectItem value="corruption">የሙስና ጥቆማ</SelectItem>
                            <SelectItem value="service">የአገልግሎት ችግር</SelectItem>
                            <SelectItem value="other">ሌላ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          የጥቆማዎን ዓይነት ይምረጡ
                        </FormDescription>
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
                            <Input placeholder="ለምሳሌ፡ ወረዳ 05" {...field} />
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
                            <Input placeholder="ለምሳሌ፡ ብሎክ 07" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ዝርዝር መግለጫ</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="ጥቆማዎን ወይም አስተያየትዎን ይጻፉ..." 
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          ጉዳዩን በዝርዝር ይግለፁ
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>አባሪ ፋይል (አማራጭ)</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            accept="image/*,application/pdf,.doc,.docx"
                            onChange={(event) => onChange(event.target.files)}
                          />
                        </FormControl>
                        <FormDescription>
                          አስፈላጊ ከሆነ አግባብነት ያለው ፋይል ያያይዙ (እስከ 5MB፣ ምስል/PDF/Word)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full bg-gov-accent hover:bg-gov-accent/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "እየተላከ ነው..." : "ጥቆማውን ላክ"}
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

export default QretaForm;
