import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  Phone,
  Award,
  Users,
  Heart,
  Facebook,
  Instagram,
} from "lucide-react";

import product_placeholder from "../assets/product_placeholder.jpeg";
import home_logo from "../assets/home_logo.jpeg";
import home_logo2 from "../assets/home_logo2.jpeg";
import { useTranslation } from "react-i18next";
import c from "../assets/c.jpeg";
import c2 from "../assets/c2.jpeg";
import c3 from "../assets/c3.jpg";
import { useUser } from "@/contexts/UserContext";

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.248-6.189-3.515-8.452" />
  </svg>
);

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();

  const slides = [
    {
      image: home_logo,
      title: t("shawarma_delicious"),
      subtitle: t("authentic_taste"),
    },
    {
      image: home_logo2,
      title: t("fresh_meals"),
      subtitle: t("high_quality"),
    },
    {
      image: product_placeholder,
      title: t("fast_delivery"),
      subtitle: t("order_now"),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (isAuthenticated) {
    navigate("/products");
    return null;
  }

  return (
    <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] overflow-hidden ">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image || "/placeholder.svg"}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
              {slide.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-6 sm:mb-8 drop-shadow-lg">
              {slide.subtitle}
            </p>
            <Link to={"/login"}>
              <Button
                size="lg"
                className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-6 text-white font-bold shadow-xl hover:scale-105 transition-transform"
                style={{ backgroundColor: "#dc0606" }}
              >
                {t("products_and_shopping")}
              </Button>
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
              index === currentIndex ? "bg-white w-6 sm:w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const FloatingCertificates = () => {
  return (
    <div className="fixed top-1/2 right-2 sm:right-3 md:right-4 transform -translate-y-1/2 z-40 flex flex-col gap-2 sm:gap-3 items-end">
      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 aspect-square rounded-full overflow-hidden border-2 border-white shadow-xl cursor-pointer hover:scale-110 transition-transform bg-white">
        <img
          src={c3 || "/placeholder.svg"}
          alt="certificate"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 aspect-square rounded-full overflow-hidden border-2 border-white shadow-xl cursor-pointer hover:scale-110 transition-transform bg-white mr-1 sm:mr-2">
        <img
          src={c2 || "/placeholder.svg"}
          alt="certificate"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 aspect-square rounded-full overflow-hidden border-2 border-white shadow-xl cursor-pointer hover:scale-110 transition-transform bg-white mr-2 sm:mr-3 md:mr-4">
        <img
          src={c || "/placeholder.svg"}
          alt="certificate"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default function Home() {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);

      const timer = setTimeout(() => {
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

      return () => clearTimeout(timer);
    } else if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background arabic-font" dir="rtl">
      <FloatingCertificates />

      <section id="home" className="pt-11">
        <ImageCarousel />
      </section>

      <section id="about" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <Badge
                className="mb-4 sm:mb-6 bg-red-100 border-red-200 px-3 sm:px-4 py-1.5 sm:py-2"
                style={{ color: "#dc0606" }}
              >
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                {t("our_story")}
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
                {t("story_title")}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                {t("story_description")}
              </p>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3">
                    <Award
                      className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto"
                      style={{ color: "#dc0606" }}
                    />
                    <h4 className="font-bold text-xs sm:text-sm mt-1">
                      {t("high_quality")}
                    </h4>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3">
                    <Users
                      className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto"
                      style={{ color: "#dc0606" }}
                    />
                    <h4 className="font-bold text-xs sm:text-sm mt-1">
                      {t("professional_team")}
                    </h4>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3">
                    <Clock
                      className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto"
                      style={{ color: "#dc0606" }}
                    />
                    <h4 className="font-bold text-xs sm:text-sm mt-1">
                      {t("fast_service")}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <img
                src={home_logo2 || "/placeholder.svg"}
                alt="مطبخنا"
                className="rounded-2xl shadow-xl w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <Badge
              className="mb-3 sm:mb-4 bg-red-100 border-red-200 px-3 sm:px-4 py-1.5 sm:py-2"
              style={{ color: "#dc0606" }}
            >
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
              {t("contact_us")}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
              {t("contact_section_title")}
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              {t("contact_section_description")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center p-6 sm:p-8 border-0 shadow-lg bg-white">
              <div className="bg-red-100 rounded-full p-4 sm:p-5 md:p-6 w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 aspect-square mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <a
                  href="https://maps.app.goo.gl/krQ9B5eYkjgVz9es6?g_st=iw"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin
                    className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 cursor-pointer hover:scale-110 transition"
                    style={{ color: "#dc0606" }}
                  />
                </a>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                {t("our_location")}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t("location_line1")}
                <br />
                {t("location_line2")}
              </p>
            </Card>

            <a href="tel:+96332019099">
              <Card className="text-center p-6 sm:p-8 border-0 shadow-lg bg-white cursor-pointer hover:shadow-xl transition">
                <div className="bg-red-100 rounded-full p-4 sm:p-5 md:p-6 w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 aspect-square mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Phone
                    className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                    style={{ color: "#dc0606" }}
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                  {t("call_us")}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  (03) 201 9099
                  <br />
                  {t("contact_info")}
                </p>
              </Card>
            </a>

            <Card className="text-center p-6 sm:p-8 border-0 shadow-lg bg-white sm:col-span-2 lg:col-span-1">
              <div className="bg-red-100 rounded-full p-4 sm:p-5 md:p-6 w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 aspect-square mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <Clock
                  className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                  style={{ color: "#dc0606" }}
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                {t("working_hours")}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t("working_hours_start")}
                <br />
                {t("working_hours_end")}
              </p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between relative">
            {/* Yalla Sheesh على اليسار */}
            <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yalla%20sheesh-wYD9LCTpwgPKc6YoFDJwUVLwLBnmMW.png"
                alt="Yalla Sheesh"
                className="h-16 sm:h-20 w-auto object-contain"
              />

              {/* مواقع التواصل في منتصف كلمة Yalla Sheesh */}
              <div className="flex gap-3 sm:gap-4 mt-4 justify-center w-full">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/sheesh.jo?mibextid=wwXIfr&rdid=3j0Reo6yOi0oZhpd&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FZvBdU7Ej%2F%3Fmibextid%3DwwXIfr#"
                  className="w-9 h-9 sm:w-10 sm:h-10 aspect-square rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://api.whatsapp.com/send?phone=96232019099"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 aspect-square rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <WhatsAppIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/SHAWERMASHEESH/"
                  className="w-9 h-9 sm:w-10 sm:h-10 aspect-square rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </a>
              </div>
            </div>

            {/* حقوق النشر في المنتصف تماماً بين الشعار والصورة */}
            <div className="text-center md:absolute md:left-[35%] md:top-[50%]">
              <p className="text-gray-100 text-xs sm:text-sm">
                {t("all_rights_reserved")}
              </p>
            </div>

            {/* الشعار على اليمين */}
            <div className="flex justify-center md:justify-end mt-8 md:mt-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20Sheesh%202025-cBMQInheJu59v7DqexALEnU0AaaWZq.png"
                alt="Restaurant Logo"
                className="h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 object-contain"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
