import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../integrations/supabase/client";
import AdminLayout from '../../components/admin/AdminLayout';
import { FiUpload, FiDownload, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

interface MemberUploadStats {
  total: number;
  inserted: number;
  duplicates: number;
}

interface Member {
  id: string;
  first_name: string;
  father_name: string;
  grand_father_name: string;
  gender: string;
  age: number | null;
  date_of_birth: string | null;
  phone: string;
  email: string;
  subcity: string;
  woreda: string;
  created_at: string;
  status: "active" | "pending" | "inactive";
  education_level?: string;
  occupation?: string;
  membership_date?: string;
  membership_fee_paid?: boolean;
  membership_id?: string;
  house_number?: string;
  kebele?: string;
  uploaded_by?: string;
  uploaded_by_email?: string;
}

const AbalatPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState<MemberUploadStats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
      } else {
        setIsAuthenticated(true);
        // Fetch members immediately after authentication
        fetchMembers();
      }
      setIsLoading(false);
    };
    
    checkSession();
  }, [navigate]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('አባላትን ማግኘት አልተቻለም');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast.error('እባክዎ የ Excel ፋይል ይጫኑ (.xlsx)');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-member-upload`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Server error');
      }

      setStats(responseData.stats);
      // Refresh members list after successful upload
      await fetchMembers();
      toast.success('ፋይሉ በተሳካ ሁኔታ ተጭኗል');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'ፋይሉን መጫን አልተቻለም');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    const searchIsNumber = /^\d+$/.test(searchQuery);
    
    // If search query is a number, search in numeric fields and phone
    if (searchIsNumber) {
      return (
        member.phone.includes(searchQuery) ||
        (member.age?.toString() === searchQuery) ||
        member.house_number?.includes(searchQuery) ||
        member.woreda.includes(searchQuery) ||
        member.kebele?.includes(searchQuery)
      );
    }
    
    // Otherwise search in text fields
    return (
      member.first_name.toLowerCase().includes(searchLower) ||
      member.father_name.toLowerCase().includes(searchLower) ||
      member.grand_father_name.toLowerCase().includes(searchLower) ||
      member.phone.includes(searchQuery) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.subcity.toLowerCase().includes(searchLower) ||
      member.woreda.toLowerCase().includes(searchLower) ||
      member.kebele?.toLowerCase().includes(searchLower) ||
      member.education_level?.toLowerCase().includes(searchLower) ||
      member.occupation?.toLowerCase().includes(searchLower) ||
      member.house_number?.toLowerCase().includes(searchLower)
    );
  });

  const pageCount = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 font-ethiopic">አባላት ማስገቢያ</h2>
          
          <div className="mb-8">
            <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors">
              <FiUpload className="w-8 h-8" />
              <span className="mt-2 text-base font-ethiopic">Excel ፋይል ይጫኑ</span>
              <input
                type="file"
                className="hidden"
                accept=".xlsx"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Upload Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 font-ethiopic">ጠቅላላ ተጫኝ</h3>
                <p className="text-2xl text-blue-600">{stats.total}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 font-ethiopic">የተመዘገቡ</h3>
                <p className="text-2xl text-green-600">{stats.inserted}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 font-ethiopic">ቀድሞ የተመዘገቡ</h3>
                <p className="text-2xl text-yellow-600">{stats.duplicates}</p>
              </div>
            </div>
          )}
        </div>

        {/* Members Table Section - Always Visible */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800 font-ethiopic">የተመዘገቡ አባላት</h2>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Stats Summary */}
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  ጠቅላላ: <span className="font-semibold">{members.length}</span>
                </span>
              </div>

              {/* Search */}
              <div className="relative flex-1 md:w-72">
                <input
                  type="text"
                  placeholder="አባላትን ይፈልጉ..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 font-ethiopic"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Table Container with Fixed Height */}
          <div className="border rounded-lg">
            {/* Table Header */}
            <div className="bg-gray-50 border-b p-4">
              <div className="text-sm text-gray-500">
                Showing {paginatedMembers.length} of {filteredMembers.length} members
              </div>
            </div>

            {/* Scrollable Table */}
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "65vh" }}>
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">ስም</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">የአባት ስም</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">የአያት ስም</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">ፆታ</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">እድሜ</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">የትውልድ ቀን</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">ስልክ</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">ኢሜይል</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">የትምህርት ደረጃ</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">ሙያ</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">ክፍለ ከተማ</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">ወረዳ</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">ቀበሌ</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">የቤት ቁጥር</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">የተጫነበት</TableHead>
                    <TableHead className="font-ethiopic text-left whitespace-nowrap">አስጫኝ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.length > 0 ? (
                    paginatedMembers.map((member) => (
                      <TableRow key={member.id} className="hover:bg-gray-50">
                        <TableCell className="text-left whitespace-nowrap">{member.first_name}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.father_name}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.grand_father_name}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.gender}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.age || '-'}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.date_of_birth ? format(new Date(member.date_of_birth), "MMM dd, yyyy") : '-'}</TableCell>
                        <TableCell className="text-left whitespace-nowrap font-mono">{member.phone}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.email || '-'}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.education_level || '-'}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.occupation || '-'}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.subcity}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.woreda}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.kebele || '-'}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">{member.house_number || '-'}</TableCell>
                        <TableCell className="text-left whitespace-nowrap">
                          {format(new Date(member.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {member.uploaded_by ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{member.uploaded_by}</span>
                              <span className="text-xs text-gray-500">{member.uploaded_by_email}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center py-8 text-gray-500 font-ethiopic">
                        ምንም አባላት አልተመዘገቡም
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Table Footer with Pagination */}
            <div className="border-t p-4">
              {pageCount > 1 && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {pageCount}
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: pageCount }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 rounded ${
                          currentPage === index + 1
                            ? "bg-gov-primary text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
                      disabled={currentPage === pageCount}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageCount
                          ? "bg-gray-100 text-gray-400"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AbalatPage;
