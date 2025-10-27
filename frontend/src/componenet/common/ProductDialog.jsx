import { useEffect, useState } from "react";
import {
  Dialog as DialogUi,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Loading from "@/componenet/common/Loading";
import toast from "react-hot-toast";
import product_placeholder from "../../assets/product_placeholder.jpeg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

export function ProductDialog({ id, triggerLabel }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const buttonLabel = triggerLabel || t("View product");

  const [product, setProduct] = useState({
    _id: "",
    name: "",
    price: 0,
    discount: 0,
    image: "",
    category: "",
    description: "",
  });
  const [additions, setAdditions] = useState([]);
  const [selectedAdditions, setSelectedAdditions] = useState([]);
  const [spicy, setSpicy] = useState(null);
  const [notes, setNotes] = useState("");
  const { addToCart } = useCart();
  const selectedLanguage = localStorage.getItem("i18nextLng");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/products/${id}`
        );
        if (!response.ok) throw new Error(t("fetch_product_failed"));
        const data = await response.json();
        setProduct(data.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductDetails();
  }, [id, open]);

  useEffect(() => {
    if (!product?.category) return;
    if (!open) return;

    const fetchAdditions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/additions/category/${product.category}`
        );
        if (!response.ok) throw new Error(t("fetch_additions_failed"));
        const data = await response.json();
        setAdditions(data.additions);
      } catch (error) {
        console.error("Error fetching additions:", error);
        setAdditions([]);
      }
    };

    fetchAdditions();
  }, [product?.category, open]);

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => Math.max(1, prev + increment));
  };

  const getFinalPrice = () => {
    if (product.discount && product.discount > 0) {
      return product.price - (product.price * product.discount) / 100;
    }
    return product.price;
  };

  const handleAddToCart = () => {
    const selectedFullAdditions = additions.filter((a) =>
      selectedAdditions.includes(a._id)
    );

    addToCart(product._id, quantity, spicy, selectedFullAdditions, notes);
    toast.success(
      `${t("added_successfully")} ${quantity} ${t("of")} ${product.name[selectedLanguage]}`
    );
    setOpen(false);
  };

  return (
    <DialogUi open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{buttonLabel}</Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product.name[selectedLanguage] || t("product_details")}
          </DialogTitle>
          <DialogDescription>{product.category}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-4">
            {/* صورة المنتج */}
            <div className="relative">
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={product.image || product_placeholder}
                  alt={product.name[selectedLanguage]}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {product.category && (
                <Badge className="absolute top-4 left-4 bg-orange-500 hover:bg-orange-600 text-white">
                  {product.category}
                </Badge>
              )}
            </div>

            {/* تفاصيل المنتج */}
            <div className="flex flex-col space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {product.name[selectedLanguage]}
                </h1>

                {product.discount > 0 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-4xl font-bold">
                      JOD {getFinalPrice().toFixed(2)}
                    </p>
                    <p className="text-xl text-gray-400 line-through">
                      JOD {product.price.toFixed(2)}
                    </p>
                    <Badge className="bg-green-500 text-white">
                      {t("discount")} {product.discount}%
                    </Badge>
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-red-600 mb-4">
                    JOD {product.price.toFixed(2)}
                  </p>
                )}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description[selectedLanguage]}
              </p>

              <div className="space-y-4 mt-6">
                {/* درجة الحارة */}
                {product.isSpicy && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <span className="text-lg font-medium text-gray-900 mb-2">
                      {t("choose_spicy_level")}
                    </span>
                    <Label className="inline-flex gap-2 items-center">
                      <Input
                        type="radio"
                        name="spicy"
                        value="yes"
                        onChange={() => setSpicy(true)}
                      />
                      <span>{t("spicy")}</span>
                    </Label>
                    <Label className="inline-flex gap-2 items-center ml-6">
                      <Input
                        type="radio"
                        name="spicy"
                        value="no"
                        defaultChecked
                        onChange={() => setSpicy(false)}
                      />
                      <span>{t("not_spicy")}</span>
                    </Label>
                  </div>
                )}

                {/* الإضافات */}
                <div>
                  {additions?.map((addition) => (
                    <div key={addition._id} className="flex items-center gap-2">
                      <Input
                        type="checkbox"
                        id={addition._id}
                        value={addition._id}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAdditions((prev) => [
                              ...prev,
                              addition._id,
                            ]);
                          } else {
                            setSelectedAdditions((prev) =>
                              prev.filter((id) => id !== addition._id)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={addition._id} className="text-gray-700">
                        {addition.name[selectedLanguage]} (JOD{" "}
                        {addition.price.toFixed(2)})
                      </Label>
                    </div>
                  ))}
                </div>

                {/* ملاحظات */}
                <Label htmlFor="notes">{t("notes")}</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  onChange={(e) => setNotes(e.target.value)}
                />

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 hover:bg-orange-50 hover:text-orange-500"
                      onClick={() => handleQuantityChange(-1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-16 text-center font-semibold text-lg">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 hover:bg-orange-50 hover:text-orange-500"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-red-600  text-white h-12 text-lg font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {t("add_to_cart")} JOD{" "}
                    {(getFinalPrice() * quantity).toFixed(2)}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </DialogUi>
  );
}
