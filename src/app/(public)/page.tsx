"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserInfo } from "@/lib/auth";

const features = [
  {
    title: "Students & applicants",
    body: "Browse published events, register once, and manage a personal profile.",
  },
  {
    title: "Companies",
    body: "Maintain a public profile, join fairs, and publish hiring opportunities.",
  },
  {
    title: "Admins",
    body: "Run the platform, manage accounts, publish events, and moderate listings.",
  },
];

export default function LandingPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const user = getUserInfo();
    setIsSignedIn(!!user);

    const handleAuthChange = () => {
      const updatedUser = getUserInfo();
      setIsSignedIn(!!updatedUser);
    };

    globalThis.window.addEventListener("auth-change", handleAuthChange);
    return () => globalThis.window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-6 py-24">
        {/* Hero */}
        <section className="flex flex-col items-start gap-7">
          <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Connect students, companies, and event organizers in one hiring workflow.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            Public auth pages, role-based dashboards, typed API helpers, and shared UI building blocks — all in one place.
          </p>
          <div className="flex gap-3">
            {isSignedIn ? (
              <Button size="lg" asChild>
                <Link href="/events">Explore Events</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/signin">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-5 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
