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
Signals are not new to anyone here. Adoption is not the problem - the codebase is overwhelmingly signal-based already. What keeps happening is a small set of mistakes, made over and over, in code that looks completely reasonable. This session is about those, and about the shape of the fix in each case.
-->

---
layout: content
eyebrow: 'Framing'
heading: 'Adoption is done. Fluency is not.'
---
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0 0 44px;max-width:1600px;">We write signals everywhere. The reactivity findings that come back in review are rarely typos - they are code that reads correctly and behaves incorrectly, and they show up in three recognisable shapes.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">STALE</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Something read a value once and never heard that it changed. The UI is simply wrong, and nothing errors.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">WASTEFUL</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Correct, and doing the work again on every pass. Rebuilt objects, repeated formatting, the same request twice.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">SILENT</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A failure was flattened into an empty value, so the screen renders a confident, believable lie.</p> </div> </div>
<p style="font-size:30px;color:#5E6B7D;line-height:1.45;margin:44px 0 0;max-width:1600px;">Stale is a dependency problem, wasteful is an identity problem, silent is a state-modelling problem. Every chapter after this is one of the three.</p>

<!--
Provenance, in case anyone asks: this is a keyword pass over a sample of the repo's PR review comments, narrowed to the reactivity-related ones. Stale language dominates, wasted or repeated work is close behind, and silent failure is third. Deliberately not claiming these are the most common review findings overall - across every comment, the biggest categories are guideline violations, logical bugs, missing test coverage and comments that no longer match the code. And do not add races to this list: it reads like it belongs, but it barely appears in our reactivity findings.
-->
---
layout: content
eyebrow: 'Mental model'
heading: 'Signals pull. They do not push.'
---
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-bottom:44px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">LAZY</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">computed</code> does not run when its source changes. It runs when somebody reads it, and only if something it depends on actually changed.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">GLITCH-FREE</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Readers never see a half-updated graph. There is no intermediate state to defend against, so no ordering to coordinate by hand.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">TRACKED AT RUNTIME</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Dependencies are whatever you read during this run. An early return, a branch, or an <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">await</code> changes the set.</p> </div> </div>
<div style="border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:500;color:#E8ECF2;line-height:1.3;">Almost every pitfall in this deck is one of these three, met head on.</div>

<!--
Worth being precise about tracked-at-runtime, because it is the root of the stale family. The dependency set is not declared. It is observed, per run, from the reads that actually happened. Two consequences we will keep coming back to: a value you read behind a condition is only a dependency on the runs where the condition let you read it, and a value you read outside a reactive context is not a dependency at all.
-->

---
layout: section
number: '01'
transition: fade
---
## Derived state

<p class="lead" style="margin-top:40px">Where the largest share of review findings live.</p>

<!--
This chapter is the single biggest cluster in our review history, by a wide margin. If we only fix one habit as a team, it is this one.
-->

---
layout: content
eyebrow: 'Picking one'
heading: 'You know what they do. Which one owns the value?'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 40px;max-width:1600px;">Nothing in this deck is news about the primitives. Every mistake in it is a mistake about which primitive a particular value belongs to, and the choice comes down to one question asked in order.</p>
<div style="display:flex;flex-direction:column;gap:20px;margin-bottom:40px;"> <div style="display:grid;grid-template-columns:1fr auto;gap:36px;align-items:center;background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 36px;"> <p style="font-size:30px;line-height:1.35;margin:0;color:#C9D4E2;">Can you write it as a formula over other signals?</p> <div style="font-family:'JetBrains Mono',monospace;font-size:28px;color:#2FD8B4;white-space:nowrap;">computed()</div> </div> <div style="display:grid;grid-template-columns:1fr auto;gap:36px;align-items:center;background:#12171F;border:1px solid #8B7CF6;border-radius:14px;padding:28px 36px;"> <p style="font-size:30px;line-height:1.35;margin:0;color:#C9D4E2;">A formula, <em>and</em> something else is allowed to overwrite the result?</p> <div style="font-family:'JetBrains Mono',monospace;font-size:28px;color:#8B7CF6;white-space:nowrap;">linkedSignal()</div> </div> <div style="display:grid;grid-template-columns:1fr auto;gap:36px;align-items:center;background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 36px;"> <p style="font-size:30px;line-height:1.35;margin:0;color:#C9D4E2;">Nothing derives it - a user or an external event decides?</p> <div style="font-family:'JetBrains Mono',monospace;font-size:28px;color:#2FD8B4;white-space:nowrap;">signal()</div> </div> </div>
<div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:30px 38px;"> <p style="font-size:29px;line-height:1.45;margin:0;color:#C9D4E2;"><code style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#FF7A6B;">effect()</code> is not an answer to this question. It is the exit from the graph into something that is not reactive, and it is not a place to keep state.</p> </div>

<!--
Worth saying out loud that the middle row is the interesting one for this audience. Everybody here reaches for computed and signal correctly. Almost nobody reaches for linkedSignal, so when a value is derived but also writable, the fallback is an effect - and that is where the largest cluster of our review findings comes from. The ordering matters too: work down the list and stop at the first yes, rather than starting from "what do I need to keep in sync".
-->
---
layout: content
eyebrow: 'The pattern'
heading: 'The finding we file most often'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">An effect reads reactive state and writes reactive state. Everything is signals, so it feels reactive. It is not: it is a manual subscription that happens to be spelled with signals.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
readonly rows = input.required<Row[]>();
readonly visible = signal<Row[]>([]);

constructor() {
  effect(() => {
    this.visible.set(
      this.rows().filter((r) => r.enabled),
    );
  });
}
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
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:40px 0 0;max-width:1600px;">The version on the left is one render behind, can be written by anyone, needs a test to prove it stays in sync, and produces an extra change detection pass every time the input changes.</p>

<!--
Say out loud why the left is worse, because "the rule says so" does not change habits. Four things. It is a frame late, because the effect runs after the change. It is writable by anything, so the invariant is not enforced. It has no cached identity, so downstream work reruns. And it costs an extra pass. The right-hand version cannot drift, because there is nothing to keep in sync.
-->

---
layout: content
eyebrow: 'Derived, and writable'
heading: 'When the user can override the derived value'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">The reason people reach for an effect is usually legitimate: the value is derived, but it also has to be writable. That is not a gap in the API. That is <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">linkedSignal</code>.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
readonly page = signal(1);

