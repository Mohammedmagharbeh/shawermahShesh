import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    _id: "",
    userId: "",
    products: [],
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { user } = useUser();

  // Fetch cart on mount
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const fetchCart = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/cart/${user._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCart(data);
      } catch (error) {
        console.error(error);
        setCart({
          _id: "",
          userId: user._id,
          products: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // calculate total
  useEffect(() => {
    const newTotal = cart.products?.reduce((acc, item) => {
      const product = item.productId;
      if (!product) return acc;

      let basePrice = product.basePrice || 0;
      const { selectedProtein, selectedType } = item;

      // ✅ Handle nested prices { chicken: { sandwich, meal } }
      if (
        selectedProtein &&
        selectedType &&
        product.prices?.[selectedProtein]?.[selectedType] != null
      ) {
        basePrice = Number(product.prices[selectedProtein][selectedType]);
      }
      // ✅ Handle flat prices { sandwich, meal }
      else if (selectedType && product.prices?.[selectedType] != null) {
        basePrice = Number(product.prices[selectedType]);
      }

      // ✅ Apply discount
      if (product.discount) {
        basePrice = basePrice - (basePrice * product.discount) / 100;
      }

      // ✅ Add additions prices
      const additionsPrice =
        item.additions?.reduce(
          (sum, add) => sum + (Number(add.price) || 0),
          0
        ) || 0;

      return acc + (basePrice + additionsPrice) * (item.quantity || 1);
    }, 0);

    setTotal(newTotal);
  }, [cart]);

  // Add product to cart
  const addToCart = async (
    productId,
    quantity,
    isSpicy,
    additions,
    notes,
    { selectedProtein, selectedType } = {} // new selections
  ) => {
    if (!user._id) {
      toast.error(t("please_login_to_add_items"));
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/cart/add/${user._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            productId,
            quantity: quantity || 1,
            isSpicy: isSpicy || false,
            additions: additions || [],
            notes: notes || "",
            selectedProtein: selectedProtein || null,
            selectedType: selectedType || null,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to add to cart");
      const data = await res.json();
      setCart(data.cart);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add item to cart");
    }
  };

  // Update quantity or selections
  const updateQuantity = async (
    productId,
    { quantity, additions, isSpicy, notes, selectedProtein, selectedType }
  ) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/cart/update/${cart._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            productId,
            quantity,
            additions,
            isSpicy,
            notes,
            selectedProtein: selectedProtein || null,
            selectedType: selectedType || null,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update cart");
      const data = await res.json();
      setCart(data.cart);
    } catch (error) {
      console.error(error);
    }
  };

  // Remove product
  const removeFromCart = async (
    productId,
    additions,
    isSpicy,
    notes,
    selectedProtein,
    selectedType
  ) => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/cart/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          productId,
          additions: additions || [],
          isSpicy,
          notes,
          selectedProtein: selectedProtein || null,
          selectedType: selectedType || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      const data = await res.json();
      setCart(data.cart);
      toast.success(t("item_removed_from_cart"));
    } catch (error) {
      console.error(error);
      toast.error(t("failed_to_remove_item"));
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/cart/clear/${user._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to clear cart");
      const data = await res.json();
      setCart(data.cart);
    } catch (error) {
      console.error(error);
      toast.error(t("failed_to_clear_cart"));
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCart = () => useContext(CartContext);
