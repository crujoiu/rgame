export type AdConsentMode = "personalized" | "non-personalized" | "declined";

export type ConsentPreferences = {
  adMode: AdConsentMode;
  doNotSellOrShare: boolean;
  updatedAt: string;
};

export class ConsentManager {
  private static readonly STORAGE_KEY = "rgame-consent-v1";

  private readonly modal: HTMLElement;
  private readonly doNotSellCheckbox: HTMLInputElement;
  private resolver: ((value: ConsentPreferences) => void) | null = null;

  constructor() {
    this.modal = this.getElement("consent-modal");
    this.doNotSellCheckbox = this.getCheckbox("consent-do-not-sell");

    this.getButton("consent-accept-personalized").addEventListener("click", () => {
      this.commitConsent("personalized");
    });
    this.getButton("consent-accept-non-personalized").addEventListener("click", () => {
      this.commitConsent("non-personalized");
    });
    this.getButton("consent-decline-ads").addEventListener("click", () => {
      this.commitConsent("declined");
    });
  }

  async ensureConsent(): Promise<ConsentPreferences> {
    const saved = this.loadConsent();
    if (saved) {
      return saved;
    }

    this.modal.classList.add("is-visible");

    return await new Promise<ConsentPreferences>((resolve) => {
      this.resolver = resolve;
    });
  }

  private commitConsent(adMode: AdConsentMode): void {
    const preferences: ConsentPreferences = {
      adMode,
      doNotSellOrShare: this.doNotSellCheckbox.checked,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(ConsentManager.STORAGE_KEY, JSON.stringify(preferences));
    this.modal.classList.remove("is-visible");
    this.resolver?.(preferences);
    this.resolver = null;
  }

  private loadConsent(): ConsentPreferences | null {
    const raw = localStorage.getItem(ConsentManager.STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
      if (
        (parsed.adMode === "personalized" ||
          parsed.adMode === "non-personalized" ||
          parsed.adMode === "declined") &&
        typeof parsed.doNotSellOrShare === "boolean" &&
        typeof parsed.updatedAt === "string"
      ) {
        return {
          adMode: parsed.adMode,
          doNotSellOrShare: parsed.doNotSellOrShare,
          updatedAt: parsed.updatedAt,
        };
      }
    } catch {
      return null;
    }

    return null;
  }

  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id ${id} was not found.`);
    }
    return element;
  }

  private getButton(id: string): HTMLButtonElement {
    const element = this.getElement(id);
    if (!(element instanceof HTMLButtonElement)) {
      throw new Error(`Element with id ${id} is not a button.`);
    }
    return element;
  }

  private getCheckbox(id: string): HTMLInputElement {
    const element = this.getElement(id);
    if (!(element instanceof HTMLInputElement) || element.type !== "checkbox") {
      throw new Error(`Element with id ${id} is not a checkbox.`);
    }
    return element;
  }
}
