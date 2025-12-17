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
  const [selectedCategory, setSelectedCategory] = useState(
    "6925a83f23f3a8dcdb91b714"
  );
  const { t } = useTranslation();
  const { products, setProducts, loading, error } = useProducts(
    t,
    selectedCategory
  );
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { categories, fetchCategories } = useCategoryContext();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* 🔍 Search Input */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder={t("search_product")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* 🏷 Category Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat, i) => (
              <Button
                key={i}
                variant={selectedCategory === cat._id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat._id)}
                size="sm"
                className="whitespace-nowrap flex-shrink-0"
              >
                {cat.name?.[selectedLanguage] || cat.name.ar}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 🧩 Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">{t("no_products")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
