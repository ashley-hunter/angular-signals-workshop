/**
 * Slide 14: A dependency can arrive in code you did not write
 *
 * STEP 1 is live. To move through the steps, comment out every block for the
 * live step and uncomment every block for the next one (select the lines,
 * then Cmd+/ or Ctrl+/). Blocks are labelled with the steps they belong to.
 *
 * Change the page and watch the console.
 *   STEP 1: one POST per page change.
 *   STEP 2: send() now reads and writes recent, so the effect tracks recent
 *           and re-runs itself. It loops.
 *   STEP 3: untracked() around the call. send() can do what it likes.
 */
import { Component, effect, inject, Injectable, signal, untracked } from '@angular/core';

/** Stand-in for HttpClient that only logs. */
const fakeHttp = {
  post(url: string, body: unknown) {
    console.log('POST', url, body);
  },
};

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = fakeHttp;
  readonly recent = signal<string[]>([]);

  // ---------- STEP 1 · analytics.service.ts ----------
  send(page: string) {
    this.http.post('/track', { page });
  }
  // ---------- end STEP 1 ----------

  // ---------- STEP 2, 3 · analytics.service.ts - six months later ----------
  // send(page: string) {
  //   this.http.post('/track', { page });
  //   this.recent.set([...this.recent(), page]);
  // }   // reads recent, writes recent
  // ---------- end STEP 2, 3 ----------
}

@Component({
  selector: 'app-root',
  template: `
    <h1>A dependency you did not write</h1>
    <p class="hint">Change the page and watch the console.</p>
    <div class="row">
      @for (p of pages; track p) {
        <button (click)="page.set(p)">{{ p }}</button>
      }
    </div>
    <div class="card">Current page: <code>{{ page() }}</code></div>
  `,
})
export class App {
  private readonly analytics = inject(AnalyticsService);
  readonly pages = ['home', 'teams', 'settings'];
  readonly page = signal('home');

  // ---------- STEP 1, 2 ----------
  readonly #ping = effect(() => {
    const page = this.page();
    this.analytics.send(page);
  });
  // ---------- end STEP 1, 2 ----------

  // ---------- STEP 3 ----------
  // readonly #ping = effect(() => {
  //   const page = this.page();
  //   untracked(() => this.analytics.send(page));
  // });
  // ---------- end STEP 3 ----------
}
