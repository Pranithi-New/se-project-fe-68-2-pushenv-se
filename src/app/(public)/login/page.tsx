import { AuthCard } from "@/components/shared/AuthCard";

export default function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      description="Access user, company, and admin accounts from one public entry point."
      fields={["Email", "Password"]}
      footerLink={{ href: "/register", label: "Need an account? Sign up" }}
    />
  );
}
