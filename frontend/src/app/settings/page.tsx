"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  User, 
  Bell, 
  Shield, 
  Sliders, 
  Loader2, 
  Check, 
  Lock, 
  Mail, 
  MapPin, 
  Phone,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SettingsPage() {
  const { token, user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "notifications" | "security">("profile");

  // Profile Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+92 300 1234567");
  const [city, setCity] = useState("Lahore");

  // Preference States
  const [areaUnit, setAreaUnit] = useState("Marla");
  const [currency, setCurrency] = useState("PKR");

  // Notification States
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      if (user.email) {
        setEmail(user.email);
        // Extract default name from email if not set
        const defaultName = user.email.split("@")[0].replace(/[._]/g, " ");
        setName((prev) => prev || (defaultName.charAt(0).toUpperCase() + defaultName.slice(1)));
      }
    }
  }, [isAuthenticated, router, user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile settings updated successfully!");
    }, 600);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Preferences updated successfully!");
    }, 600);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Notification preferences saved!");
    }, 600);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    }, 800);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Manage your account preferences, profile details, and security configuration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1 space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "profile"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <User size={18} /> Profile Details
            </button>
            
            <button
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "preferences"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <Sliders size={18} /> Preferences
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "notifications"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <Bell size={18} /> Notifications
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "security"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <Shield size={18} /> Security & Password
            </button>
          </div>

          {/* Settings Main Content Area */}
          <div className="md:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="border-0 shadow-sm bg-white rounded-2xl">
                <CardHeader className="p-6 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900">Profile Information</CardTitle>
                  <CardDescription className="text-slate-500">
                    Update your public profile and contact info used for buyer/owner communication.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 text-slate-400" size={18} />
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Full Name"
                          className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Email Address
                        </Label>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Verified
                        </span>
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          disabled
                          className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3 text-slate-400" size={18} />
                          <Input
                            id="phone"
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+92 3xx xxxxxx"
                            className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Primary City
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3 text-slate-400" size={18} />
                          <select
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full pl-10 h-11 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="Lahore">Lahore</option>
                            <option value="Karachi">Karachi</option>
                            <option value="Islamabad">Islamabad</option>
                            <option value="Rawalpindi">Rawalpindi</option>
                            <option value="Peshawar">Peshawar</option>
                            <option value="Multan">Multan</option>
                            <option value="Faisalabad">Faisalabad</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 rounded-xl gap-2 shadow-xs"
                      >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <Card className="border-0 shadow-sm bg-white rounded-2xl">
                <CardHeader className="p-6 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900">Display Preferences</CardTitle>
                  <CardDescription className="text-slate-500">
                    Customize how prices and property sizes are measured across Rentiq.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSavePreferences} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Preferred Area Unit
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {["Marla", "Kanal", "Sq. Ft."].map((unit) => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => setAreaUnit(unit)}
                            className={`py-3 px-4 rounded-xl border text-sm font-bold text-center transition-all ${
                              areaUnit === unit
                                ? "bg-emerald-50 border-emerald-600 text-emerald-700 shadow-xs"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Preferred Currency
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { code: "PKR", label: "Pakistani Rupee (PKR)" },
                          { code: "USD", label: "US Dollar ($)" },
                        ].map((curr) => (
                          <button
                            key={curr.code}
                            type="button"
                            onClick={() => setCurrency(curr.code)}
                            className={`py-3 px-4 rounded-xl border text-sm font-bold text-center transition-all ${
                              currency === curr.code
                                ? "bg-emerald-50 border-emerald-600 text-emerald-700 shadow-xs"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {curr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 rounded-xl gap-2 shadow-xs"
                      >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Preferences
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card className="border-0 shadow-sm bg-white rounded-2xl">
                <CardHeader className="p-6 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900">Notification Channels</CardTitle>
                  <CardDescription className="text-slate-500">
                    Control how and when you receive updates regarding your listings and inquiries.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSaveNotifications} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Direct Message & Chat Alerts</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Receive real-time notifications when buyers or owners send messages.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={chatNotifications}
                          onChange={(e) => setChatNotifications(e.target.checked)}
                          className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Email Alerts for Inquiries</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Get email notifications when someone inquires about your posted properties.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailAlerts}
                          onChange={(e) => setEmailAlerts(e.target.checked)}
                          className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Weekly Market Digest</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Receive weekly emails with hot property trends in your primary city.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={weeklyDigest}
                          onChange={(e) => setWeeklyDigest(e.target.checked)}
                          className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 rounded-xl gap-2 shadow-xs"
                      >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Notifications
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <Card className="border-0 shadow-sm bg-white rounded-2xl">
                <CardHeader className="p-6 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900">Security & Password</CardTitle>
                  <CardDescription className="text-slate-500">
                    Update your account password to keep your account safe.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currPass" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                        <Input
                          id="currPass"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPass" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                        <Input
                          id="newPass"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPass" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                        <Input
                          id="confirmPass"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 rounded-xl gap-2 shadow-xs"
                      >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
