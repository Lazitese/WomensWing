import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FiUpload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

const UploadMembers = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState<MemberUploadStats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedWoreda, setSelectedWoreda] = useState<string>("");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    
    checkSession();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedWoreda) {
      toast.error('እባክዎ መጀመሪያ ወረዳ ይምረጡ');
      return;
    }

    if (!file.name.endsWith('.xlsx')) {
      toast.error('እባክዎ የ Excel ፋይል ይጫኑ (.xlsx)');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('woreda', selectedWoreda);

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
      
      // Fetch the recently uploaded members
      const { data: recentMembers, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      
      setMembers(recentMembers || []);
      setShowResults(true);
      toast.success('ፋይሉ በተሳካ ሁኔታ ተጭኗል');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'ፋይሉን መጫን አልተቻለም');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 font-ethiopic">አባላት ማስገቢያ</h2>
          
          {/* Woreda Selection */}
          <div className="mb-6">
            <Label htmlFor="woreda" className="block text-sm font-medium text-gray-700 mb-2 font-ethiopic">
              ወረዳ
            </Label>
            <Select value={selectedWoreda} onValueChange={setSelectedWoreda}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ወረዳ ይምረጡ" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 14 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={String(num).padStart(2, '0')}>
                    ወረዳ {String(num).padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
          {stats && showResults && (
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

        {/* Recently Uploaded Members Table - Only visible after upload */}
        {showResults && members.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 font-ethiopic">በቅርብ የተጫኑ አባላት</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-ethiopic">ሙሉ ስም</TableHead>
                    <TableHead className="font-ethiopic">ስልክ</TableHead>
                    <TableHead className="font-ethiopic">አካባቢ</TableHead>
                    <TableHead className="font-ethiopic">ቀን</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.first_name} {member.father_name} {member.grand_father_name}
                      </TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.subcity}, {member.woreda}</TableCell>
                      <TableCell>
                        {format(new Date(member.created_at), "MMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-4 text-sm text-gray-500 font-ethiopic">
              * ይህ ዝርዝር ጊዜያዊ ነው። ገጹን ሲያድሱ ይደበቃል።
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadMembers; 