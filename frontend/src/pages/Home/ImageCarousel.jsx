import Loading from "@/componenet/common/Loading";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import c from "../../assets/c.jpeg";
import c2 from "../../assets/c2.jpeg";
import c3 from "../../assets/c3.jpg";

const FloatingCertificates = () => (
  <div className="absolute top-24 right-2 sm:top-1/2 sm:right-3 md:right-4 transform sm:-translate-y-1/2 z-40 flex flex-col gap-2 sm:gap-3 items-end">
    {[c3, c2, c].map((cert, i) => (
      <div
        key={i}
        className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20 aspect-square rounded-full overflow-hidden border-2 border-white shadow-xl cursor-pointer hover:scale-110 transition-transform bg-white"
      >
        <img
          src={cert || "/placeholder.svg"}
          alt="certificate"
          className="w-full h-full object-cover"
        />
      </div>
    ))}
  </div>
);

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useUser();
  const selectedLanguage = i18n.language;
  const navigate = useNavigate();

  // جلب البيانات من الباك
  useEffect(() => {
    const fetchSlides = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/slides?relatedTo=home-section1`,
          {
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${user.token}`,
            },
          }
        );
        const data = await res.json();
        setSlides(data);
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides]);

  if (isAuthenticated) {
    navigate("/products");
    return null;
  }

  if (loading) return <Loading />;

  return (
    <section id="home" className="pt-0">
      <FloatingCertificates />
      <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] overflow-hidden">
        {slides?.map((slide, index) => (
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
                {slide.title[selectedLanguage]}
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-6 sm:mb-8 drop-shadow-lg">
                {slide.subtitle[selectedLanguage]}
              </p>
              <div className="absolute bottom-10 sm:bottom-14 w-full flex justify-center z-20">
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
    </section>
  );
};

export default ImageCarousel;
