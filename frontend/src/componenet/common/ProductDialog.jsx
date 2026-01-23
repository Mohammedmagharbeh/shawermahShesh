import { useEffect, useState, useMemo } from "react";
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

export function ProductDialog({ id, triggerLabel, disabled = false, className }) {
  const { t } = useTranslation();
  const { user } = useUser();
  const { addToCart } = useCart();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  // --- State ---
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState({});

  // Selection State
  const [quantity, setQuantity] = useState(1);
  const [selectedAdditions, setSelectedAdditions] = useState([]); // Stores Array of IDs
  const [spicy, setSpicy] = useState(null);
  const [notes, setNotes] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedProtein, setSelectedProtein] = useState(null);

  const buttonLabel = triggerLabel || t("view_product");

  // --- Fetch Data ---
  useEffect(() => {
    if (!open || !id) return;

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
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setProduct(data.data);
      } catch (error) {
        console.error(error);
        toast.error(t("fetch_error"));
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, open, user.token]);

  // --- 💰 PRICE CALCULATION ENGINE 💰 ---

  // 1. Determine the Base Price (Standard or Matrix)
  const basePrice = useMemo(() => {
    if (!product) return 0;
    let price = Number(product.basePrice || 0);

    // If product has choices, override base price from matrix
    if (product.hasProteinChoices && product.hasTypeChoices) {
      if (selectedProtein && selectedType) {
        price = Number(product.prices?.[selectedProtein]?.[selectedType] ?? price);
      }
    } else if (product.hasProteinChoices) {
      if (selectedProtein) {
        price = Number(product.prices?.[selectedProtein] ?? price);
      }
    } else if (product.hasTypeChoices) {
      if (selectedType) {
        price = Number(product.prices?.[selectedType] ?? price);
      }
    }
    return price;
  }, [product, selectedProtein, selectedType]);

  // 2. Calculate Discount on Base Price Only
  const discountedBasePrice = useMemo(() => {
    if (product.discount > 0) {
      const discountAmount = (basePrice * product.discount) / 100;
      return basePrice - discountAmount;
    }
    return basePrice;
  }, [basePrice, product.discount]);

  // 3. Calculate Additions Total
  const additionsPrice = useMemo(() => {
    if (!product.additions) return 0;
    return selectedAdditions.reduce((total, id) => {
      const addition = product.additions.find((a) => a._id === id);
      return total + (addition ? Number(addition.price || 0) : 0);
    }, 0);
  }, [selectedAdditions, product.additions]);

  // 4. Final Total per Unit
  const pricePerUnit = discountedBasePrice + additionsPrice;

  // 5. Grand Total
  const grandTotal = pricePerUnit * quantity;


  // --- Handlers ---

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => Math.max(1, prev + increment));
  };

  const resetForm = () => {
    setSelectedAdditions([]);
    setSpicy(null);
    setSelectedProtein(null);
    setSelectedType(null);
    setNotes("");
    setQuantity(1);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();

    // Validation
    if (product.hasProteinChoices && !selectedProtein) return toast.error(t("choose_protein_req"));
    if (product.hasTypeChoices && !selectedType) return toast.error(t("choose_type_req"));
    if (product.isSpicy && spicy === null) return toast.error(t("choose_spicy_req"));

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

    setOpen(false);
    resetForm();
    toast.success(t("added_to_cart"));
  };

  // Helper: Should we show the price yet?
  const isSelectionComplete = () => {
    if (product.hasProteinChoices && !selectedProtein) return false;
    if (product.hasTypeChoices && !selectedType) return false;
    return true;
  };

  return (
    <DialogUi open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      {/* Trigger Button - Styled cleanly */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`hover:bg-accent hover:text-accent-foreground transition-colors `}
        >
          {buttonLabel}
        </Button>
      </DialogTrigger>

      {/* FIX: Added max-h-[90vh] and flex-col to parent. 
         This ensures the modal has a hard limit on height.
      */}
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl md:max-w-4xl max-h-[90vh] flex flex-col p-0 bg-white gap-0 outline-none overflow-hidden">

        {loading ? (
          <div className="p-10"><Loading /></div>
        ) : (
          <form onSubmit={handleAddToCart} className="flex flex-col h-full overflow-hidden">

            {/* FIX: Added 'min-h-0'. 
                This allows this flex child to shrink below its content size and activate scrollbars 
                instead of pushing the footer off screen.
            */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                {/* --- Image Section --- */}
                <div className="relative w-full h-fit shrink-0">
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <img
                      src={product.image || product_placeholder}
                      alt={product.name?.[selectedLanguage]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {product.discount > 0 && (
                    <Badge className="absolute top-4 right-4 bg-red-600 text-white text-sm px-3 py-1 shadow-md">
                      {t("save")} {product.discount}%
                    </Badge>
                  )}
                </div>

                {/* --- Details Section --- */}
                <div className="flex flex-col space-y-6">

                  {/* Header & Price */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {product.name?.[selectedLanguage]}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {product.category?.name?.[selectedLanguage]}
                    </p>

                    {/* Price Display */}
                    <div className="flex items-center gap-3">
                      {!isSelectionComplete() ? (
                        <p className="text-lg font-medium text-primary">
                          {t("according_to_choices")}
                        </p>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-red-600">
                            {pricePerUnit.toFixed(2)} {t("jod")}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-lg text-gray-400 line-through">
                              {(basePrice + additionsPrice).toFixed(2)}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <p className="mt-3 text-gray-600 leading-relaxed text-sm">
                      {product.description?.[selectedLanguage]}
                    </p>
                  </div>

                  {/* Options (Protein, Type, Spicy) */}
                  <div className="space-y-5 pb-4">

                    {/* Protein */}
                    {product.hasProteinChoices && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">{t("choose_protein")} <span className="text-red-500">*</span></Label>
                        <div className="flex flex-wrap gap-3">
                          {["chicken", "meat"].map((opt) => (
                            <div
                              key={opt}
                              onClick={() => setSelectedProtein(opt)}
                              className={`px-4 py-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${selectedProtein === opt ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 hover:border-gray-300"}`}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedProtein === opt ? "border-red-600" : "border-gray-400"}`}>
                                {selectedProtein === opt && <div className="w-2 h-2 bg-red-600 rounded-full" />}
                              </div>
                              <span className="text-sm font-medium">{t(opt)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Type */}
                    {product.hasTypeChoices && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">{t("choose_type")} <span className="text-red-500">*</span></Label>
                        <div className="flex flex-wrap gap-3">
                          {["sandwich", "meal"].map((opt) => (
                            <div
                              key={opt}
                              onClick={() => setSelectedType(opt)}
                              className={`px-4 py-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${selectedType === opt ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 hover:border-gray-300"}`}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedType === opt ? "border-red-600" : "border-gray-400"}`}>
                                {selectedType === opt && <div className="w-2 h-2 bg-red-600 rounded-full" />}
                              </div>
                              <span className="text-sm font-medium">{t(opt)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spicy */}
                    {product.isSpicy && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">{t("choose_spicy_level")} <span className="text-red-500">*</span></Label>
                        <div className="flex flex-wrap gap-3">
                          {[true, false].map((val) => (
                            <div
                              key={val.toString()}
                              onClick={() => setSpicy(val)}
                              className={`px-4 py-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${spicy === val ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 hover:border-gray-300"}`}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${spicy === val ? "border-red-600" : "border-gray-400"}`}>
                                {spicy === val && <div className="w-2 h-2 bg-red-600 rounded-full" />}
                              </div>
                              <span className="text-sm font-medium">{val ? t("spicy") : t("not_spicy")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additions */}
                    {product.additions?.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">{t("additions")}</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {product.additions.map((addition) => {
                            const isChecked = selectedAdditions.includes(addition._id);
                            const isCheckbox = product.additionsSelectionType === "checkbox";
                            const price = Number(addition.price);

                            return (
                              <div
                                key={addition._id}
                                onClick={() => {
                                  if (isCheckbox) {
                                    setSelectedAdditions(prev => prev.includes(addition._id) ? prev.filter(id => id !== addition._id) : [...prev, addition._id]);
                                  } else {
                                    setSelectedAdditions(prev => prev.includes(addition._id) ? [] : [addition._id]); // Radio toggle
                                  }
                                }}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isChecked ? "border-red-500 bg-red-50/30" : "border-gray-200 hover:border-gray-300"}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 flex items-center justify-center border transition-all ${isChecked ? "bg-red-600 border-red-600 text-white" : "bg-white border-gray-300"} ${isCheckbox ? "rounded-md" : "rounded-full"}`}>
                                    {isChecked && (isCheckbox ? <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white rotate-[-45deg] mb-0.5" /> : <div className="w-2 h-2 bg-white rounded-full" />)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">{addition.name?.[selectedLanguage]}</span>
                                    {price > 0 && <span className="text-xs text-gray-500">+ {price.toFixed(2)} {t("jod")}</span>}
                                  </div>
                                </div>

                                {/* Optional Images */}
                                {product.category?.name?.en === "Kids" && (
                                  <div className="flex-shrink-0">
                                    {(addition.name?.[selectedLanguage]?.toLowerCase().includes("boy") || addition.name?.[selectedLanguage]?.includes("ولادي")) && (
                                      <img src={shesho} alt="Boy" className="h-8 w-8 object-contain" />
                                    )}
                                    {(addition.name?.[selectedLanguage]?.toLowerCase().includes("girl") || addition.name?.[selectedLanguage]?.includes("بناتي")) && (
                                      <img src={shishi} alt="Girl" className="h-8 w-8 object-contain" />
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-3 flex gap-2">
                      <Label htmlFor="notes" className="text-base font-semibold">{t("notes")}</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t("add_notes")}
                        className="resize-none min-h-[80px] border p-2"
                      />
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* FIX: Added 'shrink-0'. 
               This ensures the footer never gets squashed or hidden by the flex-1 content above it.
            */}
            <div className="border-t p-4 sm:p-6 bg-gray-50/80 backdrop-blur-sm mt-auto shrink-0 z-10 w-full">
              <div className="flex flex-col sm:flex-row items-stretch gap-4 max-w-4xl mx-auto">

                {/* Quantity */}
                <div className="flex items-center justify-between bg-white border rounded-lg px-2 sm:w-40 shadow-sm h-12">
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} className="h-full w-10 text-gray-500 hover:text-red-600">
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-bold text-gray-900">{quantity}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} className="h-full w-10 text-gray-500 hover:text-red-600">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isSelectionComplete()}
                  className="flex-1 h-12 text-base font-bold text-white shadow-md transition-transform active:scale-[0.99]"
                  style={{ backgroundColor: "var(--color-button2)" }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t("add_to_cart")}
                  <span className="mx-2 opacity-50">|</span>
                  {grandTotal.toFixed(2)} {t("jod")}
                </Button>

              </div>
            </div>

          </form>
        )}
      </DialogContent>
    </DialogUi>
  );
}