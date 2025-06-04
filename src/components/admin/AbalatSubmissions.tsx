import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { exportToExcel } from "@/utils/excelExport";
import { 
  Check, 
  Download, 
  Eye, 
  Search, 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Briefcase 
} from "lucide-react";
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

interface AbalatSubmissionsProps {
  showAddForm?: boolean;
  setShowAddForm?: React.Dispatch<React.SetStateAction<boolean>>;
  filterType?: string;
  searchQuery?: string;
}

const AbalatSubmissions = ({ showAddForm, setShowAddForm, filterType = "all", searchQuery = "" }: AbalatSubmissionsProps = {}) => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<AbalatSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<AbalatSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<AbalatSubmission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Use props if provided, otherwise use local state
  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (filterType !== undefined) {
      setStatusFilter(filterType);
    }
  }, [filterType]);

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
    
    // Map the filter string to the actual database status value
    let dbStatusFilter: 'pending' | 'accepted' | 'rejected' | "all" = statusFilter as any; // Start with the string, will refine
    if (statusFilter === "active") {
        dbStatusFilter = "accepted";
    } else if (statusFilter === "pending") {
        dbStatusFilter = "pending";
    } else if (statusFilter === "rejected") {
        dbStatusFilter = "rejected";
    } else {
        dbStatusFilter = "all"; // No filter applied
    }

    // Apply status filter using the mapped database status value
    if (dbStatusFilter !== "all") {
      filtered = filtered.filter(item => item.status === dbStatusFilter);
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

      // Update filtered submissions to reflect the new status
      setFilteredSubmissions(prevFiltered => 
        prevFiltered.map(sub => 
          sub.id === id ? { ...sub, status } : sub
        )
      );

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

  const exportToXlsx = async (singleSubmission?: AbalatSubmission) => {
    try {
      const dataToExport = singleSubmission ? [singleSubmission] : filteredSubmissions;
      
      const columns = [
        { header: 'ID', key: 'id', width: 15 },
        { header: 'ሙሉ ስም', key: 'full_name', width: 20 },
        { header: 'ስልክ', key: 'phone', width: 15 },
        { header: 'ኢሜይል', key: 'email', width: 25 },
        { header: 'ወረዳ', key: 'woreda', width: 15 },
        { header: 'ቀበሌ', key: 'kebele', width: 15 },
        { header: 'እድሜ', key: 'age', width: 10 },
        { header: 'የትምህርት ደረጃ', key: 'education_level', width: 20 },
        { header: 'ስራ', key: 'occupation', width: 20 },
        { header: 'ሁኔታ', key: 'status', width: 15 },
        { header: 'የተፈጠረበት ጊዜ', key: 'created_at', width: 20 }
      ];

      const formattedData = dataToExport.map(item => ({
        ...item,
        status: item.status === 'pending' ? 'በመጠባበቅ ላይ' :
                item.status === 'accepted' ? 'ተቀባይነት አግኝቷል' :
                'ተቀባይነት አላገኘም',
        created_at: format(new Date(item.created_at), "yyyy-MM-dd HH:mm:ss"),
        email: item.email || ''
      }));
      
      const success = await exportToExcel(
        formattedData,
        columns,
        singleSubmission ? `abalat_${singleSubmission.id}` : 'abalat_submissions'
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

  // Render status badge with appropriate color
  const StatusBadge = ({ status, size = "default" }: { status: 'pending' | 'accepted' | 'rejected', size?: "default" | "large" }) => {
    const iconSize = size === "large" ? 16 : 14;
    const paddingClass = size === "large" ? "px-4 py-2" : "";
    const textClass = size === "large" ? "text-sm" : "text-xs";
    
    switch (status) {
      case 'pending':
        return (
          <Badge 
            variant="outline" 
            className={`bg-yellow-50 border border-yellow-200 text-yellow-700 flex items-center gap-1.5 ${paddingClass} ${textClass}`}
          >
            <Calendar size={iconSize} className="text-yellow-600" />
            በመጠባበቅ ላይ
          </Badge>
        );
      case 'accepted':
        return (
          <Badge 
            variant="outline" 
            className={`bg-green-50 border border-green-200 text-green-700 flex items-center gap-1.5 ${paddingClass} ${textClass}`}
          >
            <Check size={iconSize} className="text-green-600" />
            ተቀባይነት አግኝቷል
          </Badge>
        );
      case 'rejected':
        return (
          <Badge 
            variant="outline" 
            className={`bg-red-50 border border-red-200 text-red-700 flex items-center gap-1.5 ${paddingClass} ${textClass}`}
          >
            <X size={iconSize} className="text-red-600" />
            ተቀባይነት አላገኘም
          </Badge>
        );
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
          {/* Only render search input if searchQuery prop is not provided */}
          {searchQuery === "" && (
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ፈልግ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
          
          {/* Only render status filter if filterType prop is not provided */}
          {filterType === "all" && (
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
                <SelectItem value="rejected">ተቀባይነት ያላገኘም</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Button
            onClick={() => exportToXlsx()}
            className="bg-gov-accent hover:bg-gov-accent/90 gap-2 w-full md:w-auto"
            disabled={filteredSubmissions.length === 0}
          >
            <Download size={16} />
            ሁሉንም ወርድ (Excel)
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
                        onClick={() => exportToXlsx(submission)}
                        className="gap-1"
                      >
                        <Download size={14} />
                        Excel
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl p-0">
          {selectedSubmission && (
            <>
              <div className="bg-gradient-to-r from-gov-accent/10 to-gray-50 p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-gov-accent text-white p-2 rounded-full">
                    <User size={24} />
                  </div>
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-gray-900 font-bold">{selectedSubmission.full_name}</DialogTitle>
                    <DialogDescription className="text-gray-600 flex items-center gap-2">
                      <Calendar size={14} />
                      የተመዘገበው በ {format(new Date(selectedSubmission.created_at), "MMMM dd, yyyy HH:mm")}
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6 pb-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <StatusBadge status={selectedSubmission.status} size="large" />
                  
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
                
                <h3 className="text-lg font-semibold mb-4 text-gray-700">የግል መረጃ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gov-accent/10 p-1.5 rounded-full">
                        <User size={18} className="text-gov-accent" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700">ሙሉ ስም</h3>
                    </div>
                    <p className="text-base font-medium text-gray-900 pl-6">{selectedSubmission.full_name}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gov-accent/10 p-1.5 rounded-full">
                        <Phone size={18} className="text-gov-accent" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700">ስልክ</h3>
                    </div>
                    <p className="text-base font-medium text-gray-900 pl-6">{selectedSubmission.phone}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gov-accent/10 p-1.5 rounded-full">
                        <Mail size={18} className="text-gov-accent" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700">ኢሜይል</h3>
                    </div>
                    <p className="text-base font-medium text-gray-900 pl-6">{selectedSubmission.email || "N/A"}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gov-accent/10 p-1.5 rounded-full">
                        <MapPin size={18} className="text-gov-accent" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700">ወረዳ/ቀበሌ</h3>
                    </div>
                    <p className="text-base font-medium text-gray-900 pl-6">{selectedSubmission.woreda}/{selectedSubmission.kebele}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gov-accent/10 p-1.5 rounded-full">
                        <Calendar size={18} className="text-gov-accent" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700">እድሜ</h3>
                    </div>
                    <p className="text-base font-medium text-gray-900 pl-6">{selectedSubmission.age}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gov-accent/10 p-1.5 rounded-full">
                        <BookOpen size={18} className="text-gov-accent" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700">የትምህርት ደረጃ</h3>
                    </div>
                    <p className="text-base font-medium text-gray-900 pl-6">{selectedSubmission.education_level}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gov-accent/10 p-1.5 rounded-full">
                        <Briefcase size={18} className="text-gov-accent" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700">ሙያ</h3>
                    </div>
                    <p className="text-base font-medium text-gray-900 pl-6">{selectedSubmission.occupation}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => setDetailsOpen(false)}
                    className="font-medium"
                  >
                    ዝጋ
                  </Button>
                  
                  <Button
                    onClick={() => exportToXlsx(selectedSubmission)}
                    className="bg-gov-accent hover:bg-gov-accent/90 gap-2 font-medium"
                  >
                    <Download size={16} />
                    Excel ወርድ
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AbalatSubmissions;
