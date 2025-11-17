"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  History,
  CreditCard,
  LogOut,
  Settings,
  Home,
  ChevronRight,
  User,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  credits: number;
}

// A simple toast-like notification component
function Notification({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  const isSuccess = type === "success";
  return (
    <div
      className={`fixed top-24 right-8 z-50 p-4 rounded-lg shadow-lg ${
        isSuccess
          ? "bg-emerald-50 border-emerald-300"
          : "bg-red-50 border-red-300"
      } border`}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600" />
        )}
        <p
          className={`text-sm font-medium ${
            isSuccess ? "text-emerald-800" : "text-red-800"
          }`}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated" && !userData) {
      fetchUserData();
    }
  }, [status]);

  const fetchUserData = async () => {
    try {
      setIsLoadingUserData(true);
      
      // Start timing and fetch data
      const startTime = Date.now();
      
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch user data");

      const data = await response.json();
      
      // Calculate remaining time to reach minimum 1500ms
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 300 - elapsedTime);
      
      // Wait for the remaining time to ensure minimum loading duration
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
      
      setUserData(data.user);
      setName(data.user.name || "");
      
      // Update session with latest credits
      await update();
    } catch (err) {
      showNotification("Failed to load user data", "error");
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update profile");

      showNotification("Profile updated successfully!", "success");
      setUserData(data.user);
      
      // Trigger session update to reflect new name
      await update();
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification("New passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      showNotification("Password must be at least 6 characters", "error");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to change password");

      showNotification("Password changed successfully!", "success");
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === "loading" || isLoadingUserData || !userData) {
    return (
      <div className="flex min-h-screen bg-linear-to-br from-gray-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
        <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"></aside>
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
              Loading settings...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="flex min-h-screen bg-linear-to-br from-gray-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-base font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                  ContentRepurpose
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  AI-Powered
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors group"
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors group"
            >
              <History className="h-5 w-5" />
              <span>History</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium group"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="p-4 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 text-white mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium opacity-90">Credits</span>
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{userData.credits}</span>
                <span className="text-sm opacity-80">available</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Credits
              </Button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 mb-2">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold">
                {userData.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {userData.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userData.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
            <div className="px-8 py-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Account Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your profile, password, and credit balance
              </p>
            </div>
          </header>

          <main className="p-8 space-y-8">
            {/* Card 1: Profile Information */}
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleProfileUpdate}
                  className="space-y-4 max-w-lg"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Full Name
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={profileLoading}
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      value={userData.email || ""}
                      disabled
                      className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Card 2: Change Password */}
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-emerald-600" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-4 max-w-lg"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="currentPassword"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Current Password
                    </label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={passwordLoading}
                      className="bg-gray-50 dark:bg-gray-800"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="newPassword"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      New Password
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={passwordLoading}
                      className="bg-gray-50 dark:bg-gray-800"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={passwordLoading}
                      className="bg-gray-50 dark:bg-gray-800"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Card 3: Credit Balance */}
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Credit Balance
                </CardTitle>
                <CardDescription>
                  View your available credits and add more.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {userData.credits}
                  </span>
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    credits available
                  </span>
                </div>
                <Button className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buy More Credits
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  );
}
