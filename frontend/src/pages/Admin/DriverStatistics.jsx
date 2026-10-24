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
  TrendingUp,
  Download,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  ShieldCheck,
  Timer,
  Navigation,
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

export default function DriverStatistics({ dateFilter, setDateFilter }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    drivers: [],
    fleetSummary: {
      totalDrivers: 0,
      totalDeliveredOrders: 0,
      fleetMedianDeliveryMinutes: 0,
      fleetMedianPickupMinutes: 0,
      fleetMedianReturnMinutes: 0,
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");

  const fetchStats = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await deliveryService.getDriverAnalytics(user.token, dateFilter);
      if (res?.success) {
        setData(res);
        // If a driver was already selected, update their data
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
  }, [dateFilter, user?.token]);

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
        ord.address?.toLowerCase().includes(term)
    );
  }, [selectedDriver, orderSearchTerm]);

  // Export Driver Analytics to Excel
  const exportDriversToExcel = () => {
    const driversRows = data.drivers.map((d) => ({
      "اسم السائق": d.driver.name || d.driver.username,
      "رقم الهاتف": d.driver.phone || "-",
      "الحالة الحالية": d.driver.driverStatus,
      "إجمالي الطلبات المسلمة": d.totalOrders,
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
    saveAs(file, `Driver_Statistics_${dateFilter}.xlsx`);
  };

  // Export specific driver's orders to Excel
  const exportSelectedDriverOrders = () => {
    if (!selectedDriver) return;
    const rows = (selectedDriver.orders || []).map((o) => ({
      "رقم الطلب": `#${o.sequenceNumber}`,
      "العميل": o.customerName,
      "الهاتف": o.customerPhone,
      "العنوان": o.address,
      "قيمة الطلب (JOD)": o.totalPrice?.toFixed(2),
      "مدة الاستلام (دقيقة)": o.pickupMinutes ?? "-",
      "مدة التوصيل (دقيقة)": o.deliveryMinutes ?? "-",
      "مدة العودة للفرع (دقيقة)": o.returnMinutes ?? "-",
      "وقت الاستلام": o.shippedAt ? new Date(o.shippedAt).toLocaleString("ar-JO") : "-",
      "وقت التسليم": o.submittedAt ? new Date(o.submittedAt).toLocaleString("ar-JO") : "-",
      "وقت العودة للفرع": o.returnedAt ? new Date(o.returnedAt).toLocaleString("ar-JO") : "-",
    }));

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

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Date Filter & Export Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-red-600" /> الفلترة الزمنية:
          </span>
          {[
            { id: "all", label: "جميع الأوقات" },
            { id: "today", label: "اليوم" },
            { id: "week", label: "هذا الأسبوع" },
            { id: "month", label: "هذا الشهر" },
          ].map((f) => (
            <Button
              key={f.id}
              variant={dateFilter === f.id ? "default" : "outline"}
              onClick={() => setDateFilter(f.id)}
              className={`rounded-xl px-4 h-9 text-xs font-bold transition-all ${
                dateFilter === f.id
                  ? "bg-gray-900 text-white shadow"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <Button
          onClick={exportDriversToExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          تصدير تقرير السائقين (Excel)
        </Button>
      </div>

      {/* Fleet KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
                  onClick={() => setSelectedDriver(item)}
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

                    <div>{getStatusBadge(driver.driverStatus)}</div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
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

                    {/* View Details Action */}
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl border-red-200 text-red-700 hover:bg-red-600 hover:text-white font-bold text-xs py-2.5 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>عرض تفاصيل الرحلات والطلبات</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Driver Deep-Dive Orders Dialog Modal */}
      <Dialog
        open={!!selectedDriver}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDriver(null);
            setOrderSearchTerm("");
          }
        }}
      >
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6"
          dir="rtl"
        >
          {selectedDriver && (
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-lg shadow-red-200">
                    <Bike className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {selectedDriver.driver.name || selectedDriver.driver.username}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="font-mono" dir="ltr">{selectedDriver.driver.phone || "-"}</span>
                      <span>•</span>
                      {getStatusBadge(selectedDriver.driver.driverStatus)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={exportSelectedDriverOrders}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    تصدير سجل السائق (Excel)
                  </Button>
                </div>
              </div>

              {/* KPI Summary Strip for this driver */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 text-center">
                  <p className="text-[11px] font-bold text-gray-400">إجمالي الطلبات المسلمة</p>
                  <p className="text-xl font-black text-gray-900 mt-0.5 font-mono">
                    {selectedDriver.totalOrders}
                  </p>
                </div>

                <div className="bg-blue-50/70 rounded-2xl p-3 border border-blue-100 text-center">
                  <p className="text-[11px] font-bold text-blue-700">معدل وقت التوصيل</p>
                  <p className="text-xl font-black text-blue-900 mt-0.5 font-mono">
                    {(selectedDriver.averageDeliveryMinutes ?? selectedDriver.medianDeliveryMinutes) > 0 ? `${selectedDriver.averageDeliveryMinutes ?? selectedDriver.medianDeliveryMinutes} دقيقة` : "-"}
                  </p>
                </div>

                <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-100 text-center">
                  <p className="text-[11px] font-bold text-amber-700">معدل وقت الاستلام</p>
                  <p className="text-xl font-black text-amber-900 mt-0.5 font-mono">
                    {(selectedDriver.averagePickupMinutes ?? selectedDriver.medianPickupMinutes) > 0 ? `${selectedDriver.averagePickupMinutes ?? selectedDriver.medianPickupMinutes} دقيقة` : "-"}
                  </p>
                </div>

                <div className="bg-purple-50/70 rounded-2xl p-3 border border-purple-100 text-center">
                  <p className="text-[11px] font-bold text-purple-700">معدل العودة للفرع</p>
                  <p className="text-xl font-black text-purple-900 mt-0.5 font-mono">
                    {(selectedDriver.averageReturnMinutes ?? selectedDriver.medianReturnMinutes) > 0 ? `${selectedDriver.averageReturnMinutes ?? selectedDriver.medianReturnMinutes} دقيقة` : "-"}
                  </p>
                </div>
              </div>

              {/* Orders List & Search */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-red-600" />
                    سجل الطلبات والرحلات المسلمة ({filteredOrdersForDriver.length})
                  </h3>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="بحث برقم الطلب أو العميل..."
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                      className="pr-10 rounded-xl bg-gray-50 border-gray-200 text-xs font-medium"
                    />
                  </div>
                </div>

                {filteredOrdersForDriver.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 text-xs">
                    لا توجد رحلات أو طلبات مسجلة لهذا السائق في الفترة المحددة
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrdersForDriver.map((ord) => (
                      <div
                        key={ord._id}
                        className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-red-700 tracking-tight">
                              #{ord.sequenceNumber}
                            </span>
                            <Badge className="bg-emerald-600 text-white font-bold text-[11px]">
                              تم التسليم بنجاح ✅
                            </Badge>
                          </div>

                          <span className="text-xs font-mono font-black text-gray-900">
                            {ord.totalPrice?.toFixed(2)} JOD
                          </span>
                        </div>

                        {/* Durations Metric Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          {/* Pickup duration */}
                          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between">
                            <span className="text-amber-800 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> مدة الاستلام:
                            </span>
                            <span className="font-mono font-black text-amber-900 text-sm">
                              {ord.pickupMinutes !== null ? `${ord.pickupMinutes} د` : "-"}
                            </span>
                          </div>

                          {/* Delivery duration */}
                          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between">
                            <span className="text-blue-800 font-bold flex items-center gap-1">
                              <Timer className="w-3.5 h-3.5 text-blue-600" /> مدة التوصيل:
                            </span>
                            <span className="font-mono font-black text-blue-900 text-sm">
                              {ord.deliveryMinutes !== null ? `${ord.deliveryMinutes} د` : "-"}
                            </span>
                          </div>

                          {/* Return duration */}
                          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-2.5 flex items-center justify-between">
                            <span className="text-purple-800 font-bold flex items-center gap-1">
                              <Navigation className="w-3.5 h-3.5 text-purple-600" /> مدة العودة:
                            </span>
                            <span className="font-mono font-black text-purple-900 text-sm">
                              {ord.returnMinutes !== null ? `${ord.returnMinutes} د` : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="font-black text-gray-900 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-red-600" />
                                {ord.customerName}
                              </span>
                              <a
                                href={`tel:${ord.customerPhone}`}
                                className="font-mono text-gray-700 bg-white px-2 py-0.5 rounded-lg border border-gray-200 hover:text-red-700 font-bold transition-colors shadow-xs"
                                dir="ltr"
                              >
                                📞 {ord.customerPhone}
                              </a>
                            </div>

                            <div className="text-[11px] text-gray-400 font-medium font-mono">
                              {ord.submittedAt
                                ? new Date(ord.submittedAt).toLocaleTimeString("ar-JO", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </div>
                          </div>

                          {/* Dedicated Address Row */}
                          <div className="flex items-start gap-2 pt-2 border-t border-gray-200/60 text-xs">
                            <div className="p-1 rounded-lg bg-red-100 text-red-600 flex-shrink-0 mt-0.5 shadow-xs">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 flex flex-wrap items-baseline gap-1.5">
                              <span className="font-bold text-gray-500 text-[11px]">عنوان العميل:</span>
                              <span className="font-black text-gray-900 bg-white px-2.5 py-1 rounded-xl border border-gray-200 text-xs shadow-xs">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
