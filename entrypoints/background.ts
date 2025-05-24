import { type Browser } from "@wxt-dev/browser";

import { storage } from "#imports";

export default defineBackground(async () => {
  console.log("Mercia's Quill background fetch script active");

  const enabled = await storage.getItem("local:enabled");
  const location = await storage.getItem("local:storage-location");
  const interval = await storage.getItem("local:fetch-interval");

  if (enabled === null) {
    await storage.setItem("local:enabled", true);
  }
  if (location === null) {
    await storage.setItem("local:storage-location", "server");
  }
  if (interval === null) {
    await storage.setItem("local:fetch-interval", 12);
  }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const hostname = new URL(tab.url).hostname;
  const parts = hostname.split(".");
  const rootDomain = parts.slice(-2).join(".");

  if (rootDomain !== "seaofthieves.com" && rootDomain !== "merciasquill.com") {
    return;
  }

  console.log(tab.url);

  if (rootDomain === "seaofthieves.com") {
    return refreshSeaOfThievesCredentials(tabId, changeInfo, tab);
  }
});

async function refreshSeaOfThievesCredentials(
  tabId: number,
  changeInfo: Browser.tabs.TabChangeInfo,
  tab: Browser.tabs.Tab
) {
  const extensionEnabled = await storage.getItem("local:enabled");
  console.log(extensionEnabled);

  // can be null on the initial installation
  // default to disabled since may be signed out
  if (extensionEnabled === false) return;

  const lastUpdate = await storage.getItem("local:last-update");
  const lastUpdateValid = lastUpdate && typeof lastUpdate === "number";
  if (lastUpdateValid && lastUpdate > Date.now() - 60 * 60 * 10 * 1000) {
    return console.log("Synced within last 10 minutes");
  }

  // -------------------------------- Session Check --------------------------------
  const activeSession = await storage.getItem("local:session");

  if (!activeSession) {
    const notifiedCookie = await browser.cookies.get({
      url: "https://www.merciasquill.com",
      name: "extension:unknown-session-notified",
    });

    if (notifiedCookie) return console.log("Missing session notified");

    await browser.tabs.sendMessage(tabId, {
      type: "error_toast",
      header: "Unknown Session",
      content: "Failed to sign in to Mercia's Quill",
      action: {
        href: "https://www.merciasquill.com/auth/extension/discord-sign-in",
      },
    });

    return await browser.cookies.set({
      url: "https://www.merciasquill.com",
      domain: ".merciasquill.com",
      name: "extension:unknown-session-notified",
      value: "true",

      expirationDate: Date.now() / 1000 + 600, // 10 minutes
    });
  }

  if (typeof activeSession !== "string") throw Error("Invalid session");
  // -------------------------------------------------------------------------------

  const ratCookie = await browser.cookies.get({
    url: "https://www.seaofthieves.com",
    name: "rat",
  });

  if (!ratCookie) return console.log("Missing rat token");

  const storageLocation = await storage.getItem("local:storage-location");

  if (storageLocation === "client") {
    return await browser.cookies.set({
      url: "https://www.merciasquill.com",
      domain: ".merciasquill.com",
      name: "seaofthieves:rat",
      value: ratCookie.value,

      secure: true,
      httpOnly: true,
      sameSite: "strict",
    });
  }

  const apiUrl = new URL(
    "https://api.merciasquill.com/auth/seaofthieves/tokens"
  );

  const body = new URLSearchParams({ rat: ratCookie.value });
  const headers = new Headers({ Authorization: activeSession });

  const response = await fetch(apiUrl, { method: "POST", body, headers });

  // Invalid session cookie
  if (response.status === 401) {
    await storage.removeItem("local:session");
    return await browser.cookies.remove({
      url: "https://www.merciasquill.com",
      name: "extension:session",
    });
  }

  if (!response.ok) return;

  await storage.setItem("local:last-update", Date.now());
}
