/**
 * Slide 32: Signals do not make your data immutable
 *
 * STEP 1 (AVOID) is live. To see the next step, comment out the STEP 1 block
 * and uncomment the STEP 2 block (select the lines, then Cmd+/ or Ctrl+/).
 *
 *   STEP 1: click "pop()". The array is mutated in place, the signal never
 *           notifies, and the list on screen is now out of date. Click "Add"
 *           and the missing item suddenly disappears.
 *   STEP 2: the type is readonly Item[], so items().pop() is a compile error.
 *           That error is the point of this step.
 */
import { Component, inject, Injectable, Signal, signal } from '@angular/core';

interface Item {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ItemsService {
  readonly #items = signal<Item[]>([
    { id: 1, name: 'Apples' },
    { id: 2, name: 'Bread' },
    { id: 3, name: 'Coffee' },
  ]);

  // ---------- STEP 1 · AVOID (live) ----------
  readonly items: Signal<Item[]> = this.#items.asReadonly();
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · PREFER ----------
  // readonly items: Signal<readonly Item[]> = this.#items.asReadonly();
  // ---------- end STEP 2 ----------

  add(name: string) {
    this.#items.update((items) => [...items, { id: Date.now(), name }]);
  }
}

@Component({
  selector: 'app-root',
  template: `
    <h1>Readonly signals, mutable data</h1>
    <p class="hint">Click pop(), then Add.</p>
    <div class="row">
      <button (click)="pop()">service.items().pop()</button>
      <button (click)="service.add('Eggs')">Add "Eggs"</button>
    </div>
    <div class="card">
      @for (item of service.items(); track item.id) {
        <div>{{ item.name }}</div>
      }
    </div>
  `,
})
export class App {
  readonly service = inject(ItemsService);

  pop() {
    // compiles fine in STEP 1, will not compile in STEP 2
    this.service.items().pop();
  }
}
