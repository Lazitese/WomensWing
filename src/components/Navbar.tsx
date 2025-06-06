import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const aboutMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleAboutMenu = () => {
    setIsAboutMenuOpen(!isAboutMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aboutMenuRef.current && !aboutMenuRef.current.contains(event.target as Node)) {
        setIsAboutMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-gov-dark shadow-md py-3"
    >
      <div className="container-gov flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="flex items-center">
            <img
              src="/images/Logo Beltsegena.jpg"
              alt="Prosperity Party Logo"
              className="h-12 w-12 mr-2" // Added mr-2 for spacing
            />
          <span className="font-display font-bold text-xl text-white ml-2">
            <span className="text-gov-gold">ብልጽግና ፓርቲ</span>
          </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>መነሻ</Link>
          <Link to="/abalat-mzgeba" className={`nav-link ${isActive('/abalat-mzgeba') ? 'nav-link-active' : ''}`}>የአባላት ምዝገባ</Link>
          <Link to="/qreta" className={`nav-link ${isActive('/qreta') ? 'nav-link-active' : ''}`}>ጥቆማ</Link>
          <Link to="/projects" className={`nav-link ${isActive('/projects') ? 'nav-link-active' : ''}`}>ተግባራት</Link>
          
          {/* About Us with Submenu */}
          <div className="relative" ref={aboutMenuRef}>
            <button 
              onClick={toggleAboutMenu}
              className={`nav-link flex items-center ${isActive('/sle-egna') || isActive('/documents') ? 'nav-link-active' : ''}`}
            >
              ስለ እኛ <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isAboutMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isAboutMenuOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg py-2 w-48 z-20">
                <Link 
                  to="/sle-egna"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gov-light hover:text-gov-dark"
                >
                  ስለ እኛ መረጃ
                </Link>
                <Link 
                  to="/documents"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gov-light hover:text-gov-dark"
                >
                  ሰነዶች
                </Link>
              </div>
            )}
          </div>
          
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'nav-link-active' : ''}`}>አግኙን</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden rounded-md p-2 bg-gov-gold text-gov-dark hover:bg-gov-gold-light transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-gov-medium absolute w-full left-0 shadow-md transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-[500px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
        } overflow-hidden`}
      >
        <div className="container-gov py-4 flex flex-col space-y-4">
          <Link to="/" className={`font-medium py-2 border-b border-gov-dark/20 ${isActive('/') ? 'text-gov-gold-light font-semibold' : 'text-gov-gold'}`}>መነሻ</Link>
          <Link to="/abalat-mzgeba" className={`font-medium py-2 border-b border-gov-dark/20 ${isActive('/abalat-mzgeba') ? 'text-gov-gold-light font-semibold' : 'text-gov-gold'}`}>የአባላት ምዝገባ</Link>
          <Link to="/qreta" className={`font-medium py-2 border-b border-gov-dark/20 ${isActive('/qreta') ? 'text-gov-gold-light font-semibold' : 'text-gov-gold'}`}>ጥቆማ</Link>
          <Link to="/projects" className={`font-medium py-2 border-b border-gov-dark/20 ${isActive('/projects') ? 'text-gov-gold-light font-semibold' : 'text-gov-gold'}`}>ተግባራት</Link>
          <Link to="/sle-egna" className={`font-medium py-2 border-b border-gov-dark/20 ${isActive('/sle-egna') ? 'text-gov-gold-light font-semibold' : 'text-gov-gold'}`}>ስለ እኛ መረጃ</Link>
          <Link to="/documents" className={`font-medium py-2 border-b border-gov-dark/20 ${isActive('/documents') ? 'text-gov-gold-light font-semibold' : 'text-gov-gold'}`}>ሰነዶች</Link>
          <Link to="/contact" className={`font-medium py-2 border-b border-gov-dark/20 ${isActive('/contact') ? 'text-gov-gold-light font-semibold' : 'text-gov-gold'}`}>አግኙን</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
