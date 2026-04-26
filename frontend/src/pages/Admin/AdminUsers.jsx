// // // import { useState, useEffect } from "react";
// // // import axios from "axios";
// // // import toast from "react-hot-toast";
// // // import { Button } from "@/components/ui/button";
// // // import { Input } from "@/components/ui/input";
// // // import { Card } from "@/components/ui/card";
// // // import {
// // //   Select,
// // //   SelectContent,
// // //   SelectItem,
// // //   SelectTrigger,
// // //   SelectValue,
// // // } from "@/components/ui/select";
// // // import {
// // //   UserPlus,
// // //   Edit2,
// // //   Save,
// // //   X,
// // //   Shield,
// // //   Crown,
// // //   User,
// // //   Phone,
// // //   Loader2,
// // // } from "lucide-react";
// // // import Loading from "@/components/common/Loading";
// // // import { useUser } from "@/contexts/UserContext";
// // // import { useTranslation } from "react-i18next";

// // // const AdminUsersPage = () => {
// // //   const [users, setUsers] = useState([]);
// // //   const [showUsers, setShowUsers] = useState(false);
// // //   const [newUser, setNewUser] = useState({
// // //     phone: "",
// // //     role: "user",
// // //   });
// // //   const [editUserId, setEditUserId] = useState(null);
// // //   const [editRole, setEditRole] = useState("user");
// // //   const [loading, setLoading] = useState(false);
// // //   const [actionLoading, setActionLoading] = useState(false);
// // //   const { user } = useUser();
// // //   const { t } = useTranslation();

// // //   // نجيب المستخدمين مرة واحدة عند تحميل الصفحة ليظهر عددهم دائمًا
// // //   useEffect(() => {
// // //     fetchUsers();
// // //   }, []);

