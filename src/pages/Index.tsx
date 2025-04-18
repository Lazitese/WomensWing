
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";
import FloatingActionButton from "@/components/FloatingActionButton";
import AboutUs from "@/components/AboutUs";
import Principles from "@/components/Principles";
import Objectives from "@/components/Objectives";
import Achievements from "@/components/Achievements";
import Projects from "@/components/Projects";

const Index = () => {
  // Change page title on mount
  useEffect(() => {
    document.title = "የአቃቂ ቃሊቲ ክፍለ ከተማ ብልጽግና ፓርቲ ሴቶች ክንፍ";
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <AboutUs />
      <Principles />
      <Objectives />
      <Services />
      <Projects />
      <Achievements />
      <Stats />
      <Footer />
      <FloatingActionButton />
      
      {/* Admin Login Link - Positioned at bottom right */}
      <div className="fixed bottom-4 right-4 z-10">
        <Link 
          to="/admin/login" 
          className="text-xs text-gray-500 hover:text-gray-600 hover:underline"
        >
          አስተዳዳሪ
        </Link>
      </div>
    </div>
  );
};

export default Index;
