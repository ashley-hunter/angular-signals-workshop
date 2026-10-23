---
theme: default
title: Angular Signals
info: Signals in practice - the pitfalls we keep shipping, and the newer patterns
  and APIs we should be reaching for.
canvasWidth: 1920
colorSchema: dark
highlighter: shiki
transition: slide-left
mdc: true
layout: cover
eyebrow: 'Presentation'
---

# Angular Signals

The pitfalls we keep shipping, and the newer patterns and APIs we should be reaching for.

---
layout: content
eyebrow: 'Framing'
heading: 'Adoption is done. Fluency is not.'
---

<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0 0 44px;max-width:1600px;">The reactivity findings that come back in review are not typos. They are code that reads correctly and behaves incorrectly, and they come in three shapes.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">STALE</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Something read a value once and never heard that it changed. The UI is simply wrong, and nothing errors.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">WASTEFUL</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Correct, and doing the work again on every pass. Rebuilt objects, repeated formatting, the same request twice.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">SILENT</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A request failed and the screen showed an empty list. It is not blank because something went wrong - it is blank because nothing said so.</p> </div> </div>
<p style="font-size:30px;color:#5E6B7D;line-height:1.45;margin:44px 0 0;max-width:1600px;">A dependency problem, an identity problem and a state-modelling problem. Every chapter after this one is one of the three.</p>

---
layout: section
number: '01'
transition: fade
---

## Derived state

<p class="lead" style="margin-top:40px">Where the largest share of review findings live.</p>

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

---
layout: content
eyebrow: 'The pattern'
heading: 'An effect that writes a signal is a computed you maintain by hand'
clicks: 1
---

<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 24px;max-width:1660px;">Everything here is signals, so it feels reactive. It is a manual subscription spelled with signals.</p>
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:40px;align-items:start;">
<div>

````md magic-move
```ts
// AVOID
readonly rows = input.required<Row[]>();
readonly visible = signal<Row[]>([]);

readonly #sync = effect(() => {
  this.visible.set(this.rows().filter((r) => r.enabled));
});
```

```ts
// PREFER
readonly rows = input.required<Row[]>();

readonly visible = computed(() =>
  this.rows().filter((r) => r.enabled),
);
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:26px 28px;"><div style="font-size:22px;color:#8A97A8;margin-bottom:8px;"><span class="swap"><span v-click.hide="1">A signal kept in step by an effect</span><span v-click="1">A computed</span></span></div><div class="swap"><div v-click.hide="1"><div style="padding:11px 0;border-bottom:1px solid #1E252F;"><div style="font-size:21px;color:#8A97A8;line-height:1.25;">When it lands</div><div style="font-size:24px;color:#FF7A6B;line-height:1.3;margin-top:3px;">After the view was checked</div></div><div style="padding:11px 0;border-bottom:1px solid #1E252F;"><div style="font-size:21px;color:#8A97A8;line-height:1.25;">Who can write it</div><div style="font-size:24px;color:#FF7A6B;line-height:1.3;margin-top:3px;">Anything in the class</div></div><div style="padding:11px 0;border-bottom:1px solid #1E252F;"><div style="font-size:21px;color:#8A97A8;line-height:1.25;">If nothing reads it</div><div style="font-size:24px;color:#FF7A6B;line-height:1.3;margin-top:3px;">Filters anyway, on every change</div></div><div style="padding:11px 0;border-bottom:1px solid #1E252F;"><div style="font-size:21px;color:#8A97A8;line-height:1.25;">Cost per change</div><div style="font-size:24px;color:#FF7A6B;line-height:1.3;margin-top:3px;">A second change detection pass</div></div></div><div v-click="1"><div style="padding:11px 0;border-bottom:1px solid #1E252F;"><div style="font-size:21px;color:#8A97A8;line-height:1.25;">When it lands</div><div style="font-size:24px;color:#2FD8B4;line-height:1.3;margin-top:3px;">On read, always current</div></div><div style="padding:11px 0;border-bottom:1px solid #1E252F;"><div style="font-size:21px;color:#8A97A8;line-height:1.25;">Who can write it</div><div style="font-size:24px;color:#2FD8B4;line-height:1.3;margin-top:3px;">Nothing</div></div><div style="padding:11px 0;border-bottom:1px solid #1E252F;"><div style="font-size:21px;color:#8A97A8;line-height:1.25;">If nothing reads it</div><div style="font-size:24px;color:#2FD8B4;line-height:1.3;margin-top:3px;">Never runs</div></div><div style="padding:11px 0;border-bottom:1px solid #1E252F;"><div style="font-size:21px;color:#8A97A8;line-height:1.25;">Cost per change</div><div style="font-size:24px;color:#2FD8B4;line-height:1.3;margin-top:3px;">None</div></div></div></div></div>
</div>

---
layout: content
eyebrow: 'Derived, and writable'
heading: 'When the user can override the derived value'
clicks: 1
---

<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 24px;max-width:1660px;">The filter resets the page, so it is derived. The pager moves it, so it is writable. Both at once is <code style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;">linkedSignal</code>.</p>
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:40px;align-items:start;">
<div>

````md magic-move
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

```ts
// PREFER
readonly page = linkedSignal(() => {
  this.filter();  // track
  return 1;       // reset
});

