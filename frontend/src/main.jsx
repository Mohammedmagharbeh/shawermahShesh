import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./contexts/CartContext";
import { UserProvider } from "./contexts/UserContext";
import { OrderProvider } from "./contexts/OrderContext";
import "./i18n";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <UserProvider>
    <CartProvider>
      <OrderProvider>
        <App />
      </OrderProvider>
    </CartProvider>
  </UserProvider>
  // </StrictMode>
);
