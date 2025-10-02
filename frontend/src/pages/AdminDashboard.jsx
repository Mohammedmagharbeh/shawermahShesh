import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import newOrderSound from "../../public/newOrder.mp3";

const socket = io("http://localhost:5000");

function AdminDashboard() {
  const [orders, setOrders] = useState([]);

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
      setOrders((prev) => [order, ...prev]);

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

  return (
    <div>
      <h2>Admin Orders</h2>
      <ul>
        {orders.map((o) => (
          <li key={o._id}>
            <strong>{o.userId.phone}</strong> ordered for {o.totalPrice} JOD
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