next() { this.page.update((p) => p + 1); }
prev() { this.page.update((p) => p - 1); }
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:26px 28px;"><div class="swap"><div v-click.hide="1"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-size:23px;color:#8A97A8;line-height:1.25;">Resets when the filter changes</span><span style="font-size:24px;color:#FF7A6B;line-height:1.25;text-align:right;">an effect you wrote</span></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-size:23px;color:#8A97A8;line-height:1.25;">Moves when the pager runs</span><span style="font-size:24px;color:#8A97A8;line-height:1.25;text-align:right;"><code style="font-family:'JetBrains Mono',monospace;font-size:21px;">page.update()</code></span></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-size:23px;color:#8A97A8;line-height:1.25;">Things that own <code style="font-family:'JetBrains Mono',monospace;font-size:21px;">page</code></span><span style="font-size:24px;color:#FF7A6B;line-height:1.25;text-align:right;"><span style="font-size:30px;">2</span></span></div></div><div v-click="1"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-size:23px;color:#8A97A8;line-height:1.25;">Resets when the filter changes</span><span style="font-size:24px;color:#2FD8B4;line-height:1.25;text-align:right;">the computation</span></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-size:23px;color:#8A97A8;line-height:1.25;">Moves when the pager runs</span><span style="font-size:24px;color:#8A97A8;line-height:1.25;text-align:right;"><code style="font-family:'JetBrains Mono',monospace;font-size:21px;">page.update()</code></span></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-size:23px;color:#8A97A8;line-height:1.25;">Things that own <code style="font-family:'JetBrains Mono',monospace;font-size:21px;">page</code></span><span style="font-size:24px;color:#2FD8B4;line-height:1.25;text-align:right;"><span style="font-size:30px;">1</span></span></div></div></div><div class="swap" style="margin-top:18px;"><div v-click.hide="1" style="font-size:24px;color:#FF7A6B;line-height:1.4;">Two mechanisms, and keeping them in step is your job.</div><div v-click="1" style="font-size:24px;color:#2FD8B4;line-height:1.4;">One signal that is both derived and writable.</div></div></div>
</div>

---
layout: content
eyebrow: 'Lesser known'
heading: 'A linkedSignal can write back to its source'
clicks: 2
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
// AVOID
const tempC = linkedSignal(
  () => ((tempF() - 32) * 5) / 9,
);

const tempF = linkedSignal(
  () => (tempC() * 9) / 5 + 32,
);

// each one reads the other: a cycle
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
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 36px;"> <div style="font-size:24px;color:#8A97A8;margin-bottom:12px;">Celsius</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:0 20px;height:62px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:28px;color:#E8ECF2;"><span class="swap"><span v-click.hide="1" style="color:#FF7A6B;">0</span><span v-click="[1,2]" style="color:#FF7A6B;">?</span><span v-click="2" style="color:#2FD8B4;">100</span></span></div> <div style="font-size:24px;color:#8A97A8;margin:26px 0 12px;">Fahrenheit</div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:8px;padding:0 20px;height:62px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:28px;color:#E8ECF2;">212</div> <div style="font-size:25px;line-height:1.4;margin-top:24px;"><span class="swap"><span v-click.hide="1" style="color:#FF7A6B;">Celsius never moved. Next write to it and the 212 is gone.</span><span v-click="[1,2]" style="color:#FF7A6B;">Throws on first read: <code style="font-family:'JetBrains Mono',monospace;font-size:22px;">Detected cycle in computations</code>.</span><span v-click="2" style="color:#2FD8B4;">Celsius took the write. Fahrenheit came back through the computation.</span></span></div> </div>
</div>

