import { useState, useEffect } from "react";
import ProductManagement from "./ProductManagement";
import ProductsList from "./ProductsList";
import Header from "./Header";
import { INITIAL_FORM_DATA } from "@/constants";
import CategoryManagement from "./CategoryManagement";
import { useProducts } from "@/hooks/useProducts";
import { useCategoryContext } from "@/contexts/CategoryContext";
import { useTranslation } from "react-i18next";

export default function AdminProductPanel() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState(null);
  const { categories, fetchCategories } = useCategoryContext();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories, selectedCategory]);

  // Use the hook with the selected category
  const { products, setProducts, loading, error, fetchProducts } = useProducts(
    t,
    selectedCategory,
  );

  const handlers = { setProducts, setFormData, setEditingId };

  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      <Header />

      {/* Main Container */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Left Column: Product Form (Sticky on Desktop) */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 z-0">
            <ProductManagement
              formData={formData}
              editingId={editingId}
              {...handlers}
            />
          </div>

          {/* Right Column: Categories & List */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <CategoryManagement />
            <ProductsList
              products={products}
              loading={loading}
              error={error}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              {...handlers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
