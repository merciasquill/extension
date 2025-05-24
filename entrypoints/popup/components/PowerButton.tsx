import { useState, useEffect } from "react";

import { storage } from "#imports";
import { cn } from "@/lib/utils.ts";

import { PowerIcon } from "@/assets/svg.tsx";
import CredentialStorageRadio from "./CredentialStorageRadio.js";

export default function ({ signedIn = false }) {
  const [status, setStatus] = useState<boolean | null>(null);
  const [rotation, setRotation] = useState<number | null>(null);

  useEffect(() => {
    storage.getItem("local:enabled").then((enabled) => {
      if (enabled === false) {
        setStatus(false);
        setRotation(180);
      } else {
        setStatus(true);
        setRotation(0);
      }
    });
  }, []);

  useEffect(() => {
    if (status === null) return;
    storage.setItem("local:enabled", status);
  }, [status]);

  function toggle() {
    setStatus((previousState) => !previousState);
    setRotation((previousDegrees) => (previousDegrees ?? 0) + 180);
  }

  if (status === null) return null;

  return (
    <>
      <button
        onClick={toggle}
        className="group mb-5 flex w-full justify-center"
      >
        <PowerIcon
          size={150}
          style={{ transform: `rotate(${rotation}deg)` }}
          className={cn(
            `transition-all group-hover:scale-110 group-active:scale-100`,
            status && "stroke-zinc-500",
            !status && "stroke-zinc-800"
          )}
        />
      </button>

      <CredentialStorageRadio status={status} signedIn={signedIn} />
    </>
  );
}
