import { useState } from "react";
import ProductManagement from "./ProductManagement";
import ProductsList from "./ProductsList";
import Header from "./Header";
import { INITIAL_FORM_DATA } from "@/constants";
import CategoryManagement from "./CategoryManagement";

export default function AdminProductPanel() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState(null);

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
            <ProductsList products={products} {...handlers} />
          </div>

        </div>
      </div>
    </div>
  );
}