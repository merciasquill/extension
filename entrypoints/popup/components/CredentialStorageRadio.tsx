import { useEffect, useState } from "react";

import FetchIntervalRadio from "./FetchIntervalRadio.tsx";

import { storage } from "#imports";
import { InfoIcon } from "@/assets/svg.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

export default function CredentialStorageRadio({
  status = false,
  signedIn = false,
}) {
  const [clientSide, setClientSide] = useState<boolean | null>(null);

  const localStorageKey = "local:storage-location";

  useEffect(() => {
    storage.getItem(localStorageKey).then((storageLocation) => {
      if (storageLocation === null) storage.setItem(localStorageKey, "server");

      if (storageLocation === "client") setClientSide(true);
      else setClientSide(false);
    });
  }, []);

  useEffect(() => {
    if (clientSide === null) return;

    if (clientSide) storage.setItem(localStorageKey, "client");
    else storage.setItem(localStorageKey, "server");
  }, [clientSide]);

  if (clientSide === null) return null;

  const showElements = status && signedIn;

  return (
    <div
      className={cn(
        "flex w-52 flex-col space-y-3 overflow-hidden transition-all duration-700",
        showElements && "max-h-96 ease-in",
        !showElements && "max-h-0 ease-out"
      )}
    >
      <div className="flex flex-col items-start">
        <div className="mb-1 flex items-baseline-last space-x-2">
          <p className="text-sm font-medium text-zinc-500">
            Credential Storage
          </p>

          <a
            href="https://docs.merciasquill.com/sea-of-thieves-api/extension#credential-storage-options"
            rel="noreferrer"
            target="_blank"
          >
            <InfoIcon className="stroke-zinc-500" size={12} />
          </a>
        </div>

        <div className="flex w-full flex-row justify-center space-x-3 px-1">
          <Button
            className={cn(
              "flex-1 overflow-visible border-2 border-yellow-500/10 bg-yellow-500/10 p-3 text-xs font-normal text-yellow-500/60 transition-all hover:scale-102 hover:bg-yellow-500/15 hover:text-yellow-500/70 active:scale-100",
              clientSide && "bg-transparent"
            )}
            onClick={() => setClientSide(false)}
          >
            Server-Side
          </Button>

          <Button
            className={cn(
              "flex-1 overflow-visible border-2 border-zinc-300/10 bg-zinc-300/10 p-3 text-xs font-normal text-zinc-400/60 transition-all hover:scale-105 hover:bg-zinc-300/15 hover:text-zinc-400/70 active:scale-100",
              !clientSide && "bg-transparent"
            )}
            onClick={() => setClientSide(true)}
          >
            Client-Side
          </Button>
        </div>
      </div>

      <FetchIntervalRadio clientSide={clientSide} />

      <div className="h-5 w-full" />
    </div>
  );
}
