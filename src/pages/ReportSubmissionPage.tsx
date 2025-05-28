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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming report_details could also take text
import { Loader2 } from "lucide-react"; // For loading indicator

// Define the Zod schema for the form
const reportSubmissionFormSchema = z.object({
  full_name: z.string().min(1, { message: "ሙሉ ስም ማስገባት አለብዎት" }),
  woreda: z.string().min(1, { message: "ወረዳ ማስገባት አለብዎት" }),
  report_type: z.string().min(1, { message: "የሪፖርት አይነት ማስገባት አለብዎት" }),
  report_file: z
    .instanceof(FileList)
    .refine(files => files.length > 0, { message: "የሪፖርት ፋይል ማስገባት አለብዎት" })
    .refine(files => files[0]?.size <= 5 * 1024 * 1024, { // 5MB limit
      message: "የፋይል መጠን ከ5MB መብለጥ የለበትም።",
    })
    .refine(files => files[0]?.type ? ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(files[0].type) : false, {
        message: "የማይደገፍ የፋይል አይነት። PDF, JPG, PNG, DOC, DOCX ብቻ ይፈቀዳል።"
    }),
  // Add kebele and phone based on Supabase schema
  kebele: z.string().min(1, { message: "ቀበሌ ማስገባት አለብዎት" }),
  phone: z.string().min(10, { message: "የሞባይል ቁጥር ትክክለኛ አይደለም" }),
});

type ReportSubmissionFormValues = z.infer<typeof reportSubmissionFormSchema>;

const ReportSubmissionPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportSubmissionFormValues>({
    resolver: zodResolver(reportSubmissionFormSchema),
    defaultValues: {
      full_name: "",
      woreda: "",
      report_type: "",
      report_file: undefined, // FileList type for input file
      // Add default values for kebele and phone
      kebele: "",
      phone: "",
    },
  });

  const onSubmit = async (data: ReportSubmissionFormValues) => {
    setIsSubmitting(true);

    const file = data.report_file[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `reports/${fileName}`;

    try {
      // 1. Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('reports') // Make sure you have a bucket named 'reports' in Supabase Storage
        .upload(filePath, file);

      if (uploadError) {
        console.error("Supabase Storage upload error:", uploadError);
        throw new Error(`ፋይል መስቀል አልተቻለም: ${uploadError.message}`);
      }

      // 2. Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('reports')
        .getPublicUrl(filePath);

      if (!publicUrlData) {
          throw new Error("የተሰቀለውን ፋይል URL ማግኘት አልተቻለም");
      }

      const publicUrl = publicUrlData.publicUrl;

      // 3. Insert submission details into the database
      const { error: insertError } = await supabase
        .from('report_submissions')
        .insert({
          full_name: data.full_name,
          woreda: data.woreda,
          report_type: data.report_type,
          report_details: publicUrl, // Store the file URL in report_details
          // email and phone are nullable, can be added if needed
          // Add kebele and phone to insertion data
          kebele: data.kebele,
          phone: data.phone,
        });

      if (insertError) {
        console.error("Supabase database insert error:", insertError);
        throw new Error(`የሪፖርት ማስገባት አልተቻለም: ${insertError.message}`);
      }

      // Success!
      toast({
        title: "ሪፖርት ተልኳል",
        description: "ሪፖርትዎ በተሳካ ሁኔታ ቀርቧል። እናመሰግናለን።",
        variant: "default",
      });

      form.reset(); // Reset form after successful submission
    } catch (error: any) {
      toast({
        title: "ሪፖርት አልተላከም",
        description: error.message || "ሪፖርትዎን በማስገባት ላይ ችግር ተፈጥሯል። እባክዎ ዳግም ይሞክሩ።",
        variant: "destructive",
      });
      console.error("Report submission failed:", error);
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
              <CardTitle className="text-2xl font-bold">የሪፖርት ማስገቢያ ቅጽ</CardTitle>
              <CardDescription className="text-white/80">
                ሪፖርትዎን ለማስገባት ከታች ያለውን ቅጽ ይሙሉ
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

                  {/* Add Kebele and Phone fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="kebele"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ብሎክ</FormLabel>
                          <FormControl>
                            <Input placeholder="ለምሳሌ፡ ብሎክ 02" {...field} />
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
                    name="report_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>የሪፖርት አይነት</FormLabel>
                        <FormControl>
                          <Input placeholder="ለምሳሌ፡ ወርሃዊ ሪፖርት" {...field} />
                        </FormControl>
                        <FormDescription>
                            እባክዎ የሪፖርትዎን አይነት ይግለጹ (ለምሳሌ: ወርሃዊ, ዓመታዊ, ልዩ)
                          </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="report_file"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>ሪፖርት ፋይል</FormLabel>
                        <FormControl>
                           {/* Use onChange to handle FileList */}
                          <Input
                            {...fieldProps}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={event => onChange(event.target.files)}
                          />
                        </FormControl>
                        <FormDescription>
                          PDF, JPG, PNG, DOC, DOCX ፋይሎች እስከ 5MB ድረስ ይፈቀዳሉ።
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
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> በመላክ ላይ...</>
                    ) : (
                      "ሪፖርት አስገባ"
                    )}
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

export default ReportSubmissionPage; 