import { useEffect, useRef } from "react";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  const particlesContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create particles
    if (!particlesContainer.current) return;
    
    const container = particlesContainer.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Clear existing particles
    container.innerHTML = "";
    
    // Add particles
    for (let i = 0; i < 30; i++) {
      createParticle(container, containerWidth, containerHeight);
    }
    
    // Set up interval to continuously add particles
    const interval = setInterval(() => {
      if (container && document.body.contains(container)) {
        createParticle(container, containerWidth, containerHeight);
      } else {
        clearInterval(interval);
      }
    }, 800);
    
    return () => clearInterval(interval);
  }, []);
  
  const createParticle = (container: HTMLDivElement, width: number, height: number) => {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    
    // Random position
    const x = Math.random() * width;
    const y = Math.random() * height * 0.7; // Keep particles in upper 70% of container
    
    // Random size
    const size = Math.random() * 8 + 2; // 2-10px
    
    // Set styles with brand colors
    const colors = ['#1f8cd7', '#f9dc2f', '#f2b42d', '#d9348b'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = randomColor;
    
    // Add to container
    container.appendChild(particle);
    
    // Remove after animation completes
    setTimeout(() => {
      if (particle.parentNode === container) {
        container.removeChild(particle);
      }
    }, 3000);
  };

 return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden py-20"> {/* Added padding for better spacing */}
      {/* Hero background image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
           style={{ 
             backgroundImage: 'url(/images/hero-bg.png)',
             backgroundPosition: 'center',
             backgroundSize: 'cover'
           }}>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/60 to-brand-blue/50"></div>
      </div>
      
      {/* Animated Particles */}
      <div ref={particlesContainer} className="particles relative z-10"></div>
      
      <div className="container-gov relative z-10 pt-16 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in text-brand-white drop-shadow-lg">
          የአቃቂ ቃሊቲ ክፍለ ከተማ <span className="text-brand-yellow">ብልጽግና ፓርቲ</span> ሴቶች ክንፍ
        </h1>
        
        <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-brand-white drop-shadow-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
          የሴቶችን ኢኮኖሚያዊ , ፖለቲካዊ እና ማህበራዊ ተጠቃሚነት ማረጋገጥ
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in" style={{ animationDelay: "0.4s" }}> {/* Reduced bottom margin */}
          <Link to="/contact">
            <Button className="bg-brand-yellow hover:bg-opacity-90 text-brand-black px-8 py-6 text-lg group" size="lg">
              <span>አግኙን</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          
          <Link to="/abalat-mzgeba">
            <Button variant="outline" className="border-brand-white bg-transparent text-brand-white hover:bg-white/10 px-8 py-6 text-lg" size="lg">
              አባላት ምዝገባ
            </Button>
          </Link>
        </div>
        
        {/* Plain text with icon */}
 <div className="flex items-center justify-center gap-4 animate-fade-in px-4 py-3 rounded-lg backdrop-filter backdrop-blur-sm bg-white/20 max-w-fit mx-auto" style={{ animationDelay: "0.6s" }}> {/* Added background for the text container */}
 <HeartHandshake size={40} className="text-brand-yellow animate-pulse" /> {/* Added HeartHandshake icon and pulse animation */}
 <h3 className="text-3xl md:text-4xl font-bold text-center drop-shadow-lg">
 <span style={{ color: '#1f8cd7' }}>ህብረ ብሄራዊ</span> <span style={{ color: '#f9dc2f' }}>እህትማማችነት</span> <span style={{ color: '#d9348b' }}>ለብልጽግና ግብ ስኬት</span>
 <style>{`
              @keyframes wave {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
              }
              .wave-text { display: inline-block; animation: wave 3s infinite ease-in-out; }
 `}</style>
          
          </h3>
        </div>
      </div>
    </section>
  );
};

export default Hero;
