import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import newOrderSound from "../../public/newOrder.mp3";

const socket = io("http://localhost:5000");

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [audio, setAudio] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    socket.on("newOrder", (order) => {
      console.log("New order received:", order);
      setOrders((prev) => [order, ...prev]);
    });

    return () => {
      socket.off("newOrder");
    };
  }, []);

  // Preload audio
  useEffect(() => {
    const sound = new Audio(newOrderSound);
    setAudio(sound);
  }, []);

  // Play sound when new orders arrive (only if unlocked)
  useEffect(() => {
    if (orders.length > 0 && audio && isUnlocked) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.log("Play blocked:", err));
    }
  }, [orders]);

  // Unlock audio on first user click
  const unlockAudio = () => {
    if (audio) {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        setIsUnlocked(true);
        console.log("🔓 Audio unlocked");
      });
    }
  };

  return (
    <div onClick={!isUnlocked ? unlockAudio : undefined}>
      {!isUnlocked && <p>Click anywhere to enable sounds 🔊</p>}
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
