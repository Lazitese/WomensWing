import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Download, Eye, Search } from "lucide-react";

interface ReportSubmission {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  woreda: string;
  kebele: string;
  report_type: string;
  report_details: string;
  file_url: string | null;
  created_at: string;
}

interface ReportSubmissionsProps {
  searchQuery: string;
}

const ReportSubmissions = ({ searchQuery }: ReportSubmissionsProps) => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ReportSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ReportSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ReportSubmission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('report_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setSubmissions(data || []);
        setFilteredSubmissions(data || []);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast({
          title: "Error",
          description: "ሪፖርቶችን በማግኘት ላይ ችግር ተፈጥሯል",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [toast]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubmissions(submissions);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const searchIsNumber = /^\d+$/.test(searchQuery);
    
    const filtered = submissions.filter(item => {
      // If search query is a number, search in numeric fields and phone
      if (searchIsNumber) {
        const woredaNumber = item.woreda.replace(/\D/g, '');
        const kebeleNumber = item.kebele.replace(/\D/g, '');
        const phoneNumber = item.phone.replace(/\D/g, '');
        
        return (
          phoneNumber.includes(searchQuery) ||
          woredaNumber.includes(searchQuery) ||
          kebeleNumber.includes(searchQuery)
        );
      }
      
      // Otherwise search in text fields
      return (
        item.full_name.toLowerCase().includes(searchLower) ||
        item.phone.includes(searchQuery) ||
        item.email?.toLowerCase().includes(searchLower) ||
        item.woreda.toLowerCase().includes(searchLower) ||
        item.kebele.toLowerCase().includes(searchLower) ||
        item.report_type.toLowerCase().includes(searchLower) ||
        item.report_details.toLowerCase().includes(searchLower)
      );
    });

    setFilteredSubmissions(filtered);
  }, [searchQuery, submissions]);

  const handleViewDetails = (submission: ReportSubmission) => {
    setSelectedSubmission(submission);
    setDetailsOpen(true);
  };

  const exportToCsv = (singleSubmission?: ReportSubmission) => {
    try {
      const dataToExport = singleSubmission ? [singleSubmission] : filteredSubmissions;
      const csvHeader = "ID,ሙሉ ስም,ስልክ,ኢሜይል,ወረዳ,ቀበሌ,የሪፖርት ዓይነት,የሪፖርት ዝርዝር,የተፈጠረበት ጊዜ\n";
      
      const csvRows = dataToExport.map(item => {
        // Format the date
        const formattedDate = format(new Date(item.created_at), "yyyy-MM-dd HH:mm:ss");
        
        // Escape values to handle commas and quotes within the data
        const escapedDetails = `"${item.report_details.replace(/"/g, '""')}"`;
        const email = item.email ? item.email : '';
        
        return `${item.id},${item.full_name},${item.phone},${email},${item.woreda},${item.kebele},${item.report_type},${escapedDetails},${formattedDate}`;
      });
      
      const csvString = csvHeader + csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", singleSubmission ? `report_${singleSubmission.id}.csv` : "report_submissions.csv");
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "ወርዷል",
        description: "CSV ፋይል በተሳካ ሁኔታ ወርዷል",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "የCSV ፋይል ለማውረድ ችግር ተፈጥሯል",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gov-accent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gov-dark">ሪፖርቶች</h2>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Button
            onClick={() => exportToCsv()}
            className="bg-gov-accent hover:bg-gov-accent/90 gap-2 w-full md:w-auto"
            disabled={filteredSubmissions.length === 0}
          >
            <Download size={16} />
            ሁሉንም ወርድ (CSV)
          </Button>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery.trim() !== "" ? (
            <p>ምንም ሪፖርት አልተገኘም። እባክዎን ሌላ ቃል ይሞክሩ።</p>
          ) : (
            <p>ምንም ሪፖርት አልተገኘም።</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ሙሉ ስም</TableHead>
                <TableHead>ወረዳ/ቀበሌ</TableHead>
                <TableHead>የሪፖርት ዓይነት</TableHead>
                <TableHead>ቀን</TableHead>
                <TableHead className="text-right">ድርጊቶች</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.full_name}</TableCell>
                  <TableCell>{submission.woreda}/{submission.kebele}</TableCell>
                  <TableCell>{submission.report_type}</TableCell>
                  <TableCell>{format(new Date(submission.created_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(submission)}
                        className="gap-1"
                      >
                        <Eye size={14} />
                        ዝርዝር
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToCsv(submission)}
                        className="gap-1"
                      >
                        <Download size={14} />
                        CSV
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">የሪፖርት ዝርዝር</DialogTitle>
                <DialogDescription>
                  የተመዘገበው በ {format(new Date(selectedSubmission.created_at), "MMMM dd, yyyy HH:mm")}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">ሙሉ ስም</p>
                  <p>{selectedSubmission.full_name}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">ስልክ</p>
                  <p>{selectedSubmission.phone}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">ኢሜይል</p>
                  <p>{selectedSubmission.email || "N/A"}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">ወረዳ/ቀበሌ</p>
                  <p>{selectedSubmission.woreda}/{selectedSubmission.kebele}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">የሪፖርት ዓይነት</p>
                  <p>{selectedSubmission.report_type}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">የሪፖርት ፋይል</p>
                  {selectedSubmission.file_url ? (
                    <a 
                      href={selectedSubmission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="text-gov-accent hover:underline"
                    >
                      ፋይል አውርድ
                    </a>
                  ) : (
                    <p>ምንም ፋይል የለም</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setDetailsOpen(false)}
                >
                  ዝጋ
                </Button>
                
                <Button
                  onClick={() => exportToCsv(selectedSubmission)}
                  className="bg-gov-accent hover:bg-gov-accent/90 gap-2"
                >
                  <Download size={16} />
                  CSV ወርድ
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportSubmissions;
