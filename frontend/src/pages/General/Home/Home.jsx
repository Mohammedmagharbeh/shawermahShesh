// //  اضافة المنيو

// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Clock, Phone, Award, Users, Heart, FileText } from "lucide-react";
// import home_logo2 from "@/assets/home_logo2.jpeg";
// import { useTranslation } from "react-i18next";
// import Footer from "@/components/Footer";
// import ImageCarousel from "./ImageCarousel";
// import { useUser } from "@/contexts/UserContext";
// import emailjs from "emailjs-com";

// import toast from "react-hot-toast";

// import lololo from "@/assets/lololo.png";
// import telephone from "@/assets/telephone.jpeg";
// import workings from "@/assets/workings.png";

// export default function Home() {
//   const location = useLocation();
//   const [section2, setSection2] = useState();
//   const { t, i18n } = useTranslation();
//   const selectedLanguage = i18n.language;
//   const { user } = useUser();

//   // الفورم
//   const [openForm, setOpenForm] = useState(false);
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");

//   const sendEmail = async () => {
//     if (!name || !email || !message) {
//       toast.error("يرجى ملء جميع الحقول المطلوبة.");
//       return;
//     }

//     try {
//       await emailjs.send(
//         "service_hzo8gfa",
//         "template_xkze6cd",
//         {
//           from_name: name,
//           from_email: email,
//           phone: phone,
//           message: message,
//           project_name: "Shawarma Sheesh",
//         },
//         "KrFWkCOJyFAwx__yC",
//       );

//       toast.success("✅ تم الإرسال بنجاح!");
//       setOpenForm(false);
//       setName("");
//       setPhone("");
//       setEmail("");
//       setMessage("");
//     } catch (err) {
//       console.error("EmailJS error:", err);
//       toast.error("❌ حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
//     }
//   };

//   useEffect(() => {
//     const fetchSection2 = async () => {
//       try {
//         const res = await fetch(
//           `${import.meta.env.VITE_BASE_URL}/slides?relatedTo=home-section2`,
//         );
//         const data = await res.json();
//         setSection2(data[0]);
//       } catch (error) {
//         console.error("Error fetching section 2 images:", error);
//       }
//     };
//     fetchSection2();
//   }, []);

//   useEffect(() => {
//     if (location.hash) {
//       const id = location.hash.substring(1);
//       const element = document.getElementById(id);
//       const timer = setTimeout(() => {
//         if (element) element.scrollIntoView({ behavior: "smooth" });
//       }, 100);
//       return () => clearTimeout(timer);
//     } else {
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   }, [location.hash]);

//   return (
//     <div
//       className="min-h-screen bg-background arabic-font mt-[1px] lg:-mt-[60px] p-0 m-0 overflow-x-hidden"
//       dir="rtl"
//     >
//       <ImageCarousel />

//       {/* قسم قصتنا */}
//       <section id="our_story" className="py-12 sm:py-16 md:py-20 bg-white">
//         <div className="container mx-auto px-4 sm:px-6">
//           <div
//             className={`grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center ${selectedLanguage === "ar" ? "rtl" : "ltr"}`}
//           >
//             {/* النصوص */}
//             <div
//               className={`${selectedLanguage === "ar" ? "text-right" : "text-left"}`}
//             >
//               <Badge
//                 className="mb-4 sm:mb-6 bg-red-100 border-red-200 px-3 sm:px-4 py-1.5 sm:py-2"
//                 style={{ color: "#dc0606" }}
//               >
//                 <Heart
//                   className={`h-3 w-3 sm:h-4 sm:w-4 ${selectedLanguage === "ar" ? "ml-2" : "mr-2"}`}
//                 />
//                 {t("about_us")}
//               </Badge>

//               <h2
//                 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900 leading-tight"
//                 style={{ textAlign: "inherit" }}
//               >
//                 {section2?.title[selectedLanguage]}
//               </h2>

//               <p
//                 className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed"
//                 style={{
//                   textAlign: "justify",
//                   textAlignLast: selectedLanguage === "ar" ? "right" : "left",
//                   hyphens: "auto",
//                 }}
//               >
//                 {section2?.subtitle[selectedLanguage]}
//               </p>

