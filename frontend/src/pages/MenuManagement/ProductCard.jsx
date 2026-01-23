/* ProductCard.jsx */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import product_placeholder from "../../assets/product_placeholder.jpeg";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";

export default function ProductCard({ product, setProducts, setFormData, setEditingId }) {
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
        `${import.meta.env.VITE_BASE_URL}/products/${product._id}`,
        {
          headers: {
            authorization: `Bearer ${user.token}`,
          },
        }
      );
      let data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      data = data.data;
      if (data.hasTypeChoices && data.hasProteinChoices) {
        data.prices = {
          chicken: {
            sandwich: data.prices.chicken?.sandwich || "",
            meal: data.prices.chicken?.meal || "",
          },
        };
      } else if (data.hasTypeChoices) {
        data.prices = {
          sandwich: data.prices?.sandwich?.toString() || "",
          meal: data.prices?.meal?.toString() || "",
        };
      } else if (data.hasProteinChoices) {
        data.prices = {
          chicken: data.prices?.chicken?.toString() || "",
          meat: data.prices?.meat?.toString() || "",
        };
      }
      setFormData({
        arName: data.name?.ar || "",
        enName: data.name?.en || "",
        basePrice: data.basePrice?.toString() || "",
        discount: data.discount?.toString() || "",
        arDescription: data.description?.ar || "",
        enDescription: data.description?.en || "",
        image: data.image || "",
        category:
          typeof data.category === "object" && data.category?._id
            ? data.category._id
            : data.category || "",
        isSpicy: Boolean(data.isSpicy),
        hasTypeChoices: !!data.hasTypeChoices,
        hasProteinChoices: !!data.hasProteinChoices,
        additions: data.additions || [],
        additionsSelectionType: data.additionsSelectionType,
        prices: data.prices || {},
        inStock: Boolean(data.inStock),
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
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      {/* Image Container with Aspect Ratio */}
      <div className="relative w-full aspect-[4/3] bg-muted">
        <img
          src={product.image || product_placeholder}
          alt={product.name?.[selectedLanguage]}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm shadow-sm">
            {product.category?.name?.[selectedLanguage] || product.category?.name?.ar}
          </Badge>
          {product.discount > 0 && <Badge variant="destructive">-{product.discount}%</Badge>}
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-base line-clamp-1">{product.name?.[selectedLanguage]}</h3>
          <span className="font-semibold text-primary text-sm whitespace-nowrap">{getDisplayPrice()}</span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {product.description?.[selectedLanguage]}
        </p>

        <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
          <Button onClick={handleEdit} variant="outline" size="sm" className="flex-1 h-8">
            <Edit2 className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" /> {t("edit")}
          </Button>
          <Button
            onClick={() => handleDelete(product._id)}
            size="sm"
            className="flex-1 h-8 text-white hover:opacity-90"
            style={{ backgroundColor: "var(--color-button2)" }}
          >
            <Trash2 className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" /> {t("delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}