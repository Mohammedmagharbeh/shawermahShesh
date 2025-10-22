// import { useState, useEffect } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Loader2 } from "lucide-react";
// import toast from "react-hot-toast";
// import { useTranslation } from "react-i18next";
// import { ProductDialog } from "@/componenet/common/ProductDialog";
// import product_placeholder from "../assets/product_placeholder.jpeg";

// const PRODUCTS_PER_PAGE = 6;

// export default function Products() {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("الكل");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [productsToShow, setProductsToShow] = useState(PRODUCTS_PER_PAGE);
//   const [isLoading, setIsLoading] = useState(true);
//   const { t } = useTranslation();
//   const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

//   // جلب المنتجات من API
//   useEffect(() => {
//     setIsLoading(true);
//     fetch(`${import.meta.env.VITE_BASE_URL}/products`)
//       .then((res) => res.json())
//       .then((data) => {
//         const allProducts = data.data || [];
//         setProducts(allProducts);
//         setFilteredProducts(allProducts);

//         const cats = [
//           "الكل",
//           ...new Set(
//             allProducts.map((p) => p.category[selectedLanguage] || p.category)
//           ),
//         ];
//         setCategories(cats);
//         setIsLoading(false);
//       })
//       .catch((err) => {
//         toast.error("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.");
//         setIsLoading(false);
//       });
//   }, [selectedLanguage]);

//   // فلترة المنتجات عند البحث أو تغيير التصنيف
//   useEffect(() => {
//     let filtered = products;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((p) =>
//         p.name[selectedLanguage]
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase())
//       );
//     }

//     if (selectedCategory !== "الكل") {
//       filtered = filtered.filter((p) => {
//         const categoryName =
//           typeof p.category === "object"
//             ? p.category[selectedLanguage]
//             : p.category;
//         return categoryName === selectedCategory;
//       });
//     }

//     setFilteredProducts(filtered);
//     setProductsToShow(PRODUCTS_PER_PAGE);
//   }, [products, searchTerm, selectedCategory, selectedLanguage]);

//   const handleShowMore = () => {
//     setProductsToShow(filteredProducts.length);
//   };

//   const displayedProducts = filteredProducts.slice(0, productsToShow);
//   const hasMoreProducts = filteredProducts.length > productsToShow;

//   return (
//     <div className="min-h-screen bg-gray-50 arabic-font" dir="rtl">
//       <div className="container mx-auto px-4 py-10">
//         <h2 className="text-3xl font-bold mb-6 text-gray-900">
//           {t("menu_title")}
//         </h2>

//         {/* البحث والتصنيفات */}
//         <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
//           <input
//             type="text"
//             placeholder={t("search_your_favorite_dish")}
//             className="w-full lg:w-80 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />

//           <div className="flex flex-wrap gap-2">
//             {categories.map((cat, i) => (
//               <button
//                 key={i}
//                 onClick={() => setSelectedCategory(cat)}
//                 className={`rounded-full px-4 py-2 ${
//                   selectedCategory === cat
//                     ? "bg-red-700 hover:bg-red-800 text-white"
//                     : "border border-red-700 text-red-700 hover:bg-red-50"
//                 }`}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* حالة التحميل */}
//         {isLoading ? (
//           <div className="text-center py-16">
//             <Loader2 className="h-8 w-8 animate-spin text-red-700 mx-auto mb-4" />
//             <p className="text-gray-600">{t("loading_products")}</p>
//           </div>
//         ) : filteredProducts.length > 0 ? (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {displayedProducts.map((product) => (
//                 <Card
//                   key={product._id}
//                   className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition bg-white"
//                 >
//                   <div className="relative">
//                     <img
//                       src={product.image || product_placeholder}
//                       alt={product.name[selectedLanguage]}
//                       className="w-full h-48 object-cover"
//                     />
//                     <div className="absolute top-3 right-3">
//                       <Badge className="bg-red-700 text-white">
//                         {product.category?.[selectedLanguage] ||
//                           product.category}
//                       </Badge>
//                     </div>
//                   </div>

//                   <CardContent className="p-6">
//                     <h3 className="text-xl font-bold mb-2 text-gray-900">
//                       {product.name[selectedLanguage]}
//                     </h3>
//                     <p className="text-gray-600 mb-4 text-sm">
//                       {product.description[selectedLanguage]}
//                     </p>

