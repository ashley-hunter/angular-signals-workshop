/**
 * Slide 13: A dependency set can be wrong in both directions
 *
 * STEP 1 is live. To move through the steps, comment out every block for the
 * live step and uncomment every block for the next one (select the lines,
 * then Cmd+/ or Ctrl+/). Blocks are labelled with the steps they belong to.
 *
 * Click "Sort". Sorting is client-side, so it should never refetch.
 *   STEP 1: params is the whole state object, so sorting refetches.
 *   STEP 2: params picks fields, but still reads state() and returns a new
 *           object every time, so sorting still refetches.
 *   STEP 3: separate signals. params never reads sortBy.
 */
import { Component, computed, resource, signal } from '@angular/core';

interface Row {
  name: string;
  score: number;
}

const fetchLog = signal<string[]>([]);

function loadRows(teamId: string, page: number): Promise<Row[]> {
  fetchLog.update((l) => [`${new Date().toLocaleTimeString()}  fetch team=${teamId} page=${page}`, ...l]);
  const rows = Array.from({ length: 5 }, (_, i) => ({
    name: `${teamId}-user-${(page - 1) * 5 + i + 1}`,
    score: Math.round(Math.random() * 100),
  }));
  return new Promise((resolve) => setTimeout(() => resolve(rows), 300));
}

@Component({
  selector: 'app-root',
  template: `
    <h1>Resource params</h1>
    <p class="hint">Click Sort and watch the fetch log.</p>
    <div class="row">
      <button (click)="switchTeam()">Switch team</button>
      <button (click)="nextPage()">Next page</button>
      <button (click)="toggleSort()">Sort by {{ sortKey() === 'name' ? 'score' : 'name' }}</button>
    </div>
    <div class="card">
      @for (r of sorted(); track r.name) {
        <div>{{ r.name }}: {{ r.score }}</div>
      }
    </div>
    <div class="card log">{{ fetchLog().join('\n') }}</div>
  `,
})
export class App {
  readonly fetchLog = fetchLog;

  // ---------- STEP 1 (live) ----------
  readonly state = signal({ teamId: 'a1', page: 1, sortBy: 'name' });

  readonly rows = resource({
    params: () => this.state(),
    loader: ({ params }) => loadRows(params.teamId, params.page),
  });

  // sorting is client-side, but sortBy changes still refetch
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 ----------
  // readonly state = signal({ teamId: 'a1', page: 1, sortBy: 'name' });
  //
  // readonly rows = resource({
  //   params: () => ({ teamId: this.state().teamId, page: this.state().page }),
  //   loader: ({ params }) => loadRows(params.teamId, params.page),
  // });
  //
  // // still refetches - params read state(), and returns a new object every time
  // ---------- end STEP 2 ----------

  // ---------- STEP 1, 2 (helpers for the buttons) ----------
  readonly sortKey = computed(() => this.state().sortBy);
  switchTeam() { this.state.update((s) => ({ ...s, teamId: s.teamId === 'a1' ? 'b2' : 'a1', page: 1 })); }
  nextPage() { this.state.update((s) => ({ ...s, page: s.page + 1 })); }
  toggleSort() { this.state.update((s) => ({ ...s, sortBy: s.sortBy === 'name' ? 'score' : 'name' })); }
  // ---------- end STEP 1, 2 ----------

  // ---------- STEP 3 ----------
  // readonly teamId = signal('a1');
  // readonly page = signal(1);
  // readonly sortBy = signal('name');
  //
  // readonly rows = resource({
  //   params: () => ({ teamId: this.teamId(), page: this.page() }),
  //   loader: ({ params }) => loadRows(params.teamId, params.page),
  // });
  //
  // // params never reads sortBy, so changing it does nothing
  //
  // // helpers for the buttons
  // readonly sortKey = this.sortBy;
  // switchTeam() { this.teamId.update((t) => (t === 'a1' ? 'b2' : 'a1')); this.page.set(1); }
  // nextPage() { this.page.update((p) => p + 1); }
  // toggleSort() { this.sortBy.update((s) => (s === 'name' ? 'score' : 'name')); }
  // ---------- end STEP 3 ----------

  readonly sorted = computed(() => {
    const rows = [...(this.rows.value() ?? [])];
    return this.sortKey() === 'name'
      ? rows.sort((a, b) => a.name.localeCompare(b.name))
      : rows.sort((a, b) => b.score - a.score);
  });
}
