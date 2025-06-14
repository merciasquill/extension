import { type Browser } from "@wxt-dev/browser";

import { storage } from "#imports";

export default defineBackground(() => {
  console.log("Mercia's Quill background fetch script active");

  async function loadExtensionSettings() {
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
  }

  loadExtensionSettings();
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const hostname = new URL(tab.url).hostname;
  const parts = hostname.split(".");
  const rootDomain = parts.slice(-2).join(".");

  if (rootDomain !== "seaofthieves.com" && rootDomain !== "merciasquill.com") {
    return;
  }

  if (rootDomain === "seaofthieves.com") {
    return refreshSeaOfThievesCredentials(tabId, changeInfo, tab);
  }

  if (rootDomain === "merciasquill.com") {
    return loadSession();
  }
});

async function refreshSeaOfThievesCredentials(
  tabId: number,
  changeInfo: Browser.tabs.TabChangeInfo,
  tab: Browser.tabs.Tab
) {
  const extensionEnabled = await storage.getItem("local:enabled");

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

    const response = await browser.tabs
      .sendMessage(tabId, {
        action: "show_toast",
        type: "error_toast",
        header: "Unknown Session",
        content: "Failed to sign in to Mercia's Quill",
        toastAction: {
          href: "https://www.merciasquill.com/auth/extension/discord-sign-in",
        },
      })
      .catch(() => null);

    if (!response) return;

    return browser.cookies.set({
      url: "https://www.merciasquill.com",
      domain: ".merciasquill.com",
      name: "extension:unknown-session-notified",
      value: "true",

      expirationDate: Date.now() / 1000 + 600, // 10 minutes
    });
  }

  if (typeof activeSession !== "string") throw Error("Invalid session");
  // -------------------------------------------------------------------------------

  // ------------------------------- User Agent Check -------------------------------
  let userAgent: string | null = await storage.getItem("local:user-agent");

  if (!userAgent) {
    const response = await browser.tabs.sendMessage(tabId, {
      action: "user_agent_prompt",
    });

    userAgent = response.userAgent as string;
    await storage.setItem("local:user-agent", response.userAgent);
  }
  // -------------------------------------------------------------------------------

  const ratCookie = await browser.cookies.get({
    url: "https://www.seaofthieves.com",
    name: "rat",
  });

  if (!ratCookie) return console.log("Missing rat token");

  const ratCookieValue = ratCookie.value;
  const ratCookieExpiration = ratCookie.expirationDate ?? 0;

  const storageLocation = await storage.getItem("local:storage-location");

  if (storageLocation === "client") {
    await browser.cookies.set({
      url: "https://www.merciasquill.com",
      domain: ".merciasquill.com",
      name: "seaofthieves:rat",
      value: ratCookie.value,
      expirationDate: ratCookieExpiration,

      secure: true,
      httpOnly: true,
      sameSite: "strict",
    });

    return console.log("Saved rat token to client");
  }

  const apiUrl = new URL(
    "https://api.merciasquill.com/auth/seaofthieves/tokens"
  );

  const headers = new Headers();
  headers.append("x-jwt-token", activeSession);

  const body = new URLSearchParams();
  body.append("rat", ratCookie.value);
  body.append("expiresAt", Math.round(ratCookieExpiration * 1000) + "");
  body.append("userAgent", userAgent);

  const response = await fetch(apiUrl, { method: "PUT", headers, body });

  // Invalid session cookie
  if (response.status === 401) {
    // await storage.removeItem("local:session");
    return await browser.cookies.remove({
      url: "https://www.merciasquill.com",
      name: "session:jwt_token",
    });
  }

  if (!response.ok) return console.log("Failed to save rat token");

  await storage.setItem("local:last-update", Date.now());
  console.log("Saved rat token to server");
}

async function loadSession() {
  const session = await storage.getItem("local:session");
  if (session) return;

  const cookieSession = await browser.cookies.get({
    url: "https://www.merciasquill.com",
    name: "session:jwt_token",
  });

  if (!cookieSession) return;

  await storage.setItem("local:session", cookieSession.value);
}
