/**
 * Slide 19: DOM work belongs to a render phase
 *
 * STEP 1 (AVOID) is live. To see the next step, comment out the STEP 1 block
 * and uncomment the STEP 2 block (select the lines, then Cmd+/ or Ctrl+/).
 *
 * Scroll down in the pane, then pick another item, and watch the console.
 * A component effect runs before this view re-renders, so in STEP 1 it sees
 * the previous item's DOM. afterRenderEffect runs after the DOM is updated.
 */
import { afterRenderEffect, Component, effect, ElementRef, signal, viewChild } from '@angular/core';

const ITEMS = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  body: Array.from({ length: 40 }, (_, j) => `Item ${i + 1}, paragraph ${j + 1}`),
}));

@Component({
  selector: 'app-root',
  template: `
    <h1>Effects vs render phases</h1>
    <p class="hint">Scroll the pane, pick another item, then check the console.</p>
    <div class="row">
      @for (item of items; track item.id) {
        <button (click)="selectedId.set(item.id)">{{ item.title }}</button>
      }
    </div>
    <div #pane class="card" style="height: 240px; overflow: auto;">
      <h2 style="margin-top: 0">{{ selected().title }}</h2>
      @for (p of selected().body; track p) {
        <p>{{ p }}</p>
      }
    </div>
  `,
})
export class App {
  readonly items = ITEMS;
  readonly selectedId = signal(1);
  readonly selected = () => ITEMS.find((i) => i.id === this.selectedId())!;

  // ---------- STEP 1 · AVOID (live) ----------
  readonly pane = viewChild.required<ElementRef<HTMLElement>>('pane');

  readonly #scroll = effect(() => {
    this.selectedId();
    console.log('effect sees heading:', this.pane().nativeElement.querySelector('h2')?.textContent);
    this.pane().nativeElement.scrollTop = 0;
  });
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · PREFER ----------
  // readonly pane = viewChild.required<ElementRef<HTMLElement>>('pane');
  //
  // readonly #scroll = afterRenderEffect({
  //   write: () => {
  //     this.selectedId();
  //     console.log('afterRenderEffect sees heading:', this.pane().nativeElement.querySelector('h2')?.textContent);
  //     this.pane().nativeElement.scrollTop = 0;
  //   },
  // });
  // ---------- end STEP 2 ----------
}
