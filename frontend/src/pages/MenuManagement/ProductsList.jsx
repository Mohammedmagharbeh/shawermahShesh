/* ProductsList.jsx */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Package, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Loading from "@/componenet/common/Loading"; // Ensure path is correct
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCategoryContext } from "@/contexts/CategoryContext";

export default function ProductsList({ setFormData, setEditingId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { categories, fetchCategories } = useCategoryContext();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { products, setProducts, loading, error } = useProducts(t, selectedCategory);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) setSelectedCategory(categories[0]._id);
  }, [categories, selectedCategory]);

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const name = p.name?.[selectedLanguage]?.toLowerCase() || "";
    const category = typeof p.category === "string" ? p.category?.toLowerCase() : p.category?.name?.[selectedLanguage]?.toLowerCase() || "";
    return name.includes(term) || category.includes(term);
  });

  if (loading) return <Loading />;
  if (error) return <Card className="p-6 text-center text-red-500 font-medium">{t("fetch_products_error")}</Card>;

  return (
    <div className="w-full space-y-4">
      {/* Search & Filter Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t("search_product")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ltr:pl-9 rtl:pr-9 w-full bg-background"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rounded">
            {categories.map((cat) => (
              <Button
                key={cat._id}
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

      {/* Responsive Grid: 1 col (mobile), 2 col (30rem+), 3 col (Desktop) */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg bg-[var(--color-secondary)]">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{t("no_products")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[30rem]:grid-cols-2 lg:grid-cols-3 gap-4">
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