---
layout: content
eyebrow: 'Reactive context'
heading: 'Not every callback you pass Angular is tracked'
---

<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 8px;max-width:1660px;">A read only becomes a dependency if it happens somewhere Angular is watching. <span style="color:#2FD8B4;">Green</span> is watched, <span style="color:#FF7A6B;">red</span> is not - and some of these take two callbacks and watch exactly one.</p>
<div style="font-family:'JetBrains Mono',monospace;font-size:31px;line-height:1.5;color:#C9D4E2;margin-top:26px;"><div style="padding:14px 0;border-bottom:1px solid #1E252F;">computed(<span style="color:#2FD8B4;">fn</span>)</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">effect(<span style="color:#2FD8B4;">fn</span>)</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">linkedSignal(<span style="color:#2FD8B4;">computation</span>, { <span style="color:#FF7A6B;">set</span> })</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">resource({ <span style="color:#2FD8B4;">params</span>, <span style="color:#FF7A6B;">loader</span> })</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">afterRenderEffect({ <span style="color:#2FD8B4;">write</span> })</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">afterNextRender({ <span style="color:#FF7A6B;">write</span> })</div><div style="padding:14px 0;border-bottom:1px solid #1E252F;">untracked(<span style="color:#FF7A6B;">fn</span>)</div></div>
<p style="font-size:28px;color:#C9D4E2;line-height:1.45;margin:26px 0 0;max-width:1660px;">The <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">resource</code> row is the one to keep: <code style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#2FD8B4;">params</code> decides <em>when</em> to fetch, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#FF7A6B;">loader</code> only decides <em>how</em>. A signal read in the loader will never cause a refetch. And nothing after an <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">await</code> is tracked anywhere.</p>

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

---
layout: section
number: '02'
transition: fade
---

## Dependencies

<p class="lead" style="margin-top:40px">The set is observed, not declared. That is where stale comes from.</p>

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

---
layout: section
number: '03'
transition: fade
---

## Timing

<p class="lead" style="margin-top:40px">When your code runs relative to inputs and to render.</p>

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

---
layout: content
eyebrow: 'Migration'
heading: 'Every ngOnChanges has a signals shape'
---

<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">A surviving <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">ngOnChanges</code> is almost always one of four things. Three of them are not lifecycle at all.</p>
<div class="compare" style="grid-template-columns:0.9fr 0.7fr 1fr;margin-bottom:36px;"> <div class="head">WHAT IT DOES</div> <div class="head teal">BECOMES</div> <div class="head">WHY</div> <div class="row-label">Recomputes from one input</div> <div><code style="font-family:'JetBrains Mono',monospace;">computed</code></div> <div>It was never a change handler, it was a formula</div> <div class="row-label">Recomputes from several</div> <div><code style="font-family:'JetBrains Mono',monospace;">computed</code></div> <div>Read them all; the dependency set builds itself</div> <div class="row-label">Resets local state on change</div> <div><code style="font-family:'JetBrains Mono',monospace;">linkedSignal</code></div> <div>Derived, but the user can still overwrite it</div> <div class="row-label last">Drives something non-reactive</div> <div class="last"><code style="font-family:'JetBrains Mono',monospace;">effect</code></div> <div class="last">The only one that is genuinely a side effect</div> </div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:0 0 18px;max-width:1600px;">There is no equivalent for <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">firstChange</code>. If the first run has to differ, that is initialisation - and it belongs somewhere that runs once.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:0;max-width:1600px;"><code style="font-family:'JetBrains Mono',monospace;font-size:26px;">ng generate @angular/core:signals</code> converts inputs, outputs and queries for you. It does not touch <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">ngOnChanges</code>, so this table is the part you do by hand.</p>

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

---
layout: content
eyebrow: 'Render phases'
heading: 'Pick the phase, do not take the default'
---

<div class="compare" style="grid-template-columns:0.5fr 1fr 1fr;margin-bottom:40px;"> <div class="head">PHASE</div> <div class="head teal">FOR</div> <div class="head">CONSTRAINT</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">earlyRead</code></div> <div>Measuring, before anything writes</div> <div>Never write here. Prefer <code style="font-family:'JetBrains Mono',monospace;">read</code> if it can wait</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">write</code></div> <div>Mutating the DOM</div> <div>Never read layout here</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">mixedReadWrite</code></div> <div>The default, and the reason to be explicit</div> <div>Only when unavoidable</div> <div class="row-label last"><code style="font-family:'JetBrains Mono',monospace;">read</code></div> <div class="last">Inspecting after all writes</div> <div class="last">Never write here</div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">A read after a write in the same phase forces layout. The phases run in a fixed order, so splitting them is usually a two-line change.</p>

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

