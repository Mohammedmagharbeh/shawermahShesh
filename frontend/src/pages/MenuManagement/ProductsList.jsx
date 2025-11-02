import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Package, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Loading from "@/componenet/common/Loading";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { CATEGORIES } from "@/constants";

export default function ProductsList({ setFormData, setEditingId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Burgers");
  const { t } = useTranslation();
  const { products, setProducts, loading, error } = useProducts(
    t,
    selectedCategory
  );
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  const term = searchTerm.toLowerCase();
  const filteredProducts = products.filter((p) => {
    const name = p.name?.[selectedLanguage]?.toLowerCase() || "";
    const category =
      typeof p.category === "string"
        ? p.category.toLowerCase()
        : p.category?.[selectedLanguage]?.toLowerCase() || "";

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
            {CATEGORIES.map((cat, i) => (
              <Button
                key={i}
                variant={selectedCategory === cat.en ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.en)}
                size="sm"
                className="whitespace-nowrap flex-shrink-0"
              >
                {cat[selectedLanguage] || cat.en}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
