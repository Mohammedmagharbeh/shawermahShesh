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
import { useTranslation } from "react-i18next";
import { useUser } from "./contexts/UserContext";
import Settings from "./pages/Settings";
import { useEffect } from "react";
import StatisticsPage from "./pages/statistic";
import AdminUsersPage from "./pages/adminusers";
import Newproduct from "./pages/newproduct";
// import LanguageProvider from "./contexts/LanguageContext";

function App() {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useUser();

  useEffect(() => {
    const currentLang = localStorage.getItem("i18nextLng") || "ar";
    document.documentElement.setAttribute(
      "dir",
      currentLang === "ar" ? "rtl" : "ltr"
    );
    document.documentElement.setAttribute("lang", currentLang);
  }, []);

  return (
    <div
      className={`${i18n.language === "ar" ? "text-right" : "text-left"} App`}
    >
      {/* <LanguageProvider> */}
      <BrowserRouter>
        {isAuthenticated && <Header />}
        <main className="pt-14">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/newproduct" element={<Newproduct />} />
            <Route path="/admin/users-control" element={<AdminUsersPage />} />
            <Route
              path="/admin/statistics"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StatisticsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-failed"
              element={
                <ProtectedRoute>
                  <PaymentFailed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProtectedRoute>
                  <ProductView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-product"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProductPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "employee"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
      <Toaster />
      {/* </LanguageProvider> */}
    </div>
  );
}

export default App;
