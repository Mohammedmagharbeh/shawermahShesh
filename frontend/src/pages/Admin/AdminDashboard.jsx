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
import Loading from "@/components/common/Loading";
import { io } from "socket.io-client";
import newOrderSound from "@/assets/newOrder.mp3";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import product_placeholder from "@/assets/product_placeholder.jpeg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";
import { Label } from "@/components/ui/label";

const statusColors = {
  Processing: "bg-secondary text-secondary-foreground",
  Confirmed: "bg-purple-500 text-primary-foreground",
  Shipped: "bg-blue-500 text-white",
  Delivered: "bg-green-600 text-white",
  Cancelled: "bg-destructive text-destructive-foreground",
};

const socket = io(import.meta.env.VITE_SOCKET_URL);

function AdminDashboard() {
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { orders, getAllOrders, updateOrder, deleteOrder, loading } =
    useOrder();

  const [filterDate, setFilterDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );
  const [searchTerm, setSearchTerm] = useState(""); // State للبحث
  const [soundAllowed, setSoundAllowed] = useState(false);
  const [sound, setSound] = useState(null);
  const [incomingOrder, setIncomingOrder] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    getAllOrders();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDate = new Date().toLocaleDateString("en-CA");
      if (newDate !== filterDate) {
        setFilterDate(newDate);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [filterDate]);

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/order/get?status=Processing`,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        },
      );
      const data = await res.json();
      setIncomingOrder(data.data);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
  };

  useEffect(() => {
    const audio = new Audio(newOrderSound);
    audio.loop = true;
    setSound(audio);
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      fetchPendingOrders();
    }
  }, [orders]);

  const enableSound = () => {
    if (sound) {
      sound
        .play()
        .then(() => {
          sound.pause();
          sound.currentTime = 0;
          setSoundAllowed(true);
          toast.success(t("sound_notifications_enabled"));
        })
        .catch(() => toast.error("Sound activation failed"));
    }
  };

  useEffect(() => {
    socket.on("newOrder", (order) => {
      getAllOrders();
      setIncomingOrder((prev) => {
        const exists = prev?.some((o) => o._id === order._id);
        if (exists) return prev;
        return [...(prev || []), order];
      });

      if (soundAllowed && sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
    });

    socket.on("updatedOrder", (updatedOrder) => {
      getAllOrders();
      setIncomingOrder((prev) => {
        if (!prev) return [];
        const wasIncoming = prev.some(
          (order) => order._id === updatedOrder._id,
        );
        if (wasIncoming && sound) {
          sound.pause();
          sound.currentTime = 0;
        }
        return prev.filter((order) => order._id !== updatedOrder._id);
      });
    });

    return () => {
      socket.off("newOrder");
      socket.off("updatedOrder");
    };
  }, [soundAllowed, sound, getAllOrders]);

  const stopSound = () => {
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrder(orderId, { status: newStatus });
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm(t("confirm_delete_order"))) {
      deleteOrder(orderId);
      toast.success(t("order_deleted"));
    }
  };

  // تعديل منطق الفلترة ليشمل البحث
  const filteredOrders = orders
    .filter((order) => {
      const orderDate =
        order.createdAt &&
        new Date(order.createdAt).toLocaleDateString("en-CA");
      const matchesDate = orderDate === filterDate;
      const matchesStatus =
        order.status === "Processing" || order.status === "Confirmed";

      const sTerm = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        order.sequenceNumber?.toString().includes(sTerm) || // بحث برقم الطلب
        order.userId?.phone?.includes(sTerm) || // بحث برقم التلفون
        order.userDetails?.name?.toLowerCase().includes(sTerm); // بحث بالاسم

      return matchesDate && matchesStatus && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const exportToExcel = () => {
    const data = filteredOrders.map((order) => ({
      "Order ID": order.sequenceNumber || "N/A",
      "Customer Phone": order.userId?.phone || "N/A",
      Date: new Date(order.createdAt).toLocaleString(),
      Status: order.status,
      "Total Price": order.totalPrice,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    saveAs(
      new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })]),
      `Orders_${filterDate}.xlsx`,
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <h1 className="text-3xl font-bold text-foreground">
              {t("order_management")}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {t("total_orders")}
              <span className="font-semibold text-primary mx-1">
                {filteredOrders.length}
              </span>
            </p>

            {/* قسم أدوات البحث والتصفية */}
            <div className="flex flex-wrap gap-3 items-center mt-4">
              <input
                type="text"
                placeholder={t("search_order_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-4 py-2 rounded-lg text-sm w-full md:w-80 focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border px-3 py-2 rounded-lg text-sm shadow-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFilterDate(new Date().toLocaleDateString("en-CA"));
                    setSearchTerm("");
                  }}
                >
                  {t("Today")}
                </Button>
              </div>
            </div>

            <Dialog open={!soundAllowed}>
              <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>{t("allow_notifications")}</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2 mt-4 justify-end">
                  <Button
                    onClick={enableSound}
                    className="bg-green-500 text-white"
                  >
                    {t("enable_sound")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {incomingOrder?.length > 0 &&
              incomingOrder.map((o) => (
                <Dialog
                  open={incomingOrder.length > 0}
                  key={o._id}
                  onOpenChange={(open) => {
                    if (!open) {
                      stopSound();
                      setIncomingOrder((prev) =>
                        prev.filter((ord) => ord._id !== o._id),
                      );
                    }
                  }}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {t("new_order_title")} #{o.sequenceNumber}
                      </DialogTitle>
                      <DialogDescription
                        className={`flex flex-col gap-4 ${selectedLanguage === "ar" ? "rtl" : "ltr"}`}
                      >
                        <div className="flex gap-2 items-center">
                          <Label>{t("phone")}:</Label>
                          {o?.userId?.phone}
                        </div>
                        <div className="flex gap-2 items-center">
                          <Label>{t("name")}:</Label>
                          {o.userDetails?.name}
                        </div>
                        <div className="flex gap-2 items-center">
                          <Label>{t("total")}:</Label>
                          {o?.totalPrice} JOD
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 mt-4 justify-end">
                      <Button
                        onClick={() => {
                          stopSound();
                          updateOrder(o._id, { status: "Confirmed" });
                          setIncomingOrder((prev) =>
                            prev.filter((ord) => ord._id !== o._id),
                          );
                        }}
                      >
                        {t("accept")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
          </div>

          <div className="flex gap-3 self-end">
            <Button
              variant="outline"
              onClick={exportToExcel}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              {t("export_orders")}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 && (
            <Card className="border-2 border-dashed">
              <CardContent className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-12">
                <h3 className="text-xl font-semibold text-foreground">
                  {t("no_orders_found")}
                </h3>
                <p className="text-center text-muted-foreground">
                  {t("try_other_search")}
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
                        #{order.sequenceNumber || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("customer_name")}:
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {order.userDetails?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("detailed_address")}:
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {order.userDetails?.apartment || "Unknown"}
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
                          ? new Date(order.createdAt).toLocaleString(
                              `${selectedLanguage}-GB`,
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("order_type")}:
                      </span>
                      <span className="text-sm text-foreground">
                        {order.orderType === "delivery"
                          ? t("delivery")
                          : t("pickup")}
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
                    <Badge
                      className={
                        order.payment?.status === "paid"
                          ? "bg-green-600 text-white"
                          : "bg-secondary text-secondary-foreground"
                      }
                    >
                      {order.payment?.status ? t(order.payment.status) : "N/A"}{" "}
                      ({order.payment?.method || "N/A"})
                    </Badge>
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
                    {order.products?.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between gap-4 rounded-lg border p-4 bg-muted/30"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={product_placeholder}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                          <div className="flex flex-col gap-1">
                            <p className="font-semibold">
                              {item.productId?.name[selectedLanguage] ||
                                t("deleted_product")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t("quantity")}: {item.quantity || 0}
                            </p>
                            {item.isSpicy && (
                              <Badge className="w-fit">{t("spicy")}</Badge>
                            )}
                            {item.additions?.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {t("additions")}:{" "}
                                {item.additions.map((a) => (
                                  <Badge key={a._id}>
                                    {a.name[selectedLanguage]}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {item.priceAtPurchase} JOD
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("order_subtotal")}:
                      </span>
                      <span className="font-medium">
                        {(
                          order.totalPrice -
                          (order.shippingAddress?.deliveryCost || 0)
                        ).toFixed(2)}{" "}
                        JOD
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("delivery_cost")}:
                      </span>
                      <span className="font-medium">
                        {order.shippingAddress?.deliveryCost || 0} JOD
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-sm font-medium">
                        {t("order_total")}:
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {order.totalPrice.toFixed(2)} JOD
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-end">
                  {user.role === "admin" && (
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      {t("delete_order")}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="border-primary text-primary"
                    onClick={() => {
                      const customerPhone = order.userId?.phone || "N/A";
                      const customerName = order.userDetails?.name || "N/A";
                      const deliveryType =
                        order.orderType === "delivery"
                          ? t("delivery")
                          : t("pickup");
                      const area = order.shippingAddress?.name || "N/A";

                      const invoiceHtml = `
                        <div style="direction: rtl; font-family: Tahoma, sans-serif; width:100%; max-width:480px; margin:auto; padding:16px; border:1px solid #ccc; background:#fff;">
                          <h2 style="text-align:center; margin-bottom:8px;">${t("invoice_title")} #${order.sequenceNumber}</h2>
                          <p style="text-align:center; font-size:14px;"><strong>${t("invoice_customer")}</strong> ${customerName}</p>
                          <p style="text-align:center; font-size:14px;"><strong>${t("invoice_phone")}</strong> ${customerPhone}</p>
                          <p style="text-align:center; font-size:14px;"><strong>${t("invoice_order_type")}</strong> ${deliveryType}</p>
                          ${order.orderType === "delivery" ? `<p style="text-align:center; font-size:14px;"><strong>${t("invoice_area")}</strong> ${area}</p>` : ""}
                          <hr/>
                          <table style="width:100%; border-collapse: collapse; font-size:14px;">
                            <thead>
                              <tr style="background:#f0f0f0;">
                                <th style="padding:6px; border-bottom:1px solid #000; text-align:right;">${t("product")}</th>
                                <th style="padding:6px; border-bottom:1px solid #000; text-align:center;">${t("quantity")}</th>
                                <th style="padding:6px; border-bottom:1px solid #000; text-align:left;">${t("price")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${order.products
                                .map((item) => {
                                  const additions =
                                    item.additions?.length > 0
                                      ? `<div style="font-size:12px; color:#555;">+ ${item.additions.map((a) => a.name[selectedLanguage]).join(", ")}</div>`
                                      : "";
                                  const protein = item.selectedProtein
                                    ? `<div style="font-size:12px; color:#555;">${t("protein")}: ${item.selectedProtein[selectedLanguage]}</div>`
                                    : "";
                                  const spicy = item.isSpicy
                                    ? `<div style="color:red; font-size:12px;">${t("spicy")}</div>`
                                    : "";
                                  const notes = item.notes
                                    ? `<div style="font-size:12px; color:#777;">${t("notes")}: ${item.notes}</div>`
                                    : "";

                                  return `
                                  <tr>
                                    <td style="padding:6px; border-bottom:1px solid #eee;">
                                      ${item.productId?.name[selectedLanguage] || "Unknown"}
                                      ${additions}
                                      ${protein}
                                      ${spicy}
                                      ${notes}
                                    </td>
                                    <td style="text-align:center; padding:6px; border-bottom:1px solid #eee;">${item.quantity}</td>
                                    <td style="text-align:left; padding:6px; border-bottom:1px solid #eee;">${(item.priceAtPurchase * item.quantity).toFixed(2)} JOD</td>
                                  </tr>
                                `;
                                })
                                .join("")}
                            </tbody>
                          </table>
                          <div style="margin-top:10px; font-size:14px;">
                            <p style="display:flex; justify-content:space-between;"><strong>${t("subtotal")}:</strong> <span>${(order.totalPrice - (order.shippingAddress?.deliveryCost || 0)).toFixed(2)} JOD</span></p>
                            <p style="display:flex; justify-content:space-between;"><strong>${t("delivery")}:</strong> <span>${order.shippingAddress?.deliveryCost || 0} JOD</span></p>
                            <p style="display:flex; justify-content:space-between; font-weight:bold; font-size:16px;"><strong>${t("total")}:</strong> <span>${order.totalPrice.toFixed(2)} JOD</span></p>
                          </div>
                          <hr />
                          <p style="text-align:center; font-weight:bold;"> ${t("invoice_thank_you")} </p>
                        </div>
                      `;

                      const printWindow = window.open(
                        "",
                        "",
                        "width=400,height=600",
                      );
                      printWindow.document.write(
                        `<html><head><title>فاتورة</title><meta charset="UTF-8" /></head><body>${invoiceHtml}</body></html>`,
                      );
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
