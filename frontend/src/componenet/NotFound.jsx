import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const isRTL = selectedLanguage === "ar";

  return (
    <div
      className="min-h-screen bg-gradient-to-br  from-red-50 via-white to-yellow-50 flex items-center justify-center px-4 arabic-font relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Decorative Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl w-full text-center relative z-10 my-10">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-9xl md:text-[12rem] font-black text-red-600/20 blur-2xl">
            404
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-red-600 mb-4">
            {isRTL ? "عذراً، الصفحة غير موجودة!" : "Oops! Page Not Found"}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto">
            {isRTL
              ? "يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها أو لم تكن موجودة من الأساس."
              : "The page you're looking for might have been moved, deleted, or doesn't exist."}
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-4 mb-12">
          <div className="w-16 h-16 rounded-full bg-red-500/20 animate-bounce delay-75"></div>
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 animate-bounce delay-150"></div>
          <div className="w-16 h-16 rounded-full bg-red-500/20 animate-bounce delay-300"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            {isRTL ? "العودة للرئيسية" : "Go Home"}
          </Button>

          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {isRTL ? "رجوع" : "Go Back"}
          </Button>
        </div>

        {/* Search Suggestion */}
        <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100">
          <div className="flex items-center justify-center gap-3 text-gray-600 mb-2">
            <Search className="w-5 h-5 text-red-500" />
            <p className="font-medium">
              {isRTL ? "جرب البحث عن:" : "Try searching for:"}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => navigate("/products")}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
            >
              {isRTL ? "المنتجات" : "Products"}
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-lg transition-colors text-sm font-medium"
            >
              {isRTL ? "السلة" : "Cart"}
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
            >
              {isRTL ? "الرئيسية" : "Home"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
