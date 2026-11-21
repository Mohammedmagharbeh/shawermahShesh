import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { User, Phone, Palette, Percent, Bike, Check } from "lucide-react";
import Loading from "@/components/common/Loading";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useUser } from "@/contexts/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import deliveryService from "@/services/deliveryService";
import toast from "react-hot-toast";

function Settings() {
  const { user, updatePhone } = useUser();
  const [phone, setPhone] = useState(user?.phone || "");
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Admin Delivery Commission State
  const isAdmin = user?.role === "admin";
  const [driverSharePercentage, setDriverSharePercentage] = useState(75);
  const [initialDriverShare, setInitialDriverShare] = useState(75);
  const [savingCommission, setSavingCommission] = useState(false);

  useEffect(() => {
    if (isAdmin && user?.token) {
      deliveryService
        .getSettings(user.token)
        .then((res) => {
          if (res?.settings?.driverSharePercentage !== undefined) {
            setDriverSharePercentage(res.settings.driverSharePercentage);
            setInitialDriverShare(res.settings.driverSharePercentage);
          }
        })
        .catch((err) => {
          console.error("Failed to load delivery settings:", err);
        });
    }
  }, [isAdmin, user?.token]);

  const handleUpdateCommission = async () => {
    const val = parseFloat(driverSharePercentage);
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error("يرجى إدخال نسبة صحيحة بين 0 و 100");
      return;
    }

    setSavingCommission(true);
    try {
      await deliveryService.updateSettings(
        { driverSharePercentage: val },
        user.token
      );
      setInitialDriverShare(val);
      toast.success(`تم تحديث نسبة السائق إلى ${val}% وحصة المطعم إلى ${(100 - val).toFixed(1)}% بنجاح`);
    } catch (err) {
      console.error("Failed to update commission:", err);
      toast.error("فشل حفظ إعدادات العمولة");
    } finally {
      setSavingCommission(false);
    }
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
  };

  const handlePhoneUpdate = async () => {
    try {
      await updatePhone(phone, navigate);
    } catch (error) {
      console.error("Failed to update phone number:", error);
      alert(t("update_phone_failed"));
    }
  };

  if (!user) return <Loading />;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t("settings")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("manage_settings")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="size-5" />
                {t("profile_information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="size-4" />
                  {t("phone_number")}
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={phone || user.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={10}
                    placeholder={t("enter_phone")}
                    className="flex-1 tracking-[0.1em]"
                  />
                  <Button
                    disabled={user.phone === phone || phone.length < 10}
                    className="w-full sm:w-auto"
                    onClick={() => handlePhoneUpdate()}
                  >
                    {t("update_phone")}
                  </Button>
                </div>
                <Link
                  className="w-full mt-5 bg-red-700 text-white p-2 rounded-md flex items-center justify-center gap-2 hover:bg-red-800 transition-colors"
                  to={`/orders/${user._id}`}
                >
                  {t("my past order")}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Palette className="size-5" />
                {t("preferences")}
              </CardTitle>
              <CardDescription>{t("customize_app")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    {t("preferred_language")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("choose_language")}
                  </p>
                </div>
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>

          {/* Admin Delivery Commission Settings */}
          {isAdmin && (
            <Card className="border-amber-200 bg-amber-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-amber-900">
                  <Percent className="size-5 text-amber-600" />
                  إعدادات عمولة التوصيل للسائقين (Admin)
                </CardTitle>
                <CardDescription>
                  تحديد النسبة المئوية لأجرة التوصيل المستحقة للسائق مقابل حصة المطعم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-2">
                    <Label htmlFor="driverShare" className="flex items-center gap-2 font-bold text-gray-700">
                      <Bike className="size-4 text-emerald-600" />
                      نسبة عمولة السائق (%)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="driverShare"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={driverSharePercentage}
                        onChange={(e) => setDriverSharePercentage(e.target.value)}
                        className="bg-white font-mono font-bold text-base"
                        placeholder="75"
                      />
                      <span className="text-sm font-bold text-gray-500">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">
                      حصة المطعم المحسوبة تلقائياً (%)
                    </Label>
                    <div className="bg-white rounded-xl border border-gray-200 p-2.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700">حصة المطعم:</span>
                      <span className="font-mono font-black text-blue-900 text-lg">
                        {Math.max(
                          0,
                          Math.min(100, (100 - (parseFloat(driverSharePercentage) || 0)).toFixed(1))
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={handleUpdateCommission}
                    disabled={
                      savingCommission ||
                      parseFloat(driverSharePercentage) === initialDriverShare
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
                  >
                    {savingCommission ? "جاري الحفظ..." : "حفظ إعدادات العمولة"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
