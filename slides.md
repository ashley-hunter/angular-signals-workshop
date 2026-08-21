---
theme: default
title: Angular Signals
info: Signals in practice - the patterns we reach for, and the pitfalls we keep shipping.
canvasWidth: 1920
colorSchema: dark
highlighter: shiki
transition: slide-left
mdc: true
layout: cover
eyebrow: 'Workshop'
---

# Angular Signals

The patterns we reach for, and the pitfalls we keep shipping.

<!--
- Signals aren't new here. Adoption isn't our problem - the codebase is already overwhelmingly signal-based
- What keeps happening: a small set of mistakes, repeated, in code that reads as perfectly reasonable
- That's the session - those mistakes, and the shape of each fix
-->

---
layout: content
eyebrow: 'Framing'
heading: 'Adoption is done. Fluency is not.'
---
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0 0 44px;max-width:1600px;">The reactivity findings that come back in review are not typos. They are code that reads correctly and behaves incorrectly, and they come in three shapes.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">STALE</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Something read a value once and never heard that it changed. The UI is simply wrong, and nothing errors.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">WASTEFUL</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Correct, and doing the work again on every pass. Rebuilt objects, repeated formatting, the same request twice.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">SILENT</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A request failed and the screen showed an empty list. It is not blank because something went wrong - it is blank because nothing said so.</p> </div> </div>
<p style="font-size:30px;color:#5E6B7D;line-height:1.45;margin:44px 0 0;max-width:1600px;">A dependency problem, an identity problem and a state-modelling problem. Every chapter after this one is one of the three.</p>

<!--
- Where these come from, so nobody takes them on trust
- ~4,000 PR comments, narrowed to reactivity = 290. Sorted by what went wrong, not which API
- **Stale 44, wasteful 38, silent failure 27**
- Caveat: comment-level and multi-label, so they don't sum to 290
- Caveat: reactivity slice only. Overall our big categories are guideline violations, logic bugs, missing tests, stale comments
- Fourth shape if asked - races/ordering/lifetime, 11. Far behind, hence not up here
- Warning story on that number: first pass said 124, which would have put it second. The regex was also matching "traces", and we have a lot of tracing. With word boundaries: 11. "race condition" appears zero times
- A headline finding was a regex artefact. If it happened once it could be hiding in the others
- On "silent": all three are silent in that nothing throws. What's silent in the third is the failure itself
-->

---
layout: section
number: '01'
transition: fade
---
## Derived state

<p class="lead" style="margin-top:40px">Where the largest share of review findings live.</p>

<!--
- Biggest cluster in the review comments, not close
- If we change one habit as a team today, this is it
-->

---
layout: content
eyebrow: 'Picking one'
heading: 'When to use each primitive'
---
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-bottom:36px;">

<div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 34px;display:flex;flex-direction:column;gap:18px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">signal()</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">Nothing derives it. A user, or an event from outside, decides what it is.</p> <div style="margin-top:auto;font-family:'JetBrains Mono',monospace;font-size:23px;line-height:1.5;color:#8A97A8;border-top:1px solid #2C3542;padding-top:18px;">query = signal('');</div> </div>

<div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 34px;display:flex;flex-direction:column;gap:18px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">computed()</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">It is a formula over other signals, and nothing else is allowed to overwrite the answer.</p> <div style="margin-top:auto;font-family:'JetBrains Mono',monospace;font-size:23px;line-height:1.5;color:#8A97A8;border-top:1px solid #2C3542;padding-top:18px;">total = computed(() =&gt;<br>&nbsp;&nbsp;rows().length);</div> </div>

<div style="background:#12171F;border:1px solid #8B7CF6;border-radius:14px;padding:32px 34px;display:flex;flex-direction:column;gap:18px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#8B7CF6;">linkedSignal()</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">A formula, <em>and</em> the user can overwrite the answer. Derived, but still writable.</p> <div style="margin-top:auto;font-family:'JetBrains Mono',monospace;font-size:23px;line-height:1.5;color:#B9A9FF;border-top:1px solid #3A3358;padding-top:18px;">selected = linkedSignal(() =&gt;<br>&nbsp;&nbsp;rows()[0]);</div> </div>

</div>
<div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:28px 36px;display:grid;grid-template-columns:auto 1fr;gap:32px;align-items:center;"> <div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#FF7A6B;white-space:nowrap;">effect()</div> <p style="font-size:27px;line-height:1.45;margin:0;color:#C9D4E2;">Not on this list. It is the exit from the graph into something that is not reactive - and it is not a place to keep state.</p> </div>
<p style="font-size:29px;color:#8A97A8;line-height:1.45;margin:32px 0 0;max-width:1600px;">Most of us stop at the middle card. The one on the right is where our largest cluster of findings comes from.</p>

<!--
- We all get signal right, and computed right. The third card is where we fall down
- linkedSignal used ~1/3 as often as the workaround it replaces - so "derived but writable" becomes an effect, and that's our largest cluster of findings
- Left to right: nothing derives it → signal. Derived, nothing else may overwrite → computed. Derived, user can overwrite → linkedSignal
- effect is deliberately not in the row - it holds no value. It's the exit from the graph into something non-reactive
-->

---
layout: content
eyebrow: 'The pattern'
heading: 'An effect that writes a signal is a computed you maintain by hand'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">Everything here is signals, so it feels reactive. It is a manual subscription spelled with signals.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
readonly rows = input.required<Row[]>();
readonly visible = signal<Row[]>([]);

readonly #sync = effect(() => {
  this.visible.set(this.rows().filter((r) => r.enabled));
});
```

</div>
<div>

```ts
// PREFER
readonly rows = input.required<Row[]>();

readonly visible = computed(() =>
  this.rows().filter((r) => r.enabled),
);
```

</div>
</div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:40px 0 0;max-width:1600px;">The left lands after the view has already been checked and forces a second check. Anything can write to it, and it rebuilds the array either way.</p>

<!--
- Say why the left is worse - "the rule says so" changes nobody's habits. Four things:
- **Late.** Runs after the view that triggered it was checked, so everything that read the value that pass got the old one. Angular comes round again before the screen agrees with itself
- **Writable.** Anything in the class can set it - the invariant isn't enforced
- **No cached identity.** Array rebuilt whether or not the answer changed, so downstream reruns
- **The catch-up pass costs work** on every input change
- The right can't drift. Nothing to keep in sync
-->

---
layout: content
eyebrow: 'Derived, and writable'
heading: 'When the user can override the derived value'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">The filter resets the page, so it is derived. The pager moves it, so it is writable. Both at once is <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">linkedSignal</code>.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
readonly page = signal(1);

readonly #reset = effect(() => {
  this.filter();     // track
  this.page.set(1);  // reset
});

next() { this.page.update((p) => p + 1); }
prev() { this.page.update((p) => p - 1); }
```

</div>
<div>

```ts
// PREFER
readonly page = linkedSignal(() => {
  this.filter();  // track
  return 1;       // reset
});

next() { this.page.update((p) => p + 1); }
prev() { this.page.update((p) => p - 1); }
```

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:40px 0 0;max-width:1600px;">Same paging on both sides. On the right the reset and the writes are one signal, so there is nothing to keep in sync.</p>

<!--
- The pager methods force it. Derived from the filter alone → computed, done. But next/prev must write, and computed won't allow it
- So: plain signal → nothing resets it on filter change → add an effect to reset by hand. That's the left, and every step of it is sensible
- linkedSignal fits exactly: derived, so the filter resets to page one for free; writable, so next/prev just work
- The methods are identical on both sides. Only the reset location changes
- The tell in your own code is a sentence with "but": derived, **but** the user can change it. Selected row, current page, active tab, a field seeded from what you loaded
- ~300 instances of the left in our codebase against ~95 of the right
- If asked: a longer form takes source + computation, and the computation gets previous source and previous value. Use it to keep the selection if it still exists in the new data
-->

---
layout: content
eyebrow: 'Lesser known'
heading: 'A linkedSignal can write back to its source'
clicks: 1
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">Both boxes are bound. Somebody types 212 into Fahrenheit - what happens to Celsius?</p>
<div style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:44px;align-items:start;">
<div>

````md magic-move
```ts
const tempC = signal(0);

const tempF = linkedSignal(
  () => (tempC() * 9) / 5 + 32,
);

// the write is local, and temporary
```

