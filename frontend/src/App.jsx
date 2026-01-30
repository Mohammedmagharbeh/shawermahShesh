import Login from "./components/log";
import EmployeeLogin from "./components/EmployeeLogin";
import Home from "./pages/Home/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout";
import ProductView from "./pages/ProductView";
import PaymentSuccess from "./pages/PaymentSuccess";
import OtpVerification from "./components/OtpVerification";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
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
import NotFound from "./components/NotFound";
import JobsPage from "./pages/JobsPage";
import AdminJobs from "./pages/AdminJobs";
import { useBusinessHours } from "./hooks/useBusinessHours";

function App() {
  const { i18n } = useTranslation();

  useBusinessHours();

  useEffect(() => {
    const currentLang = localStorage.getItem("i18nextLng") || "ar";
    document.documentElement.setAttribute(
      "dir",
      currentLang === "ar" ? "rtl" : "ltr",
    );
    document.documentElement.setAttribute("lang", currentLang);
  }, [i18n.language]);

  return (
    <div
      className={`${i18n.language === "ar" ? "text-right" : "text-left"} App`}
    >
      <BrowserRouter>
        <Header />
        <main className="pt-14">
          <Routes>
            <Route path="/JobsPage" element={<JobsPage />} />
            <Route path="/" index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/employee-login" element={<EmployeeLogin />} />
            <Route path="/slides" element={<AdminSlides />} />
            <Route path="/story" element={<Story />} />
            <Route path="/otp-verification" element={<OtpVerification />} />

            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
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
              path="/success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cancel"
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
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/users-control"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/statistics"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StatisticsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/AdminJobs"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminJobs />
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

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>

      {/* Global Toaster */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontFamily:
              i18n.language === "ar" ? "Tajawal, sans-serif" : "inherit",
          },
        }}
      />
    </div>
  );
}

export default App;
