import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrder } from "@/contexts/OrderContext";
import Loading from "@/componenet/common/Loading";
import { io } from "socket.io-client";
import newOrderSound from "../assets/newOrder.mp3";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import product_placeholder from "../assets/product_placeholder.jpeg";
import { Dialog } from "@/componenet/common/Dialog";

const statusColors = {
  Processing: "bg-secondary text-secondary-foreground",
  Confirmed: "bg-purple-500 text-primary-foreground",
  Shipped: "bg-blue-500 text-white",
  Delivered: "bg-green-600 text-white",
  Cancelled: "bg-destructive text-destructive-foreground",
};

const socket = io(import.meta.env.VITE_SOCKET_URL);

function AdminDashboard() {
  const { t } = useTranslation(); // <-- صح داخل الدالة
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  const { orders, getAllOrders, updateOrder, deleteOrder, loading } =
    useOrder();
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) =>
        console.log("Notification permission:", permission)
      );
    }
  }, []);

  useEffect(() => {
    socket.on("newOrder", (order) => {
      getAllOrders();
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("📦 New Order!", {
          body: `${order.userId.phone} ordered for ${order.totalPrice} JOD`,
          icon: "/order-icon.png",
        });
      }
      const sound = new Audio(newOrderSound);
      sound.play().catch((err) => console.log("Play blocked:", err));
    });

    return () => socket.off("newOrder");
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      await getAllOrders();
    };
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId, newStatus) =>
    updateOrder(orderId, { status: newStatus });

  const handleDeleteOrder = (orderId) => {
    toast(
      () => (
        <div className="flex flex-col gap-2">
          <span>{t("confirm_delete_order")}</span>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteOrder(orderId);
                toast.dismiss(t.id);
                toast.success(t("order_deleted")); // الرسالة بعد الحذف مترجمة
              }}
            >
              {t("yes")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.dismiss(t.id)}
            >
              {t("no")}
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const filteredOrders = orders
    .filter(
      (order) =>
        order.createdAt &&
        new Date(order.createdAt).toLocaleDateString("en-CA") === filterDate &&
        (order.status === "Processing" || order.status === "Confirmed")
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const exportToExcel = () => {
    const data = filteredOrders.map((order) => ({
      "Order ID": order._id,
      "Customer Phone": order.userId?.phone || "N/A",
      Date: order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : "N/A",
      Status: order.status,
      "Payment Status": order.payment?.status || "N/A",
      "Payment Method": order.payment?.method || "N/A",
      "Total Price (JOD)": order.totalPrice,
      "Delivery Cost": order.shippingAddress?.deliveryCost || 0,
      Address: `${order.shippingAddress?.name || "N/A"}`,
      Products: order.products
        .map(
          (item) =>
            `${item.productId?.name[selectedLanguage] || "Unknown"} (Qty: ${item.quantity})`
        )
        .join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, `Orders_${filterDate}.xlsx`);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-foreground">
              {t("order_management")}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {t("total_orders")}
              <span className="font-semibold text-primary">
                {filteredOrders.length}
              </span>
            </p>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border px-3 py-1 rounded-md text-sm mt-2"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={exportToExcel}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              Export Orders
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 && (
            <Card className="border-2 border-dashed">
              <CardContent className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-12">
                <h3 className="text-xl font-semibold text-foreground">
                  No Orders
                </h3>
                <p className="text-center text-muted-foreground">
                  Orders for selected date will appear here.
                </p>
              </CardContent>
            </Card>
          )}

          {filteredOrders.map((order) => (
            <Card
              key={order._id}
              className="overflow-hidden border-2 transition-shadow hover:shadow-lg"
            >
              <CardHeader className="border-b bg-card pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("order_id")}
                      </span>
                      <span className="font-mono text-sm font-semibold text-foreground">
                        #{order._id?.slice(-8) || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("customer")}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {order.userId?.phone || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("date")}
                      </span>
                      <span className="text-sm text-foreground">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        نوع الطلب
                      </span>
                      <span className="text-sm text-foreground">
                        {order.orderType === "delivery" ? "توصيل" : "استلام"}
                        
                      </span>
                      
                    </div>
                    
                    {order.orderType === "delivery" && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          {t("address")}
                        </span>
                        <span className="text-sm text-foreground">
                          {order.shippingAddress?.name || "N/A"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("payment")}
                      </span>
                      <Badge
                        className={
                          order.payment?.status === "paid"
                            ? "bg-green-600 text-white"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {order.payment?.status
                          ? t(order.payment.status)
                          : "N/A"}{" "}
                        ({order.payment?.method || "N/A"})
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("status")}
                      </span>
                      <Select
                        value={order.status || "N/A"}
                        onValueChange={(value) =>
                          handleStatusChange(order._id, value)
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue>
                            <Badge className={statusColors[order.status]}>
                              {order.status
                                ? t(order.status.toLowerCase())
                                : "N/A"}
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
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div id={`invoice-${order._id}`}>
                  <div className="space-y-4">
                    {order.products?.length > 0 &&
                      order.products.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 overflow-hidden rounded-md border-2 border-primary/20">
                              <img
                                src={product_placeholder}
                                alt={
                                  item.productId?.name[selectedLanguage] ||
                                  "Product"
                                }
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold text-foreground">
                                {item.productId?.name[selectedLanguage] ||
                                  "Unknown Product"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.productId?.description[
                                  selectedLanguage
                                ] || ""}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t("quantity")}:{" "}
                                <span className="font-medium">
                                  {item.quantity || 0}
                                </span>
                              </p>
                              <Badge>{item.isSpicy ? "حار" : "عادي"}</Badge>
                              {item.additions && item.additions.length > 0 && (
                                <div className="flex gap-1">
                                  {t("additions")}:
                                  {item.additions.map((addition) => (
                                    <Badge key={addition._id} className="p-1">
                                      {addition.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {item.notes && (
                                <p className="text-sm text-gray-600 italic">
                                  {t("notes")}: {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {item.priceAtPurchase || 0} {t("price_jod")}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {item.priceAtPurchase || 0} × {item.quantity}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="mt-6 space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("order_subtotal")}:
                      </span>
                      <span className="font-medium text-foreground">
                        {(
                          (order.totalPrice || 0) -
                          (order.shippingAddress?.deliveryCost || 0)
                        ).toFixed(2)}
                        {t("price_jod")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("delivery_cost")}:
                      </span>
                      <span className="font-medium text-foreground">
                        {order.shippingAddress?.deliveryCost || 0} JOD
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("order_total")}:
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {order.totalPrice.toFixed(2) || 0} {t("price_jod")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-end">
                  <Dialog
                    name={t("edit_order")} // <-- هنا النص مترجم
                    order={order}
                    updateOrders={getAllOrders}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteOrder(order._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("delete_order")}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                    onClick={() => {
                      const orderDiv = document.createElement("div");
                      const customerPhone = order.userId?.phone || "N/A";
                      const deliveryType =
                        order.shippingAddress?.deliveryCost > 0
                          ? "Delivery"
                          : "Pickup";
                      const area = order.shippingAddress?.name || "N/A";

                      // Build product table
                      let productsHtml = `
      <table style="width:100%; border-collapse: collapse; margin-top: 10px; font-size:14px;">
        <thead>
          <tr>
            <th style="border-bottom:1px solid #000; text-align:left; padding:6px;">المنتج</th>
            <th style="border-bottom:1px solid #000; text-align:center; padding:6px;">الكمية</th>
            <th style="border-bottom:1px solid #000; text-align:right; padding:6px;">السعر (JOD)</th>
          </tr>
        </thead>
        <tbody>
    `;

                      order.products?.forEach((item) => {
                        const additions =
                          Array.isArray(item.additions) &&
                          item.additions.length > 0
                            ? `<div style="font-size:12px; color:#555;">+ ${item.additions
                                .map((a) => a.name)
                                .join(", ")}</div>`
                            : "";

                        const notes =
                          item.notes && item.notes.trim() !== ""
                            ? `<div style="font-size:12px; color:#777;">ملاحظات: ${item.notes}</div>`
                            : "";

                        productsHtml += `
        <tr>
          <td style="padding:6px; vertical-align:top;">
            ${item.productId?.name[selectedLanguage] || "Unknown"}
            ${additions}
            ${notes}
          </td>
          <td style="padding:6px; text-align:center; vertical-align:top;">
            ${item.quantity}
          </td>
          <td style="padding:6px; text-align:right; vertical-align:top;">
            ${(item.priceAtPurchase * item.quantity).toFixed(2)}
          </td>
        </tr>
      `;
                      });

                      productsHtml += "</tbody></table>";

                      // Build the main invoice HTML
                      orderDiv.innerHTML = `
      <div style="font-family: 'Tahoma', sans-serif; width:100%; max-width:400px; margin:auto; padding:16px; border:1px solid #ccc; box-sizing:border-box;">
        <h2 style="text-align:center; margin-bottom:12px;">فاتورة الطلب</h2>
        <div style="margin-bottom:10px;">
          <p><strong>رقم العميل:</strong> ${customerPhone}</p>
          <p><strong>نوع الطلب:</strong> ${deliveryType}</p>
          ${
            deliveryType === "Delivery"
              ? `<p><strong>المنطقة:</strong> ${area}</p>`
              : ""
          }
        </div>
        ${productsHtml}
        <hr style="margin:12px 0;"/>
        <div style="font-size:15px;">
          <p style="display:flex; justify-content:space-between;"><strong>Subtotal:</strong> <span>${(
            order.totalPrice - (order.shippingAddress?.deliveryCost || 0)
          ).toFixed(2)} JOD</span></p>
          <p style="display:flex; justify-content:space-between;"><strong>Delivery:</strong> <span>${order.shippingAddress?.deliveryCost || 0} JOD</span></p>
          <p style="display:flex; justify-content:space-between; font-size:1.1em; font-weight:bold; margin-top:6px;"><strong>Total:</strong> <span>${order.totalPrice.toFixed(
            2
          )} JOD</span></p>
        </div>
        <hr style="margin:12px 0;"/>
        <p style="text-align:center; margin-top:10px; font-weight:bold;">شاورما شيش</p>
      </div>
    `;

                      // Print logic
                      const printWindow = window.open(
                        "",
                        "",
                        "height=600,width=400"
                      );
                      printWindow.document.write(`
      <html>
        <head>
          <title>فاتورة</title>
          <meta charset="UTF-8" />
          <style>
            @media print {
              body { margin: 0; padding: 0; font-size: 13px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border-bottom: 1px solid #ddd; }
            }
          </style>
        </head>
        <body>${orderDiv.innerHTML}</body>
      </html>
    `);
                      printWindow.document.close();
                      printWindow.focus();
                      printWindow.print();
                      printWindow.close();
                    }}
                  >
                    {t("print_invoice")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