```ts
const tempC = signal(0);

const tempF = linkedSignal(
  () => (tempC() * 9) / 5 + 32,
  { set: (f) => tempC.set(((f - 32) * 5) / 9) },
);

// the write goes to tempC and comes back
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 36px;"> <div style="font-size:24px;color:#8A97A8;margin-bottom:12px;">Celsius</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:0 20px;height:62px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:28px;color:#E8ECF2;"><span class="swap"><span v-click.hide="1" style="color:#FF7A6B;">0</span><span v-click="1" style="color:#2FD8B4;">100</span></span></div> <div style="font-size:24px;color:#8A97A8;margin:26px 0 12px;">Fahrenheit</div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:8px;padding:0 20px;height:62px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:28px;color:#E8ECF2;">212</div> <div style="font-size:25px;line-height:1.4;margin-top:24px;"><span class="swap"><span v-click.hide="1" style="color:#FF7A6B;">Celsius never moved. Next write to it and the 212 is gone.</span><span v-click="1" style="color:#2FD8B4;">Celsius took the write. Fahrenheit came back through the computation.</span></span></div> </div>
</div>

<!--
- Two bound inputs. Somebody types 212 into Fahrenheit - hold the question, the answer surprises people
- **Default:** write lands, F holds 212, Celsius still 0. Next write to C wipes it. A local override is real, and temporary
- **With set:** hook intercepts, converts, writes C. C becomes 100. F updates because the computation reran off the new C - went round and came back, so the two can't disagree
- The important bit is what's missing: nothing sets tempF directly. The hook replaces the default write, so tempF only ever gets a value from the computation. One owner
- rawSet (2nd arg) writes the linked signal directly - async save you won't wait on, or expensive derivation you can already predict. Mostly leave alone
- update goes through the same hook, reading the current value untracked
- Real shape isn't temperature: a value owned by a parent or store, where the write belongs to somebody else. Without the hook that's a linked signal plus an effect pushing edits back
-->

---
layout: content
eyebrow: 'Reactive context'
heading: 'Not every callback you pass Angular is tracked'
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 8px;max-width:1660px;">A read only becomes a dependency if it happens somewhere Angular is watching. <span style="color:#2FD8B4;">Green</span> is watched, <span style="color:#FF7A6B;">red</span> is not - and some of these take two callbacks and watch exactly one.</p>
<div style="font-family:'JetBrains Mono',monospace;font-size:31px;line-height:1.5;color:#C9D4E2;margin-top:26px;"><div style="padding:14px 0;border-bottom:1px solid #1E252F;">computed(<span style="color:#2FD8B4;">fn</span>)</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">effect(<span style="color:#2FD8B4;">fn</span>)</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">linkedSignal(<span style="color:#2FD8B4;">computation</span>, { <span style="color:#FF7A6B;">set</span> })</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">resource({ <span style="color:#2FD8B4;">params</span>, <span style="color:#FF7A6B;">loader</span> })</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">afterRenderEffect({ <span style="color:#2FD8B4;">write</span> })</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">afterNextRender({ <span style="color:#FF7A6B;">write</span> })</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">untracked(<span style="color:#FF7A6B;">fn</span>)</div></div>
<p style="font-size:28px;color:#C9D4E2;line-height:1.45;margin:26px 0 0;max-width:1660px;">The <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">resource</code> row is the one to keep: <code style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#2FD8B4;">params</code> decides <em>when</em> to fetch, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#FF7A6B;">loader</code> only decides <em>how</em>. A signal read in the loader will never cause a refetch. And nothing after an <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">await</code> is tracked anywhere.</p>

<!--
- The fact underneath most of these mistakes, and rarely written down in one place
- A read is only a dependency inside a reactive consumer. Not "in a component", not "in a signals API"
- The two middle rows are unguessable from the API shape: linkedSignal and resource each take two callbacks and watch one
- **resource is the row to memorise.** params tracked = decides *when*. loader wrapped in untracked in the source = decides only *how*. A read in the loader never refetches, and the request keeps whatever it read first time. Stale with no visible cause
- linkedSignal, same trap smaller: computation tracked, set hook isn't its own reactive computation - it runs wherever set was called
- Render rows are where the names mislead: same four phase names, but afterRenderEffect gives each phase a reactive node (hence reruns), afterNextRender phases are plain one-shot callbacks
- Why it bites: every one of these is correct the first time. It works, it demos, it ships. It fails on the second change
-->

---
layout: content
eyebrow: 'Legitimate use'
heading: 'What an effect is actually for'
---
<div style="display:grid;grid-template-columns:1.05fr 0.95fr;gap:44px;align-items:start;">
<div>
<div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.18em;text-transform:uppercase;color:#2FD8B4;margin-bottom:28px;">Bridges out of the graph</div>
<div style="display:flex;flex-direction:column;gap:18px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:12px;padding:22px 30px;font-size:28px;color:#C9D4E2;">A third-party library that must be told, not asked</div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:12px;padding:22px 30px;font-size:28px;color:#C9D4E2;">Persistence: writing to storage or the URL</div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:12px;padding:22px 30px;font-size:28px;color:#C9D4E2;">Logging, analytics, telemetry</div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:12px;padding:22px 30px;font-size:28px;color:#C9D4E2;">Imperative APIs driven from outside the signal graph</div> </div>
</div>
<div>
<div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.18em;text-transform:uppercase;color:#8B7CF6;margin-bottom:28px;">If you write one, it should say</div>
<div style="background:#12171F;border:1px solid #8B7CF6;border-radius:14px;padding:32px 38px;"> <p style="font-size:28px;line-height:1.5;margin:0 0 20px;color:#C9D4E2;"><strong style="color:#E8ECF2;">What is outside the graph.</strong> Name the non-reactive thing being driven.</p> <p style="font-size:28px;line-height:1.5;margin:0 0 20px;color:#C9D4E2;"><strong style="color:#E8ECF2;">Who owns the write.</strong> If the effect writes a signal, why it is the only writer.</p> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;"><strong style="color:#E8ECF2;">What it reacts to.</strong> The dependency set, honestly, including anything deliberately excluded.</p> </div>
</div>
</div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:40px 0 0;max-width:1600px;">Effects that pass review are the ones that name the non-reactive driver.</p>

<!--
- Balance needed here or everyone leaves thinking effects are banned
- They aren't. Genuine bridges are everywhere in our codebase - grids, editors, charts, event streams we don't own
- What separates an effect that survives review: whether the author could name the thing outside the graph
- So ask it of your own code before pushing - what non-reactive thing is this driving? Can't name it, and you've written a computed
- Two habits: one effect per side effect, and a named class field rather than buried in the constructor
-->

---
layout: content
eyebrow: 'Footgun'
heading: 'An effect stops tracking the moment it goes async'
clicks: 1
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">The team loads and the grid renders. Then somebody changes the format - what happens?</p>
<div style="display:grid;grid-template-columns:1.3fr 0.7fr;gap:40px;align-items:start;">
<div>

````md magic-move
```ts
// AVOID
readonly #render = effect(async () => {
  const id = this.teamId();
  const rows = await loadUsers(id);

  this.grid.render(rows, this.format());
});
```

```ts
// PREFER
readonly users = resource({
  params: this.teamId,
  loader: ({ params }) => loadUsers(params),
});

readonly #render = effect(() => {
  const rows = this.users.value();
  this.grid.render(rows, this.format());
});
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:30px 32px;"><div style="font-size:23px;color:#8A97A8;margin-bottom:10px;">What the effect depends on</div><div class="swap"><div v-click.hide="1"><div style="display:flex;align-items:baseline;gap:14px;padding:11px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;flex:1;">teamId</span><span style="font-size:21px;color:#2FD8B4;">tracked</span></div><div style="display:flex;align-items:baseline;gap:14px;padding:11px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;flex:1;">format</span><span style="font-size:21px;color:#FF7A6B;">not tracked</span></div></div><div v-click="1"><div style="display:flex;align-items:baseline;gap:14px;padding:11px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;flex:1;">teamId</span><span style="font-size:21px;color:#2FD8B4;">tracked</span></div><div style="display:flex;align-items:baseline;gap:14px;padding:11px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;flex:1;">users.value</span><span style="font-size:21px;color:#2FD8B4;">tracked</span></div><div style="display:flex;align-items:baseline;gap:14px;padding:11px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;flex:1;">format</span><span style="font-size:21px;color:#2FD8B4;">tracked</span></div></div></div><div style="font-size:24px;line-height:1.4;margin-top:22px;"><span class="swap"><span v-click.hide="1" style="color:#FF7A6B;">Change the format and nothing rerenders.</span><span v-click="1" style="color:#2FD8B4;">Every read is synchronous, so every read counts.</span></span></div></div>
</div>
<p style="font-size:28px;color:#C9D4E2;line-height:1.45;margin:34px 0 0;max-width:1660px;">Tracking covers the synchronous run only. Everything read after the <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">await</code> is invisible to the graph.</p>

<!--
- Team loads, grid renders, all fine. Change the format and nothing happens
- teamId is read synchronously, so it's tracked. After the await we're outside the reactive consumer - Angular stopped watching when the sync run finished
- So format is read, used, and never registered. On screen, in the render call, not in the graph
- Panel: one of two dependencies made it. **Worse than none** - it still fires on team change, so the wiring looks right and demos fine
- Found later by somebody changing the format, watching nothing happen, and hunting a render-path bug that doesn't exist
- Fix: get the async work out of the effect. resource splits it - params is tracked, the loader is not. The effect goes fully synchronous and both reads count
- Cancellation free: resource abandons superseded requests. The async effect lets both land and renders whichever finishes last
-->

---
layout: content
eyebrow: 'Cleanup'
heading: 'Cleanup is not teardown. It is undo the previous run'
clicks: 1
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">This polls an order. The id changes three times - how many intervals are running?</p>
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:44px;align-items:center;">
<div>

````md magic-move
```ts
readonly poll = effect(() => {
  const id = this.orderId();
  setInterval(() => this.check(id), 5_000);
});
```

```ts
readonly poll = effect((onCleanup) => {
  const id = this.orderId();
  const handle = setInterval(() => this.check(id), 5_000);

  onCleanup(() => clearInterval(handle));
});
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 34px;"><div style="font-size:23px;color:#8A97A8;margin-bottom:16px;">Intervals still running after three id changes</div><div style="display:flex;align-items:baseline;gap:16px;"><span class="swap"><span v-click.hide="1" style="font-family:'JetBrains Mono',monospace;font-size:76px;line-height:1;color:#FF7A6B;">3</span><span v-click="1" style="font-family:'JetBrains Mono',monospace;font-size:76px;line-height:1;color:#2FD8B4;">1</span></span><span style="font-size:24px;color:#8A97A8;">polling every 5s</span></div><div style="font-size:25px;line-height:1.4;margin-top:24px;"><span class="swap"><span v-click.hide="1" style="color:#FF7A6B;">Two of them are checking orders nobody is looking at.</span><span v-click="1" style="color:#2FD8B4;">Each rerun undoes the one before it.</span></span></div></div>
</div>
<p style="font-size:28px;color:#C9D4E2;line-height:1.45;margin:34px 0 0;max-width:1660px;"><code style="font-family:'JetBrains Mono',monospace;font-size:25px;">onCleanup</code> runs before <em>every</em> rerun, not just on destroy. Nothing errors - the app just does more work, forever.</p>

<!--
- Keyed on an order id. Every change reruns and starts an interval. Three changes = three intervals, two polling an order nobody's looking at
- From outside, this failure looks like: fine. Nothing throws, screen is correct, newest interval has the right order
- You've signed up for permanent background work that grows every time somebody clicks around. Surfaces weeks later as a perf complaint or a server bill
- Fix is one parameter: take onCleanup, hold the handle, clear it
- The key word isn't destroy, it's **rerun**. Runs before every rerun, then once on destroy. Not teardown - undo the previous run
- Everything started in an effect belongs here: intervals, subscriptions, listeners, in-flight requests
- DOM listeners: one AbortController, pass its signal to every addEventListener, abort in cleanup, whole set goes at once
-->

---
layout: section
number: '02'
transition: fade
---
## Dependencies

<p class="lead" style="margin-top:40px">The set is observed, not declared. That is where stale comes from.</p>

<!--
- The stale family. Every bug in it is one sentence: something changed, and nobody was listening
- Hold this first - a dependency set is **observed, not declared**. You never write down what a computed depends on. Angular watches what you actually read during the run, and that's the set. For that run only
- Two consequences we keep returning to: a read behind a condition only counts on runs that reach it; a read outside a reactive context - or after an await - isn't a dependency at all
- If asked whether an if can hide a dependency: no. The list is rebuilt from scratch every run, but the condition itself is a tracked read, so flipping it recomputes and picks up the new branch. Self-correcting
- It goes wrong when the condition isn't a signal at all - nothing then re-triggers the read
- Nobody writes the set down, nothing checks it, the compiler can't help. Hence stale, and hence code that looks like working software until it isn't
-->

---
layout: content
eyebrow: 'Two failure modes'
heading: 'A dependency set can be wrong in both directions'
clicks: 2
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">Too narrow and a real change never reruns the work. Too wide and unrelated changes rerun expensive things - here, a sort toggle that fires a network request.</p>

````md magic-move
```ts
readonly state = signal({ teamId: 'a1', page: 1, sortBy: 'name' });

readonly rows = resource({
  params: () => this.state(),
  loader: ({ params }) => loadRows(params.teamId, params.page),
});

// sorting is client-side, but sortBy changes still refetch
```

```ts
readonly state = signal({ teamId: 'a1', page: 1, sortBy: 'name' });

readonly rows = resource({
  params: () => ({ teamId: this.state().teamId, page: this.state().page }),
  loader: ({ params }) => loadRows(params.teamId, params.page),
});

// still refetches - params read state(), and returns a new object every time
```

```ts
readonly teamId = signal('a1');
readonly page = signal(1);
readonly sortBy = signal('name');

readonly rows = resource({
  params: () => ({ teamId: this.teamId(), page: this.page() }),
  loader: ({ params }) => loadRows(params.teamId, params.page),
});