//               <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
//                 {[
//                   { icon: Award, text: t("high_quality") },
//                   { icon: Users, text: t("professional_team") },
//                   { icon: Clock, text: t("fast_service") },
//                 ].map((item, idx) => (
//                   <div key={idx} className="text-center">
//                     <div className="bg-red-100 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 hover:bg-red-200 transition-colors">
//                       <item.icon
//                         className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto"
//                         style={{ color: "#dc0606" }}
//                       />
//                     </div>
//                     <h4 className="font-bold text-[10px] sm:text-xs md:text-sm text-gray-800 leading-tight">
//                       {item.text}
//                     </h4>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* الصورة */}
//             <div
//               className={
//                 selectedLanguage === "ar" ? "order-last lg:order-first" : ""
//               }
//             >
//               <img
//                 src={section2?.image || home_logo2}
//                 alt="Kitchen"
//                 className="rounded-2xl shadow-xl w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover hover:scale-[1.01] transition-transform duration-300"
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* قسم الاتصال والموقع والمنيو */}
//       <section id="contact_us" className="py-12 sm:py-16 md:py-20 bg-white">
//         <div className="container mx-auto px-4 sm:px-6">
//           {/* عنوان القسم */}
//           <div className="text-center mb-10 sm:mb-12 md:mb-16">
//             <Badge
//               className="mb-3 sm:mb-4 bg-red-100 border-red-200 px-3 sm:px-4 py-1.5 sm:py-2"
//               style={{ color: "#dc0606" }}
//             >
//               <Phone className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
//               {t("contact_us")}
//             </Badge>
//             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
//               {t("contact_section_description")}
//             </h2>
//             <p className="text-base sm:text-lg text-gray-600">
//               {t("contact_section_title")}
//             </p>
//           </div>

//           {/* شبكة الكروت الأربعة المتطابقة بالكامل مع الحفاظ التام على أصل كود التلفون */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
//             {/* 1. بطاقة قائمة الطعام (المنيو) - تمت إعادة الأيقونة وتطبيق الترجمة */}
//             <Card className="text-center p-6 sm:p-8 border-0 shadow-lg bg-white flex flex-col items-center justify-between gap-4">
//               <div className="rounded-full w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 flex items-center justify-center bg-red-50 text-red-600">
//                 <a
//                   href="https://linktr.ee/shawermasheesh?utm_source=qr_code"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center justify-center w-full h-full"
//                 >
//                   <FileText
//                     className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
//                     style={{ color: "#dc0606" }}
//                   />
//                 </a>
//               </div>
//               <div className="space-y-2 flex-grow flex flex-col justify-center">
//                 <h3 className="text-lg sm:text-xl font-bold text-gray-900">
//                   {t("digital_menu")}
//                 </h3>
//                 <p className="text-xs sm:text-sm text-gray-600 text-center">
//                   {t("digital_menu_desc")}
//                 </p>
//               </div>
//               <a
//                 href="https://linktr.ee/shawermasheesh?utm_source=qr_code"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="w-full bg-red-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-red-700 transition-colors text-center inline-block"
//               >
//                 {t("view_menu_btn")}
//               </a>
//             </Card>

//             {/* 2. بطاقة الموقع */}
//             <Card className="text-center p-6 sm:p-8 border-0 shadow-lg bg-white flex flex-col items-center justify-between gap-4">
//               <div className="rounded-full w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 flex items-center justify-center overflow-hidden">
//                 <a
//                   href="https://maps.app.goo.gl/krQ9B5eYkjgVz9es6?g_st=iw"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <img
//                     src={lololo}
//                     alt="Location"
//                     className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain cursor-pointer hover:scale-110 transition"
//                   />
//                 </a>
//               </div>
//               <div className="space-y-2 flex-grow flex flex-col justify-center">
//                 <h3 className="text-lg sm:text-xl font-bold">
//                   {t("our_location")}
//                 </h3>
//                 <p className="text-xs sm:text-sm text-gray-600 text-center">
//                   {t("location_line1")} <br />
//                   {t("location_line2")}
//                 </p>
//               </div>
//               <div className="w-full h-[40px] hidden sm:block" />
//             </Card>

