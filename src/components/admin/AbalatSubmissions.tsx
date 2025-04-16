
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Check, Download, Eye, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AbalatSubmission {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  woreda: string;
  kebele: string;
  age: number;
  education_level: string;
  occupation: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

const AbalatSubmissions = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<AbalatSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<AbalatSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<AbalatSubmission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('abalat_mzgeba_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Cast the status to match the TypeScript type
        const typedData = data?.map(item => ({
          ...item,
          status: item.status as 'pending' | 'accepted' | 'rejected'
        })) || [];

        setSubmissions(typedData);
        setFilteredSubmissions(typedData);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast({
          title: "Error",
          description: "የአባላት ምዝገባ ማግኘት አልተቻለም",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [toast]);

  useEffect(() => {
    let filtered = submissions;
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        return (
          item.full_name.toLowerCase().includes(lowercasedFilter) ||
          item.woreda.toLowerCase().includes(lowercasedFilter) ||
          item.kebele.toLowerCase().includes(lowercasedFilter) ||
          item.occupation.toLowerCase().includes(lowercasedFilter) ||
          (item.email && item.email.toLowerCase().includes(lowercasedFilter)) ||
          item.phone.includes(searchTerm) ||
          item.age.toString().includes(searchTerm)
        );
      });
    }

    setFilteredSubmissions(filtered);
  }, [searchTerm, statusFilter, submissions]);

  const handleViewDetails = (submission: AbalatSubmission) => {
    setSelectedSubmission(submission);
    setDetailsOpen(true);
  };

  const updateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('abalat_mzgeba_submissions')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update the submissions in state
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === id ? { ...sub, status } : sub
        )
      );

      // Update the selected submission if open in details view
      if (selectedSubmission && selectedSubmission.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status });
      }

      toast({
        title: "ተሳክቷል",
        description: `አባል ሁኔታ ወደ ${status === 'accepted' ? 'ተቀባይነት አግኝቷል' : 'ተቀባይነት አላገኘም'} ተቀይሯል`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "ሁኔታን ለመቀየር አልተቻለም",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const exportToCsv = (singleSubmission?: AbalatSubmission) => {
    try {
      const dataToExport = singleSubmission ? [singleSubmission] : filteredSubmissions;
      const csvHeader = "ID,ሙሉ ስም,ስልክ,ኢሜይል,ወረዳ,ቀበሌ,እድሜ,የትምህርት ደረጃ,ስራ,ሁኔታ,የተፈጠረበት ጊዜ\n";
      
      const csvRows = dataToExport.map(item => {
        // Format the date
        const formattedDate = format(new Date(item.created_at), "yyyy-MM-dd HH:mm:ss");
        
        // Translate status
        let statusTranslated = "";
        switch(item.status) {
          case 'pending': statusTranslated = "በመጠባበቅ ላይ"; break;
          case 'accepted': statusTranslated = "ተቀባይነት አግኝቷል"; break;
          case 'rejected': statusTranslated = "ተቀባይነት አላገኘም"; break;
        }
        
        const email = item.email ? item.email : '';
        
        return `${item.id},${item.full_name},${item.phone},${email},${item.woreda},${item.kebele},${item.age},${item.education_level},${item.occupation},${statusTranslated},${formattedDate}`;
      });
      
      const csvString = csvHeader + csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", singleSubmission ? `abalat_${singleSubmission.id}.csv` : "abalat_submissions.csv");
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

  // Render status badge with appropriate color
  const StatusBadge = ({ status }: { status: 'pending' | 'accepted' | 'rejected' }) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">በመጠባበቅ ላይ</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">ተቀባይነት አግኝቷል</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">ተቀባይነት አላገኘም</Badge>;
      default:
        return null;
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
        <h2 className="text-2xl font-bold text-gov-dark">የአባላት ምዝገባዎች</h2>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ፈልግ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="ሁኔታ ይምረጡ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ሁሉም</SelectItem>
              <SelectItem value="pending">በመጠባበቅ ላይ</SelectItem>
              <SelectItem value="accepted">ተቀባይነት ያገኙ</SelectItem>
              <SelectItem value="rejected">ተቀባይነት ያላገኙ</SelectItem>
            </SelectContent>
          </Select>
          
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
          {searchTerm.trim() !== "" || statusFilter !== "all" ? (
            <p>ምንም ምዝገባ አልተገኘም። እባክዎን ሌላ ፍለጋ ይሞክሩ ወይም ማጣሪያዎችን ያስወግዱ።</p>
          ) : (
            <p>ምንም የአባላት ምዝገባ አልተገኘም።</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ሙሉ ስም</TableHead>
                <TableHead>ወረዳ/ቀበሌ</TableHead>
                <TableHead>እድሜ</TableHead>
                <TableHead>ሁኔታ</TableHead>
                <TableHead>ቀን</TableHead>
                <TableHead className="text-right">ድርጊቶች</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.full_name}</TableCell>
                  <TableCell>{submission.woreda}/{submission.kebele}</TableCell>
                  <TableCell>{submission.age}</TableCell>
                  <TableCell>
                    <StatusBadge status={submission.status} />
                  </TableCell>
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
                <DialogTitle className="text-xl">የምዝገባ ዝርዝር</DialogTitle>
                <DialogDescription>
                  የተመዘገበው በ {format(new Date(selectedSubmission.created_at), "MMMM dd, yyyy HH:mm")}
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex justify-between items-center mt-4">
                <StatusBadge status={selectedSubmission.status} />
                
                {selectedSubmission.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(selectedSubmission.id, 'rejected')}
                      disabled={updatingStatus}
                      className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X size={14} />
                      ውድቅ አድርግ
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateStatus(selectedSubmission.id, 'accepted')}
                      disabled={updatingStatus}
                      className="gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check size={14} />
                      ተቀበል
                    </Button>
                  </div>
                )}
              </div>
              
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
                  <p className="text-sm font-medium text-gray-500">እድሜ</p>
                  <p>{selectedSubmission.age}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">የትምህርት ደረጃ</p>
                  <p>{selectedSubmission.education_level}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">ሙያ</p>
                  <p>{selectedSubmission.occupation}</p>
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

export default AbalatSubmissions;
