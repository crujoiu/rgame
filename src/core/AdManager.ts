export class AdManager {
  private readonly banner: HTMLElement;
  private readonly fallback: HTMLElement;
  private readonly adsEnabled: boolean;
  private readonly client: string;
  private readonly slot: string;
  private initialized = false;
  private canShowBanner = false;
  private adMounted = false;
  private scriptReady = false;
  private scriptFailed = false;
  private scriptLoadPromise: Promise<void> | null = null;
  private bannerVisible = false;

  constructor() {
    this.banner = this.getElement("ad-banner");
    this.fallback = this.getElement("ad-fallback");

    const host = document.body;
    this.client = host.dataset.adsenseClient ?? "";
    this.slot = host.dataset.adsenseBannerSlot ?? "";
    this.adsEnabled = Boolean(this.client && this.slot);
  }

  initialize(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    if (!this.adsEnabled) {
      this.fallback.textContent = "Ad space (set data-adsense-client and data-adsense-banner-slot).";
      this.canShowBanner = true;
      return;
    }

    this.canShowBanner = true;
    this.scheduleScriptLoad();
  }

  showBanner(): void {
    if (!this.initialized || !this.canShowBanner) {
      return;
    }

    this.bannerVisible = true;
    if (this.adsEnabled && !this.adMounted) {
      this.tryMountBanner();
    }

    this.banner.classList.add("is-visible");
  }

  hideBanner(): void {
    this.bannerVisible = false;
    this.banner.classList.remove("is-visible");
  }

  private tryMountBanner(): void {
    if (!this.adsEnabled || this.adMounted) {
      return;
    }

    if (this.scriptFailed) {
      this.fallback.textContent =
        "Ads unavailable (blocked by browser privacy settings or an ad blocker).";
      return;
    }

    if (!this.scriptReady) {
      this.fallback.textContent = "Loading ad...";
      this.scheduleScriptLoad();
      return;
    }

    this.mountAdSenseBanner(this.client, this.slot);
  }

  private scheduleScriptLoad(): void {
    if (this.scriptLoadPromise || this.scriptReady || this.scriptFailed) {
      return;
    }

    const startLoad = (): void => {
      this.scriptLoadPromise = this.loadAdSenseScript(this.client)
        .then(() => {
          this.scriptReady = true;
          if (this.bannerVisible) {
            this.tryMountBanner();
          }
        })
        .catch(() => {
          this.scriptFailed = true;
          this.fallback.textContent =
            "Ads unavailable (blocked by browser privacy settings or an ad blocker).";
        });
    };

    if ("requestIdleCallback" in window) {
      (window as Window & { requestIdleCallback: (cb: () => void, options?: { timeout: number }) => number }).requestIdleCallback(
        startLoad,
        { timeout: 2500 },
      );
      return;
    }

    window.setTimeout(startLoad, 1200);
  }

  private loadAdSenseScript(client: string): Promise<void> {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-adsense-loader="true"]',
    );
    if (existing) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      script.crossOrigin = "anonymous";
      script.dataset.adsenseLoader = "true";
      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener("error", () => reject(new Error("Failed to load AdSense script.")), {
        once: true,
      });
      document.head.append(script);
    });
  }

  private mountAdSenseBanner(client: string, slot: string): void {
    if (this.adMounted) {
      return;
    }

    type AdsByGoogleQueue = unknown[];
    const adsWindow = window as Window & { adsbygoogle?: AdsByGoogleQueue };
    const adsQueue = adsWindow.adsbygoogle;

    if (!Array.isArray(adsQueue)) {
      this.fallback.textContent =
        "Ads unavailable (blocked by browser privacy settings or an ad blocker).";
      return;
    }

    const ad = document.createElement("ins");
    ad.className = "adsbygoogle";
    ad.style.display = "block";
    ad.setAttribute("data-ad-client", client);
    ad.setAttribute("data-ad-slot", slot);
    ad.setAttribute("data-ad-format", "auto");
    ad.setAttribute("data-full-width-responsive", "true");

    this.banner.prepend(ad);
    this.fallback.textContent = "Loading ad...";

    try {
      adsQueue.push({});
      this.fallback.textContent = "";
      this.fallback.setAttribute("aria-hidden", "true");
      this.adMounted = true;
    } catch {
      this.fallback.textContent = "Ad failed to load. Check AdSense configuration.";
    }
  }

  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id ${id} was not found.`);
    }
    return element;
  }
}
