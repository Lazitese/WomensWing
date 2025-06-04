import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RegisteredMembers } from "@/components/RegisteredMembers";

export default function RegisteredMembersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <main className="flex-grow container-gov max-w-7xl mx-auto px-4 py-8">
        <RegisteredMembers />
      </main>
      <Footer />
    </div>
  );
} 