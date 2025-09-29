import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CartCard from "./CartCard";
import Loading from "../../componenet/common/Loading";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { cart, total, loading } = useCart();

  if (loading) return <Loading />;

  if (cart.products.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Order</h1>
          <p className="text-lg text-gray-600">
            Review your delicious selections
          </p>
          <div className="w-24 h-1 bg-red-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="xl:col-span-2">
            {/* Desktop Header */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-4 bg-red-600 text-white p-6 rounded-lg font-semibold text-lg mb-6">
              <span>Item Details</span>
              <span className="text-center">Price</span>
              <span className="text-center">Quantity</span>
              <span className="text-center">Subtotal</span>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cart.products.map((product) => (
                <CartCard product={product} key={product.productId._id} />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-xl p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-lg font-semibold">{total} JOD</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="text-gray-600 font-semibold">
                      According to your location
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xl font-bold text-gray-800">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      {total} JOD
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className={`w-full bg-red-600 hover:bg-red-700 px-8 py-4 text-white rounded-lg font-bold text-lg text-center block transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  cart.products.length === 0 && "pointer-events-none opacity-50"
                }`}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