constructor() {
  effect(() => {
    this.filter();       // track
    this.page.set(1);    // reset
  });
}
```

</div>
<div>

```ts
// PREFER
readonly page = linkedSignal(() => {
  this.filter();  // track
  return 1;       // reset
});
```

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:40px 0 0;max-width:1600px;">Selected row, current page, active tab, a form field seeded from loaded data, a selection that must survive a filter change but not a dataset change. All the same shape.</p>

<!--
This is the highest-leverage slide in the deck for us, because the codebase has hundreds of the left-hand shape and barely any of the right-hand one. The tell for linkedSignal is a sentence with "but" in it: it is derived, but the user can change it. Also worth mentioning the computation form, which takes the previous value, for cases where you want to keep the selection if it still exists in the new source.
-->

---
layout: content
eyebrow: 'Lesser known'
heading: 'A linkedSignal can write back to its source'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 28px;max-width:1650px;">By default a write to a <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">linkedSignal</code> is local: it overrides the derived value until the source changes again, and then the edit is gone. The <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">set</code> option intercepts that write, so the edit can go to whoever actually owns the value.</p>
<div style="display:grid;grid-template-columns:0.85fr 1.15fr;gap:36px;">
<div>

```ts
// local override, the default
readonly pageSize = linkedSignal(
  () => this.prefs().pageSize,
);
```

</div>
<div>

```ts
// write-through to the owner
readonly pageSize = linkedSignal({
  source: this.prefs,
  computation: (p) => p.pageSize,
  set: (value, rawSet) => {
    this.prefs.update((p) =>
      ({ ...p, pageSize: value }));
    rawSet(value);
  },
});
```

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:36px 0 0;max-width:1650px;">Omit the <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">rawSet</code> call and the new value arrives back through the recomputation, so the source stays the only place the value lives. Call it and you also get the optimistic local update. <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">update()</code> goes through the same hook.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:20px 0 0;max-width:1650px;">This closes the last honest reason to reach for an effect: a value that is derived, writable, and whose writes belong to somebody else.</p>

<!--
Genuinely lesser known, and it removes a plumbing job people currently do by hand. Without it, the pattern is a local linked signal plus something that pushes edits back, which in practice means an effect or a manually wired method. Two details worth saying: the hook replaces the default write entirely, so if you never call rawSet the only path back is the recomputation, which is usually what you want because there is then exactly one owner. And update() reads the current value untracked before handing it to your hook, so it does not create a dependency by accident.
-->
---
layout: content
eyebrow: 'Boundaries'
heading: 'Effects that reach into another component'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">The same mistake, one level up: an effect in the parent writes a signal that belongs to a child, a shared service, or the parameters of a request. Reactive state crosses a component boundary through the back door.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:40px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">WHAT IT LOOKS LIKE</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">An effect calls <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">child.something.set(...)</code>, or mirrors state into a store purely so a request can read it.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">WHY IT HURTS</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">The child's own derived work reruns on a schedule the child cannot see, ownership of the value becomes unclear, and two writers can now disagree.</p> </div> </div>
<div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:18px;">REACH FOR</div> <p style="font-size:29px;line-height:1.45;margin:0;color:#C9D4E2;">An <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">input()</code> on the child, so the value arrives through the declared contract. A <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">computed</code> handed straight to whatever consumes it. Or an explicit method on the child, called from the event that caused the change.</p> </div>

<!--
The question to ask in review is simply: who owns this value? If the answer is the child, the parent should be passing it in, not writing it. If the answer is the request, then the request should take a computed of its parameters directly instead of reading a mirror that an effect keeps up to date. Mirrors are where races come from, because now there are two writers and the order between them is timing.
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
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:40px 0 0;max-width:1600px;">Effects that pass review are the ones that name the non-reactive driver. One effect per side effect, and prefer a named class field over a constructor body.</p>

<!--
Important balance to strike here, otherwise everyone leaves thinking effects are banned. They are not, and the genuine bridge cases are common in our codebase - grid libraries, editors, charts, anything driven from an event stream we do not own. The difference between an effect that survives review and one that does not is almost always whether the author could name the thing outside the graph. If you cannot name it, there probably is not one, and it is a computed.
-->

---
layout: content
eyebrow: 'Footgun'
heading: 'An effect stops tracking at the first await'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
effect(async () => {
  const id = this.teamId();      // tracked
  const data = await load(id);
  const fmt = this.format();     // NOT tracked
  this.render(data, fmt);
});
```

</div>
<div>

```ts
// PREFER
readonly params = computed(() => ({
  id: this.teamId(),
  fmt: this.format(),
}));

readonly data = rxResource({
  params: this.params,
  stream: ({ params }) => load(params),
});
```

</div>
</div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:40px 0 0;max-width:1600px;">Tracking only covers the synchronous run. After an <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">await</code>, a <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">setTimeout</code>, or a <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">then</code>, reads are invisible to the graph. The effect quietly stops reacting to half of what it uses.</p>

<!--
This one is nasty because it half works. The first dependency is tracked, so the effect does fire sometimes, which makes it look wired up. Then a change to the second value does nothing and you go looking for a bug in the render path. If you need async work driven by signal parameters, that is what the resource APIs are for - and they cancel superseded work for free, which the async effect also does not do.
-->

---
layout: content
eyebrow: 'Cleanup'
heading: 'Anything an effect starts, the effect must stop'
---
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:44px;align-items:center;">
<div>

```ts
readonly poll = effect((onCleanup) => {
  const id = this.orderId();
  const handle = setInterval(
    () => this.check(id),
    5_000,
  );

  onCleanup(() => clearInterval(handle));
});
```

</div>
<div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 28px;">Without <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">onCleanup</code>, changing the id starts a second interval and keeps the first. Nothing errors. The app just does more work every time, forever.</p>
<p style="font-size:29px;color:#8A97A8;line-height:1.45;margin:0;">Same for listeners, observers, animation frames and subscriptions. It runs before every rerun and once on destroy.</p>
</div>
</div>

<!--
The subtle part is that onCleanup runs before each rerun, not only on destroy. So it is not just teardown, it is "undo the previous run" - which is exactly what you want when the effect is keyed on something that changes. For DOM listeners, an AbortController gives you the same thing with one signal for the whole set.
-->

---
layout: section
number: '02'
transition: fade
---
## Dependencies

<p class="lead" style="margin-top:40px">The set is observed, not declared. That is where stale comes from.</p>