// // //   const fetchUsers = async () => {
// // //     try {
// // //       setLoading(true);
// // //       const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`, {
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           authorization: `Bearer ${user?.token}`,
// // //         },
// // //       });
// // //       const data = res.data.sort((a, b) => a.role.localeCompare(b.role));
// // //       setUsers(data);
// // //     } catch (err) {
// // //       console.error("خطأ في جلب المستخدمين:", err);
// // //       toast.error(t("failed_fetch_users"));
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleAddUser = async () => {
// // //     if (!newUser.phone) {
// // //       toast.error(t("fill_all_fields"));
// // //       return;
// // //     }
// // //     try {
// // //       setActionLoading(true);
// // //       await axios.post(
// // //         `${import.meta.env.VITE_BASE_URL}/admin/user/add`,
// // //         newUser,
// // //         {
// // //           headers: {
// // //             "Content-Type": "application/json",
// // //             authorization: `Bearer ${user.token}`,
// // //           },
// // //         },
// // //       );
// // //       setNewUser({ phone: "", role: "user" });
// // //       fetchUsers();
// // //       toast.success(t("user_added_success"));
// // //     } catch (err) {
// // //       console.error("خطأ في إضافة المستخدم:", err);
// // //       // toast.error("فشل في إضافة المستخدم");
// // //       toast.error(err.response?.data?.message || t("user_add_failed"));
// // //     } finally {
// // //       setActionLoading(false);
// // //     }
// // //   };

// // //   const handleUpdateRole = async (id) => {
// // //     try {
// // //       setActionLoading(true);
// // //       await axios.put(
// // //         `${import.meta.env.VITE_BASE_URL}/admin/user/${id}`,
// // //         {
// // //           role: editRole,
// // //         },
// // //         {
// // //           headers: {
// // //             "Content-Type": "application/json",
// // //             authorization: `Bearer ${user.token}`,
// // //           },
// // //         },
// // //       );
// // //       setEditUserId(null);
// // //       fetchUsers();
// // //       toast.success(t("role_updated_success"));
// // //     } catch (err) {
// // //       console.error("خطأ في تعديل الرول:", err);
// // //       toast.error(t("role_update_failed"));
// // //     } finally {
// // //       setActionLoading(false);
// // //     }
// // //   };

// // //   const getRoleIcon = (role) => {
// // //     switch (role) {
// // //       case "admin":
// // //         return <Shield className="w-4 h-4" />;
// // //       case "manager":
// // //         return <Crown className="w-4 h-4" />;
// // //       default:
// // //         return <User className="w-4 h-4" />;
// // //     }
// // //   };

// // //   // كل البادجات باللون الأحمر
// // //   const getRoleBadgeColor = (role) => {
// // //     role = role.toLowerCase();
// // //     if (role === "admin") return "bg-red-100 text-red-800";
// // //     if (role === "employee") return "bg-green-100 text-green-800";
// // //     return "bg-yellow-100 text-gray-800";
// // //   };

// // //   if (loading) return <Loading />;

// // //   return (
// // //     <div className="min-h-screen bg-white" dir="rtl">
// // //       <div className="max-w-7xl mx-auto space-y-8">
// // //         {/* Header */}
// // //         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
// // //           <div className="flex items-center gap-3">
// // //             <div className="p-4 bg-red-700 rounded-2xl shadow-lg">
// // //               <Shield className="w-10 h-10 text-white" />
// // //             </div>
// // //             <div>
// // //               <h1 className="text-3xl md:text-5xl font-bold text-red-700 leading-tight">
// // //                 {t("users_management")}
// // //               </h1>
// // //               <p className="text-gray-600 mt-1">
// // //                 {t("manage_users_permissions")}
// // //               </p>
// // //             </div>
// // //           </div>
// // //           <div className="px-6 py-3 bg-red-700 rounded-xl shadow-lg text-white text-center">
// // //             <p className="text-sm">{t("total_users")}</p>
// // //             <p className="text-3xl font-bold">{users.length}</p>
// // //           </div>
// // //         </div>

// // //         {/* Add User Form */}
// // //         <Card className="p-6 md:p-8 shadow-lg border-0 bg-white rounded-2xl">
// // //           <div className="flex items-center gap-3 mb-6">
// // //             <UserPlus className="w-6 h-6 text-red-700" />
// // //             <h2 className="text-2xl font-bold text-gray-800">
// // //               {t("add_new_user")}
// // //             </h2>
// // //           </div>
// // //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
// // //             <div>
// // //               <Input
// // //                 type="text"
// // //                 placeholder={t("phone_placeholder")}
// // //                 value={newUser.phone}
// // //                 onChange={(e) =>
// // //                   setNewUser({ ...newUser, phone: e.target.value })
// // //                 }
// // //                 className="border border-gray-300 rounded-xl h-12"
// // //                 maxLength={10}
// // //               />
// // //             </div>
// // //             <div>
// // //               <Select
// // //                 value={newUser.role}
// // //                 onValueChange={(value) =>
// // //                   setNewUser({ ...newUser, role: value })
// // //                 }
// // //               >
// // //                 <SelectTrigger className="border border-gray-300 rounded-xl h-12">
// // //                   <SelectValue placeholder={t("select_role")} />
// // //                 </SelectTrigger>
// // //                 <SelectContent>
// // //                   <SelectItem value="user">{t("user_role")}</SelectItem>
// // //                   <SelectItem value="admin">{t("admin_role")}</SelectItem>
// // //                   <SelectItem value="employee">{t("employee_role")}</SelectItem>
// // //                 </SelectContent>
// // //               </Select>
// // //             </div>
// // //             <div>
// // //               <Button
// // //                 onClick={handleAddUser}
// // //                 disabled={actionLoading}
// // //                 className="w-full h-12 bg-red-700 text-white rounded-xl hover:bg-red-800"
// // //               >
// // //                 {actionLoading ? (
// // //                   <Loader2 className="w-5 h-5 animate-spin" />
// // //                 ) : (
// // //                   <UserPlus className="w-5 h-5 ml-2" />
// // //                 )}
// // //                 {t("add_user")}
// // //               </Button>
// // //             </div>
// // //           </div>
// // //         </Card>

// // //         {/* Show/Hide Users Button */}
// // //         <Button
// // //           onClick={() => setShowUsers(!showUsers)}
// // //           className="bg-red-700 text-white rounded-xl px-4 py-2 hover:bg-red-800"
// // //         >
// // //           {showUsers ? t("hide_users") : t("show_users")}
// // //         </Button>

// // //         {/* Users List */}
// // //         {showUsers && users.length > 0 && (
// // //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // //             {users.map((user) => (
// // //               <Card
// // //                 key={user._id}
// // //                 className="p-4 shadow-lg rounded-xl bg-white"
// // //               >
// // //                 <div className="flex items-center justify-between">
// // //                   <div className="flex items-center gap-3">
// // //                     <User className="w-6 h-6 text-red-700" />
// // //                     <div>
// // //                       <p className="text-sm text-gray-600">
// // //                         {user.phone || user.username}
// // //                       </p>
// // //                     </div>
// // //                   </div>
// // //                   <div
// // //                     className={`px-2 py-1 rounded-xl ${getRoleBadgeColor(user.role)} text-sm flex items-center gap-1`}
// // //                   >
// // //                     {getRoleIcon(user.role)} {t(user.role)}
// // //                   </div>
// // //                 </div>

// // //                 <div className="mt-3">
// // //                   {editUserId === user._id ? (
// // //                     <div className="flex gap-2">
// // //                       <Select value={editRole} onValueChange={setEditRole}>
// // //                         <SelectTrigger className="border border-gray-300 rounded-xl h-10">
// // //                           <SelectValue placeholder={t("select_role")} />
// // //                         </SelectTrigger>
// // //                         <SelectContent>
// // //                           <SelectItem value="user">{t("user_role")}</SelectItem>
// // //                           <SelectItem value="admin">
// // //                             {t("admin_role")}
// // //                           </SelectItem>
// // //                           <SelectItem value="employee">
// // //                             {t("employee_role")}
// // //                           </SelectItem>
// // //                         </SelectContent>
// // //                       </Select>
// // //                       <Button
// // //                         onClick={() => handleUpdateRole(user._id)}
// // //                         disabled={actionLoading}
// // //                         className="bg-red-700 text-white rounded-xl px-3"
// // //                       >
// // //                         {t("save_changes")}
// // //                       </Button>
// // //                       <Button
// // //                         onClick={() => setEditUserId(null)}
// // //                         variant="outline"
// // //                         className="border border-gray-300 rounded-xl px-3"
// // //                       >
// // //                         {t("cancel")}
// // //                       </Button>
// // //                     </div>
// // //                   ) : (
// // //                     <Button
// // //                       onClick={() => {
// // //                         setEditUserId(user._id);
// // //                         setEditRole(user.role);
// // //                       }}
// // //                       variant="outline"
// // //                       className="border border-red-700 text-red-700 rounded-xl px-3"
// // //                     >
// // //                       {t("edit_role")}
// // //                     </Button>
// // //                   )}
// // //                 </div>
// // //               </Card>
// // //             ))}
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default AdminUsersPage;


// // // import { useState, useEffect } from "react";
// // // import axios from "axios";
// // // import toast from "react-hot-toast";
// // // import { Button } from "@/components/ui/button";
// // // import { Input } from "@/components/ui/input";
// // // import { Card } from "@/components/ui/card";
// // // import {
// // //   Select,
// // //   SelectContent,
// // //   SelectItem,
// // //   SelectTrigger,
// // //   SelectValue,
// // // } from "@/components/ui/select";
// // // import {
// // //   UserPlus,
// // //   Shield,
// // //   Crown,
// // //   User,
// // //   Loader2,
// // //   Lock,
// // //   UserCheck,
// // // } from "lucide-react";
// // // import Loading from "@/components/common/Loading";
// // // import { useUser } from "@/contexts/UserContext";
// // // import { useTranslation } from "react-i18next";

// // // const AdminUsersPage = () => {
// // //   const [users, setUsers] = useState([]);
// // //   const [showUsers, setShowUsers] = useState(false);
// // //   const [newUser, setNewUser] = useState({
// // //     phone: "",
// // //     name: "", // للاسم (للموظف)
// // //     password: "", // للباسورد (للموظف)
// // //     role: "user",
// // //   });
// // //   const [editUserId, setEditUserId] = useState(null);
// // //   const [editRole, setEditRole] = useState("user");
// // //   const [loading, setLoading] = useState(false);
// // //   const [actionLoading, setActionLoading] = useState(false);
// // //   const { user } = useUser();
// // //   const { t } = useTranslation();

// // //   useEffect(() => {
// // //     fetchUsers();
// // //   }, []);

// // //   const fetchUsers = async () => {
// // //     try {
// // //       setLoading(true);
// // //       const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`, {
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           authorization: `Bearer ${user?.token}`,
// // //         },
// // //       });
// // //       const data = res.data.sort((a, b) => a.role.localeCompare(b.role));
// // //       setUsers(data);
// // //     } catch (err) {
// // //       console.error("خطأ في جلب المستخدمين:", err);
// // //       toast.error(t("failed_fetch_users"));
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleAddUser = async () => {
// // //     // التحقق من الحقول بناءً على النوع
// // //     if (newUser.role === "employee") {
// // //       if (!newUser.name || !newUser.password) {
// // //         return toast.error(t("fill_name_and_password"));
// // //       }
// // //     } else {
// // //       if (!newUser.phone) {
// // //         return toast.error(t("fill_phone_field"));
// // //       }
// // //     }

// // //     try {
// // //       setActionLoading(true);
      
// // //       // نختار الـ Endpoint بناءً على الرول
// // //       const endpoint = newUser.role === "employee" 
// // //         ? `${import.meta.env.VITE_BASE_URL}/auth/create-employee`
// // //         : `${import.meta.env.VITE_BASE_URL}/admin/user/add`;

// // //       await axios.post(endpoint, newUser, {
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           authorization: `Bearer ${user.token}`,
// // //         },
// // //       });

// // //       setNewUser({ phone: "", name: "", password: "", role: "user" });
// // //       fetchUsers();
// // //       toast.success(t("user_added_success"));
// // //     } catch (err) {
// // //       toast.error(err.response?.data?.message || t("user_add_failed"));
// // //     } finally {
// // //       setActionLoading(false);
// // //     }
// // //   };

// // //   const handleUpdateRole = async (id) => {
// // //     try {
// // //       setActionLoading(true);
// // //       await axios.put(
// // //         `${import.meta.env.VITE_BASE_URL}/admin/user/${id}`,
// // //         { role: editRole },
// // //         {
// // //           headers: {
// // //             "Content-Type": "application/json",
// // //             authorization: `Bearer ${user.token}`,
// // //           },
// // //         }
// // //       );
// // //       setEditUserId(null);
// // //       fetchUsers();
// // //       toast.success(t("role_updated_success"));
// // //     } catch (err) {
// // //       toast.error(t("role_update_failed"));
// // //     } finally {
// // //       setActionLoading(false);
// // //     }
// // //   };

// // //   const getRoleIcon = (role) => {
// // //     switch (role) {
// // //       case "admin": return <Shield className="w-4 h-4" />;
// // //       case "employee": return <UserCheck className="w-4 h-4" />;
// // //       default: return <User className="w-4 h-4" />;
// // //     }
// // //   };

// // //   const getRoleBadgeColor = (role) => {
// // //     const r = role?.toLowerCase();
// // //     if (r === "admin") return "bg-red-100 text-red-800";
// // //     if (r === "employee") return "bg-green-100 text-green-800";
// // //     return "bg-gray-100 text-gray-800";
// // //   };

// // //   if (loading) return <Loading />;

// // //   return (
// // //     <div className="min-h-screen bg-white p-4 md:p-8" dir="rtl">
// // //       <div className="max-w-7xl mx-auto space-y-8">
        
// // //         {/* Header */}
// // //         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
// // //           <div className="flex items-center gap-3">
// // //             <div className="p-4 bg-red-700 rounded-2xl shadow-lg">
// // //               <Shield className="w-10 h-10 text-white" />
// // //             </div>
// // //             <div>
// // //               <h1 className="text-3xl font-bold text-red-700 leading-tight">
// // //                 {t("users_management")}
// // //               </h1>
// // //               <p className="text-gray-600 mt-1">{t("manage_users_permissions")}</p>
// // //             </div>
// // //           </div>
// // //           <div className="px-6 py-3 bg-red-700 rounded-xl shadow-lg text-white text-center min-w-[120px]">
// // //             <p className="text-sm">{t("total_users")}</p>
// // //             <p className="text-3xl font-bold">{users.length}</p>
// // //           </div>
// // //         </div>

// // //         {/* Form Card */}
// // //         <Card className="p-6 md:p-8 shadow-xl border-0 bg-white rounded-3xl ring-1 ring-gray-100">
// // //           <div className="flex items-center gap-3 mb-6">
// // //             <UserPlus className="w-6 h-6 text-red-700" />
// // //             <h2 className="text-2xl font-bold text-gray-800">{t("add_new_account")}</h2>
// // //           </div>

// // //           <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
// // //             {/* نوع الحساب */}
// // //             <div className="lg:col-span-3 space-y-2">
// // //               <label className="text-xs font-bold text-gray-500 mr-2">{t("account_type")}</label>
// // //               <Select
// // //                 value={newUser.role}
// // //                 onValueChange={(val) => setNewUser({ ...newUser, role: val })}
// // //               >
// // //                 <SelectTrigger className="border-gray-200 rounded-xl h-12 focus:ring-red-500">
// // //                   <SelectValue />
// // //                 </SelectTrigger>
// // //                 <SelectContent>
// // //                   <SelectItem value="user">{t("user_role")}</SelectItem>
// // //                   <SelectItem value="employee">{t("employee_role")}</SelectItem>
// // //                   <SelectItem value="admin">{t("admin_role")}</SelectItem>
// // //                 </SelectContent>
// // //               </Select>
// // //             </div>

// // //             {/* الحقول المتغيرة بناءً على النوع */}
// // //             {newUser.role === "employee" ? (
// // //               <>
// // //                 <div className="lg:col-span-3 space-y-2">
// // //                   <label className="text-xs font-bold text-gray-500 mr-2">{t("employee_username")}</label>
// // //                   <div className="relative">
// // //                     <User className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
// // //                     <Input
// // //                       placeholder="e.g. ahmad_staff"
// // //                       value={newUser.name}
// // //                       onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
// // //                       className="pr-10 border-gray-200 rounded-xl h-12"
// // //                     />
// // //                   </div>
// // //                 </div>
// // //                 <div className="lg:col-span-3 space-y-2">
// // //                   <label className="text-xs font-bold text-gray-500 mr-2">{t("password")}</label>
// // //                   <div className="relative">
// // //                     <Lock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
// // //                     <Input
// // //                       type="password"
// // //                       placeholder="••••••••"
// // //                       value={newUser.password}
// // //                       onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
// // //                       className="pr-10 border-gray-200 rounded-xl h-12"
// // //                     />
// // //                   </div>
// // //                 </div>
// // //               </>
// // //             ) : (
// // //               <div className="lg:col-span-6 space-y-2">
// // //                 <label className="text-xs font-bold text-gray-500 mr-2">{t("phone_number")}</label>
// // //                 <Input
// // //                   placeholder="07XXXXXXXX"
// // //                   value={newUser.phone}
// // //                   onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
// // //                   className="border-gray-200 rounded-xl h-12"
// // //                   maxLength={10}
// // //                 />
// // //               </div>
// // //             )}

// // //             {/* زر الإضافة */}
// // //             <div className="lg:col-span-3">
// // //               <Button
// // //                 onClick={handleAddUser}
// // //                 disabled={actionLoading}
// // //                 className="w-full h-12 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-all font-bold"
// // //               >
// // //                 {actionLoading ? <Loader2 className="animate-spin" /> : <UserPlus className="ml-2 w-5 h-5" />}
// // //                 {t("create_account")}
// // //               </Button>
// // //             </div>
// // //           </div>
// // //         </Card>

// // //         {/* Users List Controls */}
// // //         <div className="flex justify-between items-center border-b pb-4">
// // //           <h3 className="text-xl font-bold text-gray-700">{t("users_list")}</h3>
// // //           <Button
// // //             variant="ghost"
// // //             onClick={() => setShowUsers(!showUsers)}
// // //             className="text-red-700 hover:bg-red-50"
// // //           >
// // //             {showUsers ? t("hide_list") : t("show_list")}
// // //           </Button>
// // //         </div>

// // //         {showUsers && (
// // //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // //             {users.map((u) => (
// // //               <Card key={u._id} className="p-5 shadow-md rounded-2xl bg-white border-0 ring-1 ring-gray-100 hover:shadow-lg transition-shadow">
// // //                 <div className="flex items-start justify-between">
// // //                   <div className="flex items-center gap-3">
// // //                     <div className={`p-2 rounded-lg ${u.role === 'employee' ? 'bg-green-100' : 'bg-red-50'}`}>
// // //                       {u.role === 'employee' ? <UserCheck className="w-6 h-6 text-green-700" /> : <User className="w-6 h-6 text-red-700" />}
// // //                     </div>
// // //                     <div>
// // //                       <p className="font-bold text-gray-800">{u.name || u.phone}</p>
// // //                       <p className="text-xs text-gray-400">{u.role === 'employee' ? t('login_by_name') : t('login_by_phone')}</p>
// // //                     </div>
// // //                   </div>
// // //                   <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getRoleBadgeColor(u.role)}`}>
// // //                     {getRoleIcon(u.role)} {t(u.role)}
// // //                   </div>
// // //                 </div>

// // //                 <div className="mt-6 pt-4 border-t">
// // //                   {editUserId === u._id ? (
// // //                     <div className="flex gap-2">
// // //                       <Select value={editRole} onValueChange={setEditRole}>
// // //                         <SelectTrigger className="h-10 rounded-lg">
// // //                           <SelectValue />
// // //                         </SelectTrigger>
// // //                         <SelectContent>
// // //                           <SelectItem value="user">{t("user")}</SelectItem>
// // //                           <SelectItem value="employee">{t("employee")}</SelectItem>
// // //                           <SelectItem value="admin">{t("admin")}</SelectItem>
// // //                         </SelectContent>
// // //                       </Select>
// // //                       <Button size="sm" onClick={() => handleUpdateRole(u._id)} className="bg-red-700 rounded-lg">{t("save")}</Button>
// // //                       <Button size="sm" variant="ghost" onClick={() => setEditUserId(null)}>{t("cancel")}</Button>
// // //                     </div>
// // //                   ) : (
// // //                     <Button
// // //                       variant="outline"
// // //                       size="sm"
// // //                       onClick={() => { setEditUserId(u._id); setEditRole(u.role); }}
// // //                       className="w-full border-red-100 text-red-700 hover:bg-red-50 rounded-lg"
// // //                     >
// // //                       {t("edit_permissions")}
// // //                     </Button>
// // //                   )}
// // //                 </div>
// // //               </Card>
// // //             ))}
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default AdminUsersPage;

// // "use client";

// // import { useState, useEffect } from "react";
// // import axios from "axios";
// // import toast from "react-hot-toast";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Card } from "@/components/ui/card";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import {
// //   UserPlus,
// //   Shield,
// //   User,
// //   Loader2,
// //   Lock,
// //   UserCheck,
// //   Phone,
// //   Eye,
// //   EyeOff
// // } from "lucide-react";
// // import Loading from "@/components/common/Loading";
// // import { useUser } from "@/contexts/UserContext";
// // import { useTranslation } from "react-i18next";

// // const AdminUsersPage = () => {
// //   const [users, setUsers] = useState([]);
// //   const [showUsers, setShowUsers] = useState(true); // جعلتها true ليظهر المستخدمين مباشرة
// //   const [newUser, setNewUser] = useState({
// //     phone: "",
// //     name: "",
// //     password: "",
// //     role: "user",
// //   });
// //   const [editUserId, setEditUserId] = useState(null);
// //   const [editRole, setEditRole] = useState("user");
// //   const [loading, setLoading] = useState(false);
// //   const [actionLoading, setActionLoading] = useState(false);
// //   const [showPass, setShowPass] = useState(false);
  
// //   const { user } = useUser();
// //   const { t } = useTranslation();

// //   useEffect(() => {
// //     fetchUsers();
// //   }, []);

// //   const fetchUsers = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`, {
// //         headers: {
// //           authorization: `Bearer ${user?.token}`,
// //         },
// //       });
// //       // ترتيب المستخدمين: الأدمن أولاً ثم الموظفين ثم المستخدمين
// //       const sortedData = res.data.sort((a, b) => {
// //         const rolesOrder = { admin: 1, employee: 2, user: 3 };
// //         return rolesOrder[a.role] - rolesOrder[b.role];
// //       });
// //       setUsers(sortedData);
// //     } catch (err) {
// //       toast.error(t("failed_fetch_users"));
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleAddUser = async () => {
// //     if (newUser.role === "employee" || newUser.role === "admin") {
// //       if (!newUser.name || !newUser.password) {
// //         return toast.error(t("fill_name_and_password"));
// //       }
// //     } else {
// //       if (!newUser.phone) {
// //         return toast.error(t("fill_phone_field"));
// //       }
// //     }

// //     try {
// //       setActionLoading(true);
// //       // في نظامك، الموظف والأدمن يحتاجون مسار الـ create-employee لتشفير الباسورد
// //       const endpoint = (newUser.role === "employee" || newUser.role === "admin")
// //         ? `${import.meta.env.VITE_BASE_URL}/auth/create-employee`
// //         : `${import.meta.env.VITE_BASE_URL}/users`; // أو المسار الافتراضي عندك للمستخدمين

// //       await axios.post(endpoint, newUser, {
// //         headers: {
// //           authorization: `Bearer ${user.token}`,
// //         },
// //       });

// //       setNewUser({ phone: "", name: "", password: "", role: "user" });
// //       fetchUsers();
// //       toast.success(t("user_added_success"));
// //     } catch (err) {
// //       toast.error(err.response?.data?.message || t("user_add_failed"));
// //     } finally {
// //       setActionLoading(false);
// //     }
// //   };

// //   const handleUpdateRole = async (id) => {
// //     try {
// //       setActionLoading(true);
// //       await axios.put(
// //         `${import.meta.env.VITE_BASE_URL}/admin/user/${id}`,
// //         { role: editRole },
// //         {
// //           headers: {
// //             authorization: `Bearer ${user.token}`,
// //           },
// //         }
// //       );
// //       setEditUserId(null);
// //       fetchUsers();
// //       toast.success(t("role_updated_success"));
// //     } catch (err) {
// //       toast.error(t("role_update_failed"));
// //     } finally {
// //       setActionLoading(false);
// //     }
// //   };

// //   const getRoleIcon = (role) => {
// //     switch (role) {
// //       case "admin": return <Shield className="w-4 h-4" />;
// //       case "employee": return <UserCheck className="w-4 h-4" />;
// //       default: return <User className="w-4 h-4" />;
// //     }
// //   };

// //   if (loading) return <Loading />;

// //   return (
// //     <div className="min-h-screen bg-gray-50/50 p-4 md:p-8" dir="rtl">
// //       <div className="max-w-7xl mx-auto space-y-8">
        
// //         {/* Header */}
// //         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
// //           <div className="flex items-center gap-4">
// //             <div className="p-3 bg-red-600 rounded-2xl">
// //               <Shield className="w-8 h-8 text-white" />
// //             </div>
// //             <div>
// //               <h1 className="text-2xl font-black text-gray-900">{t("users_management")}</h1>
// //               <p className="text-gray-500 text-sm">{t("manage_users_permissions")}</p>
// //             </div>
// //           </div>
// //           <div className="bg-red-50 px-6 py-2 rounded-2xl border border-red-100">
// //             <span className="text-red-700 font-bold text-lg">{users.length}</span>
// //             <span className="text-red-600/70 text-sm mr-2">{t("total_users")}</span>
// //           </div>
// //         </div>

// //         {/* Add User Form */}
// //         <Card className="p-6 md:p-8 shadow-xl border-0 bg-white rounded-3xl">
// //           <div className="flex items-center gap-3 mb-8">
// //             <div className="w-1 bg-red-600 h-6 rounded-full" />
// //             <h2 className="text-xl font-bold text-gray-800">{t("add_new_account")}</h2>
// //           </div>

// //           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
// //             <div className="lg:col-span-3 space-y-2">
// //               <label className="text-sm font-bold text-gray-600 mr-1">{t("account_type")}</label>
// //               <Select
// //                 value={newUser.role}
// //                 onValueChange={(val) => setNewUser({ ...newUser, role: val })}
// //               >
// //                 <SelectTrigger className="bg-gray-50 border-none rounded-2xl h-14 font-semibold">
// //                   <SelectValue />
// //                 </SelectTrigger>
// //                 <SelectContent className="rounded-2xl">
// //                   <SelectItem value="user">{t("user_role")}</SelectItem>
// //                   <SelectItem value="employee">{t("employee_role")}</SelectItem>
// //                   <SelectItem value="admin">{t("admin_role")}</SelectItem>
// //                 </SelectContent>
// //               </Select>
// //             </div>

// //             {/* Input fields based on role */}
// //             {(newUser.role === "employee" || newUser.role === "admin") ? (
// //               <>
// //                 <div className="lg:col-span-3 space-y-2">
// //                   <label className="text-sm font-bold text-gray-600 mr-1">{t("username")}</label>
// //                   <div className="relative">
// //                     <User className="absolute right-4 top-4.5 w-5 h-5 text-gray-400" />
// //                     <Input
// //                       placeholder={t("username_placeholder")}
// //                       value={newUser.name}
// //                       onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
// //                       className="pr-12 bg-gray-50 border-none rounded-2xl h-14 font-semibold"
// //                     />
// //                   </div>
// //                 </div>
// //                 <div className="lg:col-span-3 space-y-2">
// //                   <label className="text-sm font-bold text-gray-600 mr-1">{t("password")}</label>
// //                   <div className="relative">
// //                     <Lock className="absolute right-4 top-4.5 w-5 h-5 text-gray-400" />
// //                     <Input
// //                       type={showPass ? "text" : "password"}
// //                       placeholder="••••••••"
// //                       value={newUser.password}
// //                       onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
// //                       className="pr-12 bg-gray-50 border-none rounded-2xl h-14 font-semibold"
// //                     />
// //                     <button 
// //                       onClick={() => setShowPass(!showPass)}
// //                       className="absolute left-4 top-4.5 text-gray-400"
// //                     >
// //                       {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
// //                     </button>
// //                   </div>
// //                 </div>
// //               </>
// //             ) : (
// //               <div className="lg:col-span-6 space-y-2">
// //                 <label className="text-sm font-bold text-gray-600 mr-1">{t("phone_number")}</label>
// //                 <div className="relative">
// //                   <Phone className="absolute right-4 top-4.5 w-5 h-5 text-gray-400" />
// //                   <Input
// //                     placeholder="07XXXXXXXX"
// //                     value={newUser.phone}
// //                     onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
// //                     className="pr-12 bg-gray-50 border-none rounded-2xl h-14 font-semibold"
// //                     maxLength={10}
// //                   />
// //                 </div>
// //               </div>
// //             )}

// //             <div className="lg:col-span-3">
// //               <Button
// //                 onClick={handleAddUser}
// //                 disabled={actionLoading}
// //                 className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-200 transition-all font-bold text-lg"
// //               >
// //                 {actionLoading ? <Loader2 className="animate-spin" /> : <UserPlus className="ml-2 w-5 h-5" />}
// //                 {t("create_account")}
// //               </Button>
// //             </div>
// //           </div>
// //         </Card>

// //         {/* Users List */}
// //         <div className="space-y-4">
// //           <div className="flex justify-between items-center px-2">
// //             <h3 className="text-xl font-black text-gray-800">{t("all_users")}</h3>
// //             <Button variant="ghost" onClick={() => setShowUsers(!showUsers)} className="text-red-600 font-bold">
// //               {showUsers ? t("hide_list") : t("show_list")}
// //             </Button>
// //           </div>

// //           {showUsers && (
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //               {users.map((u) => (
// //                 <Card key={u._id} className="p-6 rounded-3xl border-none shadow-sm bg-white hover:shadow-md transition-all group">
// //                   <div className="flex justify-between items-start mb-4">
// //                     <div className="flex items-center gap-3">
// //                       <div className={`p-3 rounded-2xl ${
// //                         u.role === 'admin' ? 'bg-red-50 text-red-600' : 
// //                         u.role === 'employee' ? 'bg-green-50 text-green-600' : 
// //                         'bg-blue-50 text-blue-600'
// //                       }`}>
// //                         {getRoleIcon(u.role)}
// //                       </div>
// //                       <div>
// //                         <p className="font-black text-gray-900 leading-none">
// //                           {u.username || u.phone || t("no_name")}
// //                         </p>
// //                         <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
// //                           {u.role}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="flex items-center justify-between pt-4 border-t border-gray-50">
// //                     {editUserId === u._id ? (
// //                       <div className="flex gap-2 w-full">
// //                         <Select value={editRole} onValueChange={setEditRole}>
// //                           <SelectTrigger className="h-10 rounded-xl bg-gray-50 border-none">
// //                             <SelectValue />
// //                           </SelectTrigger>
// //                           <SelectContent>
// //                             <SelectItem value="user">{t("user")}</SelectItem>
// //                             <SelectItem value="employee">{t("employee")}</SelectItem>
// //                             <SelectItem value="admin">{t("admin")}</SelectItem>
// //                           </SelectContent>
// //                         </Select>
// //                         <Button size="sm" onClick={() => handleUpdateRole(u._id)} className="bg-green-600 rounded-xl">{t("save")}</Button>
// //                         <Button size="sm" variant="ghost" onClick={() => setEditUserId(null)} className="rounded-xl">{t("cancel")}</Button>
// //                       </div>
// //                     ) : (
// //                       <Button
// //                         variant="secondary"
// //                         size="sm"
// //                         onClick={() => { setEditUserId(u._id); setEditRole(u.role); }}
// //                         className="w-full bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-colors"
// //                       >
// //                         {t("edit_permissions")}
// //                       </Button>
// //                     )}
// //                   </div>
// //                 </Card>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AdminUsersPage;

// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   UserPlus,
//   Shield,
//   User,
//   Loader2,
//   Lock,
//   UserCheck,
//   Phone,
//   Eye,
//   EyeOff
// } from "lucide-react";
// import Loading from "@/components/common/Loading";
// import { useUser } from "@/contexts/UserContext";
// import { useTranslation } from "react-i18next";

// const AdminUsersPage = () => {
//   const [users, setUsers] = useState([]);
//   // ✅ 1. الحالة الافتراضية دايماً false
//   const [showUsers, setShowUsers] = useState(false); 
//   const [newUser, setNewUser] = useState({
//     phone: "",
//     name: "",
//     password: "",
//     role: "user",
//   });
//   const [editUserId, setEditUserId] = useState(null);
//   const [editRole, setEditRole] = useState("user");
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [showPass, setShowPass] = useState(false);
  
//   const { user } = useUser();
//   const { t } = useTranslation();

//   // ✅ 2. مسحنا الـ fetchUsers من هون عشان ما تشتغل تلقائي أول ما تفتح الصفحة
//   useEffect(() => {
//     // الصفحة بتفتح فاضية ونظيفة
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`, {
//         headers: {
//           authorization: `Bearer ${user?.token}`,
//         },
//       });
//       const sortedData = res.data.sort((a, b) => {
//         const rolesOrder = { admin: 1, employee: 2, user: 3 };
//         return rolesOrder[a.role] - rolesOrder[b.role];
//       });
//       setUsers(sortedData);
//     } catch (err) {
//       toast.error(t("failed_fetch_users"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ 3. دالة التحكم بالزر (تجب البيانات وتظهرها)
//   const handleToggleList = () => {
//     if (!showUsers) {
//       fetchUsers(); // جلب البيانات فقط عند الحاجة
//     }
//     setShowUsers(!showUsers);
//   };

//   const handleAddUser = async () => {
//     if (newUser.role === "employee" || newUser.role === "admin") {
//       if (!newUser.name || !newUser.password) {
//         return toast.error(t("fill_name_and_password"));
//       }
//     } else {
//       if (!newUser.phone) {
//         return toast.error(t("fill_phone_field"));
//       }
//     }

//     try {
//       setActionLoading(true);
//       const endpoint = (newUser.role === "employee" || newUser.role === "admin")
//         ? `${import.meta.env.VITE_BASE_URL}/auth/create-employee`
//         : `${import.meta.env.VITE_BASE_URL}/users`;

//       await axios.post(endpoint, newUser, {
//         headers: {
//           authorization: `Bearer ${user.token}`,
//         },
//       });

//       setNewUser({ phone: "", name: "", password: "", role: "user" });
//       fetchUsers(); // تحديث القائمة بعد الإضافة
//       toast.success(t("user_added_success"));
//     } catch (err) {
//       toast.error(err.response?.data?.message || t("user_add_failed"));
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleUpdateRole = async (id) => {
//     try {
//       setActionLoading(true);
//       await axios.put(
//         `${import.meta.env.VITE_BASE_URL}/admin/user/${id}`,
//         { role: editRole },
//         {
//           headers: {
//             authorization: `Bearer ${user.token}`,
//           },
//         }
//       );
//       setEditUserId(null);
//       fetchUsers();
//       toast.success(t("role_updated_success"));
//     } catch (err) {
//       toast.error(t("role_update_failed"));
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const getRoleIcon = (role) => {
//     switch (role) {
//       case "admin": return <Shield className="w-4 h-4" />;
//       case "employee": return <UserCheck className="w-4 h-4" />;
//       default: return <User className="w-4 h-4" />;
//     }
//   };

//   // ✅ حذفنا شرط الـ if(loading) من هون عشان الهيدر والفورم يضلوا طالعين واللودينج يطلع بس مكان الجدول
  
//   return (
//     <div className="min-h-screen bg-gray-50/50 p-4 md:p-8" dir="rtl">
//       <div className="max-w-7xl mx-auto space-y-8">
        
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-red-600 rounded-2xl">
//               <Shield className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-black text-gray-900">{t("users_management")}</h1>
//               <p className="text-gray-500 text-sm">{t("manage_users_permissions")}</p>
//             </div>
//           </div>
//           <div className="bg-red-50 px-6 py-2 rounded-2xl border border-red-100">
//             <span className="text-red-700 font-bold text-lg">{users.length}</span>
//             <span className="text-red-600/70 text-sm mr-2">{t("total_users")}</span>
//           </div>
//         </div>

//         {/* Add User Form */}
//         <Card className="p-6 md:p-8 shadow-xl border-0 bg-white rounded-3xl">
//           <div className="flex items-center gap-3 mb-8">
//             <div className="w-1 bg-red-600 h-6 rounded-full" />
//             <h2 className="text-xl font-bold text-gray-800">{t("add_new_account")}</h2>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
//             {/* ... نفس كود الإدخال تبعك بدون تغيير ... */}
//             <div className="lg:col-span-3 space-y-2">
//               <label className="text-sm font-bold text-gray-600 mr-1">{t("account_type")}</label>
//               <Select
//                 value={newUser.role}
//                 onValueChange={(val) => setNewUser({ ...newUser, role: val })}
//               >
//                 <SelectTrigger className="bg-gray-50 border-none rounded-2xl h-14 font-semibold">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent className="rounded-2xl">
//                   <SelectItem value="user">{t("user_role")}</SelectItem>
//                   <SelectItem value="employee">{t("employee_role")}</SelectItem>
//                   <SelectItem value="admin">{t("admin_role")}</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {(newUser.role === "employee" || newUser.role === "admin") ? (
//               <>
//                 <div className="lg:col-span-3 space-y-2">
//                   <label className="text-sm font-bold text-gray-600 mr-1">{t("username")}</label>
//                   <div className="relative">
//                     <User className="absolute right-4 top-4.5 w-5 h-5 text-gray-400" />
//                     <Input
//                       placeholder={t("username_placeholder")}
//                       value={newUser.name}
//                       onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
//                       className="pr-12 bg-gray-50 border-none rounded-2xl h-14 font-semibold"
//                     />
//                   </div>
//                 </div>
//                 <div className="lg:col-span-3 space-y-2">
//                   <label className="text-sm font-bold text-gray-600 mr-1">{t("password")}</label>
//                   <div className="relative">
//                     <Lock className="absolute right-4 top-4.5 w-5 h-5 text-gray-400" />
//                     <Input
//                       type={showPass ? "text" : "password"}
//                       placeholder="••••••••"
//                       value={newUser.password}
//                       onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
//                       className="pr-12 bg-gray-50 border-none rounded-2xl h-14 font-semibold"
//                     />
//                     <button 
//                       type="button"
//                       onClick={() => setShowPass(!showPass)}
//                       className="absolute left-4 top-4.5 text-gray-400"
//                     >
//                       {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
//                     </button>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="lg:col-span-6 space-y-2">
//                 <label className="text-sm font-bold text-gray-600 mr-1">{t("phone_number")}</label>
//                 <div className="relative">
//                   <Phone className="absolute right-4 top-4.5 w-5 h-5 text-gray-400" />
//                   <Input
//                     placeholder="07XXXXXXXX"
//                     value={newUser.phone}
//                     onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
//                     className="pr-12 bg-gray-50 border-none rounded-2xl h-14 font-semibold"
//                     maxLength={10}
//                   />
//                 </div>
//               </div>
//             )}

//             <div className="lg:col-span-3">
//               <Button
//                 onClick={handleAddUser}
//                 disabled={actionLoading}
//                 className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-200 transition-all font-bold text-lg"
//               >
//                 {actionLoading ? <Loader2 className="animate-spin" /> : <UserPlus className="ml-2 w-5 h-5" />}
//                 {t("create_account")}
//               </Button>
//             </div>
//           </div>
//         </Card>

//         {/* Users List */}
//         <div className="space-y-4">
//           <div className="flex justify-between items-center px-2">
//             <h3 className="text-xl font-black text-gray-800">{t("all_users")}</h3>
//             {/* ✅ 4. تعديل الزر لاستدعاء دالة الـ Toggle الذكية */}
//             <Button variant="ghost" onClick={handleToggleList} className="text-red-600 font-bold">
//               {showUsers ? t("hide_list") : t("show_list")}
//             </Button>
//           </div>

//           {/* ✅ 5. عرض اللودينج فقط داخل منطقة القائمة */}
//           {loading && <div className="flex justify-center p-12"><Loader2 className="animate-spin text-red-600 w-10 h-10" /></div>}

//           {showUsers && !loading && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
//               {users.map((u) => (
//                 <Card key={u._id} className="p-6 rounded-3xl border-none shadow-sm bg-white hover:shadow-md transition-all group">
//                   {/* ... كود الكرت تبعك كما هو ... */}
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className={`p-3 rounded-2xl ${
//                         u.role === 'admin' ? 'bg-red-50 text-red-600' : 
//                         u.role === 'employee' ? 'bg-green-50 text-green-600' : 
//                         'bg-blue-50 text-blue-600'
//                       }`}>
//                         {getRoleIcon(u.role)}
//                       </div>
//                       <div>
//                         <p className="font-black text-gray-900 leading-none">
//                           {u.username || u.phone || t("no_name")}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
//                           {u.role}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between pt-4 border-t border-gray-50">
//                     {editUserId === u._id ? (
//                       <div className="flex gap-2 w-full">
//                         <Select value={editRole} onValueChange={setEditRole}>
//                           <SelectTrigger className="h-10 rounded-xl bg-gray-50 border-none">
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="user">{t("user")}</SelectItem>
//                             <SelectItem value="employee">{t("employee")}</SelectItem>
//                             <SelectItem value="admin">{t("admin")}</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <Button size="sm" onClick={() => handleUpdateRole(u._id)} className="bg-green-600 rounded-xl">{t("save")}</Button>
//                         <Button size="sm" variant="ghost" onClick={() => setEditUserId(null)} className="rounded-xl">{t("cancel")}</Button>
//                       </div>
//                     ) : (
//                       <Button
//                         variant="secondary"
//                         size="sm"
//                         onClick={() => { setEditUserId(u._id); setEditRole(u.role); }}
//                         className="w-full bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-colors"
//                       >
//                         {t("edit_permissions")}
//                       </Button>
//                     )}
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminUsersPage;


"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Shield,
  User,
  Loader2,
  Lock,
  UserCheck,
  Eye,
  EyeOff
} from "lucide-react";
import Loading from "@/components/common/Loading";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(true);
  const [newUser, setNewUser] = useState({
    phone: "",
    name: "",
    password: "",
    role: "user",
  });
  const [editUserId, setEditUserId] = useState(null);
  const [editRole, setEditRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  const { user } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`, {
        headers: {
          authorization: `Bearer ${user?.token}`,
        },
      });
      const sortedData = res.data.sort((a, b) => {
        const rolesOrder = { admin: 1, employee: 2, user: 3 };
        return rolesOrder[a.role] - rolesOrder[b.role];
      });
      setUsers(sortedData);
    } catch (err) {
      toast.error(t("failed_fetch_users"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (newUser.role === "employee" || newUser.role === "admin") {
      if (!newUser.name || !newUser.password) {
        return toast.error(t("fill_name_and_password"));
      }
    } else {
      if (!newUser.phone) {
        return toast.error(t("fill_phone_field"));
      }
    }

    try {
      setActionLoading(true);
      const endpoint = (newUser.role === "employee" || newUser.role === "admin")
        ? `${import.meta.env.VITE_BASE_URL}/auth/create-employee`
        : `${import.meta.env.VITE_BASE_URL}/admin/user/add`;

      await axios.post(endpoint, newUser, {
        headers: {
          authorization: `Bearer ${user.token}`,
        },
      });

      setNewUser({ phone: "", name: "", password: "", role: "user" });
      fetchUsers();
      toast.success(t("user_added_success"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("user_add_failed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (id) => {
    try {
      setActionLoading(true);
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/admin/user/${id}`,
        { role: editRole },
        {
          headers: {
            authorization: `Bearer ${user.token}`,
          },
        }
      );
      setEditUserId(null);
      fetchUsers();
      toast.success(t("role_updated_success"));
    } catch (err) {
      toast.error(t("role_update_failed"));
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin": return <Shield className="w-4 h-4" />;
      case "employee": return <UserCheck className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600 rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{t("users_management")}</h1>
              <p className="text-gray-500 text-sm">{t("manage_users_permissions")}</p>
            </div>
          </div>
          <div className="bg-red-50 px-6 py-2 rounded-2xl border border-red-100">
            <span className="text-red-700 font-bold text-lg">{users.length}</span>
            <span className="text-red-600/70 text-sm mr-2">{t("total_users")}</span>
          </div>
        </div>

        {/* Add User Form */}
        <Card className="p-6 md:p-8 shadow-xl border-0 bg-white rounded-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 bg-red-600 h-6 rounded-full" />
            <h2 className="text-xl font-bold text-gray-800">{t("add_new_account")}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-3 space-y-2">
              <label className="text-sm font-bold text-gray-600 mr-1">{t("account_type")}</label>
              <Select
                value={newUser.role}
                onValueChange={(val) => setNewUser({ ...newUser, role: val })}
              >
                <SelectTrigger className="border-gray-200 rounded-xl h-12">
                  <SelectValue placeholder={t("select_role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{t("user_role")}</SelectItem>
                  <SelectItem value="employee">{t("employee_role")}</SelectItem>
                  <SelectItem value="admin">{t("admin_role")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Fields */}
            {(newUser.role === "employee" || newUser.role === "admin") ? (
              <>
                <div className="lg:col-span-3 space-y-2">
                  <label className="text-sm font-bold text-gray-600 mr-1">{t("username")}</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder={t("username_placeholder")}
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="pr-10 border-gray-200 rounded-xl h-12"
                    />
                  </div>
                </div>
                <div className="lg:col-span-3 space-y-2">
                  <label className="text-sm font-bold text-gray-600 mr-1">{t("password")}</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="pr-10 border-gray-200 rounded-xl h-12"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-3.5 text-gray-400 hover:text-red-600"
                    >
                      {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="lg:col-span-6 space-y-2">
                <label className="text-sm font-bold text-gray-600 mr-1">{t("phone_number")}</label>
                <Input
                  placeholder="07XXXXXXXX"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="border-gray-200 rounded-xl h-12"
                  maxLength={10}
                />
              </div>
            )}

            <div className="lg:col-span-3">
              <Button
                onClick={handleAddUser}
                disabled={actionLoading}
                className="w-full h-12 bg-red-700 text-white rounded-xl hover:bg-red-800 font-bold"
              >
                {actionLoading ? <Loader2 className="animate-spin" /> : <UserPlus className="ml-2 w-5 h-5" />}
                {t("create_account")}
              </Button>
            </div>
          </div>
        </Card>

        {/* Users List Area */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-800">{t("users_list")}</h3>
          <Button
            variant="ghost"
            onClick={() => setShowUsers(!showUsers)}
            className="text-red-700 hover:bg-red-50"
          >
            {showUsers ? t("hide_list") : t("show_list")}
          </Button>
        </div>

        {showUsers && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <Card key={u._id} className="p-5 shadow-sm hover:shadow-md transition-all bg-white border border-gray-100 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${u.role === 'admin' ? 'bg-red-100' : u.role === 'employee' ? 'bg-green-100' : 'bg-blue-50'}`}>
                      {u.role === 'admin' ? <Shield className="text-red-700" /> : u.role === 'employee' ? <UserCheck className="text-green-700" /> : <User className="text-blue-700" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{u.name || u.phone}</p>
                      <p className="text-xs text-gray-400">{u.role === 'user' ? t('login_by_phone') : t('login_by_username')}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                    u.role === 'admin' ? 'border-red-200 bg-red-50 text-red-700' : 
                    u.role === 'employee' ? 'border-green-200 bg-green-50 text-green-700' : 
                    'border-gray-200 bg-gray-50 text-gray-600'
                  }`}>
                    {t(u.role)}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50">
                  {editUserId === u._id ? (
                    <div className="flex gap-2">
                      <Select value={editRole} onValueChange={setEditRole}>
                        <SelectTrigger className="h-9 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">{t("user_role")}</SelectItem>
                          <SelectItem value="employee">{t("employee_role")}</SelectItem>
                          <SelectItem value="admin">{t("admin_role")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => handleUpdateRole(u._id)} className="bg-red-700">{t("save")}</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditUserId(null)}>{t("cancel")}</Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditUserId(u._id); setEditRole(u.role); }}
                      className="w-full border-gray-100 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    >
                      {t("edit_permissions")}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;