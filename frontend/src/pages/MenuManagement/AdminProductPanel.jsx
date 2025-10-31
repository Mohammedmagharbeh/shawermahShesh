import { useState } from "react";
import ProductManagement from "./ProductManagement";
import AdditionsManagement from "./AdditionsManagement";
import ProductsList from "./ProductsList";
import Header from "./Header";
import { INITIAL_FORM_DATA } from "@/constants";

export default function AdminProductPanel() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState(null);

  const handlers = { setProducts, setFormData, setEditingId };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <ProductManagement
            formData={formData}
            editingId={editingId}
            {...handlers}
          />

          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <AdditionsManagement />
            <ProductsList products={products} {...handlers} />
          </div>
        </div>
      </div>
    </div>
  );
}