// params never reads sortBy, so changing it does nothing
```
````

<p style="font-size:28px;color:#C9D4E2;line-height:1.45;margin:26px 0 0;max-width:1660px;">The read is the dependency, and the request is compared by <em>reference</em>. Split the signals - or feed <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">params</code> a <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">computed</code> with an <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">equal</code> when you cannot.</p>

<!--
- Both directions turn up about equally, both written with exactly the right intention
- Too narrow = the stale case: the read goes through a helper or sits in untracked, and tracking gets skipped
- Too wide = this. One state object: team id, page, sort column. Sorting is client-side, but params reads the whole object, so changing the sort fires a request. Nobody wrote that on purpose - it's what the code says
- Obvious fix: pull out the two fields the request needs
- **It changes nothing.** params still calls this.state(), so it still depends on the whole signal, so sortBy still reruns it. And now it returns a fresh object literal each run
- Nothing diffs that. Angular compares request to previous **by reference**, so a new object is never equal - same refetch rate as before
- That's the version to recognise: it looks like a fix, it isn't, and it's the one you'll write
- The read is the dependency. So the real fix: separate signals, params touching only what the request is made of. sortBy never invalidates params because params never read it
- If state genuinely can't be split (a store, a parent owns it): a computed in front with a custom equal on the fields you care about. Returning true keeps the old value without bumping the version, so nothing downstream hears
- Mercy: params returning a primitive makes the reference check a value check, and none of this applies
-->

---
layout: content
eyebrow: 'Escape hatch'
heading: 'A dependency can arrive in code you did not write'
clicks: 2
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 24px;max-width:1660px;">Call a method from inside an effect and every signal <em>it</em> reads becomes your dependency too - including the ones added later.</p>

````md magic-move
```ts
readonly #ping = effect(() => {
  const page = this.page();
  this.analytics.send(page);
});

// analytics.service.ts
send(page: string) {
  this.http.post('/track', { page });
}
```

```ts
readonly #ping = effect(() => {
  const page = this.page();
  this.analytics.send(page);        // unchanged
});

// analytics.service.ts - six months later
send(page: string) {
  this.http.post('/track', { page });
  this.recent.set([...this.recent(), page]);
}   // reads recent, writes recent - the effect now loops
```

```ts
readonly #ping = effect(() => {
  const page = this.page();
  untracked(() => this.analytics.send(page));
});

// analytics.service.ts - still fine as it is
send(page: string) {
  this.http.post('/track', { page });
  this.recent.set([...this.recent(), page]);
}
```
````

<p style="font-size:28px;color:#C9D4E2;line-height:1.45;margin:24px 0 0;max-width:1660px;">Nothing in the effect changed. Wrap the call, not just the read - you are declaring that this effect reacts to <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">page()</code> and to nothing the callee happens to touch.</p>

<!--
- The untracked case to leave with - the one you can't see coming from your own file
- Left: effect reads the page, calls a service to record it, service does an HTTP post. Nothing reactive. Works for months
- Then somebody adds a recently-viewed list to the service - read, append, write back. Reasonable change, by somebody who's never opened your component
- Your effect now loops, with not one character changed. The call runs inside your effect's reactive context, so the read of recent is a read inside your effect, so recent is your dependency. The next line writes it
- Runs, writes, invalidates itself, runs again. Infinite loop, caused by a file you've never touched
- Notice what the fix is **not** - not a change to the service. Wrap the call
- untracked there is a design statement: this effect reacts to the page, not to whatever its callees happen to touch. Almost always what you meant
- Rule: when an effect calls something you don't own, wrap it. Not because it reads signals today - because it might tomorrow, and you won't be the one adding them
- Two asides: update doesn't track (reads the value directly), so a service using update wouldn't have caused this. And if your **own** effect loops, that's different - read-state-write-state is derived state in disguise, and the fix is a computed
-->

---
layout: content
eyebrow: 'The invisible dependency'
heading: 'Non-reactive reads inside reactive code'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">A <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">computed</code> can only track signals. Read anything else and you have taken a snapshot: correct once, then frozen.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
readonly rows = computed(() =>
  this.items().map((item) => ({
    ...item,
    label: this.i18n.instant(item.key),
  })),
);
```

</div>
<div>

```ts
// PREFER
readonly rows = computed(() =>
  this.items().map((item) => ({
    ...item,
    label: this.i18n.translate(item.key, this.lang()),
  })),
);
```

</div>
</div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:36px 0 0;max-width:1600px;">Same shape: a service getter, storage, the current time, the URL, the DOM. None of them notify.</p>

<!--
- Highest-volume single bug in our whole review history
- Symptom looks like i18n, not signals: change language, pipes update, and the rest stays in the old language - those strings were snapshotted into a computed and frozen since
- Five separate findings were the same instance
- Translation is just where we hit it. The rule underneath: **if the source can't notify you, don't read it in derived state**
- Two ways out: bring it into the graph as a signal, or push the read down to render where it's re-evaluated anyway
- The list isn't exhaustive - imperative getters, storage, current time, current URL, DOM contents. None can tell you they changed
-->

---
layout: section
number: '03'
transition: fade
---
## Timing

<p class="lead" style="margin-top:40px">When your code runs relative to inputs and to render.</p>

<!--
- The chapter people find most surprising: every example is correct read on its own, and wrong because of *when* it runs
- No logic error to find in any of it
- It's about where your code sits in the sequence - relative to inputs being set, and to the DOM being there
-->

---
layout: content
eyebrow: 'Lifecycle'
heading: 'The constructor sees defaults, not inputs'
clicks: 2
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">The parent binds <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">mode</code> to <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">'flat'</code>, then later switches it to <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">'tree'</code>. What does this check see?</p>
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:40px;align-items:start;">
<div>

````md magic-move
```ts
// AVOID
readonly mode = input<'tree' | 'flat'>('tree');

constructor() {
  if (this.mode() === 'tree') {
    this.startObserving();
  }
}
```

```ts
// STILL WRONG
readonly mode = input<'tree' | 'flat'>('tree');

ngOnInit() {
  if (this.mode() === 'tree') {
    this.startObserving();
  }
}
```

```ts
// PREFER
readonly mode = input<'tree' | 'flat'>('tree');

readonly #observe = effect((onCleanup) => {
  if (this.mode() === 'tree') {
    onCleanup(this.startObserving());
  }
});
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 30px;"><div style="font-size:22px;color:#8A97A8;margin-bottom:8px;">When the check runs, and what it sees</div><div class="swap"><div v-click.hide="1"><div style="padding:12px 0;border-bottom:1px solid #1E252F;"><div style="font-size:23px;color:#8A97A8;line-height:1.3;">constructor runs</div><div style="font-size:25px;color:#FF7A6B;line-height:1.3;margin-top:4px;">sees 'tree' - the default</div></div><div style="padding:12px 0;border-bottom:1px solid #1E252F;"><div style="font-size:23px;color:#8A97A8;line-height:1.3;">inputs arrive: 'flat'</div><div style="font-size:25px;color:#5E6B7D;line-height:1.3;margin-top:4px;">nothing runs</div></div><div style="padding:12px 0;border-bottom:1px solid #1E252F;"><div style="font-size:23px;color:#8A97A8;line-height:1.3;">user switches to 'tree'</div><div style="font-size:25px;color:#5E6B7D;line-height:1.3;margin-top:4px;">nothing runs</div></div></div><div v-click="[1,2]"><div style="padding:12px 0;border-bottom:1px solid #1E252F;"><div style="font-size:23px;color:#8A97A8;line-height:1.3;">constructor runs</div><div style="font-size:25px;color:#5E6B7D;line-height:1.3;margin-top:4px;">&ndash;</div></div><div style="padding:12px 0;border-bottom:1px solid #1E252F;"><div style="font-size:23px;color:#8A97A8;line-height:1.3;">inputs arrive: 'flat'</div><div style="font-size:25px;color:#2FD8B4;line-height:1.3;margin-top:4px;">sees 'flat'</div></div><div style="padding:12px 0;border-bottom:1px solid #1E252F;"><div style="font-size:23px;color:#8A97A8;line-height:1.3;">user switches to 'tree'</div><div style="font-size:25px;color:#FF7A6B;line-height:1.3;margin-top:4px;">nothing runs</div></div></div><div v-click="2"><div style="padding:12px 0;border-bottom:1px solid #1E252F;"><div style="font-size:23px;color:#8A97A8;line-height:1.3;">constructor runs</div><div style="font-size:25px;color:#5E6B7D;line-height:1.3;margin-top:4px;">&ndash;</div></div><div style="padding:12px 0;border-bottom:1px solid #1E252F;"><div style="font-size:23px;color:#8A97A8;line-height:1.3;">inputs arrive: 'flat'</div><div style="font-size:25px;color:#2FD8B4;line-height:1.3;margin-top:4px;">sees 'flat'</div></div><div style="padding:12px 0;border-bottom:1px solid #1E252F;"><div style="font-size:23px;color:#8A97A8;line-height:1.3;">user switches to 'tree'</div><div style="font-size:25px;color:#2FD8B4;line-height:1.3;margin-top:4px;">sees 'tree'</div></div></div></div><div class="swap" style="margin-top:20px;"><div v-click.hide="1"><div style="font-size:24px;color:#FF7A6B;line-height:1.4;">Wrong from the start, and never asked again.</div></div><div v-click="[1,2]"><div style="font-size:24px;color:#FF7A6B;line-height:1.4;">Right once, then frozen. The bug just got rarer.</div></div><div v-click="2"><div style="font-size:24px;color:#2FD8B4;line-height:1.4;">Asked again every time the answer can change.</div></div></div></div>
</div>
<p style="font-size:28px;color:#5E6B7D;line-height:1.45;margin:30px 0 0;max-width:1660px;">It hides well, because the default is usually the common case. And an input is not set once - a hook that runs at startup only catches the first value.</p>

<!--
- We've shipped this more than once. Both times a careful reviewer caught it, because nothing looks wrong
- Just ordering: Angular constructs the class, then sets template-bound inputs. At constructor time the signal is still on its default
- So the check sees 'tree', the parent's 'flat' never arrives, and that answer is kept forever
- Second-order damage in this one: the guard existed to skip observers for cheap layouts. It never fired once, so every instance paid for machinery the comment above it promised to skip
- Another: test fixtures seeded from an input in the constructor, rendering empty in every case that mattered
- The obvious fix is ngOnInit, and it's only half right. **It runs once.** Inputs are set by then, so it finally sees 'flat' - but when the user switches to 'tree', nothing runs
- Watch the panel on that step. You've swapped "always saw the default" for "only saw the first real value". **The bug gets rarer, which is worse, not better**
- The effect is asked again every time the answer can change. And it starts something non-reactive, so it cleans up - onCleanup tears down the old observer before the new one starts
- If asked whether lifecycle hooks are going away: no. ngOnInit isn't deprecated, style guide still covers it. What's replaced is hooks that existed to **observe change** - ngOnChanges, view queries, DOM timing. One-time imperative setup with no reactive dependency is still fine
- Takeaway: a decision that depends on an input doesn't belong in the constructor, and probably not in a once-only hook either
-->
---
layout: content
eyebrow: 'Migration'
heading: 'Every ngOnChanges has a signals shape'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">A surviving <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">ngOnChanges</code> is almost always one of four things. Three of them are not lifecycle at all.</p>
<div class="compare" style="grid-template-columns:0.9fr 0.7fr 1fr;margin-bottom:36px;"> <div class="head">WHAT IT DOES</div> <div class="head teal">BECOMES</div> <div class="head">WHY</div> <div class="row-label">Recomputes from one input</div> <div><code style="font-family:'JetBrains Mono',monospace;">computed</code></div> <div>It was never a change handler, it was a formula</div> <div class="row-label">Recomputes from several</div> <div><code style="font-family:'JetBrains Mono',monospace;">computed</code></div> <div>Read them all; the dependency set builds itself</div> <div class="row-label">Resets local state on change</div> <div><code style="font-family:'JetBrains Mono',monospace;">linkedSignal</code></div> <div>Derived, but the user can still overwrite it</div> <div class="row-label last">Drives something non-reactive</div> <div class="last"><code style="font-family:'JetBrains Mono',monospace;">effect</code></div> <div class="last">The only one that is genuinely a side effect</div> </div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:0 0 18px;max-width:1600px;">There is no equivalent for <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">firstChange</code>. If the first run has to differ, that is initialisation - and it belongs somewhere that runs once.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:0;max-width:1600px;"><code style="font-family:'JetBrains Mono',monospace;font-size:26px;">ng generate @angular/core:signals</code> converts inputs, outputs and queries for you. It does not touch <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">ngOnChanges</code>, so this table is the part you do by hand.</p>

<!--
- Worth a slide because of where we found it: ~140 ngOnChanges implementations, and **39 in files that already use input()**
- Not people who haven't caught up - people who converted inputs and couldn't see what ngOnChanges becomes. Fair: the schematic converts inputs, outputs and queries, then leaves it alone
- Nearly every one is one of four:
- From one input → never a change handler, a formula. **computed**
- From several inputs → still **computed**. Read them all, and the dependency set assembles from the reads
- Resets local state on input change → derived, but writable. **linkedSignal**
- Drives something outside the graph → genuinely lifecycle. **effect**
- firstChange is the trip-up. No equivalent, and deliberately: if the first run must differ, that's initialisation, and initialisation belongs somewhere that runs once - not inside something that reruns
-->

---
layout: content
eyebrow: 'Render phases'
heading: 'DOM work belongs to a render phase'
clicks: 1
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">Scroll the pane back to the top whenever the selection changes. When does this run, and is the element there yet?</p>
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:40px;align-items:start;">
<div>

````md magic-move
```ts
// AVOID
readonly pane = viewChild.required('pane');

