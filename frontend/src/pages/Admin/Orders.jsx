// import { useEffect, useState } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useOrder } from "@/contexts/OrderContext";
// import Loading from "@/components/common/Loading";
// import product_placeholder from "@/assets/product_placeholder.jpeg";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import { useTranslation } from "react-i18next";
// import { useUser } from "@/contexts/UserContext";

// const statusColors = {
//   Processing: "bg-secondary text-secondary-foreground",
//   Confirmed: "bg-purple-500 text-primary-foreground",
//   Shipped: "bg-blue-500 text-white",
//   OutForDelivery: "bg-orange-500 text-white",
//   ReadyForPickup: "bg-yellow-500 text-black",
//   Delivered: "bg-green-600 text-white",
//   Cancelled: "bg-destructive text-destructive-foreground",
// };

// function Orders() {
//   const { t } = useTranslation();
//   const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
//   const {
//     orders,
//     getAllOrders,
//     updateOrder,
//     deleteOrder,
//     loading,
//     ordersPagination,
//   } = useOrder();
//   const { user } = useUser();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   // Debounce search to avoid hammering the server on every keystroke
//   const [debouncedSearch, setDebouncedSearch] = useState("");

//   useEffect(() => {
//     const id = setTimeout(() => setDebouncedSearch(searchTerm), 400);
//     return () => clearTimeout(id);
//   }, [searchTerm]);

//   // Reset to page 1 whenever the search term changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [debouncedSearch]);

//   useEffect(() => {
//     getAllOrders({ page: currentPage, search: debouncedSearch || undefined });
//   }, [currentPage, debouncedSearch]);

//   const handleStatusChange = (orderId, newStatus) => {
//     updateOrder(orderId, { status: newStatus });
//   };

//   const handlePaymentStatusChange = (orderId, newPaymentStatus) => {
//     const orderToUpdate = orders.find((o) => o._id === orderId);
//     if (!orderToUpdate) return;

//     updateOrder(orderId, {
//       payment: {
//         ...orderToUpdate.payment,
//         status: newPaymentStatus,
//         paidAt:
//           newPaymentStatus === "paid"
//             ? new Date()
//             : orderToUpdate.payment?.paidAt,
//       },
//     });
//   };

//   // Orders come pre-sorted from the server; no client-side sort needed.
//   // Client-side filtering is removed — search is now server-driven.
//   const filteredOrders = orders;

//   if (loading) return <Loading />;

//   return (
//     <div className="min-h-screen bg-background p-4 md:p-8">
//       <div className="mx-auto max-w-7xl">
//         <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">
//               {t("all_orders")}
//             </h1>
//             <p className="mt-1 text-muted-foreground">
//               {t("total_orders")}:{" "}
//               <span className="font-semibold text-primary">
//                 {ordersPagination.total}
//               </span>
//             </p>
//           </div>

//           <div className="flex items-center gap-3 w-full md:w-auto">
//             <input
//               type="text"
//               placeholder={t("search_order_placeholder")}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="border px-4 py-2 rounded-lg text-sm w-full md:w-80 focus:ring-2 focus:ring-primary outline-none"
//             />
//           </div>
//         </div>