//                     <div className="flex items-center justify-between">
//                       <div>
//                         {product.discount > 0 ? (
//                           <>
//                             <p className="text-gray-500 line-through text-sm">
//                               {product.price} د.أ
//                             </p>
//                             <p className="text-2xl font-bold text-red-700">
//                               {product.discountedPrice
//                                 ? product.discountedPrice.toFixed(2)
//                                 : (
//                                     product.price -
//                                     (product.price * product.discount) / 100
//                                   ).toFixed(2)}{" "}
//                               د.أ
//                             </p>
//                             <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
//                               خصم {product.discount}%
//                             </span>
//                           </>
//                         ) : (
//                           <p className="text-2xl font-bold text-red-700">
//                             {product.price} د.أ
//                           </p>
//                         )}
//                       </div>

//                       <ProductDialog id={product._id} />
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             {hasMoreProducts && (
//               <div className="text-center mt-12">
//                 <button
//                   onClick={handleShowMore}
//                   className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg"
//                 >
//                   {t("show_more_products", {
//                     count: filteredProducts.length - productsToShow,
//                   })}
//                 </button>
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="text-center py-16">
//             <div className="text-6xl mb-4">🔍</div>
//             <h3 className="text-2xl font-bold mb-2">{t("no_results_title")}</h3>
//             <p className="text-gray-600">{t("no_results_description")}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Facebook, Instagram } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ProductDialog } from "@/componenet/common/ProductDialog";
import product_placeholder from "../assets/product_placeholder.jpeg";

// أيقونة واتساب مخصصة إذا لم تكن موجودة
const WhatsAppIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.248-6.189-3.515-8.452"/>
  </svg>
);

const PRODUCTS_PER_PAGE = 6;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");
  const [productsToShow, setProductsToShow] = useState(PRODUCTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  // جلب المنتجات من API
  useEffect(() => {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_BASE_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        const allProducts = data.data || [];
        setProducts(allProducts);
        setFilteredProducts(allProducts);

        const cats = [
          "الكل",
          ...new Set(
            allProducts.map((p) => p.category[selectedLanguage] || p.category)
          ),
        ];
        setCategories(cats);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.");
        setIsLoading(false);
      });
  }, [selectedLanguage]);

  // فلترة المنتجات عند البحث أو تغيير التصنيف
  useEffect(() => {
    let filtered = products;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name[selectedLanguage]
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "الكل") {
      filtered = filtered.filter((p) => {
        const categoryName =
          typeof p.category === "object"
            ? p.category[selectedLanguage]
            : p.category;
        return categoryName === selectedCategory;
      });
    }

    setFilteredProducts(filtered);
    setProductsToShow(PRODUCTS_PER_PAGE);
  }, [products, searchTerm, selectedCategory, selectedLanguage]);

  const handleShowMore = () => {
    setProductsToShow(filteredProducts.length);
  };

  const displayedProducts = filteredProducts.slice(0, productsToShow);
  const hasMoreProducts = filteredProducts.length > productsToShow;

  return (
    <div className="min-h-screen bg-gray-50 arabic-font" dir="rtl">
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          {t("menu_title")}
        </h2>

        {/* البحث والتصنيفات */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder={t("search_your_favorite_dish")}
            className="w-full lg:w-80 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 ${
                  selectedCategory === cat
                    ? "bg-red-700 hover:bg-red-800 text-white"
                    : "border border-red-700 text-red-700 hover:bg-red-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* حالة التحميل */}
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-700 mx-auto mb-4" />
            <p className="text-gray-600">{t("loading_products")}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedProducts.map((product) => (
                <Card
                  key={product._id}
                  className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition bg-white"
                >
                  <div className="relative">
                    <img
                      src={product.image || product_placeholder}
                      alt={product.name[selectedLanguage]}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-700 text-white">
                        {product.category?.[selectedLanguage] ||
                          product.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">
                      {product.name[selectedLanguage]}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {product.description[selectedLanguage]}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        {product.discount > 0 ? (
                          <>
                            <p className="text-gray-500 line-through text-sm">
                              {product.price} د.أ
                            </p>
                            <p className="text-2xl font-bold text-red-700">
                              {product.discountedPrice
                                ? product.discountedPrice.toFixed(2)
                                : (
                                    product.price -
                                    (product.price * product.discount) / 100
                                  ).toFixed(2)}{" "}
                              د.أ
                            </p>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              خصم {product.discount}%
                            </span>
                          </>
                        ) : (
                          <p className="text-2xl font-bold text-red-700">
                            {product.price} د.أ
                          </p>
                        )}
                      </div>

                      <ProductDialog id={product._id} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hasMoreProducts && (
              <div className="text-center mt-12">
                <button
                  onClick={handleShowMore}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg"
                >
                  {t("show_more_products", {
                    count: filteredProducts.length - productsToShow,
                  })}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">{t("no_results_title")}</h3>
            <p className="text-gray-600">{t("no_results_description")}</p>
          </div>
        )}
      </div>

      {/* الفوتر المضاف هنا */}
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
            <div className="text-center md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2">
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