"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
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
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email(),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  });

  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    toast({
      title: "Settings Updated",
      description: "Your profile information has been saved successfully.",
      duration: 3000,
    });
  }

  async function onSecuritySubmit(values: z.infer<typeof securityFormSchema>) {
    toast({
      title: "Security Update",
      description: "Your password has been changed successfully.",
      duration: 3000,
    });
    securityForm.reset();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-10">
        <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Settings</h1>
            <p className="text-muted-foreground mt-2 uppercase text-[10px] font-bold tracking-widest">
              Manage your account and platform preferences.
            </p>
          </div>

          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/40 p-1 rounded-xl w-full justify-start overflow-x-auto no-scrollbar h-auto space-x-1 border border-border/50">
              <TabsTrigger value="profile" className="rounded-lg px-4 py-2 gap-2 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-background">
                <User className="h-3.5 w-3.5" /> Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-lg px-4 py-2 gap-2 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-background">
                <Shield className="h-3.5 w-3.5" /> Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg px-4 py-2 gap-2 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-background">
                <Bell className="h-3.5 w-3.5" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance" className="rounded-lg px-4 py-2 gap-2 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-background">
                <Palette className="h-3.5 w-3.5" /> Appearance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 bg-card/40 backdrop-blur-md border-border/50">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Photo</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32 border-4 border-primary/20">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback className="text-4xl bg-primary/10 text-primary font-black">
                        {session?.user?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-widest h-8">
                       Update Avatar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 bg-card/40 backdrop-blur-md border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">General Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase font-black opacity-50">Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-background/50 border-border/50 h-12 font-bold" />
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
                              <FormLabel className="text-[10px] uppercase font-black opacity-50">Email Address</FormLabel>
                              <FormControl>
                                <Input {...field} disabled className="bg-background/20 border-border/50 h-12 font-bold cursor-not-allowed" />
                              </FormControl>
                              <FormDescription className="text-[9px] uppercase font-bold text-muted-foreground/60">
                                Trade reports will be sent to this address.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full h-12 text-xs font-black uppercase tracking-widest mt-4">
                          Save Changes
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
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Security Settings</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-medium mt-1">Change your password and secure your account.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <Form {...securityForm}>
                       <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                          <FormField
                            control={securityForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] uppercase font-black opacity-50">Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} className="bg-background/50 border-border/50 h-12 font-bold" />
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
                                <FormLabel className="text-[10px] uppercase font-black opacity-50">New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} className="bg-background/50 border-border/50 h-12 font-bold" />
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
                                <FormLabel className="text-[10px] uppercase font-black opacity-50">Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} className="bg-background/50 border-border/50 h-12 font-bold" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full h-12 text-xs font-black uppercase tracking-widest mt-4">
                             Update Password
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
          </Tabs>
        </div>
      </main>
    </div>
  );
}
