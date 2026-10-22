/**
 * Slide 29: An unguarded toSignal is a state you did not model
 *
 * STEP 1 is live. To move through the steps, comment out the live STEP block
 * and uncomment the next one (select the lines, then Cmd+/ or Ctrl+/).
 *
 * user$ emits after one second.
 *   STEP 1: Signal<User | undefined>. For the first second it renders like
 *           "no user".
 *   STEP 2: requireSync. user$ does not emit synchronously, so this throws
 *           NG0601 at creation (see the console). Change user$ to of(ADA)
 *           to see it work.
 *   STEP 3: initialValue. Starts at a value you chose.
 */
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { delay, of } from 'rxjs';

interface User {
  name: string;
  signedIn: boolean;
}

const ADA: User = { name: 'Ada', signedIn: true };
const GUEST: User = { name: 'Guest', signedIn: false };

@Component({
  selector: 'app-root',
  template: `
    <h1>toSignal and its initial value</h1>
    <p class="hint">Refresh the preview and watch the first second.</p>
    <div class="card">{{ describe(user()) }}</div>
  `,
})
export class App {
  readonly user$ = of(ADA).pipe(delay(1000));

  describe(user: User | undefined) {
    if (!user) return 'No user. Signed out? Still loading? The type cannot tell you.';
    return user.signedIn ? `Signed in as ${user.name}` : `Browsing as ${user.name}`;
  }

  // ---------- STEP 1 (live) ----------
  readonly user = toSignal(this.user$);

  // Signal<User | undefined>
  // undefined until the first emission - and it renders like "no user"
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 ----------
  // readonly user = toSignal(this.user$, { requireSync: true });
  //
  // // Signal<User>
  // // no undefined at all - NG0601 at creation if it does not emit
  // ---------- end STEP 2 ----------

  // ---------- STEP 3 ----------
  // readonly user = toSignal(this.user$, { initialValue: GUEST });
  //
  // // Signal<User>
  // // starts at a value you chose, rather than one you inherited
  // ---------- end STEP 3 ----------
}
