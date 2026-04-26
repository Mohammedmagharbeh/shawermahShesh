


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
//   Eye,
//   EyeOff
// } from "lucide-react";
// import Loading from "@/components/common/Loading";
// import { useUser } from "@/contexts/UserContext";
// import { useTranslation } from "react-i18next";

// const AdminUsersPage = () => {
//   const [users, setUsers] = useState([]);
//   const [showUsers, setShowUsers] = useState(true);
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

//   useEffect(() => {
//     fetchUsers();
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
//         : `${import.meta.env.VITE_BASE_URL}/admin/user/add`;

//       await axios.post(endpoint, newUser, {
//         headers: {
//           authorization: `Bearer ${user.token}`,
//         },
//       });

//       setNewUser({ phone: "", name: "", password: "", role: "user" });
//       fetchUsers();
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

//   if (loading) return <Loading />;

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
//             <div className="lg:col-span-3 space-y-2">
//               <label className="text-sm font-bold text-gray-600 mr-1">{t("account_type")}</label>
//               <Select
//                 value={newUser.role}
//                 onValueChange={(val) => setNewUser({ ...newUser, role: val })}
//               >
//                 <SelectTrigger className="border-gray-200 rounded-xl h-12">
//                   <SelectValue placeholder={t("select_role")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="user">{t("user_role")}</SelectItem>
//                   <SelectItem value="employee">{t("employee_role")}</SelectItem>
//                   <SelectItem value="admin">{t("admin_role")}</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Dynamic Fields */}
//             {(newUser.role === "employee" || newUser.role === "admin") ? (
//               <>
//                 <div className="lg:col-span-3 space-y-2">
//                   <label className="text-sm font-bold text-gray-600 mr-1">{t("username")}</label>
//                   <div className="relative">
//                     <User className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
//                     <Input
//                       placeholder={t("username_placeholder")}
//                       value={newUser.name}
//                       onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
//                       className="pr-10 border-gray-200 rounded-xl h-12"
//                     />
//                   </div>
//                 </div>
//                 <div className="lg:col-span-3 space-y-2">
//                   <label className="text-sm font-bold text-gray-600 mr-1">{t("password")}</label>
//                   <div className="relative">
//                     <Lock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
//                     <Input
//                       type={showPass ? "text" : "password"}
//                       placeholder="••••••••"
//                       value={newUser.password}
//                       onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
//                       className="pr-10 border-gray-200 rounded-xl h-12"
//                     />
//                     <button 
//                       type="button"
//                       onClick={() => setShowPass(!showPass)}
//                       className="absolute left-3 top-3.5 text-gray-400 hover:text-red-600"
//                     >
//                       {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
//                     </button>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="lg:col-span-6 space-y-2">
//                 <label className="text-sm font-bold text-gray-600 mr-1">{t("phone_number")}</label>
//                 <Input
//                   placeholder="07XXXXXXXX"
//                   value={newUser.phone}
//                   onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
//                   className="border-gray-200 rounded-xl h-12"
//                   maxLength={10}
//                 />
//               </div>
//             )}

//             <div className="lg:col-span-3">
//               <Button
//                 onClick={handleAddUser}
//                 disabled={actionLoading}
//                 className="w-full h-12 bg-red-700 text-white rounded-xl hover:bg-red-800 font-bold"
//               >
//                 {actionLoading ? <Loader2 className="animate-spin" /> : <UserPlus className="ml-2 w-5 h-5" />}
//                 {t("create_account")}
//               </Button>
//             </div>
//           </div>
//         </Card>

//         {/* Users List Area */}
//         <div className="flex justify-between items-center border-b border-gray-200 pb-4">
//           <h3 className="text-xl font-bold text-gray-800">{t("users_list")}</h3>
//           <Button
//             variant="ghost"
//             onClick={() => setShowUsers(!showUsers)}
//             className="text-red-700 hover:bg-red-50"
//           >
//             {showUsers ? t("hide_list") : t("show_list")}
//           </Button>
//         </div>

