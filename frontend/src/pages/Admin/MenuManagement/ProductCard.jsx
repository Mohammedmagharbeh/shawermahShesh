import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import product_placeholder from "@/assets/product_placeholder.jpeg";
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
      // 1. Fetch the latest data to ensure we have the full object
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/products/${product._id}`,
        {
          headers: {
            authorization: `Bearer ${user.token}`,
          },
        },
      );

      let responseJson = await res.json();

      if (!res.ok) {
        toast.error(responseJson.message);
        return;
      }

      const data = responseJson.data;

      // 2. Prepare the Prices Object based on the 4 Cases
      let formattedPrices = {};

      // CASE A: Both Protein (Chicken/Meat) AND Type (Sandwich/Meal)
      if (data.hasTypeChoices && data.hasProteinChoices) {
        // Flatten nested objects to match ProductManagement inputs: prices['chicken_sandwich']
        formattedPrices = {
          chicken_sandwich: data.prices?.chicken?.sandwich || "",
          chicken_meal: data.prices?.chicken?.meal || "",
          meat_sandwich: data.prices?.meat?.sandwich || "",
          meat_meal: data.prices?.meat?.meal || "",
        };
      }
      // CASE B: Type Only (Sandwich/Meal)
      else if (data.hasTypeChoices) {
        formattedPrices = {
          sandwich: data.prices?.sandwich || "",
          meal: data.prices?.meal || "",
        };
      }
      // CASE C: Protein Only (Chicken/Meat)
      else if (data.hasProteinChoices) {
        formattedPrices = {
          chicken: data.prices?.chicken || "",
          meat: data.prices?.meat || "",
        };
      }
      // CASE D: Base Price only
      // No specific prices object needed, handled by basePrice field

      // 3. Map to Form Data Structure
      setFormData({
        arName: data.name?.ar || "",
        enName: data.name?.en || "",
        basePrice: data.basePrice?.toString() || "",
        discount: data.discount?.toString() || "",
        arDescription: data.description?.ar || "",
        enDescription: data.description?.en || "",
        image: data.image || "",

        // Handle Category (It might come as an object or an ID string)
        category:
          typeof data.category === "object" && data.category?._id
            ? data.category._id
            : data.category || "",

        // Booleans
        isSpicy: Boolean(data.isSpicy),
        hasTypeChoices: Boolean(data.hasTypeChoices),
        hasProteinChoices: Boolean(data.hasProteinChoices),
        inStock: Boolean(data.inStock),

        // Arrays & Complex Objects
        additions: data.additions || [],
        additionsSelectionType: data.additionsSelectionType || "radio", // Default to radio if missing

        // The formatted prices object we built above
        prices: formattedPrices,
      });

      // 4. Set Editing Mode
      setEditingId(data._id);

      // Optional: Scroll to top to show the form on mobile
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load product details");
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
                  },
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
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] bg-muted">
        <img
          src={product.image || product_placeholder}
          alt={product.name?.[selectedLanguage]}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <Badge
            variant="secondary"
            className="bg-white/90 text-black backdrop-blur-sm shadow-sm"
          >
            {product.category?.name?.[selectedLanguage] ||
              product.category?.name?.ar}
          </Badge>
          {product.discount > 0 && (
            <Badge variant="destructive">-{product.discount}%</Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-base line-clamp-1">
            {product.name?.[selectedLanguage]}
          </h3>
          <span className="font-semibold text-primary text-sm whitespace-nowrap">
            {getDisplayPrice()}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {product.description?.[selectedLanguage]}
        </p>

        <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            className="flex-1 h-8"
          >
            <Edit2 className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" /> {t("edit")}
          </Button>
          <Button
            onClick={() => handleDelete(product._id)}
            size="sm"
            className="flex-1 h-8 text-white hover:opacity-90"
            style={{ backgroundColor: "var(--color-button2)" }}
          >
            <Trash2 className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" />{" "}
            {t("delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
