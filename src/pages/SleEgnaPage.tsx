
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Trophy, Users, BookOpen, Lightbulb, Heart } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import AboutUs from "@/components/AboutUs";

// Define a type for leadership data
interface Leader {
  name: string;
  position: string; // Corrected type for position
  experience: string;
  image: string; // Added comma
  message?: string; // Added message property and made it optional
}

const SleEgnaPage = () => {
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
    const leadershipData = [
    {      name: "ወ/ ሮ ሜሮን መንግስቱ",      position: "የአቃቂ ቃሊቲ ክ/ ከተማ የብልጽግና ሴቶች ክንፍ ጽ/ ቤት ኃላፊ",
      experience: "የአመራርነት የቆይታ ግዜ 9 ዓመት",
      image: "/images/ሜሮን.jpg", // Corrected image path
    },
    {
      name: "አያንቱ ሰጉ",
      position: "በአቃቂ ቃሊቲ ክ/ ከተማ ሴቶች ክንፍ ምክትል ኃላፊ",
      experience: "የአመራርነት የቆይታ ግዜ 5 ዓመት",
      image: "/images/አያንቱ ሰጉ.jpg",
    },
    {      name: "ሰርካለም በዙ",      position: "በአቃቂ ቃሊቲ ክ/ከተማ የሴቶች ክንፍ አደረጃጀት ዘርፍ ኃላፊ",
      experience: "የአመራርነት የቆይታ ግዜ 7 ዓመት",
      image: "/images/ሰርካለም.jpg",
    },
    {
      name: "ሀይማኖት ደገፉ",
      position: "በአቃቂ ቃሊቲ ክ/ ከተማ ሴቶች ክንፍ የስራ አስፈጻሚ አባል",
      experience: "የአመራርነት የቆይታ ግዜ 4 ዓመት",
      image: "/images/ሀይማኖት.jpg",
    } as Leader, // Explicitly cast to Leader type
    {      name: "ሂሩት ወንዳፍራሽ",      position: "በአቃቂ ቃሊቲ ክ/ ከተማ የሴቶች ክንፍ የስራ አስፈጻሚ አባል",      experience: "የአመራርነት የቆይታ ግዜ 4 ዓመት 7 ወር",      image: "/images/ሂሩት አባተ.jpg",
    }
  ];

  // Mission data for new section
  const missionData = [
    {
      title: "የየመድረኩን ተልዕኮዎች በትክክል ተገንዝቦ በብቃት የመፈፀም ተልዕኮ",
      content: "እያንዳንዱ የትግል መድረክ ትኩረት የሚሻ የየራሱ ተግባር አለው፡፡ በፓርቲያችንና በሱ የሚመራው መንግስት የያዘው የሀገር ግንባታ ኘሮግራም በተግባር ላይ ለማዋል በሚካሄደው ጥረት ከመጀመሪያ እስከ መጨረሻ አንድ ተግባር ብቻ በመፈፀም የሚጠናቀቅ አይደለም ፡፡ የብልጽግና ሴቶች ክንፍ  የየመድረኩ ተልዕኮዎችን በተገቢው አውቆ የሚተገብር እና የሚወጡትን ፖሊሲዎችና ስትራቴጂዎች የሴቶችን ተሳትፎና ተጠቃሚነት በተግባር እያረጋገጡ እንዲሄዱ በየወቅቱ የሚመነጩ የየወቅቱን ቁልፍና አበይት ተግባራት ለመፈፀም መረባረቡ የሚጠበቅና አግባብነት ያለው ነው፡፡ የብልጽግና ሴቶች ክንፉ በተግባር የመሪነት ሚና መጫወት ሲችል በየእርከኑ የሚገኙ አመራሮችና አባላት የመድረኩን ተልዕኮዎች ተገንዝበው የበኩላቸውን ሚና ሲጫወቱ የሀገራችን የዴሞክራሲ ስርአት ግንባታና የመልካም አስተዳደር እንድሁም  አጠቃላይ ብልፅግና እውን ማድረግ ይቻላል ፡፡በተጨማር የአባላትን መብትና ጥቅሞች ይበልጥ ለማስከበር የሚያስችል ሁኔታም ይፈጠራል፡፡",
      icon: BookOpen
    },
    {
      title: "ህብረተሰብአዊ ለውጥን የማፋጠን ተልዕኮ",
      content: "የሴቶች ክንፍ  ባለው የተናጥልና የጋራ ተልዕኮ በፓርቲያችን በሚመራው መንግስት የተቀረፁ ፖሊሲዎች፣ ስትራቴጂዎችና ልዩ ልዩ ፓኬጆች በተግባር በማዋልና ከዚህም ሴቷ ተገቢውን ጥቅም እንድታገኝ መታገል ነው ፡፡ የሌብነት አመለካከትና ተግባር አጠቃላይ ህብረተሰባዊ ለውጡን በማዘግየት የሴቶችን ተሳትፎና በልፋታቸው ልክ ተጠቃሚነትን በከፋ መልኩ ይጎዳዋል፤ ለውጡንም ያዘገየዋል። ይህ ደግሞ የሴቶችን ተግባራዊ ተጠቃሚነት በማረጋገጥ ረገድ በተለያየ መልኩ ማነቆዎችን የሚፈጥር በመሆኑ ሌብነት በብልጽግና ጉዟችን እንቅፋት የመሆን እድሉን ለማስቀረት በሚደረገው ትግል በፅናት መታገል ይጠበቅባቸዋል ፡፡ ይህ ሲሆን የሴቶች ማህበራዊ ሁኔታ ይሻሻልና የቤት ውስጥ ስራ የሚቃለልበት ሁኔታ ይፋጠናል። ስለሆነም ኢኮኖሚያዊ ጠቀሜታ በሚያስገኙ መስኮች እና ህይወታቸውን ሊለውጡ በሚችሉ ማህበራዊ ልማቶች ውስጥ የሚኖራቸው ተሳትፎም ይሻሻላል። ይህ ተመልሶ የሴቷን የማምረት አቅም በማጐልበት ወሣኝ የልማትና የዴሞክራሲ ሁኔታ መፍጠሪያ መሣሪያ ይሆናል። ይህ ታምኖበት ከፍተኛ ርብርብ እየተደረገ ይገኛል፡፡ የሴቷን የማምረት አቅም ከመገንባት አኳያ  የሥራ ዕድልን በማስፋት ረገድ አነስተኛና ጥቃቅን ተቋማትና የግሉ ሴክተር ልዩ ሚና እንደሚጫወቱ ታምኖበት እነዚህን ለማጠናከር ከፍተኛ ጥረት እየተደረገ ይገኛል፡፡ የሴቶችን ኢኮኖሚያዊ አቅምን ከማጐልበት አኳያ የመሠረተ ልማት አውታሮችን ማስፋፋት የግብዓት አውታሮችን ማሻሻል የሥራ አመራር ብቃትን መገንባትና የብድርና ቁጠባ አገልግሎትን ማቅረብ ቁልፍ ሚና እንደሚጫወት ይታወቃል፡፡",
      icon: Lightbulb
    },
    {
      title: "የሴቷን ጥቅም የማስከበር ተልዕኮ",
      content: "የብልጽግና ሴቶች ክንፍ  ሀገራዊ ግቦች እንዲሳኩና የመላው ህዝብ የጋራ ተጠቃሚነት እንዲረጋገጥ መታገሉና ሊጫወት የሚገባው የግንባር ቀደምነት ሚና እንደተጠበቀ ሆኖ የሴቷን መብትና ጥቅም ለማስከበር ደግሞ ዋና ተዋንያን መሆን ይጠበቅበታል ፡፡ የሀገራችን ሴቶች እንዲከበርላቸው የሚፈልጓቸው መብትና ጥቅሞች አላቸው፡፡ እነዚህ መብቶችና ጥቅም እንዲከበሩና ይበልጥም እየዳበሩ እንዲሄዱ ለማድረግ የሚቻለው ደግሞ ራሣችን ሴቶች በተደራጀ አኳኋን ለመብትና ጥቅሞቻችን እንድንታገል ማድረግ ሲንቻል ነው፡፡የሴቶች እኩልነት በህገ - መንግስቱ ታውቆ በኢኮኖሚ፣ በፖለቲካ፣ ማህበራዊና ሌሎችም ዘርፎች የሴቶችን እኩልነት የሚያረጋግጡ በርካታ ርምጃዎች ተወስደዋል፡፡ ይሁንና ዛሬም በአስተሣሰብና በተግባር የሴቶችን እኩልነትና እኩል የመጠቀም ዕድል የሚፈታተኑ አዝማሚያዎች እንዳይፈጠሩ ትግል ማድረግ ያስፈልጋል ፡፡ በመሆኑም የንብረት ባለቤትነት ጉዳይ፣ የሴቶች በቤት ውስጥ ሥራ ብቻ መጠመድ ችግር፣ የሴቶችን ፖለቲካዊና ማህበራዊ ተሣትፎ ማነስ፣ ከድህንነት ከኋላ ቀርነት ጋር የተያያዙ በርካታ ጐጂ ልማዳዊ ድርጊቶችና ችግሮች በበቅ ሁኔታ አልተፈቱም፡፡ በመሆኑም የሴቶች ክንፍ    በተለየ ትኩረት ለሴቶች መብቶች መከበር ግንባር ቀደም ተዋናይ መሆን ይበጠቅብናል፡፡",
      icon: Heart
    },
    {
      title: "የትግል መድረክ ሆኖ የማገልገል ተልዕኮ",
      content: "የብልጽግና ሴቶች ክንፍ  ሴቶች በፖሊሲና በስትራቴጂዎቹ ተጠቃሚ እንዲሆኑ ለማድረግ የሚያስችሉ ልዩ የመታገያ መድረክ ሆነው ያገለግላል ፡፡ በየወቅቱ ሴቶች የሚያጋጥማቸውን የልማትና የተጠቃሚነት ጥያቄዎች ለመፍታት የሚመክሩባቸው አቋሞቻቸውን የሚያጠሩበትና የሚያዋህዱባቸው መድረኮች በመሆን ያገለግላቸዋል፡፡ እነዚህ መድረኮች  ለዴሞክራሲና መልካም አስተዳደር መስፈን ሴቶች የሚመክሩባቸው፣ ሃሣባቸውንና ፍላጐታቸውን የሚያንፀባርቁባቸው ለትግል በሚያመች አኳኋን አስተሳሰቦችን የሚቀርፁባቸው መድረኮችም ሆነው ያገለግላሉ፡፡ በመሆኑም ሴቶች ምንጊዜም ቢሆን በሚከፈትላቸው ዕድሎች ሁሉ ተጠቅመው ፍላጐታቸውን በሠላማዊና ህጋዊ መንገድ ማራመድ ይገባቸዋል፡፡ በተጨባጭ ለአባሎቻቸው የሀሳብ ትግል መድረኮች ሆነው ማገልገል አለባቸው፡፡ በሚከፈቱ መድረኮች የተለያዩ አስተያየቶችን በማራመድ ጥሩ የትግል ልምድ ማግኘት ይችላሉ፡፡ ሀሣብን አደራጅተው የመግለፅ፣ በተለያዩ ሃሣቦች መካከል ዴሞክራሲያዊ ትግል የማካሄድ፣ ልዩነቶችን በውይይት የማጥበብ፣ በጋራ ጥቅሞች ላይ ትክክለኛና ጥራት ባላቸው አቋሞች ዙሪያ የመሰባሰብና የመታገል ልምድ ለማዳበር የዴሞክራሲ መማሪያና የመታገያ ትምህርት ቤቶች በመሆን ማገልገል አለባቸው ፡፡ ስለሆነም እነዚህ መድረኮች ከምንም ነገር በፊት ዴሞክራሲያዊ ሲሆኑ ነው ይህ ባህል ሊዳብር የሚችለው፡፡ የተሣሣተ ሃሣብን ጨምሮ ማንኛውንም ሃሣብ በነፃነት የመግለፅ ዕድልን የሚያጐናፅፍ፤ በልዩነቶች መካከል የሚካሄደው ትግል ሰውንና ሃሣብን ለይቶ በሃሣብ ላይ ብቻ ያተኮረ እንዲሆን የሚያደርጉ፤ ከትንሽም ይሁን ከትልቅ ከተማረም ይሁን ካልተማረ እንዲሁም ከየትኛውም ብሔር የፈለቀና የየትኛውም ሃይማኖት ተከታይ ከሆነ ሰው የቀረበን ሃሣብ በይዘቱ እንጂ ሃሣብን ባመነጨው ሰው ማንነትና ምንነት ላይ በመመስረት የማይለዩ መሆን ሲችሉ ነው መድረኮቹ ዴሞክራሲያዊና መማሪያ መሆን የሚችሉት፡፡ በተቃራኒው ሃሣብን የመግለፅ ነፃነትን የሚያጠቡ አሸማቃቂ አቀራረቦች የሚዘወተርበት መድረክ ከሆነ እነዚህ መድረኮች ወይም ሊጉ እንደ ትግል ትምህርት ቤት ሊያገለግሉም ሆነከላይ ያስቀመጥናቸውን ተልዕኮዎች በአግባቡ እንዲጫወቱ ሊያደርጉ አይችሉም፡፡ ስለሆነም የሊጉ በየደረጃው ያሉ መድረኮች የትግል ልምድና ብቃት መገንቢያ መድረክ ሆነው እንዲያገለግሉ ዲሞክራሲያዊ ሊሆኑ ይገባል፡፡",
      icon: Users
    },
    {
      title: "መላውን ሴቶች በጋራ ዓላማዎች ዙሪያ የማነቃነቅ ተልዕኮ",
      content: "ሴቶች ከፆታቸው ጋር በተያያዘ ምክንያት ተመሣሣይ የጋራ ሁኔታና ፍላጐት ይኖራቸዋል፡፡ ስለዚህ የብልጽግና ሴቶች  ክንፍ በተግባር ግንባር ቀደም በመሆን የራሳቸውን ማህበራዊ መሠረት የጋራ ፍላጐት መነሻ በማድረግ ሁሉንም የሴት ኃይል በጋራ ጥያቄዎች ዙሪያ በማንቀሳቀስና ከሂደቱም ተጠቃሚነታቸውን የማስፋት ተልዕኮ አለው፡፡ በፓርቲው መሪነት የሚቀመጡ አቅጣጫዎች በፓርቲው ውስጥ የሚገኙና የመላዋን ሴቶች ተሳትፎና ተጠቃሚነት በተግባር በሚፈለገው ደረጃ የሚያረጋግጡ እንዲሆኑ  ተጨማሪ የመታገያ መድረክ ሆኖ በማገልገል የሴቶችን ተሳትፎና ተጠቃሚነት ወደ አንድ ምእራፍ ለማሸጋገር የሚያስችል ሆኖ ይታያል።",
      icon: CheckCircle
    }
  ];

  return (
 <>
 <Navbar />
      
      {/* Add AboutUs component at the top */}
      <AboutUs />
      
      {/* Enhanced Mission Section with Beautiful Design */}
      <section className="py-16 relative overflow-hidden bg-gradient-to-b from-white to-purple-50">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-gray-50 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-100 rounded-full opacity-30"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-100 rounded-full opacity-20"></div>
        
        <div className="container-gov relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block relative">
              <h2 className="text-3xl md:text-5xl font-bold text-gov-dark mb-4">
                <span className="text-gov-accent relative">
                  የብልጽግና ሴቶች ክንፍ ተልዕኮ
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gov-accent transform translate-y-2"></div>
                </span>
              </h2>
            </div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto mt-6">
            የሴቶች ክንፍ ዋና ተልእኮ የሴቶችን ኢኮኖሚያዊ ፖለቲካዊና ማህበራዊ ተጠቃሚነትን ማረጋገጥ ነው፡፡
            </p>
          </div>

          {/* Mission Cards with Equal Height and Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-12 auto-rows-fr">
            {missionData.map((item, index) => (
              <div
 key={index}
                className="group flex" // Use flex to make the child fill the height
 >
                <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 flex flex-col w-full">
                  {/* Decorative header */}
                  <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-purple-300 to-gov-accent">


                  </div>
                  
                  {/* Icon with gradient background */}
                  <div className="pt-8 px-6 flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-purple-50 rounded-full transform -rotate-12 scale-110"></div>
                      <div className="relative bg-white p-4 rounded-full shadow-md border border-purple-100">
                        <item.icon className="h-8 w-8 text-gov-accent" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gov-dark mb-4 text-center flex-shrink-0">{item.title}</h3>
                    <div className="bg-purple-50 p-4 rounded-lg flex-grow">
                      <p className="text-gray-700 text-sm leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                  
                  {/* Bottom decoration */}
                  <div className="h-2 bg-gradient-to-r from-purple-50 via-purple-200 to-purple-50"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
            
 {/* Leadership Section */}
      <section className="py-16">
        <div className="container-gov">          
          {/* Section 4 - Leadership */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
 <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gov-dark mb-10">የሴቶች ክንፍ አመራሮች</h2>            <div className="max-w-4xl mx-auto mb-10">
            </div>
            
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6"> {/* Adjusted max-w */}
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                  slidesToScroll: 1
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4"> {/* Adjusted left margin */}
                  {leadershipData.map((leader, index) => (
                    <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 flex justify-center items-stretch"> {/* Added items-stretch */}
 <div
                        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 duration-300 border border-gray-100 flex flex-col w-full max-w-sm cursor-pointer ${expandedCardIndex === index ? 'h-auto' : 'h-96'}`} // Added h-96 for initial height and dynamic h-auto
                        onClick={() => setExpandedCardIndex(expandedCardIndex === index ? null : index)}
                      > {/* Toggle expansion */}
                        <div className="flex-shrink-0 h-60 overflow-hidden"> {/* Slightly reduced image height */}
                          <img 
                            src={leader.image}
                            alt={leader.name}
                            className="w-full h-full object-cover object-top" // object-top to focus on the face
                            onError={(e: any) => {
                              // You might want a specific placeholder image for leaders
                              e.currentTarget.src = "/images/placeholder-leader.jpg"; // Example placeholder
                              e.currentTarget.onerror = null; // prevent infinite loop
                              e.currentTarget.style.objectFit = 'contain'; // Adjust object-fit for placeholder
                              e.currentTarget.style.backgroundColor = '#f0f0f0'; // Add a background for placeholder
                            }}
                          />
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold text-lg text-gov-dark mb-1">{leader.name}</h4>
                          <p className="text-gov-accent text-sm mb-1">{leader.position}</p>
                          <p className="text-gray-600 text-xs">{leader.experience}</p>
                        </div>
                        {expandedCardIndex === index && (
                          <div className="p-5 pt-0">
                            <p className="text-gray-700 text-sm leading-relaxed">{leader.message}</p>
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center mt-6">
                  <CarouselPrevious className="static translate-y-0 mx-2 bg-gov-accent hover:bg-gov-accent/90 text-white border-none" />
                  <CarouselNext className="static translate-y-0 mx-2 bg-gov-accent hover:bg-gov-accent/90 text-white border-none" />
                </div>
              </Carousel>
            </div>
 </div> {/* Closing tag for Leadership Section inner div */}
        </div> {/* Closing tag for container-gov */}
      </section> {/* Closing tag for Leadership Section */}
      <Footer /> {/* Added closing tag */}
 </>
  );
};
export default SleEgnaPage;