<!--
Chapter two is the stale family. Every bug in here is the same sentence: something changed and nobody was listening.
-->

---
layout: content
eyebrow: 'Two failure modes'
heading: 'A dependency set can be wrong in both directions'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:44px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:36px 42px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:22px;">TOO NARROW</div> <p style="font-size:30px;line-height:1.45;margin:0 0 20px;color:#C9D4E2;">Something the code genuinely uses is not tracked, so a real change never reruns the work.</p> <p style="font-size:28px;line-height:1.45;margin:0;color:#8A97A8;">Presents as: stale labels, stale selections, a panel that only updates if you touch something else first, back and forward navigation that changes nothing.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:36px 42px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:22px;">TOO WIDE</div> <p style="font-size:30px;line-height:1.45;margin:0 0 20px;color:#C9D4E2;">The work is keyed on more than it needs, so unrelated changes rerun expensive things.</p> <p style="font-size:28px;line-height:1.45;margin:0;color:#8A97A8;">Presents as: remeasuring on every keystroke, refetching on an unrelated toggle, layout work during typing.</p> </div> </div>
<div style="border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:36px;font-weight:500;color:#E8ECF2;line-height:1.3;">Key the work on what the result is actually made of. Not the whole object it came from, and not a convenient subset.</div>

<!--
Both directions turn up in review roughly as often as each other, and both are usually written by someone who had the right intention. Too narrow happens when you read through a helper or a service and do not realise the read was skipped. Too wide happens when you key an effect on a whole state object because it was easier than naming the four fields the measurement depends on.
-->

---
layout: content
eyebrow: 'Escape hatch'
heading: 'untracked() is a claim you have to defend'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">Wrapping a read in <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">untracked</code> says: this value is used, and I do not want a change to it to rerun this. It is sometimes exactly right, and it is also the easiest way in the language to build a permanently stale value.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:20px;">DEFENSIBLE</div> <p style="font-size:28px;line-height:1.5;margin:0 0 18px;color:#C9D4E2;">The rerun is driven by something outside the graph, and this read is only supplying context to it.</p> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">A write is being wrapped so it does not participate in the read that caused it.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">NOT DEFENSIBLE</div> <p style="font-size:28px;line-height:1.5;margin:0 0 18px;color:#C9D4E2;">It silences a loop you did not want to think about. The loop is the symptom, the shape is the cause.</p> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">It was added to make a test settle.</p> </div> </div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:40px 0 0;max-width:1600px;">If the write is already wrapped at every call site, the wrapper inside the shared helper is not protection, it is a second place for the rule to drift.</p>

<!--
Useful review question: if this value changed right now and nothing reran, would that be correct? If yes, untracked is right and should say so in a comment. If you have to think about it for more than a few seconds, it is a stale bug waiting for a customer to find it.
-->

---
layout: content
eyebrow: 'The invisible dependency'
heading: 'Non-reactive reads inside reactive code'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">A <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">computed</code> can only track signals. Read a value from something that is not a signal and you have taken a snapshot: correct once, then frozen, with no warning and no error.</p>
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
    labelKey: item.key,
  })),
);
// translate in the template, reactively
```

</div>
</div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:36px 0 0;max-width:1600px;">Same shape: an imperative getter on a service, a value read from storage, the current time, the current URL, or the contents of a DOM node. None of them notify.</p>

<!--
This is the highest-volume single bug in our review history and it is worth dwelling on, because the symptom looks like an i18n bug rather than a signals bug. Someone changes language, half the screen updates because it went through a pipe, and the other half does not because it was snapshotted into a computed. The general rule is the important part though: if the source cannot notify, do not read it inside derived state. Either bring it into the graph as a signal, or move the read to the point of render.
-->

---
layout: content
eyebrow: 'Discipline'
heading: 'A comment about reactivity is a testable claim'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:44px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <p style="font-size:29px;line-height:1.5;margin:0;color:#8A97A8;font-family:'JetBrains Mono',monospace;">// runs once per open</p> <p style="font-size:29px;line-height:1.5;margin:18px 0 0;color:#C9D4E2;">The dependency list said: every keystroke.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <p style="font-size:29px;line-height:1.5;margin:0;color:#8A97A8;font-family:'JetBrains Mono',monospace;">// reacts to the verified flag</p> <p style="font-size:29px;line-height:1.5;margin:18px 0 0;color:#C9D4E2;">The flag was read inside <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">untracked</code>.</p> </div> </div>
<p style="font-size:31px;color:#C9D4E2;line-height:1.45;margin:0;max-width:1600px;">Both of these were found in review by reading the comment and then checking whether the code agreed. It is a genuinely effective review technique, and it works because a comment about what something reacts to is the one comment that can be verified line by line.</p>

<!--
Two practical takeaways. If you write that comment, check it. And when you are reviewing, treat those comments as the first place to look rather than as documentation you can trust - they are where intent and implementation drift apart, and the drift is invisible in the diff.
-->

---
layout: section
number: '03'
transition: fade
---
## Timing

<p class="lead" style="margin-top:40px">When your code runs relative to inputs and to render.</p>

<!--
Chapter three is the one people find most surprising, because the code is correct in isolation and wrong in sequence.
-->

---
layout: content
eyebrow: 'Lifecycle'
heading: 'The constructor sees defaults, not inputs'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">Template-bound inputs are not set when the constructor runs. Any decision taken there sees the default value, and keeps that answer forever.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
readonly mode = input<'tree' | 'flat'>('tree');

constructor() {
  // always sees 'tree'
  if (this.mode() === 'tree') {
    this.startObserving();
  }
}
```

</div>
<div>

```ts
// PREFER
readonly mode = input<'tree' | 'flat'>('tree');

readonly observing = computed(
  () => this.mode() === 'tree',
);
// or act on it from a render-time hook
```

</div>
</div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:36px 0 0;max-width:1600px;">This one is especially good at hiding, because the default is often the common case. The code appears to work, and the comment above it describes behaviour that never happens.</p>

<!--
We have shipped this more than once and it took a careful reviewer to spot it both times. Note the second-order damage: the guard that was supposed to avoid allocating observers for the cheap layouts never fired, so every instance paid for machinery the comment promised it would skip. If a decision depends on an input, it belongs in derived state or in a hook that runs after inputs are set.
-->

