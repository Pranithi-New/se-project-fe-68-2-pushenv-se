import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthCard({
  title,
  description,
  fields,
  footerLink,
}: {
  title: string;
  description: string;
  fields: string[];
  footerLink: { href: string; label: string };
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {fields.map((field) => (
            <div key={field} className="grid gap-2">
              <Label htmlFor={field}>{field}</Label>
              <Input
                id={field}
                placeholder={field}
                type={field.toLowerCase().includes("password") ? "password" : "text"}
              />
            </div>
          ))}
          <Button className="mt-2 w-full">Continue</Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-muted-foreground text-sm">
            <Link
              href={footerLink.href}
              className="text-foreground font-medium underline underline-offset-4"
            >
              {footerLink.label}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