---
layout: section
number: '04'
transition: fade
---

## Purity and cost

<p class="lead" style="margin-top:40px">Derived state is read often, and at unpredictable times.</p>

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

---
layout: content
eyebrow: 'Identity'
heading: 'Reference equality is the notification boundary'
clicks: 1
---

<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 20px;max-width:1660px;">The server polls every 10 seconds and usually sends back the same rows. The grid only sees a new reference.</p>

```html
<app-grid [rows]="visibleRows()" />
```

<div style="margin-top:22px;">

````md magic-move
```ts
// poll every 10s - most responses are identical
readonly rows = toSignal(
  timer(0, 10_000).pipe(switchMap(() => this.api.rows())),
  { initialValue: [] },
);

protected readonly visibleRows = computed(() =>
  this.rows().filter((r) => r.active),
);

// new Row objects every poll, so the grid rebuilds
// every 10s even when nothing changed
```

```ts
// poll every 10s - most responses are identical
readonly rows = toSignal(
  timer(0, 10_000).pipe(switchMap(() => this.api.rows())),
  { initialValue: [] },
);

protected readonly visibleRows = computed(
  () => this.rows().filter((r) => r.active),
  {
    equal: (a, b) =>
      a.length === b.length &&
      a.every((r, i) => r.id === b[i].id),
  },
);   // equal -> old value kept, grid does nothing
```
````

</div>

---
layout: section
number: '05'
transition: fade
---

## Async state

<p class="lead" style="margin-top:40px">Loading, empty, error, and the difference between them.</p>

---
layout: content
eyebrow: 'Resources'
heading: 'Signal-driven fetches belong in a resource'
clicks: 3
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

```ts
// rxResource: same signals out, an Observable in
readonly users = rxResource({
  params: () => this.teamId(),
  stream: ({ params: id }) =>
    this.http.get<User[]>(`/api/teams/${id}/users`),
});
```

```ts
// resource: same signals out, a Promise in
readonly users = resource({
  params: () => this.teamId(),
  loader: ({ params: id, abortSignal }) =>
    fetch(`/api/teams/${id}/users`, { signal: abortSignal })
      .then((r) => r.json() as Promise<User[]>),
});
```
````

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 30px;"><div style="font-size:22px;color:#8A97A8;margin-bottom:10px;"><span class="swap"><span v-click.hide="1">What you are maintaining</span><span v-click="1">What you get for free</span></span></div><div class="swap"><div v-click.hide="1"><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#FF7A6B;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">a <code style="font-family:'JetBrains Mono',monospace;font-size:22px;">loading</code> flag, set on both sides</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#FF7A6B;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">nothing cancels a superseded request</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#FF7A6B;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">two responses can land out of order</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#FF7A6B;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">no error state anywhere</span></div></div><div v-click="1"><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#2FD8B4;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;"><code style="font-family:'JetBrains Mono',monospace;font-size:22px;">value</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:22px;">isLoading</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:22px;">error</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:22px;">status</code></span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#2FD8B4;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;"><code style="font-family:'JetBrains Mono',monospace;font-size:22px;">reload()</code> when you need it</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#2FD8B4;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">superseded requests cancelled</span></div><div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid #1E252F;"><span style="color:#2FD8B4;font-size:20px;">&#9679;</span><span style="font-size:24px;color:#C9D4E2;line-height:1.3;">no race between two responses</span></div></div></div></div>
</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin:30px 0 0;font-size:25px;line-height:1.4;color:#C9D4E2;"> <div style="border-top:2px solid;padding-top:14px;transition:border-color .3s;" :style="{ borderColor: $clicks < 2 ? '#2FD8B4' : '#4A5568' }"><code style="font-family:'JetBrains Mono',monospace;font-size:24px;transition:color .3s;" :style="{ color: $clicks < 2 ? '#2FD8B4' : '#8A97A8' }">httpResource</code><br>an HTTP GET</div> <div style="border-top:2px solid;padding-top:14px;transition:border-color .3s;" :style="{ borderColor: $clicks === 2 ? '#2FD8B4' : '#4A5568' }"><code style="font-family:'JetBrains Mono',monospace;font-size:24px;transition:color .3s;" :style="{ color: $clicks === 2 ? '#2FD8B4' : '#8A97A8' }">rxResource</code><br>an observable pipeline you already have</div> <div style="border-top:2px solid;padding-top:14px;transition:border-color .3s;" :style="{ borderColor: $clicks >= 3 ? '#2FD8B4' : '#4A5568' }"><code style="font-family:'JetBrains Mono',monospace;font-size:24px;transition:color .3s;" :style="{ color: $clicks >= 3 ? '#2FD8B4' : '#8A97A8' }">resource</code><br>a promise, or a stream you own</div> </div>

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