---
layout: content
eyebrow: 'Render phases'
heading: 'DOM work belongs to a render phase'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">An <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">effect</code> can run before the DOM it wants to touch exists, so the write lands on the old view or on nothing. A raw animation frame is worse: it opts out of Angular's coordination altogether.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
effect(() => {
  this.selectedId();
  this.pane().scrollTop = 0;
});
```

</div>
<div>

```ts
// PREFER
afterRenderEffect({
  write: () => {
    this.selectedId();
    this.pane().scrollTop = 0;
  },
});
```

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:36px 0 0;max-width:1600px;">And when a render-time effect drives layout, the dependency set has to include everything that changes the geometry, including content that arrives later from a deferred block.</p>

<!--
The deferred-content case is worth calling out separately because it is not obvious: your effect tracks the anchor and the content, both settle, you position the overlay, and then a deferred chunk swaps a placeholder for the real thing and the height you measured is wrong. Nothing in the dependency set changed, so nothing reran. You either need to observe the size or track the thing that signals the swap.
-->

---
layout: content
eyebrow: 'Render phases'
heading: 'Pick the phase, do not take the default'
---
<div class="compare" style="grid-template-columns:0.5fr 1fr 1fr;margin-bottom:40px;"> <div class="head">PHASE</div> <div class="head teal">FOR</div> <div class="head">CONSTRAINT</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">earlyRead</code></div> <div>Measuring, before anything writes</div> <div>Never write here</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">write</code></div> <div>Mutating the DOM</div> <div>Never read layout here</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">mixedReadWrite</code></div> <div>The default, and the reason to be explicit</div> <div>Only when unavoidable</div> <div class="row-label last"><code style="font-family:'JetBrains Mono',monospace;">read</code></div> <div class="last">Inspecting after all writes</div> <div class="last">Never write here</div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">Reads and writes in the same phase force the browser to recompute layout between them. Splitting them is usually a two-line change, and the phases run in a fixed order so the data flows from one to the next.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:0;max-width:1600px;">A measurement taken once inside a phase is not reactive either. If the thing being measured can resize on its own, observe it.</p>

<!--
The default phase is the trap: it works, so nobody changes it, and you pay a forced synchronous layout for every run. The other half of this slide is the one-shot measurement - reading an element height inside a render effect gives you the height at that moment, and if the element can change size without any signal changing, you will never hear about it. That is what a resize observer is for, torn down properly.
-->

---
layout: content
eyebrow: 'Forced reflow'
heading: 'Read everything, then write everything'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 28px;max-width:1600px;">A read after a write forces the browser to recompute layout there and then, instead of once before the next paint. Interleave them in a loop and you pay for it on every iteration.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID: a reflow per row
afterNextRender(() => {
  for (const r of this.rows()) {
    const h = r.el.offsetHeight;   // read
    r.el.style.height = `${h + 8}px`; // write
  }
});
```

</div>
<div>

```ts
// PREFER: one read pass, one write pass
afterNextRender({
  earlyRead: () =>
    this.rows().map((r) => r.el.offsetHeight),
  write: (h) => {
    this.rows().forEach((r, i) => {
      r.el.style.height = `${h[i] + 8}px`;
    });
  },
});
```

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:36px 0 0;max-width:1650px;">The phases hand their result to the next one, so the split costs nothing in structure. <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">afterNextRender</code> for setup that happens once, <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">afterRenderEffect</code> when it has to rerun - same phases, and the effect version hands the next phase a signal rather than a value.</p>
<p style="font-size:28px;color:#5E6B7D;line-height:1.45;margin:20px 0 0;max-width:1650px;">Reads that force layout: <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">offsetHeight</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">clientWidth</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">scrollTop</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">getBoundingClientRect()</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">getComputedStyle()</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">scrollIntoView()</code>, even <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">focus()</code>. Cheap once, and multiplied by every row, cell or widget on the page.</p>

<!--
This is the concrete version of the phase table. Two things worth stressing. First, the cost is not the read - the read is usually necessary - it is the ordering, so batching is the whole fix. Second, where the code sits decides how much it costs: an unbatched read in something rendered once is nothing, and the same read in a per-row component or a per-item directive becomes one reflow per instance on a page with hundreds of them. And if a resize observer already handed you the box, use it rather than asking the DOM again.
-->
---
layout: section
number: '04'
transition: fade
---
## Purity and cost

<p class="lead" style="margin-top:40px">Derived state is read often, and at unpredictable times.</p>

<!--
Chapter four. Nothing here is a correctness bug on the first run, which is exactly why it survives to production.
-->

---
layout: content
eyebrow: 'Purity'
heading: 'A computed may run at any time, or never'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">You do not control when derived state evaluates, how often, or whether it evaluates at all. So it must not do anything you would care about the timing of.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:18px;">MUTATES SOMETHING</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">Injecting a stylesheet, writing to storage, registering a handler. The graph is not a place to cause things.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:18px;">OWNS A LIFETIME</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">Constructing something that holds a worker, a socket or a subscription. Recomputing replaces it and nothing disposes the old one.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:18px;">READS THE DOM</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">The DOM does not notify, so the value is a snapshot, and reading layout during a render pass is its own problem.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:44px 0 0;max-width:1600px;">If something needs creating and disposing, that is a lifecycle concern. Give it an owner that can tear it down.</p>

<!--
The lifetime case is the one that bites hardest, because it is invisible until the source changes twice. First evaluation creates the expensive thing. Source changes, second evaluation creates another one, and the first is still running with nobody holding a reference to stop it. Under load, that is a leak that looks like a performance problem.
-->

---
layout: content
eyebrow: 'Identity'
heading: 'Reference equality is the notification boundary'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">Signals compare with reference equality by default. Return a fresh object or array and every consumer is told it changed, even when the contents are identical.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID: new array every read
protected held(): string[] {
  return this.dragging()
    ? [this.dragged()]
    : [];
}
```

</div>
<div>

```ts
// PREFER: cached identity
readonly held = computed(() =>
  this.dragging() ? [this.dragged()] : [],
);
```

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:36px 0 0;max-width:1600px;">Bound to something that does real work with the value, the left-hand version invalidates that work on every check. Where a derived value is a collection whose contents matter more than its identity, a custom equality function is the tool.</p>

<!--
This is the slide that explains a whole class of mystery performance problems: a virtualiser recalculating ranges, a chart rebuilding series, a grid recreating column definitions, all because something upstream hands out a new array each time it is asked. And note the direction of the fix - a computed is not just tidier, the caching is the feature.
-->

---
layout: content
eyebrow: 'Templates'
heading: 'Templates call. Computeds cache.'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">A method call in a binding runs on every check of that view, including checks caused by something completely unrelated. A signal read is a cache lookup.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```html
<!-- AVOID -->
<a [href]="buildUrl(row.id, row.envs)">
  {{ formatNextRun(nextRunAt()) }}
