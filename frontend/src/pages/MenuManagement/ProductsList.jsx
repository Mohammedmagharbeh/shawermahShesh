import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Package, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Loading from "@/componenet/common/Loading";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCategoryContext } from "@/contexts/CategoryContext";

export default function ProductsList({ setFormData, setEditingId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { categories, fetchCategories } = useCategoryContext();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { products, setProducts, loading, error } = useProducts(
    t,
    selectedCategory
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Set selectedCategory after categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories, selectedCategory]);

  const term = searchTerm.toLowerCase();
  const filteredProducts = products.filter((p) => {
    const name = p.name?.[selectedLanguage]?.toLowerCase() || "";
    const category =
      typeof p.category === "string"
        ? p.category?.toLowerCase()
        : p.category?.name?.[selectedLanguage]?.toLowerCase() || "";

    const matchesSearch = name.includes(term) || category.includes(term);
    return matchesSearch;
  });

  if (loading) return <Loading />;
  if (error)
    return (
      <Card className="p-6 text-center text-red-500 font-medium">
        {t("fetch_products_error")}
      </Card>
    );

  return (
    <div className="w-full space-y-3 sm:space-y-4 md:space-y-6">
      <Card className="w-full">
        <CardContent className="p-3 sm:p-4 md:p-6">
          {/* 🔍 Search Input */}
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
            <Input
              placeholder={t("search_product")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9 sm:pr-10 w-full text-sm sm:text-base h-9 sm:h-10"
            />
          </div>

          {/* 🏷 Category Buttons */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1 snap-x snap-mandatory">
            {categories.map((cat, i) => (
              <Button
                key={i}
                variant={selectedCategory === cat._id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat._id)}
                size="sm"
                className="whitespace-nowrap flex-shrink-0 snap-start text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
              >
                {cat.name?.[selectedLanguage] || cat.name.ar}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 🧩 Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="border-dashed border-2 w-full">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-4">
            <Package className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-muted-foreground/50 mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg text-muted-foreground text-center">
              {t("no_products")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              setProducts={setProducts}
              setFormData={setFormData}
              setEditingId={setEditingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Package, Search } from "lucide-react";
// import { useTranslation } from "react-i18next";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import Loading from "@/componenet/common/Loading";
// import ProductCard from "./ProductCard";
// import { useProducts } from "@/hooks/useProducts";
// import { useUser } from "@/contexts/UserContext";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// export default function ProductsList({ setFormData, setEditingId }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [categories, setCategories] = useState([]);
//   const { t } = useTranslation();
//   const { products, setProducts, loading, error } = useProducts(
//     t,
//     selectedCategory
//   );
//   const { user } = useUser(); // إذا محتاج توكن للتوثيق
//   const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

//   // --- جلب الفئات من الباك اند ---
//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/admin/categories`, {
//         headers: {
//           authorization: `Bearer ${user.token}`, // إذا السيرفر يحتاج توكن
//         },
//       });
//       setCategories(res.data);
//       if (res.data.length > 0 && !selectedCategory) {
//         setSelectedCategory(res.data[0].name.en); // اختر أول فئة افتراضياً
//       }
//     } catch (err) {
//       console.error("Error fetching categories:", err);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const term = searchTerm.toLowerCase();
//   const filteredProducts = products.filter((p) => {
//     const name = p.name?.[selectedLanguage]?.toLowerCase() || "";
//     const category =
//       typeof p.category === "string"
//         ? p.category.toLowerCase()
//         : p.category?.[selectedLanguage]?.toLowerCase() || "";

//     const matchesSearch = name.includes(term) || category.includes(term);
//     return matchesSearch;
//   });

//   if (loading) return <Loading />;
//   if (error)
//     return (
//       <Card className="p-6 text-center text-red-500 font-medium">
//         {t("fetch_products_error")}
//       </Card>
//     );

//   return (
//     <div className="lg:col-span-2 space-y-4 sm:space-y-6">
//       <Card>
//         <CardContent className="p-4 sm:p-6">
//           {/* 🔍 Search Input */}
//           <div className="relative mb-4">
//             <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
//             <Input
//               placeholder={t("search_product")}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pr-10"
//             />
//           </div>

//           {/* 🏷 Category Buttons */}
//           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
//             {categories.map((cat) => (
//               <Button
//                 key={cat._id}
//                 variant={selectedCategory === cat.name.en ? "default" : "outline"}
//                 onClick={() => setSelectedCategory(cat.name.en)}
//                 size="sm"
//                 className="whitespace-nowrap flex-shrink-0"
//               >
//                 {cat.name[selectedLanguage] || cat.name.en}
//               </Button>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* 🧩 Products Grid */}
//       {filteredProducts.length === 0 ? (
//         <Card className="border-dashed border-2">
//           <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
//             <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
//             <p className="text-lg text-muted-foreground">{t("no_products")}</p>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//           {filteredProducts.map((product) => (
//             <ProductCard
//               key={product._id}
//               product={product}
//               setProducts={setProducts}
//               setFormData={setFormData}
//               setEditingId={setEditingId}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
