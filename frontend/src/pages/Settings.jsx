// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useState } from "react";
// import { User, Phone, Palette, Trash2, AlertCircle } from "lucide-react";
// import Loading from "@/componenet/common/Loading";
// import LanguageSwitcher from "@/componenet/LanguageSwitcher";
// import { useUser } from "@/contexts/UserContext";
// import { useNavigate } from "react-router-dom";

// function Settings() {
//   const { user, updatePhone } = useUser();
//   const [phone, setPhone] = useState(user?.phone || "");
//   const [otp, setOtp] = useState("");
//   const navigate = useNavigate();

//   const handlePhoneChange = (value) => {
//     setPhone(value);
//   };

//   const handlePhoneUpdate = async () => {
//     try {
//       await updatePhone(phone, navigate);
//     } catch (error) {
//       console.error("Failed to update phone number:", error);
//       alert("Failed to update phone number");
//     }
//   };

//   const handleOtpChange = (value) => {
//     setOtp(value);
//   };

//   if (!user) return <Loading />;

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8 md:py-12">
//         {/* Header Section */}
//         <div className="mb-6 sm:mb-8">
//           <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
//             Settings
//           </h1>
//           <p className="text-sm sm:text-base text-muted-foreground">
//             Manage your account settings and preferences
//           </p>
//         </div>

//         <div className="space-y-6">
//           {/* Profile Section */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
//                 <User className="size-5" />
//                 Profile Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Avatar Upload */}

//               {/* Phone Field */}
//               <div className="space-y-2">
//                 <Label htmlFor="phone" className="flex items-center gap-2">
//                   <Phone className="size-4" />
//                   Phone Number
//                 </Label>
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <Input
//                     id="phone"
//                     type="tel"
//                     value={phone}
//                     onChange={(e) => handlePhoneChange(e.target.value)}
//                     maxLength={10}
//                     placeholder="Enter phone number"
//                     className="flex-1 tracking-[0.1em]"
//                   />
//                   <Button
//                     disabled={user.phone === phone || phone.length < 10}
//                     className="w-full sm:w-auto"
//                     onClick={() => handlePhoneUpdate()}
//                   >
//                     Update Phone
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Preferences Section */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
//                 <Palette className="size-5" />
//                 Preferences
//               </CardTitle>
//               <CardDescription>Customize your app experience</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {/* Language Switcher */}
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
//                 <div className="space-y-0.5">
//                   <Label className="text-sm font-medium">
//                     Preferred Language
//                   </Label>
//                   <p className="text-xs text-muted-foreground">
//                     Choose your display language
//                   </p>
//                 </div>
//                 <LanguageSwitcher />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Danger Zone */}
//           <Card className="border-destructive/50">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-destructive">
//                 <Trash2 className="size-5" />
//                 Danger Zone
//               </CardTitle>
//               <CardDescription>
//                 Irreversible actions for your account
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/30 rounded-lg bg-destructive/5">
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium">Delete Account</p>
//                   <p className="text-xs text-muted-foreground">
//                     Permanently delete your account and all associated data
//                   </p>
//                 </div>
//                 <Button
//                   variant="destructive"
//                   className="w-full sm:w-auto gap-2"
//                 >
//                   <AlertCircle className="size-4" />
//                   Delete Account
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Save Changes Footer */}
//         <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
//           <Button variant="outline" className="w-full sm:w-auto bg-transparent">
//             Cancel
//           </Button>
//           <Button className="w-full sm:w-auto">Save All Changes</Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Settings;
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
import { useState } from "react";
import { User, Phone, Palette, Trash2, AlertCircle } from "lucide-react";
import Loading from "@/componenet/common/Loading";
import LanguageSwitcher from "@/componenet/LanguageSwitcher";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Settings() {
  const { user, updatePhone } = useUser();
  const [phone, setPhone] = useState(user?.phone || "");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  const handleOtpChange = (value) => {
    setOtp(value);
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
                    value={phone}
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

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
             <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-destructive">
  <Trash2 className="size-5" />
  {t("danger_zone")}
</CardTitle>

              <CardDescription>{t("irreversible_actions")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t("delete_account")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("delete_account_desc")}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto gap-2"
                >
                  <AlertCircle className="size-4" />
                  {t("delete_account")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Changes Footer */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
          <Button variant="outline" className="w-full sm:w-auto bg-transparent">
            {t("cancel")}
          </Button>
          <Button className="w-full sm:w-auto">{t("save_changes")}</Button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
