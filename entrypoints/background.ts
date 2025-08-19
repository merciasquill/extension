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
  let activeSession = await storage.getItem("local:session");

  attemptSessionRecovery: if (!activeSession) {
    const cookieSession = await browser.cookies.get({
      url: "https://www.merciasquill.com",
      name: "session-long_jwt_token",
    });

    if (cookieSession) {
      activeSession = cookieSession.value;
      await storage.setItem("local:session", activeSession);

      break attemptSessionRecovery;
    }

    const notifiedCookie = await browser.cookies.get({
      url: "https://extension.merciasquill.com",
      name: "unknown_session_notified",
    });

    // eslint-disable-next-line no-console
    if (notifiedCookie) return console.log("unknown mq session notified");

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
      url: "https://extension.merciasquill.com",
      domain: "extension.merciasquill.com",
      name: "unknown_session_notified",
      value: "true",

      expirationDate: Date.now() / 1000 + 60 * 10, // 10 minutes
    });
  }

  if (typeof activeSession !== "string") throw Error("Invalid session");
  // -------------------------------------------------------------------------------

  // ------------------------------- User Agent Check -------------------------------
  const userAgentCookie = await browser.cookies.get({
    url: "https://extension.merciasquill.com",
    name: "local_user_agent",
  });

  let userAgent = userAgentCookie?.value;

  if (!userAgent) {
    const response = await browser.tabs.sendMessage(tabId, {
      action: "user_agent_prompt",
    });

    userAgent = response.userAgent as string;
    await storage.setItem("local:user-agent", response.userAgent);

    await browser.cookies.set({
      url: "https://extension.merciasquill.com",
      domain: "extension.merciasquill.com",
      name: "local_user_agent",
      value: encodeURIComponent(response.userAgent),

      expirationDate: Date.now() / 1000 + 60 * 60 * 24 * 7, // 1 week
    });
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
      url: "https://www.merciasquill.com",
      domain: ".merciasquill.com",
      name: "session-seaofthieves_rat_token",
      value: ratCookie.value,
      expirationDate: ratCookieExpiration,

      secure: true,
      httpOnly: true,
      sameSite: "strict",
    });

    // eslint-disable-next-line no-console
    return console.log("saved rat token to client");
  }

  const decodedJwt = decodeJwt(activeSession);

  const apiUrl = new URL(
    `https://api.merciasquill.com/seaofthieves/tokens/${decodedJwt.sub}`
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
    await storage.removeItem("local:session");
    return await browser.cookies.remove({
      url: "https://www.merciasquill.com",
      name: "session-jwt_token",
    });
  }

  // eslint-disable-next-line no-console
  if (!response.ok) return console.log("failed to save rat token");

  await storage.setItem("local:last-update", Date.now());
  // eslint-disable-next-line no-console
  console.log("successfully saved rat token to server");
}

type AttemptSessionRecoveryReturn =
  | { success: false }
  | { success: true; session: string };

export async function attemptSessionRecovery(): Promise<AttemptSessionRecoveryReturn> {
  const cookieSession = await browser.cookies.get({
    url: "https://extension.merciasquill.com",
    name: "session-long_jwt_token",
  });

  if (!cookieSession) return { success: false };

  await storage.setItem("local:session", cookieSession.value);
  return { success: true, session: cookieSession.value };
}