readonly #scroll = effect(() => {
  this.selectedId();
  this.pane().nativeElement.scrollTop = 0;
});
```

```ts
// PREFER
readonly pane = viewChild.required('pane');

readonly #scroll = afterRenderEffect({
  write: () => {
    this.selectedId();
    this.pane().nativeElement.scrollTop = 0;
  },
});
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 30px;"><div style="font-size:22px;color:#8A97A8;margin-bottom:10px;">One change detection pass</div><div class="swap"><div v-click.hide="1"><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;"><span style="font-family:'JetBrains Mono',monospace;font-size:20px;color:#3A4553;">1</span><span style="font-size:24px;color:#5E6B7D;line-height:1.3;">this component's template updates</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;"><span style="font-family:'JetBrains Mono',monospace;font-size:20px;color:#FF7A6B;">2</span><span style="font-size:24px;color:#FF7A6B;line-height:1.3;">effects attached to this view run</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;"><span style="font-family:'JetBrains Mono',monospace;font-size:20px;color:#3A4553;">3</span><span style="font-size:24px;color:#5E6B7D;line-height:1.3;">&#64;if / &#64;for content is refreshed</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;"><span style="font-family:'JetBrains Mono',monospace;font-size:20px;color:#3A4553;">4</span><span style="font-size:24px;color:#5E6B7D;line-height:1.3;">child components are refreshed</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;"><span style="font-family:'JetBrains Mono',monospace;font-size:20px;color:#3A4553;">5</span><span style="font-size:24px;color:#5E6B7D;line-height:1.3;">render phases run</span></div><div style="font-size:24px;color:#FF7A6B;line-height:1.4;margin-top:14px;border-top:1px solid #1E252F;padding-top:16px;">Your write happens at step 2, so anything created at step 3 or 4 is not there yet.</div></div><div v-click="1"><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;"><span style="font-family:'JetBrains Mono',monospace;font-size:20px;color:#3A4553;">1</span><span style="font-size:24px;color:#5E6B7D;line-height:1.3;">this component's template updates</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;"><span style="font-family:'JetBrains Mono',monospace;font-size:20px;color:#3A4553;">2</span><span style="font-size:24px;color:#5E6B7D;line-height:1.3;">effects attached to this view run</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;"><span style="font-family:'JetBrains Mono',monospace;font-size:20px;color:#3A4553;">3</span><span style="font-size:24px;color:#5E6B7D;line-height:1.3;">&#64;if / &#64;for content is refreshed</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;"><span style="font-family:'JetBrains Mono',monospace;font-size:20px;color:#3A4553;">4</span><span style="font-size:24px;color:#5E6B7D;line-height:1.3;">child components are refreshed</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;"><span style="font-family:'JetBrains Mono',monospace;font-size:20px;color:#2FD8B4;">5</span><span style="font-size:24px;color:#2FD8B4;line-height:1.3;">render phases run</span></div><div style="font-size:24px;color:#2FD8B4;line-height:1.4;margin-top:14px;border-top:1px solid #1E252F;padding-top:16px;">Everything is in the DOM, and the write is coordinated with painting.</div></div></div></div>
</div>
<p style="font-size:28px;color:#5E6B7D;line-height:1.45;margin:30px 0 0;max-width:1660px;">Signal queries are lazy, so reading one is never the problem - the element <em>existing</em> is. Prefer <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">viewChild.required</code>, which throws <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">NG0951</code> rather than handing you nothing.</p>

<!--
- Be precise about why the first version is wrong. I checked the framework source, and the reason isn't the one people give
- The list on the right is one change detection pass, and a component effect runs **inside** it - at step 2
- So the element is only guaranteed present if it's plain in this template. Anything created at step 3 or 4 - behind an if, or inside a child - does not exist yet on the pass where it first appears
- Other half: even when it exists, you're writing mid-change-detection, not at a point scheduled for DOM work. afterRenderEffect gives you that point, and write means write - no reading layout back
- **Correction to something you may have heard, possibly from me:** it is not that view queries haven't resolved. Signal queries are lazy - reading one materialises results there - so viewChild in an effect finds the element if it exists. The failure is existence, not query timing
- viewChild.required gives NG0951 rather than silence. Good reason to prefer required
- Raw requestAnimationFrame is worse than either - outside Angular's render coordination entirely, back to guessing
- The bottom case nobody predicts: effect tracks anchor and content, both settle, you position the overlay - then a deferred block swaps placeholder for real content and your measured height is wrong. No dependency changed, nothing reran, overlay sits in the wrong place. Observe the size of what you measured, or track whatever signals the swap
-->

---
layout: content
eyebrow: 'Render phases'
heading: 'Pick the phase, do not take the default'
---
<div class="compare" style="grid-template-columns:0.5fr 1fr 1fr;margin-bottom:40px;"> <div class="head">PHASE</div> <div class="head teal">FOR</div> <div class="head">CONSTRAINT</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">earlyRead</code></div> <div>Measuring, before anything writes</div> <div>Never write here. Prefer <code style="font-family:'JetBrains Mono',monospace;">read</code> if it can wait</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">write</code></div> <div>Mutating the DOM</div> <div>Never read layout here</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">mixedReadWrite</code></div> <div>The default, and the reason to be explicit</div> <div>Only when unavoidable</div> <div class="row-label last"><code style="font-family:'JetBrains Mono',monospace;">read</code></div> <div class="last">Inspecting after all writes</div> <div class="last">Never write here</div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">A read after a write in the same phase forces layout. The phases run in a fixed order, so splitting them is usually a two-line change.</p>

<!--
- The default is the trap. A plain callback instead of a phase object lands in mixedReadWrite - and it works, which is why nobody revisits it - and costs a forced synchronous layout every run
- Angular's guidance: read and write first. earlyRead only when you must measure before something writes. mixedReadWrite only when the work can't be split at all
- The four always run in that order, so once named, the data flows down the list
- Separate catch, nothing to do with phases: **a measurement is a number, not a subscription**. You get the height at that moment, that's all
- Element resizes with no signal changing - content loads, a font arrives, the window is dragged - and you never hear about it. That's a resize observer, torn down when the component goes
-->

---
layout: content
eyebrow: 'Forced reflow'
heading: 'Read everything, then write everything'
clicks: 1
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">A read after a write forces layout there and then. Interleave them in a loop and you pay on every iteration.</p>
<div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:40px;align-items:start;">
<div>

````md magic-move
```ts
// AVOID
afterNextRender(() => {
  for (const row of this.rows()) {
    const height = row.el.offsetHeight;
    row.el.style.height = `${height + 8}px`;
  }
});
```

```ts
// PREFER
afterNextRender({
  earlyRead: () =>
    this.rows().map((row) => row.el.offsetHeight),
  write: (heights) => {
    this.rows().forEach((row, i) => {
      row.el.style.height = `${heights[i] + 8}px`;
    });
  },
});
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:30px 32px;"><div style="font-size:22px;color:#8A97A8;margin-bottom:16px;">Forced layouts, on a 200 row grid</div><div style="display:flex;align-items:baseline;gap:16px;"><span class="swap" style="justify-items:start;"><span v-click.hide="1" style="font-family:'JetBrains Mono',monospace;font-size:72px;line-height:1;color:#FF7A6B;">200</span><span v-click="1" style="font-family:'JetBrains Mono',monospace;font-size:72px;line-height:1;color:#2FD8B4;">1</span></span></div><div class="swap" style="margin-top:22px;"><div v-click.hide="1" style="font-size:24px;color:#FF7A6B;line-height:1.4;">Every read after a write makes the browser lay out again, there and then.</div><div v-click="1" style="font-size:24px;color:#2FD8B4;line-height:1.4;">One read pass, one write pass. The row count stops mattering.</div></div></div>
</div>
<p style="font-size:27px;color:#5E6B7D;line-height:1.45;margin:28px 0 0;max-width:1660px;">Calls that force layout: <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">offsetHeight</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">clientWidth</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">scrollTop</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">getBoundingClientRect()</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">getComputedStyle()</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">scrollIntoView()</code>, even <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">focus()</code>.</p>

<!--
- The phase table made concrete. The cost isn't the read - you need that number - it's entirely the ordering. Batching is the whole fix, and the panel is the size of it: 200 forced layouts down to one
- Two details, both better than people assume
- **Order is fixed by the framework.** Your four functions go into fixed positions - earlyRead, write, mixed, read - and Angular walks the positions in order. Key order is irrelevant; writing them in firing order is courtesy to the next reader
- **Batching is global, not per callback.** Outer loop is the phase, inner loop is every registered sequence - so every earlyRead in the application runs before any write. You're batching against everything else that registered. That's really why the phases exist
- Value threading: whatever a phase returns goes to the next phase that exists. earlyRead returns the heights, write receives them. Skipped phases pass it through
- Where the code lives decides the stakes. An unbatched read on a settings page costs nothing measurable. The same line per-row is one forced reflow per instance, and a few hundred rows is the difference between smooth and visibly janky
- One more: if a resize observer already handed you the box, use its number. Asking the DOM again costs exactly what the first question did
-->

---
layout: section
number: '04'
transition: fade
---
## Purity and cost

<p class="lead" style="margin-top:40px">Derived state is read often, and at unpredictable times.</p>

<!--
- Chapter four. Everything here is correct the first time it runs
- Which is exactly why it survives review and reaches production - the first render looks right, and the bill arrives later. On the second change, under load, or on the slowest machine in the building
-->

---
layout: content
eyebrow: 'Purity'
heading: 'A computed has no way to clean up after itself'
clicks: 1
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">This builds a worker out of derived state. The config changes twice - how many are running?</p>
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:40px;align-items:start;">
<div>

````md magic-move
```ts
// AVOID
readonly worker = computed(
  () => new Worker(`${this.base()}/${this.name()}`),
);
```

```ts
// PREFER
readonly #url = computed(
  () => `${this.base()}/${this.name()}`,
);

