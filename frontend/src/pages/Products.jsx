// import { useState, useMemo } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Loader2 } from "lucide-react";
// import toast from "react-hot-toast";
// import { useTranslation } from "react-i18next";
// import { ProductDialog } from "@/componenet/common/ProductDialog";
// import product_placeholder from "../assets/product_placeholder.jpeg";
// import { CATEGORIES } from "@/constants";
// import { useUser } from "@/contexts/UserContext";
// import Loading from "@/componenet/common/Loading";

// export default function Products() {
//   const [products, setProducts] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("Shawarma");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const { t } = useTranslation();
//   const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
//   const { user, logout } = useUser();

//   const fetchProducts = () => {
//     setIsLoading(true);
//     fetch(
//       `${import.meta.env.VITE_BASE_URL}/products?category=${selectedCategory}`,
//       {
//         headers: {
//           authorization: `Bearer ${user.token}`,
//         },
//       }
//     )
//       .then((res) => res.json())
//       .then((data) => {
//         const allProducts = data.data || [];
//         setProducts(allProducts);
//         setIsLoading(false);
//       })
//       .catch((err) => {
//         console.error(err);
//         if (err.message.includes("Invalid token")) {
//           logout();
//         }

//         toast.error("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.");
//         setIsLoading(false);
//       });
//   };

//   useMemo(() => {
//     fetchProducts();
//   }, [selectedCategory]);

//   if (isLoading) return <Loading />;

//   return (
//     <div className="min-h-screen bg-gray-50 arabic-font" dir="rtl">
//       <div className="container mx-auto px-4 py-10">
//         <div className="mb-6">
//           {/* <input
//             type="text"
//             placeholder={t("search_your_favorite_dish")}
//             className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           /> */}
//         </div>
//         <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
//           {CATEGORIES.map((cat, i) => {
//             const isAll = cat === "All";
//             const catValue = isAll ? "all" : cat.en;
//             const catLabel = isAll ? t("all") : cat[selectedLanguage];

//             return (
//               <button
//                 key={i}
//                 onClick={() => setSelectedCategory(catValue)}
//                 className={`whitespace-nowrap px-6 py-2 rounded-lg transition ${
//                   selectedCategory === catValue
//                     ? "bg-yellow-500 text-white" // تغيير من orange-400 إلى yellow-500
//                     : "bg-white text-gray-700 border border-gray-300"
//                 }`}
//               >
//                 {catLabel}
//               </button>
//             );
//           })}
//         </div>

//         {products.length > 0 ? (
//           <>
//             <div className="space-y-6">
//               {products.map((product) => {
//                 const isOutOfStock = product.inStock === false;

//                 return (
//                   <Card
//                     key={product._id}
//                     className={`overflow-hidden border-0 shadow-sm transition bg-white ${
//                       isOutOfStock
//                         ? "opacity-60 grayscale hover:shadow-sm"
//                         : "hover:shadow-md"
//                     }`}
//                   >
//                     <CardContent className="p-0">
//                       <div className="flex flex-row-reverse items-center gap-4 p-4 relative">
//                         {/* Out of Stock Badge */}
//                         {isOutOfStock && (
//                           <Badge
//                             variant="destructive"
//                             className="absolute top-2 left-2 z-10"
//                           >
//                             {t("out_of_stock") || "Out of Stock"}
//                           </Badge>
//                         )}

//                         {/* الصورة على اليسار */}
//                         {/* <div className="flex-shrink-0 w-32 h-32 relative"> */}
//                         <div className="flex-shrink-0 w-24 h-24 relative">

//                           <img
//                             src={product.image || product_placeholder}
//                             alt={product.name[selectedLanguage]}
//                             className={`w-full h-full object-cover rounded-lg ${
//                               isOutOfStock ? "grayscale opacity-70" : ""
//                             }`}
//                           />
//                         </div>

