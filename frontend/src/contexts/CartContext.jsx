import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    _id: "",
    userId: "",
    products: [],
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      if (!user?._id) {
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/cart/${user._id}`
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
  }, [user]);

  // Calculate total whenever cart changes
  useEffect(() => {
    const newTotal = cart.products.reduce((acc, item) => {
      const price = item.productId?.price || 0;
      const quantity = item.quantity || 0;
      return acc + price * quantity;
    }, 0);
    setTotal(newTotal);
  }, [cart]);

  // Add product to cart
  const addToCart = async (productId) => {
    if (!user._id) {
      toast.error("Please log in to add items to your cart");
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/cart/add/${user._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity: 1 }),
        }
      );
      if (!res.ok) throw new Error("Failed to add to cart");
      const data = await res.json();
      setCart(data.cart);
    } catch (error) {
      console.error(error);
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/cart/update/${cart._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
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
  const removeFromCart = async (productId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/cart/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          productId,
        }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      const data = await res.json();
      setCart(data.cart);
    } catch (error) {
      console.error(error);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/cart/clear/${user._id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to clear cart");
      const data = await res.json();
      setCart(data.cart);
    } catch (error) {
      console.error(error);
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
