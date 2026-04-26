// import { useState, useEffect, useMemo } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Users,
//   ShoppingCart,
//   TrendingUp,
//   Phone,
//   CheckCircle2,
//   XCircle,
//   Search,
//   BarChart3,
// } from "lucide-react";
// import { useTranslation } from "react-i18next";

// import { useUser } from "@/contexts/UserContext";
// import { useOrder } from "@/contexts/OrderContext";
// import {
//   startOfDay,
//   endOfDay,
//   startOfWeek,
//   endOfWeek,
//   startOfMonth,
//   endOfMonth,
//   isWithinInterval,
//   set,
// } from "date-fns";
// import { Link } from "react-router-dom";

// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import Loading from "@/components/common/Loading";

// export default function StatisticsPage() {
//   const { getAllUsers } = useUser();
//   const { orders, getAllOrders } = useOrder();
//   const [orderedUsers, setOrderedUsers] = useState([]);
//   const [notOrderedUsers, setNotOrderedUsers] = useState([]);
//   const [totalRevenue, setTotalRevenue] = useState(0);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [dateFilter, setDateFilter] = useState("all");
//   const [totalVisitors, setTotalVisitors] = useState();
//   const [loading, setLoading] = useState(true);
//   const { t } = useTranslation();

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       const users = await getAllUsers();
//       const allOrders = await getAllOrders();

//       const filteredOrders = applyDateFilter(allOrders, dateFilter);

//       const orderedUserIds = new Set(
//         filteredOrders.map((o) => o.userId?._id || o.userDetails?._id),
//       );

//       const totalVisitors = applyDateFilterToUsers(users, dateFilter);

//       const ordered = totalVisitors.filter((u) => orderedUserIds.has(u._id));
//       const notOrdered = totalVisitors.filter(
//         (u) => !orderedUserIds.has(u._id),
//       );

//       const revenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);

//       setOrderedUsers(ordered);
//       setNotOrderedUsers(notOrdered);
//       setTotalRevenue(revenue);
//       setTotalVisitors(totalVisitors);

//       setLoading(false);
//     };

//     fetchData();
//   }, [dateFilter]);

//   useEffect(() => setSearchTerm(""), [filterStatus]);

//   const applyDateFilter = (orders, filter) => {
//     const now = new Date();
//     return orders.filter((order) => {
//       const orderDate = new Date(order.createdAt);
//       switch (filter) {
//         case "today":
//           return isWithinInterval(orderDate, {
//             start: startOfDay(now),
//             end: endOfDay(now),
//           });
//         case "week":
//           return isWithinInterval(orderDate, {
//             start: startOfWeek(now, { weekStartsOn: 6 }),
//             end: endOfWeek(now, { weekStartsOn: 6 }),
//           });
//         case "month":
//           return isWithinInterval(orderDate, {
//             start: startOfMonth(now),
//             end: endOfMonth(now),
//           });
//         default:
//           return true;
//       }
//     });
//   };

//   const applyDateFilterToUsers = (users, filter) => {
//     const now = new Date();
//     return users.filter((user) => {
//       const registrationDate = new Date(user.updatedAt);
//       switch (filter) {
//         case "today":
//           return isWithinInterval(registrationDate, {
//             start: startOfDay(now),
//             end: endOfDay(now),
//           });
//         case "week":
//           return isWithinInterval(registrationDate, {
//             start: startOfWeek(now, { weekStartsOn: 6 }),
//             end: endOfWeek(now, { weekStartsOn: 6 }),
//           });
//         case "month":
//           return isWithinInterval(registrationDate, {
//             start: startOfMonth(now),
//             end: endOfMonth(now),
//           });
//         default:
//           return true;
//       }
//     });
//   };

//   const getTotalOrdersByUser = (userId) => {
//     return orders.filter((order) => order.userId?._id === userId).length;
//   };

//   const getTotalSpentByUser = (userId) => {
//     return orders
//       .filter((order) => order.userId?._id === userId)
//       .reduce((sum, order) => sum + order.totalPrice, 0);
//   };

//   // ✅ البحث بالاسم أو الهاتف
//   const filteredUsers = useMemo(() => {
//     const users =
//       filterStatus === "ordered"
//         ? orderedUsers
//         : filterStatus === "not-ordered"
//           ? notOrderedUsers
//           : totalVisitors;

