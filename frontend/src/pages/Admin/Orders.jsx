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
// import { getProductPrice } from "@/constants";

// const statusColors = {
//   processing: "bg-secondary text-secondary-foreground",
//   confirmed: "bg-purple-500 text-primary-foreground",
//   shipped: "bg-blue-500 text-white",
//   delivered: "bg-green-600 text-white",
//   cancelled: "bg-destructive text-destructive-foreground",
// };

// function Orders() {
//   const { t } = useTranslation(); // <-- صح داخل الدالة

//   const { orders, getAllOrders, loading, updateOrder } = useOrder();
//   const [orderStatuses, setOrderStatuses] = useState({});
//   const [filterDate, setFilterDate] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

//   useEffect(() => {
//     getAllOrders();
//   }, []);

//   useEffect(() => {
//     if (orders) {
//       const initialStatuses = {};
//       orders.forEach((_, index) => {
//         initialStatuses[index] = "processing";
//       });
//       setOrderStatuses(initialStatuses);
//     }
//   }, [orders]);

//   const handleStatusChange = (index, id, newStatus) => {
//     setOrderStatuses((prev) => ({
//       ...prev,
//       [index]: newStatus,
//     }));
//     updateOrder(id, { status: newStatus });
//   };

//   const handleCancelOrder = (index) => {
//     handleStatusChange(index, orders[index]._id, "cancelled");
//   };

//   const exportToExcel = () => {
//     const data = filteredOrders.map((order, idx) => ({
//       "Order #": String(idx + 1).padStart(6, "0"),
//       "Order ID": order._id,
//       Date: order.createdAt
//         ? new Date(order.createdAt).toLocaleString()
//         : "N/A",
//       Status: order.status,
//       "Total Price": order.totalPrice,
//       Products:
//         order.products
//           ?.map(
//             (p) =>
//               `${p.productId?.name[selectedLanguage] || "Unknown"} x${p.quantity}`,
//           )
//           .join(", ") || "No Products",
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });
//     const dataBlob = new Blob([excelBuffer], {
//       type: "application/octet-stream",
//     });
//     saveAs(
//       dataBlob,
//       filterDate ? `Orders_${filterDate}.xlsx` : `Orders_All.xlsx`,
//     );
//   };

//   if (loading) return <Loading />;

//   // ✅ فلترة الطلبات: إذا في تاريخ محدد يظهر الطلبات لذلك اليوم، وإلا كل الطلبات
//   const filteredOrders = orders?.filter((order) => {
//     if (!order.createdAt) return false;

//     // Filter by selected date (if any)
//     const orderDate = new Date(order.createdAt);
//     const selectedDate = filterDate ? new Date(filterDate) : null;
//     const matchesDate =
//       !selectedDate ||
//       (orderDate.getDate() === selectedDate.getDate() &&
//         orderDate.getMonth() === selectedDate.getMonth() &&
//         orderDate.getFullYear() === selectedDate.getFullYear());

//     // Filter by selected category (if not "All")
//     const matchesCategory =
//       selectedCategory === "All" ||
//       order.status?.toLowerCase() === selectedCategory.toLowerCase();

//     return matchesDate && matchesCategory;
//   });

//   // ✅ ترجمة الحالات
//   const statusLabels = {
//     processing: t("processing"),
//     confirmed: t("confirmed"),
//     shipped: t("shipped"),
//     delivered: t("delivered"),
//     cancelled: t("cancelled"),
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="mx-auto max-w-7xl">
//         <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//           <div className="flex flex-col gap-2">
//             <h1 className="text-3xl font-bold text-foreground">
//               {t("order_management")}
//             </h1>
//             <p className="mt-1 text-muted-foreground">
//               {t("total_orders")}:
//               <span className="font-semibold text-primary">
//                 {filteredOrders?.length || 0}
//               </span>
//             </p>
//             {/* ✅ اختيار التاريخ */}
//             <div className="flex items-center gap-2">
//               <input
//                 type="date"
//                 value={filterDate}
//                 onChange={(e) => setFilterDate(e.target.value)}
//                 className="border px-3 py-1 rounded-md text-sm mt-2"
//               />
//               <Select
//                 value={selectedCategory}
//                 onValueChange={(value) => setSelectedCategory(value)}
//               >
//                 <SelectTrigger className="w-[180px] mt-2">
//                   <SelectValue placeholder={t("filter_by_category")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="All">{t("all")}</SelectItem>
//                   <SelectItem value="Processing">{t("processing")}</SelectItem>
//                   <SelectItem value="Confirmed">{t("confirmed")}</SelectItem>
//                   <SelectItem value="Shipped">{t("shipped")}</SelectItem>
//                   <SelectItem value="Delivered">{t("delivered")}</SelectItem>
//                   <SelectItem value="Cancelled">{t("cancelled")}</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <Button
//             variant="outline"
//             onClick={exportToExcel}
//             className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
//           >
//             {t("export_orders")}
//           </Button>
//         </div>

