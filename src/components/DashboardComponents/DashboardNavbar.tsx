import React from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Guide from "../Guide";
import { Pen } from "lucide-react";
import { UserProfile } from "./UserProfile";

export default function DashboardNavbar() {
  return (
    <div className="max-w-7xl mx-auto flex items-center justify-between py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-xl font-ClashDisplayMedium ">CrossPost Hub.</h1>
      <div className="flex items-center md:space-x-2 space-x-1">
        <div>
          <Button className="md:block hidden" variant={"default"}>Create Post</Button>
          <Button className="md:hidden block" variant={"secondary"} size={"sm"}>
            <Pen/>
          </Button>
        </div>
        <Guide />
        <UserProfile/>
      </div>
    </div>
  );
}