//     const term = searchTerm.trim().toLowerCase();
//     if (!term) return users;

//     return users.filter(
//       (user) =>
//         (user.phone && user.phone.toLowerCase().includes(term)) ||
//         (user.name && user.name.toLowerCase().includes(term)),
//     );
//   }, [filterStatus, orderedUsers, notOrderedUsers, totalVisitors, searchTerm]);

//   const filteredOrders = useMemo(
//     () => applyDateFilter(orders, dateFilter),
//     [orders, dateFilter],
//   );
//   const exportToExcel = () => {
//     const stats = [
//       { Metric: t("total_visitors"), Value: totalVisitors?.length },
//       { Metric: t("ordered_users"), Value: orderedUsers.length },
//       { Metric: t("not_ordered_users"), Value: notOrderedUsers.length },
//       { Metric: t("total_orders"), Value: filteredOrders.length },
//       { Metric: t("total_revenue"), Value: totalRevenue.toFixed(2) + " JOD" },
//     ];

//     const usersData = totalVisitors.map((user) => ({
//       [t("phone")]: user.phone,
//       [t("name")]: user.name || "-",
//       [t("registration_date")]: new Date(user.createdAt).toLocaleDateString(
//         i18n.language === "ar" ? "ar-SA" : "en-US",
//       ),
//       [t("order_status")]: orderedUsers.includes(user)
//         ? t("ordered_users")
//         : t("not_ordered_users"),
//       [t("orders_count")]: getTotalOrdersByUser(user._id),
//       [t("total_amount")]: getTotalSpentByUser(user._id).toFixed(2),
//     }));

//     const workbook = XLSX.utils.book_new();
//     const statsSheet = XLSX.utils.json_to_sheet(stats);
//     XLSX.utils.book_append_sheet(workbook, statsSheet, t("statistics_sheet"));
//     const usersSheet = XLSX.utils.json_to_sheet(usersData);
//     XLSX.utils.book_append_sheet(workbook, usersSheet, t("users_sheet"));

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });
//     const file = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(file, "Statistics.xlsx");
//   };

//   if (loading) return <Loading />;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
//       {/* Header */}
//       <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
//         <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
//               <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
//                 {t("statisticsTitle")}
//               </h1>
//               <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
//                 {t("statisticsDescription")}
//               </p>
//             </div>
//           </div>
//           <Button onClick={exportToExcel}>{t("export_to_excel")}</Button>
//         </div>
//       </div>

//       {/* Date Filters */}
//       <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
//         <div className="flex flex-wrap gap-2 mb-4">
//           <Button
//             variant={dateFilter === "all" ? "default" : "outline"}
//             onClick={() => setDateFilter("all")}
//             size="sm"
//           >
//             {t("filterAll")}
//           </Button>
//           <Button
//             variant={dateFilter === "today" ? "default" : "outline"}
//             onClick={() => setDateFilter("today")}
//             size="sm"
//           >
//             {t("Today")}
//           </Button>
//           <Button
//             variant={dateFilter === "week" ? "default" : "outline"}
//             onClick={() => setDateFilter("week")}
//             size="sm"
//           >
//             {t("This week")}
//           </Button>
//           <Button
//             variant={dateFilter === "month" ? "default" : "outline"}
//             onClick={() => setDateFilter("month")}
//             size="sm"
//           >
//             {t("This mounth")}
//           </Button>
//         </div>

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
//           {/* Total Visitors */}
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle>{t("totalUsers")}</CardTitle>
//                 <Users className="h-5 w-5 text-blue-500" />
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-blue-600">
//                 {totalVisitors?.length}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Users with Orders */}
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle>{t("usersWithOrders")}</CardTitle>
//                 <CheckCircle2 className="h-5 w-5 text-green-500" />
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-green-600">
//                 {orderedUsers.length}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Users without Orders */}
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle>{t("usersWithoutOrders")}</CardTitle>
//                 <XCircle className="h-5 w-5 text-orange-500" />
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-orange-600">
//                 {totalVisitors?.length - orderedUsers.length}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Total Orders */}
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle>{t("totalOrders")}</CardTitle>
//                 <ShoppingCart className="h-5 w-5 text-purple-500" />
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-purple-600">
//                 {filteredOrders.length}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Total Revenue */}
//           <Card className="sm:col-span-2">
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle>{t("totalRevenue")}</CardTitle>
//                 <TrendingUp className="h-5 w-5 text-teal-500" />
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-teal-600">
//                 {totalRevenue.toFixed(2)} JOD
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Users List */}
//         <Card>
//           <CardHeader>
//             <CardTitle>{t("visitorsList")}</CardTitle>
//             <CardDescription>{t("visitorsListDescription")}</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {/* Search + Filter Buttons */}
//             <div className="flex flex-col sm:flex-row gap-3">
//               <div className="relative flex-1">
//                 <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder={t("search_placeholder_name_phone")}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pr-10"
//                 />
//               </div>
//               <div className="flex gap-2 overflow-x-auto pb-2">
//                 <Button
//                   variant={filterStatus === "all" ? "default" : "outline"}
//                   onClick={() => setFilterStatus("all")}
//                   size="sm"
//                 >
//                   {t("filterAll")} ({totalVisitors?.length})
//                 </Button>
//                 <Button
//                   variant={filterStatus === "ordered" ? "default" : "outline"}
//                   onClick={() => setFilterStatus("ordered")}
//                   size="sm"
//                 >
//                   {t("filterOrdered")} ({orderedUsers.length})
//                 </Button>
//                 <Button
//                   variant={
//                     filterStatus === "not-ordered" ? "default" : "outline"
//                   }
//                   onClick={() => setFilterStatus("not-ordered")}
//                   size="sm"
//                 >
//                   {t("filterNotOrdered")} ({notOrderedUsers.length})
//                 </Button>
//               </div>
//             </div>

