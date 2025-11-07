import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import product_placeholder from "../../assets/product_placeholder.jpeg";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";

export default function ProductCard({
  product,
  setProducts,
  setFormData,
  setEditingId,
}) {
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { user } = useUser();

  const getDisplayPrice = () => {
    if (product.hasProteinChoices || product.hasTypeChoices)
      return t("according_to_choices");
    return `${product.basePrice} ${t("jod")}`;
  };

  const handleEdit = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/products/${product._id}`
      );
      let data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      data = data.data;
      setFormData({
        arName: data.name?.ar || "",
        enName: data.name?.en || "",
        basePrice: data.basePrice?.toString() || "",
        discount: data.discount?.toString() || "",
        arDescription: data.description?.ar || "",
        enDescription: data.description?.en || "",
        image: data.image || "",
        category: data.category || "",
        isSpicy: Boolean(data.isSpicy),
        hasTypeChoices: !!data.hasTypeChoices,
        hasProteinChoices: !!data.hasProteinChoices,
        additions: data.additions || [],
        prices: {
          sandwich: data.prices?.sandwich?.toString() || "",
          meal: data.prices?.meal?.toString() || "",
          chicken: data.prices?.chicken?.toString() || "",
          meat: data.prices?.meat?.toString() || "",
        },
      });
      setEditingId(data._id);
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    }
  };

  const handleDelete = (id) => {
    toast((tInstance) => (
      <div className="flex flex-col gap-2">
        <span>{t("confirm_delete")}</span>
        <div className="flex justify-end gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss(tInstance.id)}
          >
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              try {
                await axios.delete(
                  `${import.meta.env.VITE_BASE_URL}/admin/deletefood/${id}`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      authorization: `Bearer ${user.token}`,
                    },
                  }
                );

                setProducts((prev) => prev.filter((p) => p._id !== id));
                toast.success(t("product_deleted"));
              } catch (err) {
                console.error(err);
                toast.error(t("delete_error"));
              } finally {
                toast.dismiss(tInstance.id);
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
    <Card className="overflow-hidden">
      <div className="relative h-40 sm:h-48 bg-muted">
        <img
          src={product.image || product_placeholder}
          alt={product.name?.[selectedLanguage]}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge>
            {product.category?.[selectedLanguage] || product.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
            {product.name?.[selectedLanguage]}
          </h3>
          <span className="font-semibold text-primary text-sm sm:text-base whitespace-nowrap">
            {getDisplayPrice()}
          </span>
        </div>

        {product.discount > 0 && (
          <p className="text-xs text-red-500 mt-1">
            {t("discount")}: {product.discount}%
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {product.description?.[selectedLanguage]}
        </p>

        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Edit2 className="mr-1 h-4 w-4" /> {t("edit")}
          </Button>
          <Button
            onClick={() => handleDelete(product._id)}
            variant="destructive"
            size="sm"
            className="flex-1"
          >
            <Trash2 className="mr-1 h-4 w-4" /> {t("delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
