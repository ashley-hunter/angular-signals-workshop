/**
 * Slide 21: Read everything, then write everything
 *
 * STEP 1 (AVOID) is live. To see the next step, comment out the STEP 1 block
 * and uncomment the STEP 2 block (select the lines, then Cmd+/ or Ctrl+/).
 *
 * Open the console and refresh the preview. STEP 1 reads a layout value right
 * after writing one, so every row forces a fresh layout. STEP 2 does all the
 * reads first, then all the writes, so layout happens once.
 */
import { afterNextRender, Component, computed, ElementRef, viewChildren } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Layout thrashing</h1>
    <p class="hint">Refresh the preview and compare the timing in the console.</p>
    <div class="card" style="height: 360px; overflow: auto;">
      @for (n of numbers; track n) {
        <div #row style="border-bottom: 1px solid #2c3542;">Row {{ n }}</div>
      }
    </div>
  `,
})
export class App {
  readonly numbers = Array.from({ length: 3000 }, (_, i) => i + 1);
  private readonly rowRefs = viewChildren<ElementRef<HTMLElement>>('row');
  readonly rows = computed(() => this.rowRefs().map((ref) => ({ el: ref.nativeElement })));

  // ---------- STEP 1 · AVOID (live) ----------
  constructor() {
    afterNextRender(() => {
      const t = performance.now();
      for (const row of this.rows()) {
        const height = row.el.offsetHeight;
        row.el.style.height = `${height + 8}px`;
      }
      console.log(`interleaved read/write: ${Math.round(performance.now() - t)}ms`);
    });
  }
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · PREFER ----------
  // constructor() {
  //   let t = 0;
  //   afterNextRender({
  //     earlyRead: () => {
  //       t = performance.now();
  //       return this.rows().map((row) => row.el.offsetHeight);
  //     },
  //     write: (heights) => {
  //       this.rows().forEach((row, i) => {
  //         row.el.style.height = `${heights[i] + 8}px`;
  //       });
  //       // force the one layout, so the timing is a fair comparison
  //       void document.body.offsetHeight;
  //       console.log(`reads then writes: ${Math.round(performance.now() - t)}ms`);
  //     },
  //   });
  // }
  // ---------- end STEP 2 ----------
}
