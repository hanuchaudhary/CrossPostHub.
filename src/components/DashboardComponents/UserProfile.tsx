"use client";

import React from "react";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const UserProfile: React.FC = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/auth/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  console.log("user: ", user);
  

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user logged in</div>;
  }

  return (
    <div className="flex gap-1 items-center md:bg-secondary/30 md:border border-secondary/40 md:px-2 md:py-1 md:rounded-lg ">
      <Avatar>
        <AvatarImage src={user.photoURL || ""}></AvatarImage>
        <AvatarFallback className="uppercase">
          {(user.displayName && user.displayName[0]) || "CH"}
        </AvatarFallback>
      </Avatar>
      <div className="md:block hidden">
        <p className="text-base font-ClashDisplayMedium leading-none">
          {user.displayName || "Cross Post Hub"}
        </p>
        <p className="text-xs text-neutral-300">
          {user.email || "kushchaudharyog@gmail.com"}
        </p>
      </div>
      {/* <Button onClick={handleSignOut} className="mt-4">
        Sign Out
      </Button> */}
    </div>
  );
};