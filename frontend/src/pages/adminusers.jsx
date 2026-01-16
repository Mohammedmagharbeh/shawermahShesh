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
  Edit2,
  Save,
  X,
  Shield,
  Crown,
  User,
  Phone,
  Loader2,
} from "lucide-react";
import Loading from "@/componenet/common/Loading";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [newUser, setNewUser] = useState({
    phone: "",
    role: "user",
  });
  const [editUserId, setEditUserId] = useState(null);
  const [editRole, setEditRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useUser();
  const { t } = useTranslation();

  // نجيب المستخدمين مرة واحدة عند تحميل الصفحة ليظهر عددهم دائمًا
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user?.token}`,
        },
      });
      const data = res.data.sort((a, b) => a.role.localeCompare(b.role));
      setUsers(data);
    } catch (err) {
      console.error("خطأ في جلب المستخدمين:", err);
      toast.error(t("failed_fetch_users"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.phone) {
      toast.error(t("fill_all_fields"));
      return;
    }
    try {
      setActionLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/user/add`,
        newUser,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        }
      );
      setNewUser({ phone: "", role: "user" });
      fetchUsers();
      toast.success(t("user_added_success"));
    } catch (err) {
      console.error("خطأ في إضافة المستخدم:", err);
      // toast.error("فشل في إضافة المستخدم");
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
        {
          role: editRole,
        },
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        }
      );
      setEditUserId(null);
      fetchUsers();
      toast.success(t("role_updated_success"));
    } catch (err) {
      console.error("خطأ في تعديل الرول:", err);
      toast.error(t("role_update_failed"));
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "manager":
        return <Crown className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  // كل البادجات باللون الأحمر
  const getRoleBadgeColor = (role) => {
    role = role.toLowerCase();
    if (role === "admin") return "bg-red-100 text-red-800";
    if (role === "employee") return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-gray-800";
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 pt-18!" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-4 bg-red-700 rounded-2xl shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-red-700 leading-tight">
                {t("users_management")}
              </h1>
              <p className="text-gray-600 mt-1">
                {t("manage_users_permissions")}
              </p>
            </div>
          </div>
          <div className="px-6 py-3 bg-red-700 rounded-xl shadow-lg text-white text-center">
            <p className="text-sm">{t("total_users")}</p>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
        </div>

        {/* Add User Form */}
        <Card className="p-6 md:p-8 shadow-lg border-0 bg-white rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-6 h-6 text-red-700" />
            <h2 className="text-2xl font-bold text-gray-800">
              {t("add_new_user")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                type="text"
                placeholder={t("phone_placeholder")}
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
                className="border border-gray-300 rounded-xl h-12"
                maxLength={10}
              />
            </div>
            <div>
              <Select
                value={newUser.role}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger className="border border-gray-300 rounded-xl h-12">
                  <SelectValue placeholder={t("select_role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{t("user_role")}</SelectItem>
                  <SelectItem value="admin">{t("admin_role")}</SelectItem>
                  <SelectItem value="employee">{t("employee_role")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                onClick={handleAddUser}
                disabled={actionLoading}
                className="w-full h-12 bg-red-700 text-white rounded-xl hover:bg-red-800"
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <UserPlus className="w-5 h-5 ml-2" />
                )}
                {t("add_user")}
              </Button>
            </div>
          </div>
        </Card>

        {/* Show/Hide Users Button */}
        <Button
          onClick={() => setShowUsers(!showUsers)}
          className="bg-red-700 text-white rounded-xl px-4 py-2 hover:bg-red-800"
        >
          {showUsers ? t("hide_users") : t("show_users")}
        </Button>

        {/* Users List */}
        {showUsers && users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card
                key={user._id}
                className="p-4 shadow-lg rounded-xl bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-red-700" />
                    <div>
                      <p className="text-sm text-gray-600">{user.phone}</p>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-xl ${getRoleBadgeColor(user.role)} text-sm flex items-center gap-1`}
                  >
                    {getRoleIcon(user.role)} {user.role}
                  </div>
                </div>

                <div className="mt-3">
                  {editUserId === user._id ? (
                    <div className="flex gap-2">
                      <Select value={editRole} onValueChange={setEditRole}>
                        <SelectTrigger className="border border-gray-300 rounded-xl h-10">
                          <SelectValue placeholder={t("select_role")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">{t("user_role")}</SelectItem>
                          <SelectItem value="admin">
                            {t("admin_role")}
                          </SelectItem>
                          <SelectItem value="employee">
                            {t("employee_role")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleUpdateRole(user._id)}
                        disabled={actionLoading}
                        className="bg-red-700 text-white rounded-xl px-3"
                      >
                        {t("save_changes")}
                      </Button>
                      <Button
                        onClick={() => setEditUserId(null)}
                        variant="outline"
                        className="border border-gray-300 rounded-xl px-3"
                      >
                        {t("cancel")}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setEditUserId(user._id);
                        setEditRole(user.role);
                      }}
                      variant="outline"
                      className="border border-red-700 text-red-700 rounded-xl px-3"
                    >
                      {t("edit_role")}
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
