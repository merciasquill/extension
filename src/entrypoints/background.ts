import type { Browser } from "@wxt-dev/browser";

import { decodeJwt } from "jose";
import ms from "ms";

import { CookieNames, StorageKeys } from "@/lib/enums";

export default defineBackground(() => {
  // eslint-disable-next-line no-console
  console.log("Mercia's Quill background script active");
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const hostname = new URL(tab.url).hostname;
  const rootDomain = hostname.split(".").slice(-2).join(".");

  if (rootDomain === "seaofthieves.com") {
    return refreshSeaOfThievesCredentials(tabId, changeInfo, tab);
  }
});

async function refreshSeaOfThievesCredentials(
  tabId: number,
  _changeInfo: Browser.tabs.OnUpdatedInfo,
  _tab: Browser.tabs.Tab
) {
  // extension already pushed to backend within the past 10 minutes
  const lastUpdate = await storage.getItem(StorageKeys.UpdatedAt);
  const lastUpdateValid = lastUpdate && typeof lastUpdate === "number";
  if (lastUpdateValid && Date.now() - lastUpdate < ms("10m")) return;

  const accessTokenCookie = await browser.cookies.get({
    url: "https://auth.merciasquill.com",
    name: CookieNames.AccessToken,
  });

  if (!accessTokenCookie?.value) {
    return await browser.tabs.sendMessage(tabId, {
      action: "show_sign_in_toast",
    });
  }

  const decodedSessionData = decodeJwt(accessTokenCookie.value);

  const ratTokenCookie = await browser.cookies.get({
    url: "https://www.seaofthieves.com",
    name: CookieNames.RatToken,
  });

  if (!ratTokenCookie?.value) return;

  // check for rat token expiration in very rare edge cases
  const ratCookieExpiration = (ratTokenCookie.expirationDate ?? 0) * 1000;
  if (Date.now() > ratCookieExpiration) return;

  // get browser specific user agent string
  const userAgentPromptResponse = await browser.tabs.sendMessage(tabId, {
    action: "user_agent_prompt",
  });
  const userAgent = userAgentPromptResponse.userAgent as string;

  const apiUrl = new URL(
    `https://api.merciasquill.com/seaofthieves/authentication/rat-token/${decodedSessionData.sub}`
  );

  const headers = new Headers();
  headers.append("x-access-token", accessTokenCookie.value);

  const body = new URLSearchParams();
  body.append("rat_value", ratTokenCookie.value);
  body.append("rat_expires_at", ratCookieExpiration + "");
  body.append("user_agent", userAgent as string);

  const apiResponse = await fetch(apiUrl, { method: "POST", headers, body });

  // invalid session cookie
  if (apiResponse.status === 401) {
    // eslint-disable-next-line no-console
    console.log(
      `deleting access token cookie for status: [${apiResponse.status}] ${apiResponse.statusText}`
    );

    return await browser.tabs.create({
      url: "https://auth.merciasquill.com/logout",
      active: false,
    });
  }

  if (!apiResponse.ok) {
    // eslint-disable-next-line no-console
    return console.log(
      `failed to save rat token to server with error: [${apiResponse.status}] ${apiResponse.statusText}`
    );
  }

  await storage.setItem(StorageKeys.UpdatedAt, Date.now());
}
