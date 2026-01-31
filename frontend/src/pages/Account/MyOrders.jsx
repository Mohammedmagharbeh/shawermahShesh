import { useOrder } from "@/contexts/OrderContext";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, CreditCard, MapPin, Truck } from "lucide-react";
import burger from "@/assets/burger.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "@/components/common/Loading";

function MyOrders() {
  const { getOrdersByUserId, loading } = useOrder();
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userOrders, setUserOrders] = useState([]);
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserOrders = async () => {
      const orders = await getOrdersByUserId(id);
      setUserOrders(Array.isArray(orders) ? orders : []);
    };

    fetchUserOrders();
  }, [id, user]);

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

  const filteredOrders = userOrders?.filter((order) => {
    if (!order.createdAt) return false;

    const matchesCategory =
      selectedCategory === "All" ||
      order.status?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesCategory;
  });

  if (loading) return <Loading />;

  return (
    <div
      className={`container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl ${selectedLanguage === "ar" ? "rtl" : "ltr"}`}
    >
      <div className="mb-8 flex justify-between items-start flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("my past order")}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {filteredOrders?.length === 0
            ? t("no_orders_yet")
            : `${filteredOrders?.length} ${t("orders_found")}`}
        </p>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-[180px] mt-2">
            <SelectValue placeholder={t("filter_by_status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t("all")}</SelectItem>
            <SelectItem value="Processing">{t("processing")}</SelectItem>
            <SelectItem value="Confirmed">{t("confirmed")}</SelectItem>
            <SelectItem value="Shipped">{t("shipped")}</SelectItem>
            <SelectItem value="Delivered">{t("delivered")}</SelectItem>
            <SelectItem value="Cancelled">{t("cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <Card
            key={order._id}
            onClick={() => navigate(`/order/${order._id}`)}
            className="overflow-hidden border-2 transition-shadow hover:shadow-md cursor-pointer"
          >
            <CardHeader className="bg-muted/50 border-b p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("order_id")}
                    </p>
                    <p className="font-mono text-sm font-bold text-primary">
                      #{order.sequenceNumber || order._id.slice(-8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {new Date(order.createdAt).toLocaleDateString(
                        `${selectedLanguage}-GB`,
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <Badge
                    className={`${statusColors[order.status]} w-fit px-3 py-1`}
                  >
                    {t(order.status.toLowerCase())}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t("payment")}:
                    </span>
                    <span className="font-medium text-foreground capitalize">
                      {order.payment?.method === "Cash"
                        ? t("cash")
                        : order.payment?.method || t("cash")}
                    </span>
                    <Badge
                      variant={getPaymentStatusVariant(order.payment?.status)}
                      className="text-xs"
                    >
                      {t(order.payment?.status || "pending")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t("delivery")}:
                    </span>
                    <span className="font-medium text-foreground">
                      {order.shippingAddress?.name || t("pickup_from_store")}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {order.products.map((item, productIndex) => (
                  <div key={item._id || productIndex}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                          <img
                            src={item.productId?.image || burger}
                            alt={item.productId?.name[selectedLanguage]}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-1 flex-1">
                          <p className="font-semibold text-foreground text-sm sm:text-base break-words">
                            {item.productId?.name[selectedLanguage] ??
                              t("deleted_product")}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <span>
                              {t("quantity")}: {item.quantity}
                            </span>
                            <span>•</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5"
                            >
                              {item.isSpicy ? t("spicy") : t("regular")}
                            </Badge>
                          </div>

                          {item.additions && item.additions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.additions.map((addition) => (
                                <Badge
                                  key={addition._id}
                                  variant="secondary"
                                  className="text-[10px] px-1"
                                >
                                  +{addition.name[selectedLanguage]}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-xs text-muted-foreground italic mt-1 break-words">
                              {t("notes")}: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="sm:text-end flex-shrink-0">
                        <p className="font-bold text-primary text-sm sm:text-base">
                          {(item.priceAtPurchase * item.quantity).toFixed(2)}{" "}
                          JOD
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {item.priceAtPurchase.toFixed(2)} JOD{" "}
                            {t("per_unit")}
                          </p>
                        )}
                      </div>
                    </div>
                    {productIndex < order.products.length - 1 && (
                      <div className="border-t border-dashed border-border mt-4" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t-2 border-border space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span className="font-medium">
                    {(
                      order.totalPrice -
                      (order.shippingAddress?.deliveryCost || 0)
                    ).toFixed(2)}{" "}
                    JOD
                  </span>
                </div>

                {order.shippingAddress?.deliveryCost > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      <span>{t("delivery_cost")}</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {order.shippingAddress.deliveryCost.toFixed(2)} JOD
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-base sm:text-lg font-bold text-foreground">
                    {t("order_total")}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-primary">
                    {order.totalPrice.toFixed(2)} JOD
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders?.length === 0 && (
        <Card className="p-12 border-dashed border-2">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <Package className="h-16 w-16 text-muted-foreground/30" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {t("no_orders_yet")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("order_history_empty_desc")}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default MyOrders;