//         {showUsers && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {users.map((u) => (
//               <Card key={u._id} className="p-5 shadow-sm hover:shadow-md transition-all bg-white border border-gray-100 rounded-2xl">
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className={`p-2 rounded-xl ${u.role === 'admin' ? 'bg-red-100' : u.role === 'employee' ? 'bg-green-100' : 'bg-blue-50'}`}>
//                       {u.role === 'admin' ? <Shield className="text-red-700" /> : u.role === 'employee' ? <UserCheck className="text-green-700" /> : <User className="text-blue-700" />}
//                     </div>
//                     <div>
//                       <p className="font-bold text-gray-900">{u.name || u.phone}</p>
//                       <p className="text-xs text-gray-400">{u.role === 'user' ? t('login_by_phone') : t('login_by_username')}</p>
//                     </div>
//                   </div>
//                   <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
//                     u.role === 'admin' ? 'border-red-200 bg-red-50 text-red-700' : 
//                     u.role === 'employee' ? 'border-green-200 bg-green-50 text-green-700' : 
//                     'border-gray-200 bg-gray-50 text-gray-600'
//                   }`}>
//                     {t(u.role)}
//                   </div>
//                 </div>

//                 <div className="mt-6 pt-4 border-t border-gray-50">
//                   {editUserId === u._id ? (
//                     <div className="flex gap-2">
//                       <Select value={editRole} onValueChange={setEditRole}>
//                         <SelectTrigger className="h-9 rounded-lg">
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="user">{t("user_role")}</SelectItem>
//                           <SelectItem value="employee">{t("employee_role")}</SelectItem>
//                           <SelectItem value="admin">{t("admin_role")}</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <Button size="sm" onClick={() => handleUpdateRole(u._id)} className="bg-red-700">{t("save")}</Button>
//                       <Button size="sm" variant="outline" onClick={() => setEditUserId(null)}>{t("cancel")}</Button>
//                     </div>
//                   ) : (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => { setEditUserId(u._id); setEditRole(u.role); }}
//                       className="w-full border-gray-100 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
//                     >
//                       {t("edit_permissions")}
//                     </Button>
//                   )}
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}
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
  EyeOff,
  Phone
} from "lucide-react";
import Loading from "@/components/common/Loading";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(true);
  const [newUser, setNewUser] = useState({
    phone: "",
    name: "", // هذا الحقل سيُرسل كـ username في حالة الموظف
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
      // تجهيز البيانات: إذا كان موظف نرسل name كـ username للباك اند
      const payload = { ...newUser };
      if (newUser.role !== "user") {
        payload.username = newUser.name; 
      }

      const endpoint = (newUser.role === "employee" || newUser.role === "admin")
        ? `${import.meta.env.VITE_BASE_URL}/auth/create-employee`
        : `${import.meta.env.VITE_BASE_URL}/admin/user/add`;

      await axios.post(endpoint, payload, {
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

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-100">
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
              <Card key={u._id} className="p-5 shadow-sm hover:shadow-lg transition-all bg-white border border-gray-100 rounded-2xl group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl transition-colors ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700' : 
                      u.role === 'employee' ? 'bg-green-100 text-green-700' : 
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {u.role === 'admin' ? <Shield size={24} /> : u.role === 'employee' ? <UserCheck size={24} /> : <User size={24} />}
                    </div>
                    <div>
                      {/* ✅ التعديل هنا: الأولوية لـ username ثم name ثم phone */}
                      <p className="font-black text-gray-900 text-lg leading-tight">
                        {u.username || u.name || u.phone}
                      </p>
                      
                      {/* عرض رقم الهاتف بخط صغير إذا كان المستخدم موظف/أدمن وله رقم مخزن */}
                      {(u.username || u.name) && u.phone && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Phone size={10} /> {u.phone}
                        </p>
                      )}
                      
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">
                        {u.role === 'user' ? t('login_by_phone') : t('login_by_username')}
                      </p>
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
                      className="w-full border-gray-100 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-xl font-bold transition-all"
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