import { useOrder } from "@/contexts/OrderContext";
import { useUser } from "@/contexts/UserContext";
import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar } from "lucide-react";
import burger from "../assets/burger.jpg";

function MyOrders() {
  const { orders, getOrdersByUserId } = useOrder();
  const { user } = useUser();

  useEffect(() => {
    if (user?._id) {
      getOrdersByUserId();
    }
  }, [user]);

  const statusColors = {
    Processing: "bg-secondary text-secondary-foreground",
    Confirmed: "bg-purple-500 text-primary-foreground",
    Shipped: "bg-blue-500 text-white",
    Delivered: "bg-green-600 text-white",
    Cancelled: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Your Orders</h1>
        </div>
        <p className="text-muted-foreground">
          {orders?.length === 0
            ? "No orders yet"
            : `${orders?.length} order${orders?.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-muted/50 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <Badge className={`${statusColors[order.status]} w-fit`}>
                  {order.status}
                </Badge>
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
                            src={burger}
                            alt={item.productId.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {item.productId.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity || 1}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground sm:text-right">
                        {item.productId.price} JOD
                      </p>
                    </div>
                    {productIndex < order.products.length - 1 && (
                      <div className="border-t border-border mt-4" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-muted-foreground">
                    Order Total
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {order.totalPrice} JOD
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders?.length === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <Package className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No orders yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Your order history will appear here once you make a purchase
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default MyOrders;
