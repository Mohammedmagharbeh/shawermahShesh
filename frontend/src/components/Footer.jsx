import { Facebook, Instagram } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  const WhatsAppIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.248-6.189-3.515-8.452" />
    </svg>
  );
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between relative text-center md:text-left">
          {/* شعار Yalla Sheesh — تحت في الهاتف، يسار في الكمبيوتر */}
          <div className="flex flex-col items-center md:items-start mt-8 md:mt-0">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yalla%20sheesh-wYD9LCTpwgPKc6YoFDJwUVLwLBnmMW.png"
              alt="Yalla Sheesh"
              className="h-10 sm:h-16 w-auto object-contain"
              loading="lazy"
            />

            {/* مواقع التواصل */}
            <div className="flex gap-3 sm:gap-4 mt-4 justify-center md:justify-start w-full flex-wrap">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/sheesh.jo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </a>

              {/* WhatsApp */}
              <a
                href="https://api.whatsapp.com/send?phone=96232019099"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <WhatsAppIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/SHAWERMASHEESH/"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </a>
            </div>
          </div>

          <div className="text-center md:absolute md:left-[35%] md:top-[50%] mt-4 md:mt-0">
            <p className="text-gray-100 text-xs sm:text-sm">
              {t("all_rights_reserved")}
            </p>
          </div>

          <div className="flex justify-center md:justify-end mb-8 md:mb-0">
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
  );
}

export default Footer;
