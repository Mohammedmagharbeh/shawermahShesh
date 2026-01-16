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
import shesho from "@/assets/shesho.png";
import shishi from "@/assets/shishsi.png";

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

      <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl md:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader className="px-0 sm:px-4">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold break-words">
            {product.name?.[selectedLanguage] || t("product_details")}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base break-words">
            {product.category?.name?.[selectedLanguage] || "category"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <Loading />
        ) : (
          <form
            onSubmit={handleAddToCart}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 py-2 sm:py-4 min-w-0"
          >
            {/* Image */}
            <div className="relative w-full min-w-0">
              <div className="aspect-square bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg">
                <img
                  src={product.image || product_placeholder}
                  alt={product.name?.[selectedLanguage]}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {product.category?.name && (
                <Badge className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 max-w-[calc(100%-1rem)] truncate">
                  {product.category.name?.[selectedLanguage]}
                </Badge>
              )}
            </div>

            {/* Product details */}
            <div className="flex flex-col space-y-3 sm:space-y-4 md:space-y-5 min-w-0">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 break-words">
                  {product.name?.[selectedLanguage]}
                </h1>

                {product.discount > 0 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 break-words">
                      {product.hasProteinChoices
                        ? t("according_to_your_choice")
                        : `JOD ${getFinalPrice().toFixed(2)}}`}
                    </p>
                    <p className="text-base sm:text-lg md:text-xl text-gray-400 line-through break-words">
                      {product.hasProteinChoices
                        ? t("according_to_your_choice")
                        : `JOD {getProductPrice(product).toFixed(2)`}
                    </p>
                    <Badge className="bg-green-500 text-white text-xs sm:text-sm w-fit flex-shrink-0">
                      {t("discount")} {product.discount}%
                    </Badge>
                  </div>
                ) : (
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 mb-3 sm:mb-4 break-words">
                    {product.hasProteinChoices && !selectedProtein
                      ? t("according_to_your_choices")
                      : `JOD ${getProductPrice(product).toFixed(2)}`}
                  </p>
                )}
              </div>

              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed break-words">
                {product.description?.[selectedLanguage]}
              </p>

              {/* Protein choice */}
              {product.hasProteinChoices && (
                <div className="mt-2 sm:mt-4">
                  <span className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3 block">
                    {t("choose_protein")}
                  </span>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {["chicken", "meat"].map((option) => (
                      <Label
                        key={option}
                        className="inline-flex gap-2 items-center cursor-pointer"
                      >
                        <Input
                          type="radio"
                          name="protein"
                          value={option}
                          checked={selectedProtein === option}
                          onChange={() => setSelectedProtein(option)}
                          required
                          className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <span className="text-sm sm:text-base">
                          {t(option)}
                        </span>
                      </Label>
                    ))}
                  </div>
                </div>
              )}

              {/* Type choice */}
              {product.hasTypeChoices && (
                <div className="mt-2 sm:mt-4">
                  <span className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3 block">
                    {t("choose_type")}
                  </span>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {["sandwich", "meal"].map((option) => (
                      <Label
                        key={option}
                        className="inline-flex gap-2 items-center cursor-pointer"
                      >
                        <Input
                          type="radio"
                          name="type"
                          value={option}
                          checked={selectedType === option}
                          onChange={() => setSelectedType(option)}
                          required
                          className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <span className="text-sm sm:text-base">
                          {t(option)}
                        </span>
                      </Label>
                    ))}
                  </div>
                </div>
              )}

              {/* Spicy level */}
              {product.isSpicy && (
                <div className="mt-2 sm:mt-4">
                  <span className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3 block">
                    {t("choose_spicy_level")}
                  </span>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <Label className="inline-flex gap-2 items-center cursor-pointer">
                      <Input
                        type="radio"
                        name="spicy"
                        value="yes"
                        onChange={() => setSpicy(true)}
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                      <span className="text-sm sm:text-base">{t("spicy")}</span>
                    </Label>
                    <Label className="inline-flex gap-2 items-center cursor-pointer">
                      <Input
                        type="radio"
                        name="spicy"
                        value="no"
                        defaultChecked
                        onChange={() => setSpicy(false)}
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                      <span className="text-sm sm:text-base">
                        {t("not_spicy")}
                      </span>
                    </Label>
                  </div>
                </div>
              )}

              {/* Additions */}
              {product.additions && product.additions.length > 0 && (
                <div className="mt-2 sm:mt-4">
                  <span className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3 block">
                    {t("additions") || "Additions"}
                  </span>
                  <div className="space-y-2 sm:space-y-3">
                    {product.additions.map((addition) => {
                      const isChecked = selectedAdditions.includes(
                        addition._id
                      );
                      const isCheckbox =
                        product.additionsSelectionType === "checkbox";
                      const additionName =
                        addition.name?.[selectedLanguage] || "";
                      const additionPrice = Number(addition.price);

                      return (
                        <div
                          key={addition._id}
                          className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
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
                              className="w-4 h-4 sm:w-5 sm:h-5 mt-1 sm:mt-0 flex-shrink-0"
                            />
                          ) : (
                            <Input
                              type="radio"
                              id={addition._id}
                              value={addition._id}
                              checked={isChecked}
                              onChange={() =>
                                setSelectedAdditions([addition._id])
                              }
                              className="w-4 h-4 sm:w-5 sm:h-5 mt-1 sm:mt-0 flex-shrink-0"
                            />
                          )}

                          <Label
                            htmlFor={addition._id}
                            className="flex flex-wrap items-center gap-2 text-gray-700 text-sm sm:text-base cursor-pointer flex-1 min-w-0"
                          >
                            <span className="break-words min-w-0">
                              {additionName}
                            </span>

                            {additionPrice > 0 && (
                              <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap flex-shrink-0">
                                (JOD {additionPrice.toFixed(2)})
                              </span>
                            )}

                            {product.category?.name?.en === "Kids" && (
                              <>
                                {(additionName?.toLowerCase().includes("boy") ||
                                  additionName?.includes("ولادي")) && (
                                  <img
                                    src={shesho}
                                    alt="Boy"
                                    className="rounded-xl max-h-12 sm:max-h-16 object-contain flex-shrink-0"
                                  />
                                )}

                                {(additionName
                                  ?.toLowerCase()
                                  .includes("girl") ||
                                  additionName?.includes("بناتي")) && (
                                  <img
                                    src={shishi}
                                    alt="Girl"
                                    className="rounded-xl max-h-12 sm:max-h-16 object-contain flex-shrink-0"
                                  />
                                )}
                              </>
                            )}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mt-2 sm:mt-4">
                <Label
                  htmlFor="notes"
                  className="text-sm sm:text-base font-medium text-gray-900 mb-2 block"
                >
                  {t("notes")}
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base resize-y w-full min-w-0 border-2 rounded-md"
                  placeholder={
                    t("add_notes") || "Add any special instructions..."
                  }
                />
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col -mx-5 sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-6 pt-2 sm:pt-4 border-t border-gray-200 min-w-0">
                <div className="flex items-center justify-center border-2 border-gray-200 rounded-lg w-full sm:w-auto flex-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 sm:h-12 sm:w-12 hover:bg-orange-50 hover:text-orange-500 p-0"
                    onClick={() => handleQuantityChange(-1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <span className="w-12 sm:w-16 text-center font-semibold text-base sm:text-lg">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 sm:h-12 sm:w-12 hover:bg-orange-50 hover:text-orange-500 p-0"
                    onClick={() => handleQuantityChange(1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white h-10 sm:h-12 text-sm sm:text-base md:text-lg font-semibold w-full sm:w-auto min-w-0"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {t("add_to_cart")} JOD {getTotalPrice().toFixed(2)}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </DialogUi>
  );
}
