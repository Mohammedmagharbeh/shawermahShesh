import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrder } from "@/contexts/OrderContext";
import Loading from "@/components/common/Loading";
import product_placeholder from "@/assets/product_placeholder.jpeg";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";
import { ChevronDown } from "lucide-react";
import {
  getOrderStatusOptions,
  getOrderStatusLabel,
  ORDER_STATUS_COLORS,
} from "@/constants";

const statusColors = {
  Processing: "bg-secondary text-secondary-foreground",
  Confirmed: "bg-purple-500 text-primary-foreground",
  Shipped: "bg-blue-500 text-white",
  OutForDelivery: "bg-orange-500 text-white",
  ReadyForPickup: "bg-yellow-500 text-black",
  Delivered: "bg-green-600 text-white",
  Cancelled: "bg-destructive text-destructive-foreground",
};

// اسم القناة لطلبات اشبك: اسم عربي للمعروف، وغير هيك بنعرض الكود زي ما هو
const channelLabels = {
  CALL_CENTER: "كول سنتر",
  TALABAT: "طلبات",
};

// يحسب المجموع الفرعي قبل الخصم + نسبة الخصم الفعلية من بيانات الطلب
function getPromoBreakdown(order) {
  const discountAmount = Number(order.discountAmount || 0);
  const deliveryCost = Number(order.shippingAddress?.deliveryCost || 0);
  const additionsTotal = (order.products || []).reduce((total, item) => {
    const itemAdditionsTotal = (item.additions || []).reduce(
      (sum, add) => sum + (add.price || 0),
      0,
    );
    return total + itemAdditionsTotal * item.quantity;
  }, 0);

  // السعر قبل الخصم = السعر النهائي + الخصم (لأن totalPrice = subtotal - discount + delivery)
  const subtotalBeforeDiscount =
    order.totalPrice - deliveryCost + discountAmount;

  const discountPercentage =
    subtotalBeforeDiscount > 0
      ? Math.round((discountAmount / subtotalBeforeDiscount) * 100)
      : 0;

  return {
    discountAmount,
    additionsTotal,
    subtotalBeforeDiscount,
    discountPercentage,
    hasPromo: !!order.promoCode && discountAmount > 0,
  };
}

// منطقة التوصيل
function getOrderArea(order) {
  return order.shippingAddress?.name || order.userDetails?.apartment || "";
}