//             {/* 3. بطاقة الهاتف (تمت إعادتها تماماً كما كانت مع الحفاظ على الأنميشن الأصلي 100%) */}
//             <Card className="relative overflow-hidden text-center p-6 sm:p-8 border-0 shadow-lg bg-white group transition-all duration-500 hover:shadow-2xl">
//               <div className="absolute top-0 left-0 w-full h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

//               <div className="flex flex-col items-center gap-4">
//                 <a href="tel:+96232019099" className="relative inline-block">
//                   <div className="relative z-10 rounded-full w-32 h-32 sm:w-36 sm:h-36 mx-auto flex items-center justify-center overflow-hidden ring-4 ring-red-50 ring-offset-4 transition-all duration-500 transform group-hover:rotate-6 group-hover:scale-110">
//                     <img
//                       src={telephone}
//                       alt="الهاتف"
//                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                     />
//                   </div>
//                   <span className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping group-hover:hidden"></span>
//                 </a>

//                 <div className="space-y-1">
//                   <h3 className="text-xl font-black mt-2 group-hover:text-red-600 transition-colors duration-300">
//                     {t("call_us")}
//                   </h3>
//                   <p
//                     className="text-lg font-semibold text-gray-700 tracking-wider"
//                     dir="ltr"
//                   >
//                     (03) 201 9099
//                   </p>
//                   <p className="text-sm text-gray-500 italic">
//                     {t("contact_info")}
//                   </p>
//                 </div>

//                 <button
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setOpenForm(true);
//                   }}
//                   className="mt-2 overflow-hidden relative group/btn bg-gray-900 text-white font-bold px-8 py-3 rounded-full transition-all duration-300 hover:bg-red-600 hover:ring-4 hover:ring-red-100 w-full sm:w-auto"
//                 >
//                   <span className="relative z-10">{t("contact.title")}</span>
//                   <div className="absolute inset-0 bg-red-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
//                 </button>
//               </div>
//             </Card>

//             {/* 4. بطاقة ساعات العمل */}
//             <Card className="text-center p-6 sm:p-8 border-0 shadow-lg bg-white flex flex-col items-center justify-between gap-4">
//               <div className="rounded-full w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 flex items-center justify-center overflow-hidden">
//                 <img
//                   src={workings}
//                   alt="Working"
//                   className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 object-contain"
//                 />
//               </div>
//               <div className="space-y-2 flex-grow flex flex-col justify-center">
//                 <h3 className="text-lg sm:text-xl font-bold">
//                   {t("working_hours")}
//                 </h3>
//                 <p className="text-xs sm:text-sm text-gray-600 text-center">
//                   {t("working_hours_start")} <br />
//                   {t("working_hours_end")}
//                 </p>
//               </div>
//               <div className="w-full h-[40px] hidden sm:block" />
//             </Card>
//           </div>

//           {/* مودال الفورم */}
//           {openForm && (
//             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//               <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md border-2 border-red-600 shadow-xl">
//                 <h2 className="text-2xl font-bold mb-5 text-center text-red-600">
//                   {t("contact.title")}
//                 </h2>

//                 <input
//                   type="text"
//                   placeholder={t("contact.name")}
//                   className="w-full border border-gray-300 p-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-600"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                 />

//                 <input
//                   type="text"
//                   placeholder={t("contact.phone")}
//                   className="w-full border border-gray-300 p-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-600"
//                   value={phone}
//                   onChange={(e) => {
//                     const val = e.target.value.replace(/\D/g, "");
//                     if (val.length <= 10) setPhone(val);
//                   }}
//                 />

//                 <input
//                   type="email"
//                   placeholder={t("contact.email")}
//                   className="w-full border border-gray-300 p-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-600"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />

//                 <textarea
//                   placeholder={t("contact.message")}
//                   className="w-full border border-gray-300 p-2 rounded-lg mb-4 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                 ></textarea>

