import { useEffect, useState, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { deliveryService } from "@/services/deliveryService";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  Bike,
  Package,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  QrCode,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Navigation,
  KeyRound,
  Camera,
  X,
  Volume2,
  LogOut,
  ChevronDown,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BRANCH_QR_CODE = "shawarmasheesh_branch_1_checkin";

export default function DriverDashboard() {
  const { user, logout } = useUser();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const isAdmin = user?.role === "admin";

  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Admin simulation: list of all registered riders
  const [allRiders, setAllRiders] = useState([]);
  const [selectedRiderId, setSelectedRiderId] = useState("");

  // Effective rider ID to query and act upon
  const activeRiderId =
    isAdmin && selectedRiderId
      ? selectedRiderId
      : user?._id || user?.id;

  // OTP inputs: 3 separate digits
  const [otpDigits, setOtpDigits] = useState(["", "", ""]);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const otpInputRefs = [useRef(null), useRef(null), useRef(null)];

  // Pickup confirmation loading
  const [confirmingPickup, setConfirmingPickup] = useState(false);

  // QR scanner state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [manualQrInput, setManualQrInput] = useState("");
  const [checkingInQr, setCheckingInQr] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch driver's active status and assigned order
  const fetchDriverStatus = async (silent = false) => {
    if (!user?.token) return;
    if (!silent && !driver) setLoading(true);

    try {
      const res = await deliveryService.getMyStatus(
        user.token,
        isAdmin && activeRiderId ? activeRiderId : null
      );

      if (res?.success) {
        setDriver(res.rider);
        setCurrentOrder(res.currentOrder);
      }
    } catch (error) {
      console.error("Failed to load driver status:", error);
    } finally {
      setLoading(false);
    }
  };

  // If user is admin, fetch available fleet to populate simulation selector
  const fetchFleetForAdmin = async () => {
    if (!isAdmin || !user?.token) return;
    try {
      const queueData = await deliveryService.getQueue(user.token);
      if (queueData?.success) {
        const drivers = queueData.allDrivers || queueData.availableDrivers || [];
        setAllRiders(drivers);
        // Default to the first rider if nothing selected yet
        if (!selectedRiderId && drivers.length > 0) {
          setSelectedRiderId(drivers[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load fleet for admin:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchFleetForAdmin();
    }
  }, [isAdmin, user?.token]);

  useEffect(() => {
    fetchDriverStatus();
  }, [user?.token, activeRiderId]);

  // Periodic lightweight background sync (every 4 seconds) to guarantee freshness
  useEffect(() => {
    const timer = setInterval(() => {
      fetchDriverStatus(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [user?.token, activeRiderId]);

  // Socket.IO real-time listener for assignment and status changes
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[Driver] Connected to real-time events");
    });

    socket.on("driverAssigned", (data) => {
      const currentTarget = String(activeRiderId || "");
      const eventRider = String(data.riderId || data.rider?._id || "");
      if (!currentTarget || currentTarget === eventRider) {
        toast.success("تم تعيين طلب جديد لك! يرجى استلامه من الكاونتر 🛵", {
          duration: 6000,
          icon: "🛵",
        });
        fetchDriverStatus(true);
      }
    });

    socket.on("driverStatusChanged", (data) => {
      const currentTarget = String(activeRiderId || "");
      const eventRider = String(data.riderId || "");
      if (!currentTarget || currentTarget === eventRider) {
        if (data.driverStatus) {
          setDriver((prev) => ({
            ...(prev || {}),
            driverStatus: data.driverStatus,
            currentOrderId: data.currentOrderId || null,
          }));
          if (data.driverStatus === "returning" || data.driverStatus === "available") {
            setCurrentOrder(null);
          }
        }
        fetchDriverStatus(true);
      }
    });

    socket.on("driverAvailable", (data) => {
      const currentTarget = String(activeRiderId || "");
      const eventRider = String(data.riderId || data.rider?._id || "");
      if (!currentTarget || currentTarget === eventRider) {
        fetchDriverStatus(true);
      }
    });

    socket.on("updatedOrder", (data) => {
      if (currentOrder && String(data._id) === String(currentOrder._id)) {
        fetchDriverStatus(true);
      }
    });

    socket.on("orderUpdated", (data) => {
      if (currentOrder && String(data._id) === String(currentOrder._id)) {
        fetchDriverStatus(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeRiderId, currentOrder?._id]);

  // Confirm Pickup action
  const handleConfirmPickup = async () => {
    const orderIdToConfirm = currentOrder?._id || driver?.currentOrderId;
    if (!orderIdToConfirm) {
      toast.error("لا يوجد طلب مخصص قيد الاستلام");
      return;
    }

    setConfirmingPickup(true);
    try {
      const res = await deliveryService.confirmPickup(
        orderIdToConfirm,
        user.token,
        isAdmin ? activeRiderId : null
      );
      if (res?.success) {
        toast.success("تم تأكيد استلام الطلب! توجه الآن إلى عنوان الزبون 🚗");
        fetchDriverStatus(true);
      }
    } catch (error) {
      console.error("Confirm pickup error:", error);
      toast.error(error.response?.data?.message || "فشل تأكيد الاستلام");
    } finally {
      setConfirmingPickup(false);
    }
  };

  // OTP Input handlers
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 2) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  // Verify OTP action
  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 3) {
      toast.error("يرجى إدخال رمز التحقق المكون من 3 أرقام");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await deliveryService.verifyOtp(
        {
          orderId: currentOrder?._id || driver?.currentOrderId,
          otp: fullOtp,
          riderId: isAdmin ? activeRiderId : null,
        },
        user.token
      );
      if (res?.success) {
        toast.success("تم تسليم الطلب بنجاح! شكراً لجهودك 👏", {
          duration: 5000,
        });
        setOtpDigits(["", "", ""]);
        if (res.rider) {
          setDriver(res.rider);
          setCurrentOrder(null);
        }
        fetchDriverStatus(true);
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast.error(error.response?.data?.message || "رمز التحقق غير صحيح");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // QR Check-in action
  const handleQrCheckIn = async (codeToUse = null) => {
    const code = codeToUse || manualQrInput.trim() || BRANCH_QR_CODE;
    setCheckingInQr(true);
    try {
      const res = await deliveryService.qrCheckIn(
        code,
        user.token,
        isAdmin ? activeRiderId : null
      );
      if (res?.success) {
        toast.success("تم تسجيل العودة للفرع بنجاح! أنت الآن في طابور الانتظار 🟢");
        setShowScannerModal(false);
        stopCamera();
        fetchDriverStatus(true);
      }
    } catch (error) {
      console.error("QR check-in error:", error);
      toast.error(error.response?.data?.message || "رمز QR غير صحيح");
    } finally {
      setCheckingInQr(false);
    }
  };

  // Start device camera for QR scanner modal
  const startCamera = async () => {
    setShowScannerModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access failed or denied:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  if (loading && !driver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-bold">جاري تحميل بيانات السائق...</p>
        </div>
      </div>
    );
  }

  const driverStatus = driver?.driverStatus || "available";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 max-w-lg mx-auto pb-16"
    >
      <div className="space-y-4">
        {/* Admin Preview Mode Switcher */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-3xl p-4 shadow-lg border border-indigo-700/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-300" />
                <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
                  وضع معاينة المشرف (Admin Preview)
                </span>
              </div>
              <Badge className="bg-indigo-600 text-white text-[10px] px-2 py-0.5">
                تجربة كاملة
              </Badge>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-indigo-200 font-bold">
                اختر السائق المراد معاينة شاشته وتجربة خطواته:
              </label>
              <select
                value={selectedRiderId}
                onChange={(e) => {
                  setSelectedRiderId(e.target.value);
                }}
                className="w-full bg-white text-gray-900 font-bold text-xs p-2.5 rounded-xl border border-indigo-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {allRiders.length === 0 ? (
                  <option value={user?._id || user?.id}>
                    {user?.name || user?.username} (حسابك الإداري)
                  </option>
                ) : (
                  allRiders.map((r) => {
                    let statusAr = "متاح بالفرع";
                    if (r.driverStatus === "assigned") statusAr = "معين له طلب";
                    if (r.driverStatus === "on_delivery") statusAr = "قيد التوصيل";
                    if (r.driverStatus === "returning") statusAr = "عائد للفرع";

                    return (
                      <option key={r._id} value={r._id}>
                        {r.name || r.username} ({statusAr} - {r.phone || "بدون هاتف"})
                      </option>
                    );
                  })
                )}
              </select>
            </div>
          </div>
        )}

        {/* Driver Header Card */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 rounded-3xl p-5 text-white shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-red-200 font-medium">سائق التوصيل</p>
              <h2 className="text-lg font-black tracking-tight">
                {driver?.name || driver?.username || user?.username}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={startCamera}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl h-9 text-xs font-bold px-3 shadow-sm flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>مسح QR 📷</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchDriverStatus(false)}
              className="text-white hover:bg-white/20 rounded-xl h-9 w-9 p-0"
              title="تحديث الحالة"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-red-200 hover:text-white hover:bg-white/20 rounded-xl h-9 w-9 p-0"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STATE 1: AVAILABLE (متاح بالفرع - في قائمة الانتظار) */}
        {/* ======================================================== */}
        {driverStatus === "available" && (
          <Card className="rounded-3xl border-2 border-emerald-400 bg-white shadow-lg overflow-hidden text-center p-6 space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <Badge className="bg-emerald-600 text-white px-3 py-1 text-sm font-bold rounded-full mb-2">
                أنت متاح بالفرع 🟢
              </Badge>
              <h3 className="text-xl font-black text-gray-900">
                في قائمة انتظار الإرسال (FIFO)
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2 leading-relaxed">
                يرجى البقاء في استراحة الفرع. عند قيام الكاونتر بتعيين طلب جديد لك، ستظهر تفاصيله وزر تأكيد الاستلام هنا فوراً.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1.5 font-bold">
                <Clock className="w-4 h-4 text-emerald-600" />
                آخر تسجيل دخول للفرع:
              </span>
              <span className="font-mono font-bold text-gray-900">
                {driver?.returnedAt
                  ? new Date(driver.returnedAt).toLocaleTimeString("ar-JO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "الآن"}
              </span>
            </div>

            {/* QR Scanner Button to Re-Checkin / Test */}
            <div className="pt-2">
              <Button
                onClick={startCamera}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3.5 rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                مسح رمز QR الفرع لتسجيل العودة / تحديث الدور 📷
              </Button>
            </div>
          </Card>
        )}

        {/* ======================================================== */}
        {/* STATE 2: ASSIGNED (تم تعيين طلب - بانتظار استلام الكاونتر) */}
        {/* ======================================================== */}
        {driverStatus === "assigned" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Alert Banner */}
            <div className="bg-amber-500 text-white rounded-3xl p-4 shadow-lg flex items-center gap-3">
              <Package className="w-8 h-8 flex-shrink-0 animate-pulse" />
              <div>
                <h3 className="font-black text-base">تم تعيين طلب جديد لك! 📦</h3>
                <p className="text-xs text-amber-100 font-medium">
                  استلم الوجبة من كاونتر المطبخ ثم اضغط على زر "تأكيد استلام الطلب وبدء الرحلة"
                </p>
              </div>
            </div>

            {/* Order Card */}
            {currentOrder ? (
              <Card className="rounded-3xl border border-gray-200 bg-white shadow-md overflow-hidden">
                <CardHeader className="bg-gray-50 p-4 border-b border-gray-100 flex flex-row items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-bold">رقم الطلب</p>
                    <h3 className="text-2xl font-black text-red-700">
                      #{currentOrder.sequenceNumber || currentOrder._id?.slice(-6)}
                    </h3>
                  </div>
                  <Badge className="bg-amber-500 text-white font-bold">
                    جاهز للاستلام من الكاونتر 📦
                  </Badge>
                </CardHeader>

                <CardContent className="p-5 space-y-4 text-sm">
                  {/* Customer Details */}
                  <div className="space-y-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <User className="w-4 h-4 text-red-600" />
                      <span>{currentOrder.userDetails?.name || currentOrder.userId?.name || "زبون"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${currentOrder.userDetails?.phone || currentOrder.userId?.phone}`}
                        className="font-mono text-red-700 underline font-bold"
                        dir="ltr"
                      >
                        {currentOrder.userDetails?.phone || currentOrder.userId?.phone || "-"}
                      </a>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-700 pt-1">
                      <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">
                        {currentOrder.shippingAddress?.name || currentOrder.shippingAddress?.area || currentOrder.shippingAddress?.details || "عنوان الزبون"}
                        {currentOrder.userDetails?.apartment && ` (شقة/طابق: ${currentOrder.userDetails.apartment})`}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5 border-t border-gray-100 pt-3">
                    <p className="text-xs font-bold text-gray-500">محتويات الوجبة:</p>
                    <div className="space-y-1">
                      {currentOrder.products?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-xl"
                        >
                          <span className="font-bold text-gray-800">
                            {item.quantity}× {item.productId?.name?.ar || item.name?.ar || "وجبة"}
                          </span>
                          <span className="text-gray-500 font-mono">
                            {item.priceAtPurchase?.toFixed(2)} JOD
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Pickup Button */}
                  <Button
                    onClick={handleConfirmPickup}
                    disabled={confirmingPickup}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black py-6 rounded-2xl shadow-lg shadow-amber-200 text-base"
                  >
                    {confirmingPickup ? (
                      "جاري التأكيد..."
                    ) : (
                      <>
                        <Bike className="w-5 h-5 ml-2" />
                        تأكيد استلام الطلب وبدء الرحلة 🚀
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-3xl border border-gray-200 bg-white p-6 text-center space-y-4">
                <Package className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
                <h3 className="font-bold text-gray-800">تم تعيين طلب جديد لك!</h3>
                <p className="text-xs text-gray-500">
                  جاري جلب تفاصيل الوجبة من السيرفر...
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => fetchDriverStatus(false)}
                    variant="outline"
                    className="rounded-xl text-xs font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
                    تحديث الآن
                  </Button>
                  <Button
                    onClick={handleConfirmPickup}
                    disabled={confirmingPickup}
                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                  >
                    تأكيد استلام الطلب مباشرة 🚀
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 3: ON_DELIVERY (قيد التوصيل للزبون - مع التحقق من OTP) */}
        {/* ======================================================== */}
        {driverStatus === "on_delivery" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Status Banner */}
            <div className="bg-blue-600 text-white rounded-3xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Navigation className="w-7 h-7 flex-shrink-0 animate-spin-slow" />
                <div>
                  <h3 className="font-black text-base">في الطريق إلى الزبون</h3>
                  <p className="text-xs text-blue-100">
                    طلب #{currentOrder?.sequenceNumber || currentOrder?._id?.slice(-6) || "الحالي"}
                  </p>
                </div>
              </div>
              <Badge className="bg-white text-blue-700 font-black">
                جاري التوصيل 🚗
              </Badge>
            </div>

            {/* Destination & Contact Card */}
            {currentOrder && (
              <Card className="rounded-3xl border border-gray-200 bg-white shadow-md p-5 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    وجهة التوصيل
                  </p>
                  <div className="flex items-start gap-2 text-sm text-gray-900 font-bold">
                    <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>
                      {currentOrder.shippingAddress?.name || currentOrder.shippingAddress?.area || currentOrder.shippingAddress?.details || "عنوان الزبون"}
                      {currentOrder.userDetails?.apartment && (
                        <span className="block text-xs font-normal text-gray-500 mt-1">
                          الطابق / الشقة: {currentOrder.userDetails.apartment}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Call Customer & Map Links */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <a
                    href={`tel:${currentOrder.userDetails?.phone || currentOrder.userId?.phone}`}
                    className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 p-3 rounded-2xl font-bold text-xs border border-emerald-200 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    اتصال بالزبون
                  </a>

                  {currentOrder.shippingAddress?.coordinates ? (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${currentOrder.shippingAddress.coordinates.lat},${currentOrder.shippingAddress.coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-50 text-blue-800 hover:bg-blue-100 p-3 rounded-2xl font-bold text-xs border border-blue-200 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      خرائط Google
                    </a>
                  ) : (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        currentOrder.shippingAddress?.area || "عمان"
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-50 text-blue-800 hover:bg-blue-100 p-3 rounded-2xl font-bold text-xs border border-blue-200 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      فتح الخريطة
                    </a>
                  )}
                </div>
              </Card>
            )}

            {/* Hand-off & OTP Verification Box */}
            <Card className="rounded-3xl border-2 border-red-500 bg-white shadow-xl overflow-hidden p-6 space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <KeyRound className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900">
                  رمز تأكيد الاستلام (OTP)
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  اطلب رمز التحقق المكون من <strong>3 أرقام</strong> من الزبون عند تسليمه الطلب لإغلاق العملية
                </p>
              </div>

              {/* 3-Digit Input Boxes */}
              <div className="flex justify-center gap-3 my-4" dir="ltr">
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otpDigits[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-16 h-18 text-center text-3xl font-black rounded-2xl border-2 border-gray-300 focus:border-red-600 focus:ring-4 focus:ring-red-100 outline-none transition-all bg-gray-50 font-mono shadow-inner"
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otpDigits.join("").length !== 3}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-6 rounded-2xl shadow-xl shadow-red-200 text-base"
              >
                {verifyingOtp ? (
                  "جاري التحقق..."
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 ml-2" />
                    تأكيد الرمز وإنهاء التسليم ✅
                  </>
                )}
              </Button>
            </Card>
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 4: RETURNING (عائد إلى الفرع - مسح QR) */}
        {/* ======================================================== */}
        {driverStatus === "returning" && (
          <Card className="rounded-3xl border-2 border-purple-400 bg-white shadow-xl overflow-hidden p-6 space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-purple-50">
              <Navigation className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <Badge className="bg-purple-600 text-white px-3 py-1 text-sm font-bold rounded-full mb-2">
                في طريق العودة للفرع 🚗
              </Badge>
              <h3 className="text-xl font-black text-gray-900">
                تسجيل العودة للفرع
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2 leading-relaxed">
                عند وصولك إلى كاونتر الفرع، امسح رمز الـ QR لتسجيل وقت عودتك وحجز دورك في طابور الانتظار القادم (FIFO).
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={startCamera}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-black py-6 rounded-2xl shadow-lg shadow-purple-200 text-base"
              >
                <Camera className="w-5 h-5 ml-2" />
                مسح رمز QR الفرع 📷
              </Button>

              {/* Quick Check-in Button Fallback (in case camera is broken) */}
              <Button
                variant="outline"
                onClick={() => handleQrCheckIn(BRANCH_QR_CODE)}
                disabled={checkingInQr}
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 font-bold rounded-2xl py-3 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 ml-1.5" />
                {checkingInQr
                  ? "جاري تسجيل العودة..."
                  : "تسجيل عودة سريع بالفرع (بدون كاميرا)"}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* QR Scanner Modal with Camera and Manual Entry */}
      <Dialog
        open={showScannerModal}
        onOpenChange={(open) => {
          if (!open) stopCamera();
          setShowScannerModal(open);
        }}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 text-center" dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900">
              مسح رمز QR الفرع
            </DialogTitle>
          </DialogHeader>

          <div className="my-4 space-y-4">
            <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-red-500 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-red-500/50 pointer-events-none rounded-2xl flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-red-400 rounded-xl animate-pulse" />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              وجّه الكاميرا نحو الرمز المعلق بكاونتر الفرع
            </p>

            {/* One-tap Confirmation Fallback */}
            <Button
              onClick={() => handleQrCheckIn(BRANCH_QR_CODE)}
              disabled={checkingInQr}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm"
            >
              {checkingInQr ? "جاري التحقق..." : "تأكيد مسح رمز الفرع الحالي 📍"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
