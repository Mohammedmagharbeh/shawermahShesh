import { useEffect } from "react";
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
import burger from "../assets/burger.jpg";
import Loading from "@/componenet/common/Loading";
import { io } from "socket.io-client";
import newOrderSound from "../../public/newOrder.mp3";

const statusColors = {
  Processing: "bg-secondary text-secondary-foreground",
  Confirmed: "bg-purple-500 text-primary-foreground",
  Shipped: "bg-blue-500 text-white",
  Delivered: "bg-green-600 text-white",
  Cancelled: "bg-destructive text-destructive-foreground",
};

const socket = io("http://localhost:5000");

function AdminDashboard() {
  const { orders, getAllOrders, updateOrder, deleteOrder, loading } =
    useOrder();

  // Ask for notification permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          console.log("Notification permission:", permission);
        });
      }
    }
  }, []);

  // Handle new orders
  useEffect(() => {
    socket.on("newOrder", (order) => {
      console.log("New order received:", order);
      getAllOrders();

      // Show system notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("📦 New Order!", {
          body: `${order.userId.phone} ordered for ${order.totalPrice} JOD`,
          icon: "/order-icon.png",
        });
      }

      // Play sound
      const sound = new Audio(newOrderSound);
      sound.play().catch((err) => console.log("Play blocked:", err));
    });

    return () => {
      socket.off("newOrder");
    };
  }, []);

  useEffect(() => {
    getAllOrders();
  }, []);

  // useEffect(() => {
  //   if (orders) {
  //     const initialStatuses = {};
  //     orders.forEach((order) => {
  //       initialStatuses[order._id] = order.status;
  //     });
  //     setOrderStatuses(initialStatuses);
  //   }
  // }, [orders]);

  const handleStatusChange = (orderId, newStatus) => {
    // setOrderStatuses((prev) => ({
    //   ...prev,
    //   [orderId]: newStatus,
    // }));

    updateOrder(orderId, { status: newStatus });
  };

  const handleDeleteOrder = (orderId) => {
    // handleStatusChange(orderId, "Cancelled");
    deleteOrder(orderId);
  };

  console.log(orders);

  if (loading) return <Loading />;

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Order Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Total Orders:
              <span className="font-semibold text-primary">0</span>
            </p>
          </div>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Order Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Total Orders:
              <span className="font-semibold text-primary">
                {orders.length}
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
          {orders.map((order) => (
            <Card
              key={order._id}
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
                        #{order._id?.slice(-8) || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Customer:
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {order.userId?.phone || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Date:
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
                        Address:
                      </span>
                      <span className="text-sm text-foreground">
                        {order.shippingAddress?.name || "N/A"} (
                        {`Sector ${order.shippingAddress?.SECNO || "N/A"}`})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Payment:
                      </span>
                      <Badge
                        className={
                          order.payment?.status === "paid"
                            ? "bg-green-600 text-white"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {order.payment?.status?.toUpperCase() || "N/A"} (
                        {order.payment?.method || "N/A"})
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Status:
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
                              {order.status?.toUpperCase() || "N/A"}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
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
                              src={burger}
                              alt={item.productId?.name || "Product"}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="font-semibold text-foreground">
                              {item.productId?.name || "Unknown Product"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.productId?.description || ""}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty:
                              <span className="font-medium">
                                {item.quantity || 0}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {item.priceAtPurchase || 0} JOD
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
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium text-foreground">
                      {(
                        (order.totalPrice || 0) -
                        (order.shippingAddress?.deliveryCost || 0)
                      ).toFixed(1)}
                      JOD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Delivery Cost:
                    </span>
                    <span className="font-medium text-foreground">
                      {order.shippingAddress?.deliveryCost || 0} JOD
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Order Total:
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {order.totalPrice || 0} JOD
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-end">
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
                    onClick={() => handleDeleteOrder(order._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Order
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
