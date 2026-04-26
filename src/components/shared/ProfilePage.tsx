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

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveAssetUrl(assetPath?: string | null) {
  if (!assetPath) return null;
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) return assetPath;

  let cleanBase = BASE_URL;
  while (cleanBase.endsWith("/")) {
    cleanBase = cleanBase.slice(0, -1);
  }

  let cleanPath = assetPath;
  while (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.slice(1);
  }

  return `${cleanBase}/${cleanPath}`;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

// ── Custom Hooks ─────────────────────────────────────────────────────────────

function useProfileData() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    api.get<ApiResponse<UserProfile>>("/auth/me")
      .then((res) => {
        setProfile(res.data);
        setName(res.data.name);
        setPhone(res.data.phone ?? "");
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  return { profile, setProfile, loading, name, setName, phone, setPhone };
}

function useInfoEditor(setProfile: (p: UserProfile) => void) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async (name: string, phone: string, onDone: () => void) => {
    setSaving(true);
    try {
      const res = await api.put<ApiResponse<UserProfile>>("/auth/me", { name, phone });
      setProfile(res.data);
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  return { editing, setEditing, saving, save };
}

function usePasswordEditor() {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const reset = () => {
    setEditing(false);
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  const save = async () => {
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    setSaving(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      reset();
      toast.success("Password changed");
    } catch (err) {
      toast.error(getErrorMessage(err, "Password change failed"));
    } finally {
      setSaving(false);
    }
  };

  return { editing, setEditing, saving, save, reset, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword };
}

function useAvatarUpload(setProfile: (p: UserProfile) => void) {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await api.put<ApiResponse<UserProfile>>("/auth/me", formData);
      setProfile(res.data);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Avatar upload failed"));
    }
    e.target.value = "";
  };

  return { ref, handleChange };
}

function useDeleteAccount() {
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete("/users/me");
      clearUserInfo();
      globalThis.window.location.href = "/";
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete account failed"));
      setDeleting(false);
      setShowModal(false);
    }
  };

  return { deleting, showModal, setShowModal, handleDelete };
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({ icon, title, subtitle, action, children }: {
  icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">{icon}</div>
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
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function DeleteAccountModal({ onClose, onDelete, deleting }: { onClose: () => void; onDelete: () => void; deleting: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl bg-white p-6 shadow-2xl w-full max-w-sm mx-4 border border-red-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100"><Trash2 className="h-5 w-5 text-red-600" /></div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Delete Account</p>
            <p className="text-xs text-slate-500">This cannot be undone</p>
          </div>
          <button onClick={onClose} disabled={deleting} className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">All your data, applications, and history will be permanently removed. Are you sure?</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" className="flex-1" onClick={onDelete} disabled={deleting}>{deleting ? "Deleting…" : "Yes, delete"}</Button>
        </div>
      </div>
    </div>
  );
}

function ProfileSidebar({ profile, initials, activeTab, setActiveTab, avatarRef, onAvatarChange }: {
  profile: UserProfile; initials: string; activeTab: "user" | "company";
  setActiveTab: (tab: "user" | "company") => void;
  avatarRef: React.RefObject<HTMLInputElement | null>;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72 xl:w-80">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-20 bg-slate-900" />
        <div className="px-5 pb-5 -mt-10">
          <div className="relative inline-block mb-3">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-md flex items-center justify-center">
              {profile.avatar
                ? <Image src={resolveAssetUrl(profile.avatar) ?? ""} alt={profile.name} className="h-full w-full object-cover" width={80} height={80} />
                : <span className="text-2xl font-bold text-slate-500 select-none">{initials}</span>}
            </div>
            <button type="button" onClick={() => avatarRef.current?.click()} className="absolute -bottom-1 -right-1 rounded-full bg-white border border-slate-200 shadow-sm p-1.5 hover:bg-slate-50 transition-colors">
              <Camera className="h-3 w-3 text-slate-600" />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
          </div>
          <p className="font-semibold text-slate-900 text-base leading-tight">{profile.name}</p>
          <p className="text-sm text-slate-400 mt-0.5 mb-3 truncate">{profile.email}</p>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[profile.role] ?? "bg-slate-100 text-slate-600"}`}>
            {ROLE_LABELS[profile.role] ?? profile.role}
          </span>
        </div>
      </div>
      {profile.role === "companyUser" && (
        <nav className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 flex flex-col gap-1">
          <button onClick={() => setActiveTab("user")} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors w-full text-left ${activeTab === "user" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
            <User className="h-4 w-4" />User Profile
          </button>
          <button onClick={() => setActiveTab("company")} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors w-full text-left ${activeTab === "company" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
            <Shield className="h-4 w-4" />Company Profile
          </button>
        </nav>
      )}
    </aside>
  );
}

function PersonalInfoSection({ profile, name, phone, setName, setPhone, infoEditor }: {
  profile: UserProfile; name: string; phone: string;
  setName: (v: string) => void; setPhone: (v: string) => void;
  infoEditor: ReturnType<typeof useInfoEditor>;
}) {
  const cancelEdit = () => {
    infoEditor.setEditing(false);
    setName(profile.name);
    setPhone(profile.phone ?? "");
  };

  return (
    <Section icon={<User className="h-4 w-4" />} title="Personal Information"
      action={infoEditor.editing ? (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
          <Button size="sm" onClick={() => infoEditor.save(name, phone, cancelEdit)} disabled={infoEditor.saving} className="bg-slate-900 text-white hover:bg-slate-700">{infoEditor.saving ? "Saving…" : "Save"}</Button>
        </div>
      ) : <Button size="sm" variant="outline" onClick={() => infoEditor.setEditing(true)}><Pencil className="h-3.5 w-3.5 mr-1.5" />Edit</Button>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Field label="Full Name">
          {infoEditor.editing ? <Input value={name} onChange={(e) => setName(e.target.value)} /> : <p className="text-sm font-medium text-slate-900">{profile.name}</p>}
        </Field>
        <Field label="Email"><p className="text-sm font-medium text-slate-900">{profile.email}</p></Field>
        <Field label="Phone">
          {infoEditor.editing ? <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" /> : <p className="text-sm font-medium text-slate-900">{profile.phone ?? "—"}</p>}
        </Field>
      </div>
    </Section>
  );
}

function PasswordSection({ passEditor }: { passEditor: ReturnType<typeof usePasswordEditor> }) {
  return (
    <Section icon={<KeyRound className="h-4 w-4" />} title="Password" subtitle="Update your login password"
      action={passEditor.editing ? (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={passEditor.reset}>Cancel</Button>
          <Button size="sm" onClick={passEditor.save} disabled={passEditor.saving} className="bg-slate-900 text-white hover:bg-slate-700">{passEditor.saving ? "Saving…" : "Save"}</Button>
        </div>
      ) : <Button size="sm" variant="outline" onClick={() => passEditor.setEditing(true)}><Pencil className="h-3.5 w-3.5 mr-1.5" />Change</Button>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Field label="Current Password"><Input type="password" placeholder="••••••••" value={passEditor.currentPassword} onChange={(e) => passEditor.setCurrentPassword(e.target.value)} disabled={!passEditor.editing} /></Field>
        <Field label="New Password"><Input type="password" placeholder="••••••••" value={passEditor.newPassword} onChange={(e) => passEditor.setNewPassword(e.target.value)} disabled={!passEditor.editing} /></Field>
        <Field label="Confirm New Password"><Input type="password" placeholder="••••••••" value={passEditor.confirmPassword} onChange={(e) => passEditor.setConfirmPassword(e.target.value)} disabled={!passEditor.editing} /></Field>
      </div>
    </Section>
  );
}

function DangerZoneSection({ onDelete, deleting }: { onDelete: () => void; deleting: boolean }) {
  return (
    <Section icon={<Trash2 className="h-4 w-4 text-red-500" />} title="Danger Zone" subtitle="Permanent and irreversible actions">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">Delete your account</p>
          <p className="text-xs text-slate-400 mt-0.5">All data will be permanently removed</p>
        </div>
        <Button variant="destructive" size="sm" onClick={onDelete} disabled={deleting} className="shrink-0 ml-4">Delete Account</Button>
      </div>
    </Section>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function ProfilePage() {
  const { profile, setProfile, loading, name, setName, phone, setPhone } = useProfileData();
  const infoEditor = useInfoEditor(setProfile);
  const passEditor = usePasswordEditor();
  const avatar = useAvatarUpload(setProfile);
  const deleteAccount = useDeleteAccount();
  const [activeTab, setActiveTab] = useState<"user" | "company">("user");

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
  if (!profile) return null;

  const showCompany = profile.role === "companyUser" && activeTab === "company";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch xl:gap-8">
          <ProfileSidebar
            profile={profile}
            initials={getInitials(profile.name)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            avatarRef={avatar.ref}
            onAvatarChange={avatar.handleChange}
          />
          <main className="flex min-w-0 flex-1 flex-col gap-5">
            {showCompany ? <CompanyProfileSection /> : (
              <>
                <PersonalInfoSection profile={profile} name={name} phone={phone} setName={setName} setPhone={setPhone} infoEditor={infoEditor} />
                <PasswordSection passEditor={passEditor} />
                {profile.role === "jobSeeker" && <DangerZoneSection onDelete={() => deleteAccount.setShowModal(true)} deleting={deleteAccount.deleting} />}
              </>
            )}
          </main>
        </div>
      </div>
      {deleteAccount.showModal && (
        <DeleteAccountModal
          onClose={() => deleteAccount.setShowModal(false)}
          onDelete={deleteAccount.handleDelete}
          deleting={deleteAccount.deleting}
        />
      )}
    </div>
  );
}
