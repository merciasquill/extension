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

  if (rootDomain === "seaofthieves.com") {
    return refreshSeaOfThievesCredentials(tabId, changeInfo, tab);
  }
});

const SEA_OF_THIEVES_COOKIE_URL = "https://www.seaofthieves.com";

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
    return await browser.tabs
      .sendMessage(tabId, {
        action: "show_toast",
        type: "error_toast",
        header: "Unknown Session",
        content: "Not signed into Mercia's Quill",
        toastAction: {
          href: "https://auth.merciasquill.com/login",
        },
      })
      .catch(() => null);
  }
  // -------------------------------------------------------------------------------

  // ------------------------------- Rat Token Check -------------------------------
  const ratTokenCookie = await browser.cookies.get({
    url: SEA_OF_THIEVES_COOKIE_URL,
    name: "rat",
  });
  // eslint-disable-next-line no-console
  if (!ratTokenCookie) return console.log("rat token undefined");

  const ratCookieExpiration = (ratTokenCookie.expirationDate ?? 0) * 1000;
  if (Date.now() > ratCookieExpiration) {
    // eslint-disable-next-line no-console
    return console.log("rat token expired");
  }

  // -------------------------------------------------------------------------------

  // ------------------------------- Awfs Token Check -------------------------------

  const awfsCookie = await browser.cookies.get({
    url: SEA_OF_THIEVES_COOKIE_URL,
    name: "awfs",
  });
  // eslint-disable-next-line no-console
  if (!awfsCookie) return console.log("awfs token undefined");

  const awfsCookieExpiration = (awfsCookie.expirationDate ?? 0) * 1000;
  if (Date.now() > awfsCookieExpiration) {
    // eslint-disable-next-line no-console
    return console.log("awfs token expired");
  }

  // -------------------------------------------------------------------------------

  // ------------------------------- Csrf Token Check -------------------------------

  const csrfPromptResponse = await browser.tabs.sendMessage(tabId, {
    action: "csrf_token_prompt",
  });

  const csrfToken = csrfPromptResponse.csrfToken as string;

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

  const storageLocation = await storage.getItem("local:storage-location");

  if (storageLocation === "client") {
    await browser.cookies.set({
      url: "https://auth.merciasquill.com",
      domain: ".merciasquill.com",
      name: "session.seaofthieves.rat.token",
      value: ratTokenCookie.value,
      expirationDate: ratCookieExpiration,

      secure: true,
      httpOnly: true,
      sameSite: "lax",
    });

    // eslint-disable-next-line no-console
    return console.log("saved rat token to client");
  }

  const apiUrl = new URL(
    `https://api.merciasquill.com/seaofthieves/tokens/${sessionData.payload.sub}`
  );

  const headers = new Headers();
  headers.append("x-access-token", sessionData.token);

  const body = new URLSearchParams();
  body.append("rat_token_value", ratTokenCookie.value);
  body.append("rat_expires_at", Math.round(ratCookieExpiration) + "");

  body.append("awfs_token_value", awfsCookie.value);
  body.append("awfs_expires_at", Math.round(awfsCookieExpiration) + "");

  body.append("csrf_token_value", csrfToken as string);

  body.append("user_agent", userAgent as string);

  const response = await fetch(apiUrl, { method: "PUT", headers, body });

  // Invalid session cookie
  if (response.status === 401) {
    return await browser.tabs.create({
      url: "https://auth.merciasquill.com/logout",
      active: false,
    });
  }

  // eslint-disable-next-line no-console
  if (!response.ok) return console.log("failed to save rat token to server");

  await storage.setItem("local:last-update", Date.now());

  // eslint-disable-next-line no-console
  console.log("saved rat token to server");
}

type FetchSessionReturn =
  | { success: false }
  | {
      success: true;
      payload: {
        sub: string;
        userId: string;
        username: string;
        displayName: string;
        avatar: string;
      };
      token: string;
    };

export async function fetchSession(): Promise<FetchSessionReturn> {
  const accessTokenCookie = await browser.cookies.get({
    url: "https://auth.merciasquill.com",
    name: "session.access.token",
  });

  if (!accessTokenCookie) return { success: false };

  return {
    success: true,
    payload: decodeJwt(accessTokenCookie.value),
    token: accessTokenCookie.value,
  };
}
