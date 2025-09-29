import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CartCard from "./CartCard";
import Loading from "../../componenet/common/Loading";

const Cart = () => {
  const [total, setTotal] = useState(0);
  const [cart, setCart] = useState({ _id: "", userId: "", products: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/cart/68d53731440f4c97ce2c036f`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch cart data");
        }
        const data = await response.json();

        setCart(data);
      } catch (error) {
        console.error("Error fetching cart data:", error);
        setCart({ _id: "", userId: "", products: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [total]);

  const handleQuantityChange = async (e, productId) => {
    try {
      const newQuantity = parseInt(e.target.value, 10);
      if (newQuantity >= 1) {
        const response = await fetch(
          `http://localhost:5000/api/cart/update/${cart._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: productId,
              quantity: newQuantity,
            }),
          }
        );
        if (!response.ok) {
          console.error("Failed to update cart item quantity");
          return;
        }
        const data = await response.json();
        setCart(data.cart);
        // console.log("Cart item quantity updated:", data);
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    }
  };

  const removeCartItem = async (productId) => {
    const response = await fetch(`http://localhost:5000/api/cart/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: cart.userId,
        productId: "68d780ffaf6e8cdb0b932f2f",
      }),
    });
    if (!response.ok) {
      console.error("Failed to remove cart item");
      return;
    }
    const data = await response.json();
    // After removing item
    setCart((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.productId._id !== productId),
    }));

    console.log("Cart item removed:", data);
  };

  useEffect(() => {
    const newTotal = cart.products.reduce((acc, product) => {
      const price = product.productId.price;
      return acc + price * product.quantity;
    }, 0);
    setTotal(newTotal.toFixed(2));
  }, [cart]);

  if (loading) return <Loading />;

  return (
    <div className="w-full flex justify-center py-20">
      <div className="w-full max-sm:max-w-full lg:max-w-[calc(100%-270px)] max-sm:mx-10">
        <div className="flex flex-col gap-10 p-4 py-10">
          <div className="grid grid-cols-4 font-semibold text-gray-700 py-4 shadow-md border-gray-300 max-sm:hidden ">
            <span>Product</span>
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-center">Subtotal</span>
          </div>
          {cart.products.map((product, index) => (
            <CartCard
              product={product}
              key={index}
              handleQuantityChange={handleQuantityChange}
              removeCartItem={removeCartItem}
            />
          ))}
        </div>

        <div className="flex justify-between mb-20 max-sm:flex-col lg:flex-row">
          <div className="flex gap-4 h-14 max-sm:flex-col lg:flex-row xs:mb-28">
            <input
              className="py-4 px-6 border border-black"
              type="text"
              placeholder="Coupon Code"
            />
            <button className="bg-button2 px-12 py-4 text-white rounded-md hover:bg-white transition-colors hover:text-black border hover:border-black">
              Apply Coupon
            </button>
          </div>
          <div className="flex flex-col gap-4 border-2 border-black lg:w-[470px] px-6 py-8 max-sm:my-24 md:my-auto justify-center">
            <p className="text-xl text-start mb-2">Cart Total</p>
            <div className="flex justify-between">
              <p>Subtotal:</p>
              <p>${total}</p>
            </div>
            <hr className="my-4 w-full border-t border-gray-300" />
            <div className="flex justify-between">
              <p>Shipping:</p>
              <p>Free</p>
            </div>
            <hr className="my-4 w-full border-t border-gray-300" />
            <div className="flex justify-between">
              <p>Total:</p>
              <p>${total}</p>
            </div>
            <Link
              to="/checkout"
              className={`bg-button2 px-12 py-4 self-center rounded-md text-white hover:bg-white hover:text-black border hover:border-black ${
                cart.length === 0 && "pointer-events-none"
              }`}
            >
              Process To Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