//         <div className="space-y-4">
//           {filteredOrders?.map((order, index) => (
//             <Card
//               key={index}
//               className="overflow-hidden border-2 transition-shadow hover:shadow-lg"
//             >
//               <CardHeader className="border-b bg-card pb-4">
//                 <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//                   <div className="flex flex-col gap-2">
//                     <div className="flex items-center gap-3">
//                       <span className="text-sm font-medium text-muted-foreground">
//                         {t("order_id")}
//                       </span>
//                       <span className="font-mono text-sm font-semibold text-foreground">
//                         #{String(index + 1).padStart(6, "0")}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <span className="text-sm font-medium text-muted-foreground">
//                         {t("date")}
//                       </span>
//                       <span className="text-sm text-foreground">
//                         {new Date(order.createdAt).toLocaleDateString(
//                           selectedLanguage === "ar" ? "ar" : "en-GB",
//                           {
//                             day: "numeric",
//                             month: "long",
//                             year: "numeric",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           },
//                         )}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     <span className="text-sm font-medium text-muted-foreground">
//                       {t("status")}
//                     </span>
//                     <Select
//                       value={order.status || "Not Set"}
//                       onValueChange={(value) =>
//                         handleStatusChange(index, order._id, value)
//                       }
//                     >
//                       <SelectTrigger className="w-[160px]">
//                         <SelectValue>
//                           <Badge
//                             className={
//                               statusColors[order.status?.toLowerCase()] ||
//                               statusColors["processing"]
//                             }
//                           >
//                             {statusLabels[order.status?.toLowerCase()] ||
//                               order.status}
//                           </Badge>
//                         </SelectValue>
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Processing">
//                           {t("processing")}
//                         </SelectItem>
//                         <SelectItem value="Confirmed">
//                           {t("confirmed")}
//                         </SelectItem>
//                         <SelectItem value="Shipped">{t("shipped")}</SelectItem>
//                         <SelectItem value="Delivered">
//                           {t("delivered")}
//                         </SelectItem>
//                         <SelectItem value="Cancelled">
//                           {t("cancelled")}
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               </CardHeader>

//               <CardContent className="p-6">
//                 <div className="space-y-4">
//                   {order.products?.length > 0 &&
//                     order.products.map((item, itemIndex) => (
//                       <div
//                         key={itemIndex}
//                         className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
//                       >
//                         <div className="flex items-center gap-4">
//                           <div className="h-16 w-16 overflow-hidden rounded-md border-2 border-primary/20">
//                             <img
//                               src={product_placeholder}
//                               alt="product"
//                               className="h-full w-full object-cover"
//                             />
//                           </div>
//                           <div className="flex flex-col gap-1">
//                             <p className="font-semibold text-foreground">
//                               {item.productId?.name[selectedLanguage] ??
//                                 t("deleted_product")}
//                             </p>
//                             <p className="text-sm text-muted-foreground">
//                               {t("quantity")}:
//                               <span className="font-medium">
//                                 {item.quantity}
//                               </span>
//                             </p>
//                             {item.additions && item.additions.length > 0 && (
//                               <div className="flex gap-1">
//                                 {t("additions")}:
//                                 {item.additions.map((addition) => (
//                                   <Badge key={addition._id} className="p-1">
//                                     {addition.name[selectedLanguage]}
//                                   </Badge>
//                                 ))}
//                               </div>
//                             )}
//                             <div className="flex gap-1 mt-1">
//                               {item.hasSpicy && item.isSpicy !== null && (
//                                 <Badge>{item.isSpicy ? "حار" : "عادي"}</Badge>
//                               )}

//                               <div className="flex gap-1">
//                                 {item.productId?.hasTypeChoices && (
//                                   <Badge>{t(item.selectedType)}</Badge>
//                                 )}
//                                 {item.productId?.hasProteinChoices && (
//                                   <Badge>{t(item.selectedProtein)}</Badge>
//                                 )}
//                               </div>
//                             </div>
//                             {item.notes && (
//                               <div className="flex gap-1 flex-wrap">
//                                 {t("notes")}:{" "}
//                                 <Badge
//                                   className={
//                                     "bg-[#FFC400] text-black font-bold"
//                                   }
//                                 >
//                                   {item.notes}
//                                 </Badge>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-lg font-bold text-primary">
//                             {t("price_jod")}:
//                             {item.priceAtPurchase.toFixed(2) ?? 0}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                 </div>

//                 <div className="mt-6 flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
//                   <div className="flex items-baseline gap-2">
//                     <span className="text-sm font-medium text-muted-foreground">
//                       {t("order_total")}:
//                     </span>
//                     <span className="text-2xl font-bold text-primary">
//                       {order.totalPrice.toFixed(2)} {t("price_jod")}
//                     </span>
//                   </div>

