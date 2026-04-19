"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
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

export function CompanyProfileSection() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingDetails, setEditingDetails] = useState(false);
  const [website, setWebsite] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const [editingDesc, setEditingDesc] = useState(false);
  const [description, setDescription] = useState("");
  const [savingDesc, setSavingDesc] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get<ApiResponse<CompanyProfile>>("/company/profile");
        setProfile(res.data);
        setWebsite(res.data.website ?? "");
        setDescription(res.data.description ?? "");
      } catch {
        toast.error("Failed to load company profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSaveDetails() {
    setSavingDetails(true);
    try {
      const res = await api.put<ApiResponse<CompanyProfile>>("/company/profile", {
        website: website || undefined,
        description: description || undefined,
      });
      setProfile(res.data);
      setEditingDetails(false);
      toast.success("Company details updated");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Update failed";
      toast.error(message);
    } finally {
      setSavingDetails(false);
    }
  }

  async function handleSaveDesc() {
    setSavingDesc(true);
    try {
      const res = await api.put<ApiResponse<CompanyProfile>>("/company/profile", {
        description: description || undefined,
        website: profile?.website ?? undefined,
      });
      setProfile(res.data);
      setEditingDesc(false);
      toast.success("Description updated");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Update failed";
      toast.error(message);
    } finally {
      setSavingDesc(false);
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
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
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm py-16">
        Loading…
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Identity card */}
      <div className="rounded-2xl bg-background p-6 flex items-center gap-5 shadow-md">
        <div className="relative shrink-0">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {profile.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${BASE_URL}${profile.logo}`}
                alt="Company logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-muted-foreground select-none">C</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="absolute bottom-0 right-0 rounded-full bg-background border shadow-sm p-1.5 hover:bg-muted transition-colors"
            aria-label="Change logo"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit">
            company
          </span>
        </div>
      </div>

      {/* Company Details */}
      <div className="rounded-2xl bg-background p-6 shadow-md">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Company Details</p>
          {editingDetails ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                setEditingDetails(false);
                setWebsite(profile.website ?? "");
              }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveDetails} disabled={savingDetails}>
                {savingDetails ? "Saving…" : "Save"}
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditingDetails(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1.5">Website</p>
            {editingDetails ? (
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            ) : (
              <p className="font-medium">{profile.website ?? "—"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl bg-background p-6 shadow-md">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Description</p>
          {!editingDesc && (
            <Button size="sm" variant="outline" onClick={() => setEditingDesc(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!editingDesc}
          rows={4}
          placeholder="Type your message here."
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none disabled:opacity-60"
        />
        {editingDesc && (
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => {
              setEditingDesc(false);
              setDescription(profile.description ?? "");
            }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveDesc} disabled={savingDesc}>
              {savingDesc ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}