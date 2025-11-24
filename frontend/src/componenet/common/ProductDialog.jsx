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
import { useUser } from "@/contexts/UserContext";
import shesho from "@/assets/shesho.jpg";
import shishi from "@/assets/shishi.jpg";

export function ProductDialog({ id, triggerLabel, disabled = false }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const buttonLabel = triggerLabel || t("View product");
  const [product, setProduct] = useState({});
  const [selectedAdditions, setSelectedAdditions] = useState([]);
  const [spicy, setSpicy] = useState(null);
  const [notes, setNotes] = useState("");
  const { addToCart } = useCart();
  const selectedLanguage = localStorage.getItem("i18nextLng");
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedProtein, setSelectedProtein] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    if (!open) return;

    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/products/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${user.token}`,
            },
          }
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

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => Math.max(1, prev + increment));
  };

  const getProductPrice = (product) => {
    if (!product) return 0;
    let basePrice = Number(product?.basePrice || 0);

    if (product.hasProteinChoices && product.hasTypeChoices) {
      basePrice = Number(
        product.prices[selectedProtein]?.[selectedType] ?? basePrice
      );
    } else if (product.hasProteinChoices) {
      basePrice = Number(product.prices[selectedProtein] ?? basePrice);
    } else if (product.hasTypeChoices) {
      basePrice = Number(product.prices?.[selectedType] ?? basePrice);
    }

    return basePrice;
  };

  const getFinalPrice = () => {
    const price = getProductPrice(product);
    if (product.discount && product.discount > 0) {
      return price - (price * product.discount) / 100;
    }
    return price;
  };

  const getTotalPrice = () => {
    const basePrice = getFinalPrice();
    const additionsPrice = selectedAdditions.reduce((sum, additionId) => {
      const addition = product.additions?.find((a) => a._id === additionId);
      return sum + (addition ? Number(addition.price) : 0);
    }, 0);

    return (basePrice + additionsPrice) * quantity;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();

    const selectedFullAdditions = product.additions?.filter((a) =>
      selectedAdditions.includes(a._id)
    );

    addToCart(
      product._id,
      quantity,
      product.isSpicy ? spicy : false,
      selectedFullAdditions,
      notes,
      { selectedProtein, selectedType }
    );

    // Reset selections
    setSelectedAdditions([]);
    setSpicy(null);
    setSelectedProtein(null);
    setSelectedType(null);
    setNotes("");
    setQuantity(1);

    toast.success(
      `${t("added_successfully")} ${quantity} ${t("of")} ${product.name[selectedLanguage]}`
    );
    setOpen(false);
  };

  return (
    <DialogUi open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          {buttonLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product.name?.[selectedLanguage] || t("product_details")}
          </DialogTitle>
          <DialogDescription>{product.category}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <Loading />
        ) : (
          <form
            onSubmit={handleAddToCart}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 py-4"
          >
            {/* Image */}
            <div className="relative">
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={product.image || product_placeholder}
                  alt={product.name?.[selectedLanguage]}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {product.category && (
                <Badge className="absolute top-4 left-4 bg-orange-500 hover:bg-orange-600 text-white">
                  {product.category}
                </Badge>
              )}
            </div>

            {/* Product details */}
            <div className="flex flex-col space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {product.name?.[selectedLanguage]}
                </h1>

                {product.discount > 0 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                    <p className="text-3xl sm:text-4xl font-bold text-red-600">
                      JOD {getFinalPrice().toFixed(2)}
                    </p>
                    <p className="text-lg sm:text-xl text-gray-400 line-through">
                      JOD {getProductPrice(product).toFixed(2)}
                    </p>
                    <Badge className="bg-green-500 text-white">
                      {t("discount")} {product.discount}%
                    </Badge>
                  </div>
                ) : (
                  <p className="text-3xl sm:text-4xl font-bold text-red-600 mb-4">
                    JOD {getProductPrice(product).toFixed(2)}
                  </p>
                )}
              </div>

              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                {product.description?.[selectedLanguage]}
              </p>

              {/* Protein choice */}
              {product.hasProteinChoices && (
                <div className="mt-4">
                  <span className="text-lg font-medium text-gray-900 mb-2 block">
                    {t("choose_protein")}
                  </span>
                  {["chicken", "meat"].map((option) => (
                    <Label
                      key={option}
                      className="inline-flex gap-2 items-center mr-6"
                    >
                      <Input
                        type="radio"
                        name="protein"
                        value={option}
                        checked={selectedProtein === option}
                        onChange={() => setSelectedProtein(option)}
                        required
                      />
                      <span>{t(option)}</span>
                    </Label>
                  ))}
                </div>
              )}

              {/* Type choice */}
              {product.hasTypeChoices && (
                <div className="mt-4">
                  <span className="text-lg font-medium text-gray-900 mb-2 block">
                    {t("choose_type")}
                  </span>
                  {["sandwich", "meal"].map((option) => (
                    <Label
                      key={option}
                      className="inline-flex gap-2 items-center mr-6"
                    >
                      <Input
                        type="radio"
                        name="type"
                        value={option}
                        checked={selectedType === option}
                        onChange={() => setSelectedType(option)}
                        required
                      />
                      <span>{t(option)}</span>
                    </Label>
                  ))}
                </div>
              )}

              {/* Spicy level */}
              {product.isSpicy && (
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
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

              {/* Additions */}
              {product.additions?.map((addition) => {
                const isChecked = selectedAdditions.includes(addition._id);
                const isCheckbox =
                  product.additionsSelectionType === "checkbox";
                const additionName = addition.name?.[selectedLanguage] || "";
                const additionPrice = Number(addition.price);

                return (
                  <div
                    key={addition._id}
                    className="flex items-center gap-2 mt-2"
                  >
                    {isCheckbox ? (
                      <Input
                        type="checkbox"
                        id={addition._id}
                        value={addition._id}
                        checked={isChecked}
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
                    ) : (
                      <Input
                        type="radio"
                        id={addition._id}
                        value={addition._id}
                        checked={isChecked}
                        onChange={() => setSelectedAdditions([addition._id])}
                      />
                    )}

                    {/* صورة مختلفة حسب الإضافة */}
                    {["شيشو ولد", "Sheeshoo Boy"].includes(
                      addition.name?.[selectedLanguage]?.trim()
                    ) && (
                      <img
                        src="/images/boy.png" // ضع هنا مسار صورة الولد
                        alt="Sheeshoo Boy"
                        className="w-5 h-5 object-contain"
                      />
                    )}
                    {["شيشي بنت", "Sheeshi Girl"].includes(
                      addition.name?.[selectedLanguage]?.trim()
                    ) && (
                      <img
                        src="/images/girl.png" // ضع هنا مسار صورة البنت
                        alt="Sheeshi Girl"
                        className="w-5 h-5 object-contain"
                      />
                    )}
                    <Label
                      htmlFor={addition._id}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      {additionName}
                      {additionPrice > 0 && (
                        <span>(JOD {additionPrice.toFixed(2)})</span>
                      )}

                      {(product.category === "Kids" &&
                        additionName.toLowerCase().includes("boy")) ||
                      additionName.includes("ولد") ? (
                        <img
                          src={shesho}
                          width={100}
                          height={50}
                          className="rounded-xl max-h-16 object-contain"
                          alt="Kids addition"
                        />
                      ) : (
                        <img
                          src={shishi}
                          width={100}
                          className="rounded-xl max-h-16 object-contain"
                          alt="Kids addition"
                        />
                      )}
                    </Label>
                  </div>
                );
              })}

              {/* Notes */}
              <Label htmlFor="notes" className="mt-2">
                {t("notes")}
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <Button
                    type="button"
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
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-12 w-12 hover:bg-orange-50 hover:text-orange-500"
                    onClick={() => handleQuantityChange(1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="flex-1 bg-red-600 text-white h-12 text-lg font-semibold"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t("add_to_cart")} JOD {getTotalPrice().toFixed(2)}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </DialogUi>
  );
}