readonly #worker = effect((onCleanup) => {
  const w = new Worker(this.#url());
  onCleanup(() => w.terminate());
});
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 30px;"><div style="font-size:22px;color:#8A97A8;margin-bottom:10px;">After the config changes twice</div><div class="swap"><div v-click.hide="1"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;">Worker #1</span><span style="font-size:23px;color:#FF7A6B;">still running</span></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;">Worker #2</span><span style="font-size:23px;color:#FF7A6B;">still running</span></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#5E6B7D;">Worker #3</span><span style="font-size:23px;color:#5E6B7D;">current</span></div></div><div v-click="1"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#5E6B7D;">Worker #1</span><span style="font-size:23px;color:#5E6B7D;">terminated</span></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#5E6B7D;">Worker #2</span><span style="font-size:23px;color:#5E6B7D;">terminated</span></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;">Worker #3</span><span style="font-size:23px;color:#2FD8B4;">current</span></div></div></div><div class="swap" style="margin-top:20px;"><div v-click.hide="1" style="font-size:24px;color:#FF7A6B;line-height:1.4;">Nothing holds a reference to the first two. They never stop.</div><div v-click="1" style="font-size:24px;color:#2FD8B4;line-height:1.4;">The old one is terminated before the new one starts.</div></div></div>
</div>
<p style="font-size:28px;color:#C9D4E2;line-height:1.45;margin:30px 0 0;max-width:1660px;">A <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">computed</code> takes exactly two options, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">equal</code> and <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">debugName</code> - there is no teardown hook. If it needs disposing, it needs an owner. Sockets, observers, subscriptions, timers, all the same shape.</p>

<!--
- Invisible until the source changes twice. That's why it survives review
- First evaluation builds the worker, fine. Config changes, it builds another - and the first is still running, with nobody holding a reference to stop it. Change it twice and the panel is three workers, two of them abandoned
- There's no hook you could have used: computed takes exactly two options, equal and debugName
- Under load: memory climbing and CPU you can't account for, and you'll look in completely the wrong place
- The author pushed back when we filed it, and the pushback is fair - purity is about mutating state outside the graph, and constructing an object mutates nothing. True as far as it goes
- The answer: the problem isn't the allocation, it's the **lifetime**. A computed has no lifecycle to hang it on. Build plain objects all day; build something that needs stopping and you've made the computed responsible for something it can't do
- Then it splits the jobs: the computed still derives - it builds the url out of two signals - and the effect owns the worker. Being an effect it has onCleanup, so the old worker is terminated before the new one starts, and goes on destroy
- Same for anything with an off switch: sockets, resize observers, subscriptions, intervals. If you'd write code to dispose of it, it isn't derived state
-->

---
layout: content
eyebrow: 'Identity'
heading: 'Reference equality is the notification boundary'
clicks: 2
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 20px;max-width:1660px;">One binding, unchanged throughout. What changes is what it costs the grid.</p>

```html
<app-grid [rows]="visibleRows()" />
```

<div style="margin-top:22px;">

````md magic-move
```ts
// a method: runs on every check of this view
protected visibleRows(): Row[] {
  return this.rows().filter((r) => r.active);
}

// new array every check, so the grid rebuilds
// even when nothing changed
```

```ts
// a computed: runs when rows() changes
protected readonly visibleRows = computed(() =>
  this.rows().filter((r) => r.active),
);

// same array until rows() changes,
// so the grid does nothing in between
```

```ts
// a refetch makes new Row objects with the same ids
protected readonly visibleRows = computed(
  () => this.rows().filter((r) => r.active),
  {
    equal: (a, b) =>
      a.length === b.length &&
      a.every((r, i) => r.id === b[i].id && r.rev === b[i].rev),
  },
);   // equal -> old value kept, grid still does nothing
```
````

</div>

<!--
- Start with the binding - the part that doesn't change, and the part that pays
- A method in a template runs on **every check** of that view. Not when rows change - every check. So a resource resolving elsewhere in the component, a click handler, anything marking the view dirty, and the filter runs and hands the grid a brand new array
- The grid can't know the contents are identical: signals compare with Object.is, and two arrays are never the same object. So it rebuilds. Every check. For a value nobody changed
- A computed improves two things at once - recomputes only when rows changes, and returns the same reference in between, so the grid sees no change and does nothing
- The bit to land: moving this to a computed **isn't tidying up. The caching is the entire feature**
- Third step is a real case, not a flourish. Refetch returns the same data as new objects → new identity → computed reruns → grid rebuilds with nothing visibly changed
- A custom equal says what counts as different. Here, the ids. Comparator returns true → old value restored, version not bumped, nothing downstream notified
- The comparator has to cover everything downstream renders. Ids alone would be wrong here - edit a row's name, the id is unchanged, equal returns true, and the grid keeps showing the old text. That is a stale bug you wrote on purpose, so compare a revision field too
- And it must be cheaper than the work it prevents. Ids and a rev to avoid rebuilding a grid is a good trade; deep-comparing a thousand objects to avoid a cheap map isn't
- And it's rare: **16 uses against 8,000 computeds**. Reach for it after measuring
-->

---
layout: content
eyebrow: 'Templates'
heading: 'Templates call. Computeds cache.'
clicks: 1
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 22px;max-width:1660px;">The work does not go away. It moves out of the view and into something that caches it.</p>

````md magic-move
```ts
template: `
  @for (row of rows(); track row.id) {
    <a [href]="buildUrl(row)">
      {{ formatNextRun(row.nextRunAt) }}
    </a>
  }
`,

buildUrl(row: Row) { return `/runs/${row.id}`; }
formatNextRun(at: string) { return this.fmt.format(at); }

// two calls per row, on every check of this view
```

```ts
template: `
  @for (row of rowViews(); track row.id) {
    <a [href]="row.url">{{ row.nextRun }}</a>
  }
`,

buildUrl(row: Row) { return `/runs/${row.id}`; }
formatNextRun(at: string) { return this.fmt.format(at); }

readonly rowViews = computed(() =>
  this.rows().map((row) => ({
    id: row.id, url: this.buildUrl(row),
    nextRun: this.formatNextRun(row.nextRunAt),
  })),
);   // two calls per row, per change to rows()
```
````

<!--
- The word to notice is "unrelated"
- A method call in a binding runs on every check. So a resource resolving in a completely different corner of this component marks the view dirty, and your date formatting runs again for every visible row
- The rows didn't ask for that work. Something else did, and the rows paid for it
- This isn't a redesign. Both calls are still there - buildUrl still runs, formatNextRun still runs, once per row
- All that changed is **where they live**. Template = every check. Computed = when rows changes, and not otherwise
- Hence the cheapest fix on the list: move two lines, bind to fields instead of calling functions
- The shape it leaves is worth naming - a **view model**. One computed turning domain objects into exactly what the template needs, so the template only reads properties. Easier to read, as a bonus
- Related, smaller scale: @let. Same three-level dereference in six bindings, name it once. Also how you subscribe to an async pipe once rather than once per usage, since every pipe instance is its own subscription
-->

---
layout: section
number: '05'
transition: fade
---
## Async state

<p class="lead" style="margin-top:40px">Loading, empty, error, and the difference between them.</p>

<!--
- Chapter five. Where the damage becomes user-visible, and the part of the research least comfortable to read back
- Every finding here shipped, or came within a review of shipping, something that looked completely fine on screen and was lying to whoever was looking at it
-->

---
layout: content
eyebrow: 'Resources'
heading: 'Signal-driven fetches belong in a resource'
clicks: 1
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 24px;max-width:1660px;">Fetch a team's members whenever the team changes. This is what we write by hand.</p>
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:40px;align-items:start;">
<div>

````md magic-move
```ts
// AVOID
readonly users = signal<User[]>([]);
readonly loading = signal(false);

readonly #fetch = effect(async () => {
  this.loading.set(true);
  this.users.set(await api.users(this.teamId()));
  this.loading.set(false);
});
```

```ts
// PREFER
readonly users = httpResource<User[]>(
  () => `/api/teams/${this.teamId()}/users`,
);
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 30px;"><div style="font-size:22px;color:#8A97A8;margin-bottom:10px;"><span class="swap"><span v-click.hide="1">What you are maintaining</span><span v-click="1">What you get for free</span></span></div><div class="swap"><div v-click.hide="1"><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#FF7A6B;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">a <code style="font-family:'JetBrains Mono',monospace;font-size:22px;">loading</code> flag, set on both sides</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#FF7A6B;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">nothing cancels a superseded request</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#FF7A6B;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">two responses can land out of order</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#FF7A6B;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">no error state anywhere</span></div></div><div v-click="1"><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#2FD8B4;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;"><code style="font-family:'JetBrains Mono',monospace;font-size:22px;">value</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:22px;">isLoading</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:22px;">error</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:22px;">status</code></span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#2FD8B4;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;"><code style="font-family:'JetBrains Mono',monospace;font-size:22px;">reload()</code> when you need it</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#2FD8B4;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">superseded requests cancelled</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#2FD8B4;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">no race between two responses</span></div></div></div></div>
</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin:30px 0 0;font-size:25px;line-height:1.4;color:#C9D4E2;"> <div style="border-top:2px solid #2FD8B4;padding-top:14px;"><code style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;">httpResource</code><br>an HTTP GET</div> <div style="border-top:2px solid #4A5568;padding-top:14px;"><code style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8A97A8;">rxResource</code><br>an observable pipeline you already have</div> <div style="border-top:2px solid #4A5568;padding-top:14px;"><code style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8A97A8;">resource</code><br>a promise, or a stream you own</div> </div>

<!--
- The first version isn't a strawman - it's what we all wrote for years, and plenty are still in the codebase
- It manages to be three separate mistakes at once: an effect that writes signals, an async effect so the teamId read after the await isn't tracked, and two pieces of state kept in step by hand
- Then it collapses to one expression: a function returning the request, reading whatever signals it needs. That's the whole wiring. The team id changing is the trigger - no subscription, no cancellation code
- The panel is the point - every line of it is something the hand-written version doesn't do and would be tedious to add. value, isLoading, error, status and reload as signals. Superseded requests cancelled, so three quick team clicks don't leave you with whichever lands last. And no race between two in-flight responses - the bug you'd only find in production on a slow connection
- Watch inside that function: it reruns on the signals it reads, so key it on the few values the request is made of. A whole state object makes every unrelated field a refetch
- Choosing, and you'll see all three in our code: plain GET → **httpResource**, never touch HttpClient. Existing observable pipeline → **rxResource**, hand it the stream. Anything else, a promise or something you drive → **resource** with a loader - the general form, and it takes any promise
- **Reads only.** Nothing stops you setting POST, but a resource re-issues on every parameter change and every reload, and "send the delete again" isn't something you want on a parameter change. A write is an action with a moment - it stays on the HTTP client
-->

---
layout: content
eyebrow: 'Interop'
heading: 'An unguarded toSignal is a state you did not model'
clicks: 2
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 30px;max-width:1660px;">Nearly every <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">toSignal</code> in our codebase takes the first of these. Three options, and the first one is a state you have to render.</p>

````md magic-move
```ts
readonly user = toSignal(this.user$);

