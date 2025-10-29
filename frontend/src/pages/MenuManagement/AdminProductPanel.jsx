import { useTranslation } from "react-i18next";
import { useProducts } from "@/hooks/useProducts";
import { useAdditions } from "@/hooks/useAdditions";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import AdditionForm from "./AdditionForm";
import AdditionList from "./AdditionList";

export default function AdminProductPanel() {
  const { t } = useTranslation();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const { products, loading, addProduct, updateProduct, deleteProduct } =
    useProducts(baseUrl, t);

  const { additions, addAddition, updateAddition, deleteAddition } =
    useAdditions(baseUrl, t);

  return (
    <div className="container py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <ProductForm t={t} onSubmit={(data) => addProduct(data)} />
        <hr className="my-6" />
        <AdditionForm t={t} onSubmit={addAddition} />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <ProductList
          t={t}
          products={products}
          loading={loading}
          onDelete={deleteProduct}
          onEdit={updateProduct}
        />
        <AdditionList
          t={t}
          additions={additions}
          onDelete={deleteAddition}
          onEdit={updateAddition}
        />
      </div>
    </div>
  );
}
