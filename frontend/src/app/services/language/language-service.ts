import { Injectable, signal } from '@angular/core';

export type Language = 'pl' | 'en';

type TranslationMap = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly storageKey = 'language';

  public readonly currentLanguage = signal<Language>(this.getStoredLanguage());
  private readonly translations = signal<TranslationMap>({});

  constructor() {
    void this.loadTranslations(this.currentLanguage());
  }

  async toggleLanguage(): Promise<void> {
    const nextLanguage: Language =
      this.currentLanguage() === 'pl' ? 'en' : 'pl';

    await this.loadTranslations(nextLanguage);
  }

  translate(key: string): string {
    const value = key.split('.').reduce<unknown>(
      (translation, part) =>
        typeof translation === 'object' && translation !== null
          ? (translation as TranslationMap)[part]
          : undefined,
      this.translations(),
    );

    return typeof value === 'string' ? value : key;
  }

  private async loadTranslations(language: Language): Promise<void> {
    const response = await fetch(`/i18n/${language}.json`);
    const translations = (await response.json()) as TranslationMap;

    this.translations.set(translations);
    this.currentLanguage.set(language);
    localStorage.setItem(this.storageKey, language);
  }

  private getStoredLanguage(): Language {
    return localStorage.getItem(this.storageKey) === 'en' ? 'en' : 'pl';
  }
}