// Signal<User | undefined>
// undefined until the first emission - and it renders like "no user"
```

```ts
readonly user = toSignal(this.user$, { requireSync: true });

// Signal<User>
// no undefined at all - NG0601 at creation if it does not emit
```

```ts
readonly user = toSignal(this.user$, { initialValue: GUEST });

// Signal<User>
// starts at a value you chose, rather than one you inherited
```
````

<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:30px 0 0;max-width:1660px;">Keeping <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">undefined</code> is a fine answer too, as long as you branch on it. Picking none of the three is the bug.</p>
<p style="font-size:28px;color:#5E6B7D;line-height:1.45;margin:20px 0 0;max-width:1660px;">And <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">toObservable</code> is an <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">effect</code> feeding a <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">ReplaySubject</code> - so a signal, out to an observable and back is an effect writing a signal, with extra steps.</p>

<!--
- Biggest number in the whole research, and we haven't touched it: close to **1,500 toSignal calls**, and around **1,370 look like the first version** - no initial value, no requireSync
- Every one is typed T-or-undefined, and genuinely undefined for at least one tick
- In a template: undefined → falsy branch → "not signed in", an empty list, or a dash, before the real value arrives
- Usually nobody notices, because the gap is a frame. But this is the silent failure - "we don't know yet" rendered as "there is nothing". When the source is slower than a frame it stops being invisible
- **requireSync**, if the observable emits on subscribe - BehaviorSubject, ReplaySubject, store selector - gives a plain Signal<User>, no undefined in the type
- Stronger than people expect: not a hint checked later. toSignal subscribes, and throws NG0601 right there if nothing arrived synchronously. Wrong about your source and you find out on first render in dev, not in production six months later
- **Initial value**, for sources that genuinely can't emit immediately. The starting state is something you chose, not something inherited from the type system. A real User - guest, anonymous - keeps the type Signal<User> and the undefined problem leaves the template
- Fourth answer, not on the slide: keep undefined because it means something - not loaded yet, show a skeleton. Fine. **The bug is picking none of the four and hoping**
- Last line, separate point people do without thinking: toObservable is implemented as an effect writing into a ReplaySubject - the actual implementation, not an analogy. Signal → observable → pipe → back reintroduces every chapter-one problem and pays for two conversions. Stay in signals: a computed, or a resource if it's async
-->

---
layout: content
eyebrow: 'States'
heading: 'Four states, not two'
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">The <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">users</code> resource below fetches a team's members. Six statuses, four things to render - and the order you branch in is most of the job.</p>
<div style="display:grid;grid-template-columns:0.82fr 1.18fr;gap:44px;align-items:start;">
<div>
<div class="compare" style="grid-template-columns:0.85fr 1fr;font-size:26px;"> <div class="head">STATUS</div> <div class="head teal">MEANS</div> <div class="row-label">loading<br>reloading</div> <div>Not known yet.<br>Reloading still has the old value</div> <div class="row-label">resolved<br>local</div> <div>Known, and may be empty</div> <div class="row-label">error</div> <div>Unknown, and not coming</div> <div class="row-label last">idle</div> <div class="last">Nothing has been asked for yet</div> </div>
</div>
<div>

```html
@if (users.error()) {
  <app-error (retry)="users.reload()" />
} @else if (users.hasValue()) {
  <app-user-list [users]="users.value()" />
} @else if (users.isLoading()) {
  <app-skeleton />
} @else {
  <p>Pick a team to see its members.</p>
}
```

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:28px 0 0;max-width:1660px;">Error first, so a failed reload never renders as stale data. Then <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">hasValue()</code>, so a reload keeps what is on screen instead of flashing a skeleton. Collapse any two of these and you get a bug testers cannot reproduce.</p>

<!--
- A resource fetching a team's members. This is the part people get wrong - not creating it, rendering it
- Six statuses, four things you put on screen. loading and reloading both mean waiting - reloading still holds the previous value, which matters in a second. resolved and local both mean you have a value; local just means somebody called set. error means it isn't coming
- idle is the forgotten one: params returned undefined. Not the same as loading - nothing is in flight and nothing is coming
- **The order of that template is most of the job**
- Error first. Check hasValue first and a failed reload renders the old data with no indication - stale rows, and the user has no idea. Error first means a failure always wins
- hasValue before isLoading, also deliberate. During a reload you're both. isLoading first blows the list away and flashes a skeleton on every refresh - the flicker everybody complains about. hasValue first keeps the old rows while the new ones fetch
- Then isLoading, which now means a genuine first load with nothing to show
- Final else is idle - nothing asked for yet, so prompt rather than pretending to load
- Detail: hasValue is a type guard, so value() is properly typed inside the branch
- Collapse any two and you get "it showed nothing". Unreproducible, because it depends which of the four you were in
-->

---
layout: content
eyebrow: 'The silent failure'
heading: 'A failed request that renders as no data'
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">Same resource, one line different. The fix is deleting something.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
readonly users = resource({
  params: this.teamId,
  loader: ({ params }) =>
    loadUsers(params).catch(() => []),
});

// error() is never true, so the
// template shows the empty state
```

</div>
<div>

```ts
// PREFER
readonly users = resource({
  params: this.teamId,
  loader: ({ params }) =>
    loadUsers(params),
});

// error() is true, so the template
// shows the error and a retry
```

</div>
</div>
<p style="font-size:28px;color:#C9D4E2;line-height:1.45;margin:26px 0 0;max-width:1660px;">The same bug wears four costumes: a <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">catch</code> to an empty array, a <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">defaultValue</code> so the template need not branch, no-value treated as no-data, and a ternary returning <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">''</code> so a link quietly vanishes.</p>
<p style="font-size:28px;color:#5E6B7D;line-height:1.45;margin:18px 0 0;max-width:1660px;">All four exist because reading <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">value()</code> after a failure <em>throws</em> - and in a <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">computed</code>, that poisons everything downstream. Guard with <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">hasValue()</code> instead of swallowing.</p>
<p style="font-size:28px;color:#5E6B7D;line-height:1.45;margin:18px 0 0;max-width:1660px;">With two resources behind one screen, the aggregate <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">error</code> and the retry both have to name both - and a resource lives only as long as its injector.</p>

<!--
- Filed five separate times, and every one reads as defensive good practice in a diff. Somebody added a catch so the page wouldn't blow up. Reasonable instinct
- What it does: the promise no longer rejects → the resource never reaches error → error() is never true → last slide's template takes hasValue and renders an empty list. **The request failed and the user is told the team has no members**
- I like this fix because the fix is deleting code. Let the loader reject. The resource has an error state and you already wrote the branch
- Four costumes, worth knowing by sight: catch to an empty array (this one), a default value so the template needn't branch, no-value quietly treated as no-data, and a ternary returning an empty string - the meanest, because the link doesn't break, it just isn't there, and nobody files a bug about a button they never saw
- Be fair about the pressure behind all four: reading value() in the error state throws. Inside a computed it isn't absorbed - the computed stores and rethrows to every consumer, so one failed request takes out everything downstream. People hit that and reach for a fallback
- The answer is **guard, don't swallow**. hasValue() is reactive, already false in the error state, and a type guard. Ask the question instead of suppressing the answer
- Line to leave with: an empty list, a zero, a dash, a missing button - all valid renderings of real data. None can carry "this failed"
-->

---
layout: section
number: '06'
transition: fade
---
## Boundaries

<p class="lead" style="margin-top:40px">What a signal exposes, and to whom.</p>

<!--
- Chapter six, the cheap one. Everything in it takes about a minute to fix
- Which is the problem: none of it is hard, nobody argues in review, and it's back in the next pull request
- So take these three as habits you build, not things you catch. By the time review catches them you've already written them, and writing them is the part to change
- It's about what a signal exposes, and who to
-->

---
layout: content
eyebrow: 'Visibility'
heading: 'Template-only state is not public API'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:40px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;margin-bottom:18px;">protected readonly</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Anything the template reads and nothing outside needs: derived state, signal queries, view helpers.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;margin-bottom:18px;">#private</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Anything neither the template nor a consumer touches. Enforced at runtime, not just by the compiler.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">A signal anything can reach is an invitation, and your invariant now has two owners. <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">protected</code> closes that door; <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">readonly</code> only stops reassignment.</p>

<!--
- Angular templates can read protected members. Not incidental - it's why protected is the right default. Your template isn't an external consumer, so you don't owe it a public API
- What I find in review isn't deliberate exposure. It's a signal that ended up public for no reason - nothing outside needs it, nothing outside reads it, that's just how the line got typed
- Narrowing costs nothing while the change is open. After merge it's a breaking change to somebody, and now it's a conversation instead of a keystroke. **Do it while it's free**
- Second card is our rule, not Angular's: for genuinely internal state use a #private field - enforced at runtime, not just by the compiler, and nothing can reach past it
- Last line: if the only reason to widen visibility is that a test wants to see something, the test is asserting on the wrong thing. Bracket-indexing a protected signal is a smell, not an access strategy
-->

---
layout: content
eyebrow: 'Immutability'
heading: 'Signals do not make your data immutable'
clicks: 1
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">A consumer pops the array it was handed. Every later reader sees it instantly, and the graph never hears about it.</p>
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:40px;align-items:start;">
<div>

````md magic-move
```ts
// AVOID
readonly items: Signal<Item[]>;

// compiles fine
service.items().pop();
```

