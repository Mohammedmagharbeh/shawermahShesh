import { useState, useEffect } from "react";
import axios from "axios";
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

export default function StatisticsPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithOrders: 0,
    usersWithoutOrders: 0,
    conversionRate: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // جلب جميع المستخدمين
      const usersResponse = await axios.get("http://localhost:5000/api/users");
      const usersData = usersResponse.data || [];

      // جلب جميع الطلبات
      const ordersResponse = await axios.get(
        "http://localhost:5000/api/order/get"
      );
      const ordersData = ordersResponse.data.data || [];

      // معالجة بيانات المستخدمين
      const processedUsers = usersData.map((user) => {
        const userOrders = ordersData.filter(
          (order) => order.userId?._id === user._id
        );
        const totalSpent = userOrders.reduce(
          (sum, order) => sum + (order.totalPrice || 0),
          0
        );

        return {
          _id: user._id,
          phone: user.phone,
          name: user.name || "",
          createdAt: user.createdAt,
          hasOrdered: userOrders.length > 0,
          orderCount: userOrders.length,
          totalSpent,
        };
      });

      setUsers(processedUsers);

      // حساب الإحصائيات
      const usersWithOrders = processedUsers.filter((u) => u.hasOrdered).length;
      const usersWithoutOrders = processedUsers.length - usersWithOrders;
      const conversionRate =
        processedUsers.length > 0
          ? (usersWithOrders / processedUsers.length) * 100
          : 0;
      const totalRevenue = ordersData.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      );
      const totalOrders = ordersData.length;

      setStats({
        totalUsers: processedUsers.length,
        usersWithOrders,
        usersWithoutOrders,
        conversionRate,
        totalOrders,
        totalRevenue,
      });
    } catch (error) {
      console.error("خطأ في جلب الإحصائيات:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.phone.includes(searchTerm) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "ordered" && user.hasOrdered) ||
      (filterStatus === "not-ordered" && !user.hasOrdered);

    return matchesSearch && matchesFilter;
  });

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20"
      dir="rtl"
    >
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
        {loading ? (
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
                    {stats.totalUsers}
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
                    {stats.usersWithOrders}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    معدل التحويل: {stats.conversionRate.toFixed(1)}%
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
                    {stats.usersWithoutOrders}
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
                    {stats.totalOrders}
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
                    {stats.totalRevenue.toFixed(2)}{" "}
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
                      الكل ({users.length})
                    </Button>
                    <Button
                      variant={
                        filterStatus === "ordered" ? "default" : "outline"
                      }
                      onClick={() => setFilterStatus("ordered")}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      قاموا بالطلب ({stats.usersWithOrders})
                    </Button>
                    <Button
                      variant={
                        filterStatus === "not-ordered" ? "default" : "outline"
                      }
                      onClick={() => setFilterStatus("not-ordered")}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      لم يطلبوا ({stats.usersWithoutOrders})
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
                              {user.hasOrdered ? (
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
                                      {user.orderCount}
                                    </p>
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs text-muted-foreground">
                                      إجمالي الإنفاق
                                    </p>
                                    <p className="font-bold text-sm text-green-600">
                                      {user.totalSpent.toFixed(2)} د.أ
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
