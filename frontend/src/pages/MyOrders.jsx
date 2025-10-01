import { useOrder } from "@/contexts/OrderContext";
import { useUser } from "@/contexts/UserContext";
import React, { useEffect } from "react";
import burger from "../assets/burger.jpg";

function MyOrders() {
  const { orders, getOrdersByUserId } = useOrder();
  const { user } = useUser();

  useEffect(() => {
    if (user?._id) {
      getOrdersByUserId();
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center xs2:mx-20 md:mx-[135px] gap-5 my-20 text-start">
      <h1 className="text-2xl">Your Orders: ({orders?.length})</h1>
      {orders.map((order, index) => (
        <div key={index} className="flex flex-col gap-4 shadow-md py-6 px-12">
          <div className="flex justify-between items-center gap-2 xs2:flex-col md:flex-row">
            <h1>
              <span className="font-semibold">Order date: </span>
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h1>
            <p className="text-green-500 font-bold">Processing</p>
          </div>
          <div>
            {order.products.map((item, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex justify-between items-center gap-2 xs2:flex-col md:flex-row">
                  <div className="flex gap-4 items-center xs2:flex-col md:flex-row">
                    <img src={burger} alt="product image" width={70} />
                    <p className="font-semibold">{item.productId.name}</p>
                  </div>
                  <p className="font-medium">${item.productId.price}</p>
                </div>
                <div className="border-t border-button2 my-4"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center gap-3 xs2:flex-col md:flex-row">
            <p>Total: ${order.totalPrice}</p>
            <button
              className="border border-black rounded-md py-4 px-12 hover:bg-button2 hover:text-white"
              //   onClick={() => cancelOrder(order, index)}
            >
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyOrders;