//             {/* User Cards */}
//             <div className="space-y-3">
//               {filteredUsers?.length === 0 ? (
//                 <div className="text-center py-12 text-muted-foreground">
//                   <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
//                   <p>{t("noResults")}</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3 flex flex-col">
//                   {filteredUsers?.map((user) => (
//                     <Link to={`/orders/${user._id}`} key={user._id}>
//                       <Card className="hover:shadow-md transition-shadow">
//                         <CardContent className="p-4">
//                           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                             <div className="flex items-start gap-3 flex-1">
//                               <div className="p-2 bg-muted rounded-lg">
//                                 <Phone className="h-5 w-5 text-muted-foreground" />
//                               </div>
//                               <div className="flex-1 min-w-0">
                                
//                                 <p className="font-bold">{user.phone}</p>
//                                 {user.name && (
//                                   <p className="text-muted-foreground">
//                                     {user.name}
//                                   </p>
//                                 )}
//                                 <p className="text-xs text-muted-foreground mt-1">
//                                   {t("registration_date")}:{" "}
//                                   {new Date(
//                                     user.createdAt,
//                                   ).toLocaleDateString()}
//                                 </p>
//                               </div>
//                             </div>
//                             <div className="flex flex-wrap items-center gap-2">
//                               {orderedUsers.includes(user) ? (
//                                 <>
//                                   <Badge className="bg-green-500 text-white">
//                                     {t("orderedBadge")}
//                                   </Badge>
//                                   <div className="text-left">
//                                     <p className="text-xs text-muted-foreground">
//                                       {t("numberOfOrders")}
//                                     </p>
//                                     <p className="font-bold text-sm">
//                                       {getTotalOrdersByUser(user._id)}
//                                     </p>
//                                   </div>
//                                   <div className="text-left">
//                                     <p className="text-xs text-muted-foreground">
//                                       {t("totalSpent")}
//                                     </p>
//                                     <p className="font-bold text-sm text-green-600">
//                                       {getTotalSpentByUser(user._id).toFixed(2)}{" "}
//                                       JOD
//                                     </p>
//                                   </div>
//                                 </>
//                               ) : (
//                                 <Badge className="bg-orange-100 text-orange-700">
//                                   {t("notOrderedBadge")}
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     </Link>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  Phone,
  CheckCircle2,
  XCircle,
  Search,
  BarChart3,
  User as UserIcon,
  Calendar
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useUser } from "@/contexts/UserContext";
import { useOrder } from "@/contexts/OrderContext";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { Link } from "react-router-dom";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Loading from "@/components/common/Loading";

