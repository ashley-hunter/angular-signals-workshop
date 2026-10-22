/**
 * Slide 26: Signal-driven fetches belong in a resource
 *
 * STEP 1 is live. To move through the steps, comment out the live STEP blocks
 * and uncomment the next step's blocks (select the lines, then Cmd+/ or Ctrl+/).
 *
 * Click the two teams quickly, back and forth.
 *   STEP 1 (AVOID): responses take a random time, so a slow old response can
 *           land last and show the wrong team. Nothing cancels it.
 *   STEP 2: httpResource. Superseded requests are cancelled.
 *   STEP 3: rxResource. Same signals out, an Observable in.
 *   STEP 4: resource. Same signals out, a Promise in.
 *
 * The data is static JSON in public/, so the URLs end in .json here.
 */
import { HttpClient, httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, resource, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

interface User {
  id: number;
  name: string;
}

const api = {
  /** Fake API with random latency, so responses can arrive out of order. */
  async users(teamId: string): Promise<User[]> {
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 1200));
    return (await fetch(`/api/teams/${teamId}/users.json`)).json();
  },
};

@Component({
  selector: 'app-root',
  template: `
    <h1>Resources</h1>
    <p class="hint">Click between the teams quickly. Which team's users end up on screen?</p>
    <div class="row">
      <button (click)="teamId.set('a1')">Team a1</button>
      <button (click)="teamId.set('b2')">Team b2</button>
      <span>Selected: <code>{{ teamId() }}</code></span>
    </div>
    <div class="card">
      @if (busy()) {
        <div class="hint">Loading...</div>
      }
      @for (u of list(); track u.id) {
        <div>{{ u.name }}</div>
      }
    </div>
  `,
})
export class App {
  private readonly http = inject(HttpClient);
  readonly teamId = signal('a1');

  // ---------- STEP 1 · AVOID (live) ----------
  readonly users = signal<User[]>([]);
  readonly loading = signal(false);

  readonly #fetch = effect(async () => {
    this.loading.set(true);
    this.users.set(await api.users(this.teamId()));
    this.loading.set(false);
  });

  // for the template
  readonly list = this.users;
  readonly busy = this.loading;
  // ---------- end STEP 1 ----------

  // ---------- STEP 2 · PREFER ----------
  // readonly users = httpResource<User[]>(
  //   () => `/api/teams/${this.teamId()}/users.json`,
  // );
  // ---------- end STEP 2 ----------

  // ---------- STEP 3 · rxResource ----------
  // readonly users = rxResource({
  //   params: () => this.teamId(),
  //   stream: ({ params: id }) =>
  //     this.http.get<User[]>(`/api/teams/${id}/users.json`),
  // });
  // ---------- end STEP 3 ----------

  // ---------- STEP 4 · resource ----------
  // readonly users = resource({
  //   params: () => this.teamId(),
  //   loader: ({ params: id, abortSignal }) =>
  //     fetch(`/api/teams/${id}/users.json`, { signal: abortSignal })
  //       .then((r) => r.json() as Promise<User[]>),
  // });
  // ---------- end STEP 4 ----------

  // ---------- STEP 2, 3, 4 (for the template) ----------
  // readonly list = computed(() => this.users.value() ?? []);
  // readonly busy = this.users.isLoading;
  // ---------- end STEP 2, 3, 4 ----------
}
