import { useEffect, useState } from "react";
import { storage } from "#imports";

import FetchIntervalRadio from "./FetchIntervalRadio.js";

import { InfoIcon } from "@/assets/svg.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

export default function ({ status = false, signedIn = false }) {
  const [clientSide, setClientSide] = useState<boolean | null>(null);

  useEffect(() => {
    storage.getItem("local:storage-location").then((storageLocation) => {
      if (storageLocation === "client") setClientSide(true);
      else setClientSide(false);
    });
  }, []);

  useEffect(() => {
    if (clientSide === null) return;

    if (clientSide) storage.setItem("local:storage-location", "client");
    else storage.setItem("local:storage-location", "server");
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
            target="_blank"
          >
            <InfoIcon size={12} className="stroke-zinc-500" />
          </a>
        </div>

        <div className="flex w-full flex-row justify-center space-x-3 px-1">
          <Button
            onClick={() => setClientSide(false)}
            className={cn(
              "flex-1 overflow-visible border-2 border-yellow-500/10 bg-yellow-500/10 p-3 text-xs font-normal text-yellow-500/60 transition-all hover:scale-102 hover:bg-yellow-500/15 hover:text-yellow-500/70 active:scale-100",
              clientSide && "bg-transparent"
            )}
          >
            Server-Side
          </Button>

          <Button
            onClick={() => setClientSide(true)}
            className={cn(
              "flex-1 overflow-visible border-2 border-zinc-300/10 bg-zinc-300/10 p-3 text-xs font-normal text-zinc-400/60 transition-all hover:scale-105 hover:bg-zinc-300/15 hover:text-zinc-400/70 active:scale-100",
              !clientSide && "bg-transparent"
            )}
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