</a>
```

</div>
<div>

```html
<!-- PREFER -->
@let view = rowView();
<a [href]="view.url">{{ view.nextRun }}</a>
```

</div>
</div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:36px 0 0;max-width:1600px;">Precompute the whole row view once, bind to its fields. This is also the cheapest fix on the list: it is a move, not a redesign.</p>

<!--
Two practical notes. First, "unrelated" is the important word - a resource resolving somewhere else in the component causes a check, and your date formatting runs again for every visible row. Second, @let is the tool for naming a repeated deep read in a template, and it is also how you subscribe to an async pipe once instead of once per usage.
-->

---
layout: section
number: '05'
transition: fade
---
## Async state

<p class="lead" style="margin-top:40px">Loading, empty, error, and the difference between them.</p>

<!--
Chapter five is where the user-visible damage is worst. Every finding in this chapter shipped something that looked fine and was lying.
-->

---
layout: content
eyebrow: 'Resources'
heading: 'The default shape for a signal-driven read'
---
<div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:44px;align-items:start;">
<div>

```ts
readonly teamId = input.required<string>();

readonly users = httpResource<User[]>(() => ({
  url: `/api/teams/${this.teamId()}/users`,
}));
```

</div>
<div>
<div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:20px;">YOU GET, FOR FREE</div> <p style="font-size:28px;line-height:1.5;margin:0 0 14px;color:#C9D4E2;">Refetch when the parameters change</p> <p style="font-size:28px;line-height:1.5;margin:0 0 14px;color:#C9D4E2;">Cancellation of superseded requests</p> <p style="font-size:28px;line-height:1.5;margin:0 0 14px;color:#C9D4E2;">Loading, error and status as signals</p> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">No race between two in-flight responses</p> </div>
</div>
</div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:40px 0 0;max-width:1600px;">Reads driven by signals belong in a resource. Writes do not: a POST or DELETE is an action with a moment, not a value with parameters, so it stays on the HTTP client.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:24px 0 0;max-width:1600px;">And a shared component should take the finished list, not the resource. The consumer may want to derive its input from a resource, or from three, or from none.</p>

<!--
The last line is a real design argument that came up in review and was settled the right way: taking a resource as an input couples a shared component to one data-loading mechanism. Take the value. Let the consumer decide where it came from.
-->

---
layout: content
eyebrow: 'States'
heading: 'Four states, not two'
---
<div class="compare" style="grid-template-columns:0.6fr 1fr 1fr;margin-bottom:40px;"> <div class="head">STATE</div> <div class="head teal">MEANS</div> <div class="head">GETS RENDERED AS</div> <div class="row-label">loading</div> <div>The answer is not known yet</div> <div>A skeleton, not an empty state</div> <div class="row-label">value</div> <div>The answer is known, and may be empty</div> <div>Content, or a real empty state</div> <div class="row-label">error</div> <div>The answer is unknown and will not arrive</div> <div>An error, with a way to retry</div> <div class="row-label last">undefined</div> <div class="last">There is no answer to ask for yet</div> <div class="last">Usually the same as loading</div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">Collapsing any two of these produces a bug that testers cannot reproduce and users report as "it showed nothing".</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:0;max-width:1600px;">Worth knowing: when parameters become <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">undefined</code>, the previous value is discarded. If a transient gap in the parameters is reachable, the list will empty itself on the way through.</p>

<!--
The parameters-going-undefined case is a good example of a finding worth understanding even when it turns out not to be reachable. The mechanism is real. Whether it can happen depends on whether that intermediate state exists in your flow, and that is the question to answer in review rather than patching defensively.
-->

---
layout: content
eyebrow: 'The silent failure'
heading: 'A failed request that renders as no data'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">This is the most common async finding we file, in several disguises. All of them turn "we do not know" into "there is nothing".</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
this.load().pipe(
  catchError(() => of([])),
);
```

</div>
<div>

```ts
// AVOID
readonly url = computed(() =>
  this.data.hasValue()
    ? build(this.data.value())
    : '',   // link silently vanishes
);
```

</div>
</div>
<div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 38px;margin-top:36px;"> <p style="font-size:30px;line-height:1.45;margin:0;color:#C9D4E2;">Keep the error a distinct state all the way to the template. An empty list, a zero, a dash and a missing button are all valid renderings of real data, so none of them can carry the meaning "this failed".</p> </div>

<!--
The disguises are worth listing because they all read as defensive good practice: catchError to an empty array, a default value so the template does not have to branch, treating no-value as no-data, and a ternary that returns an empty string. In every case the code stops throwing and starts lying. Also note the opposite failure on the same line: reading value() while a resource is in its error state throws, and if that read is inside a computed, the exception poisons everything downstream of it.
-->

---
layout: content
eyebrow: 'Composition'
heading: 'Two resources, one screen'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:40px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">HALF-WIRED STATE</div> <p style="font-size:28px;line-height:1.5;margin:0 0 16px;color:#C9D4E2;">An aggregate <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">error</code> that reads only one of the two sources reports success while half the data is missing.</p> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">A retry that reloads only one of them can never recover the other.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">AND / OR</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Requiring <em>both</em> to fail before showing an error means one failure renders as a legitimate "not available". Ask which combination the user should be warned about, then pick the operator deliberately.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">Two resources over the same parameters are also two requests. Nothing deduplicates them for you, so if both are heavy, share one owner.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:0;max-width:1600px;">A resource lives as long as the injector that created it. Destroy a component-scoped service while something it fed is still on screen, and that thing is frozen from then on.</p>

<!--
The lifetime line is worth landing with a concrete picture: a drawer opens, it reads from a panel-scoped service, the user switches tabs behind it, the panel is destroyed, the resource is cancelled, and the still-open drawer keeps showing its loading state forever. Nothing errors, nothing logs. The fix is to decide who owns the request and scope it to the thing that outlives the interaction.
-->

---
layout: section
number: '06'
transition: fade
---
## Boundaries

