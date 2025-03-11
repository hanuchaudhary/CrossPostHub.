"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/AuthStore/useAuthStore";
import SSEListener from "../Tools/SSEListner";
import UpgradeButton from "../Buttons/UpgradeButton";
import Guide from "../Guide";
import NotificationButton from "../Buttons/NotificationsButton";
import { Profile } from "./Profile";
import { MobileMenu } from "./MobileMenu";

export default function DashboardNavbar() {
  const pathname = usePathname();
  const { data } = useSession();
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <header className="w-full flex items-center justify-between py-4 px-4 md:max-w-6xl mx-auto border-b border-b-secondary/20">
      {data?.user.id && <SSEListener userId={data.user.id} />}
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-lg font-ClashDisplayMedium text-emerald-500">
            CrossPostHub.
          </span>
        </Link>
        <div className="hidden md:block">
          <UpgradeButton />
        </div>
      </div>

      <nav className="flex items-center gap-1 md:gap-4">
        {[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/create", label: "Create" },
          { href: "/edit", label: "Edit Image" },
          { href: "/payment/transactions", label: "Transactions" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`${
              href === "/dashboard" || href === "/create" ? "inline-flex" : "hidden md:inline-flex"
            } items-center justify-center rounded-md text-sm font-medium transition-colors hover:text-emerald-300 ${
              pathname === href ? "text-emerald-500" : ""
            }`}
          >
            {label}
          </Link>
        ))}

        <div className="hidden md:block">
          <Guide />
        </div>

        <div className="hidden md:block">
          <NotificationButton />
        </div>

        <div className="hidden md:block">
          <Profile />
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px]">
              <MobileMenu />
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
