import { useState, useMemo, useCallback, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";
import { sanitizeText } from "@/utils/inputSanitization";
import {
  DEFAULT_LANGUAGE,
  STORAGE_KEY_LANGUAGE,
  API_ENDPOINTS,
} from "@/components/product-dialog/constants";

/**
 * Custom Hook: useProductDialogLogic
 * Encapsulates all state and business logic for the product dialog.
 */
export const useProductDialogLogic = (id, t) => {
  const { user } = useUser();
  const { addToCart } = useCart();

  // --- Derived State ---
  const selectedLanguage = useMemo(
    () => localStorage.getItem(STORAGE_KEY_LANGUAGE) || DEFAULT_LANGUAGE,
    [],
  );

  // --- Local State ---
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState({});

  // Selection State
  const [quantity, setQuantity] = useState(1);
  const [selectedAdditions, setSelectedAdditions] = useState([]);
  const [spicy, setSpicy] = useState(null);
  const [notes, setNotes] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedProtein, setSelectedProtein] = useState(null);

  // --- Data Fetching (Memoized) ---
  const fetchProductDetails = useCallback(async () => {
    if (!id || !user?.token || !open) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}${API_ENDPOINTS.PRODUCTS}/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch product");

      const data = await response.json();
      setProduct(data.data);
    } catch (error) {
      console.error("Product fetch error:", error);
      toast.error(t("fetch_error"));
    } finally {
      setLoading(false);
    }
  }, [id, user?.token, open, t]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  // --- Price Logic (Memoized) ---

  // Base Price
  const basePrice = useMemo(() => {
    if (!product) return 0;
    let price = Number(product.basePrice || 0);

    // Matches CartContext logic exactly for consistency
    if (
      selectedProtein &&
      selectedType &&
      product.prices?.[selectedProtein]?.[selectedType] != null
    ) {
      price = Number(product.prices[selectedProtein][selectedType]);
    } else if (selectedType && product.prices?.[selectedType] != null) {
      price = Number(product.prices[selectedType]);
    } else if (selectedProtein && product.prices?.[selectedProtein] != null) {
      price = Number(product.prices[selectedProtein]);
    }

    return isNaN(price) ? 0 : price;
  }, [product, selectedProtein, selectedType]);

  // Discounted Base
  const discountedBasePrice = useMemo(() => {
    const discountVal = Number(product.discount || 0);
    if (discountVal > 0) {
      const discountAmount = (basePrice * discountVal) / 100;
      const final = basePrice - discountAmount;
      return isNaN(final) ? basePrice : final;
    }
    return basePrice;
  }, [basePrice, product.discount]);

  // Additions Total
  const additionsPrice = useMemo(() => {
    if (!product.additions) return 0;
    return selectedAdditions.reduce((total, addId) => {
      const addition = product.additions.find((a) => a._id === addId);
      const addPrice = addition ? Number(addition.price || 0) : 0;
      return total + (isNaN(addPrice) ? 0 : addPrice);
    }, 0);
  }, [selectedAdditions, product.additions]);

  // Unit & Grand Totals
  const pricePerUnit = useMemo(() => {
    const total = discountedBasePrice + additionsPrice;
    return isNaN(total) ? 0 : total;
  }, [discountedBasePrice, additionsPrice]);

  const grandTotal = useMemo(() => {
    const total = pricePerUnit * quantity;
    return isNaN(total) ? 0 : total;
  }, [pricePerUnit, quantity]);

  // --- Handlers (Memoized) ---

  const resetForm = useCallback(() => {
    setSelectedAdditions([]);
    setSpicy(null);
    setSelectedProtein(null);
    setSelectedType(null);
    setNotes("");
    setQuantity(1);
  }, []);

  const handleDialogOpenChange = useCallback(
    (isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    },
    [resetForm],
  );

  const handleValidation = useCallback(() => {
    if (product.hasProteinChoices && !selectedProtein)
      return t("choose_protein_req");
    if (product.hasTypeChoices && !selectedType) return t("choose_type_req");
    if (product.isSpicy && spicy === null) return t("choose_spicy_req");
    return null;
  }, [product, selectedProtein, selectedType, spicy, t]);

  const handleAddToCart = useCallback(
    (e) => {
      e?.preventDefault();

      const validationError = handleValidation();
      if (validationError) {
        toast.error(validationError);
        return;
      }

      const selectedFullAdditions = product.additions?.filter((a) =>
        selectedAdditions.includes(a._id),
      );

      addToCart(
        product._id,
        quantity,
        product.isSpicy ? spicy : false,
        selectedFullAdditions,
        sanitizeText(notes),
        { selectedProtein, selectedType },
      );

      setOpen(false);
      resetForm();
      toast.success(t("added_to_cart"));
    },
    [
      product,
      handleValidation,
      quantity,
      spicy,
      selectedAdditions,
      notes,
      selectedProtein,
      selectedType,
      addToCart,
      resetForm,
      t,
    ],
  );

  const handleQuantityChange = useCallback((val) => {
    setQuantity((prev) => Math.max(1, prev + val));
  }, []);

  const handleProteinSelect = useCallback((val) => setSelectedProtein(val), []);
  const handleTypeSelect = useCallback((val) => setSelectedType(val), []);
  const handleSpicySelect = useCallback((val) => setSpicy(val), []);

  const handleAdditionToggle = useCallback((id, isCheckbox) => {
    setSelectedAdditions((prev) => {
      if (isCheckbox) {
        return prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
      }
      return prev.includes(id) ? [] : [id]; // Radio behavior
    });
  }, []);

  const isSelectionComplete = useCallback(() => {
    if (product.hasProteinChoices && !selectedProtein) return false;
    if (product.hasTypeChoices && !selectedType) return false;
    // Note: spicy check removed as per original component logic in `isSelectionComplete` helper
    // but added to validation logic. This keeps UI consistent with original behavior.
    return true;
  }, [product, selectedProtein, selectedType]);

  return {
    state: {
      open,
      loading,
      product,
      quantity,
      selectedAdditions,
      spicy,
      notes,
      selectedType,
      selectedProtein,
      selectedLanguage,

      // Calculated
      basePrice,
      additionsPrice,
      pricePerUnit,
      grandTotal,
    },
    actions: {
      setOpen: handleDialogOpenChange,
      setNotes,
      resetForm,
      handleAddToCart,
      handleQuantityChange,
      handleProteinSelect,
      handleTypeSelect,
      handleSpicySelect,
      handleAdditionToggle,
      isSelectionComplete,
    },
  };
};
