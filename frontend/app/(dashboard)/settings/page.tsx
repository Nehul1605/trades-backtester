"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Bell,
  Palette,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Calendar,
  Receipt,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  updateUserProfile, 
  uploadAvatar, 
  updateUserPassword,
  getUserSubscriptions 
} from "@/lib/actions";
import { getMediaUrl } from "@/lib/utils";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email(),
});

const securityFormSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subData, setSubData] = useState<any>(null);
  const [fetchingSub, setFetchingSub] = useState(false);

  useEffect(() => {
    if (activeTab === "subscription") {
      const getDetails = async () => {
        setFetchingSub(true);
        const res = await getUserSubscriptions();
        if (res.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: res.error,
          });
        } else {
          setSubData(res);
        }
        setFetchingSub(false);
      };
      getDetails();
    }
  }, [activeTab, toast]);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session, form]);

  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    setUpdatingProfile(true);
    try {
      const { error } = await updateUserProfile({ name: values.name });
      if (error) throw new Error(error);

      await update({ name: values.name });

      toast({
        title: "Settings Updated",
        description: "Your profile information has been saved successfully.",
        duration: 3000,
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update profile",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Upload Failed",
        description: "File size exceeds 5MB limit",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setUpdatingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await uploadAvatar(fd);
      if (res.error || !res.url) {
        throw new Error(res.error || "Failed to upload avatar image");
      }
      const url = res.url;

      const { error } = await updateUserProfile({ name: form.getValues("name"), image: url });
      if (error) throw new Error(error);

      await update({ image: url });

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
        duration: 3000,
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload avatar",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setUpdatingAvatar(false);
    }
  }

  const [updatingPassword, setUpdatingPassword] = useState(false);

  async function onSecuritySubmit(values: z.infer<typeof securityFormSchema>) {
    setUpdatingPassword(true);
    try {
      const { error, message } = await updateUserPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Password Updated",
        description: message || "Your password has been changed successfully.",
        duration: 3000,
      });
      securityForm.reset();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update password",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setUpdatingPassword(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 p-4 md:p-6 lg:p-10">
        <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              Settings
            </h1>
            <p className="text-muted-foreground mt-2 uppercase text-[10px] font-bold tracking-widest">
              Manage your account and platform preferences.
            </p>
          </div>

          <Tabs
            defaultValue="profile"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-muted/40 p-1 rounded-xl w-full justify-start overflow-x-auto no-scrollbar h-auto space-x-1 border border-border/50">
              <TabsTrigger
                value="profile"
                className="rounded-lg px-4 py-2 gap-2 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-background"
              >
                <User className="h-3.5 w-3.5" /> Profile
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-lg px-4 py-2 gap-2 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-background"
              >
                <Shield className="h-3.5 w-3.5" /> Security
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-lg px-4 py-2 gap-2 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-background"
              >
                <Bell className="h-3.5 w-3.5" /> Notifications
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="rounded-lg px-4 py-2 gap-2 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-background"
              >
                <Palette className="h-3.5 w-3.5" /> Appearance
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="rounded-lg px-4 py-2 gap-2 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-background"
              >
                <CreditCard className="h-3.5 w-3.5" /> Subscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 bg-card/40 backdrop-blur-md border-border/50">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Photo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-primary/20">
                        <AvatarImage src={getMediaUrl(session?.user?.image || "")} />
                        <AvatarFallback className="text-4xl bg-primary/10 text-primary font-black">
                          {session?.user?.name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {updatingAvatar && (
                        <div className="absolute inset-0 bg-background/70 rounded-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={updatingAvatar}
                      className="text-[10px] font-black uppercase tracking-widest h-8 cursor-pointer"
                    >
                      {updatingAvatar ? "Uploading..." : "Update Avatar"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 bg-card/40 backdrop-blur-md border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      General Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onProfileSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase font-black opacity-50">
                                Full Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-background/50 border-border/50 h-12 font-bold"
                                />
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
                              <FormLabel className="text-[10px] uppercase font-black opacity-50">
                                Email Address
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled
                                  className="bg-background/20 border-border/50 h-12 font-bold cursor-not-allowed"
                                />
                              </FormControl>
                              <FormDescription className="text-[9px] uppercase font-bold text-muted-foreground/60">
                                Trade reports will be sent to this address.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          disabled={updatingProfile}
                          className="w-full h-12 text-xs font-black uppercase tracking-widest mt-4 cursor-pointer"
                        >
                          {updatingProfile ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                          ) : null}
                          {updatingProfile ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <Card className="bg-card/40 backdrop-blur-md border-border/50 max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Security Settings
                  </CardTitle>
                  <CardDescription className="text-[10px] uppercase font-medium mt-1">
                    Change your password and secure your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...securityForm}>
                    <form
                      onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase font-black opacity-50">
                              Current Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                {...field}
                                className="bg-background/50 border-border/50 h-12 font-bold"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase font-black opacity-50">
                              New Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                {...field}
                                className="bg-background/50 border-border/50 h-12 font-bold"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase font-black opacity-50">
                              Confirm New Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                {...field}
                                className="bg-background/50 border-border/50 h-12 font-bold"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={updatingPassword}
                        className="w-full h-12 text-xs font-black uppercase tracking-widest mt-4 cursor-pointer"
                      >
                        {updatingPassword ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                        ) : null}
                        {updatingPassword ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center py-20 opacity-30">
                    Notification preferences coming soon
                  </CardTitle>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card className="bg-card/40 backdrop-blur-md border-border/50 p-10 text-center">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-30">
                  Theme & UI Customization coming soon
                </CardTitle>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              {fetchingSub && !subData ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-4">
                    Fetching Subscriptions...
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {/* Current Active Plan summary card */}
                  <Card className="bg-card/40 backdrop-blur-md border-primary/20 relative overflow-hidden shadow-xl gold-glow-subtle">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient" />
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" /> Active Plan Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black uppercase tracking-tight text-foreground">
                            {subData?.membershipTag || "FREE"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            subData?.membershipTag === "PREMIUM" 
                              ? "bg-primary/20 text-primary border border-primary/30" 
                              : subData?.membershipTag === "PROMO TRIAL"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {subData?.membershipTag === "FREE" ? "RESTRICTED ACCESS" : "FULL ACCESS"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {subData?.membershipTag === "PREMIUM" 
                            ? "Thank you for supporting TradeTracker Pro! You have unlimited access to all platform resources."
                            : subData?.membershipTag === "PROMO TRIAL"
                            ? "You are currently exploring the platform using a temporary promotional trial code."
                            : "Upgrade to unlock Live Market charts, economic calendars, and partner broker connections."}
                        </p>
                        {subData?.premiumExpiresAt && subData.membershipTag === "PREMIUM" && (
                          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 pt-1">
                            <Calendar className="h-3.5 w-3.5 text-primary" /> Renewal/Expiry Date:{" "}
                            <span className="text-foreground">
                              {new Date(subData.premiumExpiresAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        {subData?.promoExpiresAt && subData.membershipTag === "PROMO TRIAL" && (
                          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 pt-1">
                            <Calendar className="h-3.5 w-3.5 text-yellow-400" /> Trial Ends:{" "}
                            <span className="text-foreground">
                              {new Date(subData.promoExpiresAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {subData?.membershipTag !== "PREMIUM" && (
                        <Button 
                          type="button" 
                          onClick={() => router.push("/premium")}
                          className="bg-gold-gradient text-background font-black text-xs uppercase tracking-wider px-6 h-11 shrink-0 shadow-lg shadow-primary/10 cursor-pointer"
                        >
                          Upgrade to Premium
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Transaction History Ledger */}
                  <Card className="bg-card/40 backdrop-blur-md border-border/50 overflow-hidden">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Receipt className="h-4 w-4" /> Transaction History
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Complete record of your premium membership payments and orders.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {!subData?.transactions || subData.transactions.length === 0 ? (
                        <div className="text-center py-16 text-xs text-muted-foreground font-medium border-t border-border/40 opacity-40">
                          No payment transactions found.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-y border-border/40 bg-muted/20 text-muted-foreground font-black uppercase tracking-widest">
                                <th className="p-4">Date</th>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Plan</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                              {subData.transactions.map((tx: any) => (
                                <tr key={tx._id} className="hover:bg-muted/10 transition-all font-medium text-foreground/80">
                                  <td className="p-4">
                                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </td>
                                  <td className="p-4 font-mono select-all text-xs opacity-75">{tx.orderId}</td>
                                  <td className="p-4 uppercase font-bold text-[10px]">{tx.planType}</td>
                                  <td className="p-4 text-right font-bold text-foreground">₹{tx.amount?.toLocaleString()}</td>
                                  <td className="p-4 text-center">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                      tx.status === "PAID"
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        : tx.status === "PENDING"
                                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                                    }`}>
                                      {tx.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
