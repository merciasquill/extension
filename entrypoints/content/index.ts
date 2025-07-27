// import { toast } from "sonner";

import "./styles.css";

export default defineContentScript({
  matches: ["*://*.seaofthieves.com/*"],
  main() {},
});

browser.runtime.onMessage.addListener(
  ({ action, ...options }, _sender, sendResponse) => {
    if (action === "user_agent_prompt") {
      const userAgent = navigator.userAgent;
      return sendResponse({ action: "user_agent_response", userAgent });
    }

    if (action !== "show_toast") return;

    const type = options.type;
    const header = options.header;
    const content = options.content;
    const toastAction = options.toastAction;

    const toastContainer = ToastContainer({ type });
    const closeButton = CloseButton({ type }, sendResponse);

    const alertIcon = AlertIcon({ type });
    const toastText = ToastText({ type, header, content });
    const actionButton = ActionButton({ type, toastAction });

    const iconTextContainer = document.createElement("div");
    iconTextContainer.id = "mercias-quill-icon-text-container";
    iconTextContainer.appendChild(alertIcon);
    iconTextContainer.appendChild(toastText);

    toastContainer.appendChild(closeButton);
    toastContainer.appendChild(iconTextContainer);
    toastContainer.appendChild(actionButton);

    document.body.appendChild(toastContainer);

    setTimeout(() => toastContainer.classList.add("show"), 250);
    setTimeout(() => closeButtonEventHandler(sendResponse), 30_000);

    return true;
  }
);

function ToastContainer({ type = "default_toast" }) {
  const container = document.createElement("div");
  container.id = "mercias-quill-toast-container";
  if (type === "default_toast") container.classList.add("default");
  if (type === "error_toast") container.classList.add("error");

  return container;
}

function CloseButton({ type = "default_toast" }, sendResponse: Function) {
  const button = document.createElement("button");
  button.id = "mercias-quill-toast-close-button";

  button.addEventListener("click", () => closeButtonEventHandler(sendResponse));

  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.id = "mercias-quill-toast-close-icon";

  if (type === "default_toast") {
    button.classList.add("default");
    svg.classList.add("default");
  }

  if (type === "error_toast") {
    button.classList.add("error");
    svg.classList.add("error");
  }

  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("xmlns", svgNS);

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute(
    "d",
    "M15 9L9 15M9 9L15 15M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
  );
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);
  button.appendChild(svg);

  return button;
}

function AlertIcon({ size = 24, type = "" }) {
  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.id = "mercias-quill-toast-type-icon";
  if (type === "default_toast") svg.classList.add("default");
  if (type === "error_toast") svg.classList.add("error");

  svg.setAttribute("width", `${size}px`);
  svg.setAttribute("height", `${size}px`);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("xmlns", svgNS);

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute(
    "d",
    "M12 10.5V7M12 14H12.01M9.9 19.2L11.36 21.1467C11.5771 21.4362 11.6857 21.5809 11.8188 21.6327C11.9353 21.678 12.0647 21.678 12.1812 21.6327C12.3143 21.5809 12.4229 21.4362 12.64 21.1467L14.1 19.2C14.3931 18.8091 14.5397 18.6137 14.7185 18.4645C14.9569 18.2656 15.2383 18.1248 15.5405 18.0535C15.7671 18 16.0114 18 16.5 18C17.8978 18 18.5967 18 19.1481 17.7716C19.8831 17.4672 20.4672 16.8831 20.7716 16.1481C21 15.5967 21 14.8978 21 13.5V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V13.5C3 14.8978 3 15.5967 3.22836 16.1481C3.53284 16.8831 4.11687 17.4672 4.85195 17.7716C5.40326 18 6.10218 18 7.5 18C7.98858 18 8.23287 18 8.45951 18.0535C8.76169 18.1248 9.04312 18.2656 9.2815 18.4645C9.46028 18.6137 9.60685 18.8091 9.9 19.2Z"
  );
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);

  return svg;
}

function ToastText({ type = "default_toast", header = "", content = "" }) {
  const textContainer = document.createElement("div");
  textContainer.id = "mercias-quill-toast-text-container";

  const headerElement = document.createElement("div");
  headerElement.id = "mercias-quill-toast-header";
  if (type === "default_toast") headerElement.classList.add("default");
  if (type === "error_toast") headerElement.classList.add("error");

  headerElement.textContent = header;

  const contentElement = document.createElement("div");
  contentElement.id = "mercias-quill-toast-content";
  if (type === "default_toast") contentElement.classList.add("default");
  if (type === "error_toast") contentElement.classList.add("error");

  contentElement.textContent = content;

  textContainer.appendChild(headerElement);
  textContainer.appendChild(contentElement);

  return textContainer;
}

function ActionButton({ type = "default_toast", toastAction = {} }) {
  const button = document.createElement("button");
  button.id = "mercias-quill-toast-action-button";
  button.textContent = "Sign In";

  button.addEventListener("click", () => {
    actionEventHandler(toastAction);
  });

  if (type === "default_toast") {
    button.classList.add("default");
  }

  if (type === "error_toast") {
    button.classList.add("error");
  }

  return button;
}

function closeButtonEventHandler(sendResponse: Function) {
  const toastContainer = document.getElementById(
    "mercias-quill-toast-container"
  );
  if (!toastContainer) return;

  toastContainer.classList.remove("show");
  toastContainer.classList.add("hide");

  sendResponse({ action: "toast_hidden" });
}

function actionEventHandler(action: { href?: string }) {
  if (action.href) window.open(action.href, "_blank");
}
