import Login from "./componenet/log";
import Home from "./pages/Home";
import Registration from "./componenet/Registration";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout";
import ProductView from "./pages/ProductView";
import PaymentSuccess from "./pages/PaymentSuccess";
import OtpVerification from "./componenet/OtpVerification";
import { Toaster } from "react-hot-toast";
import Header from "./componenet/Header";
import Orders from "./pages/Orders";
import AdminProductPanel from "./pages/adminremot";
import PaymentFailed from "./pages/PaymentFailed";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <main className="pt-14">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/Registration" element={<Registration />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/product/:id" element={<ProductView />} />
            <Route path="/admin" element={<AdminProductPanel />} />
          </Routes>
        </main>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
