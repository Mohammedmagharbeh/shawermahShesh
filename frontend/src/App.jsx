import Login from "./componenet/log";
import Home from "./pages/Home/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout";
import ProductView from "./pages/ProductView";
import PaymentSuccess from "./pages/PaymentSuccess";
import OtpVerification from "./componenet/OtpVerification";
import { Toaster } from "react-hot-toast";
import Header from "./componenet/Header";
import Orders from "./pages/Orders";
import PaymentFailed from "./pages/PaymentFailed";
import MyOrders from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import { useTranslation } from "react-i18next";
import Settings from "./pages/Settings";
import { useEffect } from "react";
import StatisticsPage from "./pages/statistic";
import AdminUsersPage from "./pages/adminusers";
import Products from "./pages/Products";
import AdminSlides from "./pages/AdminSlides";
import AdminProductPanel from "./pages/MenuManagement/AdminProductPanel";
import Story from "./pages/story";
import NotFound from "./componenet/NotFound";
import JobsPage from "./pages/JobsPage";
import AdminJobs from "./pages/AdminJobs";
// import JobsPage from "./pages/JobsPage";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = localStorage.getItem("i18nextLng") || "ar";
    document.documentElement.setAttribute(
      "dir",
      currentLang === "ar" ? "rtl" : "ltr"
    );
    document.documentElement.setAttribute("lang", currentLang);
  }, []);
  //   useEffect(() => {
  //   // --- ضبط اللغة والاتجاه ---
  //   const currentLang = localStorage.getItem("i18nextLng") || "ar";
  //   document.documentElement.setAttribute(
  //     "dir",
  //     currentLang === "ar" ? "rtl" : "ltr"
  //   );
  //   document.documentElement.setAttribute("lang", currentLang);

  //   // --- منع كليك يمين و Inspect ---
  //   const disableRightClick = (e) => e.preventDefault();

  //   const disableKeys = (e) => {
  //     if (
  //       e.key === "F12" ||
  //       (e.ctrlKey && e.shiftKey && e.key === "I") ||
  //       (e.ctrlKey && e.shiftKey && e.key === "C") ||
  //       (e.ctrlKey && e.key === "U")
  //     ) {
  //       e.preventDefault();
  //     }
  //   };

  //   document.addEventListener("contextmenu", disableRightClick);
  //   document.addEventListener("keydown", disableKeys);

  //   // --- تنظيف الأحداث عند الخروج ---
  //   return () => {
  //     document.removeEventListener("contextmenu", disableRightClick);
  //     document.removeEventListener("keydown", disableKeys);
  //   };
  // }, []);

  return (
    <div
      className={`${i18n.language === "ar" ? "text-right" : "text-left"} App`}
    >
      {/* <LanguageProvider> */}
      <BrowserRouter>
        <Header />
        <main className="pt-14">
          <Routes>
            <Route path="/AdminJobs" element={<AdminJobs />} />
            <Route path="/JobsPage" element={<JobsPage />} />

            <Route path="/" index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/slides" element={<AdminSlides />} />
            <Route path="/story" element={<Story />} />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
      <Toaster />
      {/* </LanguageProvider> */}
    </div>
  );
}

export default App;
