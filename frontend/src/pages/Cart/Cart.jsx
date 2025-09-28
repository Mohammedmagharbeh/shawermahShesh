import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CartCard from "./CartCard";

const Cart = () => {
  const [total, setTotal] = useState(0);

  const cart = [
    {
      id: 1,
      name: "Product 1",
      price: 100,
      discountPercentage: 10,
      quantity: 2,
      images: ["https://via.placeholder.com/150"],
    },
    {
      id: 2,
      name: "Product 2",
      price: 200,
      discountPercentage: 20,
      quantity: 1,
      images: ["https://via.placeholder.com/150"],
    },
  ];

  useEffect(() => {
    const newTotal = cart.reduce((acc, product) => {
      const discountPrice =
        product.price - (product.price * product.discountPercentage) / 100;
      return acc + discountPrice * product.quantity;
    }, 0);
    setTotal(newTotal.toFixed(2));
  }, [cart, setTotal]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-sm:max-w-full lg:max-w-[calc(100%-270px)] max-sm:mx-10">
        <div className="flex flex-col gap-10 p-4">
          <div className="grid grid-cols-4 font-semibold text-gray-700 py-4 shadow-md border-gray-300 max-sm:hidden ">
            <span>Product</span>
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-center">Subtotal</span>
          </div>
          {cart.map((product, index) => (
            <CartCard product={product} key={index} />
          ))}
        </div>
        <div className="flex justify-between mb-20 gap-4 max-sm:flex-col lg:flex-row">
          <button className="px-12 py-4 border border-black rounded-md hover:bg-button2 hover:text-white transition-colors">
            Return To Shop
          </button>
          <button className="px-12 py-4 border border-black rounded-md hover:bg-button2 hover:text-white transition-colors">
            Update Cart
          </button>
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
