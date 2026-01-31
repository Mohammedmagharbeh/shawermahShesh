import { useEffect, useState } from "react";
import { useOrder } from "@/contexts/OrderContext";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Truck,
  ArrowLeft,
  Phone,
  User,
} from "lucide-react";
import Loading from "@/components/common/Loading";
import burger from "@/assets/burger.jpg";

function OrderDetails() {
  const { getOrderById, loading } = useOrder();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await getOrderById(id);
      if (data) setOrder(data);
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Loading />;
  if (!order)
    return <div className="p-10 text-center">{t("order_not_found")}</div>;

  const statusColors = {
    Processing: "bg-secondary text-secondary-foreground",
    Confirmed: "bg-purple-500 text-primary-foreground",
    Shipped: "bg-blue-500 text-white",
    Delivered: "bg-green-600 text-white",
    Cancelled: "bg-destructive text-destructive-foreground",
  };

  const getPaymentStatusVariant = (status) => {
    return status === "paid" ? "default" : "destructive";
  };

  return (
    <div
      className={`container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl ${selectedLanguage === "ar" ? "rtl" : "ltr"}`}
    >
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft
          className={`w-4 h-4 ${selectedLanguage === "ar" ? "rotate-180" : ""}`}
        />
        {t("back_to_orders")}
      </Button>

      <Card className="overflow-hidden border-2 shadow-sm">
        <CardHeader className="bg-muted/50 border-b p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("order_id")}</p>
              <h1 className="text-2xl font-bold text-primary">
                {" "}
                #{order.sequenceNumber || order._id.slice(-8)}
              </h1>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <Badge
                className={`${statusColors[order.status]} w-fit px-3 py-1 text-sm`}
              >
                {t(order.status.toLowerCase())}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(order.createdAt).toLocaleDateString(
                    `${selectedLanguage}-GB`,
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-8">
          {/* Delivery & Payment Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-background rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <MapPin className="w-4 h-4 text-primary" />{" "}
                {t("shipping_address")}
              </div>
              {order.shippingAddress ? (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="flex items-center gap-2">
                    <User className="w-3 h-3" /> {order.shippingAddress.name}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />{" "}
                    <span dir="ltr">{order.shippingAddress.phone}</span>
                  </p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.street}
                  </p>
                  {order.shippingAddress.details && (
                    <p className="italic">"{order.shippingAddress.details}"</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("pickup_from_store")}
                </p>
              )}
            </div>

            <div className="bg-background rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <CreditCard className="w-4 h-4 text-primary" />{" "}
                {t("payment_info")}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("method")}:</span>
                  <span className="font-medium capitalize">
                    {order.payment?.method === "Cash"
                      ? t("cash")
                      : order.payment?.method || t("cash")}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">{t("status")}:</span>
                  <Badge
                    variant={getPaymentStatusVariant(order.payment?.status)}
                    className="text-xs"
                  >
                    {t(order.payment?.status || "pending")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("order_items")}</h3>
            <div className="space-y-4">
              {order.products.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border p-3 rounded-lg bg-muted/20"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                      <img
                        src={item.productId?.image || burger}
                        alt={item.productId?.name[selectedLanguage]}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-foreground text-sm sm:text-base">
                        {item.productId?.name[selectedLanguage]}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>
                          {t("quantity")}: {item.quantity}
                        </span>
                        <span>•</span>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {item.isSpicy ? t("spicy") : t("regular")}
                        </Badge>
                      </div>
                      {item.additions?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.additions.map((add, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[10px] px-1"
                            >
                              +{add.name[selectedLanguage]}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {item.notes && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          {t("notes")}: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="sm:text-end">
                    <p className="font-bold text-primary">
                      {(item.priceAtPurchase * item.quantity).toFixed(2)} JOD
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {item.priceAtPurchase.toFixed(2)} JOD {t("per_unit")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-medium">
                {(
                  order.totalPrice - (order.shippingAddress?.deliveryCost || 0)
                ).toFixed(2)}{" "}
                JOD
              </span>
            </div>
            {order.shippingAddress?.deliveryCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck className="w-4 h-4" /> {t("delivery_cost")}
                </span>
                <span className="font-medium">
                  {order.shippingAddress.deliveryCost.toFixed(2)} JOD
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
              <span>{t("total")}</span>
              <span className="text-primary">
                {order.totalPrice.toFixed(2)} JOD
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrderDetails;
