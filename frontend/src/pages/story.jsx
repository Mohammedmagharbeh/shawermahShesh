import { useState, useEffect } from "react"
import { Facebook, Instagram } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

function Story() {
  const { t, i18n } = useTranslation()
  
  // جلب اللغة المحفوظة أو استخدام اللغة الحالية
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLanguage') || i18n.language;
    }
    return i18n.language;
  });

  // تغيير اللغة وحفظها
  useEffect(() => {
    i18n.changeLanguage(language)
    localStorage.setItem('selectedLanguage', language)
  }, [language, i18n])

  // دالة لتغيير اللغة من المفتاح الخارجي
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  }

  // الاستماع لتغييرات اللغة من المفتاح الخارجي
  useEffect(() => {
    // إذا كانت اللغة في i18n تغيرت من مصدر خارجي
    if (i18n.language !== language) {
      setLanguage(i18n.language);
      localStorage.setItem('selectedLanguage', i18n.language);
    }
  }, [i18n.language]);

  // أيقونة واتساب
  const WhatsAppIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.248-6.189-3.515-8.452" />
    </svg>
  )

  const content = t("story", { returnObjects: true })

  return (
    <div className="min-h-screen bg-white">
      {/* العنوان */}
      <div className="bg-gradient-to-b from-[#b80505] to-[#dc0606] text-white py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{content.title}</h1>
          <p className="text-xl md:text-2xl text-yellow-300 font-semibold">{content.subtitle}</p>
        </motion.div>
      </div>

      {/* المحتوى */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {content.sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: language === "ar" ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="group"
            >
              <div
                className="bg-white border-l-4 border-[#dc0606] rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-yellow-400"
                style={{ direction: language === "ar" ? "rtl" : "ltr" }}
              >
                <motion.h2
                  whileHover={{ color: "#dc0606" }}
                  className="text-2xl md:text-3xl font-bold text-[#dc0606] mb-4"
                >
                  {section.title}
                </motion.h2>
                <p className="text-gray-700 text-lg leading-relaxed">{section.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* الفوتر */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between relative text-center md:text-left gap-8">
            {/* شعار Yalla Sheesh */}
            <div className="flex flex-col items-center md:items-start">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yalla%20sheesh-wYD9LCTpwgPKc6YoFDJwUVLwLBnmMW.png"
                alt="Yalla Sheesh"
                className="h-10 sm:h-16 w-auto object-contain"
                loading="lazy"
              />
              {/* مواقع التواصل */}
              <div className="flex gap-3 sm:gap-4 mt-4 justify-center md:justify-start w-full flex-wrap">
                <a
                  href="https://www.facebook.com/sheesh.jo"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=96232019099"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <WhatsAppIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </a>
                <a
                  href="https://www.instagram.com/SHAWERMASHEESH/"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </a>
              </div>
            </div>

            <div className="text-center md:absolute md:left-[35%] md:top-[50%]">
              <p className="white text-xs sm:text-sm">
                {t("all_rights_reserved") || "© 2025 Yalla Sheesh. All rights reserved."}
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20Sheesh%202025-cBMQInheJu59v7DqexALEnU0AaaWZq.png"
                alt="Restaurant Logo"
                className="h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Story