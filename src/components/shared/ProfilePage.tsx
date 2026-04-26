"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, KeyRound, Pencil, Shield, Trash2, User, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { clearUserInfo } from "@/lib/auth";
import type { ApiResponse } from "@/types/api";
import { CompanyProfileSection } from "@/components/shared/CompanyProfile";

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

const ROLE_COLORS: Record<string, string> = {
  jobSeeker: "bg-violet-100 text-violet-700",
  companyUser: "bg-blue-100 text-blue-700",
  systemAdmin: "bg-amber-100 text-amber-700",
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

function resolveAssetUrl(assetPath?: string | null) {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  return `${BASE_URL.replace(/\/+$/, "")}/${assetPath.replace(/^\/+/, "")}`;
}

function DeleteAccountModal({
  onClose,
  onDelete,
  deleting,
}: {
  onClose: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl bg-white p-6 shadow-2xl w-full max-w-sm mx-4 border border-red-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Delete Account</p>
            <p className="text-xs text-slate-500">This cannot be undone</p>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          All your data, applications, and history will be permanently removed.
          Are you sure?
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Yes, delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingInfo, setEditingInfo] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  const [editingPass, setEditingPass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"user" | "company">("user");

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

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("Image must be 5 MB or smaller");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await api.put<ApiResponse<UserProfile>>("/auth/me", formData);
      setProfile(res.data);
      toast.success("Avatar updated");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Avatar upload failed";
      toast.error(message);
    }
    e.target.value = "";
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await api.delete("/users/me");
      clearUserInfo();
      window.location.href = "/";
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Delete account failed";
      toast.error(message);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const roleLabel = ROLE_LABELS[profile.role] ?? profile.role;
  const roleColor = ROLE_COLORS[profile.role] ?? "bg-slate-100 text-slate-600";
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch xl:gap-8">
          {/* Sidebar */}
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72 xl:w-80">
            {/* Identity card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-20 bg-slate-900" />
              <div className="px-5 pb-5 -mt-10">
                <div className="relative inline-block mb-3">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-md flex items-center justify-center">
                    {profile.avatar ? (
                      <Image
                        src={
                          profile.avatar 
                            ? (profile.avatar.startsWith("http") || profile.avatar.startsWith("/")) 
                              ? resolveAssetUrl(profile.avatar) ?? "" 
                              : "" 
                            : ""
                        }
                        alt={profile.name}
                        className="h-full w-full object-cover"
                        width={80}
                        height={80}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-slate-500 select-none">
                        {initials}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 rounded-full bg-white border border-slate-200 shadow-sm p-1.5 hover:bg-slate-50 transition-colors"
                    aria-label="Change avatar"
                  >
                    <Camera className="h-3 w-3 text-slate-600" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <p className="font-semibold text-slate-900 text-base leading-tight">{profile.name}</p>
                <p className="text-sm text-slate-400 mt-0.5 mb-3 truncate">{profile.email}</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColor}`}>
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Tab nav — company only */}
            {profile.role === "companyUser" && (
              <nav className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 flex flex-col gap-1">
                <button
                  onClick={() => setActiveTab("user")}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors w-full text-left ${
                    activeTab === "user"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <User className="h-4 w-4" />
                  User Profile
                </button>
                <button
                  onClick={() => setActiveTab("company")}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors w-full text-left ${
                    activeTab === "company"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Company Profile
                </button>
              </nav>
            )}
          </aside>

          {/* Main content */}
          <main className="flex min-w-0 flex-1 flex-col gap-5">
            {profile.role === "companyUser" && activeTab === "company" ? (
              <CompanyProfileSection />
            ) : (
              <>
                {/* Personal Information */}
                <Section
                  icon={<User className="h-4 w-4" />}
                  title="Personal Information"
                  action={
                    editingInfo ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={cancelInfo}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveInfo}
                          disabled={savingInfo}
                          className="bg-slate-900 text-white hover:bg-slate-700"
                        >
                          {savingInfo ? "Saving…" : "Save"}
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditingInfo(true)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>
                    )
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Field label="Full Name">
                      {editingInfo ? (
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                      ) : (
                        <p className="text-sm font-medium text-slate-900">{profile.name}</p>
                      )}
                    </Field>
                    <Field label="Email">
                      <p className="text-sm font-medium text-slate-900">{profile.email}</p>
                    </Field>
                    <Field label="Phone">
                      {editingInfo ? (
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                        />
                      ) : (
                        <p className="text-sm font-medium text-slate-900">{profile.phone ?? "—"}</p>
                      )}
                    </Field>
                  </div>
                </Section>

                {/* Change Password */}
                <Section
                  icon={<KeyRound className="h-4 w-4" />}
                  title="Password"
                  subtitle="Update your login password"
                  action={
                    editingPass ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={cancelPass}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleChangePassword}
                          disabled={savingPass}
                          className="bg-slate-900 text-white hover:bg-slate-700"
                        >
                          {savingPass ? "Saving…" : "Save"}
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditingPass(true)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Change
                      </Button>
                    )
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Field label="Current Password">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={!editingPass}
                      />
                    </Field>
                    <Field label="New Password">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={!editingPass}
                      />
                    </Field>
                    <Field label="Confirm New Password">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={!editingPass}
                      />
                    </Field>
                  </div>
                </Section>

                {/* Danger Zone */}
                {profile.role === "jobSeeker" && (
                  <Section
                    icon={<Trash2 className="h-4 w-4 text-red-500" />}
                    title="Danger Zone"
                    subtitle="Permanent and irreversible actions"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">Delete your account</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          All data will be permanently removed
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={deleting}
                        className="shrink-0 ml-4"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </Section>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteAccount}
          deleting={deleting}
        />
      )}
    </div>
  );
}
