/**
 * Slide 6: When the user can override the derived value
 *
 * STEP 1 (AVOID) is live. To see the next step, comment out the STEP 1 block
 * and uncomment the STEP 2 block (select the lines, then Cmd+/ or Ctrl+/).
 *
 * Page forward a few times, then change the filter: the page resets to 1.
 * Both versions behave the same, but STEP 2 has no effect and no extra
 * change detection pass.
 */
import { Component, computed, effect, linkedSignal, signal } from '@angular/core';

const PEOPLE = [
  'Ada', 'Alan', 'Barbara', 'Brian', 'Claude', 'Dennis', 'Donald', 'Edsger',
  'Frances', 'Grace', 'Guido', 'Hedy', 'John', 'Ken', 'Linus', 'Margaret',
  'Radia', 'Tim', 'Bjarne', 'James', 'Anders', 'Brendan', 'Yukihiro', 'Rasmus',
];
const PAGE_SIZE = 4;

@Component({
  selector: 'app-root',
  template: `
    <h1>linkedSignal for a resettable page</h1>
    <p class="hint">Page forward, then type in the filter.</p>
    <div class="row">
      <input placeholder="filter" [value]="filter()" (input)="filter.set($any($event.target).value)" />
    </div>
    <div class="card">
      <ul>
        @for (name of pageItems(); track name) {
          <li>{{ name }}</li>
        }
      </ul>
      <div class="row">
        <button (click)="prev()" [disabled]="page() <= 1">Prev</button>
        <span>Page {{ page() }} of {{ pageCount() }}</span>
        <button (click)="next()" [disabled]="page() >= pageCount()">Next</button>
      </div>
    </div>
  `,
})
export class App {
  readonly filter = signal('');

  // ---------- STEP 1 · AVOID (live) ----------
  readonly page = signal(1);

  readonly #reset = effect(() => {
    this.filter();     // track
    this.page.set(1);  // reset
  });

  next() { this.page.update((p) => p + 1); }
  prev() { this.page.update((p) => p - 1); }
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · PREFER ----------
  // readonly page = linkedSignal(() => {
  //   this.filter();  // track
  //   return 1;       // reset
  // });
  //
  // next() { this.page.update((p) => p + 1); }
  // prev() { this.page.update((p) => p - 1); }
  // ---------- end STEP 2 ----------

  readonly matches = computed(() =>
    PEOPLE.filter((p) => p.toLowerCase().includes(this.filter().toLowerCase())),
  );
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.matches().length / PAGE_SIZE)));
  readonly pageItems = computed(() =>
    this.matches().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
}