//                 <div className="flex gap-3">
//                   <button
//                     onClick={sendEmail}
//                     className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg w-full transition"
//                   >
//                     {t("contact.send")}
//                   </button>

//                   <button
//                     onClick={() => setOpenForm(false)}
//                     className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg w-full transition"
//                   >
//                     {t("contact.close")}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </section>

//       <Footer />
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Phone, Award, Users, Heart, FileText } from "lucide-react";
import { Smartphone, Share, X } from "lucide-react"; 
import home_logo2 from "@/assets/home_logo2.jpeg";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import ImageCarousel from "./ImageCarousel";
import { useUser } from "@/contexts/UserContext";
import emailjs from "emailjs-com";

import toast from "react-hot-toast";

import lololo from "@/assets/lololo.png";
import telephone from "@/assets/telephone.jpeg";
import workings from "@/assets/workings.png";

export default function Home() {
  const location = useLocation();
  const [section2, setSection2] = useState();
  const { t, i18n } = useTranslation();
  const selectedLanguage = i18n.language;
  const { user } = useUser();

  // الفورم
  const [openForm, setOpenForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // حالة النافذة الترحيبية لتثبيت التطبيق PWA
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstallGuide(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const sendEmail = async () => {
    if (!name || !email || !message) {
      toast.error("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    try {
      await emailjs.send(
        "service_hzo8gfa",
        "template_xkze6cd",
        {
          from_name: name,
          from_email: email,
          phone: phone,
          message: message,
          project_name: "Shawarma Sheesh",
        },
        "KrFWkCOJyFAwx__yC",
      );

      toast.success("✅ تم الإرسال بنجاح!");
      setOpenForm(false);
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("EmailJS error:", err);
      toast.error("❌ حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
    }
  };

  useEffect(() => {
    const fetchSection2 = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/slides?relatedTo=home-section2`,
        );
        const data = await res.json();
        setSection2(data[0]);
      } catch (error) {
        console.error("Error fetching section 2 images:", error);
      }
    };
    fetchSection2();
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      const timer = setTimeout(() => {
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <div
      className="min-h-screen bg-background arabic-font mt-[1px] lg:-mt-[60px] p-0 m-0 overflow-x-hidden"
      dir="rtl"
    >
      <ImageCarousel />

      {/* قسم قصتنا */}
      <section id="our_story" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div
            className={`grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center ${selectedLanguage === "ar" ? "rtl" : "ltr"}`}
          >
            {/* النصوص */}
            <div
              className={`${selectedLanguage === "ar" ? "text-right" : "text-left"}`}
            >
              <Badge
                className="mb-4 sm:mb-6 bg-red-100 border-red-200 px-3 sm:px-4 py-1.5 sm:py-2"
                style={{ color: "#dc0606" }}
              >
                <Heart
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${selectedLanguage === "ar" ? "ml-2" : "mr-2"}`}
                />
                {t("about_us")}
              </Badge>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900 leading-tight"
                style={{ textAlign: "inherit" }}
              >
                {section2?.title[selectedLanguage]}
              </h2>

              <p
                className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed"
                style={{
                  textAlign: "justify",
                  textAlignLast: selectedLanguage === "ar" ? "right" : "left",
                  hyphens: "auto",
                }}
              >
                {section2?.subtitle[selectedLanguage]}
              </p>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                {[
                  { icon: Award, text: t("high_quality") },
                  { icon: Users, text: t("professional_team") },
                  { icon: Clock, text: t("fast_service") },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="bg-red-100 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 hover:bg-red-200 transition-colors">
                      <item.icon
                        className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto"
                        style={{ color: "#dc0606" }}
                      />
                    </div>
                    <h4 className="font-bold text-[10px] sm:text-xs md:text-sm text-gray-800 leading-tight">
                      {item.text}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* الصورة */}
            <div
              className={
                selectedLanguage === "ar" ? "order-last lg:order-first" : ""
              }
            >
              <img
                src={section2?.image || home_logo2}
                alt="Kitchen"
                className="rounded-2xl shadow-xl w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover hover:scale-[1.01] transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* قسم الاتصال والموقع والمنيو */}
      <section id="contact_us" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          {/* عنوان القسم */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <Badge
              className="mb-3 sm:mb-4 bg-red-100 border-red-200 px-3 sm:px-4 py-1.5 sm:py-2"
              style={{ color: "#dc0606" }}
            >
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
              {t("contact_us")}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
              {t("contact_section_description")}
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              {t("contact_section_title")}
            </p>
          </div>

          {/* شبكة الكروت الأربعة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* 1. بطاقة قائمة الطعام (المنيو) */}
            <Card className="text-center p-6 sm:p-8 border-0 shadow-lg bg-white flex flex-col items-center justify-between gap-4">
              <div className="rounded-full w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 flex items-center justify-center bg-red-50 text-red-600">
                <a
                  href="https://linktr.ee/shawermasheesh?utm_source=qr_code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full h-full"
                >
                  <FileText
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                    style={{ color: "#dc0606" }}
                  />
                </a>
              </div>
              <div className="space-y-2 flex-grow flex flex-col justify-center">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {t("digital_menu")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center">
                  {t("digital_menu_desc")}
                </p>
              </div>
              <a
                href="https://linktr.ee/shawermasheesh?utm_source=qr_code"
                target="_blank"
                rel="noopener noreferrer"
             className="w-full bg-[#0044bb] text-white font-bold text-sm py-2.5 rounded-xl hover:bg-[#003eb3] transition-colors text-center inline-block"
                // className="w-full bg-red-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-red-700 transition-colors text-center inline-block"
              >
                {t("view_menu_btn")}
              </a>
            </Card>

            {/* 2. بطاقة الموقع */}
            <Card className="text-center p-6 sm:p-8 border-0 shadow-lg bg-white flex flex-col items-center justify-between gap-4">
              <div className="rounded-full w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 flex items-center justify-center overflow-hidden">
                <a
                  href="https://maps.app.goo.gl/krQ9B5eYkjgVz9es6?g_st=iw"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={lololo}
                    alt="Location"
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain cursor-pointer hover:scale-110 transition"
                  />
                </a>
              </div>
              <div className="space-y-2 flex-grow flex flex-col justify-center">
                <h3 className="text-lg sm:text-xl font-bold">
                  {t("our_location")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center">
                  {t("location_line1")} <br />
                  {t("location_line2")}
                </p>
              </div>
              <div className="w-full h-[40px] hidden sm:block" />
            </Card>

            {/* 3. بطاقة الهاتف */}
            <Card className="relative overflow-hidden text-center p-6 sm:p-8 border-0 shadow-lg bg-white group transition-all duration-500 hover:shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              <div className="flex flex-col items-center gap-4">
                <a href="tel:+96232019099" className="relative inline-block">
                  <div className="relative z-10 rounded-full w-32 h-32 sm:w-36 sm:h-36 mx-auto flex items-center justify-center overflow-hidden ring-4 ring-red-50 ring-offset-4 transition-all duration-500 transform group-hover:rotate-6 group-hover:scale-110">
                    <img
                      src={telephone}
                      alt="الهاتف"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <span className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping group-hover:hidden"></span>
                </a>

                <div className="space-y-1">
                  <h3 className="text-xl font-black mt-2 group-hover:text-red-600 transition-colors duration-300">
                    {t("call_us")}
                  </h3>
                  <p
                    className="text-lg font-semibold text-gray-700 tracking-wider"
                    dir="ltr"
                  >
                    (03) 201 9099
                  </p>
                  <p className="text-sm text-gray-500 italic">
                    {t("contact_info")}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenForm(true);
                  }}
                  className="mt-2 overflow-hidden relative group/btn bg-gray-900 text-white font-bold px-8 py-3 rounded-full transition-all duration-300 hover:bg-red-600 hover:ring-4 hover:ring-red-100 w-full sm:w-auto"
                >
                  <span className="relative z-10">{t("contact.title")}</span>
                  <div className="absolute inset-0 bg-red-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>
            </Card>

            {/* 4. بطاقة ساعات العمل */}
            <Card className="text-center p-6 sm:p-8 border-0 shadow-lg bg-white flex flex-col items-center justify-between gap-4">
              <div className="rounded-full w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 flex items-center justify-center overflow-hidden">
                <img
                  src={workings}
                  alt="Working"
                  className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 object-contain"
                />
              </div>
              <div className="space-y-2 flex-grow flex flex-col justify-center">
                <h3 className="text-lg sm:text-xl font-bold">
                  {t("working_hours")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center">
                  {t("working_hours_start")} <br />
                  {t("working_hours_end")}
                </p>
              </div>
              <div className="w-full h-[40px] hidden sm:block" />
            </Card>
          </div>

          {/* مودال الفورم */}
          {openForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md border-2 border-red-600 shadow-xl">
                <h2 className="text-2xl font-bold mb-5 text-center text-red-600">
                  {t("contact.title")}
                </h2>

                <input
                  type="text"
                  placeholder={t("contact.name")}
                  className="w-full border border-gray-300 p-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  type="text"
                  placeholder={t("contact.phone")}
                  className="w-full border border-gray-300 p-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) setPhone(val);
                  }}
                />

                <input
                  type="email"
                  placeholder={t("contact.email")}
                  className="w-full border border-gray-300 p-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <textarea
                  placeholder={t("contact.message")}
                  className="w-full border border-gray-300 p-2 rounded-lg mb-4 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>

                <div className="flex gap-3">
                  <button
                    onClick={sendEmail}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg w-full transition"
                  >
                    {t("contact.send")}
                  </button>

                  <button
                    onClick={() => setOpenForm(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg w-full transition"
                  >
                    {t("contact.close")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* النافذة الترحيبية المترجمة بالكامل بشكل ديناميكي */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInstallGuide(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-2">{t("install_guide.title")}</h2>
              <p className="text-gray-500 text-sm">{t("install_guide.subtitle")}</p>
            </div>
            
            <div className="space-y-4">
              {/* بطاقة الأندرويد */}
              <details
                className="group bg-red-50/60 rounded-2xl p-4 border transition-all"
                style={{ borderColor: "#da0103" }}
              >
                <summary
                  className="font-bold text-sm cursor-pointer flex justify-between items-center outline-none select-none"
                  style={{ color: "#da0103" }}
                >
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" /> {t("install_guide.android_title")}
                  </span>
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <ol className="mt-3 text-[12px] text-gray-700 space-y-2 list-decimal pr-4">
                  <li>{t("install_guide.android_step1")}</li>
                  <li>{t("install_guide.android_step2")}</li>
                  <li>{t("install_guide.android_step3")}</li>
                  <li>{t("install_guide.android_step4")}</li>
                  <li>{t("install_guide.android_step5")}</li>
                </ol>
              </details>

              {/* بطاقة الآيفون */}
              <details
                className="group bg-yellow-50/60 rounded-2xl p-4 border transition-all"
                style={{ borderColor: "#d9a400" }}
              >
                <summary
                  className="font-bold text-sm cursor-pointer flex justify-between items-center outline-none select-none"
                  style={{ color: "#d9a400" }}
                >
                  <span className="flex items-center gap-2">
                    <Share className="w-5 h-5" /> {t("install_guide.ios_title")}
                  </span>
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <ol className="mt-3 text-[12px] text-gray-700 space-y-2 list-decimal pr-4">
                  <li>{t("install_guide.ios_step1")}</li>
                  <li>{t("install_guide.ios_step2")}</li>
                  <li>{t("install_guide.ios_step3")}</li>
                  <li>{t("install_guide.ios_step4")}</li>
                  <li>{t("install_guide.ios_step5")}</li>
                </ol>
              </details>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full mt-6 py-3 text-white font-bold rounded-2xl transition-all shadow-md hover:opacity-90"
              style={{ backgroundColor: "#da0103" }}
            >
              {t("install_guide.close")}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}