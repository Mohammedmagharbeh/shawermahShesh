// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { useTranslation } from "react-i18next";

// import {
//   Dialog as DialogUi,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import toast from "react-hot-toast";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// export function Dialog({ name, order, updateOrders }) {
//   const [updatedOrder, setUpdatedOrder] = useState({
//     totalPrice: order.totalPrice,
//     paymentStatus: order.payment?.status,
//     paymentMethod: order.payment?.method,
//     deliveryCost: order.shippingAddress?.deliveryCost,
//     addressId: order.shippingAddress?._id,
//     address: order.shippingAddress?.name,
//     customerPhone: order.userId?.phone,
//     products: order.products.map((p) => ({
//       ...p,
//       quantity: p.quantity,
//     })),
//   });
//   const [subtotal, setSubtotal] = useState(0);
//   const [addresses, setAddresses] = useState([]);
//   const { t } = useTranslation();

//   useEffect(() => {
//     const fetchAddresses = async () => {
//       const res = await fetch(`${import.meta.env.VITE_BASE_URL}/locations/get`);
//       const data = await res.json();
//       setAddresses(data.locations || []);
//     };
//     fetchAddresses();
//   }, []);

//   // Calculate subtotal whenever products change
//   useEffect(() => {
//     const newSubtotal = updatedOrder.products.reduce(
//       (sum, p) => sum + p.productId?.price?? 0 * p.quantity,
//       0
//     );
//     setSubtotal(newSubtotal);

//     // Update totalPrice automatically
//     setUpdatedOrder((prev) => ({
//       ...prev,
//       totalPrice: newSubtotal + Number(prev.deliveryCost),
//     }));
//   }, [updatedOrder.products, updatedOrder.deliveryCost]);

//   const handleProductQtyChange = (index, qty) => {
//     setUpdatedOrder((prev) => {
//       const products = [...prev.products];
//       products[index].quantity = Number(qty);
//       return { ...prev, products };
//     });
//   };

//   const handleTotalPriceChange = (value) => {
//     setUpdatedOrder((prev) => ({
//       ...prev,
//       totalPrice: Number(value),
//       deliveryCost: Number(value) - subtotal,
//     }));
//   };

//   const handleDeliveryCostChange = (value) => {
//     setUpdatedOrder((prev) => ({
//       ...prev,
//       deliveryCost: Number(value),
//       totalPrice: subtotal + Number(value),
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       totalPrice: Number(updatedOrder.totalPrice),
//       payment: {
//         status: updatedOrder.paymentStatus,
//         method: updatedOrder.paymentMethod,
//       },
//       shippingAddress: {
//         ...order.shippingAddress,
//         deliveryCost: Number(updatedOrder.deliveryCost),
//         name: updatedOrder.address,
//         _id: updatedOrder.addressId,
//       },
//       userId: order.userId._id,
//       products: updatedOrder.products.map((p) => ({
//         productId: p.productId._id,
//         quantity: p.quantity,
//         priceAtPurchase: p.productId.price,
//       })),
//     };

//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_BASE_URL}/order/${order._id}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) throw new Error("Failed to update order");

// toast.success(t("order_updated_successfully"));
//       updateOrders();
//     } catch (err) {
//       console.error(err);
// toast.error(t("failed_to_update_order"));
//     }
//   };

//   return (
//     <DialogUi>
//       <DialogTrigger asChild>
//         <Button variant="outline">{name}</Button>
//       </DialogTrigger>

//       <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Edit Order</DialogTitle>
//           <DialogDescription>Update order details below</DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4 mt-2">
//           <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
//             <div className="flex-1">
//               <Label>Subtotal</Label>
//               <Input type="number" value={subtotal.toFixed(2)} disabled />
//             </div>
//             <div className="flex-1">
//               <Label>Total Price</Label>
//               <Input
//                 type="number"
//                 value={updatedOrder.totalPrice.toFixed(2)}
//                 onChange={(e) => handleTotalPriceChange(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Payment Status */}
//           <div>
//             <Label>Payment Status</Label>
//             <Select
//               value={updatedOrder.paymentStatus || order.payment.status}
//               onValueChange={(value) =>
//                 setUpdatedOrder((prev) => ({
//                   ...prev,
//                   paymentStatus: value,
//                 }))
//               }
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Payment Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="paid">Paid</SelectItem>
//                 <SelectItem value="unpaid">Unpaid</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Payment Method */}
//           <div>
//             <Label>Payment Method</Label>
//             <Select
//               value={updatedOrder.paymentMethod || order.payment.method}
//               onValueChange={(value) =>
//                 setUpdatedOrder((prev) => ({
//                   ...prev,
//                   paymentMethod: value,
//                 }))
//               }
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Payment Method" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="cash">Cash</SelectItem>
//                 <SelectItem value="card">Card</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Delivery Cost */}
//           <div>
//             <Label>Delivery Cost</Label>
//             <Input
//               type="number"
//               value={updatedOrder.deliveryCost}
//               onChange={(e) => handleDeliveryCostChange(e.target.value)}
//             />
//           </div>

