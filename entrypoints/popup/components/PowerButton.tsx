import { useState, useEffect } from "react";

import CredentialStorageRadio from "./CredentialStorageRadio.js";

import { storage } from "#imports";
import { PowerIcon } from "@/assets/svg.tsx";
import { cn } from "@/lib/utils.ts";

export default function PowerButton({ signedIn = false }) {
  const [status, setStatus] = useState<boolean | null>(null);
  const [rotation, setRotation] = useState<number | null>(null);

  const localStorageKey = "local:enabled";

  useEffect(() => {
    storage.getItem(localStorageKey).then((enabled) => {
      if (enabled === null) storage.setItem(localStorageKey, true);

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

    storage.setItem(localStorageKey, status);
  }, [status]);

  function toggle() {
    setStatus((previousState) => !previousState);
    setRotation((previousDegrees) => (previousDegrees ?? 0) + 180);
  }

  if (status === null) return null;

  return (
    <>
      <button
        className="group mb-5 flex w-full justify-center"
        onClick={toggle}
      >
        <PowerIcon
          className={cn(
            `transition-all group-hover:scale-110 group-active:scale-100`,
            status && "stroke-zinc-500",
            !status && "stroke-zinc-800"
          )}
          size={150}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </button>

      <CredentialStorageRadio signedIn={signedIn} status={status} />
    </>
  );
}
