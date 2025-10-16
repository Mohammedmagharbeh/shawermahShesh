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
  Loader2,
  BarChart3,
} from "lucide-react";
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

export default function StatisticsPage() {
  const { allUsers, getAllUsers } = useUser();
  const { orders, getAllOrders } = useOrder();
  const [orderedUsers, setOrderedUsers] = useState([]);
  const [notOrderedUsers, setNotOrderedUsers] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, ordered, not-ordered
  const [dateFilter, setDateFilter] = useState("all"); // ✅ "all", "today", "week", "month"

  useEffect(() => {
    const fetchData = async () => {
      const users = await getAllUsers();
      const allOrders = await getAllOrders();

      const filteredOrders = applyDateFilter(allOrders, dateFilter);

      const orderedUserIds = new Set(filteredOrders.map((o) => o.userId._id));

      const ordered = users.filter((u) => orderedUserIds.has(u._id));
      const notOrdered = users.filter((u) => !orderedUserIds.has(u._id));

      const revenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);

      setOrderedUsers(ordered);
      setNotOrderedUsers(notOrdered);
      setTotalRevenue(revenue);
    };

    fetchData();
  }, [dateFilter]); // ✅ refetch stats when date filter changes

  useEffect(() => setSearchTerm(""), [filterStatus]);

  // ✅ helper to filter by date
  const applyDateFilter = (orders, filter) => {
    const now = new Date();
    console.log("Now:", now);

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
            start: startOfWeek(now, { weekStartsOn: 6 }), // week starts Saturday
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

  const getTotalOrdersByUser = (userId) => {
    return orders.filter((order) => order.userId._id === userId).length;
  };

  const getTotalSpentByUser = (userId) => {
    return orders
      .filter((order) => order.userId._id === userId)
      .reduce((sum, order) => sum + order.totalPrice, 0);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto my-10 px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {/* ✅ Date Filter Buttons */}
          <Button
            variant={dateFilter === "all" ? "default" : "outline"}
            onClick={() => setDateFilter("all")}
            size="sm"
          >
            الكل
          </Button>
          <Button
            variant={dateFilter === "today" ? "default" : "outline"}
            onClick={() => setDateFilter("today")}
            size="sm"
          >
            اليوم
          </Button>
          <Button
            variant={dateFilter === "week" ? "default" : "outline"}
            onClick={() => setDateFilter("week")}
            size="sm"
          >
            هذا الأسبوع
          </Button>
          <Button
            variant={dateFilter === "month" ? "default" : "outline"}
            onClick={() => setDateFilter("month")}
            size="sm"
          >
            هذا الشهر
          </Button>
        </div>

        {/* ... the rest of your statistics cards and user list remain the same ... */}
      </div>
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                إحصائيات الزوار
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
                تتبع الزوار والطلبات ومعدل التحويل
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {filteredUsers.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Total Users */}
              <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      إجمالي الزوار
                    </CardTitle>
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                    {allUsers.length}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    عدد الأشخاص الذين وصلهم OTP
                  </p>
                </CardContent>
              </Card>

              {/* Users with Orders */}
              <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      زوار قاموا بالطلب
                    </CardTitle>
                    <div className="p-2 bg-green-500 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl sm:text-4xl font-bold text-green-600">
                    {orderedUsers.length}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {/* معدل التحويل: {stats.conversionRate.toFixed(1)}% */}
                  </p>
                </CardContent>
              </Card>

              {/* Users without Orders */}
              <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      زوار بدون طلبات
                    </CardTitle>
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <XCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl sm:text-4xl font-bold text-orange-600">
                    {notOrderedUsers.length}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    دخلوا ولم يطلبوا
                  </p>
                </CardContent>
              </Card>

              {/* Total Orders */}
              <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      إجمالي الطلبات
                    </CardTitle>
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl sm:text-4xl font-bold text-purple-600">
                    {filteredOrders.length}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    عدد الطلبات الكلي
                  </p>
                </CardContent>
              </Card>

              {/* Total Revenue */}
              <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow sm:col-span-2">
                <CardHeader className="pb-3 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      إجمالي الإيرادات
                    </CardTitle>
                    <div className="p-2 bg-teal-500 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl sm:text-4xl font-bold text-teal-600">
                    {totalRevenue.toFixed(2)}
                    <span className="text-xl">د.أ</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    مجموع قيمة جميع الطلبات
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  قائمة الزوار
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  جميع الأشخاص الذين وصلهم OTP مع حالة الطلب
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث برقم الهاتف أو الاسم..."
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
                      className="whitespace-nowrap"
                    >
                      الكل ({allUsers.length})
                    </Button>
                    <Button
                      variant={
                        filterStatus === "ordered" ? "default" : "outline"
                      }
                      onClick={() => setFilterStatus("ordered")}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      قاموا بالطلب ({orderedUsers.length})
                    </Button>
                    <Button
                      variant={
                        filterStatus === "not-ordered" ? "default" : "outline"
                      }
                      onClick={() => setFilterStatus("not-ordered")}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      لم يطلبوا ({notOrderedUsers.length})
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد نتائج</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <Card
                        key={user._id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-muted rounded-lg">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-base sm:text-lg truncate">
                                  {user.phone}
                                </p>
                                {user.name && (
                                  <p className="text-sm text-muted-foreground truncate">
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

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              {orderedUsers.includes(user) ? (
                                <>
                                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                    <CheckCircle2 className="ml-1 h-3 w-3" />
                                    قام بالطلب
                                  </Badge>
                                  <div className="text-left">
                                    <p className="text-xs text-muted-foreground">
                                      عدد الطلبات
                                    </p>
                                    <p className="font-bold text-sm">
                                      {getTotalOrdersByUser(user._id)}
                                    </p>
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs text-muted-foreground">
                                      إجمالي الإنفاق
                                    </p>
                                    <p className="font-bold text-sm text-green-600">
                                      {getTotalSpentByUser(user._id).toFixed(2)}
                                      د.أ
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-700 hover:bg-orange-200"
                                >
                                  <XCircle className="ml-1 h-3 w-3" />
                                  لم يطلب
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
