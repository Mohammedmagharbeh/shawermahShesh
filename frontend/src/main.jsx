import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./contexts/CartContext";

const userId = "68d53731440f4c97ce2c036f";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CartProvider userId={userId}>
      <App />
    </CartProvider>
  </StrictMode>
);