<p class="lead" style="margin-top:40px">What a signal exposes, and to whom.</p>

<!--
Chapter six is the cheap chapter. These findings take a minute to fix and keep coming back, which makes them a good candidate for habit rather than review.
-->

---
layout: content
eyebrow: 'Visibility'
heading: 'Template-only state is not public API'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:40px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;margin-bottom:18px;">protected readonly</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Anything the template reads and nothing outside needs: derived state, signal queries, view helpers.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;margin-bottom:18px;">#private</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Anything neither the template nor a consumer touches. Enforced at runtime, not just by the compiler.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">A public writable signal is an invitation. Somebody will accept it, from a place you did not plan for, and then the invariant you were maintaining has two owners.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:0;max-width:1600px;">Tests are not a reason to widen visibility. Reaching past <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">protected</code> with bracket access is a test smell, not an access strategy.</p>

<!--
Templates can read protected members, which is the whole reason protected is the right default here rather than public. The one to watch in review is a signal that is public purely because it was written that way first - it costs nothing to narrow before merge and it is a breaking change to narrow afterwards.
-->

---
layout: content
eyebrow: 'Immutability'
heading: 'Signals do not make your data immutable'
---
<div style="display:grid;grid-template-columns:1.05fr 0.95fr;gap:44px;align-items:center;">
<div>

```ts
// AVOID
readonly items: Signal<Item[]> = this.#items;

// a consumer can do this:
service.items().pop();
service.items()[0].label = 'edited';
```

</div>
<div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 24px;">The signal protects the reference, not the contents. A cached array handed across a boundary can be mutated in place, and nothing notifies, so later readers see the edit and the graph never hears about it.</p>
<p style="font-size:29px;color:#8A97A8;line-height:1.45;margin:0;">Type the boundary as <code style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;">Signal&lt;readonly Item[]&gt;</code>, and hand out data the caller cannot edit underneath you.</p>
</div>
</div>

<!--
Worth spelling out the failure, because it is unusual: this is not a stale bug, it is the opposite. The mutation is visible immediately to everybody who reads the cached array, and completely invisible to the reactive graph. So the UI and the state disagree with no changed reference anywhere for anyone to notice.
-->

---
layout: content
eyebrow: 'Restraint'
heading: 'Not everything wants to be a signal'
---
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-bottom:40px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">FIXED AT CREATION</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">Data that cannot change while the view is alive does not need to be writable. Making it writable invents a state transition nobody handles.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">DERIVED FROM ONE THING</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">A computed that just renames another signal is a second place to read from, and a chance for the two to disagree.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">NAME THE MEANING</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">Derived state names a concept, so name the concept and not the mechanism. Reviewers read the name before the formula.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0;max-width:1600px;">The reactive question to ask about any new signal: what writes this, and when? If the honest answer is "nothing, ever", it is a constant.</p>

<!--
The mid-session flip is the concrete risk on the first card. If a dialog is seeded once from the data it was opened with, turning that into live writable state means a change halfway through the interaction can send the wrong shape of request. It is the kind of bug that only happens to a real user, once, and is never reproduced.
-->

---
layout: section
number: '07'
transition: fade
---
## Testing

<p class="lead" style="margin-top:40px">Reactive code fails in ways that make tests pass.</p>

<!--
Chapter seven, and short. The point of this one is that a signals bug can hide behind a green test just as easily as behind a working screen.
-->

