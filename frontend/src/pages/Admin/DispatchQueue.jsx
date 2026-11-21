import { useEffect, useState, useRef, useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import { deliveryService } from "@/services/deliveryService";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  printCashierInvoice,
  checkPrintAgentStatus,
} from "@/utils/thermalPrinter";
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
  ChevronDown,
  ChevronUp,
  UserCheck,
  Send,
  Printer,
  X,
  Sliders,
  Settings,
  ShoppingBag,
  Store,
  Info,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getOrderStatusLabel } from "@/constants";

const BRANCH_QR_CODE = "shawarmasheesh_branch_1_checkin";

const STATUS_TABS = [
  {
    id: "all",
    label: "الكل",
    activeClass: "bg-gray-900 text-white",
    badgeActiveClass: "bg-white/20 text-white",
  },
  {
    id: "Confirmed",
    label: "تم التأكيد",
    activeClass: "bg-purple-600 text-white",
    badgeActiveClass: "bg-white/20 text-white",
  },
  {
    id: "ReadyForPickup",
    label: "بانتظار السائق",
    activeClass: "bg-amber-600 text-white",
    badgeActiveClass: "bg-white/20 text-white",
  },
  {
    id: "Shipped",
    label: "في الطريق",
    activeClass: "bg-blue-600 text-white",
    badgeActiveClass: "bg-white/20 text-white",
  },
  {
    id: "Delivered",
    label: "تم التسليم",
    activeClass: "bg-emerald-600 text-white",
    badgeActiveClass: "bg-white/20 text-white",
  },
];

const matchStatus = (status, tabId) => {
  const norm = String(status || "").toLowerCase();
  if (!tabId || tabId === "all") {
    // Under "all", completed orders (Delivered / Submitted) shall NOT be displayed
    return !["delivered", "submitted"].includes(norm);
  }
  if (tabId === "Confirmed") return norm === "confirmed";
  if (tabId === "ReadyForPickup") return norm === "readyforpickup";
  if (tabId === "Shipped") return norm === "shipped" || norm === "outfordelivery";
  if (tabId === "Delivered") return norm === "delivered" || norm === "submitted";
  return norm === String(tabId).toLowerCase();
};

