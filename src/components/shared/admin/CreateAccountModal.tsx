import { useState } from "react";
import { toast } from "sonner";

import {
  AdminDialog,
  adminInputClassName,
  adminSelectClassName,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/components/shared/admin/admin-list-utils";

type AccountRole = "jobSeeker" | "companyUser";

type CreateAccountModalProps = Readonly<{
  title: string;
  description: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  failureMessage: string;
  nameLabel?: string;
  showRoleSelect: boolean;
  defaultRole: AccountRole;
  onClose: () => void;
  onCreated: () => void;
}>;

export function CreateAccountModal({
  title,
  description,
  submitLabel,
  submittingLabel,
  successMessage,
  failureMessage,
  nameLabel = "Name",
  showRoleSelect,
  defaultRole,
  onClose,
  onCreated,
}: CreateAccountModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/accounts", {
        ...form,
        role: showRoleSelect ? form.role : defaultRole,
      });
      toast.success(successMessage);
      onCreated();
    } catch (err) {
      toast.error(extractErrorMessage(err, failureMessage));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDialog title={title} description={description} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
        <div className={cn("grid gap-4", showRoleSelect && "sm:grid-cols-2")}>
          <div className={cn(showRoleSelect && "sm:col-span-2")}>
            <Label className="mb-2 block text-sm font-medium text-slate-700">{nameLabel}</Label>
            <Input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={cn("h-11 rounded-xl", adminInputClassName)}
            />
          </div>
          <div className={cn(showRoleSelect && "sm:col-span-2")}>
            <Label className="mb-2 block text-sm font-medium text-slate-700">Email</Label>
            <Input
              required
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={cn("h-11 rounded-xl", adminInputClassName)}
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700">Password</Label>
            <Input
              required
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className={cn("h-11 rounded-xl", adminInputClassName)}
            />
          </div>

          {showRoleSelect && (
            <div>
              <Label className="mb-2 block text-sm font-medium text-slate-700">Role</Label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as AccountRole }))}
                className={adminSelectClassName}
              >
                <option value="jobSeeker">Participant</option>
                <option value="companyUser">Company</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button type="button" variant="outline" className="rounded-xl border-slate-200" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="rounded-xl" disabled={saving}>
            {saving ? submittingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </AdminDialog>
  );
}
