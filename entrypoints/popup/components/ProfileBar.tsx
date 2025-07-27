import { useState, useEffect } from "react";

import PowerButton from "./PowerButton.js";

import { LogInIcon, LogOutIcon } from "@/assets/svg.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

export default function ProfileBar({ className = "" }) {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchSession() {
      let userSession: string | null = await storage.getItem("local:session");

      if (!userSession) return;

      const [, base64UrlSession] = userSession.split(".");
      const base64Session = base64UrlSession
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const sessionData: Record<string, string> = JSON.parse(
        atob(base64Session)
      );

      if (sessionData.globalName.length > 12)
        setDisplayName(sessionData.globalName.substring(0, 12) + "...");
      else setDisplayName(sessionData.globalName);

      setUsername(sessionData.username);
      setProfilePicture(sessionData.avatarImage);

      setSignedIn(true);
    }

    fetchSession();
  }, []);

  async function login() {
    window.open(
      "https://www.merciasquill.com/auth/extension/discord-sign-in",
      "_blank"
    );
  }

  async function logout() {
    await storage.removeItem("local:session");
    await storage.setItem("local:enabled", false);

    window.close();
  }

  if (signedIn === null) return null;

  if (!signedIn) {
    return (
      <>
        <PowerButton signedIn={signedIn} />

        <Button
          className={cn(
            "group/login w-60 rounded-2xl bg-zinc-900 p-6 px-4 hover:bg-zinc-900",
            className
          )}
          onClick={login}
        >
          <span className="flex flex-row items-center space-x-2 transition-all group-hover/login:scale-102 group-active/login:scale-100">
            <p className="text-xs font-medium text-zinc-500">
              Sign into Mercia&apos;s Quill
            </p>
            <LogInIcon className="stroke-zinc-500 transition-all group-hover/login:stroke-green-500/70 group-active/login:scale-100" />
          </span>
        </Button>
      </>
    );
  }

  if (!profilePicture || !username || !displayName) {
    throw new Error("Invalid session flow");
  }

  return (
    <>
      <PowerButton signedIn={signedIn} />

      <div
        className={cn(
          "mb-5 flex h-14 w-60 items-center justify-between rounded-2xl bg-zinc-900 px-4",
          className
        )}
      >
        <div className="flex flex-row items-center space-x-2">
          <Avatar>
            <AvatarImage src={profilePicture} />
            <AvatarFallback className="bg-zinc-800 text-zinc-500">
              PFP
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <p className="text-xs font-medium text-zinc-500"> {displayName} </p>
            <p className="text-xs font-light text-zinc-600">{username}</p>
          </div>
        </div>

        <Button
          className="group/logout hover:bg-zinc-900"
          size="icon"
          variant="ghost"
          onClick={logout}
        >
          <LogOutIcon className="stroke-zinc-500 transition-all group-hover/logout:scale-110 group-hover/logout:stroke-red-500/70 group-active/logout:scale-100" />
        </Button>
      </div>
    </>
  );
}