---
layout: content
eyebrow: 'Async state'
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

---
layout: section
number: '06'
transition: fade
---
## Boundaries

<p class="lead" style="margin-top:40px">What a signal exposes, and to whom.</p>

---
layout: content
eyebrow: 'Visibility'
heading: 'Template-only state is not public API'
---

<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:40px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;margin-bottom:18px;">protected readonly</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Anything the template reads and nothing outside needs: derived state, signal queries, view helpers.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;margin-bottom:18px;">#private</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Anything neither the template nor a consumer touches. Enforced at runtime, not just by the compiler.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">A signal anything can reach is an invitation, and your invariant now has two owners. <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">protected</code> closes that door; <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">readonly</code> only stops reassignment.</p>

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
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 30px;"><div style="font-size:22px;color:#8A97A8;margin-bottom:8px;">After a consumer calls <code style="font-family:'JetBrains Mono',monospace;font-size:21px;">pop()</code></div><div class="swap"><div v-click.hide="1"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:23px;color:#8A97A8;">items().length</span><span style="font-family:'JetBrains Mono',monospace;font-size:32px;color:#FF7A6B;line-height:1;">4 &rarr; 3</span></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:23px;color:#8A97A8;">items() === items()</span><span style="font-family:'JetBrains Mono',monospace;font-size:32px;color:#FF7A6B;line-height:1;">true</span></div><div style="font-size:24px;color:#FF7A6B;line-height:1.4;margin-top:18px;">The contents changed. The reference did not, so nothing was notified and nothing reran.</div></div><div v-click="1"><div style="font-family:'JetBrains Mono',monospace;font-size:23px;color:#2FD8B4;line-height:1.45;padding:13px 0 16px;border-bottom:1px solid #1E252F;">Property &#39;pop&#39; does not exist on type<br>&#39;readonly Item[]&#39;.</div><div style="font-size:24px;color:#2FD8B4;line-height:1.4;margin-top:18px;">The edit cannot be written in the first place, so the two can never disagree.</div></div></div></div>
</div>
<p style="font-size:28px;color:#5E6B7D;line-height:1.45;margin:30px 0 0;max-width:1660px;">The signal protects the reference, not the contents. Nothing reruns, because from the graph's point of view nothing changed.</p>

---
layout: section
number: '07'
transition: fade
---
## Signal Forms

<p class="lead" style="margin-top:40px">The same ideas, applied to the one API built entirely on them.</p>

---
layout: content
eyebrow: 'Introduction'
heading: 'A third forms API, built on signals'
---

<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0 0 52px;max-width:1550px;">Stable in v22. You keep your data in a signal, pass it to <code style="font-family:'JetBrains Mono',monospace;font-size:29px;color:#2FD8B4;">form()</code>, and get a form back - no control tree to keep in sync.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Your own data is the form's data, and everything the form knows about a field is a signal.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS NOT</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A migration. Reactive forms still work, and so do the controls we have already built - but new forms should use signal forms.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT CHANGES</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Validators stop being things you add and remove. They become rules that know when they apply.</p> </div> </div>

---
layout: content
eyebrow: 'What is a signal form?'
heading: 'Three pieces'
clicks: 4
---

