/**
 * Slide 10: An effect stops tracking the moment it goes async
 *
 * STEP 1 (AVOID) is live. To see the next step, comment out the STEP 1 block
 * and uncomment the STEP 2 block (select the lines, then Cmd+/ or Ctrl+/).
 *
 * Change the team, then change the format. In STEP 1 the format change does
 * nothing, because format() is read after the await and is never tracked.
 */
import { Component, effect, resource, signal } from '@angular/core';

interface User {
  name: string;
  joined: Date;
}

const TEAMS: Record<string, User[]> = {
  a1: [{ name: 'Ada', joined: new Date(2021, 2, 4) }, { name: 'Grace', joined: new Date(2022, 7, 19) }],
  b2: [{ name: 'Linus', joined: new Date(2019, 10, 1) }, { name: 'Radia', joined: new Date(2023, 0, 12) }],
};

function loadUsers(teamId: string): Promise<User[]> {
  return new Promise((resolve) => setTimeout(() => resolve(TEAMS[teamId]), 400));
}

/** Stand-in for a non-Angular grid library. */
class Grid {
  readonly output = signal<string[]>([]);
  render(rows: User[], format: 'short' | 'long') {
    console.log('grid.render', format);
    this.output.set(
      rows.map((r) => `${r.name}: ${format === 'short' ? r.joined.getFullYear() : r.joined.toDateString()}`),
    );
  }
}

@Component({
  selector: 'app-root',
  template: `
    <h1>Async effects</h1>
    <p class="hint">Switch team, then switch format.</p>
    <div class="row">
      <button (click)="teamId.set(teamId() === 'a1' ? 'b2' : 'a1')">Team: {{ teamId() }}</button>
      <button (click)="format.set(format() === 'short' ? 'long' : 'short')">Format: {{ format() }}</button>
    </div>
    <div class="card">
      @for (line of grid.output(); track line) {
        <div>{{ line }}</div>
      }
    </div>
  `,
})
export class App {
  readonly grid = new Grid();
  readonly teamId = signal('a1');
  readonly format = signal<'short' | 'long'>('short');

  // ---------- STEP 1 · AVOID (live) ----------
  readonly #render = effect(async () => {
    const id = this.teamId();
    const rows = await loadUsers(id);

    this.grid.render(rows, this.format());
  });
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · PREFER ----------
  // readonly users = resource({
  //   params: this.teamId,
  //   loader: ({ params }) => loadUsers(params),
  // });
  //
  // readonly #render = effect(() => {
  //   const rows = this.users.value() ?? [];
  //   this.grid.render(rows, this.format());
  // });
  // ---------- end STEP 2 ----------
}
