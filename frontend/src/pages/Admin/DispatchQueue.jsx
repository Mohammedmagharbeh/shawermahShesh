import { useEffect, useState, useRef, useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import { deliveryService } from "@/services/deliveryService";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  Bike,
  Package,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  QrCode,
  RefreshCw,
  AlertCircle,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  UserCheck,
  Send,
  Printer,
  X,
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

export default function DispatchQueue() {
  const { user } = useUser();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);

  // Active tab on right panel: "available" or "fleet"
  const [driverTab, setDriverTab] = useState("available");

  // Assignment dropdown state: { [orderId]: selectedRiderId }
  const [selectedRiderForOrder, setSelectedRiderForOrder] = useState({});
  const [assigningOrderId, setAssigningOrderId] = useState(null);

  // Manual check-in loading state: riderId
  const [checkingInRiderId, setCheckingInRiderId] = useState(null);

  // QR Code Modal
  const [showQrModal, setShowQrModal] = useState(false);

  // Sound alert
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef(null);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  };

  // Fetch queue data from server
  const fetchQueueData = async (isManual = false) => {
    if (!user?.token) return;
    if (isManual) setRefreshing(true);
    try {
      const data = await deliveryService.getQueue(user.token);
      if (data?.success) {
        setOrders(
          (data.orders || []).filter((o) => o.source !== "ishbek")
        );
        setAvailableDrivers(data.availableDrivers || []);
        setAllDrivers(data.allDrivers || []);
      }
    } catch (error) {
      console.error("Failed to fetch delivery queue:", error);
      if (isManual) {
        toast.error(error.response?.data?.message || "فشل تحديث بيانات الإرسال");
      }
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, [user?.token]);

  // Socket.IO real-time synchronization
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[Dispatch] Connected to socket server");
    });

    const handleUpdate = () => {
      playBeep();
      fetchQueueData();
    };

    socket.on("driverAssigned", handleUpdate);
    socket.on("driverAvailable", (data) => {
      toast.success(
        `السائق ${data.rider?.name || "سائق"} وصل للفرع وهو متاح الآن! 🛵`
      );
      handleUpdate();
    });
    socket.on("driverStatusChanged", handleUpdate);
    socket.on("updatedOrder", handleUpdate);

    return () => {
      socket.disconnect();
    };
  }, [soundEnabled]);

  // Handle assigning an order to a driver
  const handleAssign = async (orderId, targetRiderId = null) => {
    const riderId = targetRiderId || selectedRiderForOrder[orderId] || availableDrivers[0]?._id;
    if (!riderId) {
      toast.error("لا يوجد سائق متاح لتعيين الطلب إليه");
      return;
    }

    setAssigningOrderId(orderId);
    try {
      const res = await deliveryService.assignOrder(
        { orderId, riderId },
        user.token
      );
      if (res?.success) {
        toast.success(res.message || "تم تعيين السائق للطلب بنجاح");
        fetchQueueData();
      }
    } catch (error) {
      console.error("Assign error:", error);
      toast.error(error.response?.data?.message || "فشل تعيين السائق");
    } finally {
      setAssigningOrderId(null);
    }
  };

  // Staff Manual Check-In Override / Reset driver to available
  const handleManualCheckIn = async (riderId) => {
    setCheckingInRiderId(riderId);
    try {
      const res = await deliveryService.manualCheckIn(riderId, user.token);
      if (res?.success) {
        toast.success(
          res.revertedOrdersCount > 0
            ? "تم إعادة تعيين السائق إلى متاح، وإلغاء تعيين الطلب وإعادته لطابور الإرسال بنجاح 🛵"
            : "تم تسجيل عودة السائق وتعيينه كمتاح بنجاح"
        );
        fetchQueueData();
      }
    } catch (error) {
      console.error("Manual check-in error:", error);
      toast.error(error.response?.data?.message || "فشل تسجيل عودة السائق");
    } finally {
      setCheckingInRiderId(null);
    }
  };

  // Staff Unassign Order directly from order card
  const handleUnassignOrder = async (orderId) => {
    try {
      const res = await deliveryService.unassignOrder(orderId, user.token);
      if (res?.success) {
        toast.success("تم إلغاء تعيين الطلب بنجاح وإعادته لطابور الإرسال");
        fetchQueueData();
      }
    } catch (error) {
      console.error("Unassign error:", error);
      toast.error(error.response?.data?.message || "فشل إلغاء تعيين الطلب");
    }
  };

  // Format wait time
  const formatWaitTime = (timestamp) => {
    if (!timestamp) return "الآن";
    const minutes = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (minutes < 1) return "منذ لحظات";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    return `منذ ${hours} ساعة و ${minutes % 60} دقيقة`;
  };

  // Active / on-route drivers filter
  const activeFleet = useMemo(() => {
    return allDrivers.filter((d) => d.driverStatus !== "available");
  }, [allDrivers]);

  // Helper status color/text
  const getDriverStatusInfo = (status) => {
    switch (status) {
      case "available":
        return { label: "متاح بالفرع", color: "bg-emerald-500 text-white" };
      case "assigned":
        return { label: "قيد استلام الطلب", color: "bg-amber-500 text-white" };
      case "on_delivery":
        return { label: "في الطريق للزبون", color: "bg-blue-600 text-white" };
      case "returning":
        return { label: "عائد للفرع", color: "bg-purple-600 text-white" };
      default:
        return { label: status, color: "bg-gray-500 text-white" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-bold">جاري تحميل لوحة الإرسال والتوصيل...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50/20 to-red-50/20 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-200">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                لوحة إرسال وتتبع التوصيل
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                إدارة طابور السائقين (FIFO) وتعيين الطلبات الجاهزة فوريّاً
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sound Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSoundEnabled((prev) => !prev);
                toast.success(
                  !soundEnabled ? "تم تفعيل التنبيه الصوتي" : "تم كتم الصوت"
                );
              }}
              className={`rounded-xl border transition-all ${
                soundEnabled
                  ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 ml-1.5" />
                  الصوت مفعّل
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 ml-1.5" />
                  تفعيل الصوت
                </>
              )}
            </Button>

            {/* Driver Dashboard Preview Link */}
            <a
              href="/rider"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              <Bike className="w-4 h-4 ml-1.5" />
              شاشة السائق 🛵
            </a>

            {/* Show Branch QR Modal */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQrModal(true)}
              className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 font-bold"
            >
              <QrCode className="w-4 h-4 ml-1.5" />
              رمز QR للفرع
            </Button>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchQueueData(true)}
              disabled={refreshing}
              className="rounded-xl border-gray-200 hover:bg-gray-100"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  طلبات جاهزة للتوصيل
                </p>
                <h3 className="text-3xl font-black text-amber-900 mt-1">
                  {orders.length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  سائقين متاحين بالفرع
                </p>
                <h3 className="text-3xl font-black text-emerald-900 mt-1">
                  {availableDrivers.length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  طلبات في الطريق
                </p>
                <h3 className="text-3xl font-black text-blue-900 mt-1">
                  {allDrivers.filter((d) => d.driverStatus === "on_delivery").length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Bike className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  سائقين عائدين للفرع
                </p>
                <h3 className="text-3xl font-black text-purple-900 mt-1">
                  {allDrivers.filter((d) => d.driverStatus === "returning").length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Orders Ready for Pickup */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-red-600" />
                طابور الطلبات الجاهزة للإرسال
                <Badge className="bg-red-600 text-white mr-2">
                  {orders.length}
                </Badge>
              </h2>
            </div>

            {orders.length === 0 ? (
              <Card className="rounded-2xl border-dashed border-2 border-gray-200 bg-white/60 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  لا توجد طلبات توصيل جاهزة حالياً
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  عندما يقوم المطبخ بتجهيز طلبات توصيل، ستظهر فوراً في هذا القسم
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isAssigned = !!order.assignedRiderId;
                  const assignedRider = order.assignedRiderId;
                  const topDriver = availableDrivers[0];

                  return (
                    <Card
                      key={order._id}
                      className={`rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
                        isAssigned
                          ? "border-amber-300 bg-amber-50/20"
                          : "border-gray-200 bg-white hover:border-red-300 hover:shadow-md"
                      }`}
                    >
                      <CardHeader className="bg-gray-50/60 p-4 border-b border-gray-100 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-red-700 tracking-tight">
                            #{order.sequenceNumber || order._id.slice(-6)}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs font-bold border-amber-400 bg-amber-50 text-amber-800"
                          >
                            جاهز للاستلام 📦
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatWaitTime(order.createdAt)}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 sm:p-5 space-y-4">
                        {/* Customer & Address Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-gray-900 font-bold">
                              <User className="w-4 h-4 text-red-600 flex-shrink-0" />
                              <span>{order.userDetails?.name || order.userId?.name || "زبون"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-xs">
                              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <a
                                href={`tel:${order.userDetails?.phone || order.userId?.phone}`}
                                className="font-mono hover:text-red-600 underline"
                                dir="ltr"
                              >
                                {order.userDetails?.phone || order.userId?.phone || "-"}
                              </a>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <span className="font-medium line-clamp-2">
                                {order.shippingAddress?.name || order.shippingAddress?.area || order.shippingAddress?.details || "عنوان الزبون"}
                                {order.userDetails?.apartment && ` (شقة/طابق: ${order.userDetails.apartment})`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="border-t border-gray-100 pt-3">
                          <p className="text-xs font-bold text-gray-500 mb-2">
                            الأصناف ({order.products?.length || 0}):
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {order.products?.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg font-medium"
                              >
                                <span className="font-bold text-red-700">{item.quantity}×</span>
                                {item.productId?.name?.ar || item.name?.ar || "وجبة"}
                              </span>
                            ))}
                          </div>
                          {order.orderNote && (
                            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 font-medium">
                              ملاحظة: {order.orderNote}
                            </p>
                          )}
                        </div>

                        {/* Total Price */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
                          <span className="text-gray-500 font-medium">إجمالي الطلب:</span>
                          <span className="text-base font-black text-red-600 font-mono">
                            {order.totalPrice?.toFixed(2)} JOD
                          </span>
                        </div>

                        {/* Assignment Section */}
                        <div className="border-t border-gray-100 pt-3">
                          {isAssigned ? (
                            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                                  <Bike className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs text-amber-700 font-bold">
                                    معين للسائق:
                                  </p>
                                  <p className="text-sm font-black text-gray-900">
                                    {assignedRider?.name || assignedRider?.username || "سائق"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                <Badge className="bg-amber-600 text-white text-xs animate-pulse">
                                  بانتظار الاستلام من الكاونتر
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnassignOrder(order._id)}
                                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-bold border border-red-200 rounded-lg px-2.5 py-1 h-auto"
                                  title="إلغاء التعيين وإعادة الطلب لطابور الإرسال"
                                >
                                  <X className="w-3.5 h-3.5 ml-1" />
                                  إلغاء التعيين
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              {/* One-click quick assign to top driver in FIFO */}
                              {topDriver ? (
                                <Button
                                  onClick={() => handleAssign(order._id, topDriver._id)}
                                  disabled={assigningOrderId === order._id}
                                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-200"
                                >
                                  <Send className="w-4 h-4 ml-2" />
                                  إرسال للسائق التالي #{1}: {topDriver.name || topDriver.username}
                                </Button>
                              ) : null}

                              {/* Dropdown to pick another driver */}
                              <div className="flex items-center gap-2 flex-1">
                                <select
                                  value={selectedRiderForOrder[order._id] || ""}
                                  onChange={(e) =>
                                    setSelectedRiderForOrder({
                                      ...selectedRiderForOrder,
                                      [order._id]: e.target.value,
                                    })
                                  }
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                  <option value="">
                                    {topDriver ? "أو اختر سائقاً آخر..." : "اختر سائقاً..."}
                                  </option>
                                  {availableDrivers.map((driver, idx) => (
                                    <option key={driver._id} value={driver._id}>
                                      #{idx + 1} {driver.name || driver.username} ({driver.phone || "بدون هاتف"})
                                    </option>
                                  ))}
                                </select>

                                <Button
                                  onClick={() => handleAssign(order._id)}
                                  disabled={
                                    assigningOrderId === order._id ||
                                    (!selectedRiderForOrder[order._id] && !topDriver)
                                  }
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl whitespace-nowrap"
                                >
                                  تعيين
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Driver Fleet & FIFO Queue */}
          <div className="lg:col-span-5 space-y-4">
            {/* Tabs */}
            <div className="flex bg-white rounded-2xl p-1.5 border border-gray-200 shadow-sm">
              <button
                onClick={() => setDriverTab("available")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  driverTab === "available"
                    ? "bg-red-600 text-white shadow-md shadow-red-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                طابور الفرع (FIFO)
                <span className="inline-flex items-center justify-center bg-white/20 text-white rounded-full px-1.5 py-0.2 text-[10px]">
                  {availableDrivers.length}
                </span>
              </button>

              <button
                onClick={() => setDriverTab("fleet")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  driverTab === "fleet"
                    ? "bg-red-600 text-white shadow-md shadow-red-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Bike className="w-4 h-4" />
                الأسطول بالكامل
                <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 rounded-full px-1.5 py-0.2 text-[10px]">
                  {allDrivers.length}
                </span>
              </button>
            </div>

            {/* Tab 1: Available FIFO Queue */}
            {driverTab === "available" && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    ترتيب السائقين تلقائي بنظام <strong>FIFO</strong> بناءً على وقت مسح كود العودة للفرع.
                  </span>
                </div>

                {availableDrivers.length === 0 ? (
                  <Card className="rounded-2xl border-dashed border-2 border-gray-200 bg-white/60 p-8 text-center">
                    <Bike className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-700">
                      لا يوجد سائقين متاحين حالياً
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      عند عودة أي سائق ومسح رمز الـ QR سيظهر هنا فوراً
                    </p>
                  </Card>
                ) : (
                  availableDrivers.map((driver, index) => {
                    const isTop = index === 0;
                    return (
                      <Card
                        key={driver._id}
                        className={`rounded-2xl border transition-all ${
                          isTop
                            ? "border-emerald-400 bg-gradient-to-r from-emerald-50/50 via-white to-white shadow-md ring-2 ring-emerald-500/20"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                                isTop
                                  ? "bg-emerald-600 text-white"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              #{index + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-gray-900">
                                  {driver.name || driver.username}
                                </h4>
                                {isTop && (
                                  <Badge className="bg-emerald-600 text-white text-[10px] py-0">
                                    الدور التالي 🚀
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <Phone className="w-3 h-3" />
                                <span dir="ltr">{driver.phone || "بدون هاتف"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-left flex flex-col items-end">
                            <span className="text-[11px] text-gray-400 font-medium">
                              في الفرع:
                            </span>
                            <span className="text-xs font-bold text-emerald-700">
                              {formatWaitTime(driver.returnedAt)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 2: Full Fleet Monitoring */}
            {driverTab === "fleet" && (
              <div className="space-y-3">
                {allDrivers.length === 0 ? (
                  <Card className="rounded-2xl border-dashed border-2 border-gray-200 bg-white/60 p-8 text-center">
                    <p className="text-sm font-bold text-gray-700">
                      لم يتم تسجيل أي سائقين في النظام بعد
                    </p>
                  </Card>
                ) : (
                  allDrivers.map((driver) => {
                    const statusInfo = getDriverStatusInfo(driver.driverStatus);
                    const isReturning = driver.driverStatus === "returning";

                    return (
                      <Card
                        key={driver._id}
                        className="rounded-2xl border border-gray-200 bg-white shadow-sm"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">
                                {driver.name || driver.username}
                              </h4>
                              <p className="text-xs text-gray-500 font-mono" dir="ltr">
                                {driver.phone || "-"}
                              </p>
                            </div>
                            <Badge className={`${statusInfo.color} text-xs font-bold`}>
                              {statusInfo.label}
                            </Badge>
                          </div>

                          {/* Order info if delivering */}
                          {driver.currentOrderId && (
                            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs flex items-center justify-between">
                              <span className="text-gray-600">طلب قيد التوصيل:</span>
                              <span className="font-bold text-red-600 font-mono">
                                #{driver.currentOrderId?.sequenceNumber || "الطلب"}
                              </span>
                            </div>
                          )}

                          {/* Manual Check-in Button (for returning drivers or manual override) */}
                          <div className="flex justify-end pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManualCheckIn(driver._id)}
                              disabled={checkingInRiderId === driver._id}
                              className={`text-xs rounded-xl font-bold ${
                                isReturning
                                  ? "border-purple-300 text-purple-700 hover:bg-purple-50"
                                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <UserCheck className="w-3.5 h-3.5 ml-1.5" />
                              {checkingInRiderId === driver._id
                                ? "جاري التعيين..."
                                : isReturning
                                ? "تسجيل عودة يدوي للفرع 📍"
                                : "إعادة تعيين إلى متاح"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branch QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-md rounded-3xl p-6 text-center" dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900">
              رمز QR نقطة العودة للفرع 📍
            </DialogTitle>
          </DialogHeader>

          <div className="my-4 space-y-4">
            <p className="text-xs text-gray-600">
              يتم وضع هذا الرمز عند كاونتر الإرسال بالفرع. يمسحه السائق عند عودته ليصبح تلقائياً في قائمة المتاحين (FIFO).
            </p>

            <div className="bg-white p-6 border-2 border-dashed border-red-300 rounded-2xl inline-block shadow-inner">
              {/* QR display using public QR API image */}
              <img
                id="branch-qr-img"
                crossOrigin="anonymous"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                  BRANCH_QR_CODE
                )}`}
                alt="Branch QR Code"
                className="w-48 h-48 mx-auto object-contain rounded-lg"
              />
              <p className="text-xs font-mono text-gray-400 mt-2 select-all">
                {BRANCH_QR_CODE}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const qrImg = document.getElementById("branch-qr-img");
                  let qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                    BRANCH_QR_CODE
                  )}`;

                  // If modal image is loaded, convert to dataURL for instant zero-network printing
                  try {
                    if (qrImg && qrImg.complete && qrImg.naturalWidth > 0) {
                      const canvas = document.createElement("canvas");
                      canvas.width = qrImg.naturalWidth;
                      canvas.height = qrImg.naturalHeight;
                      const ctx = canvas.getContext("2d");
                      ctx.drawImage(qrImg, 0, 0);
                      qrSrc = canvas.toDataURL("image/png");
                    }
                  } catch (e) {
                    console.warn("Could not convert QR to dataURL, using URL instead", e);
                  }

                  const printWin = window.open("", "_blank");
                  if (!printWin) {
                    toast.error("يرجى السماح بالنوافذ المنبثقة للطباعة");
                    return;
                  }

                  printWin.document.write(`
                    <!DOCTYPE html>
                    <html dir="rtl">
                      <head>
                        <meta charset="UTF-8" />
                        <title>رمز QR الفرع - شاورما شيش</title>
                        <style>
                          @page { size: auto; margin: 15mm; }
                          body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            text-align: center;
                            padding: 20px;
                            margin: 0;
                            color: #111;
                            background: #fff;
                          }
                          .container {
                            border: 4px solid #b80505;
                            border-radius: 24px;
                            padding: 36px 24px;
                            max-width: 480px;
                            margin: 20px auto;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                          }
                          h1 {
                            font-size: 32px;
                            font-weight: 900;
                            color: #b80505;
                            margin: 0 0 10px 0;
                          }
                          .subtitle {
                            font-size: 16px;
                            color: #444;
                            margin: 0 0 24px 0;
                            line-height: 1.6;
                          }
                          .qr-box {
                            background: #fff;
                            padding: 16px;
                            display: inline-block;
                            border: 3px dashed #b80505;
                            border-radius: 20px;
                            margin-bottom: 20px;
                          }
                          img {
                            width: 280px;
                            height: 280px;
                            display: block;
                            margin: 0 auto;
                          }
                          .code-text {
                            font-family: monospace;
                            font-size: 15px;
                            font-weight: bold;
                            color: #333;
                            letter-spacing: 1px;
                            background: #f4f4f4;
                            padding: 8px 16px;
                            border-radius: 10px;
                            display: inline-block;
                          }
                          .footer {
                            font-size: 13px;
                            color: #888;
                            margin-top: 18px;
                          }
                        </style>
                      </head>
                      <body>
                        <div class="container">
                          <h1>شاورما شيش 🌯</h1>
                          <p class="subtitle">
                            <strong>كاونتر الاستلام والإرسال — نقطة تسجيل العودة</strong><br />
                            امسح هذا الرمز عند عودتك للفرع لتسجيل الدخول في طابور الانتظار (FIFO)
                          </p>
                          <div class="qr-box">
                            <img id="qrPrintImg" src="${qrSrc}" alt="Branch QR Code" />
                          </div>
                          <div>
                            <span class="code-text">${BRANCH_QR_CODE}</span>
                          </div>
                          <p class="footer">فرع 1 — شاورما شيش ©</p>
                        </div>
                        <script>
                          const img = document.getElementById("qrPrintImg");
                          function doPrint() {
                            window.focus();
                            setTimeout(() => {
                              window.print();
                            }, 350);
                          }
                          if (img.complete && img.naturalWidth > 0) {
                            doPrint();
                          } else {
                            img.onload = doPrint;
                            img.onerror = () => {
                              window.focus();
                              window.print();
                            };
                          }
                        </script>
                      </body>
                    </html>
                  `);
                  printWin.document.close();
                }}
                className="rounded-xl font-bold"
              >
                <Printer className="w-4 h-4 ml-1.5" />
                طباعة الرمز
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
