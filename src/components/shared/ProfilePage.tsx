"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
};

const ROLE_LABELS: Record<string, string> = {
  jobSeeker: "Participant",
  companyUser: "Company",
  systemAdmin: "Admin",
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Personal info edit
  const [editingInfo, setEditingInfo] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  // Password change
  const [editingPass, setEditingPass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get<ApiResponse<UserProfile>>("/auth/me");
        setProfile(res.data);
        setName(res.data.name);
        setPhone(res.data.phone ?? "");
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function cancelInfo() {
    if (!profile) return;
    setEditingInfo(false);
    setName(profile.name);
    setPhone(profile.phone ?? "");
  }

  async function handleSaveInfo() {
    setSavingInfo(true);
    try {
      const res = await api.put<ApiResponse<UserProfile>>("/auth/me", { name, phone });
      setProfile(res.data);
      setEditingInfo(false);
      toast.success("Profile updated");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Update failed";
      toast.error(message);
    } finally {
      setSavingInfo(false);
    }
  }

  function cancelPass() {
    setEditingPass(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPass(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      cancelPass();
      toast.success("Password changed");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Password change failed";
      toast.error(message);
    } finally {
      setSavingPass(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await api.put<ApiResponse<UserProfile>>("/auth/me", formData);
      setProfile(res.data);
      toast.success("Avatar updated");
    } catch {
      toast.error("Avatar upload failed");
    }
    // Reset so same file can be re-selected
    e.target.value = "";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const roleLabel = ROLE_LABELS[profile.role] ?? profile.role;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="mx-auto w-full max-w-4xl px-6 py-10 flex flex-col gap-6">
        {/* Identity card */}
        <div className="rounded-2xl bg-background p-6 flex items-center gap-5 shadow-md">
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${BASE_URL}${profile.avatar}`}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-muted-foreground select-none">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 rounded-full bg-background border shadow-sm p-1.5 hover:bg-muted transition-colors"
              aria-label="Change avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xl font-bold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-sm text-muted-foreground">{roleLabel}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="rounded-2xl bg-background p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 mb-5 border-b">
            <p className="text-lg font-bold">Personal Information</p>
            {editingInfo ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={cancelInfo}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveInfo} disabled={savingInfo}>
                  {savingInfo ? "Saving…" : "Save"}
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditingInfo(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1.5">Name</p>
              {editingInfo ? (
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              ) : (
                <p className="font-medium">{profile.name}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1.5">Phone</p>
              {editingInfo ? (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                />
              ) : (
                <p className="font-medium">{profile.phone ?? "—"}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1.5">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl bg-background p-6 shadow-md">
          <div className="flex items-start justify-between pb-4 mb-5 border-b">
            <div>
              <p className="text-lg font-bold">Change Password</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Please enter your current password to change your password
              </p>
            </div>
            {editingPass ? (
              <div className="flex gap-2 shrink-0 ml-4">
                <Button size="sm" variant="outline" onClick={cancelPass}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleChangePassword} disabled={savingPass}>
                  {savingPass ? "Saving…" : "Save"}
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingPass(true)}
                className="shrink-0 ml-4"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1.5">Current Password</p>
              <Input
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={!editingPass}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1.5">New Password</p>
              <Input
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={!editingPass}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1.5">Confirm New Password</p>
              <Input
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!editingPass}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
