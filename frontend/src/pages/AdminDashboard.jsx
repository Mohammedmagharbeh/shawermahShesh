import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // your backend server

function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  console.log(orders);

  useEffect(() => {
    socket.on("newOrder", (order) => {
      console.log("New order received:", order);
      setOrders((prev) => [order, ...prev]); // prepend new order
    });

    // cleanup
    return () => {
      socket.off("newOrder");
    };
  }, []);

  return (
    <div>
      <h2>Admin Orders</h2>
      <ul>
        {orders.map((o) => (
          <li key={o._id}>
            <strong>{o.userId.phone}</strong> ordered for {o.totalPrice} JOD
            {/* <strong>{o.userId.phone}</strong> ordered for {o.totalPrice} JOD */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
