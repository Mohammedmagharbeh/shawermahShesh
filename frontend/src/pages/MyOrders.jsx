import { useOrder } from "@/contexts/OrderContext";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, CreditCard, MapPin, Truck } from "lucide-react";
import burger from "../assets/burger.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Loading from "@/componenet/common/Loading";

function MyOrders() {
  const { getOrdersByUserId, loading } = useOrder();
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userOrders, setUserOrders] = useState([]);
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { id } = useParams();

  // رقم البداية الذي طلبته
  const START_ORDER_NUMBER = 3140;

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

  const statusLabels = {
    processing: t("processing"),
    confirmed: t("confirmed"),
    shipped: t("shipped"),
    delivered: t("delivered"),
    cancelled: t("cancelled"),
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-18 max-w-5xl">
      <div className="mb-8 flex justify-between items-start flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            {t("my_past_order")}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {filteredOrders?.length === 0
            ? t("no_orders_yet")
            : `${filteredOrders?.length} ${filteredOrders?.length !== 1 ? t("orders") : t("order")} ${t("found")}`}
        </p>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-[180px] mt-2">
            <SelectValue placeholder={t("filter_by_category")} />
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
        {filteredOrders.map((order, index) => {
          const sequentialId =
            START_ORDER_NUMBER + (userOrders.length - 1 - index);

          return (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {t("order_id")}
                      </p>
                      <p className="font-mono text-sm font-medium text-foreground">
                        #{sequentialId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {new Date(order.createdAt).toLocaleDateString(
                          selectedLanguage === "ar" ? "ar" : "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <Badge className={`${statusColors[order.status]} w-fit`}>
                      {statusLabels[order.status?.toLowerCase()] ||
                        order.status}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {t("payment")}:
                      </span>
                      <span className="font-medium text-foreground capitalize">
                        {order.payment.method === "cash"
                          ? t("cash")
                          : order.payment.method === "card"
                            ? t("card")
                            : order.payment.method}
                      </span>
                      <Badge
                        variant={getPaymentStatusVariant(order.payment.status)}
                        className="text-xs"
                      >
                        {order.payment.status === "paid"
                          ? t("paid")
                          : order.payment.status === "unpaid"
                            ? t("unpaid")
                            : order.payment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {t("delivery")}:
                      </span>
                      <span className="font-medium text-foreground">
                        {order.shippingAddress?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.products.map((item, productIndex) => (
                    <div key={productIndex}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={item.productId?.image || burger}
                              alt={
                                item.productId?.name[selectedLanguage] ??
                                t("deleted_product")
                              }
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {item.productId?.name[selectedLanguage] ??
                                t("deleted_product")}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                {t("quantity")}: {item.quantity}
                              </span>
                              <span>•</span>
                              <span className="capitalize">
                                {item.productId?.category.name?.[
                                  selectedLanguage
                                ] ?? t("unknown_category")}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.productId?.discount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.productId.discount}% {t("off")}
                                </Badge>
                              )}
                              <Badge variant="outline">
                                {item.isSpicy ? t("spicy") : t("not_spicy")}
                              </Badge>
                            </div>
                            {item.additions && item.additions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2 items-center text-sm">
                                <span className="text-muted-foreground">
                                  {t("additions")}:
                                </span>
                                {item.additions.map((addition) => (
                                  <Badge
                                    key={addition._id}
                                    variant="secondary"
                                    className="text-[10px] px-1"
                                  >
                                    {addition.name[selectedLanguage]}
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
                        <div className="sm:text-right">
                          <p className="font-semibold text-foreground">
                            {item.priceAtPurchase.toFixed(2)} {t("price_jod")}
                          </p>
                          {item.productId?.discount > 0 && (
                            <p className="text-sm text-muted-foreground line-through">
                              {item.productId.price.toFixed(2)} {t("price_jod")}
                            </p>
                          )}
                        </div>
                      </div>
                      {productIndex < order.products.length - 1 && (
                        <div className="border-t border-border mt-4" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border space-y-2">
                  {order.shippingAddress?.deliveryCost > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>{t("delivery_cost")}</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {order.shippingAddress.deliveryCost.toFixed(2)}{" "}
                        {t("price_jod")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-muted-foreground">
                      {t("order_total")}
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {order.totalPrice.toFixed(2)} {t("price_jod")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrders?.length === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <Package className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {t("no_orders_yet")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("order_history_message")}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default MyOrders;
