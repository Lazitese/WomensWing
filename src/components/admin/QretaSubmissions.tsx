import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { exportToExcel } from "@/utils/excelExport";
import { Download, Eye } from "lucide-react";

interface QretaSubmission {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  woreda: string;
  kebele: string;
  message: string;
  created_at: string;
  file_url: string | null;
}

interface QretaSubmissionsProps {
  searchQuery: string;
}

const QretaSubmissions = ({ searchQuery }: QretaSubmissionsProps) => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<QretaSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<QretaSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<QretaSubmission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('qreta_submissions')
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
          description: "ጥቆማዎችን በማግኘት ላይ ችግር ተፈጥሯል",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [toast]);

  // Filter submissions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubmissions(submissions);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const searchIsNumber = /^\d+$/.test(searchQuery);
    
    const filtered = submissions.filter((submission) => {
      // If search query is a number, search in numeric fields and phone
      if (searchIsNumber) {
        const woredaNumber = submission.woreda.replace(/\D/g, '');
        const kebeleNumber = submission.kebele.replace(/\D/g, '');
        const phoneNumber = submission.phone.replace(/\D/g, '');
        
        return (
          phoneNumber.includes(searchQuery) ||
          woredaNumber.includes(searchQuery) ||
          kebeleNumber.includes(searchQuery)
        );
      }
      
      // Otherwise search in text fields
      return (
        submission.full_name.toLowerCase().includes(searchLower) ||
        submission.phone.includes(searchQuery) ||
        submission.email?.toLowerCase().includes(searchLower) ||
        submission.woreda.toLowerCase().includes(searchLower) ||
        submission.kebele.toLowerCase().includes(searchLower) ||
        submission.message.toLowerCase().includes(searchLower)
      );
    });

    setFilteredSubmissions(filtered);
  }, [searchQuery, submissions]);

  const handleViewDetails = (submission: QretaSubmission) => {
    setSelectedSubmission(submission);
    setDetailsOpen(true);
  };

  const exportToXlsx = async (singleSubmission?: QretaSubmission) => {
    try {
      const dataToExport = singleSubmission ? [singleSubmission] : filteredSubmissions;
      
      const columns = [
        { header: 'ID', key: 'id', width: 15 },
        { header: 'ሙሉ ስም', key: 'full_name', width: 20 },
        { header: 'ስልክ', key: 'phone', width: 15 },
        { header: 'ኢሜይል', key: 'email', width: 25 },
        { header: 'ወረዳ', key: 'woreda', width: 15 },
        { header: 'ቀበሌ', key: 'kebele', width: 15 },
        { header: 'መልዕክት', key: 'message', width: 40 },
        { header: 'የተፈጠረበት ጊዜ', key: 'created_at', width: 20 }
      ];

      const formattedData = dataToExport.map(item => ({
        ...item,
        created_at: format(new Date(item.created_at), "yyyy-MM-dd HH:mm:ss"),
        email: item.email || ''
      }));

      const success = await exportToExcel(
        formattedData,
        columns,
        singleSubmission ? `qreta_${singleSubmission.id}` : 'qreta_submissions'
      );

      if (success) {
      toast({
        title: "ወርዷል",
          description: "Excel ፋይል በተሳካ ሁኔታ ወርዷል",
      });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "የExcel ፋይል ለማውረድ ችግር ተፈጥሯል",
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
    <div>
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl shadow-inner border border-gray-100">
          {searchQuery.trim() !== "" ? (
            <p>ምንም ጥቆማ አልተገኘም። እባክዎን ሌላ ቃል ይሞክሩ።</p>
          ) : (
            <p>ምንም ጥቆማ አልተገኘም።</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow border border-gray-100 bg-white">
          <Table className="min-w-full divide-y divide-gray-100">
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700">ሙሉ ስም</TableHead>
                <TableHead className="font-semibold text-gray-700">አካባቢ</TableHead>
                <TableHead className="font-semibold text-gray-700">ስልክ</TableHead>
                <TableHead className="font-semibold text-gray-700">ቀን</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">ድርጊቶች</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow 
                  key={submission.id}
                  className="border-b border-gray-100 hover:bg-gov-accent/10 transition-colors"
                >
                  <TableCell className="font-medium text-gray-900">{submission.full_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-gray-800">{submission.woreda}</span>
                      <span className="text-xs text-gray-400">{submission.kebele}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700">{submission.phone}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                      {format(new Date(submission.created_at), "MMM dd, yyyy")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(submission)}
                        className="gap-1 border-gray-200 hover:bg-gov-accent/20"
                      >
                        <Eye className="mr-2 h-4 w-4 text-gov-accent" />
                        ዝርዝር እይ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToXlsx(submission)}
                        className="gap-1 border-gray-200 hover:bg-gov-accent/20"
                      >
                        <Download className="mr-2 h-4 w-4 text-gov-accent" />
                        ወርድ
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
      {selectedSubmission && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-md rounded-2xl shadow-lg border border-gray-100">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gov-accent">ጥቆማ ዝርዝር</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                በ {format(new Date(selectedSubmission.created_at), "MMM dd, yyyy 'at' HH:mm")} የተፈጠረ
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-500">ሙሉ ስም</h4>
                <p className="text-base text-gray-900">{selectedSubmission.full_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">ወረዳ</h4>
                  <p className="text-base text-gray-900">{selectedSubmission.woreda}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">ቀበሌ</h4>
                  <p className="text-base text-gray-900">{selectedSubmission.kebele}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">ስልክ</h4>
                  <p className="text-base text-gray-900">{selectedSubmission.phone}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">ኢሜይል</h4>
                  <p className="text-base text-gray-900">{selectedSubmission.email || "-"}</p>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-500">መልዕክት</h4>
                <div className="p-3 bg-gray-50 rounded-md text-base max-h-40 overflow-y-auto text-gray-900">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Add file download link */}
              {selectedSubmission.file_url && (
                <div className="space-y-1">
                   <h4 className="text-sm font-medium text-gray-500">አባሪ ፋይል</h4>
                   <div className="flex flex-col gap-2">
                     <a
                       href={selectedSubmission.file_url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-gov-accent hover:underline font-medium inline-flex items-center gap-2"
                     >
                       <Download size={16} />
                       ፋይል አውርድ
                     </a>
                     {/* Debug info - remove in production */}
                     <div className="text-xs text-gray-400 break-all">
                       URL: {selectedSubmission.file_url}
                     </div>
                   </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => setDetailsOpen(false)} className="border-gray-200">ዝጋ</Button>
                <Button 
                  size="sm" 
                  className="gap-1 bg-gov-accent hover:bg-gov-accent/90 text-white" 
                  onClick={() => exportToXlsx(selectedSubmission)}
                >
                  <Download size={14} />
                  ወርድ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default QretaSubmissions;