//         <div className="space-y-4">
//           {filteredOrders.length === 0 ? (
//             <Card className="p-12 text-center text-muted-foreground">
//               {t("no_orders_found")}
//             </Card>
//           ) : (
//             filteredOrders.map((order) => (
//               <Card
//                 key={order._id}
//                 className="overflow-hidden border-2 transition-shadow hover:shadow-lg"
//               >
//                 <CardHeader className="border-b bg-muted/20 pb-4">
//                   <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-muted-foreground">
//                           {t("order_id")}:
//                         </span>
//                         <span className="font-mono font-bold">
//                           #{order.sequenceNumber}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-muted-foreground">
//                           {t("customer")}:
//                         </span>
//                         <span className="text-sm font-semibold">
//                           {order.userDetails?.name} ({order.userId?.phone})
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-muted-foreground">
//                           {t("date")}:
//                         </span>
//                         <span className="text-sm">
//                           {new Date(order.createdAt).toLocaleString(
//                             `${selectedLanguage}-GB`,
//                           )}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-muted-foreground">
//                           {t("order_type")}:
//                         </span>
//                         <span className="text-sm">
//                           {order.orderType === "delivery"
//                             ? t("delivery")
//                             : t("pickup")}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-3">
//                       <Select
//                         value={order.payment?.status || "unpaid"}
//                         onValueChange={(value) =>
//                           handlePaymentStatusChange(order._id, value)
//                         }
//                       >
//                         <SelectTrigger className="w-[160px]">
//                           <SelectValue>
//                             <Badge
//                               className={
//                                 order.payment?.status === "paid"
//                                   ? "bg-green-600 text-white"
//                                   : "bg-secondary text-secondary-foreground"
//                               }
//                             >
//                               {order.payment?.status
//                                 ? t(order.payment.status)
//                                 : t("unpaid")}{" "}
//                               ({order.payment?.method || "N/A"})
//                             </Badge>
//                           </SelectValue>
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="unpaid">{t("unpaid")}</SelectItem>
//                           <SelectItem value="paid">{t("paid")}</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <Select
//                         value={order.status}
//                         onValueChange={(val) =>
//                           handleStatusChange(order._id, val)
//                         }
//                       >
//                         <SelectTrigger className="w-[160px]">
//                           <SelectValue>
//                             <Badge className={statusColors[order.status]}>
//                               {t(order.status?.toLowerCase())}
//                             </Badge>
//                           </SelectValue>
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Processing">
//                             {t("processing")}
//                           </SelectItem>
//                           <SelectItem value="Confirmed">
//                             {t("confirmed")}
//                           </SelectItem>
//                           <SelectItem value="Shipped">
//                             {t("shipped")}
//                           </SelectItem>
//                           <SelectItem value="OutForDelivery">
//                             {t("outfordelivery")}
//                           </SelectItem>
//                           <SelectItem value="ReadyForPickup">
//                             {t("readyforpickup")}
//                           </SelectItem>
//                           <SelectItem value="Delivered">
//                             {t("delivered")}
//                           </SelectItem>
//                           <SelectItem value="Cancelled">
//                             {t("cancelled")}
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </CardHeader>

//                 <CardContent className="p-6">
//                   <div className="space-y-4">
//                     {order.products?.map((item) => (
//                       <div
//                         key={item._id}
//                         className="flex items-center justify-between gap-4 rounded-lg border p-4 bg-muted/30"
//                       >
//                         <div className="flex items-center gap-4">
//                           <img
//                             src={item.productId?.image || product_placeholder}
//                             className="h-16 w-16 rounded-md object-cover border"
//                             onError={(e) => {
//                               e.target.src = product_placeholder;
//                             }}
//                           />
//                           <div className="flex flex-col gap-1">
//                             <p className="font-semibold">
//                               {item.productId?.name[selectedLanguage] ||
//                                 t("deleted_product")}
//                             </p>
//                             <p className="text-sm text-muted-foreground">
//                               {t("quantity")}: {item.quantity}
//                             </p>

//                             {/* عرض البروتين */}
//                             {item.selectedProtein && (
//                               <div className="mt-1">
//                                 <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
//                                   {t(item.selectedProtein.toLowerCase())}
//                                 </span>
//                               </div>
//                             )}

//                             {/* الإضافات */}
//                             {item.additions?.length > 0 && (
//                               <div className="flex gap-1 flex-wrap mt-1">
//                                 {item.additions.map((a) => (
//                                   <Badge
//                                     key={a._id}
//                                     variant="secondary"
//                                     className="text-[10px]"
//                                   >
//                                     {a.name[selectedLanguage]}
//                                     {a.price > 0 && ` (+${a.price.toFixed(2)})`}
//                                   </Badge>
//                                 ))}
//                               </div>
//                             )}

//                             {/* الملاحظات و Spicy */}
//                             <div className="flex gap-2 items-center mt-1">
//                               {item.isSpicy && (
//                                 <Badge
//                                   variant="destructive"
//                                   className="text-[10px]"
//                                 >
//                                   {t("spicy")}
//                                 </Badge>
//                               )}
//                               {item.notes && (
//                                 <Badge className="bg-[#FFC400] text-black font-bold text-[10px] hover:bg-[#FFC400]">
//                                   {t("notes")}: {item.notes}
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="font-bold text-primary">
//                             {item.priceAtPurchase} JOD
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* ملخص السعر */}
//                   <div className="mt-6 border-t pt-4 space-y-1">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">
//                         {t("order_subtotal")}:
//                       </span>
//                       <span>
//                         {(
//                           order.totalPrice -
//                           (order.shippingAddress?.deliveryCost || 0) -
//                           order.products.reduce((total, item) => {
//                             const itemAdditionsTotal = item.additions.reduce(
//                               (sum, add) => sum + (add.price || 0),
//                               0,
//                             );
//                             return total + itemAdditionsTotal * item.quantity;
//                           }, 0)
//                         ).toFixed(2)}{" "}
//                         JOD
//                       </span>
//                     </div>
//                     {order.products.reduce((total, item) => {
//                       const itemAdditionsTotal = item.additions.reduce(
//                         (sum, add) => sum + (add.price || 0),
//                         0,
//                       );
//                       return total + itemAdditionsTotal * item.quantity;
//                     }, 0) > 0 && (
//                       <div className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">
//                           {t("additions")}:
//                         </span>
//                         <span className="text-blue-600">
//                           +
//                           {order.products
//                             .reduce((total, item) => {
//                               const itemAdditionsTotal = item.additions.reduce(
//                                 (sum, add) => sum + (add.price || 0),
//                                 0,
//                               );
//                               return total + itemAdditionsTotal * item.quantity;
//                             }, 0)
//                             .toFixed(2)}{" "}
//                           JOD
//                         </span>
//                       </div>
//                     )}
//                     {order.orderType === "delivery" && (
//                       <div className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">
//                           {t("delivery_cost")}:
//                         </span>
//                         <span>
//                           {order.shippingAddress?.deliveryCost || 0} JOD
//                         </span>
//                       </div>
//                     )}
//                     <div className="flex justify-between items-center border-t pt-2">
//                       <span className="font-bold">{t("order_total")}:</span>
//                       <span className="text-xl font-bold text-primary">
//                         {order.totalPrice.toFixed(2)} JOD
//                       </span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))
//           )}
//         </div>

