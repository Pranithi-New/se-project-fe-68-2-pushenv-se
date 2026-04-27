"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { setUserInfo } from "@/lib/auth";
import type { ApiResponse } from "@/types/api";

const schema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .regex(/^[a-zA-Z0-9\s-']+$/, {
        message: "Name must contain only English letters, numbers, spaces, hyphens, or apostrophes",
      }),
    email: z
      .string()
      .regex(/^(?!\s)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?<!\s)$/, { message: "Invalid email format" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/^[\x20-\x7E]+$/, { message: "Password must contain only English characters and valid symbols" }),
    confirmPassword: z.string(),
    consent: z.literal(true, {
      message: "You must accept the Privacy Policy",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasReadPolicy, setHasReadPolicy] = useState(false);
  const policyIsUnread = hasReadPolicy === false;
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      consent: undefined as any, // force the user to check it
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const res = await api.post<ApiResponse<{ user: { id: string; role: string } }>>("/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password,
        role: "jobSeeker",
      });

      setUserInfo(res.data.user);
      toast.success("Registration successful! Welcome.");
      router.push("/events");
    } catch (err: unknown) {
      const errorObj = err as { statusCode?: number; message?: string };
      // Check if it's a 409 Conflict error
      if (errorObj?.statusCode === 409 || errorObj?.message?.toLowerCase().includes("email already in use")) {
        form.setError("email", { message: "Email already exists" });
      } else {
        const message = errorObj?.message || "Registration failed";
        toast.error(message);
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-start justify-center px-4 py-12">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your details below to register</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min. 8 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Repeat password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <input
                      id="consent-checkbox"
                      type="checkbox"
                      disabled={mounted ? policyIsUnread : undefined}
                      className="h-4 w-4 shrink-0 rounded-sm border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 accent-primary"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="consent-checkbox" className={hasReadPolicy ? "text-foreground" : "text-muted-foreground"}>
                        I agree to the{" "}
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setHasReadPolicy(true)}
                          className="text-primary font-medium underline underline-offset-4 hover:text-primary/80"
                        >
                          Privacy Policy
                        </a>
                      </FormLabel>
                      <CardDescription className="text-xs mt-1.5 block">
                        {hasReadPolicy ? "Thank you for reading the policy." : "You must click the link to read the policy before checking this box."}
                      </CardDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="mt-2 w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/signin" className="text-foreground font-medium underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
