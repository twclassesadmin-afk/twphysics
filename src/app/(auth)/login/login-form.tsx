"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(login, null);
  const isStaffLogin = redirectTo.startsWith("/admin") || redirectTo.startsWith("/tutor");
  const portalLabel = redirectTo.startsWith("/admin")
    ? "Admin portal"
    : redirectTo.startsWith("/tutor")
      ? "Tutor portal"
      : "Welcome back to TWPHYSICS";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>{portalLabel}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Logging in..." : "Log in"}
          </Button>
          {!isStaffLogin && (
            <p className="text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Create an account
              </Link>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline underline-offset-4">
              &larr; Back to home
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
