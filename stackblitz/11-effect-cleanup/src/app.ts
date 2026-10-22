/**
 * Slide 11: Cleanup is not teardown. It is undo the previous run
 *
 * STEP 1 (AVOID) is live. To see the next step, comment out the STEP 1 block
 * and uncomment the STEP 2 block (select the lines, then Cmd+/ or Ctrl+/).
 *
 * Switch orders a few times. In STEP 1 every old interval keeps polling.
 * (The interval is 1s here rather than 5s, so you do not have to wait.)
 */
import { Component, effect, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Effect cleanup</h1>
    <p class="hint">Switch order a few times and watch the log.</p>
    <div class="row">
      <button (click)="orderId.set(orderId() + 1)">Switch to order #{{ orderId() + 1 }}</button>
      <button (click)="log.set([])">Clear log</button>
    </div>
    <div class="card log">{{ log().join('\n') }}</div>
  `,
})
export class App {
  readonly orderId = signal(1);
  readonly log = signal<string[]>([]);

  check(id: number) {
    this.log.update((l) => [`${new Date().toLocaleTimeString()}  checking order #${id}`, ...l].slice(0, 40));
  }

  // ---------- STEP 1 · AVOID (live) ----------
  readonly poll = effect(() => {
    const id = this.orderId();
    setInterval(() => this.check(id), 1_000);
  });
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · PREFER ----------
  // readonly poll = effect((onCleanup) => {
  //   const id = this.orderId();
  //   const handle = setInterval(() => this.check(id), 1_000);
  //
  //   onCleanup(() => clearInterval(handle));
  // });
  // ---------- end STEP 2 ----------
}
