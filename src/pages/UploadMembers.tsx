import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';
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
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState<MemberUploadStats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedWoreda, setSelectedWoreda] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    
    checkSession();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer?.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!selectedWoreda) {
      toast.error('እባክዎ መጀመሪያ ወረዳ ይምረጡ');
      return;
    }

    if (!file.name.endsWith('.xlsx')) {
      toast.error('እባክዎ የ Excel ፋይል ይጫኑ (.xlsx)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('woreda', selectedWoreda);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-member-upload`;
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);

      const response = await fetch(functionUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Server error');
      }

      setStats(responseData.stats);
      
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 z-0 "
        style={{
          backgroundImage: 'url(/images/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, black, transparent)'
        }}
      />

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl p-8 mb-8 border border-white/20"
            >
              <div className="text-center mb-12">
                <motion.h2 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold text-gray-800 font-ethiopic"
                >
                  አባላት ማስገቢያ
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-gray-600 font-ethiopic"
                >
                  የአባላትን መረጃ በቀላሉ ያስገቡ
                </motion.p>
              </div>
              
              <div className="mb-8">
                <Label htmlFor="woreda" className="block text-sm font-medium text-gray-700 mb-2 font-ethiopic">
                  ወረዳ
                </Label>
                <Select value={selectedWoreda} onValueChange={setSelectedWoreda}>
                  <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border-gray-200">
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

              <motion.div 
                className="mb-8 relative"
                onDragEnter={handleDrag}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <label 
                  className={`
                    flex flex-col items-center px-8 py-12 rounded-xl
                    ${dragActive 
                      ? 'bg-blue-50/90 border-2 border-blue-500 shadow-blue-500/20' 
                      : 'bg-white/50 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50'
                    }
                    backdrop-blur-sm transition-all duration-200 ease-in-out cursor-pointer shadow-lg
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={dragActive ? { scale: 1.1, rotate: 180 } : { scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <FiUpload className={`w-16 h-16 mb-6 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    </motion.div>
                    <span className="text-xl font-ethiopic mb-3 font-semibold">
                      {dragActive ? 'ፋይሉን ይጣሉ' : 'Excel ፋይል ይጫኑ'}
                    </span>
                    <span className="text-sm text-gray-500 font-ethiopic">
                      ወይም ፋይሉን ከዚህ ላይ ይጣሉ
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>

                {isUploading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 font-ethiopic">በመጫን ላይ...</span>
                      <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full h-2" />
                  </motion.div>
                )}
              </motion.div>

              <AnimatePresence>
                {stats && showResults && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-3 gap-6 mb-8"
                  >
                    <motion.div 
                      className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-8 rounded-xl backdrop-blur-sm border border-blue-200/30 shadow-lg"
                      whileHover={{ scale: 1.03, rotate: -1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <h3 className="font-bold text-blue-800 font-ethiopic mb-2">ጠቅላላ ተጫኝ</h3>
                      <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-8 rounded-xl backdrop-blur-sm border border-green-200/30 shadow-lg"
                      whileHover={{ scale: 1.03, rotate: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <h3 className="font-bold text-green-800 font-ethiopic mb-2">የተመዘገቡ</h3>
                      <p className="text-4xl font-bold text-green-600">{stats.inserted}</p>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 p-8 rounded-xl backdrop-blur-sm border border-yellow-200/30 shadow-lg"
                      whileHover={{ scale: 1.03, rotate: -1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <h3 className="font-bold text-yellow-800 font-ethiopic mb-2">ቀድሞ የተመዘገቡ</h3>
                      <p className="text-4xl font-bold text-yellow-600">{stats.duplicates}</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {showResults && members.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl p-8 border border-white/20"
                >
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 font-ethiopic">በቅርብ የተጫኑ አባላት</h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="font-ethiopic font-bold">ሙሉ ስም</TableHead>
                          <TableHead className="font-ethiopic font-bold">ስልክ</TableHead>
                          <TableHead className="font-ethiopic font-bold">አካባቢ</TableHead>
                          <TableHead className="font-ethiopic font-bold">ቀን</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member, index) => (
                          <motion.tr
                            key={member.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-blue-50/30 transition-colors"
                          >
                            <TableCell className="font-medium">
                              {member.first_name} {member.father_name} {member.grand_father_name}
                            </TableCell>
                            <TableCell>{member.phone}</TableCell>
                            <TableCell>{member.subcity}, {member.woreda}</TableCell>
                            <TableCell>
                              {format(new Date(member.created_at), "MMM dd, yyyy")}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="mt-6 text-sm text-gray-500 font-ethiopic flex items-center">
                    <FiAlertCircle className="mr-2" />
                    ይህ ዝርዝር ጊዜያዊ ነው። ገጹን ሲያድሱ ይደበቃል።
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadMembers; 