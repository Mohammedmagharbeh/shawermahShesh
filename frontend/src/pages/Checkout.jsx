import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";

function Checkout() {
  const { cart, total } = useCart();
  const { user } = useUser();

  const DETAILS = [
    { name: "First Name", label: "name", required: true, type: "text" },

    {
      name: "Apartment, floor, etc. (optional)",
      label: "apartment",
      required: false,
      type: "text",
    },
    { name: "Area", label: "area", required: true, type: "text" },
    {
      name: "Phone Number",
      label: "phone",
      required: true,
      type: "text",
      defaultValue: user.phone,
      readonly: true,
    },
  ];

  const handlePlaceOrder = () => {
    if (cart.products.length === 0) {
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Complete Your Order
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Just a few more details and your delicious meal will be on its way!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </span>
              Delivery Details
            </h2>

            <div className="space-y-6">
              {DETAILS.map((detail, index) => (
                <div key={index} className="space-y-2">
                  <label
                    htmlFor={detail.label}
                    className="block text-sm font-semibold text-gray-700"
                  >
                    {detail.name}
                    {detail.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 hover:bg-white"
                    id={detail.label}
                    type={detail.type}
                    required={detail.required}
                    placeholder={`Enter your ${detail.name.toLowerCase()}`}
                    defaultValue={detail.defaultValue || ""}
                    readOnly={detail.readonly || false}
                  />
                </div>
              ))}

              <div className="flex items-start gap-3 pt-4">
                <input
                  className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500 mt-0.5"
                  type="checkbox"
                  name="save"
                  id="save"
                />
                <label
                  htmlFor="save"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  Save this information for faster checkout next time
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </span>
              Order Summary
            </h2>

            <div className="space-y-6">
              {cart.products.map((product) => (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {product.productId.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Large • Qty: {product.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">
                      {product.productId.price.toFixed(2)} JOD
                    </span>
                  </div>
                </div>
              ))}

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{total.toFixed(2)} JOD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-red-600">{total.toFixed(2)} JOD</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Payment Method
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-red-300 transition-colors">
                    <input
                      className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                      id="bank"
                      name="PaymentMethod"
                      type="radio"
                      defaultChecked
                    />
                    <label
                      htmlFor="bank"
                      className="flex-1 font-medium text-gray-700"
                    >
                      Credit/Debit Card
                    </label>
                    <div className="flex gap-1">
                      <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        V
                      </div>
                      <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        M
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-red-300 transition-colors">
                    <input
                      className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                      id="cash"
                      name="PaymentMethod"
                      type="radio"
                    />
                    <label
                      htmlFor="cash"
                      className="flex-1 font-medium text-gray-700"
                    >
                      Cash on Delivery
                    </label>
                    <span className="text-2xl">💵</span>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={handlePlaceOrder}
              >
                🍽️ Place Order - {total.toFixed(2)} JOD
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Your order will be prepared fresh and delivered in 25-35 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
