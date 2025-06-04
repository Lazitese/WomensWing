import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

const ContactPage = () => {
  useEffect(() => {
    document.title = "አግኙን | የአቃቂ ቃሊቲ ክፍለ ከተማ ብልጽግና ፓርቲ ሴቶች ክንፍ";
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />
      
      {/* Hero Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, black, transparent)'
        }}
      />
      
      <div className="relative z-10 pt-24 pb-16">
        <div className="container-gov">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gov-dark mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-gov-accent">አግኙን</span>
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              በማንኛውም ጥያቄ፣ አስተያየት ወይም ጥቆማ ከታች በተዘረዘሩት የመገኛ መንገዶች ሊያገኙን ይችላሉ
            </motion.p>
          </motion.div>
          
          <div className="max-w-5xl mx-auto">
            {/* Contact Info Cards */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
            >
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="backdrop-blur-sm bg-white/90 rounded-xl shadow-xl p-6 border border-white/20"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-gov-accent p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gov-dark mb-2">አድራሻ</h3>
                    <p className="text-gray-600">አቃቂ ቃሊቲ ክፍለ ከተማ</p>
                    <p className="text-gray-600">አዲስ አበባ, ኢትዮጵያ</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="backdrop-blur-sm bg-white/90 rounded-xl shadow-xl p-6 border border-white/20"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-gov-accent p-3 rounded-full">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gov-dark mb-2">ስልክ</h3>
                    <p className="text-gray-600">+251 713 975 038</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="backdrop-blur-sm bg-white/90 rounded-xl shadow-xl p-6 border border-white/20"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-gov-accent p-3 rounded-full">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gov-dark mb-2">ኢሜይል</h3>
                    <p className="text-gray-600">meronmengistu910@gmail.com</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="backdrop-blur-sm bg-white/90 rounded-xl shadow-xl p-6 border border-white/20"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-gov-accent p-3 rounded-full">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gov-dark mb-2">የስራ ሰዓት</h3>
                    <p className="text-gray-600">ከሰኞ - ሰኞ</p>
                    <p className="text-gray-600">24 / 7</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Map Embed */}
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="backdrop-blur-sm bg-white/90 rounded-xl shadow-xl p-6 border border-white/20"
            >
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63120.92662568556!2d38.72875755!3d8.9600295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b8f7149433d5b%3A0xf8f3f4aa604ca0d4!2sAkaki%20Kality%2C%20Addis%20Ababa!5e0!3m2!1sen!2set!4v1647887844221!5m2!1sen!2set"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContactPage;