<div style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:52px;align-items:start;"> <div style="display:flex;flex-direction:column;gap:24px;"> <div style="display:flex;gap:24px;align-items:stretch;" v-click="1"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;padding-top:34px;width:28px;">1</div> <div style="flex:1;background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.6;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">const</span> <span>loginModel</span> = <span style="color:#7CC4FF;">signal</span>({ email: <span style="color:#2FD8B4;">''</span>, password: <span style="color:#2FD8B4;">''</span> });</div> </div> </div> <div style="display:flex;gap:24px;align-items:stretch;" v-click="2"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;padding-top:34px;width:28px;">2</div> <div style="flex:1;background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.6;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">const</span> <span>loginForm</span> = <span style="color:#7CC4FF;">form</span>(loginModel);</div> </div> </div> <div style="display:flex;gap:24px;align-items:stretch;" v-click="3"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;padding-top:34px;width:28px;">3</div> <div style="flex:1;background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.6;color:#C9D4E2;"> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.email"</span> /&gt;</div> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.password"</span> /&gt;</div> </div> </div> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px;display:flex;flex-direction:column;gap:22px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;">RUNNING</div> <div> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Email</div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;white-space:nowrap;">sam.taylor@example.com<span style="color:#2FD8B4;">|</span></div> </div> <div> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Password</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">••••••••</div> </div> <div style="border-top:1px solid #4A5568;padding-top:20px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.55;color:#5E6B7D;"> <div>loginModel().email</div> <div style="color:#2FD8B4;">"sam.taylor@example.com"</div> </div> </div> </div>
<div style="margin-top:48px;border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:36px;font-weight:500;color:#E8ECF2;" v-click="4">The model is the source of truth for the editable data.</div>

---
layout: content
eyebrow: 'Side by side'
heading: 'The same form in both APIs'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 40px;max-width:1400px;">Two ways to describe the same two fields: build a control tree and bind out of it, or hold the data and bind straight at it.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:20px 36px;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:22px;">REACTIVE FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#8A97A8;"> <div><span style="color:#8577CF;">readonly</span> <span>loginForm</span> = <span style="color:#8577CF;">new</span> FormGroup({</div> <div style="padding-left:1.2em;">email: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>),</div> <div style="padding-left:1.2em;">password: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>),</div> <div>});</div> </div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:22px;">SIGNAL FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">readonly</span> <span>loginModel</span> = <span style="color:#7CC4FF;">signal</span>({</div> <div style="padding-left:1.2em;">email: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:1.2em;">password: <span style="color:#2FD8B4;">''</span>,</div> <div>});</div> <div style="height:0.85em;"></div> <div><span style="color:#8B7CF6;">readonly</span> <span>loginForm</span> = <span style="color:#7CC4FF;">form</span>(<span style="color:#8B7CF6;">this</span>.loginModel);</div> </div> </div> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:28px 36px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#8A97A8;"> <div>&lt;input [formControl]=<span style="color:#3FBFA2;">"loginForm.controls.email"</span> /&gt;</div> <div>&lt;input [formControl]=<span style="color:#3FBFA2;">"loginForm.controls.password"</span> /&gt;</div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:28px 36px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#C9D4E2;"> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.email"</span> /&gt;</div> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.password"</span> /&gt;</div> </div> </div>
<p style="font-size:30px;color:#5E6B7D;line-height:1.4;margin:40px 0 0;">And for a form this simple, there really isn't much wrong with this.</p>

---
layout: content
eyebrow: 'Validation'
heading: 'Rules live in the schema, beside the data'
---

<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1660px;">One place describing what has to be true about this data.</p>
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:40px;align-items:center;">
<div>

```ts
readonly signupForm = form(this.signup, (p) => {
  required(p.email, { message: 'Email is required' });
  email(p.email, { message: 'Enter a valid email' });
  minLength(p.password, 8, { message: '8 or more' });
});
```

</div>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 30px;"><div style="font-size:22px;color:#8A97A8;margin-bottom:14px;">Built in</div><div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;line-height:1.5;">required &nbsp;email &nbsp;pattern<br>min &nbsp;max &nbsp;minLength &nbsp;maxLength<br>minDate &nbsp;maxDate</div><div style="font-size:24px;color:#C9D4E2;line-height:1.45;margin-top:18px;">Each takes a path and an options object. The message is yours - Angular ships no default copy, so a rule without one has a <code style="font-family:'JetBrains Mono',monospace;font-size:22px;">kind</code> and nothing to display.</div></div>
</div>

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

