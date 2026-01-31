import React, { useCallback } from "react";
import PropTypes from "prop-types";
import InputField from "./InputField";
import { ORDER_TYPES } from "./constants";
import { Store, Truck } from "lucide-react";

/**
 * Delivery section component with customer details and order type selection
 * Refactored for mobile-first with large touch targets for order type
 * @component
 */
const DeliverySection = React.memo(
  ({ t, areas, formState, updateForm, updateDetails, isTestMode }) => {
    // Memoize handlers to prevent recreation
    const handleOrderTypeChange = useCallback(
      (type) => {
        updateForm("orderType", type);
        if (type === ORDER_TYPES.PICKUP) {
          updateForm("selectedArea", null);
        }
      },
      [updateForm],
    );

    const handleAreaChange = useCallback(
      (e) => {
        const selectedArea = areas.find((a) => a.name === e.target.value);
        updateForm("selectedArea", selectedArea);
      },
      [areas, updateForm],
    );

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8 h-fit">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-sm">
            1
          </span>
          {t("checkout_delivery_details")}
        </h2>

        <div className="space-y-6">
          {/* Order Type Selection - Large Cards */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              {t("checkout_order_type")}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOrderTypeChange(ORDER_TYPES.PICKUP)}
                className={`
                      flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-200
                      ${
                        formState.orderType === ORDER_TYPES.PICKUP
                          ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                          : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:border-gray-200"
                      }
                   `}
              >
                <Store
                  className={`w-8 h-8 mb-2 ${formState.orderType === ORDER_TYPES.PICKUP ? "text-red-500" : "text-gray-400"}`}
                />
                <span className="font-bold text-sm sm:text-base">
                  {t("checkout_pickup")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleOrderTypeChange(ORDER_TYPES.DELIVERY)}
                className={`
                      flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-200
                      ${
                        formState.orderType === ORDER_TYPES.DELIVERY
                          ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                          : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:border-gray-200"
                      }
                   `}
              >
                <Truck
                  className={`w-8 h-8 mb-2 ${formState.orderType === ORDER_TYPES.DELIVERY ? "text-red-500" : "text-gray-400"}`}
                />
                <span className="font-bold text-sm sm:text-base">
                  {t("checkout_delivery")}
                </span>
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-6" />

          {/* Name Input */}
          <InputField
            label="name"
            title={t("checkout_name")}
            value={formState.details.name}
            onChange={(v) => updateDetails("name", v)}
            required
            placeholder={t("checkout_name")}
          />

          {/* Phone Input */}
          <InputField
            label="phone"
            title={t("checkout_phone")}
            value={formState.details.phone}
            readOnly
            placeholder={t("checkout_phone")}
          />

          {/* Apartment Input (Condition: Only show address fields if functionality implies need, usually always shown but maybe context dependent? Keeping standard) */}
          <InputField
            label="apartment"
            title={`${t("checkout_apartment_floor")} (${t("checkout_optional")})`}
            value={formState.details.apartment}
            onChange={(v) => updateDetails("apartment", v)}
            placeholder={t("checkout_apartment_floor")}
          />

          {/* Area Selector - Only show for delivery */}
          {formState.orderType === ORDER_TYPES.DELIVERY && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-semibold text-gray-700">
                {t("checkout_select_area_text")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-colors appearance-none cursor-pointer"
                  required={!isTestMode}
                  onChange={handleAreaChange}
                  value={formState.selectedArea?.name || ""}
                >
                  <option value="">{t("checkout_select_area_text")}</option>
                  {areas.map((area) => (
                    <option key={area._id || area.name} value={area.name}>
                      {area.name} - {area.deliveryCost.toFixed(2)} JOD
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

DeliverySection.displayName = "DeliverySection";

DeliverySection.propTypes = {
  t: PropTypes.func.isRequired,
  areas: PropTypes.array.isRequired,
  formState: PropTypes.object.isRequired,
  updateForm: PropTypes.func.isRequired,
  updateDetails: PropTypes.func.isRequired,
  isTestMode: PropTypes.bool.isRequired,
};

export default DeliverySection;
