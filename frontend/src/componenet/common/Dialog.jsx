// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
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
//       (sum, p) => sum + p.productId.price * p.quantity,
//       0
//     );
//     setSubtotal(newSubtotal);

//     // Update totalPrice automatically
//     setUpdatedOrder((prev) => ({
//       ...prev,
//       totalPrice: newSubtotal + Number(prev.deliveryCost),
//     }));
//   }, [updatedOrder.products, updatedOrder.deliveryCost]);

//   useEffect(() => {}, [updatedOrder.deliveryCost]);

//   const handleProductQtyChange = (index, qty) => {
//     setUpdatedOrder((prev) => {
//       const products = [...prev.products];
//       products[index].quantity = Number(qty);
//       return { ...prev, products };
//     });
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

//       toast.success("Order updated successfully");
//       updateOrders();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update order");
//     }
//   };

//   return (
//     <DialogUi>
//       <DialogTrigger asChild>
//         <Button variant="outline">{name}</Button>
//       </DialogTrigger>

//       <DialogContent className="sm:max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Edit Order</DialogTitle>
//           <DialogDescription>Update order details below</DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4 mt-2">
//           {/* Subtotal & TotalPrice */}
//           <div className="flex justify-between">
//             <div>
//               <Label>Subtotal</Label>
//               <Input type="number" value={subtotal.toFixed(2)} disabled />
//             </div>
//             <div>
//               <Label>Total Price</Label>
//               <Input
//                 type="number"
//                 value={updatedOrder.totalPrice.toFixed(2)}
//                 onChange={(e) => handleDeliveryCostChange(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Payment Status */}
//           <div>
//             <Label>Payment Status</Label>
//             <select
//               value={updatedOrder.paymentStatus}
//               onChange={(e) =>
//                 setUpdatedOrder((prev) => ({
//                   ...prev,
//                   paymentStatus: e.target.value,
//                 }))
//               }
//               className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
//             >
//               <option value="paid">Paid</option>
//               <option value="unpaid">Unpaid</option>
//             </select>
//           </div>

//           {/* Payment Method */}
//           <div>
//             <Label>Payment Method</Label>
//             <select
//               value={updatedOrder.paymentMethod}
//               onChange={(e) =>
//                 setUpdatedOrder((prev) => ({
//                   ...prev,
//                   paymentMethod: e.target.value,
//                 }))
//               }
//               className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
//             >
//               <option value="cash">Cash</option>
//               <option value="card">Card</option>
//             </select>
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
//             <select
//               value={updatedOrder.address || order.shippingAddress.name}
//               onChange={(e) => {
//                 const selectedAddress = addresses.find(
//                   (addr) => addr.name === e.target.value
//                 );
//                 setUpdatedOrder((prev) => ({
//                   ...prev,
//                   address: e.target.value,
//                   deliveryCost:
//                     selectedAddress?.deliveryCost || prev.deliveryCost,
//                   addressId: selectedAddress?._id || prev.addressId,
//                 }));
//               }}
//               className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
//             >
//               <option value="">Select an address</option>
//               {addresses.length > 0 &&
//                 addresses.map((addr) => (
//                   <option key={addr._id || addr.SECNO} value={addr.name}>
//                     {addr.name} - Delivery Cost: {addr.deliveryCost} JD
//                   </option>
//                 ))}
//             </select>
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

