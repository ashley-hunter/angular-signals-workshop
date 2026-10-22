/**
 * Slide 28: A failed request that renders as no data
 *
 * STEP 1 (AVOID) is live. To see the next step, comment out the STEP 1 block
 * and uncomment the STEP 2 block (select the lines, then Cmd+/ or Ctrl+/).
 *
 * Pick the "broken" team. Its request fails.
 *   STEP 1: the catch turns the failure into [], so it looks like an empty team.
 *   STEP 2: error() is set, so the template shows the error and a retry.
 */
import { Component, resource, signal } from '@angular/core';

interface User {
  id: number;
  name: string;
}

const TEAMS: Record<string, User[]> = {
  a1: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }],
  empty: [],
};

function loadUsers(teamId: string): Promise<User[]> {
  return new Promise((resolve, reject) =>
    setTimeout(() => (teamId in TEAMS ? resolve(TEAMS[teamId]) : reject(new Error('500 Internal Server Error'))), 400),
  );
}

@Component({
  selector: 'app-root',
  template: `
    <h1>Errors that look like empty data</h1>
    <p class="hint">Compare the "empty" team with the "broken" team.</p>
    <div class="row">
      @for (t of teams; track t) {
        <button (click)="teamId.set(t)">{{ t }}</button>
      }
    </div>
    <div class="card">
      @if (users.isLoading()) {
        <div class="hint">Loading...</div>
      } @else if (users.error(); as err) {
        <div class="bad">Could not load users: {{ err.message }}</div>
        <button (click)="users.reload()">Retry</button>
      } @else {
        @for (u of users.value(); track u.id) {
          <div>{{ u.name }}</div>
        } @empty {
          <div class="hint">This team has no users.</div>
        }
      }
    </div>
  `,
})
export class App {
  readonly teams = ['a1', 'empty', 'broken'];
  readonly teamId = signal('a1');

  // ---------- STEP 1 · AVOID (live) ----------
  readonly users = resource({
    params: this.teamId,
    loader: ({ params }) =>
      loadUsers(params).catch(() => []),
  });

  // error() is never true, so the
  // template shows the empty state
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · PREFER ----------
  // readonly users = resource({
  //   params: this.teamId,
  //   loader: ({ params }) =>
  //     loadUsers(params),
  // });
  //
  // // error() is true, so the template
  // // shows the error and a retry
  // ---------- end STEP 2 ----------
}
