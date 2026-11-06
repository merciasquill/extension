export default defineContentScript({
  matches: ["*://*.seaofthieves.com/*"],
  main() {},
});

browser.runtime.onMessage.addListener(({ action }, _sender, sendResponse) => {
  if (action === "user_agent_prompt") {
    const userAgent = navigator.userAgent;
    return sendResponse({
      ok: true,
      action: "user_agent_response",
      userAgent,
    });
  }

  if (action === "show_sign_in_toast") {
    document.body.appendChild(SignInToastContainer());
    return sendResponse({ ok: true });
  }

  return sendResponse({ ok: false });
});

function SignInToastContainer(): HTMLElement {
  if (!document.querySelector("#toast-font")) {
    const link = document.createElement("link");
    link.id = "toast-font";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap";
    document.head.appendChild(link);
  }

  const OFFSET = "translateX(calc(100% + 16px))";
  const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

  // Don't stack duplicates if called twice
  document.querySelector(".toast-region")?.remove();

  const region = document.createElement("div");
  region.className = "toast-region";
  region.setAttribute("role", "region");
  region.setAttribute("aria-label", "Notifications");
  region.style.cssText =
    "position: fixed; z-index: 9999; bottom: 16px; right: 16px; width: min(360px, calc(100vw - 32px)); pointer-events: none; box-sizing: border-box;";

  region.innerHTML = `
<div
  class="toast"
  role="status"
  style="font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; border-radius: 16px; background: #262626; color: #ffffff; box-shadow: 0 8px 30px rgb(0 0 0 / 20%); pointer-events: auto; box-sizing: border-box;"
  onmouseenter="this.querySelector('button').style.opacity = 1"
  onmouseleave="this.querySelector('button').style.opacity = 0"
>
  <div
    style="display: flex; align-items: center; justify-content: center; padding: 4px; color: oklch(0.594 0.1967 24.63);"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style="width: 16px; height: 16px;"
    >
      <path
        d="M11.9998 9.00023V13.0002M11.9998 17.0002H12.0098M10.6151 3.89195L2.39019 18.0986C1.93398 18.8866 1.70588 19.2806 1.73959 19.6039C1.769 19.886 1.91677 20.1423 2.14613 20.309C2.40908 20.5002 2.86435 20.5002 3.77487 20.5002H20.2246C21.1352 20.5002 21.5904 20.5002 21.8534 20.309C22.0827 20.1423 22.2305 19.886 22.2599 19.6039C22.2936 19.2806 22.0655 18.8866 21.6093 18.0986L13.3844 3.89195C12.9299 3.10679 12.7026 2.71421 12.4061 2.58235C12.1474 2.46734 11.8521 2.46734 11.5935 2.58235C11.2969 2.71421 11.0696 3.10679 10.6151 3.89195Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>

  <div
    style="display: flex; min-width: 0; flex-direction: column; align-items: flex-start;"
  >
    <span
      style="font-size: 14px; line-height: 20px; font-weight: 500; color: oklch(0.594 0.1967 24.63);"
      >Unknown Session</span
    >
    <span style="color: #a3a3a3; font-size: 12px;">
      Your Mercia's Quill session expired.
    </span>
  </div>

  <a
    href="https://auth.merciasquill.com/login"
    target="_blank"
    style="padding: 6px 10px; border: 0; border-radius: 6px; background: transparent; color: #ffffff; font: inherit; font-size: 13px; cursor: pointer; box-sizing: border-box; text-decoration: none;"
    onmouseenter="this.style.background = 'rgb(255 255 255 / 10%)'"
    onmouseleave="this.style.background = 'transparent'"
  >
    Sign In
  </a>

  <button
    type="button"
    aria-label="Close notification"
    style="position: absolute; top: -8px; right: -8px; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; padding: 4px; border: 1px solid #404040; border-radius: 50%; background: #262626; color: white; opacity: 0; cursor: pointer; transition: opacity 150ms ease; box-sizing: border-box;"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      style="width: 14px; height: 14px;"
    >
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  </button>
</div>
`.trim();

  const toast = region.querySelector<HTMLElement>(".toast")!;
  const closeButton = region.querySelector<HTMLButtonElement>("button")!;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Mount first, then animate
  document.body.appendChild(region);

  // Enter: ease in from the bottom right
  toast.animate(
    [
      { opacity: 0, transform: OFFSET },
      { opacity: 1, transform: "translateX(0)" },
    ],
    { duration: 350, easing: EASE_OUT }
  );

  // Exit: slide back toward the corner, then remove
  let dismissing = false;
  const dismiss = () => {
    if (dismissing) return;
    dismissing = true;

    if (reduceMotion) {
      region.remove();
      return;
    }

    toast
      .animate(
        [
          { opacity: 1, transform: "translateX(0)" },
          { opacity: 0, transform: OFFSET },
        ],
        { duration: 200, easing: "ease-in", fill: "forwards" }
      )
      .finished.then(() => region.remove());
  };

  closeButton.addEventListener("click", dismiss);

  return region;
}
