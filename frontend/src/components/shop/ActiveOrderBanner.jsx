import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useOrder } from "@/contexts/OrderContext";
import { useUser } from "@/contexts/UserContext";
import socket from "@/utils/socket";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Bike,
  Package,
  Clock,
  Phone,
  KeyRound,
  ChevronRight,
  ExternalLink,
  Flame,
  Navigation,
} from "lucide-react";

const ACTIVE_STATUSES = [
  "processing",
  "confirmed",
  "readyforpickup",
  "shipped",
  "outfordelivery",
];

// يجيب اسم الصنف بغض النظر عن شكل الداتا (عدّلها إذا شكل الأصناف عندك مختلف)
const getItemName = (item, lang) => {
  const raw =
    item?.name ||
    item?.food?.name ||
    item?.product?.name ||
    item?.productId?.name ||
    item?.foodId?.name;
  if (!raw) return "—";
  if (typeof raw === "string") return raw;
  return raw[lang] || raw.ar || raw.en || "—";
};

const getItems = (order) =>
  order?.items || order?.orderItems || order?.products || order?.foods || [];

export default function ActiveOrderBanner() {
  const { getActiveOrder } = useOrder();
  const { user } = useUser();
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const lang = localStorage.getItem("i18nextLng") || "ar";

  const [activeOrder, setActiveOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const dragControls = useDragControls();

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

      if (
        (activeOrder && String(data._id) === String(activeOrder._id)) ||
        (orderUserId && orderUserId === currentUserId)
      ) {
        const norm = String(data.status || "").toLowerCase();
        if (
          ["delivered", "cancelled", "canceled", "submitted"].includes(norm)
        ) {
          setActiveOrder(null);
          setOpen(false);
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

    const timer = setInterval(() => {
      fetchActive();
    }, 10000);

    return () => {
      socket.off("updatedOrder", handleUpdatedOrder);
      socket.off("driverAssigned", handleDriverAssigned);
      clearInterval(timer);
    };
  }, [user?._id, activeOrder?._id]);

  // قفل سكرول الصفحة لما الستارة مفتوحة
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!activeOrder) return null;

  const statusNorm = String(activeOrder.status || "").toLowerCase();
  const isDelivery = activeOrder.orderType === "delivery";
  const driver = activeOrder.assignedRiderId;
  const otp = activeOrder.deliveryOtp;
  const items = getItems(activeOrder);

  const getStatusConfig = () => {
    if (statusNorm === "confirmed") {
      return {
        label: isDelivery
          ? "تم التأكيد - قيد التجهيز بالمطبخ 🔥"
          : "تم التأكيد - قيد التجهيز 👨‍🍳",
        bannerBorder: "border-purple-300",
        bannerBg: "from-purple-50 via-white to-red-50/30",
        dot: "bg-purple-600",
        icon: Flame,
        iconColor: "text-purple-600",
      };
    }

    if (statusNorm === "readyforpickup") {
      return {
        label: isDelivery
          ? "بانتظار السائق (طلبك جاهز بالمطعم) 📦"
          : "جاهز للاستلام من الفرع 🛍️",
        bannerBorder: "border-amber-400",
        bannerBg: "from-amber-50/80 via-white to-yellow-50/40",
        dot: "bg-amber-500",
        icon: Package,
        iconColor: "text-amber-600",
      };
    }

    if (statusNorm === "shipped" || statusNorm === "outfordelivery") {
      return {
        label: "طلبك في الطريق إلك 🚗💨",
        bannerBorder: "border-blue-400",
        bannerBg: "from-blue-50/80 via-white to-indigo-50/40",
        dot: "bg-blue-600",
        icon: Navigation,
        iconColor: "text-blue-600",
      };
    }

    return {
      label: "طلبك قيد المعالجة ⏳",
      bannerBorder: "border-gray-200",
      bannerBg: "from-gray-50 via-white to-white",
      dot: "bg-gray-600",
      icon: Clock,
      iconColor: "text-gray-600",
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const orderNumber = activeOrder.sequenceNumber || activeOrder._id.slice(-6);

  return (
    <>
      {/* ===== البانر: عرض معلومات فقط، الضغط عليه بفتح الستارة ===== */}
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mb-6 w-full"
      >
        <div
          onClick={() => setOpen(true)}
          className={`flex items-center justify-between gap-3 cursor-pointer select-none rounded-3xl border-2 ${statusConfig.bannerBorder} bg-gradient-to-r ${statusConfig.bannerBg} p-4 shadow-lg shadow-gray-200/50 transition-all active:scale-[0.99]`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center ${statusConfig.iconColor} border border-gray-100 flex-shrink-0`}
            >
              <StatusIcon className="w-6 h-6 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">
                  {isDelivery ? "طلب توصيل نشط" : "طلب استلام نشط"}
                </span>
                <span className="text-base font-black text-red-700 tracking-tight">
                  #{orderNumber}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-700 truncate">
                {statusConfig.label}
              </p>
            </div>
          </div>

          <ChevronRight
            className={`w-5 h-5 text-gray-400 flex-shrink-0 ${
              isRtl ? "rotate-180" : ""
            }`}
          />
        </div>
      </motion.div>

      {/* ===== الستارة ===== */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[55] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="fixed bottom-0 inset-x-0 z-[60] mx-auto max-w-2xl rounded-t-3xl bg-white shadow-2xl max-h-[85vh] flex flex-col"
              dir={i18n.dir()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setOpen(false);
                }
              }}
            >
              {/* المقبض: السحب من هون بس عشان ما يتعارض مع السكرول */}
              <div
                className="pt-3 pb-2 cursor-grab touch-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300" />
              </div>

              <div className="overflow-y-auto px-5 pb-8">
                {/* الحالة */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`h-3 w-3 rounded-full ${statusConfig.dot}`}
                  />
                  <h3 className="text-lg font-black text-gray-900">
                    طلب #{orderNumber}
                  </h3>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-5">
                  {statusConfig.label}
                </p>

                {/* الأصناف */}
                <p className="mb-2 text-xs font-bold text-gray-400">شو طلبت</p>
                {items.length > 0 ? (
                  <ul className="mb-5 divide-y rounded-2xl border border-gray-100 bg-white">
                    {items.map((item, i) => (
                      <li
                        key={item._id || i}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                      >
                        <span className="font-bold text-gray-900">
                          {getItemName(item, lang)}
                        </span>
                        <span className="font-mono text-gray-500">
                          × {item.quantity || item.qty || 1}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mb-5 rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                    تفاصيل الأصناف غير متوفرة
                  </div>
                )}

                {/* السايق */}
                {isDelivery && (
                  <>
                    <p className="mb-2 text-xs font-bold text-gray-400">
                      سائق التوصيل
                    </p>
                    <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                          <Bike className="w-5 h-5" />
                        </div>
                        {driver ? (
                          <p className="text-sm font-black text-gray-900">
                            {driver.name || driver.username}
                          </p>
                        ) : (
                          <p className="text-sm font-bold text-amber-700 animate-pulse">
                            جاري تعيين سائق...
                          </p>
                        )}
                      </div>

                      {driver?.phone && (
                        <a
                          href={`tel:${driver.phone}`}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span dir="ltr">{driver.phone}</span>
                        </a>
                      )}
                    </div>
                  </>
                )}

                {/* OTP */}
                {otp ? (
                  <div className="mb-5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-4 shadow-md shadow-red-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-red-100 block">
                          رمز تأكيد الاستلام (OTP)
                        </span>
                        <span className="text-[11px] text-red-200 block">
                          أعطه للسائق عند الاستلام
                        </span>
                      </div>
                    </div>
                    <div
                      className="bg-white text-red-700 font-mono font-black text-2xl tracking-widest px-3 py-1 rounded-xl border border-red-200 select-all"
                      dir="ltr"
                    >
                      {otp}
                    </div>
                  </div>
                ) : isDelivery &&
                  statusNorm !== "shipped" &&
                  statusNorm !== "outfordelivery" ? (
                  <div className="mb-5 rounded-2xl bg-gray-50 p-4 flex items-center gap-2.5 text-xs text-gray-600">
                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="leading-tight">
                      سيظهر <strong>رمز الاستلام (OTP)</strong> هنا فور انطلاق
                      السائق بالطلب.
                    </span>
                  </div>
                ) : null}

                {/* الإجمالي + رابط الصفحة الكاملة */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
                  <span className="text-gray-500 font-medium">
                    إجمالي الطلب:{" "}
                    <strong className="text-red-700 font-mono">
                      {activeOrder.totalPrice?.toFixed(2)} JOD
                    </strong>
                  </span>

                  <Link
                    to={`/order/${activeOrder._id}`}
                    className="inline-flex items-center gap-1 font-bold text-red-700 hover:text-red-800 transition-colors"
                  >
                    {/* <span>متابعة خط سير الطلب</span> */}
                    {/* <ExternalLink className="w-4 h-4" /> */}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
