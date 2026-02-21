import type { ConsentPreferences } from "./ConsentManager";

export class AdManager {
  private readonly banner: HTMLElement;
  private readonly fallback: HTMLElement;
  private readonly consent: ConsentPreferences;
  private readonly adsEnabled: boolean;
  private readonly client: string;
  private readonly slot: string;
  private initialized = false;
  private canShowBanner = false;
  private adMounted = false;

  constructor(consent: ConsentPreferences) {
    this.banner = this.getElement("ad-banner");
    this.fallback = this.getElement("ad-fallback");
    this.consent = consent;

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

    if (this.consent.adMode === "declined") {
      this.fallback.textContent = "Ads disabled by your consent preference.";
      return;
    }

    if (!this.adsEnabled) {
      this.fallback.textContent = "Ad space (set data-adsense-client and data-adsense-banner-slot).";
      this.canShowBanner = true;
      return;
    }

    this.mountAdSenseBanner(this.client, this.slot);
    this.canShowBanner = true;
  }

  showBanner(): void {
    if (!this.initialized || !this.canShowBanner) {
      return;
    }

    if (this.adsEnabled && !this.adMounted) {
      this.mountAdSenseBanner(this.client, this.slot);
    }

    this.banner.classList.add("is-visible");
  }

  hideBanner(): void {
    this.banner.classList.remove("is-visible");
  }

  private mountAdSenseBanner(client: string, slot: string): void {
    if (this.adMounted) {
      return;
    }

    type AdsByGoogleQueue = unknown[] & { requestNonPersonalizedAds?: 0 | 1 };
    const adsWindow = window as Window & { adsbygoogle?: AdsByGoogleQueue };
    const adsQueue = adsWindow.adsbygoogle;

    const forceNonPersonalized =
      this.consent.adMode === "non-personalized" || this.consent.doNotSellOrShare;
    if (Array.isArray(adsQueue)) {
      adsQueue.requestNonPersonalizedAds = forceNonPersonalized ? 1 : 0;
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

    if (!Array.isArray(adsQueue)) {
      this.fallback.textContent =
        "AdSense script not loaded. Add the adsbygoogle.js script in index.html.";
      return;
    }

    try {
      adsQueue.push({});
      this.fallback.remove();
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
