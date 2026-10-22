/**
 * Slide 17: The constructor sees defaults, not inputs
 *
 * STEP 1 is live. To move through the steps, comment out the live STEP block
 * and uncomment the next one (select the lines, then Cmd+/ or Ctrl+/).
 *
 * The parent passes mode="flat", then you can switch it to "tree".
 *   STEP 1 (AVOID): the constructor sees the default 'tree' and starts
 *           observing even though the input is 'flat'.
 *   STEP 2 (STILL WRONG): ngOnInit sees 'flat', but switching to 'tree'
 *           later does nothing.
 *   STEP 3 (PREFER): the effect re-runs every time mode changes.
 */
import { Component, effect, input, signal } from '@angular/core';

const log = signal<string[]>([]);
const write = (line: string) => log.update((l) => [...l, line]);

@Component({
  selector: 'tree-view',
  template: `<div class="card">mode = <code>{{ mode() }}</code></div>`,
})
export class TreeView {
  startObserving() {
    write(`startObserving() (mode is '${this.mode()}')`);
    return () => write('stopObserving()');
  }

  // ---------- STEP 1 · AVOID (live) ----------
  readonly mode = input<'tree' | 'flat'>('tree');

  constructor() {
    if (this.mode() === 'tree') {
      this.startObserving();
    }
  }
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · STILL WRONG ----------
  // readonly mode = input<'tree' | 'flat'>('tree');
  //
  // ngOnInit() {
  //   if (this.mode() === 'tree') {
  //     this.startObserving();
  //   }
  // }
  // ---------- end STEP 2 ----------

  // ---------- STEP 3 · PREFER ----------
  // readonly mode = input<'tree' | 'flat'>('tree');
  //
  // readonly #observe = effect((onCleanup) => {
  //   if (this.mode() === 'tree') {
  //     onCleanup(this.startObserving());
  //   }
  // });
  // ---------- end STEP 3 ----------
}

@Component({
  selector: 'app-root',
  imports: [TreeView],
  template: `
    <h1>Constructor vs inputs</h1>
    <p class="hint">The parent passes "flat". Switch it and watch the log.</p>
    <div class="row">
      <button (click)="mode.set(mode() === 'flat' ? 'tree' : 'flat')">Switch to {{ mode() === 'flat' ? 'tree' : 'flat' }}</button>
    </div>
    <tree-view [mode]="mode()" />
    <div class="card log">{{ log().join('\n') }}</div>
  `,
})
export class App {
  readonly log = log;
  readonly mode = signal<'tree' | 'flat'>('flat');
}
