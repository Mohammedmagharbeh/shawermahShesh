import { useState, useEffect } from "react";
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

export default function StatisticsPage() {
  const { allUsers, getAllUsers } = useUser();
  const { orders, getAllOrders } = useOrder();
  const [orderedUsers, setOrderedUsers] = useState([]);
  const [notOrderedUsers, setNotOrderedUsers] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [totalVisitors, setTotalVisitors] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const users = await getAllUsers();
      const allOrders = await getAllOrders();

      const filteredOrders = applyDateFilter(allOrders, dateFilter);

      const orderedUserIds = new Set(
        filteredOrders.map((o) => o.userId._id || o.userDetails._id)
      );

      const ordered = users.filter((u) => orderedUserIds.has(u._id));
      const notOrdered = users.filter((u) => !orderedUserIds.has(u._id));

      const revenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);

      const totalVisitorsCount = applyDateFilterToUsers(
        users,
        dateFilter
      ).length;

      setOrderedUsers(ordered);
      setNotOrderedUsers(notOrdered);
      setTotalRevenue(revenue);
      setTotalVisitors(totalVisitorsCount);
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
          return isWithinInterval(orderDate, {
            start: startOfDay(now),
            end: endOfDay(now),
          });
        case "week":
          return isWithinInterval(orderDate, {
            start: startOfWeek(now, { weekStartsOn: 6 }),
            end: endOfWeek(now, { weekStartsOn: 6 }),
          });
        case "month":
          return isWithinInterval(orderDate, {
            start: startOfMonth(now),
            end: endOfMonth(now),
          });
        default:
          return true;
      }
    });
  };

  const applyDateFilterToUsers = (users, filter) => {
    const now = new Date();
    return users.filter((user) => {
      const registrationDate = new Date(user.updatedAt);
      switch (filter) {
        case "today":
          return isWithinInterval(registrationDate, {
            start: startOfDay(now),
            end: endOfDay(now),
          });
        case "week":
          return isWithinInterval(registrationDate, {
            start: startOfWeek(now, { weekStartsOn: 6 }),
            end: endOfWeek(now, { weekStartsOn: 6 }),
          });
        case "month":
          return isWithinInterval(registrationDate, {
            start: startOfMonth(now),
            end: endOfMonth(now),
          });
        default:
          return true;
      }
    });
  };

  const getTotalOrdersByUser = (userId) => {
    return orders.filter((order) => order.userId._id === userId).length;
  };

  const getTotalSpentByUser = (userId) => {
    return orders
      .filter((order) => order.userId._id === userId)
      .reduce((sum, order) => sum + order.totalPrice, 0);
  };

  // ✅ البحث بالاسم أو الهاتف
  const filteredUsers = (
    filterStatus === "ordered"
      ? orderedUsers
      : filterStatus === "not-ordered"
        ? notOrderedUsers
        : allUsers
  ).filter((user) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (user.phone && user.phone.toLowerCase().includes(term)) ||
      (user.name && user.name.toLowerCase().includes(term))
    );
  });

  const filteredOrders = applyDateFilter(orders, dateFilter);

  const exportToExcel = () => {
    const stats = [
      { Metric: "إجمالي الزوار", Value: totalVisitors },
      { Metric: "قاموا بالطلب", Value: orderedUsers.length },
      { Metric: "بدون طلبات", Value: notOrderedUsers.length },
      { Metric: "إجمالي الطلبات", Value: filteredOrders.length },
      { Metric: "إجمالي الإيرادات", Value: totalRevenue.toFixed(2) + " JOD" },
    ];

    const usersData = allUsers.map((user) => ({
      الهاتف: user.phone,
      الاسم: user.name || "-",
      "تاريخ التسجيل": new Date(user.createdAt).toLocaleDateString("ar-SA"),
      "حالة الطلب": orderedUsers.includes(user) ? "قاموا بالطلب" : "بدون طلب",
      "عدد الطلبات": getTotalOrdersByUser(user._id),
      "إجمالي المبلغ": getTotalSpentByUser(user._id).toFixed(2),
    }));

    const workbook = XLSX.utils.book_new();
    const statsSheet = XLSX.utils.json_to_sheet(stats);
    XLSX.utils.book_append_sheet(workbook, statsSheet, "الإحصائيات");
    const usersSheet = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, "بيانات المستخدمين");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "Statistics.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 mt-10">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {t("statisticsTitle")}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
                {t("statisticsDescription")}
              </p>
            </div>
          </div>
          <Button onClick={exportToExcel}>تصدير إلى Excel</Button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={dateFilter === "all" ? "default" : "outline"}
            onClick={() => setDateFilter("all")}
            size="sm"
          >
            {t("filterAll")}
          </Button>
          <Button
            variant={dateFilter === "today" ? "default" : "outline"}
            onClick={() => setDateFilter("today")}
            size="sm"
          >
            {t("Today")}
          </Button>
          <Button
            variant={dateFilter === "week" ? "default" : "outline"}
            onClick={() => setDateFilter("week")}
            size="sm"
          >
            {t("This week")}
          </Button>
          <Button
            variant={dateFilter === "month" ? "default" : "outline"}
            onClick={() => setDateFilter("month")}
            size="sm"
          >
            {t("This mounth")}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Total Visitors */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("totalUsers")}</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {totalVisitors}
              </div>
            </CardContent>
          </Card>

          {/* Users with Orders */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("usersWithOrders")}</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {orderedUsers.length}
              </div>
            </CardContent>
          </Card>

          {/* Users without Orders */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("usersWithoutOrders")}</CardTitle>
                <XCircle className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {totalVisitors - orderedUsers.length}
              </div>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("totalOrders")}</CardTitle>
                <ShoppingCart className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {filteredOrders.length}
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="sm:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("totalRevenue")}</CardTitle>
                <TrendingUp className="h-5 w-5 text-teal-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">
                {totalRevenue.toFixed(2)} JOD
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>{t("visitorsList")}</CardTitle>
            <CardDescription>{t("visitorsListDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search + Filter Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث بالاسم أو الهاتف"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  size="sm"
                >
                  {t("filterAll")} ({allUsers.length})
                </Button>
                <Button
                  variant={filterStatus === "ordered" ? "default" : "outline"}
                  onClick={() => setFilterStatus("ordered")}
                  size="sm"
                >
                  {t("filterOrdered")} ({orderedUsers.length})
                </Button>
                <Button
                  variant={
                    filterStatus === "not-ordered" ? "default" : "outline"
                  }
                  onClick={() => setFilterStatus("not-ordered")}
                  size="sm"
                >
                  {t("filterNotOrdered")} ({notOrderedUsers.length})
                </Button>
              </div>
            </div>

            {/* User Cards */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t("noResults")}</p>
                </div>
              ) : (
                <div className="space-y-3 flex flex-col">
                  {filteredUsers.map((user) => (
                    <Link to={`/orders/${user._id}`} key={user._id}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-muted rounded-lg">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold">{user.phone}</p>
                                {user.name && (
                                  <p className="text-muted-foreground">
                                    {user.name}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  تاريخ التسجيل:{" "}
                                  {new Date(user.createdAt).toLocaleDateString(
                                    "ar-SA"
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {orderedUsers.includes(user) ? (
                                <>
                                  <Badge className="bg-green-500 text-white">
                                    {t("orderedBadge")}
                                  </Badge>
                                  <div className="text-left">
                                    <p className="text-xs text-muted-foreground">
                                      {t("numberOfOrders")}
                                    </p>
                                    <p className="font-bold text-sm">
                                      {getTotalOrdersByUser(user._id)}
                                    </p>
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs text-muted-foreground">
                                      {t("totalSpent")}
                                    </p>
                                    <p className="font-bold text-sm text-green-600">
                                      {getTotalSpentByUser(user._id).toFixed(2)}{" "}
                                      JOD
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <Badge className="bg-orange-100 text-orange-700">
                                  {t("notOrderedBadge")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
