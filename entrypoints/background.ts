import type { Browser } from "@wxt-dev/browser";

import { decodeJwt } from "jose";

import { storage } from "#imports";

export default defineBackground(() => {
  // eslint-disable-next-line no-console
  console.log("Mercia's Quill background script active");
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
});

async function refreshSeaOfThievesCredentials(
  tabId: number,
  _changeInfo: Browser.tabs.TabChangeInfo,
  _tab: Browser.tabs.Tab
) {
  const extensionEnabled = await storage.getItem("local:enabled");

  // can be null on the initial installation
  if (extensionEnabled === false) return;

  const lastUpdate = await storage.getItem("local:last-update");
  const lastUpdateValid = lastUpdate && typeof lastUpdate === "number";
  if (lastUpdateValid && lastUpdate > Date.now() - 60 * 10 * 1000) {
    // eslint-disable-next-line no-console
    return console.log("rat token synced within last 10 minutes");
  }

  // -------------------------------- Session Check --------------------------------

  const sessionData = await fetchSession();

  if (!sessionData.success) {
    const notifiedCookie = await browser.cookies.get({
      url: "https://extension.merciasquill.com",
      name: "unknown_session_notified",
    });

    // eslint-disable-next-line no-console
    if (notifiedCookie) return console.log("unknown session already notified");

    const response = await browser.tabs
      .sendMessage(tabId, {
        action: "show_toast",
        type: "error_toast",
        header: "Unknown Session",
        content: "Failed to sign in to Mercia's Quill",
        toastAction: {
          href: "https://auth.merciasquill.com/login",
        },
      })
      .catch(() => null);

    if (!response) return;

    return browser.cookies.set({
      url: "https://extension.merciasquill.com",
      domain: "extension.merciasquill.com",
      name: "unknown_session_notified",
      value: "true",

      expirationDate: Date.now() / 1000 + 60 * 10, // 10 minutes
    });
  }
  // -------------------------------------------------------------------------------

  // ------------------------------- User Agent Check -------------------------------
  let userAgent = await storage.getItem("local:user-agent");

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

  // eslint-disable-next-line no-console
  if (!ratCookie) return console.log("rat token undefined");

  const ratCookieExpiration = ratCookie.expirationDate ?? 0;

  const storageLocation = await storage.getItem("local:storage-location");

  if (storageLocation === "client") {
    await browser.cookies.set({
      url: "https://auth.merciasquill.com",
      domain: ".merciasquill.com",
      name: "session.seaofthieves.rat.token",
      value: ratCookie.value,
      expirationDate: ratCookieExpiration,

      secure: true,
      httpOnly: true,
      sameSite: "lax",
    });

    // eslint-disable-next-line no-console
    return console.log("saved rat token to client");
  }

  const apiUrl = new URL(
    `https://api.merciasquill.com/seaofthieves/tokens/${sessionData.session.sub}`
  );

  const headers = new Headers();
  headers.append("x-jwt-token", sessionData.jwt);

  const body = new URLSearchParams();
  body.append("rat", ratCookie.value);
  body.append("expiresAt", Math.round(ratCookieExpiration * 1000) + "");
  body.append("userAgent", userAgent as string);

  const response = await fetch(apiUrl, { method: "PUT", headers, body });

  // Invalid session cookie
  if (response.status === 401) {
    return await browser.tabs.create({
      url: "https://auth.merciasquill.com/logout",
      active: false,
    });
  }

  // eslint-disable-next-line no-console
  if (!response.ok) return console.log("failed to save rat token");

  await storage.setItem("local:last-update", Date.now());
  // eslint-disable-next-line no-console
  console.log("successfully saved rat token to server");
}

type FetchSessionReturn =
  | { success: false }
  | {
      success: true;
      session: {
        sub: string;
        userId: string;
        username: string;
        displayName: string;
        avatar: string;
      };
      jwt: string;
    };

export async function fetchSession(): Promise<FetchSessionReturn> {
  const accessTokenCookie = await browser.cookies.get({
    url: "https://auth.merciasquill.com",
    name: "session.access.token",
  });

  if (!accessTokenCookie) return { success: false };

  return {
    success: true,
    session: decodeJwt(accessTokenCookie.value),
    jwt: accessTokenCookie.value,
  };
}