//                         {/* المحتوى على اليمين */}
//                         <div className="flex-1 flex flex-col justify-between">
//                           <div>
//                             <h3
//                               className={`text-lg font-bold mb-1 ${
//                                 isOutOfStock ? "text-gray-500" : "text-gray-900"
//                               }`}
//                             >
//                               {product.name[selectedLanguage]}
//                             </h3>
//                             <p
//                               className={`text-sm mb-2 line-clamp-2 ${
//                                 isOutOfStock ? "text-gray-400" : "text-gray-600"
//                               }`}
//                             >
//                               {product.description[selectedLanguage]}
//                             </p>
//                           </div>

//                           <div className="flex items-center justify-between mt-2">
//                             <div>
//                               {product.discount > 0 &&
//                               !product.hasProteinChoices &&
//                               !product.hasTypeChoices ? (
//                                 <div className="flex items-center gap-2">
//                                   <p
//                                     className={`text-xl font-bold ${
//                                       isOutOfStock
//                                         ? "text-gray-400"
//                                         : "text-orange-500"
//                                     }`}
//                                   >
//                                     JOD
//                                     {product.discountedPrice
//                                       ? product.discountedPrice.toFixed(2)
//                                       : (
//                                           product.basePrice -
//                                           (product.basePrice *
//                                             product.discount) /
//                                             100
//                                         ).toFixed(2)}
//                                   </p>
//                                   <p className="text-gray-400 line-through text-sm">
//                                     {product.basePrice}
//                                   </p>
//                                 </div>
//                               ) : (
//                                 <p
//                                   className={`text-xl font-bold ${
//                                     isOutOfStock
//                                       ? "text-gray-400"
//                                       : "text-red-600"
//                                   }`}
//                                 >
//                                   {product.hasProteinChoices ||
//                                   product.hasTypeChoices
//                                     ? "According To Your Choices"
//                                     : `${product.basePrice} ${t("jod")}`}
//                                 </p>
//                               )}
//                             </div>

