/**
 * Slide 24: Reference equality is the notification boundary
 *
 * STEP 1 is live. To see the next step, comment out the STEP 1 block
 * and uncomment the STEP 2 block (select the lines, then Cmd+/ or Ctrl+/).
 *
 * The "server" is polled every 10 seconds and usually returns the same rows.
 * The grid counts how often its rows input changes (a "rebuild").
 *   STEP 1: every poll makes new Row objects, so the grid rebuilds every 10s
 *           even though nothing changed.
 *   STEP 2: a custom equal keeps the old array when the ids match, so the
 *           grid only rebuilds when you click "Add a row on the server".
 */
import { Component, computed, effect, inject, Injectable, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { delay, Observable, of, switchMap, tap, timer } from 'rxjs';

interface Row {
  id: number;
  name: string;
  active: boolean;
}

/** Fake server. Every response is a fresh copy, like a real HTTP response. */
@Injectable({ providedIn: 'root' })
export class Api {
  readonly polls = signal(0);
  #data: Row[] = [
    { id: 1, name: 'Ada', active: true },
    { id: 2, name: 'Grace', active: false },
    { id: 3, name: 'Linus', active: true },
  ];

  rows(): Observable<Row[]> {
    return of(structuredClone(this.#data)).pipe(
      delay(200),
      tap(() => this.polls.update((n) => n + 1)),
    );
  }

  addRow() {
    const id = this.#data.length + 1;
    this.#data = [...this.#data, { id, name: `User ${id}`, active: true }];
  }
}

@Component({
  selector: 'app-grid',
  template: `
    <div class="card">
      <div class="bad">Grid rebuilds: {{ rebuilds() }}</div>
      @for (r of rows(); track r.id) {
        <div>{{ r.name }}</div>
      }
    </div>
  `,
})
export class Grid {
  readonly rows = input.required<Row[]>();
  readonly rebuilds = signal(0);

  readonly #count = effect(() => {
    this.rows();
    this.rebuilds.update((n) => n + 1);
  });
}

@Component({
  selector: 'app-root',
  imports: [Grid],
  template: `
    <h1>Reference equality</h1>
    <p class="hint">Wait for a few polls, then add a row on the server and wait for the next one.</p>
    <div class="row">
      <span>Polls: <code>{{ api.polls() }}</code></span>
      <button (click)="api.addRow()">Add a row on the server</button>
    </div>
    <app-grid [rows]="visibleRows()" />
  `,
})
export class App {
  readonly api = inject(Api);

  // poll every 10s - most responses are identical
  readonly rows = toSignal(
    timer(0, 10_000).pipe(switchMap(() => this.api.rows())),
    { initialValue: [] },
  );

  // ---------- STEP 1 (live) ----------
  protected readonly visibleRows = computed(() =>
    this.rows().filter((r) => r.active),
  );

  // new Row objects every poll, so the grid rebuilds
  // every 10s even when nothing changed
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 ----------
  // protected readonly visibleRows = computed(
  //   () => this.rows().filter((r) => r.active),
  //   {
  //     equal: (a, b) =>
  //       a.length === b.length &&
  //       a.every((r, i) => r.id === b[i].id),
  //   },
  // );   // equal -> old value kept, grid does nothing
  // ---------- end STEP 2 ----------
}
