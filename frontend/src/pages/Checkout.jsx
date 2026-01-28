import Loading from "@/componenet/common/Loading";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import cliq from "../../src/assets/cliq.png";
import { useCart } from "@/contexts/CartContext";
import { useCheckoutLogic } from "../hooks/useCheckoutLogic"; // Import the hook above

function Checkout() {
  const { t } = useTranslation();
  const { cart } = useCart();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  const {
    areas, isLoading, error, isSubmitting, isTestMode,
    formState, updateForm, updateDetails, confirmCliqPayment,
    orderSummary, handlePayment
  } = useCheckoutLogic(t);

  if (isLoading) return <Loading />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <form className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50" onSubmit={handlePayment}>

      {/* CliQ OTP Modal / Overlay */}
      {formState.paymentMethod === "cliq" && formState.cliqStep === "OTP_SENT" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Enter Verification Code</h3>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full px-4 py-3 border rounded-lg mb-4"
              value={formState.otp}
              onChange={(e) => updateForm("otp", e.target.value)}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => updateForm("cliqStep", "INIT")} className="flex-1 bg-gray-200 py-3 rounded-lg font-bold">Cancel</button>
              <button type="button" onClick={confirmCliqPayment} disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold">
                {isSubmitting ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-18">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("complete_order")}
            {isTestMode && <span className="text-red-500 text-lg block">(Test Mode Active)</span>}
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* LEFT: Form Details */}
          <DeliverySection
            t={t}
            areas={areas}
            formState={formState}
            updateForm={updateForm}
            updateDetails={updateDetails}
            isTestMode={isTestMode}
          />

          {/* RIGHT: Summary & Payment */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              {t("checkout_order_summary")}
            </h2>

            <OrderItemsList cart={cart} t={t} lang={selectedLanguage} />

            <OrderTotals summary={orderSummary} t={t} />

            <PaymentMethodSelector
              method={formState.paymentMethod}
              setMethod={(val) => updateForm("paymentMethod", val)}
              t={t}
            />

            <button
              className={`w-full mt-6 bg-gradient-to-r ${isSubmitting ? "from-gray-500 to-gray-600" : "from-red-500 to-red-600"} text-white py-4 px-8 rounded-xl font-bold text-lg transform hover:scale-[1.02] transition-all duration-200 shadow-lg`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : `🍽️ ${t("checkout_place_order")} - ${orderSummary.total.toFixed(2)} JOD`}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// --- Sub Components (Internal for cleanliness) ---

const DeliverySection = ({ t, areas, formState, updateForm, updateDetails, isTestMode }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100 h-fit">
    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
      <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
      {t("checkout_delivery_details")}
    </h2>
    <div className="space-y-6">
      <InputField label="name" title={t("checkout_name")} value={formState.details.name} onChange={(v) => updateDetails("name", v)} required />
      <InputField label="apartment" title={`${t("checkout_apartment_floor")} (${t("checkout_optional")})`} value={formState.details.apartment} onChange={(v) => updateDetails("apartment", v)} />
      <InputField label="phone" title={t("checkout_phone")} value={formState.details.phone} readOnly />

      {/* Order Type */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">{t("checkout_order_type")} <span className="text-red-500">*</span></label>
        <div className="flex gap-6">
          <RadioOption label={t("checkout_pickup")} checked={formState.orderType === "pickup"} onChange={() => { updateForm("orderType", "pickup"); updateForm("selectedArea", null); }} />
          <RadioOption label={t("checkout_delivery")} checked={formState.orderType === "delivery"} onChange={() => updateForm("orderType", "delivery")} />
        </div>
      </div>

      {/* Area Selector */}
      {formState.orderType === "delivery" && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">{t("checkout_select_area_text")} <span className="text-red-500">*</span></label>
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
            required={!isTestMode}
            onChange={(e) => updateForm("selectedArea", areas.find(a => a.name === e.target.value))}
            value={formState.selectedArea?.name || ""}
          >
            <option value="">{t("checkout_select_area_text")}</option>
            {areas.map((area, i) => (
              <option key={i} value={area.name}>{area.name} - {area.deliveryCost.toFixed(2)} JOD</option>
            ))}
          </select>
        </div>
      )}
    </div>
  </div>
);

const OrderItemsList = ({ cart, t, lang }) => (
  <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
    {cart.products.map((item, index) => (
      <div key={index} className="py-3 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-gray-900">{item.productId.name[lang]}</p>
            <p className="text-sm text-gray-500">{t("qty")}: {item.quantity}</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {item.productId.isSpicy && <Badge variant="secondary">{item.isSpicy ? "Hot" : "Normal"}</Badge>}
              {item.selectedType && <Badge variant="secondary">{t(item.selectedType)}</Badge>}
              {item.selectedProtein && <Badge variant="secondary">{t(item.selectedProtein)}</Badge>}
              {item.additions?.map((add, i) => <Badge key={i} variant="outline">{add.name[lang]}</Badge>)}
            </div>
            {item.notes && <p className="text-xs text-gray-400 mt-1 italic">Note: {item.notes}</p>}
          </div>
        </div>
      </div>
    ))}
  </div>
);

const OrderTotals = ({ summary, t }) => (
  <div className="space-y-3 pt-4 border-t border-gray-200 mt-4">
    <Row label={t("subtotal")} value={summary.subtotal} />
    {summary.savings > 0 && (
      <div className="flex justify-between text-green-600 bg-green-50 px-2 py-1 rounded">
        <span className="text-sm">{t("you_save")}:</span>
        <span className="font-bold">{summary.savings.toFixed(2)} JOD</span>
      </div>
    )}
    <Row label={t("delivery")} value={summary.deliveryCost} isGreen />
    <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-gray-200">
      <span>{t("total")}:</span>
      <span className="text-red-600">{summary.total.toFixed(2)} JOD</span>
    </div>
  </div>
);

const PaymentMethodSelector = ({ method, setMethod, t }) => (
  <div className="pt-6 border-t border-gray-200 mt-4">
    <h3 className="font-semibold text-gray-900 mb-4 text-xs md:text-sm">{t("checkout_payment_method")}</h3>
    <div className="space-y-2">
      <div
        onClick={() => setMethod("card")}
        className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer ${method === "card" ? "border-red-500 bg-red-50/30" : "border-gray-200"}`}
      >
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${method === "card" ? "border-red-500" : "border-gray-400"}`}>
          {method === "card" && <div className="w-2 h-2 bg-red-500 rounded-full" />}
        </div>
        <span className="flex-1 font-medium text-sm">{t("checkout_card_payment")}</span>
        <div className="flex gap-1">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="Visa" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="MC" />
        </div>
      </div>

      <div
        onClick={() => setMethod("cliq")}
        className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer ${method === "cliq" ? "border-red-500 bg-red-50/30" : "border-gray-200"}`}
      >
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${method === "cliq" ? "border-red-500" : "border-gray-400"}`}>
          {method === "cliq" && <div className="w-2 h-2 bg-red-500 rounded-full" />}
        </div>
        <span className="flex-1 font-medium text-sm">{t("checkout_click_payment")}</span>
        <img src={cliq} className="w-8" alt="CliQ" />
      </div>
    </div>
  </div>
);

// --- Small UI Helpers ---
const InputField = ({ label, title, value, onChange, required, readOnly }) => (
  <div className="space-y-2">
    <label htmlFor={label} className="block text-sm font-semibold text-gray-700">
      {title} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={label}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange && onChange(e.target.value)}
      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-colors ${readOnly ? "bg-gray-100 text-gray-500" : "bg-gray-50 hover:bg-white"}`}
    />
  </div>
);

const RadioOption = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="radio" checked={checked} onChange={onChange} className="w-4 h-4 text-red-500 focus:ring-red-500" />
    <span>{label}</span>
  </label>
);

const Row = ({ label, value, isGreen }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">{label}:</span>
    <span className={`font-semibold ${isGreen ? "text-green-600" : ""}`}>{Number(value).toFixed(2)} JOD</span>
  </div>
);

export default Checkout;