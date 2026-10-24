import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useOrder } from "@/contexts/OrderContext";
import { useUser } from "@/contexts/UserContext";
import socket from "@/utils/socket";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Bike,
  Package,
  Clock,
  Phone,
  User,
  KeyRound,
  ChevronRight,
  ExternalLink,
  Flame,
  Navigation,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ACTIVE_STATUSES = [
  "processing",
  "confirmed",
  "readyforpickup",
  "shipped",
  "outfordelivery",
];

export default function ActiveOrderBanner() {
  const { getActiveOrder } = useOrder();
  const { user } = useUser();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchActive = async () => {
    if (!user?.token) return;
    try {
      const order = await getActiveOrder();
      if (order && order.status) {
        const norm = String(order.status).toLowerCase();
        if (ACTIVE_STATUSES.includes(norm)) {
          setActiveOrder(order);
          return;
        }
      }
      setActiveOrder(null);
    } catch (err) {
      console.error("Failed to load active order:", err);
    }
  };

  useEffect(() => {
    fetchActive();
  }, [user?.token]);

  // Real-time synchronization via Socket.IO
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleUpdatedOrder = (data) => {
      if (!data) return;
      const orderUserId = String(data.userId?._id || data.userId || "");
      const currentUserId = String(user?._id || user?.id || "");

      // Check if this updated order belongs to this customer
      if (
        (activeOrder && String(data._id) === String(activeOrder._id)) ||
        (orderUserId && orderUserId === currentUserId)
      ) {
        const norm = String(data.status || "").toLowerCase();
        if (["delivered", "cancelled", "canceled", "submitted"].includes(norm)) {
          setActiveOrder(null);
        } else if (ACTIVE_STATUSES.includes(norm)) {
          setActiveOrder(data);
        }
      }
    };

    const handleDriverAssigned = (data) => {
      if (!data) return;
      if (activeOrder && String(data.orderId) === String(activeOrder._id)) {
        if (data.order) {
          setActiveOrder(data.order);
        } else {
          fetchActive();
        }
      }
    };

    socket.on("updatedOrder", handleUpdatedOrder);
    socket.on("driverAssigned", handleDriverAssigned);

    // Periodic check every 10 seconds to ensure freshness
    const timer = setInterval(() => {
      fetchActive();
    }, 10000);

    return () => {
      socket.off("updatedOrder", handleUpdatedOrder);
      socket.off("driverAssigned", handleDriverAssigned);
      clearInterval(timer);
    };
  }, [user?._id, activeOrder?._id]);

  if (!activeOrder) return null;

  const statusNorm = String(activeOrder.status || "").toLowerCase();
  const isDelivery = activeOrder.orderType === "delivery";
  const driver = activeOrder.assignedRiderId;
  const otp = activeOrder.deliveryOtp;

  // Status visual configurations
  const getStatusConfig = () => {
    if (statusNorm === "confirmed") {
      return {
        label: isDelivery ? "تم التأكيد - قيد التجهيز بالمطبخ 🔥" : "تم التأكيد - قيد التجهيز 👨‍🍳",
        badgeBg: "bg-purple-600 text-white",
        bannerBorder: "border-purple-300",
        bannerBg: "from-purple-50 via-white to-red-50/30",
        icon: Flame,
        iconColor: "text-purple-600",
      };
    }

    if (statusNorm === "readyforpickup") {
      return {
        label: isDelivery ? "بانتظار السائق (طلبك جاهز بالمطعم) 📦" : "جاهز للاستلام من الفرع 🛍️",
        badgeBg: "bg-amber-500 text-white animate-pulse",
        bannerBorder: "border-amber-400",
        bannerBg: "from-amber-50/80 via-white to-yellow-50/40",
        icon: Package,
        iconColor: "text-amber-600",
      };
    }

    if (statusNorm === "shipped" || statusNorm === "outfordelivery") {
      return {
        label: "طلبك في الطريق إلك 🚗💨",
        badgeBg: "bg-blue-600 text-white animate-pulse",
        bannerBorder: "border-blue-400",
        bannerBg: "from-blue-50/80 via-white to-indigo-50/40",
        icon: Navigation,
        iconColor: "text-blue-600",
      };
    }

    return {
      label: "طلبك قيد المعالجة ⏳",
      badgeBg: "bg-gray-700 text-white",
      bannerBorder: "border-gray-200",
      bannerBg: "from-gray-50 via-white to-white",
      icon: Clock,
      iconColor: "text-gray-600",
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mb-6 w-full"
      >
        <div
          className={`relative overflow-hidden rounded-3xl border-2 ${statusConfig.bannerBorder} bg-gradient-to-r ${statusConfig.bannerBg} p-4 sm:p-5 shadow-lg shadow-gray-200/50 transition-all`}
        >
          {/* Top Row: Order Header & Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200/70">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center ${statusConfig.iconColor} border border-gray-100 flex-shrink-0`}
              >
                <StatusIcon className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">
                    {isDelivery ? "طلب توصيل نشط" : "طلب استلام نشط"}
                  </span>
                  <span className="text-base font-black text-red-700 tracking-tight">
                    #{activeOrder.sequenceNumber || activeOrder._id.slice(-6)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-700">
                  {statusConfig.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={`${statusConfig.badgeBg} font-black text-xs px-3 py-1 rounded-full shadow-sm`}>
                {statusConfig.label.split(" ")[0]} {statusConfig.label.split(" ")[1] || ""}
              </Badge>

              <Link to={`/order/${activeOrder._id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 text-xs font-bold h-8 px-2.5 flex items-center gap-1 shadow-sm"
                >
                  <span>التفاصيل</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Middle Details Grid: Driver Info & OTP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            {/* Driver Info Card */}
            {isDelivery && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400">سائق التوصيل</p>
                    {driver ? (
                      <p className="text-xs font-black text-gray-900">
                        {driver.name || driver.username}
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-amber-700 animate-pulse">
                        جاري تعيين سائق...
                      </p>
                    )}
                  </div>
                </div>

                {driver && driver.phone && (
                  <a
                    href={`tel:${driver.phone}`}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl shadow-sm transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span dir="ltr">{driver.phone}</span>
                  </a>
                )}
              </div>
            )}

            {/* OTP Display Box (when generated or in delivery) */}
            {otp ? (
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-3 shadow-md shadow-red-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-red-100 block">
                      رمز تأكيد الاستلام (OTP)
                    </span>
                    <span className="text-[10px] text-red-200 block">
                      أعطه للسائق عند الاستلام
                    </span>
                  </div>
                </div>

                <div
                  className="bg-white text-red-700 font-mono font-black text-2xl tracking-widest px-3 py-1 rounded-xl shadow-inner border border-red-200 select-all"
                  dir="ltr"
                >
                  {otp}
                </div>
              </div>
            ) : isDelivery && statusNorm !== "shipped" && statusNorm !== "outfordelivery" ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-2.5 text-xs text-gray-600">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-[11px] leading-tight">
                  سيظهر <strong>رمز الاستلام (OTP)</strong> هنا فور انطلاق السائق بالطلب لتسليمه لك.
                </span>
              </div>
            ) : null}
          </div>

          {/* Quick Footer: Price and Link */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200/50 text-xs">
            <span className="text-gray-500 font-medium">
              إجمالي الطلب:{" "}
              <strong className="text-red-700 font-mono text-sm">
                {activeOrder.totalPrice?.toFixed(2)} JOD
              </strong>
            </span>

            <Link
              to={`/order/${activeOrder._id}`}
              className="inline-flex items-center gap-1 font-bold text-red-700 hover:text-red-800 transition-colors"
            >
              <span>متابعة خط سير الطلب</span>
              <ChevronRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