export default function StatisticsPage() {
  const { getAllUsers } = useUser();
  const { orders, getAllOrders } = useOrder();
  const [orderedUsers, setOrderedUsers] = useState([]);
  const [notOrderedUsers, setNotOrderedUsers] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [totalVisitors, setTotalVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const users = await getAllUsers();
        const allOrders = await getAllOrders();

        const filteredOrders = applyDateFilter(allOrders, dateFilter);
        const orderedUserIds = new Set(
          filteredOrders.map((o) => o.userId?._id || o.userDetails?._id),
        );

        const visitors = applyDateFilterToUsers(users, dateFilter);
        const ordered = visitors.filter((u) => orderedUserIds.has(u._id));
        const notOrdered = visitors.filter((u) => !orderedUserIds.has(u._id));

        const revenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);

        setOrderedUsers(ordered);
        setNotOrderedUsers(notOrdered);
        setTotalRevenue(revenue);
        setTotalVisitors(visitors);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFilter]);

  useEffect(() => setSearchTerm(""), [filterStatus]);

  const applyDateFilter = (orders, filter) => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      switch (filter) {
        case "today":
          return isWithinInterval(orderDate, { start: startOfDay(now), end: endOfDay(now) });
        case "week":
          return isWithinInterval(orderDate, { start: startOfWeek(now, { weekStartsOn: 6 }), end: endOfWeek(now, { weekStartsOn: 6 }) });
        case "month":
          return isWithinInterval(orderDate, { start: startOfMonth(now), end: endOfMonth(now) });
        default:
          return true;
      }
    });
  };

  const applyDateFilterToUsers = (users, filter) => {
    const now = new Date();
    return users.filter((user) => {
      const registrationDate = new Date(user.createdAt);
      switch (filter) {
        case "today":
          return isWithinInterval(registrationDate, { start: startOfDay(now), end: endOfDay(now) });
        case "week":
          return isWithinInterval(registrationDate, { start: startOfWeek(now, { weekStartsOn: 6 }), end: endOfWeek(now, { weekStartsOn: 6 }) });
        case "month":
          return isWithinInterval(registrationDate, { start: startOfMonth(now), end: endOfMonth(now) });
        default:
          return true;
      }
    });
  };

  const getTotalOrdersByUser = (userId) => {
    return orders.filter((order) => (order.userId?._id || order.userDetails?._id) === userId).length;
  };

  const getTotalSpentByUser = (userId) => {
    return orders
      .filter((order) => (order.userId?._id || order.userDetails?._id) === userId)
      .reduce((sum, order) => sum + order.totalPrice, 0);
  };

  // ✅ تحديث البحث ليشمل الـ username
  const filteredUsers = useMemo(() => {
    const users =
      filterStatus === "ordered"
        ? orderedUsers
        : filterStatus === "not-ordered"
          ? notOrderedUsers
          : totalVisitors;

    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter(
      (user) =>
        (user.phone && user.phone.toLowerCase().includes(term)) ||
        (user.username && user.username.toLowerCase().includes(term)) ||
        (user.name && user.name.toLowerCase().includes(term)),
    );
  }, [filterStatus, orderedUsers, notOrderedUsers, totalVisitors, searchTerm]);

  const filteredOrders = useMemo(
    () => applyDateFilter(orders, dateFilter),
    [orders, dateFilter],
  );

  // ✅ تحديث الاكسل ليشمل الـ username
  const exportToExcel = () => {
    const stats = [
      { Metric: t("total_visitors"), Value: totalVisitors?.length },
      { Metric: t("ordered_users"), Value: orderedUsers.length },
      { Metric: t("not_ordered_users"), Value: notOrderedUsers.length },
      { Metric: t("total_orders"), Value: filteredOrders.length },
      { Metric: t("total_revenue"), Value: totalRevenue.toFixed(2) + " JOD" },
    ];

    const usersData = totalVisitors.map((user) => ({
      [t("phone")]: user.phone || "-",
      [t("name")]: user.username || user.name || "-",
      [t("registration_date")]: new Date(user.createdAt).toLocaleDateString(
        i18n.language === "ar" ? "ar-SA" : "en-US",
      ),
      [t("order_status")]: orderedUsers.some(u => u._id === user._id)
        ? t("ordered_users")
        : t("not_ordered_users"),
      [t("orders_count")]: getTotalOrdersByUser(user._id),
      [t("total_amount")]: getTotalSpentByUser(user._id).toFixed(2),
    }));

    const workbook = XLSX.utils.book_new();
    const statsSheet = XLSX.utils.json_to_sheet(stats);
    XLSX.utils.book_append_sheet(workbook, statsSheet, t("statistics_sheet"));
    const usersSheet = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, t("users_sheet"));

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, `Statistics_${dateFilter}.xlsx`);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-100">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{t("statisticsTitle")}</h1>
              <p className="text-gray-500 text-sm">{t("statisticsDescription")}</p>
            </div>
          </div>
          <Button 
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 px-6 font-bold flex gap-2"
          >
            <TrendingUp size={20} />
            {t("export_to_excel")}
          </Button>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "today", "week", "month"].map((f) => (
            <Button
              key={f}
              variant={dateFilter === f ? "default" : "outline"}
              onClick={() => setDateFilter(f)}
              className={`rounded-xl px-6 h-10 font-bold transition-all ${
                dateFilter === f ? "bg-gray-900 text-white" : "bg-white text-gray-600"
              }`}
            >
              {t(f === "all" ? "filterAll" : f)}
            </Button>
          ))}
        </div>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t("totalUsers")} value={totalVisitors?.length} icon={<Users />} color="text-blue-600" bg="bg-blue-50" />
          <StatCard title={t("usersWithOrders")} value={orderedUsers.length} icon={<CheckCircle2 />} color="text-green-600" bg="bg-green-50" />
          <StatCard title={t("totalOrders")} value={filteredOrders.length} icon={<ShoppingCart />} color="text-purple-600" bg="bg-purple-50" />
          <StatCard title={t("totalRevenue")} value={`${totalRevenue.toFixed(2)} JOD`} icon={<TrendingUp />} color="text-red-600" bg="bg-red-50" />
        </div>

        {/* Main Content Area */}
        <Card className="rounded-3xl border-0 shadow-xl shadow-gray-200/50 bg-white overflow-hidden">
          <CardHeader className="border-b border-gray-50 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">{t("visitorsList")}</CardTitle>
                <CardDescription className="text-gray-500 mt-1">{t("visitorsListDescription")}</CardDescription>
              </div>
              
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                <TabButton active={filterStatus === "all"} onClick={() => setFilterStatus("all")} label={t("filterAll")} count={totalVisitors?.length} />
                <TabButton active={filterStatus === "ordered"} onClick={() => setFilterStatus("ordered")} label={t("filterOrdered")} count={orderedUsers.length} />
                <TabButton active={filterStatus === "not-ordered"} onClick={() => setFilterStatus("not-ordered")} label={t("filterNotOrdered")} count={notOrderedUsers.length} />
              </div>
            </div>

            <div className="relative mt-6">
              <Search className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t("search_placeholder_name_phone")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-lg"
              />
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers?.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <XCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">{t("noResults")}</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <Link to={`/orders/${u._id}`} key={u._id}>
                    <div className="group p-5 bg-white border border-gray-100 rounded-2xl hover:border-red-200 hover:shadow-lg hover:shadow-red-50 transition-all duration-300">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl transition-colors ${u.username || u.name ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-600'}`}>
                            {u.username || u.name ? <UserIcon size={24} /> : <Phone size={24} />}
                          </div>
                          <div>
                            {/* ✅ الأولوية لـ username للموظفين */}
                            <h4 className="font-black text-gray-900 text-lg leading-tight">
                              {u.username || u.name || u.phone}
                            </h4>
                            {(u.username || u.name) && u.phone && (
                              <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                                <Phone size={12} /> {u.phone}
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">
                              <Calendar size={10} />
                              {new Date(u.createdAt).toLocaleDateString('ar-JO')}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {orderedUsers.some(ordered => ordered._id === u._id) ? (
                            <>
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 rounded-lg font-bold">
                                {t("orderedBadge")}
                              </Badge>
                              <span className="text-sm font-black text-red-600">
                                {getTotalSpentByUser(u._id).toFixed(2)} <span className="text-[10px]">JOD</span>
                              </span>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-gray-300 border-gray-100 rounded-lg">
                              {t("notOrderedBadge")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg }) {
  return (
    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4 shadow-inner`}>
          {icon}
        </div>
        <p className="text-gray-500 text-sm font-bold mb-1">{title}</p>
        <h3 className={`text-2xl font-black ${color} tracking-tight`}>{value}</h3>
      </CardContent>
    </Card>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${active ? 'bg-red-50 text-red-600' : 'bg-gray-200 text-gray-500'}`}>
        {count}
      </span>
    </button>
  );
}