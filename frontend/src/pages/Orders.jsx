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
import Loading from "../componenet/common/Loading";
import burger from "../assets/burger.jpg";

const statusColors = {
  processing: "bg-secondary text-secondary-foreground",
  confirmed: "bg-purple-500 text-primary-foreground",
  shipped: "bg-blue-500 text-white",
  delivered: "bg-green-600 text-white",
  cancelled: "bg-destructive text-destructive-foreground",
};

function Orders() {
  const { orders, getAllOrders, loading, updateOrder } = useOrder();
  const [orderStatuses, setOrderStatuses] = useState({});

  useEffect(() => {
    getAllOrders();
  }, []);

  useEffect(() => {
    if (orders) {
      const initialStatuses = {};
      orders.forEach((_, index) => {
        initialStatuses[index] = "processing";
      });
      setOrderStatuses(initialStatuses);
    }
  }, [orders]);

  const handleStatusChange = (index, id, newStatus) => {
    setOrderStatuses((prev) => ({
      ...prev,
      [index]: newStatus,
    }));
    updateOrder(id, { status: newStatus });
  };

  const handleCancelOrder = (index) => {
    handleStatusChange(index, "cancelled");
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Order Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Total Orders:{" "}
              <span className="font-semibold text-primary">
                {orders?.length || 0}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              Export Orders
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              New Order
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {orders?.map((order, index) => (
            <Card
              key={index}
              className="overflow-hidden border-2 transition-shadow hover:shadow-lg"
            >
              <CardHeader className="border-b bg-card pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Order ID:
                      </span>
                      <span className="font-mono text-sm font-semibold text-foreground">
                        #{String(index + 1).padStart(6, "0")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Date:
                      </span>
                      <span className="text-sm text-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Status:
                    </span>
                    <Select
                      value={order.status || "Not Set"}
                      onValueChange={(value) =>
                        handleStatusChange(index, order._id, value)
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue>
                          <Badge
                            className={
                              statusColors[order.status?.toLowerCase()] ||
                              statusColors["processing"]
                            }
                          >
                            {(order.status || "processing").toUpperCase()}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.products?.length > 0 &&
                    order.products.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 overflow-hidden rounded-md border-2 border-primary/20">
                            <img
                              src={burger}
                              alt="product"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="font-semibold text-foreground">
                              {item.productId?.name ?? "Product unavailable"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: <span className="font-medium">1</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            $
                            {item.productId?.price ?? item.priceAtPurchase ?? 0}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-6 flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Order Total:
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ${order.totalPrice}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      className="border-secondary text-secondary-foreground hover:bg-secondary bg-transparent"
                    >
                      Edit Order
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelOrder(index)}
                      disabled={orderStatuses[index] === "cancelled"}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Cancel Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!orders || orders.length === 0) && (
          <Card className="border-2 border-dashed">
            <CardContent className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-12">
              <div className="rounded-full bg-muted p-6">
                <svg
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                No Orders Yet
              </h3>
              <p className="text-center text-muted-foreground">
                Orders will appear here once customers start placing them.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Orders;