//           {/* Products */}
//           <div>
//             <Label>Products</Label>
//             <div className="space-y-2">
//               {updatedOrder.products.map((p, i) => (
//                 <div
//                   key={p.productId._id}
//                   className="border p-2 rounded flex justify-between items-center"
//                 >
//                   <div>
//                     {p.productId.name} - Price: {p.productId.price} JD
//                   </div>
//                   <div>
//                     <Label>Qty</Label>
//                     <Input
//                       type="number"
//                       value={p.quantity}
//                       min={1}
//                       onChange={(e) =>
//                         handleProductQtyChange(i, e.target.value)
//                       }
//                       className="w-20 ml-2"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <DialogFooter className="mt-4">
//             <DialogClose asChild>
//               <Button variant="outline" type="button">
//                 Cancel
//               </Button>
//             </DialogClose>
//             <Button type="submit">Save Changes</Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </DialogUi>
//   );
// }
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog as DialogUi,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

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
  })
  const [subtotal, setSubtotal] = useState(0)
  const [addresses, setAddresses] = useState([])

  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/locations/get`)
      const data = await res.json()
      setAddresses(data.locations || [])
    }
    fetchAddresses()
  }, [])

  // Calculate subtotal whenever products change
  useEffect(() => {
    const newSubtotal = updatedOrder.products.reduce((sum, p) => sum + p.productId.price * p.quantity, 0)
    setSubtotal(newSubtotal)

    // Update totalPrice automatically
    setUpdatedOrder((prev) => ({
      ...prev,
      totalPrice: newSubtotal + Number(prev.deliveryCost),
    }))
  }, [updatedOrder.products, updatedOrder.deliveryCost])

  useEffect(() => {}, [updatedOrder.deliveryCost])

  const handleProductQtyChange = (index, qty) => {
    setUpdatedOrder((prev) => {
      const products = [...prev.products]
      products[index].quantity = Number(qty)
      return { ...prev, products }
    })
  }

  const handleDeliveryCostChange = (value) => {
    setUpdatedOrder((prev) => ({
      ...prev,
      deliveryCost: Number(value),
      totalPrice: subtotal + Number(value),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

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
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/order/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Failed to update order")

      toast.success("Order updated successfully")
      updateOrders()
    } catch (err) {
      console.error(err)
      toast.error("Failed to update order")
    }
  }

  return (
    <DialogUi>
      <DialogTrigger asChild>
        <Button variant="outline">{name}</Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>Update order details below</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
            <div className="flex-1">
              <Label>Subtotal</Label>
              <Input type="number" value={subtotal.toFixed(2)} disabled />
            </div>
            <div className="flex-1">
              <Label>Total Price</Label>
              <Input
                type="number"
                value={updatedOrder.totalPrice.toFixed(2)}
                onChange={(e) => handleDeliveryCostChange(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <Label>Payment Status</Label>
            <select
              value={updatedOrder.paymentStatus}
              onChange={(e) =>
                setUpdatedOrder((prev) => ({
                  ...prev,
                  paymentStatus: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method</Label>
            <select
              value={updatedOrder.paymentMethod}
              onChange={(e) =>
                setUpdatedOrder((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </div>

          {/* Delivery Cost */}
          <div>
            <Label>Delivery Cost</Label>
            <Input
              type="number"
              value={updatedOrder.deliveryCost}
              onChange={(e) => handleDeliveryCostChange(e.target.value)}
            />
          </div>

          {/* Address */}
          <div>
            <Label>Address</Label>
            <select
              value={updatedOrder.address || order.shippingAddress.name}
              onChange={(e) => {
                const selectedAddress = addresses.find((addr) => addr.name === e.target.value)
                setUpdatedOrder((prev) => ({
                  ...prev,
                  address: e.target.value,
                  deliveryCost: selectedAddress?.deliveryCost || prev.deliveryCost,
                  addressId: selectedAddress?._id || prev.addressId,
                }))
              }}
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Select an address</option>
              {addresses.length > 0 &&
                addresses.map((addr) => (
                  <option key={addr._id || addr.SECNO} value={addr.name}>
                    {addr.name} - Delivery Cost: {addr.deliveryCost} JD
                  </option>
                ))}
            </select>
          </div>

          {/* Customer Phone */}
          <div>
            <Label>Customer Phone</Label>
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
            <Label>Products</Label>
            <div className="space-y-2">
              {updatedOrder.products.map((p, i) => (
                <div
                  key={p.productId._id}
                  className="border p-3 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                >
                  <div className="flex-1 text-sm sm:text-base">
                    {p.productId.name} - Price: {p.productId.price} JD
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Qty</Label>
                    <Input
                      type="number"
                      value={p.quantity}
                      min={1}
                      onChange={(e) => handleProductQtyChange(i, e.target.value)}
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button" className="w-full sm:w-auto bg-transparent">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogUi>
  )
}