//                   <div className="flex gap-3">
//                     <Button
//                       variant="outline"
//                       className="border-primary text-primary hover:bg-primary/10 bg-transparent"
//                     >
//                       {t("view_details")}
//                     </Button>
//                     <Button
//                       variant="outline"
//                       className="border-secondary text-secondary-foreground hover:bg-secondary bg-transparent"
//                     >
//                       {t("edit_order")}
//                     </Button>
//                     <Button
//                       variant="destructive"
//                       onClick={() => handleCancelOrder(index)}
//                       disabled={orderStatuses[index] === "cancelled"}
//                       className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                     >
//                       {t("cancel_order")}
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}

//           {(!filteredOrders || filteredOrders.length === 0) && (
//             <Card className="border-2 border-dashed">
//               <CardContent className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-12">
//                 <h3 className="text-xl font-semibold text-foreground">
//                   {t("no_orders_found")}
//                 </h3>
//                 <p className="text-center text-muted-foreground">
//                   {t("orders_for_selected_date")}
//                 </p>
//               </CardContent>
//             </Card>
//           )}
//         </div>
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
  Delivered: "bg-green-600 text-white",
  Cancelled: "bg-destructive text-destructive-foreground",
};

function Orders() {
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { orders, getAllOrders, updateOrder, deleteOrder, loading } = useOrder();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAllOrders();
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    updateOrder(orderId, { status: newStatus });
  };

  // الفلترة هنا للبحث فقط، وتعرض كل الطلبات بدون استثناء تاريخ
  const filteredOrders = orders
    .filter((order) => {
      const sTerm = searchTerm.toLowerCase();
      return (
        searchTerm === "" ||
        order.sequenceNumber?.toString().includes(sTerm) ||
        order.userId?.phone?.includes(sTerm) ||
        order.userDetails?.name?.toLowerCase().includes(sTerm)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("all_orders")}</h1>
            <p className="mt-1 text-muted-foreground">
              {t("total_orders")}: <span className="font-semibold text-primary">{filteredOrders.length}</span>
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
            <Card className="p-12 text-center text-muted-foreground">{t("no_orders_found")}</Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order._id} className="overflow-hidden border-2 transition-shadow hover:shadow-lg">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{t("order_id")}:</span>
                        <span className="font-mono font-bold">#{order.sequenceNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{t("customer")}:</span>
                        <span className="text-sm font-semibold">{order.userDetails?.name} ({order.userId?.phone})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{t("date")}:</span>
                        <span className="text-sm">{new Date(order.createdAt).toLocaleString(`${selectedLanguage}-GB`)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{t("order_type")}:</span>
                        <span className="text-sm">{order.orderType === "delivery" ? t("delivery") : t("pickup")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge className={order.payment?.status === "paid" ? "bg-green-600" : "bg-secondary text-secondary-foreground"}>
                            {t(order.payment?.status || "unpaid")}
                        </Badge>
                        <Select value={order.status} onValueChange={(val) => handleStatusChange(order._id, val)}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue>
                                    <Badge className={statusColors[order.status]}>{t(order.status?.toLowerCase())}</Badge>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Processing">{t("processing")}</SelectItem>
                                <SelectItem value="Confirmed">{t("confirmed")}</SelectItem>
                                <SelectItem value="Shipped">{t("shipped")}</SelectItem>
                                <SelectItem value="Delivered">{t("delivered")}</SelectItem>
                                <SelectItem value="Cancelled">{t("cancelled")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {order.products?.map((item) => (
                      <div key={item._id} className="flex items-center justify-between gap-4 rounded-lg border p-4 bg-muted/30">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.productId?.image || product_placeholder}
                            className="h-16 w-16 rounded-md object-cover border"
                            onError={(e) => { e.target.src = product_placeholder; }}
                          />
                          <div className="flex flex-col gap-1">
                            <p className="font-semibold">{item.productId?.name[selectedLanguage] || t("deleted_product")}</p>
                            <p className="text-sm text-muted-foreground">{t("quantity")}: {item.quantity}</p>
                            
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
                                  <Badge key={a._id} variant="secondary" className="text-[10px]">
                                    {a.name[selectedLanguage]}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* الملاحظات و Spicy */}
                            <div className="flex gap-2 items-center mt-1">
                              {item.isSpicy && <Badge variant="destructive" className="text-[10px]">{t("spicy")}</Badge>}
                              {item.notes && (
                                <Badge className="bg-[#FFC400] text-black font-bold text-[10px] hover:bg-[#FFC400]">
                                  {t("notes")}: {item.notes}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{item.priceAtPurchase} JOD</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ملخص السعر */}
                  <div className="mt-6 border-t pt-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("order_subtotal")}:</span>
                      <span>{(order.totalPrice - (order.shippingAddress?.deliveryCost || 0)).toFixed(2)} JOD</span>
                    </div>
                    {order.orderType === "delivery" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("delivery_cost")}:</span>
                        <span>{order.shippingAddress?.deliveryCost || 0} JOD</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="font-bold">{t("order_total")}:</span>
                      <span className="text-xl font-bold text-primary">{order.totalPrice.toFixed(2)} JOD</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;