```ts
// PREFER
readonly items: Signal<readonly Item[]>;

// will not compile
service.items().pop();
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 30px;"><div style="font-size:22px;color:#8A97A8;margin-bottom:8px;">After a consumer calls <code style="font-family:'JetBrains Mono',monospace;font-size:21px;">pop()</code></div><div class="swap"><div v-click.hide="1"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-size:24px;color:#8A97A8;">count() in the header</span><span style="font-family:'JetBrains Mono',monospace;font-size:34px;color:#FF7A6B;line-height:1;">4</span></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-size:24px;color:#8A97A8;">rows in the table</span><span style="font-family:'JetBrains Mono',monospace;font-size:34px;color:#FF7A6B;line-height:1;">3</span></div><div style="font-size:24px;color:#FF7A6B;line-height:1.4;margin-top:18px;">The computed never reran, so it is still handing out the length it cached.</div></div><div v-click="1"><div style="font-family:'JetBrains Mono',monospace;font-size:23px;color:#2FD8B4;line-height:1.45;padding:13px 0 16px;border-bottom:1px solid #1E252F;">Property &#39;pop&#39; does not exist on type<br>&#39;readonly Item[]&#39;.</div><div style="font-size:24px;color:#2FD8B4;line-height:1.4;margin-top:18px;">The edit cannot be written in the first place, so the two can never disagree.</div></div></div></div>
</div>
<p style="font-size:28px;color:#5E6B7D;line-height:1.45;margin:30px 0 0;max-width:1660px;">The signal protects the reference, not the contents. Nothing reruns, because from the graph's point of view nothing changed.</p>

<!--
- Everything else in this talk is stale: something changed and nobody heard. This is the opposite, which makes it disorienting the first time
- A consumer pops the array it was handed. That array is the one inside your signal - the signal handed out a reference, not a copy
- The moment they pop it, everyone reading it sees the edit immediately. Not late - instant
- And the graph hears nothing at all, because the reference never changed. Nothing reruns, nothing recomputes, nothing looks wrong
- Look at the panel. The header is a computed over the same array, and it is still handing out the four it cached, while the table renders three rows. UI and state genuinely disagree, and there is no changed reference anywhere for anyone to notice
- You find out when a user tells you the number at the top doesn't match what's underneath it
- The fix is a type. readonly on the array means pop isn't there to call - a compile error, at the point somebody writes it, which is exactly where you want it
- Worth saying it costs nothing at runtime. This is entirely a compile-time guarantee, and the signal is unchanged
- If asked about editing a field on one of the items: yes, readonly on the array doesn't stop that, and you'd need the elements readonly too. Start with the array, because that's where this actually bites
-->
---
layout: section
number: '07'
transition: fade
---
## Signal Forms

<p class="lead" style="margin-top:40px">The same ideas, applied to the one API built entirely on them.</p>

<!--
- Last chapter, and it's shorter than it wants to be. Signal Forms deserves its own session and will get one
- It's here because it's the one API in Angular built entirely on the ideas we have been through
- So keep recognising things: derived state instead of synchronisation, rules that declare their dependencies instead of code keeping things in step, one source of truth instead of two
-->

---
layout: content
eyebrow: 'Introduction'
heading: 'A third forms API, built on signals'
---
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0 0 52px;max-width:1550px;">Stable in v22. You keep your data in a signal, pass it to <code style="font-family:'JetBrains Mono',monospace;font-size:29px;color:#2FD8B4;">form()</code>, and get a form back - no control tree to keep in sync.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Your own data is the form's data, and everything the form knows about a field is a signal.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS NOT</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A migration. Reactive forms still work, and so do the controls we have already built - but new forms should use signal forms.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT CHANGES</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Validators stop being things you add and remove. They become rules that know when they apply.</p> </div> </div>

<!--
- Orientation before the API: stable in v22. Public API, semver-protected, still growing
- What it is **not** is a migration. Reactive Forms are still supported and fine for plenty of screens, and your existing custom controls keep working - how, in a few minutes
- The difference is where the data lives. Your data is the form's data: keep it in a signal, hand it to form(), and everything the form knows about a field - value, validity, touched - is itself a signal
- No control tree to build, none to keep in sync
- And because it's signals underneath, validators stop being static objects you add and remove by hand. They become rules that know when they apply and what they depend on
-->

---
layout: content
eyebrow: 'What is a signal form?'
heading: 'Three pieces'
clicks: 4
---
<div style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:52px;align-items:start;"> <div style="display:flex;flex-direction:column;gap:24px;"> <div style="display:flex;gap:24px;align-items:stretch;" v-click="1"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;padding-top:34px;width:28px;">1</div> <div style="flex:1;background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.6;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">const</span> <span>loginModel</span> = <span style="color:#7CC4FF;">signal</span>({ email: <span style="color:#2FD8B4;">''</span>, password: <span style="color:#2FD8B4;">''</span> });</div> </div> </div> <div style="display:flex;gap:24px;align-items:stretch;" v-click="2"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;padding-top:34px;width:28px;">2</div> <div style="flex:1;background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.6;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">const</span> <span>loginForm</span> = <span style="color:#7CC4FF;">form</span>(loginModel);</div> </div> </div> <div style="display:flex;gap:24px;align-items:stretch;" v-click="3"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;padding-top:34px;width:28px;">3</div> <div style="flex:1;background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.6;color:#C9D4E2;"> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.email"</span> /&gt;</div> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.password"</span> /&gt;</div> </div> </div> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px;display:flex;flex-direction:column;gap:22px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;">RUNNING</div> <div> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Email</div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;white-space:nowrap;">sam.taylor@example.com<span style="color:#2FD8B4;">|</span></div> </div> <div> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Password</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">••••••••</div> </div> <div style="border-top:1px solid #4A5568;padding-top:20px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.55;color:#5E6B7D;"> <div>loginModel().email</div> <div style="color:#2FD8B4;">"sam.taylor@example.com"</div> </div> </div> </div>
<div style="margin-top:48px;border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:36px;font-weight:500;color:#E8ECF2;" v-click="4">The model is the source of truth for the editable data.</div>

<!--
- Three pieces, and that's genuinely all of it
- Data in an ordinary writable signal. Nothing special - the same signal call you'd write anywhere
- Pass it to form, get back a field tree shaped exactly like your data
- Bind a control with formField, pointing at the field: loginForm.email, loginForm.password
- The part to hold on to: **loginModel isn't a DTO waiting to be filled in at the end. It is the form's editable data.** Type in that email box and loginModel updates, because the form keeps no copy of anything
-->

---
layout: content
eyebrow: 'Side by side'
heading: 'The same form in both APIs'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 40px;max-width:1400px;">Two ways to describe the same two fields: build a control tree and bind out of it, or hold the data and bind straight at it.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:20px 36px;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:22px;">REACTIVE FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#8A97A8;"> <div><span style="color:#8577CF;">readonly</span> <span>loginForm</span> = <span style="color:#8577CF;">new</span> FormGroup({</div> <div style="padding-left:1.2em;">email: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>),</div> <div style="padding-left:1.2em;">password: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>),</div> <div>});</div> </div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:22px;">SIGNAL FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">readonly</span> <span>loginModel</span> = <span style="color:#7CC4FF;">signal</span>({</div> <div style="padding-left:1.2em;">email: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:1.2em;">password: <span style="color:#2FD8B4;">''</span>,</div> <div>});</div> <div style="height:0.85em;"></div> <div><span style="color:#8B7CF6;">readonly</span> <span>loginForm</span> = <span style="color:#7CC4FF;">form</span>(<span style="color:#8B7CF6;">this</span>.loginModel);</div> </div> </div> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:28px 36px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#8A97A8;"> <div>&lt;input [formControl]=<span style="color:#3FBFA2;">"loginForm.controls.email"</span> /&gt;</div> <div>&lt;input [formControl]=<span style="color:#3FBFA2;">"loginForm.controls.password"</span> /&gt;</div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:28px 36px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#C9D4E2;"> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.email"</span> /&gt;</div> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.password"</span> /&gt;</div> </div> </div>
<p style="font-size:30px;color:#5E6B7D;line-height:1.4;margin:40px 0 0;">And for a form this simple, there really isn't much wrong with this.</p>

<!--
- Next to something familiar. Left, Reactive Forms: construct a separate control tree - a FormGroup of FormControls - then bind controls out of it
- Right: a signal holding plain data, a call to form, bindings pointing straight at the fields
- Deliberately nothing marked red - not trying to make Reactive Forms look bad. At this size the difference is architectural rather than dramatic, and for a form this simple there honestly isn't much wrong with the left
- It starts to matter when data has to move into and out of the form, or when one field's behaviour depends on another
- Which is to say: if all our forms were two inputs with no real behaviour, this workshop would be very short
-->

---
layout: content
eyebrow: 'Validation'
heading: 'Rules live in the schema, errors live on the field'
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 24px;max-width:1660px;">Every rule carries its own message. Angular ships no default copy, so a single loop can render any field.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
readonly signupForm = form(this.signup, (p) => {
  required(p.email, { message: 'Email is required' });
  email(p.email, { message: 'Enter a valid email' });

  minLength(p.password, 8, {
    message: 'At least 8 characters',
  });
});
```

</div>
<div>

```html
<input [formField]="signupForm.email" />

@for (e of signupForm.email().errors(); track e) {
  <p class="error">{{ e.message }}</p>
}
```

</div>
</div>
<div style="display:grid;grid-template-columns:auto 1fr;gap:30px;align-items:start;margin-top:28px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:23px;letter-spacing:0.12em;color:#2FD8B4;white-space:nowrap;padding-top:4px;">BUILT&nbsp;IN</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#8A97A8;">required&nbsp; email&nbsp; min&nbsp; max&nbsp; minDate&nbsp; maxDate&nbsp; minLength&nbsp; maxLength&nbsp; pattern<div style="font-size:24px;font-family:'Barlow',sans-serif;color:#C9D4E2;margin-top:12px;line-height:1.4;">Anything else is <span style="color:#2FD8B4;">validate</span>, returning <span style="color:#2FD8B4;">{ kind, message }</span> or <span style="color:#2FD8B4;">null</span>. Async goes to <span style="color:#2FD8B4;">validateHttp</span>.</div> </div> </div>

<!--
- Two halves, deliberately separate
- **Rules go in the schema** - the second argument to form. Not attaching validators to controls one at a time; describing in one place what has to be true about this data. required, email, minLength, each taking a path and options
- **Errors come out on the field**, as a signal. The template asks the field what's wrong and renders it
- Pause on the message: Angular ships no default copy. No message on a rule, and the error has a kind and nothing to display
- Sounds like a chore, and it's exactly what makes the template on the right possible - every rule carries its own message, so one loop renders every field. No branching on error kind, no template that knows which rules were applied
- Against what we write today: an if per error type per field, copy living in the template, rewritten every time the field is reused
- Built-ins along the bottom. Anything else is validate - takes the field context, returns an error with a kind and message, or null
- Leaving the browser (username availability) is validateHttp, which handles debouncing and stale responses and exposes pending while it runs
- Ordering: async validation for a field starts only once that field's synchronous rules pass. No point asking the server about an email that isn't valid yet
-->

---
layout: content
eyebrow: 'Validation · conditional required'
heading: 'Describe the rule, not the response'
clicks: 2
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 24px;max-width:1660px;">Email is required, but only when notifications are on.</p>
<div style="display:grid;grid-template-columns:1.3fr 0.7fr;gap:44px;align-items:start;">
<div>

````md magic-move
```ts
const { notify, email } = this.prefsForm.controls;

notify.valueChanges
  .pipe(startWith(notify.value), takeUntilDestroyed())
  .subscribe((shouldNotify) => {
    if (shouldNotify) {
      email.addValidators(Validators.required);
    } else {
      email.removeValidators(Validators.required);
    }
    email.updateValueAndValidity();
  });
```