export default function DispatchQueue() {
  const { user } = useUser();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const isAdmin = user?.role === "admin";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);

  // Queue Filtering States
  const [statusTab, setStatusTab] = useState("all"); // "all" | "Confirmed" | "ReadyForPickup" | "Shipped" | "Delivered"
  const [orderTypeFilter, setOrderTypeFilter] = useState("all"); // "all" | "delivery" | "pickup"
  const [selectedArea, setSelectedArea] = useState("all"); // "all" | area name

  // Slide-Over Driver Drawer State
  const [isDriverDrawerOpen, setIsDriverDrawerOpen] = useState(false);
  const [fleetStatusFilter, setFleetStatusFilter] = useState("all"); // "all" | "on_delivery" | "returning" | "available" | "unavailable"

  // Modal Dialog for Order Details & Dispatch
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [completingOrderId, setCompletingOrderId] = useState(null);

  // Settings Popover State
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const settingsPopoverRef = useRef(null);

  // Live timer for real-time reactivity without manual page refresh
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Max orders per rider configuration (Admin only, 1 to 5)
  const [maxOrdersPerRider, setMaxOrdersPerRider] = useState(3);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Active tab on right panel: "available" or "fleet"
  const [driverTab, setDriverTab] = useState("available");

  // Collapsible driver load drawers state: { [driverId]: boolean }
  const [expandedDriverLoads, setExpandedDriverLoads] = useState({});
  const [expandedFleetLoads, setExpandedFleetLoads] = useState({});

  // Assignment dropdown state: { [orderId]: selectedRiderId }
  const [selectedRiderForOrder, setSelectedRiderForOrder] = useState({});
  const [assigningOrderId, setAssigningOrderId] = useState(null);

  // Manual check-in loading state: riderId
  const [checkingInRiderId, setCheckingInRiderId] = useState(null);

  // QR Code Modal
  const [showQrModal, setShowQrModal] = useState(false);

  // Cashier Print Agent & Printer Status
  const [printAgentOnline, setPrintAgentOnline] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      const res = await checkPrintAgentStatus();
      if (mounted) {
        setPrintAgentOnline(!!res?.online || !!res?.agent);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Sound alert
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef(null);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
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

  // Close settings popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsPopoverRef.current && !settingsPopoverRef.current.contains(e.target)) {
        setShowSettingsPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle ESC key to close drawer, modal, and popovers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDriverDrawerOpen(false);
        setSelectedOrderForModal(null);
        setShowSettingsPopover(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch queue data from server
  const fetchQueueData = async (isManual = false) => {
    if (!user?.token) return;
    if (isManual) setRefreshing(true);
    try {
      const data = await deliveryService.getQueue(user.token);
      if (data?.success) {
        const isExcluded = (ord) => {
          const norm = String(ord?.status || "").toLowerCase();
          return (
            norm === "processing" ||
            norm === "pending" ||
            norm === "cancelled" ||
            norm === "canceled"
          );
        };
        setOrders(
          (data.orders || []).filter(
            (o) => !isExcluded(o)
          )
        );
        setCompletedOrders(
          (data.completedOrders || []).filter(
            (o) => !isExcluded(o)
          )
        );
        setAvailableDrivers(data.availableDrivers || []);
        setAllDrivers(data.allDrivers || []);
        if (data.settings?.maxOrdersPerRider) {
          setMaxOrdersPerRider(data.settings.maxOrdersPerRider);
        }
      }
    } catch (error) {
      console.error("Failed to fetch delivery queue:", error);
      if (isManual) {
        toast.error(
          error.response?.data?.message || "فشل تحديث بيانات الإرسال",
        );
      }
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, [user?.token]);

  // Live ticker that runs every 5 seconds so waiting times and delay warnings update live without refreshing
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Periodic background refresh to guarantee fresh queue data
  useEffect(() => {
    const syncTimer = setInterval(() => {
      fetchQueueData();
    }, 10000);
    return () => clearInterval(syncTimer);
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

    socket.on("newOrder", handleUpdate);
    socket.on("orderCreated", handleUpdate);
    socket.on("orderUpdated", handleUpdate);
    socket.on("updatedOrder", handleUpdate);
    socket.on("orderStatusChanged", handleUpdate);
    socket.on("driverAssigned", handleUpdate);
    socket.on("driverAvailable", (data) => {
      toast.success(
        `السائق ${data.rider?.name || "سائق"} وصل للفرع وهو متاح الآن! 🛵`,
      );
      handleUpdate();
    });
    socket.on("driverStatusChanged", handleUpdate);
    socket.on("deliverySettingsUpdated", (settings) => {
      if (settings?.maxOrdersPerRider) {
        setMaxOrdersPerRider(settings.maxOrdersPerRider);
        toast.success(
          `تم تحديث سعة السائق إلى ${settings.maxOrdersPerRider} طلبات 🛵`,
        );
        fetchQueueData();
      }
    });

    return () => {
      socket.off("newOrder", handleUpdate);
      socket.off("orderCreated", handleUpdate);
      socket.off("orderUpdated", handleUpdate);
      socket.off("updatedOrder", handleUpdate);
      socket.off("orderStatusChanged", handleUpdate);
      socket.off("driverAssigned", handleUpdate);
      socket.off("driverStatusChanged", handleUpdate);
      socket.off("deliverySettingsUpdated");
      socket.disconnect();
    };
  }, [soundEnabled]);

  // Handle updating max orders per rider (Admin only)
  const handleUpdateMaxOrders = async (newMax) => {
    if (!isAdmin) {
      toast.error("تعديل سعة السائقين متاح للمدراء فقط");
      return;
    }
    setSavingSettings(true);
    try {
      const res = await deliveryService.updateSettings(
        { maxOrdersPerRider: newMax },
        user.token,
      );
      if (res?.success) {
        setMaxOrdersPerRider(res.settings?.maxOrdersPerRider || newMax);
        toast.success(`تم تحديث سعة السائق إلى ${newMax} طلبات بنجاح 🛵`);
        setShowSettingsModal(false);
        fetchQueueData();
      }
    } catch (error) {
      console.error("Failed to update delivery settings:", error);
      toast.error(
        error.response?.data?.message || "فشل تحديث إعدادات سعة السائقين",
      );
    } finally {
      setSavingSettings(false);
    }
  };

  // Top eligible driver in FIFO queue (must have capacity < maxOrdersPerRider)
  const topDriver = useMemo(() => {
    return availableDrivers.find(
      (d) => (d.activeOrdersCount || 0) < maxOrdersPerRider,
    );
  }, [availableDrivers, maxOrdersPerRider]);

  // Handle assigning an order to a driver
  const handleAssign = async (orderId, targetRiderId = null) => {
    const riderId =
      targetRiderId ||
      selectedRiderForOrder[orderId] ||
      topDriver?._id;

    if (!riderId) {
      toast.error("لا يوجد سائق متاح لتعيين الطلب إليه");
      return;
    }

    setAssigningOrderId(orderId);
    try {
      const res = await deliveryService.assignOrder(
        { orderId, riderId },
        user.token,
      );
      if (res?.success) {
        toast.success(res.message || "تم تعيين السائق للطلب بنجاح");
        setSelectedOrderForModal(null);
        fetchQueueData();
      }
    } catch (error) {
      console.error("Assign error:", error);
      toast.error(error.response?.data?.message || "فشل تعيين السائق");
    } finally {
      setAssigningOrderId(null);
    }
  };

  // Direct branch pickup order completion at counter
  const handleCompletePickup = async (orderId) => {
    setCompletingOrderId(orderId);
    try {
      const res = await deliveryService.completePickupOrder(orderId, user.token);
      if (res?.success) {
        toast.success(res.message || "تم تسليم الطلب للعميل بنجاح ✅");
        setSelectedOrderForModal(null);
        fetchQueueData();
      }
    } catch (error) {
      console.error("Complete pickup error:", error);
      toast.error(error.response?.data?.message || "فشل تسليم الطلب للعميل");
    } finally {
      setCompletingOrderId(null);
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
            : "تم تسجيل عودة السائق وتعيينه كمتاح بنجاح",
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

  // Staff Unassign Order
  const handleUnassignOrder = async (orderId) => {
    try {
      const res = await deliveryService.unassignOrder(orderId, user.token);
      if (res?.success) {
        toast.success("تم إلغاء تعيين الطلب بنجاح وإعادته لطابور الإرسال");
        if (selectedOrderForModal?._id === orderId) {
          setSelectedOrderForModal(null);
        }
        fetchQueueData();
      }
    } catch (error) {
      console.error("Unassign error:", error);
      toast.error(error.response?.data?.message || "فشل إلغاء تعيين الطلب");
    }
  };

  // Format abbreviated wait time (e.g. 14 د)
  const formatWaitTimeAbbr = (timestamp) => {
    if (!timestamp) return "الآن";
    const minutes = Math.floor((currentTime - new Date(timestamp)) / 60000);
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `${minutes} د`;
    const hours = Math.floor(minutes / 60);
    return `${hours} س ${minutes % 60} د`;
  };

  // Format wait timer urgency color
  const getTimerUrgencyClass = (timestamp) => {
    if (!timestamp) return "text-gray-500";
    const minutes = Math.floor((currentTime - new Date(timestamp)) / 60000);
    if (minutes > 20) return "text-red-600 font-black animate-pulse";
    if (minutes >= 10) return "text-amber-600 font-bold";
    return "text-gray-500 font-medium";
  };

  // Format completed time
  const formatCompletedTime = (timestamp) => {
    if (!timestamp) return "-";
    const d = new Date(timestamp);
    return d.toLocaleTimeString("ar-JO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format full date & time
  const formatFullDateTime = (timestamp) => {
    if (!timestamp) return "-";
    const d = new Date(timestamp);
    return `${d.toLocaleDateString("ar-JO")} ${d.toLocaleTimeString("ar-JO", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // Render Status Badge dynamically based on order status & view mode
  const renderOrderStatusBadge = (order, isCompletedView = false) => {
    const isPickup = order?.orderType === "pickup";
    const isAssigned = !isPickup && !!order?.assignedRiderId;
    const isCompleted =
      isCompletedView ||
      ["delivered", "submitted"].includes(String(order?.status || "").toLowerCase());

    if (isCompleted) {
      return (
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
          {isPickup ? "تم الاستلام ✓" : "مكتمل ✓"}
        </span>
      );
    }
    if (isPickup) {
      return (
        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
          استلام فرع 🛍️
        </span>
      );
    }
    if (isAssigned) {
      return (
        <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
          مع السائق 🛵
        </span>
      );
    }
    return (
      <span className="bg-purple-50 text-purple-800 border border-purple-300 text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
        مؤكد ⚡
      </span>
    );
  };

  const selectedLanguage = i18n.language || "ar";

  // Helper to extract clean area name for any order
  const getOrderAreaName = (order) => {
    if (!order) return "";
    if (order.orderType === "pickup") {
      return "كاونتر الفرع";
    }
    return (
      order.shippingAddress?.name ||
      order.shippingAddress?.area ||
      order.shippingAddress?.details ||
      order.userDetails?.apartment ||
      "منطقة غير محددة"
    );
  };

  // Delivery Area Helper
  const getOrderArea = (order) => {
    return (
      order.shippingAddress?.name ||
      order.shippingAddress?.area ||
      order.shippingAddress?.details ||
      order.userDetails?.apartment ||
      ""
    );
  };

  // Full Address Helper
  const getFullAddress = (order) => {
    // طلبات اشبك: العنوان محفوظ بتفاصيل الطلب
    if (order.source === "ishbek" && order.userDetails?.apartment) {
      return order.userDetails.apartment;
    }
    const parts = [];
    const area = order.shippingAddress?.name || order.shippingAddress?.area;
    if (area) parts.push(area);
    if (order.shippingAddress?.details) parts.push(order.shippingAddress.details);
    if (order.userDetails?.apartment) parts.push(`(شقة/طابق: ${order.userDetails.apartment})`);
    return parts.length > 0 ? parts.join(" - ") : "العنوان غير محدد";
  };

  // Fallback Browser Print (Used if Print Agent / Thermal Printer is offline)
  const fallbackBrowserPrint = (order) => {
    const customerPhone =
      order.userId?.phone || order.userDetails?.phone || "N/A";
    const customerName =
      order.userDetails?.name || order.userId?.name || "N/A";
    const deliveryType =
      order.orderType === "pickup"
        ? (t("pickup") || "استلام من الفرع")
        : (t("delivery") || "توصيل");
    const area = getOrderArea(order);

    const discountRow =
      order.discountAmount > 0
        ? `<p style="display:flex; justify-content:space-between; color:#15803d;"><strong>${t("promo_discount") || "خصم الكود"}${order.promoCode ? ` (${order.promoCode})` : ""}:</strong> <span>- ${Number(order.discountAmount).toFixed(2)} JOD</span></p>`
        : "";

    const areaRow =
      order.orderType !== "pickup" && area
        ? `<p style="text-align:center; font-size:14px; background:#f9f9f9; padding:4px;"><strong>${t("area") || "المنطقة"}:</strong> ${area}</p>`
        : `<p style="text-align:center; font-size:14px; background:#fef3c7; color:#92400e; padding:4px;"><strong>${deliveryType}:</strong> كاونتر الفرع</p>`;

    const rows = (order.products || [])
      .map((item, idx) => {
        const additions =
          item.additions?.length > 0
            ? `<div style="font-size:12px; color:#555;">+ ${item.additions.map((a) => a.name?.[selectedLanguage] || a.name?.ar || a.name).join(", ")}</div>`
            : "";
        const protein = item.selectedProtein
          ? `<div style="font-size:13px; color:#000; font-weight:bold; margin-top:2px;">${t("protein") || "البروتين"}: ${t(item.selectedProtein.toLowerCase()) || item.selectedProtein}</div>`
          : "";
        const spicy = item.isSpicy
          ? `<div style="color:red; font-size:12px;">${t("spicy") || "حار"}</div>`
          : "";
        const allNotes = [item.notes, idx === 0 ? order.orderNote : ""]
          .filter(Boolean)
          .join(" - ");
        const notes = allNotes
          ? `<div style="font-size:12px; color:#777;">${t("notes") || "ملاحظات"}: ${allNotes}</div>`
          : "";

        return `
          <tr>
            <td style="padding:6px; border-bottom:1px solid #eee;">
              ${item.productId?.name?.[selectedLanguage] || item.name?.[selectedLanguage] || item.productId?.name?.ar || item.name?.ar || "وجبة"}
              ${additions}${protein}${spicy}${notes}
            </td>
            <td style="text-align:center; padding:6px; border-bottom:1px solid #eee;">${item.quantity}</td>
            <td style="text-align:left; padding:6px; border-bottom:1px solid #eee;">${((item.priceAtPurchase || item.price || 0) * item.quantity).toFixed(2)} JOD</td>
          </tr>`;
      })
      .join("");

    const subtotal = (
      (order.totalPrice || 0) -
      (order.shippingAddress?.deliveryCost || 0) +
      (order.discountAmount || 0)
    ).toFixed(2);

    const invoiceHtml = `
      <div style="direction:rtl; font-family:Tahoma, sans-serif; width:100%; max-width:480px; margin:auto; padding:16px; border:1px solid #ccc; background:#fff;">
        <h2 style="text-align:center; margin-bottom:8px;">${t("invoice_title") || "فاتورة"} #${order.sequenceNumber || order._id?.slice(-6)}</h2>
        <p style="text-align:center; font-size:14px;"><strong>${t("invoice_customer") || "العميل:"}</strong> ${customerName}</p>
        <p style="text-align:center; font-size:14px;"><strong>${t("invoice_phone") || "الهاتف:"}</strong> ${customerPhone}</p>
        <p style="text-align:center; font-size:14px;"><strong>${t("order_type") || "نوع الطلب:"}</strong> ${deliveryType}</p>
        ${areaRow}
        <hr/>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="padding:6px; border-bottom:1px solid #000; text-align:right;">${t("product") || "المنتج"}</th>
              <th style="padding:6px; border-bottom:1px solid #000; text-align:center;">${t("quantity") || "الكمية"}</th>
              <th style="padding:6px; border-bottom:1px solid #000; text-align:left;">${t("price") || "السعر"}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:10px; font-size:14px;">
          <p style="display:flex; justify-content:space-between;"><strong>${t("subtotal") || "المجموع الفرعي"}:</strong> <span>${subtotal} JOD</span></p>
          ${discountRow}
          <p style="display:flex; justify-content:space-between;"><strong>${t("delivery") || "التوصيل"}:</strong> <span>${order.shippingAddress?.deliveryCost || 0} JOD</span></p>
          <p style="display:flex; justify-content:space-between; font-weight:bold; font-size:16px;"><strong>${t("total") || "الإجمالي"}:</strong> <span>${(order.totalPrice || 0).toFixed(2)} JOD</span></p>
          <p style="text-align:center; font-size:12px; color:#15803d; font-weight:bold; margin-top:6px; background:#f0fdf4; padding:4px; border-radius:6px;">مدفوع مسبقاً (Prepaid) ✅ لا يوجد مبالغ للتحصيل</p>
        </div>
        <hr />
        <p style="text-align:center; font-weight:bold;"> ${t("invoice_thank_you") || "شكراً لاختياركم شاورما شيش"} </p>
      </div>`;

    const printWindow = window.open("", "", "width=400,height=600");
    if (!printWindow) return;
    printWindow.document.write(
      `<html><head><title>فاتورة #${order.sequenceNumber || order._id?.slice(-6)}</title><meta charset="UTF-8" /></head><body>${invoiceHtml}</body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Print Invoice to Cashier Thermal Printer(s) (192.168.1.54 / 192.168.1.53) with browser fallback
  const printOrderInvoice = async (order) => {
    if (!order) return;
    try {
      const res = await printCashierInvoice(order, { force: true });
      if (res?.success) {
        const printerNames = res.results?.filter((r) => r.success).map((r) => r.printer).join(" و ") || "طابعة الكاشير";
        toast.success(`تم إرسال الفاتورة #${order.sequenceNumber || order._id?.slice(-6)} إلى (${printerNames}) بنجاح 🖨️`);
        return;
      }
      console.warn("Thermal print agent failed or offline, falling back to browser print:", res?.error);
      toast.error(`تعذر الطباعة المباشرة على طابعة الكاشير: ${res?.error || "تأكد من تشغيل start.bat"}. جاري الفتح عبر المتصفح...`);
      fallbackBrowserPrint(order);
    } catch (err) {
      console.error("Print error:", err);
      toast.error("حدث خطأ أثناء الطباعة، جاري الفتح عبر المتصفح...");
      fallbackBrowserPrint(order);
    }
  };

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
      case "unavailable":
        return {
          label: "غير متاح (خارج الخدمة) 🔴",
          color: "bg-red-600 text-white",
        };
      default:
        return { label: status, color: "bg-gray-500 text-white" };
    }
  };

  // Active uncompleted orders (for top KPI Card 1 and Active filter)
  const activeOrders = useMemo(() => {
    return orders.filter((o) => {
      const norm = String(o.status || "").toLowerCase();
      return !["delivered", "submitted", "cancelled", "canceled", "processing", "pending"].includes(norm);
    });
  }, [orders]);

  const activeDeliveryCount = useMemo(() => {
    return activeOrders.filter((o) => o.orderType !== "pickup").length;
  }, [activeOrders]);

  const activePickupCount = useMemo(() => {
    return activeOrders.filter((o) => o.orderType === "pickup").length;
  }, [activeOrders]);

  // Live Counts for each Status Tab (filtered by orderTypeFilter)
  const statusCounts = useMemo(() => {
    const counts = {
      all: 0,
      Confirmed: 0,
      ReadyForPickup: 0,
      Shipped: 0,
      Delivered: 0,
    };
    orders.forEach((order) => {
      const isPickup = order.orderType === "pickup";
      if (orderTypeFilter === "delivery" && isPickup) return;
      if (orderTypeFilter === "pickup" && !isPickup) return;

      const norm = String(order.status || "").toLowerCase();
      if (["processing", "pending", "cancelled", "canceled"].includes(norm)) return;

      // "all" count only includes active orders (completed orders are displayed only under "Delivered")
      if (!["delivered", "submitted"].includes(norm)) {
        counts.all += 1;
      }

      if (norm === "confirmed") counts.Confirmed += 1;
      else if (norm === "readyforpickup") counts.ReadyForPickup += 1;
      else if (norm === "shipped" || norm === "outfordelivery") counts.Shipped += 1;
      else if (norm === "delivered" || norm === "submitted") counts.Delivered += 1;
    });
    return counts;
  }, [orders, orderTypeFilter]);

  // Counts for Order Type Filter Pills (filtered by statusTab)
  const orderTypeCounts = useMemo(() => {
    const counts = { all: 0, delivery: 0, pickup: 0 };
    orders.forEach((order) => {
      const norm = String(order.status || "").toLowerCase();
      if (["processing", "pending", "cancelled", "canceled"].includes(norm)) return;
      if (!matchStatus(order.status, statusTab)) return;

      counts.all += 1;
      if (order.orderType === "pickup") counts.pickup += 1;
      else counts.delivery += 1;
    });
    return counts;
  }, [orders, statusTab]);

  // Dynamically extract all unique areas from current orders (matching current statusTab and orderTypeFilter)
  const availableAreas = useMemo(() => {
    const areaMap = new Map();
    orders.forEach((order) => {
      const norm = String(order.status || "").toLowerCase();
      if (["processing", "pending", "cancelled", "canceled"].includes(norm)) return;
      if (!matchStatus(order.status, statusTab)) return;
      if (orderTypeFilter === "delivery" && order.orderType === "pickup") return;
      if (orderTypeFilter === "pickup" && order.orderType !== "pickup") return;

      const areaName = getOrderAreaName(order);
      if (areaName) {
        areaMap.set(areaName, (areaMap.get(areaName) || 0) + 1);
      }
    });

    return Array.from(areaMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ar"));
  }, [orders, statusTab, orderTypeFilter]);

  // Auto-reset selectedArea if it no longer exists in availableAreas
  useEffect(() => {
    if (selectedArea !== "all") {
      const exists = availableAreas.some((a) => a.name === selectedArea);
      if (!exists) {
        setSelectedArea("all");
      }
    }
  }, [availableAreas, selectedArea]);

  // Orders displayed in the queue list
  const displayedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const norm = String(order.status || "").toLowerCase();
        if (["processing", "pending", "cancelled", "canceled"].includes(norm)) {
          return false;
        }
        if (!matchStatus(order.status, statusTab)) {
          return false;
        }
        const isPickup = order.orderType === "pickup";
        if (orderTypeFilter === "delivery" && isPickup) return false;
        if (orderTypeFilter === "pickup" && !isPickup) return false;

        // Area Filter
        if (selectedArea !== "all") {
          const areaName = getOrderAreaName(order);
          if (areaName !== selectedArea) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const normA = String(a.status || "").toLowerCase();
        const normB = String(b.status || "").toLowerCase();
        const isCompletedA = ["delivered", "submitted"].includes(normA);
        const isCompletedB = ["delivered", "submitted"].includes(normB);
        if (isCompletedA || isCompletedB) {
          const timeA = new Date(a.submittedAt || a.updatedAt || a.createdAt).getTime();
          const timeB = new Date(b.submittedAt || b.updatedAt || b.createdAt).getTime();
          return timeB - timeA;
        }
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      });
  }, [orders, statusTab, orderTypeFilter, selectedArea]);

  // Check if any driver at the branch has an unacknowledged 3-minute pickup delay
  const hasAnyOverduePickup = useMemo(() => {
    return availableDrivers.some((d) =>
      (d.activeOrders || []).some((ord) => {
        if (ord.status === "Shipped") return false;
        const assignedTime = ord.assignedAt ? new Date(ord.assignedAt).getTime() : 0;
        return assignedTime > 0 && Math.floor((currentTime - assignedTime) / 60000) >= 3;
      })
    );
  }, [availableDrivers, currentTime]);

  // Filtered fleet drivers for Drawer Tab 2
  const filteredFleetDrivers = useMemo(() => {
    if (fleetStatusFilter === "all") return allDrivers;
    return allDrivers.filter((d) => d.driverStatus === fleetStatusFilter);
  }, [allDrivers, fleetStatusFilter]);

  // Synchronize modal order with latest data
  const currentModalOrder = useMemo(() => {
    if (!selectedOrderForModal) return null;
    return (
      orders.find((o) => o._id === selectedOrderForModal._id) ||
      completedOrders.find((o) => o._id === selectedOrderForModal._id) ||
      selectedOrderForModal
    );
  }, [selectedOrderForModal, orders, completedOrders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-bold">
            جاري تحميل لوحة الإرسال والتوصيل...
          </p>
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
        {/* 1. Consolidated Top Header Bar */}
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
                إدارة طابور السائقين وتسليم طلبات التوصيل والاستلام فورياً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cashier Thermal Printer Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                printAgentOnline
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-amber-50 border-amber-300 text-amber-700"
              }`}
              title={
                printAgentOnline
                  ? "طابعات الكاشير متصلة (192.168.1.54 & 192.168.1.53)"
                  : "برنامج الطباعة غير متصل (تأكد من تشغيل start.bat)"
              }
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  printAgentOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {printAgentOnline ? "طابعة الكاشير متصلة" : "طابعة الكاشير غير متصلة"}
              </span>
            </div>

            {/* Consolidated Board Settings Popover */}
            <div className="relative" ref={settingsPopoverRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettingsPopover((prev) => !prev)}
                className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-bold flex items-center gap-1.5"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span>⚙️ إعدادات اللوحة</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showSettingsPopover ? "rotate-180" : ""}`} />
              </Button>

              {showSettingsPopover && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 space-y-3.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  {/* Driver Capacity Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                      <span>سعة السائق (الحد الأقصى):</span>
                      <span className="text-red-600 font-mono font-black">{maxOrdersPerRider} طلبات</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          disabled={savingSettings || !isAdmin}
                          onClick={() => handleUpdateMaxOrders(val)}
                          className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            maxOrdersPerRider === val
                              ? "bg-red-600 text-white border-red-600 shadow-xs"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          } ${!isAdmin ? "opacity-60 cursor-not-allowed" : ""}`}
                          title={isAdmin ? `تحديد ${val} طلبات` : "تعديل السعة متاح للمدراء فقط"}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    {!isAdmin && (
                      <p className="text-[10px] text-gray-400">تعديل السعة متاح للمدراء فقط</p>
                    )}
                  </div>

                  <hr className="border-gray-100" />

                  {/* Audio Alert Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">التنبيه الصوتي:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSoundEnabled((prev) => !prev);
                        toast.success(!soundEnabled ? "تم تفعيل التنبيه الصوتي 🔔" : "تم كتم الصوت 🔕");
                      }}
                      className={`h-8 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                        soundEnabled
                          ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {soundEnabled ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 ml-1" />
                          الصوت مفعّل
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3.5 h-3.5 ml-1" />
                          الصوت مكتوم
                        </>
                      )}
                    </Button>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Driver App Preview Link */}
                  <div>
                    <a
                      href="/rider"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-colors"
                    >
                      <Bike className="w-3.5 h-3.5 text-amber-700" />
                      <span>فتح شاشة السائق 🛵</span>
                      <ExternalLink className="w-3 h-3 text-amber-600" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Operational Action 1: Branch QR Modal Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQrModal(true)}
              className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 font-bold"
            >
              <QrCode className="w-4 h-4 ml-1.5" />
              رمز QR للفرع
            </Button>

            {/* Operational Action 2: Refresh Icon Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchQueueData(true)}
              disabled={refreshing}
              className="rounded-xl border-gray-200 hover:bg-gray-100 p-2"
              title="تحديث البيانات"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* 2. Top KPI Summary Cards as Drawer Triggers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Branch Orders */}
          <Card
            onClick={() => {
              setStatusTab("all");
              setOrderTypeFilter("all");
              setSelectedArea("all");
            }}
            className="rounded-2xl border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all ring-1 ring-amber-100"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  طلبات نشطة بالفرع
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-black text-amber-900">
                    {activeOrders.length}
                  </h3>
                  <span className="inline-flex items-center text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                    {activeDeliveryCount} توصيل • {activePickupCount} استلام
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Available Drivers -> Opens Drawer to Tab 1 */}
          <Card
            onClick={() => {
              setDriverTab("available");
              setIsDriverDrawerOpen(true);
            }}
            className="rounded-2xl border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all ring-1 ring-emerald-100"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  سائقين متاحين بالفرع
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-black text-emerald-900">
                    {availableDrivers.length}
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>عرض الطابور ◂</span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Orders on the way -> Opens Drawer to Tab 2 filtered to on_delivery */}
          <Card
            onClick={() => {
              setStatusTab("Shipped");
              setDriverTab("fleet");
              setFleetStatusFilter("on_delivery");
              setIsDriverDrawerOpen(true);
            }}
            className="rounded-2xl border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all ring-1 ring-blue-100"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  طلبات في الطريق
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-black text-blue-900">
                    {
                      allDrivers.filter((d) => d.driverStatus === "on_delivery")
                        .length
                    }
                  </h3>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>تتبع الرحلات ◂</span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Bike className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Drivers returning to branch -> Opens Drawer to Tab 2 filtered to returning */}
          <Card
            onClick={() => {
              setDriverTab("fleet");
              setFleetStatusFilter("returning");
              setIsDriverDrawerOpen(true);
            }}
            className="rounded-2xl border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all ring-1 ring-purple-100"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  سائقين عائدين للفرع
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-black text-purple-900">
                    {
                      allDrivers.filter((d) => d.driverStatus === "returning")
                        .length
                    }
                  </h3>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>تسجيل العودة ◂</span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full-Width Orders Workspace */}
        <div className="w-full space-y-3.5">
          {/* 2. Full-Width Unified Order Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-2.5 shadow-xs flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Right Side (RTL): Order Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar max-w-full">
                {STATUS_TABS.map((tab) => {
                  const isSelected = statusTab === tab.id;
                  const count = statusCounts[tab.id] || 0;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
                        isSelected
                          ? tab.activeClass
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? tab.badgeActiveClass
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Center: Order Type Filter Pills */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOrderTypeFilter("all")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    orderTypeFilter === "all"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span>الكل</span>
                  <span className="text-[10px] text-gray-400">({orderTypeCounts.all})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderTypeFilter("delivery")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    orderTypeFilter === "delivery"
                      ? "bg-white text-blue-900 shadow-xs font-black"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span>🛵 توصيل</span>
                  <span className="text-[10px] text-gray-400">({orderTypeCounts.delivery})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderTypeFilter("pickup")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    orderTypeFilter === "pickup"
                      ? "bg-white text-amber-900 shadow-xs font-black"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span>🛍️ استلام</span>
                  <span className="text-[10px] text-gray-400">({orderTypeCounts.pickup})</span>
                </button>
              </div>

              {/* Left Side (RTL): "Next FIFO Driver" Context Pill & Drawer Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  setDriverTab("available");
                  setIsDriverDrawerOpen(true);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0 ${
                  hasAnyOverduePickup
                    ? "bg-red-50 hover:bg-red-100 border-red-300 text-red-800 animate-pulse ring-1 ring-red-400"
                    : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900"
                }`}
                title="فتح طابور السائقين وإدارة الأسطول"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {topDriver ? (
                  <span>
                    🟢 الدور التالي: #{availableDrivers.findIndex((d) => d._id === topDriver._id) + 1} {topDriver.name || topDriver.username} ({topDriver.activeOrdersCount || 0}/{maxOrdersPerRider})
                  </span>
                ) : (
                  <span>لا يوجد سائق متاح</span>
                )}
                <span className="text-gray-300 mx-0.5">|</span>
                <span className="font-mono">طابور السائقين ({availableDrivers.length}) ◂</span>
                {hasAnyOverduePickup && (
                  <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black mr-1">
                    ⚠️ تأخير
                  </span>
                )}
              </button>
            </div>

            {/* Dynamic Area Filter Row (fetched from current orders locations) */}
            {availableAreas.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar border-t border-gray-100 pt-2 w-full">
                <div className="flex items-center gap-1 text-xs font-bold text-gray-500 shrink-0 ml-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>المناطق:</span>
                </div>

                {/* All Areas Pill */}
                <button
                  type="button"
                  onClick={() => setSelectedArea("all")}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs ${
                    selectedArea === "all"
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>جميع المناطق</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      selectedArea === "all"
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {availableAreas.reduce((sum, a) => sum + a.count, 0)}
                  </span>
                </button>

                {/* Specific Area Pills */}
                {availableAreas.map((area) => {
                  const isSelected = selectedArea === area.name;
                  const isCounter = area.name.includes("كاونتر");
                  return (
                    <button
                      key={area.name}
                      type="button"
                      onClick={() => setSelectedArea(area.name)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs ${
                        isSelected
                          ? isCounter
                            ? "bg-amber-600 text-white shadow-xs"
                            : "bg-red-600 text-white shadow-xs"
                          : isCounter
                          ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {isCounter ? (
                        <Store className="w-3 h-3 text-amber-600" />
                      ) : (
                        <MapPin className="w-3 h-3 text-red-500" />
                      )}
                      <span>{area.name}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? "bg-white/20 text-white font-black"
                            : isCounter
                            ? "bg-amber-200 text-amber-900"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {area.count}
                      </span>
                    </button>
                  );
                })}

                {/* Clear filter button */}
                {selectedArea !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedArea("all")}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline px-2 py-0.5 shrink-0 flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" />
                    <span>إلغاء التصفية</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Orders List */}
          {displayedOrders.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-2 border-gray-200 bg-white/60 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                {selectedArea !== "all"
                  ? `لا توجد طلبات في منطقة "${selectedArea}" حالياً`
                  : `لا توجد طلبات في قسم "${STATUS_TABS.find((t) => t.id === statusTab)?.label || "الطلبات"}" حالياً`}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {selectedArea !== "all"
                  ? "يمكنك تغيير المنطقة أو عرض جميع المناطق لمشاهدة باقي الطلبات"
                  : "عند وصول أو تحديث طلبات بهذه الحالة، ستظهر هنا تلقائياً"}
              </p>
              {selectedArea !== "all" && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedArea("all")}
                    className="rounded-xl border-gray-300 font-bold text-xs"
                  >
                    عرض جميع المناطق
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="space-y-2">
              {displayedOrders.map((order) => {
                const norm = String(order.status || "").toLowerCase();
                const isPickup = order.orderType === "pickup";
                const isCompleted = ["delivered", "submitted"].includes(norm);
                const isAssigned = !isPickup && !!order.assignedRiderId;
                const assignedRider = order.assignedRiderId;

                // Overdue assignment check: assigned for >= 3 minutes without pickup confirmation
                const isPendingPickup = isAssigned && (order.status === "ReadyForPickup" || !order.status);
                const assignedTimestamp = order.assignedAt
                  ? new Date(order.assignedAt).getTime()
                  : (order.updatedAt ? new Date(order.updatedAt).getTime() : null);
                const minutesSinceAssignment = assignedTimestamp
                  ? Math.floor((currentTime - assignedTimestamp) / 60000)
                  : 0;
                const isOverdueAssignment = !isCompleted && isPendingPickup && minutesSinceAssignment >= 3;

                // High-level Primary Delivery Zone
                const primaryZone = getOrderArea(order) || "المنطقة";

                // Timer text and urgency
                const timerText = isCompleted
                  ? `✓ ${formatCompletedTime(order.submittedAt || order.updatedAt)}`
                  : `🕒 ${formatWaitTimeAbbr(order.createdAt)}`;
                const timerColorClass = isCompleted
                  ? "text-gray-500"
                  : getTimerUrgencyClass(order.createdAt);

                // 3-Zone Card Border Accent & Background
                const cardAccentClass = isCompleted
                  ? "bg-gray-50/70 border-gray-200 border-r-4 border-r-emerald-500 hover:border-gray-300"
                  : isPickup
                  ? "bg-amber-50/40 border-amber-200 border-r-4 border-r-amber-500 hover:border-amber-300"
                  : isOverdueAssignment
                  ? "border-red-400 bg-red-50/30 border-r-4 border-r-red-600 animate-pulse ring-1 ring-red-300"
                  : "bg-white border-gray-200 border-r-4 border-r-red-600 hover:border-gray-300";

                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrderForModal(order)}
                    className={`min-h-[58px] sm:min-h-[60px] px-4 py-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs select-none ${cardAccentClass}`}
                  >
                    {/* Zone 1 (Right): ID, Single Status Badge & Inline Timer */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Order ID: Bold Monospace */}
                      <span className="font-mono font-black text-sm sm:text-base text-gray-900 tracking-tight">
                        #{order.sequenceNumber || order._id.slice(-6)}
                      </span>

                      {/* علامة طلبات (اشبك) */}
                      {order.source === "ishbek" && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                          Talabat
                        </span>
                      )}

                      {/* Single Concise Status Badge */}
                      {renderOrderStatusBadge(order, isCompleted)}

                      {/* Overdue Alert Tag */}
                      {isOverdueAssignment && (
                        <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] font-black px-1.5 py-0.5 rounded animate-pulse whitespace-nowrap">
                          ⚠️ متأخر {minutesSinceAssignment} د
                        </span>
                      )}

                      {/* Compact Inline Wait Timer */}
                      <span className={`inline-flex items-center gap-1 text-[11px] whitespace-nowrap ${timerColorClass}`}>
                        <span>{timerText}</span>
                      </span>
                    </div>

                    {/* Zone 2 (Center): Clean Typography for Customer & Location */}
                    <div className="flex items-center gap-2 min-w-0 flex-1 truncate px-2 sm:px-4">
                      {/* Customer Name */}
                      <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                        {order.userDetails?.name || order.userId?.name || "زبون"}
                      </span>

                      {/* Clickable Phone Link */}
                      <a
                        href={`tel:${order.userDetails?.phone || order.userId?.phone || ""}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] sm:text-xs font-mono text-gray-500 hover:text-red-600 underline whitespace-nowrap"
                        dir="ltr"
                      >
                        {order.userDetails?.phone || order.userId?.phone || "-"}
                      </a>

                      {/* Subtle Separator Dot */}
                      <span className="text-gray-300 font-bold">•</span>

                      {/* Primary Zone or Counter Text */}
                      <span className="text-xs text-gray-600 truncate flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                        <span className="truncate">{isPickup ? "تسليم الكاونتر" : primaryZone}</span>
                      </span>
                    </div>

                    {/* Zone 3 (Left): Primary Action Button & Icon-Only Print */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Action: Active Unassigned Delivery -> 1-Click FIFO Assign */}
                      {!isCompleted && !isPickup && !isAssigned && (
                        topDriver ? (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssign(order._id, topDriver._id);
                            }}
                            disabled={assigningOrderId === order._id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-xs flex items-center gap-1.5 whitespace-nowrap transition-colors flex-shrink-0"
                            title={`إرسال إلى السائق ${topDriver.name || topDriver.username}`}
                          >
                            <Zap className="w-3.5 h-3.5 fill-current flex-shrink-0 text-yellow-300" />
                            {assigningOrderId === order._id ? (
                              <span className="animate-pulse">جاري الإرسال...</span>
                            ) : (
                              <span className="max-w-[150px] sm:max-w-[200px] md:max-w-none truncate">
                                إرسال إلى: {topDriver.name || topDriver.username}
                              </span>
                            )}
                          </Button>
                        ) : (
                          <span className="text-[11px] text-gray-500 font-bold bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg whitespace-nowrap">
                            لا يوجد سائق متاح
                          </span>
                        )
                      )}

                      {/* Action: Active Assigned Delivery -> Interactive Pill to open modal */}
                      {!isCompleted && !isPickup && isAssigned && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderForModal(order);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs h-8 px-2.5 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap"
                          title="تعديل أو إلغاء تعيين السائق"
                        >
                          <Bike className="w-3.5 h-3.5 text-blue-600" />
                          <span className="truncate max-w-[120px]">🛵 {assignedRider?.name || assignedRider?.username || "سائق"} ▾</span>
                        </button>
                      )}

                      {/* Action: Active Pickup -> 1-Click Handover Button */}
                      {!isCompleted && isPickup && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompletePickup(order._id);
                          }}
                          disabled={completingOrderId === order._id}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 px-2.5 rounded-lg shadow-xs flex items-center gap-1 whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تسليم للعميل ✔️</span>
                        </Button>
                      )}

                      {/* Icon-Only Print Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          printOrderInvoice(order);
                        }}
                        title="طباعة الفاتورة"
                        className="w-8 h-8 rounded-lg border border-gray-200 hover:border-red-300 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Slide-Over Left Drawer: Driver Queue & Full Fleet Panel */}
      {/* Dimmed Backdrop */}
      {isDriverDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsDriverDrawerOpen(false)}
        />
      )}

      {/* Off-Canvas Left Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-full max-w-md bg-gray-50 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isDriverDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-white flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-base">
                إدارة طابور السائقين والأسطول
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                متابعة حضور السائقين وتوزيع الرحلات فورياً
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span
              title="ترتيب السائقين تلقائي بحسب أسبقية الحضور ومسح رمز الـ QR عند العودة للفرع (FIFO)"
              className="cursor-help p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <Info className="w-4 h-4" />
            </span>
            <button
              type="button"
              onClick={() => setIsDriverDrawerOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Segmented Tabs */}
        <div className="p-3 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setDriverTab("available")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                driverTab === "available"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>طابور المتاحين</span>
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {availableDrivers.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDriverTab("fleet")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                driverTab === "fleet"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Bike className="w-4 h-4 text-blue-600" />
              <span>الأسطول بالكامل</span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {allDrivers.length}
              </span>
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {driverTab === "available" ? (
            /* Tab 1: Available Drivers Queue */
            <div className="space-y-2.5">
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
                  const isAtCapacity = (driver.activeOrdersCount || 0) >= maxOrdersPerRider;
                  const isNextInLine = driver._id === topDriver?._id;
                  const isDrawerOpen = Boolean(expandedDriverLoads[driver._id]);

                  const overdueOrder = (driver.activeOrders || []).find((ord) => {
                    if (ord.status === "Shipped") return false;
                    const assignedTime = ord.assignedAt ? new Date(ord.assignedAt).getTime() : 0;
                    return assignedTime > 0 && Math.floor((currentTime - assignedTime) / 60000) >= 3;
                  });
                  const overdueMins = overdueOrder
                    ? Math.floor((currentTime - new Date(overdueOrder.assignedAt).getTime()) / 60000)
                    : 0;

                  return (
                    <Card
                      key={driver._id}
                      className={`rounded-2xl border transition-all ${
                        overdueOrder
                          ? "border-2 border-red-400 bg-red-50/20 ring-2 ring-red-300 animate-pulse"
                          : isNextInLine
                          ? "border-emerald-400 bg-gradient-to-r from-emerald-50/50 via-white to-white shadow-md ring-2 ring-emerald-500/20"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <CardContent className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${
                                isNextInLine
                                  ? "bg-emerald-600 text-white"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              #{index + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                                  {driver.name || driver.username}
                                </h4>
                                {isNextInLine && (
                                  <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-1.5">
                                    الدور التالي 🚀
                                  </Badge>
                                )}

                                {driver.activeOrdersCount > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedDriverLoads((prev) => ({
                                        ...prev,
                                        [driver._id]: !prev[driver._id],
                                      }))
                                    }
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                                      isAtCapacity
                                        ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                        : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                    }`}
                                    title="عرض الطلبات المعينة"
                                  >
                                    <span>📦 الحمولة: {driver.activeOrdersCount}/{maxOrdersPerRider}</span>
                                    <ChevronDown
                                      className={`w-3 h-3 transition-transform ${
                                        isDrawerOpen ? "rotate-180" : ""
                                      }`}
                                    />
                                  </button>
                                ) : (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                    الحمولة: 0/{maxOrdersPerRider}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span dir="ltr">{driver.phone || "بدون هاتف"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-left flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 font-medium">
                              في الفرع:
                            </span>
                            <span className="text-xs font-bold text-emerald-700">
                              {formatWaitTimeAbbr(driver.returnedAt)}
                            </span>
                          </div>
                        </div>

                        {/* 3-Minute Pickup Delay Alert */}
                        {overdueOrder && (
                          <div className="bg-red-100 border border-red-300 text-red-800 p-2 rounded-xl text-xs font-bold flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                              <span>
                                تأخر باستلام طلب #{overdueOrder.sequenceNumber} ({overdueMins} دقيقة)!
                              </span>
                            </div>
                            <span className="text-[10px] bg-red-200 px-1.5 py-0.5 rounded">
                              تنبيه كاونتر
                            </span>
                          </div>
                        )}

                        {/* Collapsible Drawer for Driver's Assigned Orders */}
                        {isDrawerOpen && driver.activeOrders && driver.activeOrders.length > 0 && (
                          <div className="pt-2 border-t border-gray-100 space-y-1.5 animate-in fade-in-50 duration-150">
                            <p className="text-[11px] text-gray-500 font-medium">الطلبات المعينة للسائق:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {driver.activeOrders.map((ord) => (
                                <span
                                  key={ord._id}
                                  className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 text-[11px] font-bold px-2 py-0.5 rounded-lg"
                                >
                                  <span>#{ord.sequenceNumber || ord._id.slice(-4)} • {ord.zone || "المنطقة"}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUnassignOrder(ord._id)}
                                    title="إلغاء التعيين وإعادة الطلب للطابور"
                                    className="text-gray-400 hover:text-red-600 rounded-full p-0.5 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          ) : (
            /* Tab 2: Full Fleet Monitoring */
            <div className="space-y-2.5">
              {/* Fleet Status Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto p-1 bg-gray-200/70 rounded-xl scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setFleetStatusFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                    fleetStatusFilter === "all"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  الكل ({allDrivers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFleetStatusFilter("on_delivery")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                    fleetStatusFilter === "on_delivery"
                      ? "bg-white text-blue-900 shadow-xs font-black"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>في الطريق 🛵</span>
                  <span className="text-[10px] text-gray-400">
                    ({allDrivers.filter((d) => d.driverStatus === "on_delivery").length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFleetStatusFilter("returning")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                    fleetStatusFilter === "returning"
                      ? "bg-white text-purple-900 shadow-xs font-black"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>عائد للفرع ↩️</span>
                  <span className="text-[10px] text-gray-400">
                    ({allDrivers.filter((d) => d.driverStatus === "returning").length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFleetStatusFilter("available")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                    fleetStatusFilter === "available"
                      ? "bg-white text-emerald-900 shadow-xs font-black"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>متاح بالفرع ✅</span>
                  <span className="text-[10px] text-gray-400">
                    ({allDrivers.filter((d) => d.driverStatus === "available").length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFleetStatusFilter("unavailable")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                    fleetStatusFilter === "unavailable"
                      ? "bg-white text-red-900 shadow-xs font-black"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>غير متصل ⚪</span>
                  <span className="text-[10px] text-gray-400">
                    ({allDrivers.filter((d) => d.driverStatus === "unavailable").length})
                  </span>
                </button>
              </div>

              {filteredFleetDrivers.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-2 border-gray-200 bg-white/60 p-8 text-center">
                  <p className="text-sm font-bold text-gray-700">
                    لا يوجد سائقين مطابقين للفلتر المختار
                  </p>
                </Card>
              ) : (
                filteredFleetDrivers.map((driver) => {
                  const statusInfo = getDriverStatusInfo(driver.driverStatus);
                  const isReturning = driver.driverStatus === "returning";
                  const isOnDelivery = driver.driverStatus === "on_delivery";
                  const isFleetDrawerOpen = Boolean(expandedFleetLoads[driver._id]);

                  return (
                    <Card
                      key={driver._id}
                      className="rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <CardContent className="p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                              {driver.name || driver.username}
                            </h4>
                            <p
                              className="text-[11px] text-gray-500 font-mono"
                              dir="ltr"
                            >
                              {driver.phone || "-"}
                            </p>
                          </div>
                          <Badge
                            className={`${statusInfo.color} text-xs font-bold`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </div>

                        {/* Live Timers for On Delivery / Returning */}
                        {isOnDelivery && driver.shippedAt && (
                          <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2 rounded-xl text-xs flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              <Bike className="w-3.5 h-3.5 text-blue-600" />
                              في الطريق للزبون
                            </span>
                            <span className="font-mono text-blue-700">
                              {formatWaitTimeAbbr(driver.shippedAt)}
                            </span>
                          </div>
                        )}

                        {isReturning && (
                          <div className="bg-purple-50 border border-purple-200 text-purple-900 p-2 rounded-xl text-xs flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-purple-600" />
                              عائد للفرع
                            </span>
                            <span className="font-mono text-purple-700">
                              {formatWaitTimeAbbr(driver.returningSince)}
                            </span>
                          </div>
                        )}

                        {/* Active Orders Info & Collapsible List */}
                        {(driver.activeOrdersCount > 0 || driver.currentOrderId) && (
                          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-xs space-y-1.5">
                            <div
                              onClick={() =>
                                setExpandedFleetLoads((prev) => ({
                                  ...prev,
                                  [driver._id]: !prev[driver._id],
                                }))
                              }
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <span className="text-gray-600 font-medium">
                                الطلبات النشطة ({driver.activeOrdersCount || 0}/{maxOrdersPerRider}):
                              </span>
                              <span className="font-bold text-red-600 font-mono flex items-center gap-1">
                                <span>{driver.activeOrdersCount || 0} طلبات</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${isFleetDrawerOpen ? "rotate-180" : ""}`} />
                              </span>
                            </div>

                            {isFleetDrawerOpen && driver.activeOrders && (
                              <div className="pt-1.5 border-t border-gray-200/60 space-y-1">
                                {driver.activeOrders.map((ord) => (
                                  <div key={ord._id} className="flex items-center justify-between text-[11px] text-gray-700">
                                    <span className="font-bold">#{ord.sequenceNumber || ord._id.slice(-4)}</span>
                                    <span className="text-gray-500">{ord.zone || "المنطقة"}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Manual Check-in Button */}
                        {(isReturning || driver.driverStatus === "unavailable") && (
                          <div className="flex justify-end pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManualCheckIn(driver._id)}
                              disabled={checkingInRiderId === driver._id}
                              className={`text-xs rounded-xl font-bold h-8 ${
                                isReturning
                                  ? "border-purple-300 text-purple-700 hover:bg-purple-50"
                                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <UserCheck className="w-3.5 h-3.5 ml-1.5" />
                              {checkingInRiderId === driver._id
                                ? "جاري التعيين..."
                                : isReturning
                                  ? "تسجيل حضور يدوي 📍"
                                  : "تسجيل حضور يدوي"}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Scroll-Safe Order Details & Dispatch Dialog (Modal) */}
      <Dialog
        open={Boolean(selectedOrderForModal)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderForModal(null);
        }}
      >
        <DialogContent
          className="max-w-2xl w-full max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl bg-white shadow-2xl"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {currentModalOrder && (() => {
            const norm = String(currentModalOrder.status || "").toLowerCase();
            const isPickup = currentModalOrder.orderType === "pickup";
            const isFinalState = ["delivered", "submitted"].includes(norm);
            const isOnDelivery = norm === "shipped" || norm === "outfordelivery";
            const isAssigned = !isPickup && !isFinalState && !!currentModalOrder.assignedRiderId;
            const assignedRider = currentModalOrder.assignedRiderId;
            const targetZone = getOrderArea(currentModalOrder);

            const totalItemQty = (currentModalOrder.products || []).reduce(
              (acc, p) => acc + Number(p.quantity || 1),
              0
            );

            return (
              <>
                {/* Fixed Modal Header */}
                <DialogHeader className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/80 flex flex-row items-center justify-between text-right">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <DialogTitle className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                        تفاصيل الطلب #{currentModalOrder.sequenceNumber || currentModalOrder._id.slice(-6)}
                      </DialogTitle>

                      {isPickup ? (
                        <Badge className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold py-0.5 px-2.5 rounded-full">
                          <ShoppingBag className="w-3 h-3 ml-1 text-amber-700 inline" />
                          🛍️ استلام من الفرع
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold py-0.5 px-2.5 rounded-full">
                          <Bike className="w-3 h-3 ml-1 text-blue-600 inline" />
                          🛵 توصيل
                        </Badge>
                      )}

                      {renderOrderStatusBadge(currentModalOrder, isFinalState)}
                    </div>

                    <p className="text-xs text-gray-500 font-medium">
                      تاريخ الطلب: {formatFullDateTime(currentModalOrder.createdAt)}
                    </p>
                  </div>
                </DialogHeader>

                {/* Scrollable Modal Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {/* Customer & Full Address Box */}
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-bold text-sm text-gray-900">
                          {currentModalOrder.userDetails?.name || currentModalOrder.userId?.name || "زبون"}
                        </span>
                      </div>
                      <a
                        href={`tel:${currentModalOrder.userDetails?.phone || currentModalOrder.userId?.phone || ""}`}
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200"
                        dir="ltr"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{currentModalOrder.userDetails?.phone || currentModalOrder.userId?.phone || "بدون هاتف"}</span>
                      </a>
                    </div>

                    {isPickup ? (
                      <div className="mt-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 flex items-center gap-2">
                        <Store className="w-4 h-4 text-amber-700 flex-shrink-0" />
                        <span className="font-bold">
                          استلام مباشر من كاونتر الفرع - تم تجهيز الطلب بالفرع
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-start gap-1.5 text-gray-700">
                          <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">
                            {getFullAddress(currentModalOrder)}
                          </span>
                        </div>
                        {currentModalOrder.orderNote && (
                          <div className="mt-1.5 pr-5">
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] font-bold inline-block">
                              ملاحظات التوصيل: {currentModalOrder.orderNote}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Items Breakdown (الأصناف) & Prepaid Total */}
                  <div className="bg-white rounded-xl p-3.5 border border-gray-200">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                      <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-red-600" />
                        الأصناف المطلوبة
                      </h4>
                      <span className="text-xs text-gray-500 font-bold">
                        إجمالي الكمية: {totalItemQty}
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                      {currentModalOrder.products?.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-start justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2 font-bold text-gray-900">
                              <span className="text-red-700 font-mono font-black">{item.quantity}×</span>
                              <span>{item.productId?.name?.ar || item.name?.ar || "وجبة"}</span>
                              {item.isSpicy && (
                                <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-300 py-0 px-1">
                                  حار 🌶️
                                </Badge>
                              )}
                            </div>
                            {item.selectedProtein && (
                              <p className="text-[11px] text-gray-600 font-semibold mt-0.5 pr-4">
                                البروتين: {item.selectedProtein}
                              </p>
                            )}
                            {item.additions && item.additions.length > 0 && (
                              <p className="text-[11px] text-gray-500 mt-0.5 pr-4">
                                إضافات: {item.additions.map((a) => `${a.name?.ar || a.name || ""} (+${a.price} JOD)`).join("، ")}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-[11px] text-amber-700 mt-0.5 pr-4">
                                ملاحظة: {item.notes}
                              </p>
                            )}
                          </div>
                          <span className="font-mono font-bold text-gray-800 whitespace-nowrap">
                            {((item.priceAtPurchase || item.productId?.basePrice || 0) * (item.quantity || 1)).toFixed(2)} JOD
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Prepaid Total Box */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-600 font-bold">المجموع الإجمالي:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-red-600 font-mono">
                          {(currentModalOrder.totalPrice || 0).toFixed(2)} JOD
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          مدفوع مسبقاً (Prepaid)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Pickup Orders: Direct Handover Box in Modal Body */}
                  {!isFinalState && isPickup && (
                    <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-amber-950">
                            تسليم مباشر من كاونتر الفرع
                          </p>
                          <p className="text-xs text-amber-800 font-medium">
                            الطلب جاهز للاستلام. اضغط على الزر أدناه لتأكيد تسليمه للزبون.
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCompletePickup(currentModalOrder._id)}
                        disabled={completingOrderId === currentModalOrder._id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl h-10 px-5 shadow-sm whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4 ml-1.5 inline" />
                        تأكيد تسليم الطلب للعميل ✔️
                      </Button>
                    </div>
                  )}

                  {/* Conditional Driver Assignment Section: Rendered ONLY for Active Delivery */}
                  {!isFinalState && !isOnDelivery && !isPickup && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3.5">
                      {isAssigned ? (
                        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                              <Bike className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[11px] text-amber-800 font-bold">السائق المُعيّن حالياً:</p>
                              <p className="text-sm font-black text-gray-900">
                                {assignedRider?.name || assignedRider?.username || "سائق"} ({assignedRider?.phone || "بدون هاتف"})
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassignOrder(currentModalOrder._id)}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-bold border-red-200 rounded-xl"
                          >
                            <X className="w-3.5 h-3.5 ml-1" />
                            إلغاء التعيين (Unassign)
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                              <Bike className="w-4 h-4 text-emerald-600" />
                              <span>طابور السائقين المتاحين وتجميع المسارات الذكي</span>
                            </h4>
                            <span className="text-[11px] text-gray-500 font-medium">
                              المتاحين: {availableDrivers.length} سائق
                            </span>
                          </div>

                          {/* 1-Click FIFO Assign to Next Driver */}
                          {topDriver && (
                            <Button
                              onClick={() => handleAssign(currentModalOrder._id, topDriver._id)}
                              disabled={assigningOrderId === currentModalOrder._id}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs"
                            >
                              <Zap className="w-4 h-4 fill-current text-yellow-300" />
                              <span>
                                إرسال إلى: {topDriver.name || topDriver.username} ({topDriver.activeOrdersCount || 0}/{maxOrdersPerRider})
                              </span>
                            </Button>
                          )}

                          {availableDrivers.length === 0 ? (
                            <div className="p-4 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-xs">
                              لا يوجد سائقين متاحين حالياً في الفرع لإسناد الطلب
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {availableDrivers.map((driver, idx) => {
                                const isDriverFull = (driver.activeOrdersCount || 0) >= maxOrdersPerRider;
                                const matchesZone = Boolean(
                                  targetZone &&
                                  driver.activeOrders?.some((o) => {
                                    const z = o.zone || "";
                                    return (
                                      z.toLowerCase().includes(targetZone.toLowerCase()) ||
                                      targetZone.toLowerCase().includes(z.toLowerCase())
                                    );
                                  })
                                );
                                const isNextFIFO = idx === 0;

                                return (
                                  <div
                                    key={driver._id}
                                    className={cn(
                                      "p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs",
                                      matchesZone
                                        ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200"
                                        : isNextFIFO
                                        ? "bg-amber-50/60 border-amber-200"
                                        : "bg-white border-gray-200 hover:border-gray-300"
                                    )}
                                  >
                                    <div className="space-y-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-black text-gray-900">
                                          #{idx + 1} {driver.name || driver.username}
                                        </span>
                                        <span className="text-[11px] font-mono text-gray-500" dir="ltr">
                                          {driver.phone || ""}
                                        </span>

                                        {matchesZone && (
                                          <Badge className="bg-emerald-600 text-white text-[10px] font-bold py-0 px-2 rounded-full">
                                            🎯 نفس المنطقة: {targetZone}
                                          </Badge>
                                        )}

                                        {isNextFIFO && !matchesZone && (
                                          <Badge className="bg-amber-500 text-white text-[10px] font-bold py-0 px-1.5 rounded-full">
                                            🟢 الدور التالي
                                          </Badge>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
                                        <span className="font-semibold">
                                          الحمولة: {driver.activeOrdersCount || 0}/{maxOrdersPerRider} طلبات
                                        </span>
                                        {driver.activeOrders && driver.activeOrders.length > 0 && (
                                          <>
                                            <span>•</span>
                                            <span>المناطق المحمولة:</span>
                                            <span className="font-bold text-gray-700">
                                              {driver.activeOrders.map((o) => o.zone || "المنطقة").join("، ")}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    <Button
                                      size="sm"
                                      onClick={() => handleAssign(currentModalOrder._id, driver._id)}
                                      disabled={assigningOrderId === currentModalOrder._id || isDriverFull}
                                      className={cn(
                                        "font-black text-xs rounded-xl h-8 px-3.5 shrink-0 shadow-xs",
                                        matchesZone
                                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                          : isNextFIFO
                                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                                          : "bg-red-600 hover:bg-red-700 text-white"
                                      )}
                                    >
                                      {isDriverFull ? "ممتلئ" : matchesZone ? "إرسال (نفس المنطقة) 🎯" : "إرسال ⚡"}
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Manual Driver Override Dropdown */}
                          <div className="pt-2.5 border-t border-gray-200 space-y-1.5">
                            <p className="text-[11px] font-bold text-gray-600">
                              أو اختيار يدوي وتأكيد التعيين:
                            </p>

                            <div className="flex items-center gap-2">
                              <select
                                value={selectedRiderForOrder[currentModalOrder._id] || ""}
                                onChange={(e) =>
                                  setSelectedRiderForOrder({
                                    ...selectedRiderForOrder,
                                    [currentModalOrder._id]: e.target.value,
                                  })
                                }
                                className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                              >
                                <option value="">
                                  {topDriver ? "اختر سائقاً يدوياً..." : "اختر سائقاً..."}
                                </option>
                                {availableDrivers.map((driver, idx) => {
                                  const matchesZone = Boolean(
                                    targetZone &&
                                    driver.activeOrders?.some((o) => {
                                      const z = o.zone || "";
                                      return (
                                        z.toLowerCase().includes(targetZone.toLowerCase()) ||
                                        targetZone.toLowerCase().includes(z.toLowerCase())
                                      );
                                    })
                                  );

                                  return (
                                    <option key={driver._id} value={driver._id}>
                                      #{idx + 1} {driver.name || driver.username} ({driver.activeOrdersCount || 0}/{maxOrdersPerRider} طلبات)
                                      {matchesZone ? ` 🎯 [نفس المنطقة: ${targetZone}]` : ""}
                                    </option>
                                  );
                                })}
                              </select>

                              <Button
                                onClick={() => handleAssign(currentModalOrder._id)}
                                disabled={
                                  assigningOrderId === currentModalOrder._id ||
                                  (!selectedRiderForOrder[currentModalOrder._id] && !topDriver)
                                }
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl whitespace-nowrap h-9 px-4 text-xs"
                              >
                                تعيين
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed / Review Mode for Orders */}
                  {(isFinalState || isOnDelivery) && (
                    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-gray-800 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>حالة الطلب: {getOrderStatusLabel(currentModalOrder.status, currentModalOrder.orderType, t)}</span>
                      </div>
                      <p className="text-gray-600">
                        وقت الإنجاز/التحديث: {formatFullDateTime(currentModalOrder.submittedAt || currentModalOrder.updatedAt || currentModalOrder.createdAt)}
                      </p>
                      {currentModalOrder.assignedRiderId && (
                        <p className="text-gray-600">
                          السائق: {currentModalOrder.assignedRiderId.name || currentModalOrder.assignedRiderId.username}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Fixed Modal Footer */}
                <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={() => printOrderInvoice(currentModalOrder)}
                    className="border-gray-200 text-gray-700 hover:text-red-700 font-bold text-xs flex items-center gap-1.5 rounded-xl h-9"
                  >
                    <Printer className="w-4 h-4 text-red-600" />
                    <span>طباعة الفاتورة</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    {!isFinalState && isPickup && (
                      <Button
                        onClick={() => handleCompletePickup(currentModalOrder._id)}
                        disabled={completingOrderId === currentModalOrder._id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9"
                      >
                        تأكيد تسليم الطلب للعميل ✔️
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setSelectedOrderForModal(null)}
                      className="rounded-xl text-xs font-bold h-9"
                    >
                      إغلاق
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Branch QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent
          className="max-w-md rounded-3xl p-6 text-center"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900">
              رمز QR نقطة العودة للفرع 📍
            </DialogTitle>
          </DialogHeader>

          <div className="my-4 space-y-4">
            <p className="text-xs text-gray-600">
              يتم وضع هذا الرمز عند كاونتر الإرسال بالفرع. يمسحه السائق عند
              عودته ليصبح تلقائياً في قائمة السائقين المتاحين بالدور.
            </p>

            <div className="bg-white p-6 border-2 border-dashed border-red-300 rounded-2xl inline-block shadow-inner">
              <img
                id="branch-qr-img"
                crossOrigin="anonymous"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                  BRANCH_QR_CODE,
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
                    BRANCH_QR_CODE,
                  )}`;

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
                    console.warn(
                      "Could not convert QR to dataURL, using URL instead",
                      e,
                    );
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
                            امسح هذا الرمز عند عودتك للفرع لتسجيل الدخول في طابور الانتظار
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
