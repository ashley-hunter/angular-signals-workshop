/**
 * Slide 5: An effect that writes a signal is a computed you maintain by hand
 *
 * STEP 1 (AVOID) is live. To see the next step, comment out the STEP 1 block
 * and uncomment the STEP 2 block (select the lines, then Cmd+/ or Ctrl+/).
 *
 * Open the console. Hide the list, then toggle a row: the effect still filters,
 * the computed does not run until something reads it again.
 */
import { Component, computed, effect, input, signal } from '@angular/core';

interface Row {
  id: number;
  name: string;
  enabled: boolean;
}

@Component({
  selector: 'visible-rows',
  template: `
    @if (show()) {
      <ul>
        @for (r of visible(); track r.id) {
          <li>{{ r.name }}</li>
        }
      </ul>
    } @else {
      <p class="hint">List hidden. Nothing reads <code>visible</code>.</p>
    }
  `,
})
export class VisibleRows {
  readonly show = input(true);

  // ---------- STEP 1 · AVOID (live) ----------
  readonly rows = input.required<Row[]>();
  readonly visible = signal<Row[]>([]);

  readonly #sync = effect(() => {
    console.log('effect: filtering rows');
    this.visible.set(this.rows().filter((r) => r.enabled));
  });
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · PREFER ----------
  // readonly rows = input.required<Row[]>();
  //
  // readonly visible = computed(() => {
  //   console.log('computed: filtering rows');
  //   return this.rows().filter((r) => r.enabled);
  // });
  // ---------- end STEP 2 ----------
}

@Component({
  selector: 'app-root',
  imports: [VisibleRows],
  template: `
    <h1>Effect vs computed</h1>
    <p class="hint">Watch the console while you click.</p>
    <div class="row">
      <button (click)="toggleFirst()">Toggle "{{ rows()[0].name }}"</button>
      <button (click)="show.set(!show())">{{ show() ? 'Hide' : 'Show' }} list</button>
    </div>
    <div class="card">
      <visible-rows [rows]="rows()" [show]="show()" />
    </div>
  `,
})
export class App {
  readonly show = signal(true);
  readonly rows = signal<Row[]>([
    { id: 1, name: 'Ada', enabled: true },
    { id: 2, name: 'Grace', enabled: false },
    { id: 3, name: 'Linus', enabled: true },
  ]);

  toggleFirst() {
    this.rows.update(([first, ...rest]) => [{ ...first, enabled: !first.enabled }, ...rest]);
  }
}
