/**
 * Slide 24: Reference equality is the notification boundary
 *
 * STEP 1 is live. To move through the steps, comment out the live STEP block
 * and uncomment the next one (select the lines, then Cmd+/ or Ctrl+/).
 *
 * The grid counts how often its rows input changes (a "rebuild").
 *   STEP 1: a method returns a new array on every check, so an unrelated
 *           change rebuilds the grid.
 *   STEP 2: a computed keeps the same array, but a refetch with identical
 *           data still rebuilds.
 *   STEP 3: a custom equal keeps the old array when ids and revs match.
 */
import { Component, computed, effect, input, signal } from '@angular/core';

interface Row {
  id: number;
  rev: number;
  name: string;
  active: boolean;
}

const DATA: Row[] = [
  { id: 1, rev: 1, name: 'Ada', active: true },
  { id: 2, rev: 1, name: 'Grace', active: false },
  { id: 3, rev: 1, name: 'Linus', active: true },
];

@Component({
  selector: 'data-grid',
  template: `
    <div class="card">
      <div class="bad">Grid rebuilds: {{ rebuilds() }}</div>
      @for (r of rows(); track r.id) {
        <div>{{ r.name }} (rev {{ r.rev }})</div>
      }
    </div>
  `,
})
export class DataGrid {
  readonly rows = input.required<Row[]>();
  readonly rebuilds = signal(0);

  readonly #count = effect(() => {
    this.rows();
    this.rebuilds.update((n) => n + 1);
  });
}

@Component({
  selector: 'app-root',
  imports: [DataGrid],
  template: `
    <h1>Reference equality</h1>
    <p class="hint">Try each button and watch the rebuild count.</p>
    <div class="row">
      <button (click)="clicks.set(clicks() + 1)">Unrelated change ({{ clicks() }})</button>
      <button (click)="refetch()">Refetch (same data, new objects)</button>
      <button (click)="edit()">Edit Ada (rev + 1)</button>
    </div>
    <data-grid [rows]="visibleRows()" />
  `,
})
export class App {
  readonly clicks = signal(0);
  readonly rows = signal<Row[]>(structuredClone(DATA));

  refetch() {
    this.rows.set(structuredClone(this.rows()));
  }

  edit() {
    this.rows.update((rows) => rows.map((r) => (r.id === 1 ? { ...r, rev: r.rev + 1 } : r)));
  }

  // ---------- STEP 1 (live) ----------
  // a method: runs on every check of this view
  protected visibleRows(): Row[] {
    return this.rows().filter((r) => r.active);
  }

  // new array every check, so the grid rebuilds
  // even when nothing changed
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 ----------
  // // a computed: runs when rows() changes
  // protected readonly visibleRows = computed(() =>
  //   this.rows().filter((r) => r.active),
  // );
  //
  // // same array until rows() changes,
  // // so the grid does nothing in between
  // ---------- end STEP 2 ----------

  // ---------- STEP 3 ----------
  // // a refetch makes new Row objects with the same ids
  // protected readonly visibleRows = computed(
  //   () => this.rows().filter((r) => r.active),
  //   {
  //     equal: (a, b) =>
  //       a.length === b.length &&
  //       a.every((r, i) => r.id === b[i].id && r.rev === b[i].rev),
  //   },
  // );   // equal -> old value kept, grid still does nothing
  // ---------- end STEP 3 ----------
}
