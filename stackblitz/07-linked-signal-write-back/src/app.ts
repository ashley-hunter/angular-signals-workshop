/**
 * Slide 7: A linkedSignal can write back to its source
 *
 * STEP 1 is live. To move through the steps, comment out the live STEP block
 * and uncomment the next one (select the lines, then Cmd+/ or Ctrl+/).
 *
 * Type 212 into Fahrenheit and watch Celsius.
 *   STEP 1: Celsius never moves, and the next Celsius edit throws the 212 away.
 *   STEP 2 (AVOID): each signal reads the other. Angular throws a cycle error
 *           on first read (see the console).
 *   STEP 3: the set option sends the write back to tempC.
 */
import { Component, linkedSignal, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Two linked inputs</h1>
    <p class="hint">Type 212 into Fahrenheit.</p>
    <div class="card">
      <div class="row">
        <label>Celsius</label>
        <input type="number" [value]="tempC()" (input)="tempC.set(+$any($event.target).value)" />
      </div>
      <div class="row">
        <label>Fahrenheit</label>
        <input type="number" [value]="tempF()" (input)="tempF.set(+$any($event.target).value)" />
      </div>
    </div>
  `,
})
export class App {
  // ---------- STEP 1 (live) ----------
  readonly tempC = signal(0);

  readonly tempF = linkedSignal(
    () => (this.tempC() * 9) / 5 + 32,
  );

  // the write is local, and temporary
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · AVOID ----------
  // readonly tempC: WritableSignal<number> = linkedSignal(
  //   () => ((this.tempF() - 32) * 5) / 9,
  // );
  //
  // readonly tempF: WritableSignal<number> = linkedSignal(
  //   () => (this.tempC() * 9) / 5 + 32,
  // );
  //
  // // each one reads the other: a cycle
  // ---------- end STEP 2 ----------

  // ---------- STEP 3 · PREFER ----------
  // readonly tempC = signal(0);
  //
  // readonly tempF = linkedSignal(
  //   () => (this.tempC() * 9) / 5 + 32,
  //   { set: (f) => this.tempC.set(((f - 32) * 5) / 9) },
  // );
  //
  // // the write goes to tempC and comes back
  // ---------- end STEP 3 ----------
}
