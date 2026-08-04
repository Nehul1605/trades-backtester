"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function NavbarMobileMenu() {
  const [open, setOpen] = React.useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[280px] bg-background/95 backdrop-blur-md border-l border-border/40 p-6 flex flex-col justify-between"
      >
        <div className="space-y-6">
          <SheetHeader className="text-left border-b border-border/10 pb-4">
            <SheetTitle className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
              Navigation
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-4 mt-4">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Reviews", href: "#reviews" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={handleLinkClick}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-1 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-3 border-t border-border/10 pt-6">
          <Button
            asChild
            variant="outline"
            className="w-full h-10 border-border/60"
            onClick={handleLinkClick}
          >
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button
            asChild
            className="w-full h-10 bg-primary text-primary-foreground"
            onClick={handleLinkClick}
          >
            <Link href="/auth/sign-up">Start Free</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