//                             <ProductDialog
//                               id={product._id}
//                               disabled={isOutOfStock}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
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

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ProductDialog } from "@/componenet/common/ProductDialog";
import product_placeholder from "../assets/product_placeholder.jpeg";
import { CATEGORIES } from "@/constants";
import { useUser } from "@/contexts/UserContext";
import Loading from "@/componenet/common/Loading";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import i18n from "@/i18n";
import { useCategoryContext } from "@/contexts/CategoryContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    "692564033f44bbfbbd507657"
  );
  const [isLoading, setIsLoading] = useState(false);
  const { categories, fetchCategories } = useCategoryContext();
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { user, logout } = useUser();

  const fetchProducts = () => {
    setIsLoading(true);
    fetch(
      `${import.meta.env.VITE_BASE_URL}/products?category=${selectedCategory}`,
      { headers: { authorization: `Bearer ${user.token}` } }
    )
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.message.includes("Invalid token")) logout();
        toast.error("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useMemo(() => {
    fetchProducts();
  }, [selectedCategory]);

  if (isLoading) return <Loading />;

  const handleInStock = async (v, product) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/admin/updatefood/${product._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ ...product, inStock: Boolean(v) }),
        }
      );

      const data = await res.json();
      toast.success(data.message);
      fetchProducts();
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 arabic-font pt-12" dir="rtl">
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 py-6 sm:py-8 lg:py-10">
        {/* Categories */}
        <div className="flex gap-1 xs:gap-1.5 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat, i) => {
            const isAll = cat === "All";
            const catValue = isAll ? "all" : cat;
            const catLabel = isAll ? t("all") : cat.name?.[selectedLanguage];
            return (
              <button
                key={i}
                onClick={() => setSelectedCategory(catValue._id)}
                className={`whitespace-nowrap px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-2 text-xs xs:text-sm sm:text-base rounded-lg transition flex-shrink-0 ${
                  selectedCategory === catValue._id
                    ? "bg-yellow-500 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                }`}
              >
                {catLabel}
              </button>
            );
          })}
        </div>

        {/* Products List */}
        {products.length > 0 ? (
          <div className="space-y-3 xs:space-y-4 sm:space-y-6">
            {products.map((product) => {
              const isOutOfStock = !product.inStock;
              return (
                <Card
                  key={product._id}
                  className={`overflow-hidden border-0 shadow-sm transition bg-white ${
                    isOutOfStock
                      ? "opacity-60 grayscale hover:shadow-sm"
                      : "hover:shadow-md"
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-row-reverse items-center gap-2 sm:gap-4 p-2 xs:p-3 sm:p-4 relative">
                      {isOutOfStock && (
                        <Badge
                          variant="destructive"
                          className="absolute top-1 xs:top-2 left-1 xs:left-2 z-10 text-xs xs:text-sm"
                        >
                          {t("out_of_stock") || "Out of Stock"}
                        </Badge>
                      )}

                      {/* Product Image */}
                      <div className="flex-shrink-0 w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 relative ml-2">
                        <img
                          src={product.image || product_placeholder}
                          alt={product.name[selectedLanguage]}
                          className={`w-full h-full object-cover rounded-lg ${
                            isOutOfStock ? "grayscale opacity-70" : ""
                          }`}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="min-w-0">
                          <h3
                            className={`text-sm xs:text-base sm:text-lg font-bold mb-0.5 xs:mb-1 line-clamp-1 ${
                              isOutOfStock ? "text-gray-500" : "text-gray-900"
                            }`}
                          >
                            {product.name[selectedLanguage]}
                          </h3>
                          <p
                            className={`text-xs xs:text-sm line-clamp-2 leading-6 ${isOutOfStock ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {product.description[selectedLanguage]}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1 xs:mt-2 gap-2">
                          {/* Price */}
                          <div className="min-w-0">
                            {product.discount > 0 &&
                            !product.hasProteinChoices &&
                            !product.hasTypeChoices ? (
                              <div className="flex items-center gap-1 xs:gap-2">
                                <p
                                  className={`text-base xs:text-lg sm:text-xl font-bold ${
                                    isOutOfStock
                                      ? "text-gray-400"
                                      : "text-orange-500"
                                  }`}
                                >
                                  JOD{" "}
                                  {product.discountedPrice
                                    ? product.discountedPrice.toFixed(2)
                                    : (
                                        product.basePrice -
                                        (product.basePrice * product.discount) /
                                          100
                                      ).toFixed(2)}
                                </p>
                                <p className="text-gray-400 line-through text-xs xs:text-sm">
                                  {product.basePrice}
                                </p>
                              </div>
                            ) : (
                              <p
                                className={`text-base xs:text-lg sm:text-xl font-bold line-clamp-1 ${
                                  isOutOfStock
                                    ? "text-gray-400"
                                    : "text-red-600"
                                }`}
                              >
                                {product.hasProteinChoices ||
                                product.hasTypeChoices
                                  ? "According To Your Choices"
                                  : `${product.basePrice} ${t("jod")}`}
                              </p>
                            )}
                          </div>

                          {/* Product Dialog Button */}
                          <div className="flex gap-5 flex-shrink-0">
                            <ProductDialog
                              id={product._id}
                              disabled={isOutOfStock}
                            />
                            {(user.role === "admin" ||
                              user.role === "employee") && (
                              <div className="flex flex-col">
                                <Label htmlFor="inStock" className="text-sm">
                                  {t("is_in_stock")}
                                </Label>
                                <Switch
                                  id="inStock"
                                  className={`${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
                                  checked={product.inStock}
                                  onCheckedChange={(v) =>
                                    handleInStock(v, product)
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 xs:py-16 sm:py-20">
            <div className="text-5xl xs:text-6xl sm:text-7xl mb-3 xs:mb-4">
              🔍
            </div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold mb-1 xs:mb-2">
              {t("no_results_title")}
            </h3>
            <p className="text-sm xs:text-base text-gray-600">
              {t("no_results_description")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