```ts
readonly prefsForm = form(this.prefs, (p) => {
  required(p.email, {
    when: ({ valueOf }) => valueOf(p.notify),
  });
});
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 36px;"> <div style="display:flex;align-items:center;gap:18px;margin-bottom:34px;"> <div style="width:30px;height:30px;border:2px solid #2FD8B4;border-radius:6px;background:#2FD8B4;display:flex;align-items:center;justify-content:center;color:#0A0D12;font-size:24px;font-weight:700;">✓</div> <div style="font-size:28px;color:#E8ECF2;">Notify me by email</div> </div> <div style="font-size:24px;color:#8A97A8;margin-bottom:12px;">Email</div> <div style="background:#0A0D12;border:1px solid #FF7A6B;border-radius:8px;padding:0 20px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;"></div> <div style="font-size:24px;color:#FF7A6B;margin-top:14px;">Email is required</div> </div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:30px;" v-click="2"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:26px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:14px;">REACTIVE FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#8A97A8;">listen → inspect → mutate → recalculate</div> </div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:26px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:14px;">SIGNAL FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#E8ECF2;">describe the relationship</div> </div> </div>

<!--
- The requirement, and you've all built this: checkbox on, email required, field showing its error. Turn it off and the requirement disappears
- Start with how we write it today. Subscribe to notify's valueChanges. startWith so it runs for the initial value. takeUntilDestroyed so it doesn't outlive the component. Then per change: inspect the value, add or remove a validator, tell email to recalculate
- Four steps, every one of them bookkeeping by hand
- Now watch: **email is required, when notify is true.** That's the whole thing
- No subscription. No adding a validator, no removing one, no telling email to recalculate. Describe the relationship once, and the framework works out when it applies and when it stops
- And the form on the right didn't change. Same behaviour, same error, same checkbox - only how much we had to say
- Same move as computed: stop orchestrating the response, describe the rule
-->

---
layout: content
eyebrow: 'Custom controls'
heading: 'One interface, one signal, no ControlValueAccessor'
clicks: 1
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 22px;max-width:1660px;">Same control, both ways. The <code style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;">[formField]</code> directive finds the interface and binds the field's value to your model.</p>

````md magic-move
```ts
@Component({
  template: `
    <input [value]="value"
           (input)="onChange($any($event.target).value)"
           (blur)="onTouched()" />
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomInput), multi: true }],
})
export class CustomInput implements ControlValueAccessor {
  value = '';
  private onChange = (v: string) => {};
  onTouched = () => {};
  writeValue(v: string) { this.value = v; }
  registerOnChange(fn: (v: string) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
}
```

```ts
@Component({
  template: `
    <input [value]="value()"
           (input)="value.set($any($event.target).value)"
           (blur)="touch.emit()" />
  `,
})
export class CustomInput implements FormValueControl<string> {
  readonly value = model('');
  readonly touch = output<void>();
}
```
````

<div style="display:grid;grid-template-columns:auto 1fr;gap:32px;align-items:start;margin-top:24px;" v-click="1"> <div style="font-family:'JetBrains Mono',monospace;font-size:23px;letter-spacing:0.12em;color:#8B7CF6;white-space:nowrap;padding-top:4px;">OPTIONAL<br>STATE INPUTS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#8A97A8;">errors&nbsp; invalid&nbsp; pending&nbsp; disabled&nbsp; disabledReasons&nbsp; readonly&nbsp; hidden&nbsp; touched&nbsp; dirty&nbsp; name&nbsp; required&nbsp; min&nbsp; max&nbsp; minLength&nbsp; maxLength&nbsp; pattern<div style="font-size:24px;font-family:'Barlow',sans-serif;color:#C9D4E2;margin-top:12px;line-height:1.4;">Declare only what the control renders. There is no <span style="color:#FF7A6B;">valid</span> - declare one and it never updates.</div> </div> </div>

<style>
.shiki-magic-move-container, .shiki-magic-move-container code { font-size: 24px !important; line-height: 1.62 !important; }
</style>

<!--
- The same control written twice, and the point is the volume
- Left, ControlValueAccessor: a multi-provider with a forwardRef pointing at the class you're mid-declaration of. A private copy of the value, because the control owns its own state. Two callbacks you store to call later. Four interface methods - write, change, touch, disable - none of which describe anything about your control
- That's the tax we've all been paying, and none of it is about being an input
- Right: the whole contract is one property. Implement FormValueControl, declare a value model signal. formField detects the interface and two-way binds. No provider, no forwardRef, no callbacks. Add a touch output for blur tracking and the field marks itself touched
- The strip along the bottom is all optional - errors, invalid, pending, disabled, readonly, and constraints like required and maxLength. Declare what your control renders, ignore the rest
- Two rules: a FormValueControl must not have a checked property, and a checkbox-style control implements FormCheckboxControl with checked instead. Never both - the types enforce it
- One trap to see coming: **there is no valid input.** TypeScript will let you declare one, because implementing an interface doesn't stop you adding members, and it will sit there forever never updating. Use invalid
- Design point to finish on: don't put validation logic in the control. The schema validates, the control displays the result
-->

---
layout: content
eyebrow: 'Guidance'
heading: 'What we do about it'
---
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:20px;">NEW FORMS</div> <p style="font-size:29px;line-height:1.45;margin:0;color:#C9D4E2;">Signal Forms. It is stable, it is semver-protected, and it is where the framework is going.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">EXISTING FORMS</div> <p style="font-size:29px;line-height:1.45;margin:0;color:#C9D4E2;">Leave them. Reactive Forms are supported and fine. Migrate when the form is being changed anyway, not as a project.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">EXISTING CONTROLS</div> <p style="font-size:29px;line-height:1.45;margin:0;color:#C9D4E2;">They keep working. <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">[formField]</code> binds any component that provides a <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">ControlValueAccessor</code>. Beyond that, <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">compatForm</code> and <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">SignalFormControl</code> bridge each direction.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:48px 0 0;max-width:1600px;">Be careful with examples online. The API was renamed repeatedly before v22, so a lot of published material uses names that no longer exist.</p>

<!--
- Answer the question half the room is holding: **this is not a migration mandate**
- New forms use Signal Forms - stable, semver-protected, where the framework is heading
- Existing forms stay exactly where they are. Reactive Forms are supported and fine. Migrate a form when you're already in there changing it, not as a project with its own ticket and its own risk
- Existing controls keep working: formField binds to a component providing a ControlValueAccessor - the backwards-compatibility path, not the preferred one
- Bridges both ways where you need more: compatForm lets a signal form hold real reactive controls in its model, and SignalFormControl is an AbstractControl you can drop into an existing FormGroup
- Practical warning to finish: be careful what you find online. The API was renamed repeatedly while experimental, so pre-v22 material uses names that don't exist any more. If an import isn't there, check the version before assuming you broke something. The churn was real, and it's over
-->

---
layout: section
number: '08'
transition: fade
---
## In review

<p class="lead" style="margin-top:40px">The reactivity chapters, as questions you can ask about a diff.</p>

<!--
- If you photograph one slide today, make it the symptom-to-fix table coming up
- Everything so far has been the explanation - why these happen, what's underneath
- This is the part you can take to a code review tomorrow morning and actually use
-->

---
layout: content
eyebrow: 'Checklist'
heading: 'Symptom, and what to reach for'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:start;"> <div><div class="compare" style="grid-template-columns:1fr 1.1fr;font-size:24px;"> <div class="head">IF YOU SEE</div> <div class="head teal">REACH FOR</div> <div class="row-label">An effect that writes a signal</div> <div class="new"><code style="font-family:'JetBrains Mono',monospace;">computed</code>, or <code style="font-family:'JetBrains Mono',monospace;">linkedSignal</code></div> <div class="row-label">An effect that writes another component's signal</div> <div class="new">An input, or an explicit method on the owner</div> <div class="row-label">An <code style="font-family:'JetBrains Mono',monospace;">await</code> inside an effect</div> <div class="new">A resource keyed on a computed of the parameters</div> <div class="row-label">A non-signal read inside derived state</div> <div class="new">Bring it into the graph, or read it at render time</div> <div class="row-label">A decision taken in a constructor</div> <div class="new">A <code style="font-family:'JetBrains Mono',monospace;">computed</code>, or an effect that tracks the input</div> <div class="row-label last">A DOM write in a plain effect</div> <div class="new last"><code style="font-family:'JetBrains Mono',monospace;">afterRenderEffect</code> with a phase</div> </div></div> <div><div class="compare" style="grid-template-columns:1fr 1.1fr;font-size:24px;"> <div class="head">IF YOU SEE</div> <div class="head teal">REACH FOR</div> <div class="row-label">A fresh array or object per read</div> <div class="new">A <code style="font-family:'JetBrains Mono',monospace;">computed</code>, so identity is cached</div> <div class="row-label">A method call in a binding</div> <div class="new">A precomputed view object, bound field by field</div> <div class="row-label">An error mapped to an empty value</div> <div class="new">A distinct error state, carried to the template</div> <div class="row-label">A resource on a component-scoped service</div> <div class="new">Scope it to whatever outlives the interaction</div> <div class="row-label">Side effects in derived state</div> <div class="new">An owner that can also tear it down</div> <div class="row-label">A public writable signal</div> <div class="new"><code style="font-family:'JetBrains Mono',monospace;">protected readonly</code>, readonly at boundaries</div> <div class="row-label last">A mutable array crossing a boundary</div> <div class="new last">Type it <code style="font-family:'JetBrains Mono',monospace;">readonly</code> at the boundary</div> </div></div></div>

<style>
.compare > div { padding: 19px 28px; }
.compare > .head { padding: 16px 28px; }
</style>

<!--
- The whole deck compressed into things you can look for in a diff. Symptom left, what to reach for right
- Not reading all twelve out - they'll have the slide - but a finger on two
- **The first row, the one you'll hit most by a distance:** an effect that reads signals and writes a signal. Largest cluster in everything we looked at, and almost every instance wants to be a computed - or a linkedSignal if it also has to stay writable
- **The one I'd most like caught**, over on the right: an error mapped to an empty value. That's the row where the cost isn't a wasted render - it's a person told there's nothing there, when the truth is we don't know
- Everything else we've been through together
- The value isn't in me narrating it. It's in having it written down somewhere you'll see it again
-->

---
layout: content
center: true
---
<div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.18em;text-transform:uppercase;color:#2FD8B4;margin-bottom:36px;">One thing to take away</div>
<h2 style="font-size:64px;line-height:1.15;margin:0 0 44px;max-width:1600px;">These bugs do not throw. They render.</h2>
<p style="font-size:32px;color:#8A97A8;line-height:1.5;margin:0;max-width:1500px;">A stale label, an empty list, a chart of zeroes, a form that says it is valid. All of it looks like working software - which is why the habit matters more than the review.</p>

<!--
- Finishing here rather than on a summary
- Every bug today shares one property: **not one of them throws**
- A stale label, an empty list, a chart full of zeroes, a form that says it's valid - all four look exactly like working software
- And we don't keep shipping them because they're hard to fix. Most are a one-line change once you can see them
- It's that they're invisible when they work and invisible when they don't - so by the time the code reaches review, it already looks fine
- That's why the habits matter more than the review does
- Thank you - and very happy to take questions
-->

---
layout: content
center: true
---
<h2 style="font-size:88px;line-height:1.1;margin:0 0 40px;">Questions?</h2>
<p style="font-size:32px;color:#8A97A8;line-height:1.5;margin:0 0 44px;max-width:1500px;">Everything in this deck came out of our own review history - so if you have hit one of these and it went differently, I would rather hear about that than not.</p>
<div style="display:flex;gap:44px;font-family:'JetBrains Mono',monospace;font-size:26px;color:#5E6B7D;"> <div>angular.dev/guide/signals</div> <div>angular.dev/guide/forms/signals</div> </div>

<!--
- Open it up here
- If nothing comes straight away, two to prime the room: which of these have you actually hit, and is there one you disagree with?
- The second is more useful than the first - a couple of these findings were argued down when we filed them, and the arguments were good
- If somebody asks the question I'd ask - how do I find one in a running app, given none of them throw - the honest answer is debugName plus the signal graph in Angular DevTools, and it's better than it sounds
- Name your signals at creation and the graph becomes readable. A stale value is a missing edge, and the graph draws edges
-->
