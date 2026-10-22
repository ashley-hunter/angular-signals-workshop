/**
 * Slide 15: Non-reactive reads inside reactive code
 *
 * STEP 1 (AVOID) is live. To see the next step, comment out the STEP 1 block
 * and uncomment the STEP 2 block (select the lines, then Cmd+/ or Ctrl+/).
 *
 * Switch language. In STEP 1 the labels stay in English: instant() reads a
 * plain field, so the computed has no idea the language changed.
 */
import { Component, computed, inject, Injectable, signal } from '@angular/core';

type Lang = 'en' | 'fr' | 'de';

const DICTIONARY: Record<Lang, Record<string, string>> = {
  en: { users: 'Users', teams: 'Teams', settings: 'Settings' },
  fr: { users: 'Utilisateurs', teams: 'Équipes', settings: 'Paramètres' },
  de: { users: 'Benutzer', teams: 'Teams', settings: 'Einstellungen' },
};

/** Shaped like a typical translation service: the current language is a plain field. */
@Injectable({ providedIn: 'root' })
export class I18nService {
  currentLang: Lang = 'en';

  instant(key: string): string {
    return DICTIONARY[this.currentLang][key];
  }

  translate(key: string, lang: Lang): string {
    return DICTIONARY[lang][key];
  }
}

@Component({
  selector: 'app-root',
  template: `
    <h1>Non-reactive reads</h1>
    <p class="hint">Switch language.</p>
    <div class="row">
      @for (l of langs; track l) {
        <button (click)="setLang(l)">{{ l }}</button>
      }
    </div>
    <div class="card">
      @for (row of rows(); track row.key) {
        <div>{{ row.label }}</div>
      }
    </div>
  `,
})
export class App {
  private readonly i18n = inject(I18nService);
  readonly langs: Lang[] = ['en', 'fr', 'de'];
  readonly lang = signal<Lang>('en');
  readonly items = signal([{ key: 'users' }, { key: 'teams' }, { key: 'settings' }]);

  setLang(lang: Lang) {
    this.i18n.currentLang = lang;
    this.lang.set(lang);
  }

  // ---------- STEP 1 · AVOID (live) ----------
  readonly rows = computed(() =>
    this.items().map((item) => ({
      ...item,
      label: this.i18n.instant(item.key),
    })),
  );
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · PREFER ----------
  // readonly rows = computed(() =>
  //   this.items().map((item) => ({
  //     ...item,
  //     label: this.i18n.translate(item.key, this.lang()),
  //   })),
  // );
  // ---------- end STEP 2 ----------
}
