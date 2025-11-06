import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Phone, Award, Users, Heart } from "lucide-react";
import home_logo2 from "../../assets/home_logo2.jpeg";
import { useTranslation } from "react-i18next";
import Footer from "@/componenet/Footer";
import ImageCarousel from "./ImageCarousel";
import { useUser } from "@/contexts/UserContext";

export default function Home() {
  const location = useLocation();
  const [section2, setSection2] = useState();
  const { t, i18n } = useTranslation();
  const selectedLanguage = i18n.language;
  const { user } = useUser();

  useEffect(() => {
    const fetchSection2 = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/slides?relatedTo=home-section2`,
          {
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${user.token}`,
            },
          }
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
    <div className="min-h-screen bg-background arabic-font" dir="rtl">
      <ImageCarousel />

      <section id="our_story" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <Badge
                className="mb-4 sm:mb-6 bg-red-100 border-red-200 px-3 sm:px-4 py-1.5 sm:py-2"
                style={{ color: "#dc0606" }}
              >
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                {t("about_us")}
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
                {section2?.title[selectedLanguage]}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                {section2?.subtitle[selectedLanguage]}
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                {[
                  { icon: Award, text: t("high_quality") },
                  { icon: Users, text: t("professional_team") },
                  { icon: Clock, text: t("fast_service") },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="bg-red-100 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3">
                      <item.icon
                        className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto"
                        style={{ color: "#dc0606" }}
                      />
                      <h4 className="font-bold text-xs sm:text-sm mt-1">
                        {item.text}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src={section2?.image || home_logo2}
                alt="مطبخنا"
                className="rounded-2xl shadow-xl w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* قسم الاتصال */}
      <section id="contact_us" className="py-12 sm:py-16 md:py-20 bg-gray-50">
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
              {t("contact_section_description")}
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              {t("contact_section_title")}
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
      <Footer />
    </div>
  );
}
