import React from "react";
import { Badge } from "@/components/ui/badge";
import product_placeholder from "../../assets/product_placeholder.jpeg";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

function ProductCard({
  product,
  products,
  setProducts,
  setFormData,
  setEditingId,
}) {
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { t } = useTranslation();

  const handleEdit = (product) => {
    setFormData({
      arName: product.name.ar || "",
      enName: product.name.en || "",
      basePrice:
        product.basePrice?.toString() || product.price?.toString() || "",
      discount: product.discount?.toString() || "",
      arDescription: product.description.ar || "",
      enDescription: product.description.en || "",
      image: product.image || "",
      category: product.category || "",
      isSpicy: !!product.isSpicy,

      hasTypeChoices: !!product.hasTypeChoices,
      hasProteinChoices: !!product.hasProteinChoices,

      prices: {
        // fallback to empty strings
        sandwich: product.prices?.sandwich?.toString() || "",
        meal: product.prices?.meal?.toString() || "",
        chicken: product.prices?.chicken?.toString() || "",
        meat: product.prices?.meat?.toString() || "",
        chicken_sandwich: product.prices?.chicken?.sandwich?.toString() || "",
        chicken_meal: product.prices?.chicken?.meal?.toString() || "",
        meat_sandwich: product.prices?.meat?.sandwich?.toString() || "",
        meat_meal: product.prices?.meat?.meal?.toString() || "",
      },
    });

    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    console.log(id);

    toast((toastInstance) => (
      <div className="flex flex-col gap-2">
        <span>{t("confirm_delete")}</span>
        <div className="flex justify-end gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss(toastInstance.id)}
          >
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              try {
                await axios.delete(
                  `${import.meta.env.VITE_BASE_URL}/admin/deletefood/${id}`
                );
                setProducts(products.filter((p) => p._id !== id));
                toast.success(t("product_deleted"));
                toast.dismiss(toastInstance.id);
              } catch (error) {
                console.error(
                  "خطأ في الحذف:",
                  error.response?.data || error.message
                );
                toast.error(t("delete_error"));
              }
            }}
          >
            {t("delete")}
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <Card key={product._id} className="overflow-hidden">
      <div className="relative h-40 sm:h-48 bg-muted">
        <img
          src={product.image || product_placeholder}
          alt={product.name?.[selectedLanguage]}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <Badge className="text-xs">
            {product.category?.[selectedLanguage] || product.category}
          </Badge>
        </div>
      </div>
      <CardContent className="p-3 sm:p-5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-sm sm:text-base line-clamp-1">
            {product.name?.[selectedLanguage]}
          </h3>
          <span className="font-semibold text-primary text-sm sm:text-base whitespace-nowrap">
            {product.hasProteinChoices || product.hasTypeChoices
              ? "According To Your Choices"
              : `${product.basePrice} ${t("jod")}`}
          </span>
        </div>
        {product.discount > 0 && (
          <p className="text-xs sm:text-sm text-red-500 mt-1">
            {t("discount")}: {product.discount}%
          </p>
        )}
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
          {product.description?.[selectedLanguage]}
        </p>
        {/* Action Buttons - تم إضافتها هنا */}
        <div className="flex gap-2 mt-3 sm:mt-4">
          <Button
            onClick={() => handleEdit(product)}
            variant="outline"
            size="sm"
            className="flex-1 text-xs sm:text-sm"
          >
            <Edit2 className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            {t("edit")}
          </Button>
          <Button
            onClick={() => handleDelete(product._id)}
            variant="destructive"
            size="sm"
            className="flex-1 text-xs sm:text-sm"
          >
            <Trash2 className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            {t("delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