---
layout: content
eyebrow: 'Why switch'
heading: 'Better in every way'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px 56px;">
<div style="display:flex;flex-direction:column;gap:24px;">
<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;"><div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;line-height:1.3;">&#10003;</div><div><div style="font-size:29px;line-height:1.3;color:#E8ECF2;">Everything is a signal</div><p style="font-size:24px;line-height:1.4;margin:6px 0 0;color:#8A97A8;">Value, validity, touched, errors. Read them anywhere, derive from them, no snapshots and no getters.</p></div></div>
<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;"><div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;line-height:1.3;">&#10003;</div><div><div style="font-size:29px;line-height:1.3;color:#E8ECF2;">Zoneless compatible</div><p style="font-size:24px;line-height:1.4;margin:6px 0 0;color:#8A97A8;">Value and validity are signals, so anything derived from them tracks. Reactive forms expose plain properties and observables, which nothing can derive from.</p></div></div>
<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;"><div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;line-height:1.3;">&#10003;</div><div><div style="font-size:29px;line-height:1.3;color:#E8ECF2;">You own the model</div><p style="font-size:24px;line-height:1.4;margin:6px 0 0;color:#8A97A8;">The form reads your signal, it does not copy it. There is no second copy to sync back.</p></div></div>
<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;"><div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;line-height:1.3;">&#10003;</div><div><div style="font-size:29px;line-height:1.3;color:#E8ECF2;">Validation is reactive, not static</div><p style="font-size:24px;line-height:1.4;margin:6px 0 0;color:#8A97A8;">Validators were fixed when the control was built. Rules re-evaluate, so conditional required is one line rather than a subscription that adds and clears.</p></div></div>
<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;"><div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;line-height:1.3;">&#10003;</div><div><div style="font-size:29px;line-height:1.3;color:#E8ECF2;">Errors are data</div><p style="font-size:24px;line-height:1.4;margin:6px 0 0;color:#8A97A8;">Iterate the field&rsquo;s errors in the template instead of one block per message.</p></div></div>
</div>
<div style="display:flex;flex-direction:column;gap:24px;">
<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;"><div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;line-height:1.3;">&#10003;</div><div><div style="font-size:29px;line-height:1.3;color:#E8ECF2;">Your Zod and Valibot schemas work</div><p style="font-size:24px;line-height:1.4;margin:6px 0 0;color:#8A97A8;">Anything implementing Standard Schema validates a field through <code style="font-family:'JetBrains Mono',monospace;font-size:23px;">validateStandardSchema</code>.</p></div></div>
<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;"><div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;line-height:1.3;">&#10003;</div><div><div style="font-size:29px;line-height:1.3;color:#E8ECF2;">Schemas are reusable</div><p style="font-size:24px;line-height:1.4;margin:6px 0 0;color:#8A97A8;">Define the rules for an address or a line item once, then apply them wherever that shape appears.</p></div></div>
<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;"><div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;line-height:1.3;">&#10003;</div><div><div style="font-size:29px;line-height:1.3;color:#E8ECF2;">Paths are type-safe</div><p style="font-size:24px;line-height:1.4;margin:6px 0 0;color:#8A97A8;">The schema mirrors your model, so a renamed field is a compile error rather than a silent no-op.</p></div></div>
<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;"><div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;line-height:1.3;">&#10003;</div><div><div style="font-size:29px;line-height:1.3;color:#E8ECF2;">Custom controls lose the ceremony</div><p style="font-size:24px;line-height:1.4;margin:6px 0 0;color:#8A97A8;">One interface, no providers, no <code style="font-family:'JetBrains Mono',monospace;font-size:23px;">forwardRef</code>, no <code style="font-family:'JetBrains Mono',monospace;font-size:23px;">ControlValueAccessor</code>.</p></div></div>
<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;"><div style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;line-height:1.3;">&#10003;</div><div><div style="font-size:29px;line-height:1.3;color:#E8ECF2;">Backwards compatible</div><p style="font-size:24px;line-height:1.4;margin:6px 0 0;color:#8A97A8;">Existing <code style="font-family:'JetBrains Mono',monospace;font-size:23px;">ControlValueAccessor</code> controls bind to a signal form unchanged, and reactive forms keep working alongside it.</p></div></div>
</div>
</div>

---
layout: section
number: '08'
transition: fade
---
## In review

<p class="lead" style="margin-top:40px">The reactivity chapters, as questions you can ask about a diff.</p>

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

---
layout: content
center: true
title: 'Questions?'
---
<h2 style="font-size:88px;line-height:1.1;margin:0 0 56px;">Questions?</h2>
<div style="display:flex;gap:44px;font-family:'JetBrains Mono',monospace;font-size:26px;color:#5E6B7D;"> <div>angular.dev/guide/signals</div> <div>angular.dev/guide/forms/signals</div> </div>
