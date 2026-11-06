// import ProfileBar from "./components/ProfileBar.js";

import { Link, Surface } from "@heroui/react";
import { cn } from "cn";
import ms from "ms";
import { useEffect, useState } from "react";

import LogIn04Icon from "@/components/svg/LogIn04Icon";
import LogOut01Icon from "@/components/svg/LogOut01Icon";
import { StorageKeys } from "@/lib/enums";
import { loginUrl, logoutUrl } from "@/lib/links";

import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const [updatedAt, setUpdatedAt] = useState<number>(0);
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    storage.getItem(StorageKeys.UpdatedAt).then((lastStorageUpdate) => {
      if (typeof lastStorageUpdate === "number") {
        return setUpdatedAt(lastStorageUpdate);
      }
    });

    return () => clearInterval(interval);
  }, []);

  const authContext = useAuth();
  if (!authContext.signed) return <LoginPage />;

  return <SignedInPage now={now} updatedAt={updatedAt} />;
}

function LoginPage() {
  return (
    <Surface className="flex w-72 flex-col items-center justify-center gap-10 rounded-none border-2 p-12">
      <Link href={loginUrl} target="_blank">
        <LogIn04Icon className="text-muted dark:text-segment size-48" />
      </Link>

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-muted text-2xl font-bold">Login Required</h1>
        <p className="text-muted text-center text-balance">
          This extension requires you to be{" "}
          <Link href={loginUrl} target="_blank">
            logged in
          </Link>{" "}
          to {"Mercia's"} Quill.
        </p>
      </div>
    </Surface>
  );
}

function SignedInPage({ now, updatedAt }: { now: number; updatedAt: number }) {
  const authContext = useAuth();

  if (!authContext.signed) throw new Error("not signed in");

  let pingColor;
  if (now - updatedAt < ms("10m")) {
    pingColor = "bg-emerald-400";
  } else if (updatedAt > 0) {
    pingColor = "bg-amber-400";
  } else {
    pingColor = "bg-red-400";
  }

  return (
    <div className="flex w-72 flex-col gap-4 p-8">
      <Surface className="flex flex-row items-center justify-start gap-2 rounded-xl p-4">
        <img
          alt={authContext.user.username}
          className="size-8 shrink-0 rounded-full"
          src={authContext.user.avatarUrl}
        />

        <div className="min-w-0 flex-1 gap-2">
          <h1 className="truncate text-xs font-bold">
            {authContext.user.displayName}
          </h1>
          <p className="text-muted truncate text-xs tracking-wide">
            {authContext.user.username}
          </p>
        </div>

        <Link
          className="hover:bg-border group shrink-0 rounded-lg p-2"
          href={logoutUrl}
          target="_blank"
        >
          <LogOut01Icon className="text-muted group-hover:text-danger size-4 transition-colors" />
        </Link>
      </Surface>

      <div className="flex w-full flex-row items-center justify-center gap-2">
        <div className="relative size-2">
          <div className={cn("absolute inset-0 rounded-full", pingColor)} />
          <div
            className={cn(
              "absolute inset-0 animate-ping rounded-full",
              pingColor
            )}
          />
        </div>

        <p className="text-muted text-xs">
          Last Updated:{" "}
          {updatedAt > 0 ? humanizeTime(new Date(updatedAt)) : "Never"}
        </p>
      </div>
    </div>
  );
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function humanizeTime(date: Date): string {
  const seconds = (date.getTime() - Date.now()) / 1000;
  const abs = Math.abs(seconds);

  if (abs < 60) return rtf.format(Math.round(seconds), "second");
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(seconds / 86400), "day");
  if (abs < 31536000) return rtf.format(Math.round(seconds / 2592000), "month");

  return rtf.format(Math.round(seconds / 31536000), "year");
}
