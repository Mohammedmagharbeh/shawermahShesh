"use client"

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

export default function StatisticsPage({ translations }) {
  const { allUsers, getAllUsers } = useUser();
  const { orders, getAllOrders } = useOrder();
  const [orderedUsers, setOrderedUsers] = useState([]);
  const [notOrderedUsers, setNotOrderedUsers] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, ordered, not-ordered

  useEffect(() => {
    const fetchData = async () => {
      const allUsersData = await getAllUsers();
      const ordersData = await getAllOrders();

      const orderedUserIds = new Set(
        ordersData.map((order) => order.userId._id)
      );

      const ordered = allUsersData.filter((user) =>
        orderedUserIds.has(user._id)
      );
      const notOrdered = allUsersData.filter(
        (user) => !orderedUserIds.has(user._id)
      );

      const revenue = ordersData.reduce((sum, order) => sum + order.totalPrice, 0);

      setOrderedUsers(ordered);
      setNotOrderedUsers(notOrdered);
      setTotalRevenue(revenue);
    };

    fetchData();
  }, []);

  useEffect(() => {
    setSearchTerm("");
  }, [filterStatus]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {translations.statisticsTitle}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
                {translations.statisticsDescription}
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
                      {translations.totalUsers}
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
                    {translations.totalUsersDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Users with Orders */}
              <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      {translations.usersWithOrders}
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
                </CardContent>
              </Card>

              {/* Users without Orders */}
              <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      {translations.usersWithoutOrders}
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
                    {translations.usersWithoutOrdersDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Total Orders */}
              <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      {translations.totalOrders}
                    </CardTitle>
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl sm:text-4xl font-bold text-purple-600">
                    {orders.length}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {translations.totalOrdersDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Total Revenue */}
              <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow sm:col-span-2">
                <CardHeader className="pb-3 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      {translations.totalRevenue}
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
                    {translations.totalRevenueDescription}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  {translations.visitorsList}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {translations.visitorsListDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={translations.searchPlaceholder}
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
                      {translations.filterAll} ({allUsers.length})
                    </Button>
                    <Button
                      variant={filterStatus === "ordered" ? "default" : "outline"}
                      onClick={() => setFilterStatus("ordered")}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {translations.filterOrdered} ({orderedUsers.length})
                    </Button>
                    <Button
                      variant={filterStatus === "not-ordered" ? "default" : "outline"}
                      onClick={() => setFilterStatus("not-ordered")}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {translations.filterNotOrdered} ({notOrderedUsers.length})
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>{translations.noResults}</p>
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
                                  {translations.registrationDate}:{" "}
                                  {new Date(user.createdAt).toLocaleDateString("ar-SA")}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              {orderedUsers.includes(user) ? (
                                <>
                                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                    <CheckCircle2 className="ml-1 h-3 w-3" />
                                    {translations.orderedBadge}
                                  </Badge>
                                  <div className="text-left">
                                    <p className="text-xs text-muted-foreground">
                                      {translations.numberOfOrders}
                                    </p>
                                    <p className="font-bold text-sm">
                                      {getTotalOrdersByUser(user._id)}
                                    </p>
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs text-muted-foreground">
                                      {translations.totalSpent}
                                    </p>
                                    <p className="font-bold text-sm text-green-600">
                                      {getTotalSpentByUser(user._id).toFixed(2)} د.أ
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-700 hover:bg-orange-200"
                                >
                                  <XCircle className="ml-1 h-3 w-3" />
                                  {translations.notOrderedBadge}
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
