"use client";

import type React from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { TrendingUp, BarChart3, Radio, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerUser(email, password, fullName);
      if (result.error) {
        setError(result.error);
        return;
      }
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        setError("Account created but sign-in failed. Please sign in manually.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An error occurred during account creation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-20 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* BRANDING HEADER WITH LOGO */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <Link href="/" className="relative h-12 w-56 overflow-hidden rounded-lg inline-block">
            <img
              src="/logo.png"
              className="h-12 w-auto max-w-none absolute left-1/2 -translate-x-1/2 top-0 select-none pointer-events-none"
              alt="TradeTracker Pro Logo"
            />
          </Link>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
            Institutional Trade Journaling & Analytics
          </p>
        </div>

        {/* SIGN UP CARD */}
        <Card className="bg-card/70 border-border/60 backdrop-blur-xl shadow-2xl rounded-2xl border">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
              Create account
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Start tracking your executions and build your trading edge
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl bg-background/60 border-border/60 hover:bg-accent font-bold text-xs gap-2"
              onClick={handleGoogleSignUp}
              type="button"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-card px-3 text-muted-foreground">
                  or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-background/60 border-border/60 text-xs h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="trader@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/60 border-border/60 text-xs h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/60 border-border/60 text-xs h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background/60 border-border/60 text-xs h-10 rounded-xl"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                  <p className="text-xs font-bold text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 mt-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
              </Button>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary font-bold hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* BOTTOM FEATURE INDICATORS */}
        <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            <span>Advanced Journal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-primary" />
            <span>Live Market Stream</span>
          </div>
        </div>
      </div>
    </div>
  );
}
