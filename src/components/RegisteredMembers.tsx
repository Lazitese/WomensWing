import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Member {
  id: string;
  fullName: string;
  residenceWoreda: string;
  workplaceWoreda?: string;
  registrationDate: string;
  status: "active" | "pending" | "inactive";
}

export function RegisteredMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Replace this with actual API call
    const fetchMembers = async () => {
      try {
        setLoading(true);
        // Simulate API call
        const response = await fetch("/api/members");
        const data = await response.json();
        setMembers(data);
      } catch (err) {
        setError("Failed to load members");
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gov-primary font-ethiopic">የተመዘገቡ አባላት</h2>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gov-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-ethiopic">ሙሉ ስም</TableHead>
                  <TableHead className="font-ethiopic">የመኖሪያ ወረዳ</TableHead>
                  <TableHead className="font-ethiopic">የስራ ቦታ ወረዳ</TableHead>
                  <TableHead className="font-ethiopic">የተመዘገቡበት ቀን</TableHead>
                  <TableHead className="font-ethiopic">ሁኔታ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.fullName}</TableCell>
                    <TableCell>{member.residenceWoreda}</TableCell>
                    <TableCell>{member.workplaceWoreda || "-"}</TableCell>
                    <TableCell>{member.registrationDate}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${member.status === "active" ? "bg-green-100 text-green-800" : 
                          member.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-gray-100 text-gray-800"
                        }`}>
                        {member.status === "active" ? "ንቁ" :
                         member.status === "pending" ? "በመጠባበቅ ላይ" :
                         "ንቁ ያልሆነ"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {members.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 font-ethiopic">
                      ምንም አባላት አልተመዘገቡም
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
} 