//         {/* Pagination controls */}
//         {ordersPagination.pages > 1 && (
//           <div className="flex items-center justify-center gap-3 mt-8 pb-4">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
//             >
//               {t("prev") || "السابق"}
//             </button>
//             <span className="text-sm text-muted-foreground">
//               {currentPage} / {ordersPagination.pages}
//               <span className="ml-2 text-xs">
//                 ({ordersPagination.total} {t("total_orders") || "طلب"})
//               </span>
//             </span>
//             <button
//               onClick={() =>
//                 setCurrentPage((p) => Math.min(ordersPagination.pages, p + 1))
//               }
//               disabled={currentPage === ordersPagination.pages}
//               className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
//             >
//               {t("next") || "التالي"}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Orders;

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

const statusColors = {
  Processing: "bg-secondary text-secondary-foreground",
  Confirmed: "bg-purple-500 text-primary-foreground",
  Shipped: "bg-blue-500 text-white",
  OutForDelivery: "bg-orange-500 text-white",
  ReadyForPickup: "bg-yellow-500 text-black",
  Delivered: "bg-green-600 text-white",
  Cancelled: "bg-destructive text-destructive-foreground",
};

// ✅ جديد — يحسب المجموع الفرعي قبل الخصم + نسبة الخصم الفعلية من بيانات الطلب
// (بدون الحاجة لأي حقل إضافي بقاعدة البيانات غير discountAmount الموجود أصلاً)
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
    updateOrder(orderId, { status: newStatus });
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
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {t("customer")}:
                          </span>
                          <span className="text-sm font-semibold">
                            {order.userDetails?.name} ({order.userId?.phone})
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
                              ? t("delivery")
                              : t("pickup")}
                          </span>
                        </div>
                        {/* ✅ جديد — كود الخصم + نسبته + مقداره بالدينار */}
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
                            <SelectItem value="unpaid">{t("unpaid")}</SelectItem>
                            <SelectItem value="paid">{t("paid")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={order.status}
                          onValueChange={(val) =>
                            handleStatusChange(order._id, val)
                          }
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue>
                              <Badge className={statusColors[order.status]}>
                                {t(order.status?.toLowerCase())}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Processing">
                              {t("processing")}
                            </SelectItem>
                            <SelectItem value="Confirmed">
                              {t("confirmed")}
                            </SelectItem>
                            <SelectItem value="Shipped">
                              {t("shipped")}
                            </SelectItem>
                            <SelectItem value="OutForDelivery">
                              {t("outfordelivery")}
                            </SelectItem>
                            <SelectItem value="ReadyForPickup">
                              {t("readyforpickup")}
                            </SelectItem>
                            <SelectItem value="Delivered">
                              {t("delivered")}
                            </SelectItem>
                            <SelectItem value="Cancelled">
                              {t("cancelled")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {order.products?.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between gap-4 rounded-lg border p-4 bg-muted/30"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={item.productId?.image || product_placeholder}
                              className="h-16 w-16 rounded-md object-cover border"
                              onError={(e) => {
                                e.target.src = product_placeholder;
                              }}
                            />
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold">
                                {item.productId?.name[selectedLanguage] ||
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
                                      {a.name[selectedLanguage]}
                                      {a.price > 0 && ` (+${a.price.toFixed(2)})`}
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
                                {item.notes && (
                                  <Badge className="bg-[#FFC400] text-black font-bold text-[10px] hover:bg-[#FFC400]">
                                    {t("notes")}: {item.notes}
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

                      {/* ✅ جديد — سطر خصم واضح فيه الكود، النسبة، والمبلغ */}
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