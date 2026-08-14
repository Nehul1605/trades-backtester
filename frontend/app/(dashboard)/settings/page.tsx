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

  const downloadInvoicePDF = (tx: any, user: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Blocker Active",
        description: "Please allow pop-ups to download the invoice PDF.",
        variant: "destructive",
      });
      return;
    }

    const date = new Date(tx.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const expiresAt = tx.createdAt ? new Date(new Date(tx.createdAt).getTime() + (tx.planType === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) : "N/A";
    
    // Calculate dynamic subtotal, GST, and Total from transaction amount (which is total pay)
    const total = tx.amount;
    const subtotal = Math.round((total / 1.18) * 100) / 100;
    const gst = Math.round((total - subtotal) * 100) / 100;
    
    const symbol = tx.currency === "USD" ? "$" : "₹";
    const locale = tx.currency === "USD" ? "en-US" : "en-IN";

    const subtotalString = `${symbol}${subtotal.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const gstString = `${symbol}${gst.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const totalString = `${symbol}${total.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${tx.orderId}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { size: auto; margin: 0; }
            }
            body {
              background-color: #ffffff;
            }
          </style>
        </head>
        <body onload="window.print(); setTimeout(() => { window.close(); }, 500);">
          <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 50px; color: #1e293b; max-width: 800px; margin: auto; line-height: 1.5;">
            <!-- Header section -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ca8a04; padding-bottom: 20px; margin-bottom: 30px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${window.location.origin}/logo.png" style="height: 38px; width: auto; object-fit: contain;" onerror="this.style.display='none';" alt="TradeTracker Pro Logo">
                <div>
                  <h1 style="margin: 0; color: #ca8a04; font-size: 20px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">TRADETRACKER PRO</h1>
                  <p style="margin: 3px 0 0 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Official Subscription Receipt</p>
                </div>
              </div>
              <div style="text-align: right;">
                <h2 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 800;">PAYMENT RECEIPT</h2>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Date: ${date}</p>
              </div>
            </div>

            <!-- Billing details -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; font-size: 13px;">
              <div>
                <h3 style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 800; margin-bottom: 8px; letter-spacing: 0.5px;">Billed To:</h3>
                <p style="margin: 0; font-weight: bold; color: #0f172a; font-size: 14px;">${user?.name || "Premium Subscriber"}</p>
                <p style="margin: 3px 0 0 0; color: #475569;">Email: ${user?.email}</p>
              </div>
              <div style="text-align: right;">
                <h3 style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 800; margin-bottom: 8px; letter-spacing: 0.5px;">Transaction details:</h3>
                <p style="margin: 0; color: #334155;"><strong>Order ID:</strong> ${tx.orderId}</p>
                <p style="margin: 3px 0 0 0; color: #334155;"><strong>Payment ID:</strong> ${tx.razorpayPaymentId || "N/A"}</p>
                <p style="margin: 3px 0 0 0; color: #334155;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">PAID</span></p>
              </div>
            </div>

            <!-- Invoice Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; font-weight: bold; text-align: left; color: #334155;">
                  <th style="padding: 12px; font-weight: 800;">Description</th>
                  <th style="padding: 12px; text-align: right; font-weight: 800;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-weight: 800;">Rate</th>
                  <th style="padding: 12px; text-align: right; font-weight: 800;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e2e8f0; color: #334155;">
                  <td style="padding: 12px;">
                    <strong style="color: #0f172a;">TradeTracker Pro Premium Access - ${tx.planType === "annual" ? "Annual" : "Monthly"} Plan</strong><br>
                    <span style="font-size: 11px; color: #64748b;">Full permanent access to live market charts, signals, calendar, and calculators. Valid until ${expiresAt}</span>
                  </td>
                  <td style="padding: 12px; text-align: right;">1</td>
                  <td style="padding: 12px; text-align: right;">${subtotalString}</td>
                  <td style="padding: 12px; text-align: right;">${subtotalString}</td>
                </tr>
              </tbody>
            </table>

            <!-- Subtotal & GST section -->
            <div style="display: flex; justify-content: flex-end; font-size: 13px;">
              <table style="width: 260px; border-collapse: collapse; color: #334155;">
                <tr>
                  <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;">Subtotal (Base Price):</td>
                  <td style="padding: 6px 0; text-align: right; border-bottom: 1px solid #f1f5f9;">${subtotalString}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;">Platform Fee (18%):</td>
                  <td style="padding: 6px 0; text-align: right; border-bottom: 1px solid #f1f5f9;">${gstString}</td>
                </tr>
                <tr style="font-weight: 800; font-size: 15px; color: #ca8a04;">
                  <td style="padding: 10px 0;">Total Paid (Incl. Fee):</td>
                  <td style="padding: 10px 0; text-align: right;">${totalString}</td>
                </tr>
              </table>
            </div>

            <!-- Footer terms -->
            <div style="margin-top: 100px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #64748b;">
              This is a system-generated subscription receipt copy under our subscription portal. For any receipt revisions, please reach out to <a href="mailto:support@tradetrackerpro.in" style="color: #ca8a04; text-decoration: none; font-weight: bold;">support@tradetrackerpro.in</a>.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
                              : subData?.membershipTag === "ADMIN"
                              ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                              : subData?.membershipTag === "OPERATOR HQ"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
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
                            : subData?.membershipTag === "ADMIN"
                            ? "This is an Admin account with full unrestricted platform access. No renewal/expiry deadlines apply."
                            : subData?.membershipTag === "OPERATOR HQ"
                            ? "Your account is verified under Lala Operator. You have permanent lifetime access to all platform resources!"
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
                        {subData?.membershipTag === "ADMIN" && (
                          <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 pt-1">
                            <Shield className="h-3.5 w-3.5 text-amber-400 animate-pulse" /> Subscription Status:{" "}
                            <span className="text-foreground font-black uppercase">
                              Permanent Administrator
                            </span>
                          </div>
                        )}
                        {subData?.membershipTag === "OPERATOR HQ" && (
                          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
                            <Shield className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> Subscription Status:{" "}
                            <span className="text-foreground font-black uppercase">
                              Lifetime Access Verified
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
                      
                      {subData?.membershipTag !== "PREMIUM" && subData?.membershipTag !== "ADMIN" && subData?.membershipTag !== "OPERATOR HQ" && (
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
                                <th className="p-4 text-center">Action</th>
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
                                  <td className="p-4 text-right font-bold text-foreground">
                                    {tx.currency === "USD" ? "$" : "₹"}
                                    {tx.amount?.toLocaleString(tx.currency === "USD" ? "en-US" : "en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </td>
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
                                  <td className="p-4 text-center">
                                    {tx.status === "PAID" ? (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => downloadInvoicePDF(tx, session?.user)}
                                        className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary-foreground hover:bg-primary/20 border border-primary/20 hover:border-primary/50 cursor-pointer rounded-lg px-2.5 transition-all"
                                      >
                                        Invoice
                                      </Button>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground font-semibold uppercase opacity-40">—</span>
                                    )}
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
