import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import deliveryService from "@/services/deliveryService";
import {
  Bike,
  Package,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Calendar,
  Search,
  ArrowRight,
  Download,
  Timer,
  Navigation,
  CreditCard,
  AlertTriangle,
  Check,
  RotateCcw,
  Receipt,
  DollarSign,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loading from "@/components/common/Loading";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DriverStatistics({ dateFilter: propDateFilter, setDateFilter: propSetDateFilter }) {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    drivers: [],
    fleetSummary: {
      totalDrivers: 0,
      totalDeliveredOrders: 0,
      totalDeliveryFees: 0,
      totalDriverShare: 0,
      totalRestaurantShare: 0,
      totalPaidDriverShare: 0,
      totalUnpaidDriverShare: 0,
      fleetMedianDeliveryMinutes: 0,
      fleetMedianPickupMinutes: 0,
      fleetMedianReturnMinutes: 0,
    },
  });

  // Filter States
  const [activePeriod, setActivePeriod] = useState(propDateFilter || "all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("all");
  const [settlementFilter, setSettlementFilter] = useState("all"); // "all" | "unpaid" | "settled"

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [showEarningsFor, setShowEarningsFor] = useState({}); // { [driverId]: bool }
  const [showModalEarnings, setShowModalEarnings] = useState(false);

  // Settlement Dialog States
  const [settlingDriver, setSettlingDriver] = useState(null);
  const [settlementScope, setSettlementScope] = useState("all_unpaid"); // "all_unpaid" | "period"
  const [payoutPaymentMethod, setPayoutPaymentMethod] = useState("CASH"); // "CASH" | "CLIQ"
  const [payoutNote, setPayoutNote] = useState("");
  const [isSettling, setIsSettling] = useState(false);

  // Trip Details Modal Tab & Payouts State
  const [modalActiveTab, setModalActiveTab] = useState("trips"); // "trips" | "payouts"
  const [payoutsList, setPayoutsList] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  // Void Payout Dialog States
  const [voidingPayout, setVoidingPayout] = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [isVoiding, setIsVoiding] = useState(false);

  // Synchronize prop dateFilter if provided externally
  useEffect(() => {
    if (propDateFilter && propDateFilter !== activePeriod) {
      setActivePeriod(propDateFilter);
    }
  }, [propDateFilter]);

  const handlePeriodChange = (periodId) => {
    setActivePeriod(periodId);
    if (propSetDateFilter && ["all", "today", "yesterday", "week", "month"].includes(periodId)) {
      propSetDateFilter(periodId);
    }
  };

  const fetchStats = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const params = {
        period: activePeriod,
        from: activePeriod === "custom" && customFrom ? customFrom : undefined,
        to: activePeriod === "custom" && customTo ? customTo : undefined,
        driverId: selectedDriverId !== "all" ? selectedDriverId : undefined,
        settlementStatus: settlementFilter !== "all" ? settlementFilter : undefined,
      };

      const res = await deliveryService.getDriverAnalytics(user.token, params);
      if (res?.success) {
        setData(res);
        if (selectedDriver) {
          const updated = res.drivers.find(
            (d) => String(d.driver._id) === String(selectedDriver.driver._id)
          );
          if (updated) setSelectedDriver(updated);
        }
      }
    } catch (err) {
      console.error("Failed to fetch driver analytics:", err);
      toast.error("فشل تحميل إحصائيات السائقين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [activePeriod, customFrom, customTo, selectedDriverId, settlementFilter, user?.token]);

  // Fetch Payout History for a driver
  const fetchPayoutHistory = async (driverId) => {
    if (!driverId || !user?.token) return;
    setLoadingPayouts(true);
    try {
      const res = await deliveryService.getDriverPayoutHistory(driverId, user.token);
      if (res?.success) {
        setPayoutsList(res.payouts || []);
      }
    } catch (err) {
      console.error("Failed to fetch payout history:", err);
      toast.error("فشل تحميل سجل سندات الصرف");
    } finally {
      setLoadingPayouts(false);
    }
  };

  // Open Settlement Confirmation Modal
  const openSettlementModal = (driverItem) => {
    setSettlingDriver(driverItem);
    setSettlementScope(driverItem.priorUnpaidAmount > 0 ? "all_unpaid" : "period");
    setPayoutPaymentMethod("CASH");
    setPayoutNote("");
  };

  // Execute Settlement Payout
  const handleConfirmSettlement = async () => {
    if (!settlingDriver || !user?.token) return;
    setIsSettling(true);
    try {
      const payload = {
        driverId: settlingDriver.driver._id,
        scope: settlementScope,
        from: activePeriod === "custom" ? customFrom : undefined,
        to: activePeriod === "custom" ? customTo : undefined,
        paymentMethod: payoutPaymentMethod,
        note: payoutNote,
      };

      const res = await deliveryService.settleDriverPayout(payload, user.token);
      if (res?.success) {
        toast.success(res.message || "تم تسجيل سند الصرف بنجاح 💰");
        setSettlingDriver(null);
        await fetchStats();
        if (selectedDriver && String(selectedDriver.driver._id) === String(settlingDriver.driver._id)) {
          fetchPayoutHistory(selectedDriver.driver._id);
        }
      }
    } catch (err) {
      console.error("Failed to settle driver payout:", err);
      toast.error(err.response?.data?.message || "فشل تسجيل سند الصرف");
    } finally {
      setIsSettling(false);
    }
  };

  // Execute Void Payout
  const handleConfirmVoid = async () => {
    if (!voidingPayout || !user?.token) return;
    if (!voidReason.trim()) {
      toast.error("سبب الإلغاء إجباري");
      return;
    }
    setIsVoiding(true);
    try {
      const res = await deliveryService.voidDriverPayout(
        voidingPayout._id,
        voidReason.trim(),
        user.token
      );
      if (res?.success) {
        toast.success(res.message || "تم إلغاء سند الصرف بنجاح");
        setVoidingPayout(null);
        setVoidReason("");
        await fetchStats();
        if (selectedDriver) {
          fetchPayoutHistory(selectedDriver.driver._id);
        }
      }
    } catch (err) {
      console.error("Failed to void payout:", err);
      toast.error(err.response?.data?.message || "فشل إلغاء سند الصرف");
    } finally {
      setIsVoiding(false);
    }
  };

  // Filter drivers by search term
  const filteredDrivers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data.drivers;
    return data.drivers.filter(
      (item) =>
        item.driver?.name?.toLowerCase().includes(term) ||
        item.driver?.username?.toLowerCase().includes(term) ||
        item.driver?.phone?.includes(term)
    );
  }, [data.drivers, searchTerm]);

  // Filter orders for the selected driver
  const filteredOrdersForDriver = useMemo(() => {
    if (!selectedDriver) return [];
    const term = orderSearchTerm.trim().toLowerCase();
    if (!term) return selectedDriver.orders || [];
    return (selectedDriver.orders || []).filter(
      (ord) =>
        String(ord.sequenceNumber).toLowerCase().includes(term) ||
        ord.customerName?.toLowerCase().includes(term) ||
        ord.customerPhone?.includes(term) ||
        ord.address?.toLowerCase().includes(term) ||
        ord.zone?.toLowerCase().includes(term) ||
        (ord.payoutCode && ord.payoutCode.toLowerCase().includes(term))
    );
  }, [selectedDriver, orderSearchTerm]);

  // Export Driver Analytics to Excel
  const exportDriversToExcel = () => {
    const driversRows = data.drivers.map((d) => ({
      "اسم السائق": d.driver.name || d.driver.username,
      "رقم الهاتف": d.driver.phone || "-",
      "الحالة الحالية": d.driver.driverStatus,
      "إجمالي الطلبات المسلمة": d.totalOrders,
      "إجمالي أجور التوصيل (JOD)": (d.totalDeliveryFees || 0).toFixed(2),
      "حصة السائق الكلية (JOD)": (d.totalDriverShare || 0).toFixed(2),
      "حصة المطعم الكلية (JOD)": (d.totalRestaurantShare || 0).toFixed(2),
      "المصروف للسائق (JOD)": (d.paidDriverShare || 0).toFixed(2),
      "المستحق المتبقي (JOD)": (d.unpaidDriverShare || 0).toFixed(2),
      "رصيد سابق معلق (JOD)": (d.priorUnpaidAmount || 0).toFixed(2),
      "حالة التسوية":
        d.settlementState === "SETTLED"
          ? "تم الصرف بالكامل"
          : d.settlementState === "PARTIAL"
          ? "مستحق جزئياً"
          : d.settlementState === "UNPAID"
          ? "بانتظار الصرف"
          : "-",
      "معدل وقت الاستلام (دقيقة)": d.averagePickupMinutes ?? d.medianPickupMinutes ?? 0,
      "معدل وقت التوصيل (دقيقة)": d.averageDeliveryMinutes ?? d.medianDeliveryMinutes ?? 0,
      "معدل وقت العودة للفرع (دقيقة)": d.averageReturnMinutes ?? d.medianReturnMinutes ?? 0,
    }));

    const fleetRows = [
      {
        "المؤشر": "إجمالي عدد السائقين",
        "القيمة": data.fleetSummary.totalDrivers,
      },
      {
        "المؤشر": "إجمالي الطلبات المسلمة بالأسطول",
        "القيمة": data.fleetSummary.totalDeliveredOrders,
      },
      {
        "المؤشر": "إجمالي أجور التوصيل بالأسطول (JOD)",
        "القيمة": (data.fleetSummary.totalDeliveryFees || 0).toFixed(2),
      },
      {
        "المؤشر": "إجمالي حصة السائقين (JOD)",
        "القيمة": (data.fleetSummary.totalDriverShare || 0).toFixed(2),
      },
      {
        "المؤشر": "إجمالي حصة المطعم (JOD)",
        "القيمة": (data.fleetSummary.totalRestaurantShare || 0).toFixed(2),
      },
      {
        "المؤشر": "إجمالي المصروف للسائقين (JOD)",
        "القيمة": (data.fleetSummary.totalPaidDriverShare || 0).toFixed(2),
      },
      {
        "المؤشر": "إجمالي المستحق المتبقي للصرف (JOD)",
        "القيمة": (data.fleetSummary.totalUnpaidDriverShare || 0).toFixed(2),
      },
      {
        "المؤشر": "معدل وقت التوصيل للأسطول (دقيقة)",
        "القيمة": data.fleetSummary.fleetAverageDeliveryMinutes ?? data.fleetSummary.fleetMedianDeliveryMinutes,
      },
      {
        "المؤشر": "معدل وقت الاستلام للأسطول (دقيقة)",
        "القيمة": data.fleetSummary.fleetAveragePickupMinutes ?? data.fleetSummary.fleetMedianPickupMinutes,
      },
      {
        "المؤشر": "معدل وقت العودة للأسطول (دقيقة)",
        "القيمة": data.fleetSummary.fleetAverageReturnMinutes ?? data.fleetSummary.fleetMedianReturnMinutes,
      },
    ];

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.json_to_sheet(fleetRows);
    const wsDrivers = XLSX.utils.json_to_sheet(driversRows);

    XLSX.utils.book_append_sheet(wb, wsSummary, "ملخص الأسطول");
    XLSX.utils.book_append_sheet(wb, wsDrivers, "أداء السائقين");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, `Driver_Statistics_${activePeriod}.xlsx`);
  };

  // Export specific driver's orders to Excel
  const exportSelectedDriverOrders = () => {
    if (!selectedDriver) return;
    const rows = (selectedDriver.orders || []).map((o) => ({
      "رقم الطلب": `#${o.sequenceNumber}`,
      "العميل": o.customerName,
      "الهاتف": o.customerPhone,
      "العنوان": o.address,
      "المنطقة": o.zone,
      "أجرة التوصيل (JOD)": (o.deliveryFee || 0).toFixed(2),
      "نسبة السائق %": `${o.driverSharePercentageSnapshot || 75}%`,
      "حصة السائق (JOD)": (o.driverShareAmount ?? o.driverShare ?? 0).toFixed(2),
      "حصة المطعم (JOD)": (o.ownerShareAmount ?? o.restaurantShare ?? 0).toFixed(2),
      "حالة الصرف": o.payoutStatus === "PAID" ? "تم الصرف ✓" : "مستحق",
      "رقم سند الصرف": o.payoutCode || "-",
      "قيمة الطلب (JOD)": o.totalPrice?.toFixed(2),
      "مدة الاستلام (دقيقة)": o.pickupMinutes ?? "-",
      "مدة التوصيل (دقيقة)": o.deliveryMinutes ?? "-",
      "مدة العودة للفرع (دقيقة)": o.returnMinutes ?? "-",
      "وقت الاستلام": o.shippedAt ? new Date(o.shippedAt).toLocaleString("ar-JO") : "-",
      "وقت التسليم": o.submittedAt ? new Date(o.submittedAt).toLocaleString("ar-JO") : "-",
      "وقت العودة للفرع": o.returnedAt ? new Date(o.returnedAt).toLocaleString("ar-JO") : "-",
    }));

    // صف إجمالي مستحقات السائق في آخر الجدول
    rows.push({
      "رقم الطلب": "الإجمالي",
      "أجرة التوصيل (JOD)": (selectedDriver.totalDeliveryFees || 0).toFixed(2),
      "حصة السائق (JOD)": (selectedDriver.totalDriverShare || 0).toFixed(2),
      "حصة المطعم (JOD)": (selectedDriver.totalRestaurantShare || 0).toFixed(2),
      "حالة الصرف": `مدفوع: ${(selectedDriver.paidDriverShare || 0).toFixed(2)} | متبقي: ${(selectedDriver.unpaidDriverShare || 0).toFixed(2)}`,
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "سجل الرحلات");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(
      file,
      `Driver_${selectedDriver.driver.name || selectedDriver.driver.username}_Orders.xlsx`
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return <Badge className="bg-emerald-600 text-white font-bold text-xs">متاح بالفرع 🟢</Badge>;
      case "assigned":
        return <Badge className="bg-amber-500 text-white font-bold text-xs">معين له طلب 📦</Badge>;
      case "on_delivery":
        return <Badge className="bg-blue-600 text-white font-bold text-xs">قيد التوصيل 🚗</Badge>;
      case "returning":
        return <Badge className="bg-purple-600 text-white font-bold text-xs">عائد للفرع 📍</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSettlementBadge = (state) => {
    switch (state) {
      case "SETTLED":
        return <Badge className="bg-emerald-600 text-white font-bold text-xs">🟢 تم الصرف بالكامل</Badge>;
      case "PARTIAL":
        return <Badge className="bg-amber-500 text-white font-bold text-xs">🟠 مستحق جزئياً</Badge>;
      case "UNPAID":
        return <Badge className="bg-rose-600 text-white font-bold text-xs">🔴 بانتظار الصرف</Badge>;
      default:
        return null;
    }
  };

  if (loading && !data.drivers.length) {
    return (
      <div className="py-20 flex justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Date Filter, Driver Selector, Settlement Filter & Export Row */}
      <div className="flex flex-col gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Period Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-red-600" /> الفلترة الزمنية (إغلاق 4:00 ص):
            </span>
            {[
              { id: "all", label: "جميع الأوقات" },
              { id: "today", label: "اليوم" },
              { id: "yesterday", label: "أمس" },
              { id: "week", label: "هذا الأسبوع" },
              { id: "month", label: "هذا الشهر" },
              { id: "custom", label: "تاريخ مخصص" },
            ].map((f) => (
              <Button
                key={f.id}
                variant={activePeriod === f.id ? "default" : "outline"}
                onClick={() => handlePeriodChange(f.id)}
                className={`rounded-xl px-4 h-9 text-xs font-bold transition-all ${
                  activePeriod === f.id
                    ? "bg-gray-900 text-white shadow"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* Export Button */}
          <Button
            onClick={exportDriversToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 text-xs font-bold flex items-center gap-2 shadow-sm self-start lg:self-auto"
          >
            <Download className="w-4 h-4" />
            تصدير تقرير السائقين (Excel)
          </Button>
        </div>

        {/* Custom Range Date Pickers (if custom active) */}
        {activePeriod === "custom" && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-600">من تاريخ:</span>
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-40 h-9 rounded-xl text-xs bg-gray-50 border-gray-200"
            />
            <span className="text-xs font-bold text-gray-600">إلى تاريخ:</span>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-40 h-9 rounded-xl text-xs bg-gray-50 border-gray-200"
            />
          </div>
        )}

        {/* Secondary Filter Row: Driver Dropdown & Settlement Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100 text-xs">
          {/* Driver Select */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-500 flex items-center gap-1">
              <Bike className="w-3.5 h-3.5 text-red-600" /> اختيار السائق:
            </span>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="h-9 px-3 rounded-xl border border-gray-200 bg-white font-medium text-xs text-gray-800 outline-none focus:border-red-500"
            >
              <option value="all">جميع السائقين ({data.drivers.length})</option>
              {data.drivers.map((d) => (
                <option key={d.driver._id} value={d.driver._id}>
                  {d.driver.name || d.driver.username}
                </option>
              ))}
            </select>
          </div>

          {/* Settlement Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-500 flex items-center gap-1 ml-1">
              <Filter className="w-3.5 h-3.5 text-amber-600" /> حالة الصرف:
            </span>
            {[
              { id: "all", label: "الكل" },
              { id: "unpaid", label: "مستحق للصرف" },
              { id: "settled", label: "تم التسوية" },
            ].map((st) => (
              <Button
                key={st.id}
                size="sm"
                variant={settlementFilter === st.id ? "default" : "outline"}
                onClick={() => setSettlementFilter(st.id)}
                className={`rounded-xl px-3 h-8 text-[11px] font-bold ${
                  settlementFilter === st.id
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-gray-600"
                }`}
              >
                {st.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Drivers */}
        <Card className="rounded-2xl border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400">إجمالي السائقين</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {data.fleetSummary.totalDrivers}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Bike className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Total Delivered */}
        <Card className="rounded-2xl border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400">طلبات تم تسليمها</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                {data.fleetSummary.totalDeliveredOrders}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Average Delivery */}
        <Card className="rounded-2xl border-blue-200 bg-gradient-to-br from-blue-50/50 to-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-700">معدل وقت التوصيل</p>
              <h3 className="text-2xl font-black text-blue-900 mt-1 font-mono">
                {data.fleetSummary.fleetAverageDeliveryMinutes ?? data.fleetSummary.fleetMedianDeliveryMinutes ?? 0} <span className="text-xs font-sans">د</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Timer className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Average Pickup */}
        <Card className="rounded-2xl border-amber-200 bg-gradient-to-br from-amber-50/50 to-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-700">معدل وقت الاستلام</p>
              <h3 className="text-2xl font-black text-amber-900 mt-1 font-mono">
                {data.fleetSummary.fleetAveragePickupMinutes ?? data.fleetSummary.fleetMedianPickupMinutes ?? 0} <span className="text-xs font-sans">د</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Average Return */}
        <Card className="rounded-2xl border-purple-200 bg-gradient-to-br from-purple-50/50 to-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-purple-700">معدل العودة للفرع</p>
              <h3 className="text-2xl font-black text-purple-900 mt-1 font-mono">
                {data.fleetSummary.fleetAverageReturnMinutes ?? data.fleetSummary.fleetMedianReturnMinutes ?? 0} <span className="text-xs font-sans">د</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Financial Earnings & Settlement Card */}
        <Card className="rounded-2xl border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white shadow-sm p-4 col-span-2 sm:col-span-3 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-emerald-800">حصة السائقين</p>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-emerald-900 mt-0.5 font-mono">
              {(data.fleetSummary.totalDriverShare || 0).toFixed(2)} <span className="text-[10px] font-sans">JOD</span>
            </h3>
            <div className="mt-1.5 pt-1.5 border-t border-emerald-100 text-[10px] space-y-0.5">
              <p className="text-emerald-700 font-bold">
                مدفوع: <span className="font-mono font-black">{(data.fleetSummary.totalPaidDriverShare || 0).toFixed(2)} JOD</span>
              </p>
              <p className="text-rose-700 font-bold">
                متبقي للصرف: <span className="font-mono font-black">{(data.fleetSummary.totalUnpaidDriverShare || 0).toFixed(2)} JOD</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Driver List Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Bike className="w-6 h-6 text-red-600" />
            قائمة السائقين ومؤشرات الأداء الفردية
            <Badge className="bg-red-600 text-white mr-2">
              {filteredDrivers.length}
            </Badge>
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="بحث بالاسم أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rounded-xl bg-white border-gray-200 text-xs font-medium"
            />
          </div>
        </div>

        {/* Drivers Cards Grid */}
        {filteredDrivers.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center">
            <Bike className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-gray-700">لا يوجد سائقين مطابقين</h3>
            <p className="text-xs text-gray-400 mt-1">تأكد من شروط البحث أو الفلترة</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDrivers.map((item) => {
              const { driver, totalOrders } = item;
              const deliveryMinutes = item.averageDeliveryMinutes ?? item.medianDeliveryMinutes ?? 0;
              const pickupMinutes = item.averagePickupMinutes ?? item.medianPickupMinutes ?? 0;
              const returnMinutes = item.averageReturnMinutes ?? item.medianReturnMinutes ?? 0;

              return (
                <Card
                  key={driver._id}
                  onClick={() => {
                    setSelectedDriver(item);
                    setModalActiveTab("trips");
                  }}
                  className="rounded-3xl border border-gray-200 bg-white hover:border-red-300 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group"
                >
                  <CardHeader className="bg-gradient-to-r from-gray-50 via-white to-white p-5 border-b border-gray-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-black text-base shadow-sm group-hover:scale-105 transition-transform">
                        <Bike className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-gray-900 group-hover:text-red-700 transition-colors">
                          {driver.name || driver.username}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono mt-0.5" dir="ltr">
                          {driver.phone || "بدون هاتف"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {getStatusBadge(driver.driverStatus)}
                      {getSettlementBadge(item.settlementState)}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    {/* Prior Unpaid Warning Badge (if balances from prior days exist) */}
                    {item.priorUnpaidAmount > 0 && (
                      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-2.5 flex items-center justify-between text-xs text-amber-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          رصيد سابق غير مدفوع:
                        </span>
                        <span className="font-mono font-black text-sm text-amber-950">
                          {item.priorUnpaidAmount.toFixed(2)} JOD
                        </span>
                      </div>
                    )}

                    {/* KPI Averages Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {/* Delivery Average */}
                      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-2.5">
                        <span className="text-[10px] font-bold text-blue-700 block">
                          معدل التوصيل
                        </span>
                        <span className="text-lg font-black text-blue-900 font-mono mt-0.5 block">
                          {deliveryMinutes > 0 ? deliveryMinutes : "-"}
                          {deliveryMinutes > 0 && <span className="text-[10px] font-sans"> د</span>}
                        </span>
                      </div>

                      {/* Pickup Average */}
                      <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-2.5">
                        <span className="text-[10px] font-bold text-amber-700 block">
                          معدل الاستلام
                        </span>
                        <span className="text-lg font-black text-amber-900 font-mono mt-0.5 block">
                          {pickupMinutes > 0 ? pickupMinutes : "-"}
                          {pickupMinutes > 0 && <span className="text-[10px] font-sans"> د</span>}
                        </span>
                      </div>

                      {/* Return Average */}
                      <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-2.5">
                        <span className="text-[10px] font-bold text-purple-700 block">
                          معدل العودة
                        </span>
                        <span className="text-lg font-black text-purple-900 font-mono mt-0.5 block">
                          {returnMinutes > 0 ? returnMinutes : "-"}
                          {returnMinutes > 0 && <span className="text-[10px] font-sans"> د</span>}
                        </span>
                      </div>
                    </div>

                    {/* Total Delivered Orders Banner */}
                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        الطلبات المسلمة:
                      </span>
                      <span className="text-sm font-black text-gray-900 font-mono">
                        {totalOrders} طلب
                      </span>
                    </div>

                    {/* Driver Delivery Fees Due & Unpaid Now */}
                    <div className="space-y-2">
                      <div className="bg-emerald-50/80 rounded-2xl p-3 border border-emerald-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-emerald-900 font-bold block">المستحق للصرف الآن:</span>
                          <span className="text-[10px] text-emerald-600">
                            {item.unpaidOrderCount} طلب معلق
                          </span>
                        </div>
                        <span className="text-base font-black text-emerald-900 font-mono">
                          {(item.unpaidDriverShare || 0).toFixed(2)} JOD
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEarningsFor((prev) => ({
                            ...prev,
                            [String(item.driver._id)]: !prev[String(item.driver._id)],
                          }));
                        }}
                        className="w-full bg-gray-50 rounded-2xl p-2.5 border border-gray-200 flex items-center justify-between text-xs hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-700 font-bold">💰 تفاصيل العمولات والمخطط اليومي</span>
                        <span className="text-[10px] text-gray-500 font-bold">
                          {showEarningsFor[String(item.driver._id)] ? "▲ إخفاء" : "▼ عرض"}
                        </span>
                      </button>

                      {showEarningsFor[String(item.driver._id)] && (
                        <div className="bg-emerald-50/40 rounded-2xl border border-emerald-100 p-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-bold">إجمالي أجرة التوصيل:</span>
                            <span className="font-mono font-black text-gray-900">{(item.totalDeliveryFees || 0).toFixed(2)} JOD</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-700 font-bold">حصة السائق الكلية:</span>
                            <span className="font-mono font-black text-emerald-800">{(item.totalDriverShare || 0).toFixed(2)} JOD</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-700 font-bold">حصة المطعم:</span>
                            <span className="font-mono font-black text-blue-800">{(item.totalRestaurantShare || 0).toFixed(2)} JOD</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-emerald-100 pt-1.5">
                            <span className="text-emerald-800 font-bold">تم صرفه للسائق:</span>
                            <span className="font-mono font-black text-emerald-900">{(item.paidDriverShare || 0).toFixed(2)} JOD</span>
                          </div>

                          {/* Daily breakdown */}
                          {item.dailyEarnings && item.dailyEarnings.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-[10px] font-black text-gray-500 border-t border-emerald-100 pt-2">التفصيل اليومي:</p>
                              {item.dailyEarnings.map((day) => (
                                <div key={day.date} className="bg-white rounded-xl p-2 border border-emerald-100 space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="font-mono text-[10px] text-gray-500">{day.date}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-bold text-gray-500">{day.orderCount} طلب</span>
                                      {day.daySettlementState === "SETTLED" ? (
                                        <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1.5">تم الصرف ✓</Badge>
                                      ) : day.daySettlementState === "PARTIAL" ? (
                                        <Badge className="bg-amber-500 text-white text-[9px] py-0 px-1.5">جزئي</Badge>
                                      ) : day.daySettlementState === "UNPAID" ? (
                                        <Badge className="bg-rose-600 text-white text-[9px] py-0 px-1.5">مستحق</Badge>
                                      ) : null}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-emerald-700">حصة السائق:</span>
                                    <span className="font-mono font-black text-emerald-800">{(day.driverShare || 0).toFixed(2)} JOD</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions: Settle Dues & View Details */}
                    <div className="flex items-center gap-2 pt-1">
                      {item.unpaidDriverShare > 0 || item.priorUnpaidAmount > 0 ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openSettlementModal(item);
                          }}
                          className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 shadow-sm"
                        >
                          صرف المستحق ({((item.unpaidDriverShare || 0) + (item.priorUnpaidAmount || 0)).toFixed(2)} JOD)
                        </Button>
                      ) : item.totalOrders > 0 ? (
                        <div className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl py-2 px-3 text-center text-xs font-bold flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          تم التسوية ✓
                          {item.lastPaidAt && (
                            <span className="text-[10px] text-emerald-500 font-mono">
                              ({new Date(item.lastPaidAt).toLocaleDateString("ar-JO")})
                            </span>
                          )}
                        </div>
                      ) : null}

                      <Button
                        variant="outline"
                        className="rounded-2xl border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-xs py-2.5 flex items-center justify-center gap-1"
                      >
                        <span>تفاصيل الرحلات</span>
                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Driver Deep-Dive Dialog Modal (with Trips & Payout History Tabs) */}
      <Dialog
        open={!!selectedDriver}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDriver(null);
            setOrderSearchTerm("");
            setShowModalEarnings(false);
            setModalActiveTab("trips");
          }
        }}
      >
        <DialogContent
          className="w-[96vw] max-w-6xl xl:max-w-7xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xl bg-white"
          dir="rtl"
        >
          {selectedDriver && (
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-100 pl-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-lg shadow-red-200 shrink-0">
                    <Bike className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                      {selectedDriver.driver.name || selectedDriver.driver.username}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1.5">
                      <a
                        href={`tel:${selectedDriver.driver.phone}`}
                        className="font-mono bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg font-bold transition-colors"
                        dir="ltr"
                      >
                        📞 {selectedDriver.driver.phone || "بدون هاتف"}
                      </a>
                      <span>•</span>
                      {getStatusBadge(selectedDriver.driver.driverStatus)}
                      <span>•</span>
                      {getSettlementBadge(selectedDriver.settlementState)}
                      {selectedDriver.priorUnpaidAmount > 0 && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg font-bold text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          رصيد سابق معلق: {selectedDriver.priorUnpaidAmount.toFixed(2)} JOD
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {(selectedDriver.unpaidDriverShare > 0 || selectedDriver.priorUnpaidAmount > 0) && (
                    <Button
                      onClick={() => openSettlementModal(selectedDriver)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-10 px-4 shadow-sm flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      صرف المستحق ({((selectedDriver.unpaidDriverShare || 0) + (selectedDriver.priorUnpaidAmount || 0)).toFixed(2)} JOD)
                    </Button>
                  )}
                  <Button
                    onClick={exportSelectedDriverOrders}
                    size="sm"
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold h-10 px-4 flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    تصدير سجل السائق (Excel)
                  </Button>
                </div>
              </div>

              {/* KPI Summary Strip for this driver */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-1">
                    <Package className="w-4 h-4 text-gray-400" />
                    <p className="text-[11px] font-bold">الطلبات المسلمة</p>
                  </div>
                  <p className="text-2xl font-black text-gray-900 font-mono">
                    {selectedDriver.totalOrders}
                  </p>
                </div>

                <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-blue-700 mb-1">
                    <Timer className="w-4 h-4 text-blue-500" />
                    <p className="text-[11px] font-bold">معدل وقت التوصيل</p>
                  </div>
                  <p className="text-2xl font-black text-blue-900 font-mono">
                    {(selectedDriver.averageDeliveryMinutes ?? selectedDriver.medianDeliveryMinutes) > 0 ? (
                      <>
                        {selectedDriver.averageDeliveryMinutes ?? selectedDriver.medianDeliveryMinutes}
                        <span className="text-xs font-sans mr-1">دقيقة</span>
                      </>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>

                <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-amber-700 mb-1">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <p className="text-[11px] font-bold">معدل وقت الاستلام</p>
                  </div>
                  <p className="text-2xl font-black text-amber-900 font-mono">
                    {(selectedDriver.averagePickupMinutes ?? selectedDriver.medianPickupMinutes) > 0 ? (
                      <>
                        {selectedDriver.averagePickupMinutes ?? selectedDriver.medianPickupMinutes}
                        <span className="text-xs font-sans mr-1">دقيقة</span>
                      </>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>

                <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-purple-700 mb-1">
                    <Navigation className="w-4 h-4 text-purple-500" />
                    <p className="text-[11px] font-bold">معدل العودة للفرع</p>
                  </div>
                  <p className="text-2xl font-black text-purple-900 font-mono">
                    {(selectedDriver.averageReturnMinutes ?? selectedDriver.medianReturnMinutes) > 0 ? (
                      <>
                        {selectedDriver.averageReturnMinutes ?? selectedDriver.medianReturnMinutes}
                        <span className="text-xs font-sans mr-1">دقيقة</span>
                      </>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>

                <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 text-center col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800 mb-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <p className="text-[11px] font-bold">المستحق للصرف الآن</p>
                  </div>
                  <p className="text-2xl font-black text-emerald-900 font-mono">
                    {(selectedDriver.unpaidDriverShare || 0).toFixed(2)}
                    <span className="text-xs font-sans mr-1">JOD</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    {selectedDriver.unpaidOrderCount || 0} طلب معلق
                  </p>
                </div>
              </div>

              {/* Tabs Segmented Switcher */}
              <div className="flex items-center gap-3 bg-gray-100/90 p-1.5 rounded-2xl border border-gray-200/80">
                <button
                  onClick={() => setModalActiveTab("trips")}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    modalActiveTab === "trips"
                      ? "bg-white text-red-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  تفاصيل الرحلات والعمولات ({filteredOrdersForDriver.length})
                </button>
                <button
                  onClick={() => {
                    setModalActiveTab("payouts");
                    fetchPayoutHistory(selectedDriver.driver._id);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    modalActiveTab === "payouts"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  سجل سندات الصرف والتسويات ({payoutsList.length})
                </button>
              </div>

              {/* Tab 1: Orders and Trips Deep Dive */}
              {modalActiveTab === "trips" && (
                <div className="space-y-4">
                  {/* Search Bar for Orders */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-red-600" />
                      سجل الطلبات والرحلات المسلمة
                    </h3>

                    <div className="relative w-full sm:w-72">
                      <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="بحث برقم الطلب أو العميل أو السند..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="pr-10 rounded-xl bg-gray-50 border-gray-200 text-xs font-medium"
                      />
                    </div>
                  </div>

                  {filteredOrdersForDriver.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
                      <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      لا توجد رحلات أو طلبات مسجلة لهذا السائق في الفترة المحددة
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {filteredOrdersForDriver.map((ord) => (
                        <div
                          key={ord._id}
                          className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                        >
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black text-red-700 tracking-tight">
                                #{ord.sequenceNumber}
                              </span>
                              <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                                تم التسليم ✅
                              </Badge>
                              {ord.payoutStatus === "PAID" ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                                  تم الصرف ✓ {ord.payoutCode ? `(${ord.payoutCode})` : ""}
                                </Badge>
                              ) : (
                                <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-bold text-[10px]">
                                  مستحق للصرف
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-2.5 py-1 text-[11px] font-black">
                                <MapPin className="w-3 h-3" />
                                {ord.zone}
                                <span className="text-emerald-300">|</span>
                                <span className="font-mono">{(ord.deliveryFee || 0).toFixed(2)} JOD</span>
                              </span>

                              <span className="text-xs font-mono font-black text-gray-900">
                                {ord.totalPrice?.toFixed(2)} JOD
                              </span>
                            </div>
                          </div>

                          {/* Driver/Restaurant Share Breakdown */}
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
                              <span className="text-emerald-800 font-bold">
                                حصة السائق ({ord.driverSharePercentageSnapshot || 75}%):
                              </span>
                              <span className="font-mono font-black text-emerald-900 text-xs">
                                {(ord.driverShareAmount ?? ord.driverShare ?? 0).toFixed(2)} JOD
                              </span>
                            </div>
                            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between">
                              <span className="text-blue-800 font-bold">حصة المطعم:</span>
                              <span className="font-mono font-black text-blue-900 text-xs">
                                {(ord.ownerShareAmount ?? ord.restaurantShare ?? 0).toFixed(2)} JOD
                              </span>
                            </div>
                          </div>

                          {/* Durations Metric Row */}
                          <div className="grid grid-cols-3 gap-2 text-xs text-center">
                            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2">
                              <span className="text-[10px] text-amber-800 font-bold block mb-0.5">
                                الاستلام
                              </span>
                              <span className="font-mono font-black text-amber-900 text-xs">
                                {ord.pickupMinutes !== null ? `${ord.pickupMinutes} د` : "-"}
                              </span>
                            </div>

                            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2">
                              <span className="text-[10px] text-blue-800 font-bold block mb-0.5">
                                التوصيل
                              </span>
                              <span className="font-mono font-black text-blue-900 text-xs">
                                {ord.deliveryMinutes !== null ? `${ord.deliveryMinutes} د` : "-"}
                              </span>
                            </div>

                            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-2">
                              <span className="text-[10px] text-purple-800 font-bold block mb-0.5">
                                العودة
                              </span>
                              <span className="font-mono font-black text-purple-900 text-xs">
                                {ord.returnMinutes !== null ? `${ord.returnMinutes} د` : "-"}
                              </span>
                            </div>
                          </div>

                          {/* Customer & Address Details */}
                          <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100 space-y-2 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="font-black text-gray-900 flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-red-600" />
                                  {ord.customerName}
                                </span>
                                <a
                                  href={`tel:${ord.customerPhone}`}
                                  className="font-mono text-gray-700 bg-white px-2 py-0.5 rounded-lg border border-gray-200 hover:text-red-700 font-bold transition-colors"
                                  dir="ltr"
                                >
                                  📞 {ord.customerPhone}
                                </a>
                              </div>

                              <div className="text-[11px] text-gray-400 font-mono">
                                {ord.submittedAt
                                  ? new Date(ord.submittedAt).toLocaleTimeString("ar-JO", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </div>
                            </div>

                            <div className="flex items-start gap-2 pt-2 border-t border-gray-200/60 text-xs">
                              <div className="p-1 rounded-lg bg-red-100 text-red-600 flex-shrink-0 mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 flex flex-wrap items-baseline gap-1.5">
                                <span className="font-bold text-gray-500 text-[11px]">عنوان العميل:</span>
                                <span className="font-black text-gray-900 bg-white px-2.5 py-1 rounded-xl border border-gray-200 text-xs">
                                  {ord.address || "لا توجد تفاصيل للعنوان"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Payout Receipts & History */}
              {modalActiveTab === "payouts" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-emerald-600" />
                        سجل سندات الصرف والتسويات المالية
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        توثيق السندات المدفوعة والمبالغ المصروفة للسائق مع أرقام الحوالات وتفاصيل الدفع
                      </p>
                    </div>
                    <Button
                      onClick={() => fetchPayoutHistory(selectedDriver.driver._id)}
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-xs font-bold border-gray-200 h-9"
                    >
                      تحديث السجل
                    </Button>
                  </div>

                  {loadingPayouts ? (
                    <div className="p-12 text-center"><Loading /></div>
                  ) : payoutsList.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
                      <Receipt className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      لم يتم تسجيل أي سندات صرف لهذا السائق حتى الآن
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-xs bg-white">
                      <table className="w-full text-xs text-right border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                            <th className="py-3 px-4">رقم السند</th>
                            <th className="py-3 px-4">التاريخ والوقت</th>
                            <th className="py-3 px-4 text-center">الطلبات</th>
                            <th className="py-3 px-4">المبلغ الصافي</th>
                            <th className="py-3 px-4">طريقة الدفع</th>
                            <th className="py-3 px-4">المسؤول</th>
                            <th className="py-3 px-4">الحالة</th>
                            {isAdmin && <th className="py-3 px-4 text-center">إجراءات</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {payoutsList.map((p) => {
                            const isVoided = p.status === "VOIDED";
                            return (
                              <tr key={p._id} className={isVoided ? "bg-rose-50/40" : "hover:bg-gray-50/80 transition-colors"}>
                                <td className="py-3.5 px-4 font-mono font-black text-gray-900 whitespace-nowrap">
                                  <span className="bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 text-xs">
                                    {p.payoutCode}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-gray-600 whitespace-nowrap">
                                  {new Date(p.paidAt || p.createdAt).toLocaleString("ar-JO", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                                    {p.orderCount} طلب
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-mono font-black text-emerald-800 text-sm whitespace-nowrap">
                                  {(p.totalAmount || 0).toFixed(2)} JOD
                                </td>
                                <td className="py-3.5 px-4 font-bold text-gray-700 whitespace-nowrap">
                                  {p.paymentMethod === "CLIQ" ? (
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg text-[11px]">
                                      📱 كليك (CLIQ)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px]">
                                      💵 نقداً (CASH)
                                    </span>
                                  )}
                                  {p.note ? (
                                    <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{p.note}</span>
                                  ) : null}
                                </td>
                                <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                                  {p.paidBy?.name || p.paidBy?.username || "مدير النظام"}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  {isVoided ? (
                                    <div className="space-y-0.5">
                                      <Badge className="bg-rose-600 text-white text-[10px]">ملغي</Badge>
                                      {p.voidReason && (
                                        <p className="text-[10px] text-rose-700 max-w-[150px] truncate" title={p.voidReason}>
                                          {p.voidReason}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <Badge className="bg-emerald-600 text-white text-[10px]">مكتمل ✓</Badge>
                                  )}
                                </td>
                                {isAdmin && (
                                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                    {!isVoided && (
                                      <Button
                                        onClick={() => {
                                          setVoidingPayout(p);
                                          setVoidReason("");
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] h-7 px-2.5 font-bold"
                                      >
                                        إلغاء التسوية
                                      </Button>
                                    )}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settlement Confirmation Modal Dialog */}
      <Dialog
        open={!!settlingDriver}
        onOpenChange={(open) => {
          if (!open) setSettlingDriver(null);
        }}
      >
        <DialogContent className="max-w-md rounded-3xl p-6" dir="rtl">
          {settlingDriver && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  تسجيل سند صرف مستحقات السائق
                </DialogTitle>
              </DialogHeader>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-600">اسم السائق:</span>
                  <span className="font-black text-gray-900">
                    {settlingDriver.driver.name || settlingDriver.driver.username}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-600">الهاتف:</span>
                  <span className="font-mono text-gray-700" dir="ltr">
                    {settlingDriver.driver.phone || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-emerald-200 pt-2">
                  <span className="font-bold text-emerald-900">المبلغ الإجمالي للصرف:</span>
                  <span className="font-mono font-black text-xl text-emerald-900">
                    {(settlementScope === "all_unpaid"
                      ? (settlingDriver.unpaidDriverShare || 0) + (settlingDriver.priorUnpaidAmount || 0)
                      : settlingDriver.unpaidDriverShare || 0
                    ).toFixed(2)}{" "}
                    JOD
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-emerald-700">
                  <span>عدد الطلبات المشمولة:</span>
                  <span className="font-bold font-mono">
                    {settlementScope === "all_unpaid"
                      ? (settlingDriver.unpaidOrderCount || 0) + (settlingDriver.priorUnpaidOrderCount || 0)
                      : settlingDriver.unpaidOrderCount || 0}{" "}
                    طلب
                  </span>
                </div>
              </div>

              {/* Scope Selection (if priorUnpaidAmount exists) */}
              {settlingDriver.priorUnpaidAmount > 0 && (
                <div className="space-y-2 bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    يوجد رصيد سابق غير مدفوع ({settlingDriver.priorUnpaidAmount.toFixed(2)} JOD):
                  </span>
                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                      <input
                        type="radio"
                        name="settlementScope"
                        checked={settlementScope === "all_unpaid"}
                        onChange={() => setSettlementScope("all_unpaid")}
                        className="accent-emerald-600"
                      />
                      صرف جميع المستحقات المعلقة بما فيها الأيام السابقة (الموصى به)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                      <input
                        type="radio"
                        name="settlementScope"
                        checked={settlementScope === "period"}
                        onChange={() => setSettlementScope("period")}
                        className="accent-emerald-600"
                      />
                      صرف فترة الفلترة الحالية فقط ({(settlingDriver.unpaidDriverShare || 0).toFixed(2)} JOD)
                    </label>
                  </div>
                </div>
              )}

              {/* Payment Method Radio */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-gray-700">طريقة الدفع:</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutPaymentMethod("CASH")}
                    className={`p-3 rounded-2xl border font-bold text-center transition-all ${
                      payoutPaymentMethod === "CASH"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    💵 نقداً (CASH)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutPaymentMethod("CLIQ")}
                    className={`p-3 rounded-2xl border font-bold text-center transition-all ${
                      payoutPaymentMethod === "CLIQ"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    📱 كليك (CLIQ)
                  </button>
                </div>
              </div>

              {/* Optional Note */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-gray-700">ملاحظة أو رقم الحوالة (اختياري):</span>
                <Input
                  type="text"
                  placeholder="مثال: تم التحويل عبر كليك إلى حساب..."
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  className="rounded-xl text-xs bg-gray-50 border-gray-200"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleConfirmSettlement}
                  disabled={isSettling}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-11"
                >
                  {isSettling ? "جاري تسجيل السند..." : "تأكيد تسجيل سند الصرف ✓"}
                </Button>
                <Button
                  onClick={() => setSettlingDriver(null)}
                  variant="outline"
                  disabled={isSettling}
                  className="rounded-2xl h-11 px-5 border-gray-200"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Void Confirmation Modal Dialog (Admin Only) */}
      <Dialog
        open={!!voidingPayout}
        onOpenChange={(open) => {
          if (!open) {
            setVoidingPayout(null);
            setVoidReason("");
          }
        }}
      >
        <DialogContent className="max-w-md rounded-3xl p-6" dir="rtl">
          {voidingPayout && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-rose-700 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-rose-600" />
                  إلغاء سند الصرف #{voidingPayout.payoutCode}
                </DialogTitle>
              </DialogHeader>

              <p className="text-xs text-gray-600">
                عند إلغاء السند، سيتم إرجاع جميع الطلبات المرتبطة به ({voidingPayout.orderCount} طلب) إلى حالة
                غير مدفوعة ومستحقة للصرف مرة أخرى.
              </p>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-gray-700">سبب الإلغاء (إجباري):</label>
                <Input
                  type="text"
                  placeholder="أدخل سبب إلغاء سند الصرف..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="rounded-xl text-xs bg-gray-50 border-gray-200"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Button
                  onClick={handleConfirmVoid}
                  disabled={isVoiding || !voidReason.trim()}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl h-10"
                >
                  {isVoiding ? "جاري الإلغاء..." : "تأكيد إلغاء السند"}
                </Button>
                <Button
                  onClick={() => {
                    setVoidingPayout(null);
                    setVoidReason("");
                  }}
                  variant="outline"
                  disabled={isVoiding}
                  className="rounded-2xl h-10 px-5 border-gray-200"
                >
                  تراجع
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