---
layout: content
eyebrow: 'Settling'
heading: 'Wait for a state, not for a number of ticks'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
for (let i = 0; i < 6; i++) {
  TestBed.tick();
  await Promise.resolve();
}
expect(state.rows()).toHaveLength(2);
```

</div>
<div>

```ts
// PREFER
await vi.waitFor(() =>
  expect(state.rows()).toHaveLength(2),
);
```

</div>
</div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:40px 0 0;max-width:1600px;">A fixed number of flushes encodes today's scheduling. One extra turn, one delayed response, and the assertion runs against the initial state and passes for the wrong reason.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:24px 0 0;max-width:1600px;">Also: after mutating a component imperatively rather than through its inputs, nothing has told Angular to check the view. Flush before asserting on the DOM.</p>

<!--
The failure mode here is the dangerous kind: a test that passes when the feature is broken. It waits six turns, the resource settles on the seventh, the assertion sees the initial empty state, and the expectation happened to match it. Predicate-based waiting removes the guess entirely.
-->

---
layout: content
eyebrow: 'Readiness'
heading: 'A readiness signal that can never arrive'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">Waiting for a count to become non-zero works right up until zero is the correct answer. Then the test hangs, times out, and gets reported as a product bug in whatever it was pointing at.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">AMBIGUOUS</div> <p style="font-size:29px;line-height:1.5;margin:0;color:#C9D4E2;">"Has it produced results yet?" cannot distinguish a finished empty pass from a pass that never ran.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:20px;">UNAMBIGUOUS</div> <p style="font-size:29px;line-height:1.5;margin:0;color:#C9D4E2;">"Has it finished?" A status, a settled state, an explicit first-emission flag. Empty is then a result like any other.</p> </div> </div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:40px 0 0;max-width:1600px;">A timeout is a diagnosis to start from, not a verdict. Check the interaction, the locator and the setup before you conclude the component is broken.</p>

<!--
Same idea as the four-states slide, applied to test infrastructure. If your readiness check cannot tell the difference between "nothing happened" and "nothing was there", you have a test that can only pass for non-empty data - which is usually the case that already worked.
-->

---
layout: section
number: '08'
transition: fade
---
## Signal Forms

<p class="lead" style="margin-top:40px">The same ideas, applied to the one API built entirely on them.</p>

<!--
Last chapter, and a shorter one than it wants to be. Signal Forms deserves its own session - the point of including it here is that everything in the previous seven chapters is why it looks the way it does. Derived state instead of synchronisation, rules that declare what they depend on, one source of truth instead of two.
-->
---
layout: content
eyebrow: 'Introduction'
heading: 'A third forms API, built on signals'
---
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0 0 52px;max-width:1550px;">Signal Forms became stable in v22 - public API, semver-protected, still growing. You keep your data in a signal, pass it to <code style="font-family:'JetBrains Mono',monospace;font-size:29px;color:#2FD8B4;">form()</code>, and get a form back - no control tree to build and keep in sync.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Your own data is the form's data, and everything the form knows about a field is a signal.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS NOT</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A migration. Reactive forms still work, and so do the controls we have already built - but new forms should use signal forms.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT CHANGES</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Static validators become reactive rules. A rule knows when it applies and which fields it depends on, so nothing is added or removed by hand.</p> </div> </div>

<!--
Orientation before we go near the API. Signal Forms became stable in v22 - public API, semver-protected, still growing. It is not a replacement - reactive forms are still supported and still fine for plenty of screens. The difference is that the form is built around ordinary signal-based data instead of a separate control tree.
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
Three pieces. Data lives in a normal writable signal. We pass it to form(). We bind controls with [formField]. The important point: loginModel is not a separate DTO sitting beside the form - it is the actual editable data.
-->
---
layout: content
eyebrow: 'Side by side'
heading: 'The same form in both APIs'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 40px;max-width:1400px;">We construct a separate control tree, then bind controls from that tree into the template.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:20px 36px;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:22px;">REACTIVE FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#8A97A8;"> <div><span style="color:#8577CF;">readonly</span> <span>loginForm</span> = <span style="color:#8577CF;">new</span> FormGroup({</div> <div style="padding-left:1.2em;">email: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>),</div> <div style="padding-left:1.2em;">password: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>),</div> <div>});</div> </div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:22px;">SIGNAL FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">readonly</span> <span>loginModel</span> = <span style="color:#7CC4FF;">signal</span>({</div> <div style="padding-left:1.2em;">email: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:1.2em;">password: <span style="color:#2FD8B4;">''</span>,</div> <div>});</div> <div style="height:0.85em;"></div> <div><span style="color:#8B7CF6;">readonly</span> <span>loginForm</span> = <span style="color:#7CC4FF;">form</span>(<span style="color:#8B7CF6;">this</span>.loginModel);</div> </div> </div> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:28px 36px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#8A97A8;"> <div>&lt;input [formControl]=<span style="color:#3FBFA2;">"loginForm.controls.email"</span> /&gt;</div> <div>&lt;input [formControl]=<span style="color:#3FBFA2;">"loginForm.controls.password"</span> /&gt;</div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:28px 36px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#C9D4E2;"> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.email"</span> /&gt;</div> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.password"</span> /&gt;</div> </div> </div>
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:40px 0 0;max-width:1500px;">The bigger difference appears when data needs to move into and out of forms, or when fields depend on other fields.</p>
<p style="font-size:30px;color:#5E6B7D;line-height:1.4;margin:40px 0 0;">And for a form this simple, there really isn't much wrong with this.</p>

<!--
At this point the main difference is architectural rather than dramatic. If all our forms were two inputs with no real behaviour, this workshop would be very short.

Anchor against something familiar. Do not mark anything red - we are not trying to make Reactive Forms look bad. For a form this simple there really isn't much wrong with this.
-->
---
layout: content
eyebrow: 'Validation · conditional required'
heading: 'Describe the rule, not the response'
clicks: 2
---
<div class="code-hero">

````md magic-move
```ts
notify.valueChanges
  .pipe(
    startWith(notify.value),
    takeUntilDestroyed(),
  )
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
required(p.email, {
  when: ({ valueOf }) => valueOf(p.notify),
});
```
````

</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:48px;" v-click="2"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:18px;">REACTIVE FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#8A97A8;">listen → inspect → mutate → recalculate</div> </div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:18px;">SIGNAL FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#E8ECF2;">describe the relationship</div> </div> </div>
<div style="border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:40px;font-weight:500;color:#E8ECF2;" v-click="2">Describe the rule instead of orchestrating the response.</div>


<!--
The requirement: email is required only when the user opts in to notifications. One of the most important scenes in the presentation. We don't subscribe. We don't add a validator. We don't remove one. We don't tell email to recalculate. We describe the rule.
-->
---
layout: content
eyebrow: 'Custom controls · after'
heading: 'Implement an interface, declare a signal'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">The <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">[formField]</code> directive detects the interface and binds the field's value to your <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#C9D4E2;">value</code> model. No provider, no callbacks.</p>
<div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:center;"> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:32px 38px;font-family:&#x27;JetBrains Mono&#x27;,monospace;font-size:24px;line-height:1.65;color:#C9D4E2;"> <div>@Component({</div> <div style="padding-left:1.2em;">selector: <span style="color:#2FD8B4;">'app-custom-input'</span>,</div> <div style="padding-left:1.2em;">template: <span style="color:#2FD8B4;">`</span></div> <div style="padding-left:2.4em;">&lt;input [value]=<span style="color:#2FD8B4;">"value()"</span></div> <div style="padding-left:3.6em;">(input)=<span style="color:#2FD8B4;">"value.set($event.target.value)"</span></div> <div style="padding-left:3.6em;">(blur)=<span style="color:#2FD8B4;">"touch.emit()"</span> /&gt;</div> <div style="padding-left:1.2em;"><span style="color:#2FD8B4;">`</span>,</div> <div>})</div> <div><span style="color:#8B7CF6;">export class</span> <span style="color:#7CC4FF;">CustomInput</span> <span style="color:#8B7CF6;">implements</span> FormValueControl&lt;string&gt; {</div> <div style="padding-left:1.2em;">value = <span style="color:#7CC4FF;">model</span>(<span style="color:#2FD8B4;">''</span>);</div> <div style="padding-left:1.2em;">touch = <span style="color:#7CC4FF;">output</span>&lt;<span style="color:#8B7CF6;">void</span>&gt;();</div> <div>}</div> </div> <div style="display:flex;flex-direction:column;gap:24px;"> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;margin-bottom:10px;">REQUIRED SURFACE</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">A <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">value</code> model signal. Checkbox-style controls implement <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">FormCheckboxControl</code> with <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">checked</code> instead - never both.</p> </div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:10px;">OPTIONAL STATE INPUTS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#C9D4E2;"> <div>errors  invalid  pending</div> <div>disabled  disabledReasons  readonly  hidden</div> <div>touched  dirty  name</div> <div>required  min  max  minLength  maxLength  pattern</div> </div> <p style="font-size:25px;line-height:1.4;margin:14px 0 0;color:#8A97A8;">Declare only the ones the control uses. There is also <span style="color:#C9D4E2;">focus()</span> and <span style="color:#C9D4E2;">reset()</span> - no <span style="color:#FF7A6B;">valid</span>, so declaring one silently never updates.</p> </div> <p style="font-size:27px;line-height:1.4;margin:0;color:#8A97A8;">The schema validates. The control displays the result.</p> </div> </div>

<!--
The same control against Signal Forms: implement FormValueControl and declare a value model signal. That is the required surface. The formField directive detects the interface and binds the field's value to it. Add a touch output if you want blur tracking, and any of the optional state inputs the control actually uses. Two rules: a FormValueControl must not have a checked property, and a FormCheckboxControl must not have a value property. Note there is no valid input - TypeScript lets you declare one because extra members are permitted when implementing an interface, and it then never updates. And do not put validation logic in the control - the schema validates, the control displays.
-->

---
layout: content
eyebrow: 'Footguns'
heading: 'Four that catch everybody'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:18px;">THE SCHEMA IS NOT AN EFFECT</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">The callback builds the rules once. A plain <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">if</code> around a rule is evaluated at construction and never again. Conditions belong inside the rule.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:18px;">MISSING MEANS ABSENT</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">A field left out of the model is not in the tree. The rule type-checks, never runs, and the form reports itself valid. Initialise every field you want.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:18px;">SHAPE IS STRUCTURE</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">The tree follows the model, so swapping one object shape for another destroys field state. Keep a stable shape and switch behaviour with rules. Arrays are the exception.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:18px;">VALIDATION IS NOT THE BROWSER'S</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">Validity lives in the field tree, not in native validity, and the old status classes are opt-in. CSS keyed on them stops applying, silently.</p> </div> </div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:40px 0 0;max-width:1600px;">Also worth knowing: <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">required</code> treats an empty array as present, class instances lose their prototype on the first write, and hidden or disabled fields do not validate and do not count towards the parent.</p>

<!--
Two of these are the same lesson as the rest of the deck in different clothes. The schema callback not being reactive is the constructor-sees-defaults problem again: code that runs once, in a place that looks reactive. And a rule that silently never runs is the silent-failure problem again: no error, no warning, form says valid.
-->

---
layout: content
eyebrow: 'Guidance'
heading: 'What we do about it'
---
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:20px;">NEW FORMS</div> <p style="font-size:29px;line-height:1.45;margin:0;color:#C9D4E2;">Signal Forms. It is stable, it is semver-protected, and it is where the framework is going.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">EXISTING FORMS</div> <p style="font-size:29px;line-height:1.45;margin:0;color:#C9D4E2;">Leave them. Reactive Forms are supported and fine. Migrate when the form is being changed anyway, not as a project.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">EXISTING CONTROLS</div> <p style="font-size:29px;line-height:1.45;margin:0;color:#C9D4E2;">They keep working. Bridges exist in both directions, so a signal form can hold reactive controls and the reverse.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:48px 0 0;max-width:1600px;">Be careful with examples online. The API was renamed repeatedly through its experimental phase, so a lot of material published before v22 uses names that no longer exist.</p>

<!--
Say plainly that this is not a migration mandate, because that is the question everyone in the room is actually holding. New forms use the new thing. Nothing existing needs rewriting. And if you are following a blog post and something does not exist, check the version - the churn was real, and it is over.
-->

---
layout: section
number: '09'
transition: fade
---
## In review

<p class="lead" style="margin-top:40px">The whole deck as questions you can ask about a diff.</p>

<!--
This is the slide to photograph. Everything else was explanation.
-->

---
layout: content
eyebrow: 'Checklist'
heading: 'Symptom, and what to reach for'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:start;"> <div><div class="compare" style="grid-template-columns:1fr 1.1fr;font-size:24px;"> <div class="head">IF YOU SEE</div> <div class="head teal">REACH FOR</div> <div class="row-label">An effect that writes a signal</div> <div class="new"><code style="font-family:'JetBrains Mono',monospace;">computed</code>, or <code style="font-family:'JetBrains Mono',monospace;">linkedSignal</code></div> <div class="row-label">An effect that writes another component's signal</div> <div class="new">An input, or an explicit method on the owner</div> <div class="row-label">An <code style="font-family:'JetBrains Mono',monospace;">await</code> inside an effect</div> <div class="new">A resource keyed on a computed of the parameters</div> <div class="row-label">A non-signal read inside derived state</div> <div class="new">Bring it into the graph, or read it at render time</div> <div class="row-label">A decision taken in a constructor</div> <div class="new">Derived state, or a post-input hook</div> <div class="row-label last">A DOM write in a plain effect</div> <div class="new last"><code style="font-family:'JetBrains Mono',monospace;">afterRenderEffect</code> with a phase</div> </div></div> <div><div class="compare" style="grid-template-columns:1fr 1.1fr;font-size:24px;"> <div class="head">IF YOU SEE</div> <div class="head teal">REACH FOR</div> <div class="row-label">A fresh array or object per read</div> <div class="new">A <code style="font-family:'JetBrains Mono',monospace;">computed</code>, so identity is cached</div> <div class="row-label">A method call in a binding</div> <div class="new">A precomputed view object, bound field by field</div> <div class="row-label">An error mapped to an empty value</div> <div class="new">A distinct error state, carried to the template</div> <div class="row-label">Side effects in derived state</div> <div class="new">An owner that can also tear it down</div> <div class="row-label">A public writable signal</div> <div class="new"><code style="font-family:'JetBrains Mono',monospace;">protected readonly</code>, readonly at boundaries</div> <div class="row-label last">A fixed number of ticks in a test</div> <div class="new last">A predicate the test can wait on</div> </div></div></div>

<!--
Read two or three of these out and then move on - the value is in having it written down, not in narrating it. The single highest-frequency row is the first one, and the single most damaging row is the error one.
-->

---
layout: content
center: true
---
<div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.18em;text-transform:uppercase;color:#2FD8B4;margin-bottom:36px;">One thing to take away</div>
<h2 style="font-size:64px;line-height:1.15;margin:0 0 44px;max-width:1600px;">These bugs do not throw. They render.</h2>
<p style="font-size:32px;color:#8A97A8;line-height:1.5;margin:0;max-width:1500px;">Nothing in this deck fails loudly. A stale label, an empty list, a chart of zeroes and a form that says it is valid all look like working software. That is why the habits matter more than the review: by the time it reaches review, it already looks fine.</p>

<!--
Close on this rather than on a summary. The reason we keep shipping these is not that they are hard to fix, it is that they are invisible when they work and invisible when they do not. Then open it up for questions.
-->
