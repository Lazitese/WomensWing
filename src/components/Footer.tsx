import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Clock } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-gov-dark to-gov-medium text-white pt-12 pb-6">
      <div className="container-gov">
        {/* Footer Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 pb-8 border-b border-white/10">
          {/* Logo and Description */}
          <div>
            <div className="flex items-start mb-4">
              <img 
                src="/images/Logo Beltsegena.jpg" 
                alt="Logo Beltsegena" 
                className="h-20 w-auto mr-2"
              />
              <span className="font-display font-bold text-xl mt-2">
                <span className="text-gov-gold">ብልጽግና ፓርቲ</span>
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              የአቃቂ ቃሊቲ ክፍለ ከተማ ብልጽግና ፓርቲ ሴቶች ክንፍ ቅርንጫፍ ጽ/ቤት ኃላፊነትን ባለው መንገድ ህብረተሰቡን እያገለገለ ይገኛል።
            </p>
            <div className="flex space-x-3">
              <a href="https://www.facebook.com/share/p/1AwXpcRzvr/?mibextid=oFDknk" className="w-8 h-8 bg-white/10 hover:bg-gov-gold hover:text-gov-dark rounded-full flex items-center justify-center transition-colors duration-200">
                <Facebook size={16} />
              </a>
             
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 border-b border-gov-gold/30 pb-2">
              ፈጣን ማገናኛዎች
            </h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-gov-gold transition-colors">መነሻ</Link></li>
              <li><Link to="/abalat-mzgeba" className="text-gray-300 hover:text-gov-gold transition-colors">የአባላት ምዝገባ</Link></li>
              <li><Link to="/qreta" className="text-gray-300 hover:text-gov-gold transition-colors">ጥቆማ</Link></li>
              <li><Link to="/projects" className="text-gray-300 hover:text-gov-gold transition-colors">ተግባራት</Link></li>
              <li><Link to="/sle-egna" className="text-gray-300 hover:text-gov-gold transition-colors">ስለ እኛ</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-gov-gold transition-colors">አግኙን</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="lg:col-span-2">
            <h3 className="font-display font-bold text-lg mb-4 border-b border-gov-gold/30 pb-2">
              አድራሻ
            </h3>
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gov-gold mt-0.5" />
                <div>
                  <p className="text-white">አቃቂ ቃሊቲ ክፍለ ከተማ</p>
                  <p className="text-gray-300 text-sm">አዲስ አበባ, ኢትዮጵያ</p>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gov-gold mt-0.5" />
                <p className="text-white">+251 713 975 038</p>
              </div>
              
              {/* Email */}
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gov-gold mt-0.5" />
                <p className="text-white">meronmengistu910@gmail.com</p>
              </div>

              {/* Working Hours */}
              <div className="flex items-start space-x-3">
                 <Clock className="h-5 w-5 text-gov-gold mt-0.5" />
                <div>
                  <p className="text-white">ከሰኞ - ሰኞ</p>
                  <p className="text-gray-300 text-sm">24 / 7</p>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Footer Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {currentYear} የሴቶች ክንፍ። መብቱ በህግ የተጠበቀ ነው።
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
