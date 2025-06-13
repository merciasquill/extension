import { useEffect, useState } from "react";
import { storage } from "#imports";

import { InfoIcon } from "@/assets/svg.tsx";
import { cn } from "@/lib/utils.ts";

export default ({ clientSide = false }) => {
  const [fetchInterval, setFetchInterval] = useState<number | null>(null);

  useEffect(() => {
    storage.getItem("local:fetch-interval").then((interval) => {
      if (typeof interval === "number") setFetchInterval(interval);
      else setFetchInterval(12);
    });
  }, []);

  useEffect(() => {
    if (fetchInterval === null) return;

    storage.setItem("local:fetch-interval", fetchInterval);
  }, [fetchInterval]);

  if (fetchInterval === null) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center items-start overflow-hidden transition-all duration-700",
        !clientSide && "max-h-96 ease-in",
        clientSide && "max-h-0 ease-out"
      )}
    >
      <div className="mb-1 flex items-baseline-last space-x-1">
        <p className="text-sm font-medium text-zinc-500">Data Fetch Interval</p>

        <a
          href="https://docs.merciasquill.com/sea-of-thieves-api/extension#fetch-cycles"
          target="_blank"
        >
          <InfoIcon size={12} className="stroke-zinc-500" />
        </a>
      </div>

      <div className="flex h-7 w-full flex-row items-center rounded-md bg-zinc-900 p-1">
        <SegmentedButtonItem
          onClick={() => setFetchInterval(0)}
          className={cn(
            fetchInterval === 0 && "!bg-zinc-700 font-bold text-zinc-950"
          )}
        >
          0
        </SegmentedButtonItem>
        <SegmentedButtonItem
          onClick={() => setFetchInterval(12)}
          className={cn(
            fetchInterval === 12 && "!bg-zinc-700 font-bold text-zinc-950"
          )}
        >
          12
        </SegmentedButtonItem>
        <SegmentedButtonItem
          onClick={() => setFetchInterval(24)}
          className={cn(
            fetchInterval === 24 && "!bg-zinc-700 font-bold text-zinc-950"
          )}
        >
          24
        </SegmentedButtonItem>
        <SegmentedButtonItem
          onClick={() => setFetchInterval(48)}
          className={cn(
            fetchInterval === 48 && "!bg-zinc-700 font-bold text-zinc-950"
          )}
        >
          48
        </SegmentedButtonItem>
        <SegmentedButtonItem
          onClick={() => setFetchInterval(72)}
          className={cn(
            fetchInterval === 72 && "!bg-zinc-700 font-bold text-zinc-950"
          )}
        >
          72
        </SegmentedButtonItem>
      </div>
    </div>
  );
};

function SegmentedButtonItem({ className = "", ...props }) {
  return (
    <button
      className={cn(
        "h-full flex-1 rounded-sm p-0 font-medium text-zinc-500 hover:scale-105 hover:bg-zinc-800 active:scale-100",
        className
      )}
      {...props}
    ></button>
  );
}
