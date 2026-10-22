/**
 * Slide 23: A computed has no way to clean up after itself
 *
 * STEP 1 (AVOID) is live. To see the next step, comment out the STEP 1 block
 * and uncomment the STEP 2 block (select the lines, then Cmd+/ or Ctrl+/).
 *
 * Switch worker a few times and watch the console. Each worker logs every 2s.
 * In STEP 1 the old workers never stop. In STEP 2 only one is ever alive.
 */
import { Component, computed, effect, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Resources with a lifetime</h1>
    <p class="hint">Switch worker a few times and watch the console.</p>
    <div class="row">
      <button (click)="name.set(name() === 'clock.js' ? 'counter.js' : 'clock.js')">
        Switch to {{ name() === 'clock.js' ? 'counter.js' : 'clock.js' }}
      </button>
    </div>
    <div class="card">Current worker: <code>{{ base() }}/{{ name() }}</code></div>
  `,
})
export class App {
  readonly base = signal('/workers');
  readonly name = signal('clock.js');

  // ---------- STEP 1 · AVOID (live) ----------
  readonly worker = computed(
    () => new Worker(`${this.base()}/${this.name()}`),
  );

  // a computed is lazy, so something has to read it
  readonly #read = effect(() => this.worker());
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · PREFER ----------
  // readonly #url = computed(
  //   () => `${this.base()}/${this.name()}`,
  // );
  //
  // readonly #worker = effect((onCleanup) => {
  //   const w = new Worker(this.#url());
  //   onCleanup(() => w.terminate());
  // });
  // ---------- end STEP 2 ----------
}
