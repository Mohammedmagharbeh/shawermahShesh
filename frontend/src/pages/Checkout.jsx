import Loading from "@/componenet/common/Loading";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import cliq from "../../src/assets/cliq.png";

// The specific ID that triggers Test Mode
const TEST_PRODUCT_ID = "696f8dadfa26824a3b34e5af";

function Checkout() {
  const { cart } = useCart(); // Removed 'total' from context to use calculated total
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  // --- State ---
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState({
    name: "",
    deliveryCost: 0,
    _id: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderType, setOrderType] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Test Mode Logic
  const hasTestProduct = cart.products.some((p) => {
    const pId = p.productId._id || p.productId;
    return pId === TEST_PRODUCT_ID;
  });
  const isTestMode = searchParams.get("test") === "1" || hasTestProduct;

  const [details, setDetails] = useState({
    name: isTestMode ? "MONTYPAY TESTER" : user?.name || "",
    apartment: "",
    phone: user?.phone || "",
    _id: user?._id || "",
  });

  // --- 💰 PRICE CALCULATION ENGINE 💰 ---
  const orderSummary = useMemo(() => {
    let originalSubtotal = 0;
    let finalSubtotal = 0;

    cart.products.forEach((item) => {
      const { productId, additions, quantity, selectedProtein, selectedType } = item;

      // 1. Determine Base Price (Handle Matrix)
      let basePrice = Number(productId.basePrice || 0);

      if (productId.hasProteinChoices && productId.hasTypeChoices) {
        if (selectedProtein && selectedType) {
          basePrice = Number(productId.prices?.[selectedProtein]?.[selectedType] ?? basePrice);
        }
      } else if (productId.hasProteinChoices) {
        if (selectedProtein) {
          basePrice = Number(productId.prices?.[selectedProtein] ?? basePrice);
        }
      } else if (productId.hasTypeChoices) {
        if (selectedType) {
          basePrice = Number(productId.prices?.[selectedType] ?? basePrice);
        }
      }

      // 2. Additions Cost
      const additionsCost = additions.reduce((sum, add) => sum + Number(add.price || 0), 0);

      // 3. Discount Logic
      const discountPercent = Number(productId.discount || 0);
      const discountAmount = (basePrice * discountPercent) / 100;

      // 4. Line Totals
      const lineOriginal = (basePrice + additionsCost) * quantity;
      const lineFinal = ((basePrice - discountAmount) + additionsCost) * quantity;

      originalSubtotal += lineOriginal;
      finalSubtotal += lineFinal;
    });

    return {
      originalSubtotal,
      finalSubtotal,
      savings: originalSubtotal - finalSubtotal
    };
  }, [cart.products]);

  // Calculate Total with Delivery
  const deliveryCost = orderType === "delivery" ? (selectedArea?.deliveryCost || 0) : 0;
  const totalWithDelivery = orderSummary.finalSubtotal + deliveryCost;


  // --- Effects ---
  useEffect(() => {
    if (isTestMode) {
      setDetails((prev) => ({ ...prev, name: "MontyPay Tester" }));
      setOrderType("pickup");
    }
  }, [isTestMode]);

  useEffect(() => {
    if (isTestMode) return;
    if (!cart.products || cart.products.length < 1) {
      navigate("/products");
    }
  }, [cart, navigate, isTestMode]);

  useEffect(() => {
    async function fetchAreas() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/locations/get`,
          {
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${user.token}`,
            },
          },
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setAreas(data.locations);
      } catch (e) {
        console.error("Failed to fetch locations:", e);
        setError(t("checkout_fetch_area_error"));
      } finally {
        setIsLoading(false);
      }
    }
    fetchAreas();
  }, [user.token, t]);

  const DETAILS = [
    { name: t("checkout_name"), label: "name", required: true, type: "text", defaultValue: details.name },
    { name: `${t("checkout_apartment_floor")} (${t("checkout_optional")})`, label: "apartment", required: false, type: "text" },
    { name: t("checkout_phone"), label: "phone", required: true, type: "text", defaultValue: user?.phone || "", readOnly: true },
  ];

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cart.products.length === 0 && !isTestMode) {
      toast.error(t("checkout_cart_empty"));
      return;
    }

    if (!selectedArea._id && !isTestMode) {
      toast.error(t("checkout_select_area"));
      return;
    }

    const body = {
      products: cart.products.map((p) => ({
        productId: p.productId._id,
        quantity: p.quantity,
        isSpicy: p.isSpicy || false,
        additions: p.additions || [],
        notes: p.notes || "",
        selectedProtein: p.selectedProtein,
        selectedType: p.selectedType,
      })),
      userId: user?._id,
      shippingAddress: selectedArea._id,
      orderType,
      userDetails: details,
    };

    if (isTestMode) {
      body.isTest = true;
      body.products = [{ productId: TEST_PRODUCT_ID, quantity: 1, price: 1 }];
      body.totalPrice = 1;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const sessionId = `${now.getDate()}${now.getMonth() + 1}-${Math.floor(1000 + Math.random() * 9000)}`;
      const sessionDescription = isTestMode ? "Test" : cart.products.map((p) => p.productId.name.ar).join(" / ");

      const orderData = {
        ...body,
        totalPrice: totalWithDelivery,
        paymentMethod: paymentMethod,
      };
      sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));

      const amountToPay = isTestMode ? 1 : totalWithDelivery;

      const paymentResponse = await fetch(
        `${import.meta.env.VITE_BASE_URL}/montypay/session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountToPay,
            customerName: details.name,
            customerEmail: user?.email || "test@example.com",
            orderId: sessionId,
            description: sessionDescription,
          }),
        },
      );

      const paymentData = await paymentResponse.json();

      if (paymentData.redirect_url) {
        window.location.href = paymentData.redirect_url;
      } else {
        console.error("MontyPay Error:", paymentData);
        toast.error("Payment initialization failed");
        sessionStorage.removeItem("pendingOrder");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("checkout_failed"));
      sessionStorage.removeItem("pendingOrder");
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error}</p></div>;

  return (
    <form
      className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50"
      onSubmit={handlePlaceOrder}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-18">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("complete_order")}
            {isTestMode && <span className="text-red-500 text-lg block">(Test Mode Active)</span>}
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* 1. Delivery Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              {t("checkout_delivery_details")}
            </h2>

            <div className="space-y-6">
              {DETAILS.map((detail, index) => (
                <div key={index} className="space-y-2">
                  <label htmlFor={detail.label} className="block text-sm font-semibold text-gray-700">
                    {detail.name} {detail.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 hover:bg-white"
                    id={detail.label}
                    type={detail.type}
                    required={detail.required}
                    placeholder={`${detail.name.toLowerCase()}`}
                    defaultValue={detail.defaultValue || ""}
                    readOnly={detail.readOnly || false}
                    onChange={(e) => setDetails({ ...details, [detail.label]: e.target.value })}
                  />
                </div>
              ))}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t("checkout_order_type")} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="orderType" value="pickup" checked={orderType === "pickup"} onChange={() => { setOrderType("pickup"); setSelectedArea({ name: "بدون توصيل", deliveryCost: 0, _id: "68d860d988e6a681633f5152" }); }} className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500" />
                    <span>{t("checkout_pickup")}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="orderType" value="delivery" checked={orderType === "delivery"} onChange={() => setOrderType("delivery")} className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500" />
                    <span>{t("checkout_delivery")}</span>
                  </label>
                </div>
              </div>

              {orderType === "delivery" && (
                <div className="space-y-2">
                  <label htmlFor="area" className="block text-sm font-semibold text-gray-700">
                    {t("checkout_select_area_text")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 hover:bg-white"
                    id="area"
                    required={!isTestMode}
                    onChange={(e) => { const selected = areas.find((a) => a.name === e.target.value); setSelectedArea(selected); }}
                  >
                    <option value="">{t("checkout_select_area_text")}</option>
                    {areas?.map((area, i) => (
                      <option key={i} value={area.name}>{area.name} - {area.deliveryCost.toFixed(2)} JOD</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 2. Order Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              {t("checkout_order_summary")}
            </h2>

            <div className="space-y-6">
              {cart.products.map((product, index) => {
                // Calculate individual item prices for display
                let itemBase = Number(product.productId.basePrice || 0);
                if (product.productId.hasProteinChoices && product.selectedProtein && product.productId.prices?.[product.selectedProtein]) {
                  if (product.productId.hasTypeChoices && product.selectedType) {
                    itemBase = Number(product.productId.prices[product.selectedProtein][product.selectedType] || itemBase);
                  } else {
                    itemBase = Number(product.productId.prices[product.selectedProtein] || itemBase);
                  }
                } else if (product.productId.hasTypeChoices && product.selectedType && product.productId.prices?.[product.selectedType]) {
                  itemBase = Number(product.productId.prices[product.selectedType] || itemBase);
                }

                const discount = product.productId.discount || 0;
                const additionsCost = product.additions.reduce((s, a) => s + Number(a.price), 0);

                const finalItemPrice = ((itemBase * (1 - discount / 100)) + additionsCost) * product.quantity;
                const originalItemPrice = (itemBase + additionsCost) * product.quantity;

                return (
                  <div key={index} className="py-3 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{product.productId.name[selectedLanguage]}</p>
                        <p className="text-sm text-gray-500">{t("qty")}: {product.quantity}</p>

                        <div className="flex gap-1 mt-1 flex-wrap">
                          {product.productId.isSpicy && <Badge variant="secondary">{product.isSpicy ? "حار" : "عادي"}</Badge>}
                          {product.selectedType && <Badge variant="secondary">{t(product.selectedType)}</Badge>}
                          {product.selectedProtein && <Badge variant="secondary">{t(product.selectedProtein)}</Badge>}
                        </div>

                        {product.additions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {product.additions.map((addition, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {addition.name[selectedLanguage]}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {product.notes && <p className="text-sm text-gray-500 italic mt-1">{t("notes")}: {product.notes}</p>}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {discount > 0 ? (
                          <>
                            <span className="font-bold text-gray-900">{finalItemPrice.toFixed(2)} JOD</span>
                            <span className="text-xs text-gray-400 line-through">{originalItemPrice.toFixed(2)} JOD</span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-900">{finalItemPrice.toFixed(2)} JOD</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("subtotal")}:</span>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold">{orderSummary.finalSubtotal.toFixed(2)} JOD</span>
                    {orderSummary.savings > 0 && (
                      <span className="text-xs text-gray-400 line-through">{orderSummary.originalSubtotal.toFixed(2)} JOD</span>
                    )}
                  </div>
                </div>

                {orderSummary.savings > 0 && (
                  <div className="flex justify-between items-center text-green-600 bg-green-50 px-2 py-1 rounded">
                    <span className="text-sm font-medium">{t("you_save")}:</span>
                    <span className="font-bold text-sm">{orderSummary.savings.toFixed(2)} JOD</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("delivery")}:</span>
                  <span className="font-semibold text-green-600">
                    {deliveryCost.toFixed(2)} JOD
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-gray-200">
                  <span>{t("total")}:</span>
                  <span className="text-red-600">{totalWithDelivery.toFixed(2)} JOD</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 text-xs md:text-sm">{t("checkout_payment_method")}</h3>
                <div className="space-y-2">
                  {/* Card Payment */}
                  <div className={`flex items-center gap-2 p-2.5 border rounded-xl transition-all ${paymentMethod === "card" ? "border-red-500 bg-red-50/30" : "border-gray-200"}`}>
                    <input type="radio" id="card" name="PM" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="text-red-500 w-3.5 h-3.5" />
                    <label htmlFor="card" className="flex-1 font-medium text-gray-700 cursor-pointer text-[11px] md:text-sm">{t("checkout_card_payment")}</label>
                    <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded border border-gray-50 shrink-0">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-2 md:h-2.5 w-auto" alt="Visa" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-3 md:h-3.5 w-auto" alt="Mastercard" />
                    </div>
                  </div>

                  {/* CliQ Payment (Disabled) */}
                  <div className="flex relative items-center gap-3 p-3 pt-9 border border-gray-200 rounded-lg hover:border-red-300 transition-colors opacity-80 bg-gray-50/50">
                    <Badge className="text-sm absolute top-0 right-0 text-white font-medium mt-1">{t("checkout_click_coming_soon")}</Badge>
                    <input className="w-4 h-4 text-red-500 border-gray-300 cursor-not-allowed" id="click" name="PM" type="radio" disabled={true} onClick={() => toast.error(t("cliq_unavailable_msg"))} />
                    <div className="flex-1">
                      <label htmlFor="click" className="font-medium text-gray-700 cursor-not-allowed block">{t("checkout_click_payment")}</label>
                    </div>
                    <img src={cliq} className="w-12 h-auto object-contain grayscale" alt="CliQ Payment" />
                  </div>
                </div>
              </div>

              <button
                className={`w-full bg-gradient-to-r ${isSubmitting ? "from-gray-500 to-gray-600" : "from-red-500 to-red-600"} text-white py-4 px-8 rounded-xl font-bold text-lg transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl`}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جار انشاء الطلب..." : `🍽️ ${t("checkout_place_order")} - ${totalWithDelivery.toFixed(2)} JOD`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Checkout;