// طباعة الفاتورة (نفس منطق الداشبورد)
function printOrderInvoice(order, t, selectedLanguage) {
  const customerPhone =
    order.userId?.phone || order.userDetails?.phone || "N/A";
  const customerName = order.userDetails?.name || "N/A";
  const deliveryType =
    order.orderType === "delivery" ? t("delivery") : t("pickup");
  const area = getOrderArea(order);

  const discountRow =
    order.discountAmount > 0
      ? `<p style="display:flex; justify-content:space-between; color:#15803d;"><strong>${t("promo_discount") || "خصم الكود"}${order.promoCode ? ` (${order.promoCode})` : ""}:</strong> <span>- ${Number(order.discountAmount).toFixed(2)} JOD</span></p>`
      : "";

  const areaRow =
    order.orderType === "delivery" && area
      ? `<p style="text-align:center; font-size:14px; background:#f9f9f9; padding:4px;"><strong>${t("area")}:</strong> ${area}</p>`
      : "";

  const rows = (order.products || [])
    .map((item, idx) => {
      const additions =
        item.additions?.length > 0
          ? `<div style="font-size:12px; color:#555;">+ ${item.additions.map((a) => a.name?.[selectedLanguage]).join(", ")}</div>`
          : "";
      const protein = item.selectedProtein
        ? `<div style="font-size:13px; color:#000; font-weight:bold; margin-top:2px;">${t("protein")}: ${t(item.selectedProtein.toLowerCase())}</div>`
        : "";
      const spicy = item.isSpicy
        ? `<div style="color:red; font-size:12px;">${t("spicy")}</div>`
        : "";
      // ملاحظات المنتج + ملاحظة الطلب العامة (اشبك) مع بعض
      const allNotes = [item.notes, idx === 0 ? order.orderNote : ""]
        .filter(Boolean)
        .join(" - ");
      const notes = allNotes
        ? `<div style="font-size:12px; color:#777;">${t("notes")}: ${allNotes}</div>`
        : "";

      return `
        <tr>
          <td style="padding:6px; border-bottom:1px solid #eee;">
            ${item.productId?.name?.[selectedLanguage] || item.name?.[selectedLanguage] || "Unknown"}
            ${additions}${protein}${spicy}${notes}
          </td>
          <td style="text-align:center; padding:6px; border-bottom:1px solid #eee;">${item.quantity}</td>
          <td style="text-align:left; padding:6px; border-bottom:1px solid #eee;">${(item.priceAtPurchase * item.quantity).toFixed(2)} JOD</td>
        </tr>`;
    })
    .join("");

  const subtotal = (
    order.totalPrice -
    (order.shippingAddress?.deliveryCost || 0) +
    (order.discountAmount || 0)
  ).toFixed(2);

  const invoiceHtml = `
    <div style="direction:rtl; font-family:Tahoma, sans-serif; width:100%; max-width:480px; margin:auto; padding:16px; border:1px solid #ccc; background:#fff;">
      <h2 style="text-align:center; margin-bottom:8px;">${t("invoice_title")} #${order.sequenceNumber}</h2>
      <p style="text-align:center; font-size:14px;"><strong>${t("invoice_customer")}</strong> ${customerName}</p>
      <p style="text-align:center; font-size:14px;"><strong>${t("invoice_phone")}</strong> ${customerPhone}</p>
      <p style="text-align:center; font-size:14px;"><strong>${t("order_type")}</strong> ${deliveryType}</p>
      ${areaRow}
      <hr/>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="padding:6px; border-bottom:1px solid #000; text-align:right;">${t("product")}</th>
            <th style="padding:6px; border-bottom:1px solid #000; text-align:center;">${t("quantity")}</th>
            <th style="padding:6px; border-bottom:1px solid #000; text-align:left;">${t("price")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:10px; font-size:14px;">
        <p style="display:flex; justify-content:space-between;"><strong>${t("subtotal")}:</strong> <span>${subtotal} JOD</span></p>
        ${discountRow}
        <p style="display:flex; justify-content:space-between;"><strong>${t("delivery")}:</strong> <span>${order.shippingAddress?.deliveryCost || 0} JOD</span></p>
        <p style="display:flex; justify-content:space-between; font-weight:bold; font-size:16px;"><strong>${t("total")}:</strong> <span>${order.totalPrice.toFixed(2)} JOD</span></p>
      </div>
      <hr />
      <p style="text-align:center; font-weight:bold;"> ${t("invoice_thank_you")} </p>
    </div>`;

  const printWindow = window.open("", "", "width=400,height=600");
  if (!printWindow) return;
  printWindow.document.write(
    `<html><head><title>فاتورة</title><meta charset="UTF-8" /></head><body>${invoiceHtml}</body></html>`,
  );
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

function Orders() {
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const {
    orders,
    getAllOrders,
    updateOrder,
    deleteOrder,
    loading,
    ordersPagination,
  } = useOrder();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // الطلبات المفتوحة (المنتجات ظاهرة)
  const [expandedOrders, setExpandedOrders] = useState({});
  const toggleOrder = (id) =>
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  // Debounce search to avoid hammering the server on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Reset to page 1 whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    getAllOrders({ page: currentPage, search: debouncedSearch || undefined });
  }, [currentPage, debouncedSearch]);

  const handleStatusChange = (orderId, newStatus) => {
    const updatePayload = { status: newStatus };
    if (newStatus === "Confirmed" && (user?.name || user?.username)) {
      updatePayload.confirmedBy = user.name || user.username;
    }
    updateOrder(orderId, updatePayload);
  };

  const handlePaymentStatusChange = (orderId, newPaymentStatus) => {
    const orderToUpdate = orders.find((o) => o._id === orderId);
    if (!orderToUpdate) return;

    updateOrder(orderId, {
      payment: {
        ...orderToUpdate.payment,
        status: newPaymentStatus,
        paidAt:
          newPaymentStatus === "paid"
            ? new Date()
            : orderToUpdate.payment?.paidAt,
      },
    });
  };

  // Orders come pre-sorted from the server; no client-side sort needed.
  // Client-side filtering is removed — search is now server-driven.
  const filteredOrders = orders;

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("all_orders")}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {t("total_orders")}:{" "}
              <span className="font-semibold text-primary">
                {ordersPagination.total}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder={t("search_order_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-4 py-2 rounded-lg text-sm w-full md:w-80 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              {t("no_orders_found")}
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const promo = getPromoBreakdown(order);
              const area = getOrderArea(order);
              const isOpen = !!expandedOrders[order._id];

              return (
                <Card
                  key={order._id}
                  className="overflow-hidden border-2 transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="border-b bg-muted/20 pb-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {t("order_id")}:
                          </span>
                          <span className="font-mono font-bold">
                            #{order.sequenceNumber}
                          </span>
                          {/* علامة تدل إن الطلب جاي من اشبك + القناة */}
                          {order.source === "ishbek" && (
                            <>
                              <Badge className="bg-orange-500 text-white">
                                Talabat
                              </Badge>
                              {order.channel && (
                                <Badge className="bg-slate-700 text-white">
                                  {channelLabels[
                                    String(order.channel).toUpperCase()
                                  ] || order.channel}
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {t("customer")}:
                          </span>
                          <span className="text-sm font-semibold">
                            {order.userDetails?.name} (
                            {order.userId?.phone || order.userDetails?.phone})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {t("date")}:
                          </span>
                          <span className="text-sm">
                            {new Date(order.createdAt).toLocaleString(
                              `${selectedLanguage}-GB`,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {t("order_type")}:
                          </span>
                          <span className="text-sm">
                            {order.orderType === "delivery"
                              ? `${t("delivery")}${area ? ` - ${area}` : ""}`
                              : t("pickup")}
                          </span>
                        </div>
                        {/* منطقة التوصيل + العنوان المفصل */}
                        {order.orderType === "delivery" && area && (
                          <div className="flex items-center gap-2 flex-wrap md:col-span-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {t("address")}:
                            </span>
                            <Badge className="bg-blue-100 text-blue-800">
                              {area}
                            </Badge>
                            {order.userDetails?.apartment &&
                              order.userDetails.apartment !== area && (
                                <span className="text-sm text-foreground">
                                  ({order.userDetails.apartment})
                                </span>
                              )}
                          </div>
                        )}
                        {order.confirmedBy && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {t("confirmed_by")}:
                            </span>
                            <span className="text-sm font-medium text-purple-600">
                              {order.confirmedBy}
                            </span>
                          </div>
                        )}
                        {/* كود الخصم + نسبته + مقداره بالدينار */}
                        {promo.hasPromo && (
                          <div className="flex items-center gap-2 flex-wrap md:col-span-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {t("promo_code") || "كود الخصم"}:
                            </span>
                            <Badge className="bg-amber-100 text-amber-800 font-mono">
                              {order.promoCode}
                            </Badge>
                            <Badge className="bg-amber-100 text-amber-800">
                              {promo.discountPercentage}%
                            </Badge>
                            <Badge className="bg-green-100 text-green-800">
                              -{promo.discountAmount.toFixed(2)} JOD
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Select
                          value={order.payment?.status || "unpaid"}
                          onValueChange={(value) =>
                            handlePaymentStatusChange(order._id, value)
                          }
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue>
                              <Badge
                                className={
                                  order.payment?.status === "paid"
                                    ? "bg-green-600 text-white"
                                    : "bg-secondary text-secondary-foreground"
                                }
                              >
                                {order.payment?.status
                                  ? t(order.payment.status)
                                  : t("unpaid")}{" "}
                                ({order.payment?.method || "N/A"})
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">
                              {t("unpaid")}
                            </SelectItem>
                            <SelectItem value="paid">{t("paid")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={order.status}
                          onValueChange={(val) =>
                            handleStatusChange(order._id, val)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue>
                              <Badge
                                className={
                                  ORDER_STATUS_COLORS[order.status] ||
                                  statusColors[order.status] ||
                                  "bg-gray-500"
                                }
                              >
                                {getOrderStatusLabel(
                                  order.status,
                                  order.orderType,
                                  t,
                                )}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {getOrderStatusOptions(order.orderType).map(
                              (opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {t(opt.labelKey, opt.defaultLabel)}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* زر فتح/إغلاق المنتجات */}
                    <button
                      type="button"
                      onClick={() => toggleOrder(order._id)}
                      className="mb-4 flex w-full items-center justify-between rounded-lg border bg-muted/30 px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors"
                    >
                      <span>
                        {t("products") || "المنتجات"} (
                        {order.products?.length || 0})
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="space-y-4">
                        {order.products?.map((item, idx) => (
                          <div
                            key={item._id}
                            className="flex items-center justify-between gap-4 rounded-lg border p-4 bg-muted/30"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={
                                  item.productId?.image || product_placeholder
                                }
                                className="h-16 w-16 rounded-md object-cover border"
                                onError={(e) => {
                                  e.target.src = product_placeholder;
                                }}
                              />
                              <div className="flex flex-col gap-1">
                                <p className="font-semibold">
                                  {item.productId?.name?.[selectedLanguage] ||
                                    item.name?.[selectedLanguage] ||
                                    t("deleted_product")}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {t("quantity")}: {item.quantity}
                                </p>

                                {/* عرض البروتين */}
                                {item.selectedProtein && (
                                  <div className="mt-1">
                                    <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                                      {t(item.selectedProtein.toLowerCase())}
                                    </span>
                                  </div>
                                )}

                                {/* الإضافات */}
                                {item.additions?.length > 0 && (
                                  <div className="flex gap-1 flex-wrap mt-1">
                                    {item.additions.map((a) => (
                                      <Badge
                                        key={a._id}
                                        variant="secondary"
                                        className="text-[10px]"
                                      >
                                        {a.name?.[selectedLanguage]}
                                        {a.price > 0 &&
                                          ` (+${a.price.toFixed(2)})`}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* الملاحظات و Spicy */}
                                <div className="flex gap-2 items-center mt-1">
                                  {item.isSpicy && (
                                    <Badge
                                      variant="destructive"
                                      className="text-[10px]"
                                    >
                                      {t("spicy")}
                                    </Badge>
                                  )}
                                  {/* ملاحظات المنتج + ملاحظة الطلب العامة (اشبك) مع بعض */}
                                  {(item.notes ||
                                    (idx === 0 && order.orderNote)) && (
                                    <Badge className="bg-[#FFC400] text-black font-bold text-[10px] hover:bg-[#FFC400]">
                                      {t("notes")}:{" "}
                                      {[
                                        item.notes,
                                        idx === 0 ? order.orderNote : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" - ")}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">
                                {item.priceAtPurchase} JOD
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ملخص السعر */}
                    <div className="mt-6 border-t pt-4 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t("order_subtotal")}:
                        </span>
                        <span>
                          {(
                            promo.subtotalBeforeDiscount - promo.additionsTotal
                          ).toFixed(2)}{" "}
                          JOD
                        </span>
                      </div>

                      {promo.additionsTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("additions")}:
                          </span>
                          <span className="text-blue-600">
                            +{promo.additionsTotal.toFixed(2)} JOD
                          </span>
                        </div>
                      )}

                      {/* سطر خصم واضح فيه الكود، النسبة، والمبلغ */}
                      {promo.hasPromo && (
                        <div className="flex justify-between items-center text-sm bg-green-50 -mx-2 px-2 py-1.5 rounded-md">
                          <span className="text-green-700 font-medium">
                            {t("promo_discount") || "خصم الكود"} (
                            {order.promoCode} — {promo.discountPercentage}%):
                          </span>
                          <span className="font-bold text-green-700">
                            - {promo.discountAmount.toFixed(2)} JOD
                          </span>
                        </div>
                      )}

                      {order.orderType === "delivery" && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("delivery_cost")}:
                          </span>
                          <span>
                            {order.shippingAddress?.deliveryCost || 0} JOD
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-bold">
                          {promo.hasPromo
                            ? `${t("order_total")} (${t("after_discount") || "بعد الخصم"})`
                            : t("order_total")}
                          :
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {order.totalPrice.toFixed(2)} JOD
                        </span>
                      </div>
                    </div>

                    {/* زر طباعة الفاتورة */}
                    <div className="mt-6 flex justify-end border-t pt-4">
                      <Button
                        variant="outline"
                        className="border-primary text-primary"
                        onClick={() =>
                          printOrderInvoice(order, t, selectedLanguage)
                        }
                      >
                        {t("print_invoice")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination controls */}
        {ordersPagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8 pb-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
            >
              {t("prev") || "السابق"}
            </button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {ordersPagination.pages}
              <span className="ml-2 text-xs">
                ({ordersPagination.total} {t("total_orders") || "طلب"})
              </span>
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(ordersPagination.pages, p + 1))
              }
              disabled={currentPage === ordersPagination.pages}
              className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
            >
              {t("next") || "التالي"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
