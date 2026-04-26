"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Camera, Globe, Pencil } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/event-utils";
import type { ApiResponse } from "@/types/api";

type CompanyProfile = {
  id: string;
  companyUserId: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  createdAt: string;
  updatedAt: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Update failed";
}

function getLogoUrl(logo: string | null | undefined): string {
  if (!logo) return "";
  if (logo.startsWith("http") || logo.startsWith("/")) {
    return resolveAssetUrl(logo) ?? "";
  }
  return `${BASE_URL}${logo}`;
}

function getWebsiteUrl(website: string | null | undefined): string {
  if (!website) return "#";
  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }
  return `https://${website}`;
}

// ── Custom Hooks ─────────────────────────────────────────────────────────────

function useCompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    api.get<ApiResponse<CompanyProfile>>("/company/profile")
      .then((res) => {
        setProfile(res.data);
        setWebsite(res.data.website ?? "");
        setDescription(res.data.description ?? "");
      })
      .catch(() => toast.error("Failed to load company profile"))
      .finally(() => setLoading(false));
  }, []);

  return { profile, setProfile, loading, website, setWebsite, description, setDescription };
}

function useDetailsEditor(
  profile: CompanyProfile | null,
  setProfile: (p: CompanyProfile) => void,
  website: string,
  description: string,
  setWebsite: (v: string) => void
) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put<ApiResponse<CompanyProfile>>("/company/profile", {
        website: website || undefined,
        description: description || undefined,
      });
      setProfile(res.data);
      setEditing(false);
      toast.success("Company details updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setEditing(false);
    setWebsite(profile?.website ?? "");
  };

  return { editing, setEditing, saving, save, cancel };
}

function useDescEditor(
  profile: CompanyProfile | null,
  setProfile: (p: CompanyProfile) => void,
  website: string,
  description: string,
  setDescription: (v: string) => void
) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put<ApiResponse<CompanyProfile>>("/company/profile", {
        description: description || undefined,
        website: profile?.website ?? undefined,
      });
      setProfile(res.data);
      setEditing(false);
      toast.success("Description updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setEditing(false);
    setDescription(profile?.description ?? "");
  };

  return { editing, setEditing, saving, save, cancel };
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

function CompanyLogo({ logo, onLogoClick }: { logo: string | null | undefined; onLogoClick: () => void }) {
  return (
    <div className="relative shrink-0">
      <div className="h-16 w-16 rounded-xl overflow-hidden bg-white border-4 border-white shadow-md flex items-center justify-center">
        {logo
          ? <Image src={getLogoUrl(logo)} alt="Company logo" className="h-full w-full object-cover" width={64} height={64} />
          : <Building2 className="h-7 w-7 text-slate-400" />}
      </div>
      <button type="button" onClick={onLogoClick} className="absolute -bottom-1 -right-1 rounded-full bg-white border border-slate-200 shadow-sm p-1.5 hover:bg-slate-50 transition-colors" aria-label="Change logo">
        <Camera className="h-3 w-3 text-slate-600" />
      </button>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function CompanyProfileSection() {
  const { profile, setProfile, loading, website, setWebsite, description, setDescription } = useCompanyProfile();
  const detailsEditor = useDetailsEditor(profile, setProfile, website, description, setWebsite);
  const descEditor = useDescEditor(profile, setProfile, website, description, setDescription);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const res = await api.put<ApiResponse<CompanyProfile>>("/company/profile", formData);
      setProfile(res.data);
      toast.success("Logo updated");
    } catch {
      toast.error("Logo upload failed");
    }
    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Company identity */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-16 bg-gradient-to-br from-slate-800 to-slate-900" />
        <div className="px-6 pb-5 -mt-8 flex items-end gap-4">
          <CompanyLogo logo={profile.logo} onLogoClick={() => logoInputRef.current?.click()} />
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          <div className="mb-1">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">Company</span>
          </div>
        </div>
      </div>

      {/* Company Details */}
      <Section
        icon={<Globe className="h-4 w-4" />}
        title="Company Details"
        subtitle="Public-facing information"
        action={detingDetailsAction(detailsEditor, profile, website, setWebsite)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Website">
            {detailsEditor.editing
              ? <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
              : (
                <p className="text-sm font-medium text-slate-900">
                  {profile.website
                    ? <a href={getWebsiteUrl(profile.website)} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline">{profile.website}</a>
                    : "—"}
                </p>
              )}
          </Field>
        </div>
      </Section>

      {/* Description */}
      <Section
        icon={<Building2 className="h-4 w-4" />}
        title="About"
        subtitle="Shown to job seekers on your profile"
        action={!descEditor.editing ? (
          <Button size="sm" variant="outline" onClick={() => descEditor.setEditing(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />Edit
          </Button>
        ) : undefined}
      >
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!descEditor.editing}
          rows={5}
          placeholder="Tell job seekers about your company, culture, and mission…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500 resize-none disabled:opacity-60 disabled:bg-slate-50 placeholder:text-slate-400 transition"
        />
        {descEditor.editing && (
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={descEditor.cancel}>Cancel</Button>
            <Button size="sm" onClick={descEditor.save} disabled={descEditor.saving} className="bg-slate-900 text-white hover:bg-slate-700">{descEditor.saving ? "Saving…" : "Save"}</Button>
          </div>
        )}
      </Section>
    </div>
  );
}

function detingDetailsAction(
  detailsEditor: ReturnType<typeof useDetailsEditor>,
  profile: CompanyProfile,
  website: string,
  setWebsite: (v: string) => void
) {
  if (detailsEditor.editing) {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={detailsEditor.cancel}>Cancel</Button>
        <Button size="sm" onClick={detailsEditor.save} disabled={detailsEditor.saving} className="bg-slate-900 text-white hover:bg-slate-700">{detailsEditor.saving ? "Saving…" : "Save"}</Button>
      </div>
    );
  }
  return (
    <Button size="sm" variant="outline" onClick={() => detailsEditor.setEditing(true)}>
      <Pencil className="h-3.5 w-3.5 mr-1.5" />Edit
    </Button>
  );
}