//           {/* Address */}
//           <div>
//             <Label>Address</Label>
//             <Select
//               value={updatedOrder.address}
//               onValueChange={(value) => {
//                 const selectedAddress = addresses.find(
//                   (addr) => addr.name === value
//                 );
//                 setUpdatedOrder((prev) => ({
//                   ...prev,
//                   address: value,
//                   deliveryCost:
//                     selectedAddress?.deliveryCost || prev.deliveryCost,
//                   addressId: selectedAddress?._id || prev.addressId,
//                 }));
//               }}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select an address" />
//               </SelectTrigger>
//               <SelectContent>
//                 {addresses.length > 0 &&
//                   addresses.map((addr) => (
//                     <SelectItem value={addr.name} key={addr._id || addr.SECNO}>
//                       {addr.name} - Delivery Cost: {addr.deliveryCost} JD
//                     </SelectItem>
//                   ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Customer Phone */}
//           <div>
//             <Label>Customer Phone</Label>
//             <Input
//               type="tel"
//               value={updatedOrder.customerPhone}
//               onChange={(e) =>
//                 setUpdatedOrder((prev) => ({
//                   ...prev,
//                   customerPhone: e.target.value,
//                 }))
//               }
//             />
//           </div>

//           <div>
//             <Label>Products</Label>
//             <div className="space-y-2">
//               {updatedOrder.products.map((p, i) => (
//                 <div
//                   key={p.productId?._id}
//                   className="border p-3 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
//                 >
//                   <div className="flex-1 text-sm sm:text-base">
//                     {p.productId?.name??"not found"} - Price: {p.productId?.price??"not found"} JD
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Label className="text-sm">Qty</Label>
//                     <Input
//                       type="number"
//                       value={p.quantity}
//                       min={1}
//                       onChange={(e) =>
//                         handleProductQtyChange(i, e.target.value)
//                       }
//                       className="w-20"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
//             <DialogClose asChild>
//               <Button
//                 variant="outline"
//                 type="button"
//                 className="w-full sm:w-auto bg-transparent"
//               >
//                 Cancel
//               </Button>
//             </DialogClose>
//             <Button type="submit" className="w-full sm:w-auto">
//               Save Changes
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </DialogUi>
//   );
// }
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import {
  Dialog as DialogUi,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Dialog({ name, order, updateOrders }) {
  const [updatedOrder, setUpdatedOrder] = useState({
    totalPrice: order.totalPrice,
    paymentStatus: order.payment?.status,
    paymentMethod: order.payment?.method,
    deliveryCost: order.shippingAddress?.deliveryCost,
    addressId: order.shippingAddress?._id,
    address: order.shippingAddress?.name,
    customerPhone: order.userId?.phone,
    products: order.products.map((p) => ({
      ...p,
      quantity: p.quantity,
    })),
  });

  const [subtotal, setSubtotal] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/locations/get`);
      const data = await res.json();
      setAddresses(data.locations || []);
    };
    fetchAddresses();
  }, []);

  useEffect(() => {
    const newSubtotal = updatedOrder.products.reduce(
      (sum, p) => sum + (p.productId?.price ?? 0) * p.quantity,
      0
    );
    setSubtotal(newSubtotal);

    setUpdatedOrder((prev) => ({
      ...prev,
      totalPrice: newSubtotal + Number(prev.deliveryCost),
    }));
  }, [updatedOrder.products, updatedOrder.deliveryCost]);

  const handleProductQtyChange = (index, qty) => {
    setUpdatedOrder((prev) => {
      const products = [...prev.products];
      products[index].quantity = Number(qty);
      return { ...prev, products };
    });
  };

  const handleTotalPriceChange = (value) => {
    setUpdatedOrder((prev) => ({
      ...prev,
      totalPrice: Number(value),
      deliveryCost: Number(value) - subtotal,
    }));
  };

  const handleDeliveryCostChange = (value) => {
    setUpdatedOrder((prev) => ({
      ...prev,
      deliveryCost: Number(value),
      totalPrice: subtotal + Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      totalPrice: Number(updatedOrder.totalPrice),
      payment: {
        status: updatedOrder.paymentStatus,
        method: updatedOrder.paymentMethod,
      },
      shippingAddress: {
        ...order.shippingAddress,
        deliveryCost: Number(updatedOrder.deliveryCost),
        name: updatedOrder.address,
        _id: updatedOrder.addressId,
      },
      userId: order.userId._id,
      products: updatedOrder.products.map((p) => ({
        productId: p.productId._id,
        quantity: p.quantity,
        priceAtPurchase: p.productId.price,
      })),
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/order/${order._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update order");

      toast.success(t("order_updated_successfully"));
      updateOrders();
    } catch (err) {
      console.error(err);
      toast.error(t("failed_to_update_order"));
    }
  };

  return (
    <DialogUi>
      <DialogTrigger asChild>
        <Button variant="outline">{name}</Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("edit_order")}</DialogTitle>
          <DialogDescription>{t("update_order_details")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
            <div className="flex-1">
              <Label>{t("subtotal")}</Label>
              <Input type="number" value={subtotal.toFixed(2)} disabled />
            </div>
            <div className="flex-1">
              <Label>{t("total_price")}</Label>
              <Input
                type="number"
                value={updatedOrder.totalPrice.toFixed(2)}
                onChange={(e) => handleTotalPriceChange(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>{t("payment_status")}</Label>
            <Select
              value={updatedOrder.paymentStatus || order.payment.status}
              onValueChange={(value) =>
                setUpdatedOrder((prev) => ({ ...prev, paymentStatus: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("select_payment_status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">{t("paid")}</SelectItem>
                <SelectItem value="unpaid">{t("unpaid")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("payment_method")}</Label>
            <Select
              value={updatedOrder.paymentMethod || order.payment.method}
              onValueChange={(value) =>
                setUpdatedOrder((prev) => ({ ...prev, paymentMethod: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("select_payment_method")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t("cash")}</SelectItem>
                <SelectItem value="card">{t("card")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("delivery_cost")}</Label>
            <Input
              type="number"
              value={updatedOrder.deliveryCost}
              onChange={(e) => handleDeliveryCostChange(e.target.value)}
            />
          </div>

          <div>
            <Label>{t("address")}</Label>
            <Select
              value={updatedOrder.address}
              onValueChange={(value) => {
                const selectedAddress = addresses.find(
                  (addr) => addr.name === value
                );
                setUpdatedOrder((prev) => ({
                  ...prev,
                  address: value,
                  deliveryCost:
                    selectedAddress?.deliveryCost || prev.deliveryCost,
                  addressId: selectedAddress?._id || prev.addressId,
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("select_address")} />
              </SelectTrigger>
              <SelectContent>
                {addresses.length > 0 &&
                  addresses.map((addr) => (
                    <SelectItem
                      value={addr.name}
                      key={addr._id || addr.SECNO}
                    >
                      {addr.name} - {t("delivery_cost")}: {addr.deliveryCost} JD
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("customer_phone")}</Label>
            <Input
              type="tel"
              value={updatedOrder.customerPhone}
              onChange={(e) =>
                setUpdatedOrder((prev) => ({
                  ...prev,
                  customerPhone: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label>{t("products")}</Label>
            <div className="space-y-2">
              {updatedOrder.products.map((p, i) => (
                <div
                  key={p.productId?._id}
                  className="border p-3 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                >
                  <div className="flex-1 text-sm sm:text-base">
                    {p.productId?.name ?? t("not_found")} - {t("price")}:{" "}
                    {p.productId?.price ?? t("not_found")} JD
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">{t("qty")}</Label>
                    <Input
                      type="number"
                      value={p.quantity}
                      min={1}
                      onChange={(e) =>
                        handleProductQtyChange(i, e.target.value)
                      }
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                className="w-full sm:w-auto bg-transparent"
              >
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" className="w-full sm:w-auto">
              {t("save_changes")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogUi>
  );
}
