// Shared by the contact and footer forms: hCaptcha and the Web3Forms request.
// hCaptcha loads only once someone starts using a form, so pages stay light.

// Web3Forms' shared hCaptcha site key for free plans (public by design).
const SITE_KEY = "50b2fe65-b00b-4b9e-ad62-3ba471098be2";

interface HCaptchaApi {
  render(container: HTMLElement, options: { sitekey: string }): string;
  getResponse(id: string): string;
  reset(id: string): void;
}

declare global {
  interface Window {
    hcaptcha?: HCaptchaApi;
    onHCaptchaReady?: () => void;
  }
}

let api: Promise<HCaptchaApi> | undefined;

function loadApi(): Promise<HCaptchaApi> {
  api ??= new Promise<HCaptchaApi>((resolve, reject) => {
    window.onHCaptchaReady = () => (window.hcaptcha ? resolve(window.hcaptcha) : reject(new Error("hCaptcha missing")));
    const script = document.createElement("script");
    script.src = "https://js.hcaptcha.com/1/api.js?render=explicit&recaptchacompat=off&onload=onHCaptchaReady";
    script.async = true;
    script.onerror = () => {
      script.remove();
      api = undefined; // A later attempt can try again.
      reject(new Error("hCaptcha blocked"));
    };
    document.head.append(script);
  });
  return api;
}

export interface Captcha {
  /** True once the visitor passed. Rejects if hCaptcha cannot load (a blocker, no network). */
  solved(): Promise<boolean>;
  reset(): void;
}

export function attachCaptcha(form: HTMLFormElement): Captcha {
  const box = form.querySelector<HTMLElement>("[data-captcha-box]");
  let widget: Promise<{ hcaptcha: HCaptchaApi; id: string }> | undefined;

  const start = () => {
    widget ??= loadApi()
      .then((hcaptcha) => ({ hcaptcha, id: hcaptcha.render(box as HTMLElement, { sitekey: SITE_KEY }) }))
      .catch((error) => {
        widget = undefined;
        throw error;
      });
    return widget;
  };

  form.addEventListener("focusin", () => void start().catch(() => {}), { once: true });

  return {
    solved: async () => {
      const { hcaptcha, id } = await start();
      return Boolean(hcaptcha.getResponse(id));
    },
    reset: () => void widget?.then(({ hcaptcha, id }) => hcaptcha.reset(id)).catch(() => {}),
  };
}

const GOOGLE_SCRIPT_URL = import.meta.env.PUBLIC_GOOGLE_SCRIPT_URL as string | undefined;

/** Posts to Web3Forms and automatically saves to Google Sheet if configured. */
export async function sendLead(form: HTMLFormElement, data: FormData): Promise<void> {
  // `redirect` is only for a plain browser post. In a fetch it could turn a
  // delivered lead into a reported failure.
  data.delete("redirect");

  // 1. Web3Forms post (Email notification)
  const web3Promise = fetch(form.action, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: data,
  }).then(async (res) => {
    const json: { success?: boolean } = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error("Request failed");
    return json;
  });

  // 2. Google Apps Script Web App post (Google Sheet sync)
  let sheetPromise: Promise<unknown> = Promise.resolve();
  if (GOOGLE_SCRIPT_URL) {
    const payload: Record<string, string> = {};
    for (const [key, value] of data.entries()) {
      if (key === "botcheck" || key === "h-captcha-response" || key === "access_key") continue;
      if (typeof value === "string") {
        if (payload[key]) {
          payload[key] = `${payload[key]}, ${value}`;
        } else {
          payload[key] = value;
        }
      }
    }

    // Using text/plain prevents browser preflight OPTIONS request (CORS bypass for Google Apps Script)
    sheetPromise = fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).catch((err) => {
      // Don't fail form submission if Google Sheets sync faces a minor client-side network glitch
      console.warn("Google Sheet sync warning:", err);
    });
  }

  await Promise.all([web3Promise, sheetPromise]);
}
