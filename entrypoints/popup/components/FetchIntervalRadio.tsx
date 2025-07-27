import { useEffect, useState } from "react";

import { storage } from "#imports";
import { InfoIcon } from "@/assets/svg.tsx";
import { cn } from "@/lib/utils.ts";

export default function FetchIntervalRadio({ clientSide = false }) {
  const [fetchInterval, setFetchInterval] = useState<number | null>(null);

  const localStorageKey = "local:fetch-interval";

  useEffect(() => {
    storage.getItem(localStorageKey).then((interval) => {
      if (interval === null) storage.setItem(localStorageKey, 12);

      if (typeof interval === "number") setFetchInterval(interval);
      else setFetchInterval(12);
    });
  }, []);

  useEffect(() => {
    if (fetchInterval === null) return;

    storage.setItem(localStorageKey, fetchInterval);
  }, [fetchInterval]);

  if (fetchInterval === null) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-start overflow-hidden transition-all duration-700",
        !clientSide && "max-h-96 ease-in",
        clientSide && "max-h-0 ease-out"
      )}
    >
      <div className="mb-1 flex items-baseline-last space-x-1">
        <p className="text-sm font-medium text-zinc-500">Data Fetch Interval</p>

        <a
          href="https://docs.merciasquill.com/sea-of-thieves-api/extension#fetch-cycles"
          rel="noreferrer"
          target="_blank"
        >
          <InfoIcon className="stroke-zinc-500" size={12} />
        </a>
      </div>

      <div className="flex h-7 w-full flex-row items-center rounded-md bg-zinc-900 p-1">
        <SegmentedButtonItem
          className={cn(
            fetchInterval === 0 && "!bg-zinc-700 font-bold text-zinc-950"
          )}
          onClick={() => setFetchInterval(0)}
        >
          0
        </SegmentedButtonItem>
        <SegmentedButtonItem
          className={cn(
            fetchInterval === 12 && "!bg-zinc-700 font-bold text-zinc-950"
          )}
          onClick={() => setFetchInterval(12)}
        >
          12
        </SegmentedButtonItem>
        <SegmentedButtonItem
          className={cn(
            fetchInterval === 24 && "!bg-zinc-700 font-bold text-zinc-950"
          )}
          onClick={() => setFetchInterval(24)}
        >
          24
        </SegmentedButtonItem>
        <SegmentedButtonItem
          className={cn(
            fetchInterval === 48 && "!bg-zinc-700 font-bold text-zinc-950"
          )}
          onClick={() => setFetchInterval(48)}
        >
          48
        </SegmentedButtonItem>
        <SegmentedButtonItem
          className={cn(
            fetchInterval === 72 && "!bg-zinc-700 font-bold text-zinc-950"
          )}
          onClick={() => setFetchInterval(72)}
        >
          72
        </SegmentedButtonItem>
      </div>
    </div>
  );
}

function SegmentedButtonItem({ className = "", ...props }) {
  return (
    <button
      className={cn(
        "h-full flex-1 rounded-sm p-0 font-medium text-zinc-500 hover:scale-105 hover:bg-zinc-800 active:scale-100",
        className
      )}
      {...props}
    />
  );
}
