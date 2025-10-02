import Login from "./componenet/log";
import Home from "./pages/Home";
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
import MyOrders from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <main className="pt-14">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/Login" element={<Login />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/product/:id" element={<ProductView />} />
            <Route
              path="/admin/add-product"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProductPanel />
                </ProtectedRoute>
              }
            />
            {/* <Route path="/admin/add-product" element={<AdminProductPanel />} /> */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
