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
Signals aren't new to anyone in this room, and adoption isn't our problem - the codebase is overwhelmingly signal-based already. What keeps happening instead is a small set of mistakes, made over and over, in code that looks completely reasonable when you read it. That's what I want to spend our time on: those mistakes, and the shape of the fix in each case.
-->

---
layout: content
eyebrow: 'Framing'
heading: 'Adoption is done. Fluency is not.'
---
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0 0 44px;max-width:1600px;">We write signals everywhere. The reactivity findings that come back in review are not typos - they are code that reads correctly and behaves incorrectly, in three recognisable shapes.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">STALE</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Something read a value once and never heard that it changed. The UI is simply wrong, and nothing errors.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">WASTEFUL</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Correct, and doing the work again on every pass. Rebuilt objects, repeated formatting, the same request twice.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">SILENT</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A failure was flattened into an empty value, so the screen renders a confident, believable lie.</p> </div> </div>
<p style="font-size:30px;color:#5E6B7D;line-height:1.45;margin:44px 0 0;max-width:1600px;">Stale is a dependency problem, wasteful is an identity problem, silent is a state-modelling problem. Every chapter after this one is one of these three.</p>

<!--
Let me tell you where these three come from, because I don't want you taking them on trust. I took a sample of our own pull request review comments, pulled out the ones that talk about reactivity, and sorted them by what was actually going wrong. Stale language dominates. Wasted or repeated work is close behind. Silent failure comes third. I'm deliberately not telling you these are the most common findings in our review process overall, because they aren't - across every comment we write, the big categories are guideline violations, logical bugs, missing test coverage, and comments that no longer match the code. Reactivity is a large and expensive slice of that pile, not the majority of it. One more thing before we move on: you'll notice races aren't on this list. They feel like they belong, and I expected them to be there, but when I looked properly they barely show up in our reactivity findings at all.
-->

---
layout: content
eyebrow: 'Mental model'
heading: 'Signals pull. They do not push.'
---
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-bottom:44px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">LAZY</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">computed</code> does not run when its source changes. It runs when somebody reads it, and only if something it depends on actually changed.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">GLITCH-FREE</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Readers never see a half-updated graph. There is no intermediate state to defend against, so no ordering to coordinate by hand.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">TRACKED AT RUNTIME</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Dependencies are whatever you read during this run, so a branch or an early return changes the set. After an <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">await</code> there is no set at all - tracking has already ended.</p> </div> </div>
<div style="border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:500;color:#E8ECF2;line-height:1.3;">Almost every pitfall in this deck is one of these three, met head on.</div>

<!--
I want to slow down on the third one, tracked at runtime, because it's the root of the whole stale family. You never declare what a computed depends on. Angular watches which signals you actually read while the function runs, and that set of reads is the dependency set - for that run only. Two things follow from that, and we'll keep coming back to both. If you read a value behind a condition, it's only a dependency on the runs where the condition let you get to it. And if you read a value outside a reactive context, or after the function has already handed control back, it isn't a dependency at all.
-->

---
layout: section
number: '01'
transition: fade
---
## Derived state

<p class="lead" style="margin-top:40px">Where the largest share of review findings live.</p>

<!--
This chapter is the biggest cluster in the review comments I looked at, and it isn't close. If we only change one habit as a team when we walk out of here, I'd want it to be this one.
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
<p style="font-size:29px;color:#8A97A8;line-height:1.45;margin:32px 0 0;max-width:1600px;">Most of us stop at the middle card. The one on the right is the one we skip - and that is where the largest cluster of our review findings comes from.</p>

<!--
Everybody in this room reaches for signal correctly, and everybody reaches for computed correctly. Where we fall down is the third card. We use linkedSignal about a third as often as we use the workaround it replaces - so when a value is derived but also has to stay writable, what we reach for instead is an effect, and that is precisely where the largest cluster of our review findings comes from.

So the way I'd use this slide is left to right. Is anything deriving this value? No - then it's a signal, and you're done. Yes, and nothing else is allowed to overwrite the answer - that's a computed. Yes, but the user can also overwrite it - that's linkedSignal, and that's the card I want you to actually remember, because it's the one we forget exists.

And effect is deliberately not in that row. It isn't a fourth option in the same list, because it doesn't hold a value at all. It's the exit from the graph into something that isn't reactive, and we'll come back to what it's genuinely good for in a few slides.
-->

---
layout: content
eyebrow: 'The pattern'
heading: 'An effect that writes a signal is a computed you maintain by hand'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">An effect reads reactive state and writes reactive state. Everything is signals, so it feels reactive. It is not: it is a manual subscription that happens to be spelled with signals.</p>
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
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:40px 0 0;max-width:1600px;">The version on the left lands after the view that caused it has already been checked, and forces Angular to check that view a second time. It is also writable by anything, and it rebuilds the array whether or not the answer changed.</p>

<!--
Let me actually say why the left is worse, because "the rule says so" has never changed anybody's habits. There are four things going wrong here. First, it lands late - the effect runs after the view that triggered it has already been checked, so everything that read the value during that pass read the old one, and Angular has to come back round before the screen agrees with itself. Second, it's a writable signal, so anything in the class can set it, and the invariant you think you have isn't enforced anywhere. Third, there's no cached identity: the array gets rebuilt whether or not the answer actually changed, so everything downstream reruns. And fourth, that catch-up pass costs you real work every single time the input changes. The version on the right can't drift, because there is nothing to keep in sync.
-->

---
layout: content
eyebrow: 'Derived, and writable'
heading: 'When the user can override the derived value'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">The page resets to one whenever the filter changes - so it is derived. The pager buttons also move it - so it is writable. Both of those have to be true at once, and that is not a gap in the API. That is <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">linkedSignal</code>.</p>
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
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:40px 0 0;max-width:1600px;">Both versions page the same way. The difference is that on the right, the reset and the writes are the same signal - so there is nothing to keep in sync.</p>

<!--
Look at what the pager methods do to this. If page were only ever derived from the filter, a computed would be the end of the story - but next and prev have to write to it, and a computed will not let you. So people reach for a plain signal, and now nothing resets it when the filter changes, so they add an effect to do the resetting by hand. That is how you end up with the version on the left, and every step of that reasoning is sensible.

linkedSignal is the answer to exactly this shape. It is derived, so the filter changing resets it to page one for free. And it is writable, so next and prev work on it like any other signal. Notice the two methods are identical on both sides - the only thing that changes is where the reset lives.

The tell, when you are reading your own code, is a sentence with "but" in it. It is derived, but the user can change it. Selected row, current page, active tab, a form field seeded from whatever you loaded. All the same shape, and this is the slide I would most like you to remember, because we have around three hundred instances of the left-hand version in the codebase and about ninety-five of the right-hand one.

There is also a longer form that takes a source and a computation, and the computation gets handed the previous source and the previous value. That is what you want when you would like to keep the current selection if it still exists in the new data, and fall back to something sensible when it does not.
-->

---
layout: content
eyebrow: 'Lesser known'
heading: 'A linkedSignal can write back to its source'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 28px;max-width:1650px;">By default a write to a <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">linkedSignal</code> is local: it overrides the derived value until the computation next produces something different, at which point the edit is gone. The <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">set</code> option intercepts that write, so the edit can go to whoever actually owns the value.</p>
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
readonly pageSize = linkedSignal(
  () => this.prefs().pageSize,
  {
    set: (value) =>
      this.prefs.update((prefs) =>
        ({ ...prefs, pageSize: value })),
  },
);
```

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:36px 0 0;max-width:1650px;">Because the hook replaces the default write, the new value only reaches the signal through the recomputation - so the source stays the one place the value lives. The second argument, <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">rawSet</code>, is there for when the source will not reflect the write straight away, or when the derivation is expensive and you already know its result.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:20px 0 0;max-width:1650px;">That removes the last case where an effect was doing the plumbing by hand.</p>

<!--
This one is genuinely lesser known, and it takes a plumbing job off you that people currently do by hand. Without it, the pattern is a local linked signal plus something that pushes the edit back to whoever owns the value, and in practice that something is an effect or a method you wire up yourself. The hook replaces the default write completely, so if you never call rawSet, the only way the new value reaches the signal is through the recomputation - and that's usually what you want, because then there is exactly one place the value lives. Call rawSet when the source won't reflect your write straight away, like an async save you don't want to wait on, or when the derivation is expensive and you already know what it's going to produce. And update goes through the same hook: it reads the current value untracked before it hands it to you, so you don't pick up a dependency by accident.
-->

---
layout: content
eyebrow: 'Boundaries'
heading: 'Effects that reach into another component'
---
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 28px;max-width:1600px;">The same mistake, one level up: an effect writes a signal that belongs to a child, a store, or a request.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:32px;">
<div>

```ts
// AVOID: a mirror kept current by an effect
readonly #params = signal({ teamId: '', page: 1 });

readonly #sync = effect(() => {
  this.#params.set(
    { teamId: this.teamId(), page: this.page() },
  );
});

readonly users = resource({
  params: this.#params,
  loader: ({ params }) => loadUsers(params),
});
```

</div>
<div>

```ts
// PREFER: hand the request its own parameters
readonly users = resource({
  params: () => ({
    teamId: this.teamId(),
    page: this.page(),
  }),
  loader: ({ params }) => loadUsers(params),
});
```

<p style="font-size:26px;line-height:1.4;margin:24px 0 0;color:#8A97A8;">The child's derived work reruns on a schedule it cannot see, ownership becomes unclear, and two writers can disagree.</p>

</div>
</div>
<p style="font-size:28px;color:#C9D4E2;line-height:1.45;margin:26px 0 0;max-width:1600px;">Who owns this value? If it is the child, pass it in with an <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">input()</code>. If it is the request, hand the request a computed of its own parameters.</p>

<!--
The question to ask in review is simply: who owns this value? If the answer is the child, then the parent should be passing it in, not writing it. If the answer is the request, then the request should take a computed of its parameters directly, instead of reading a mirror that an effect keeps up to date. Those mirrors are where the nastiest bugs come from, because you now have two writers and the order between them is decided by timing rather than by anything you wrote down.
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
I need to strike a balance here, otherwise you'll all leave thinking effects are banned. They aren't, and the genuine bridge cases are everywhere in our codebase - grid libraries, editors, charts, anything driven from an event stream we don't own. The difference between an effect that survives review and one that doesn't is almost always whether the author could name the thing outside the graph. So that's the question I'd ask of your own code before you push it: what is the non-reactive thing this effect is driving? If you can't name it, there probably isn't one, and what you've actually written is a computed. Two habits that help: one effect per side effect, and put it in a named class field rather than burying it in the constructor.
-->

---
layout: content
eyebrow: 'Footgun'
heading: 'An effect stops tracking the moment it goes async'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
readonly #render = effect(async () => {
  const id = this.teamId();          // tracked
  const rows = await loadUsers(id);
  this.grid.render(rows, this.format());
});                                  // format NOT tracked
```

</div>
<div>

```ts
// PREFER
readonly users = resource({
  params: this.teamId,
  loader: ({ params }) => loadUsers(params),
});

readonly #render = effect(() => {
  this.grid.render(this.users.value(), this.format());
});
```

</div>
</div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:40px 0 0;max-width:1600px;">Tracking only covers the synchronous run. After an <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">await</code>, a <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">setTimeout</code>, or a <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">then</code>, reads are invisible to the graph. The effect quietly stops reacting to half of what it uses.</p>

<!--
This one is nasty because it half works. The first dependency is tracked, so the effect does fire sometimes, and that's more than enough to make the wiring look correct. Then somebody changes the second value, nothing happens, and you go and spend an afternoon looking for a bug in the render path. If you need async work driven by signal parameters, that is exactly what the resource APIs are for. And you get cancellation of superseded work for free, which the async effect very much does not give you.
-->

---
layout: content
eyebrow: 'Cleanup'
heading: 'Cleanup is not teardown. It is undo the previous run'
---
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:44px;align-items:center;">
<div>

```ts
readonly poll = effect((onCleanup) => {
  const id = this.orderId();
  const handle = setInterval(() => this.check(id), 5_000);

  onCleanup(() => clearInterval(handle));
});
```

</div>
<div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 28px;"><code style="font-family:'JetBrains Mono',monospace;font-size:27px;">onCleanup</code> runs before <em>every</em> rerun, not just on destroy. Without it, changing the id starts a second interval and keeps the first. Nothing errors. The app just does more work every time, forever.</p>
<p style="font-size:29px;color:#8A97A8;line-height:1.45;margin:0;">Same for listeners, observers, animation frames and subscriptions.</p>
</div>
</div>

<!--
The subtle part is that onCleanup runs before every rerun, not just on destroy. So don't think of it as teardown - think of it as "undo the previous run", which is exactly what you want when the effect is keyed on something that changes. And if what you're adding is DOM listeners rather than timers, an AbortController gives you the same thing with a single signal covering the whole set.
-->

---
layout: section
number: '02'
transition: fade
---
## Dependencies

<p class="lead" style="margin-top:40px">The set is observed, not declared. That is where stale comes from.</p>

<!--
This chapter is the stale family, and every bug in it comes down to the same sentence: something changed, and nobody was listening. The thing to hold onto before we start is that the set of dependencies is observed while your code runs, not declared anywhere up front. Nobody writes it down, nothing checks it, and the compiler cannot help you. That is where stale comes from, and it is why every bug in this chapter looks like working software right up until it does not.
-->

---
layout: content
eyebrow: 'Two failure modes'
heading: 'A dependency set can be wrong in both directions'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:30px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:28px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:22px;">TOO NARROW</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Something the code uses is not tracked, so a real change never reruns the work. A stale label, or a panel that only updates once you touch something else.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:28px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:16px;">TOO WIDE</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">The work is keyed on more than it needs, so unrelated changes rerun expensive things. Refetching on a toggle nobody touched.</p> </div> </div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:26px;">
<div>

```ts
// TOO WIDE: any change to state refetches
readonly rows = resource({
  params: () => this.state(),
  loader: ({ params }) =>
    loadRows(params.teamId, params.page),
});
```

</div>
<div>

```ts
// KEYED ON WHAT THE RESULT IS MADE OF
readonly rows = resource({
  params: () => ({
    teamId: this.state().teamId,
    page: this.state().page,
  }),
  loader: ({ params }) =>
    loadRows(params.teamId, params.page),
});
```

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:0;max-width:1600px;">The loader already tells you the answer: whatever it reads is what the params should be.</p>

<!--
Both of these turn up in review about as often as each other, and both are normally written by somebody who had exactly the right intention. Too narrow usually happens when the read goes through a helper or a service, and you never notice that the tracking got skipped somewhere along the way - or the read is sitting inside an untracked block that somebody added for an unrelated reason. Too wide usually happens when you key an effect on a whole state object, because that was easier at the time than sitting down and naming the four fields the measurement actually depends on. And the fix for both of them is the same question, which is what the line at the bottom is really asking: what is this result made of? Key the work on that. Not the object it happened to arrive in, and not whatever subset was convenient to type.
-->

---
layout: content
eyebrow: 'Escape hatch'
heading: 'untracked() is a claim you have to defend'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">Wrapping a read in <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">untracked</code> says: I use this value, and I do not want a change to it to rerun this. Sometimes that is exactly right. It is also the easiest way in the language to build a permanently stale value.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:20px;">DEFENSIBLE</div> <p style="font-size:28px;line-height:1.5;margin:0 0 18px;color:#C9D4E2;">The rerun is driven by something outside the graph, and this read is only supplying context to it.</p> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">A write is being wrapped so it does not participate in the read that caused it.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">NOT DEFENSIBLE</div> <p style="font-size:28px;line-height:1.5;margin:0 0 18px;color:#C9D4E2;">It silences a loop you did not want to think about. The loop is the symptom, the shape is the cause.</p> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">It was added to make a test settle.</p> </div> </div>

<!--
The question I use on every one of these is: if this value changed right now, and nothing reran, would that be correct? If the answer is yes, untracked is the right call, and you should say so in a comment right next to it. If you have to think about it for more than a few seconds, what you are looking at is a stale bug waiting for a customer to find it. Authors did successfully defend untracked three times in the review history I went through, and every single time they defended it the same way - by naming the thing outside the graph that was actually driving the rerun. That is the tell for a good one. The bad ones never have that answer, because the untracked was added to silence a loop nobody wanted to think about, or to make a test settle down. And we had one thread that went the other way, which I like: a shared helper wrapped a write in untracked, but every call site already wrapped its own write, so the wrapper inside the helper was not protecting anything. It was just a second place for the rule to drift out of sync, so we took it out.
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
    label: this.i18n.translate(item.key, this.lang()),
  })),
);
```

</div>
</div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:36px 0 0;max-width:1600px;">Same shape: an imperative getter on a service, a value read from storage, the current time, the current URL, or the contents of a DOM node. None of them notify.</p>

<!--
This is the highest-volume single bug in our whole review history, and I want to spend a moment on it, because the symptom looks like an i18n bug rather than a signals bug. Somebody changes language, half the screen updates because it went through a pipe, and the other half stays stubbornly in the old language, because those strings were snapshotted into a computed and have been frozen ever since. Five separate findings turned out to be that same instance. But the translation case is just the one we happened to hit - the rule underneath it is what I want you to take away. If the source cannot notify you, do not read it inside derived state. Either bring it into the graph as a signal so it can tell you when it changes, or push the read down to the point of render, where it gets re-evaluated anyway. And the list along the bottom is not exhaustive. An imperative getter on a service, something out of storage, the current time, the current URL, the contents of a DOM node - none of them can tell you they changed, so all of them behave exactly the same way.
-->

---
layout: content
eyebrow: 'Discipline'
heading: 'A comment about reactivity is a testable claim'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:44px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <p style="font-size:29px;line-height:1.5;margin:0;color:#8A97A8;font-family:'JetBrains Mono',monospace;">// runs once per open</p> <p style="font-size:29px;line-height:1.5;margin:18px 0 0;color:#C9D4E2;">The dependency list said: every keystroke.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <p style="font-size:29px;line-height:1.5;margin:0;color:#8A97A8;font-family:'JetBrains Mono',monospace;">// reacts to the verified flag</p> <p style="font-size:29px;line-height:1.5;margin:18px 0 0;color:#C9D4E2;">The flag was read inside <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">untracked</code>.</p> </div> </div>
<p style="font-size:31px;color:#C9D4E2;line-height:1.45;margin:0;max-width:1600px;">Both of these shapes came out of review the same way: read the comment, then check whether the code agrees. It is the one kind of comment you can verify line by line.</p>

<!--
So there are two things I would do with this. If you are the one writing that comment, check it before you commit it, because the moment you write it down you have made a claim that somebody can falsify. And if you are reviewing, go to those comments first, and read them as claims rather than as documentation you can trust. That is precisely where intent and implementation drift apart, and the drift is invisible in the diff, because what you see is a comment that reads perfectly well sitting above code that no longer does what it says. Of everything in this deck this is the cheapest habit to pick up, and it works because a comment about what something reacts to is the one kind of comment you can verify line by line, against the code right underneath it.
-->

---
layout: section
number: '03'
transition: fade
---
## Timing

<p class="lead" style="margin-top:40px">When your code runs relative to inputs and to render.</p>

<!--
This chapter is the one people find most surprising, because every example in it is code that is completely correct when you read it on its own, and wrong because of when it runs. There is no logic error to find in any of it. It is all about where your code sits in the sequence - relative to your inputs being set, and relative to the DOM actually being there.
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

ngOnInit() {
  // inputs are set by now
  if (this.mode() === 'tree') {
    this.startObserving();
  }
}
```

</div>
</div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:36px 0 0;max-width:1600px;">This one is especially good at hiding, because the default is often the common case. The code appears to work, and the comment above it describes behaviour that never happens.</p>

<!--
We have shipped this more than once, and both times it took a careful reviewer to catch it, because there is nothing about it that looks wrong. Look at the second-order damage in the case on the slide: that guard existed to avoid allocating observers for the cheap layouts, it never once fired, so every single instance paid for machinery that the comment directly above it promised it would skip. We had another one where test fixtures were seeded from an input in the constructor, and they rendered empty in every case that actually mattered. The reason it happens at all is just ordering - Angular constructs your class first, and sets the template-bound inputs afterwards, so at constructor time the signal is still sitting on its default. So if a decision depends on an input, it does not belong in the constructor at all. Put it in derived state, or in ngOnInit, or in an effect, all of which run after the inputs are set. And if you can use a required input, do, because reading one too early throws instead of quietly handing you a default.
-->

---
layout: content
eyebrow: 'Migration'
heading: 'Every ngOnChanges has a signals shape'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">A surviving <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">ngOnChanges</code> is almost always one of four things. Three of them are not lifecycle at all.</p>
<div class="compare" style="grid-template-columns:0.9fr 0.7fr 1fr;margin-bottom:36px;"> <div class="head">WHAT IT DOES</div> <div class="head teal">BECOMES</div> <div class="head">WHY</div> <div class="row-label">Recomputes from one input</div> <div><code style="font-family:'JetBrains Mono',monospace;">computed</code></div> <div>It was never a change handler, it was a formula</div> <div class="row-label">Recomputes from several</div> <div><code style="font-family:'JetBrains Mono',monospace;">computed</code></div> <div>Read them all; the dependency set builds itself</div> <div class="row-label">Resets local state on change</div> <div><code style="font-family:'JetBrains Mono',monospace;">linkedSignal</code></div> <div>Derived, but the user can still overwrite it</div> <div class="row-label last">Drives something non-reactive</div> <div class="last"><code style="font-family:'JetBrains Mono',monospace;">effect</code></div> <div class="last">The only one that is genuinely a side effect</div> </div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:0 0 18px;max-width:1600px;">There is no equivalent for <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">firstChange</code>, and that is the point: if the first run needs to differ, that is initialisation, and it belongs somewhere that runs once.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:0;max-width:1600px;"><code style="font-family:'JetBrains Mono',monospace;font-size:26px;">ng generate @angular/core:signals</code> converts inputs, outputs and queries for you. It does not touch <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">ngOnChanges</code>, so this table is the part you do by hand.</p>

<!--
This one is worth a slide because of where we found it. There are still a hundred and forty-odd ngOnChanges implementations in the codebase, and thirty-nine of those are in files that already use input(). So this is not people who haven't caught up. It's people who converted their inputs, looked at ngOnChanges, and couldn't see what it turns into - which is fair, because the schematic converts inputs and outputs and queries and then leaves ngOnChanges exactly where it is.

So here is the translation. Nearly every one you'll meet is one of these four. If it recomputes something from one input, it was never a change handler at all, it was a formula, and it's a computed. If it recomputes from several inputs, it is still a computed - you just read all of them, and the dependency set assembles itself from the reads. If it resets some local state when an input changes, that's the derived-but-writable shape from chapter one, and it's a linkedSignal. And only the fourth case is genuinely a lifecycle concern: it's driving something outside the graph, and that is what an effect is for.

The line about firstChange is the one people trip on. There is no signals equivalent, and I'd argue that's deliberate rather than an omission. If the first run has to be different from the rest, what you're describing is initialisation, and initialisation belongs somewhere that runs once - not inside something that reruns.
-->
---
layout: content
eyebrow: 'Render phases'
heading: 'DOM work belongs to a render phase'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">An <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">effect</code> runs inside change detection, before child views are refreshed and before view queries resolve - so the element it wants may not exist yet, and the write lands on the old view or on nothing. A raw animation frame is worse: it opts out of Angular's coordination altogether.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
effect(() => {
  this.selectedId();          // track
  this.pane().scrollTop = 0;
});
```

</div>
<div>

```ts
// PREFER
afterRenderEffect({
  write: () => {
    this.selectedId();          // track
    this.pane().scrollTop = 0;
  },
});
```

</div>
</div>

<!--
The reason the version on the left is wrong stops being subtle once you know the order things happen in. A component effect runs inside change detection, before child components and embedded views have been refreshed and before the view queries have even resolved - so the element you are reaching for may genuinely not exist yet, and your write lands on the old view or on nothing at all. A raw requestAnimationFrame is worse again, because that steps outside Angular's render coordination entirely and puts you back to guessing. Then there is the case at the bottom, which I have never seen anybody predict in advance. Your effect tracks the anchor and it tracks the content, both of them settle, you position the overlay against what is on screen - and then a deferred block swaps its placeholder out for the real content, and the height you measured is now wrong. Nothing in your dependency set changed, so nothing reran, and the overlay just sits there in the wrong place. You either observe the size of the thing you measured, or you track whatever it is that signals the swap.
-->

---
layout: content
eyebrow: 'Render phases'
heading: 'Pick the phase, do not take the default'
---
<div class="compare" style="grid-template-columns:0.5fr 1fr 1fr;margin-bottom:40px;"> <div class="head">PHASE</div> <div class="head teal">FOR</div> <div class="head">CONSTRAINT</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">earlyRead</code></div> <div>Measuring, before anything writes</div> <div>Never write here. Prefer <code style="font-family:'JetBrains Mono',monospace;">read</code> if it can wait</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">write</code></div> <div>Mutating the DOM</div> <div>Never read layout here</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">mixedReadWrite</code></div> <div>The default, and the reason to be explicit</div> <div>Only when unavoidable</div> <div class="row-label last"><code style="font-family:'JetBrains Mono',monospace;">read</code></div> <div class="last">Inspecting after all writes</div> <div class="last">Never write here</div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">A read that follows a write in the same phase forces the browser to recompute layout there and then. Splitting them is usually a two-line change, and the phases run in a fixed order so the data flows from one to the next.</p>

<!--
The default is the trap on this slide. If you hand these APIs a plain callback instead of a phase object, you land in mixedReadWrite, and it works - which is why nobody ever goes back and changes it - and you pay a forced synchronous layout on every single run. Angular's own guidance is to reach for read and write first, and only use earlyRead when you genuinely have to measure before something writes, and only use mixedReadWrite when you cannot split the work at all. The four phases always run in that order, top to bottom, so once you have named them the data just flows down the list. And then there is a second thing this catches people out with, which is nothing to do with phases: a measurement you take inside one of these is a number, not a subscription. You read the element's height at that moment and that is all you get. If the element can change size without any signal changing - content loads, a font arrives, the user drags the window - you will never hear about it. That is what a resize observer is for, and torn down properly when the component goes.
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
  for (const row of this.rows()) {
    const height = row.el.offsetHeight;       // read
    row.el.style.height = `${height + 8}px`;  // write
  }
});
```

</div>
<div>

```ts
// PREFER: one read pass, one write pass
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

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:36px 0 0;max-width:1650px;">Each phase hands its result to the next, so the split costs nothing in structure. <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">afterNextRender</code> for setup that happens once, <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">afterRenderEffect</code> when it has to rerun - same phases, except the effect version hands the next phase a <em>signal</em>, not a value.</p>
<p style="font-size:28px;color:#5E6B7D;line-height:1.45;margin:20px 0 0;max-width:1650px;">Calls that force layout: <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">offsetHeight</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">clientWidth</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">scrollTop</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">getBoundingClientRect()</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">getComputedStyle()</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">scrollIntoView()</code>, even <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">focus()</code>. Cheap once, and multiplied by every row, cell or widget on the page.</p>

<!--
This is the phase table made concrete. The thing I want you to hold onto is that the cost here is not the read - you almost always need that number - the cost is entirely the ordering, which means batching is the whole fix. Read everything, then write everything, and the browser does one layout instead of one per row. And where the code lives decides how much any of this actually matters to you. An unbatched read in something that renders once on a settings page costs you nothing you could measure. The exact same line in a per-row component, or in a directive that sits on every item, becomes one forced reflow per instance, and on a page with a few hundred rows that is the difference between smooth and visibly janky. One last thing while we are on it: if a resize observer has already handed you the box, use the number it gave you rather than going back and asking the DOM again, because that second question costs you exactly what the first one did.
-->

---
layout: section
number: '04'
transition: fade
---
## Purity and cost

<p class="lead" style="margin-top:40px">Derived state is read often, and at unpredictable times.</p>

<!--
Chapter four. Everything in this section is correct the first time it runs. That is exactly why it survives review and why it reaches production - the first render looks right, and the bill arrives later, on the second change, or under load, or on the slowest machine in the building.
-->

---
layout: content
eyebrow: 'Purity'
heading: 'A computed may run at any time, or never'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">You do not control when derived state evaluates, how often, or whether it evaluates at all.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:18px;">MUTATES SOMETHING</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">Injecting a stylesheet, writing to storage, registering a handler. The graph is not a place to cause things.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:18px;">OWNS A LIFETIME</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">Constructing something that holds a worker, a socket or a subscription. Recomputing replaces it and nothing disposes the old one.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:18px;">READS THE DOM</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">The DOM does not notify, so the value is a snapshot - correct once, then frozen.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:44px 0 0;max-width:1600px;">If something needs creating and disposing, that is a lifecycle concern. Give it an owner that can tear it down.</p>

<!--
Of these three, the middle one hurts the most, because you cannot see it until the source changes twice. The first time the computed runs, it creates the expensive thing - the worker, the socket, the subscription. Then the source changes, it runs again, it creates another one, and the first is still sitting there running with nobody holding a reference to shut it down. There is no cleanup hook on a computed. Nothing is going to dispose it for you. Under load that shows up as a performance problem, and you will go looking in entirely the wrong place. When we filed this, the author pushed back, and the pushback is fair, so I will give you both sides: the rule is about mutating state outside the graph, not about constructing an object that happens to do some work. The line I would draw is the one at the bottom. If the thing you create needs disposing, it has a lifecycle, and a computed has no lifecycle to hang it on.
-->

---
layout: content
eyebrow: 'Identity'
heading: 'Reference equality is the notification boundary'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">Signals compare with <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">Object.is</code>. For objects and arrays that means reference equality: return a fresh array and every consumer is told it changed, even when the contents are identical.</p>
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
protected readonly held = computed(() =>
  this.dragging() ? [this.dragged()] : [],
);
```

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:36px 0 0;max-width:1600px;">Bind that to a virtualiser, a chart or a grid, and every check throws away work that did not need redoing. The computed returns the same array until its inputs change.</p>

<!--
If you have ever chased a performance problem you could not explain, there is a good chance it was this one. A virtualiser recalculating its ranges on every check. A chart rebuilding its series. A grid recreating its column definitions. In every case something upstream is handing out a brand new array each time it is asked, and everything downstream believes it, because the default comparison is Object.is - two arrays with identical contents are always different. I want you to notice which way the fix points. Moving this to a computed is not about tidiness. The caching is the entire feature: the computed hands back the same array reference until its inputs actually change, so the work downstream stops rerunning. And if you go the custom equality route for a collection whose contents matter more than its identity, one thing to know - when your comparator says equal, the computed keeps the old value, so consumers keep the reference they already had. Which is exactly what you want.
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
@for (row of rows(); track row.id) {
  <a [href]="buildUrl(row)">{{ formatNextRun(row.nextRunAt) }}</a>
}
```

</div>
<div>

```html
<!-- PREFER -->
@for (row of rowViews(); track row.id) {
  <a [href]="row.url">{{ row.nextRun }}</a>
}
```

</div>
</div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:36px 0 0;max-width:1600px;">Map the rows to view objects once in a computed, then bind to their fields. <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">@let</code> does the same job for a one-off deep read. Cheapest fix on the list: a move, not a redesign.</p>

<!--
I want to push on the word "unrelated", because that is where the cost hides. A resource resolving in a completely different corner of this component marks the view dirty, Angular re-checks the template, and your date formatting runs again for every visible row - even though nothing about those dates changed. The row did not ask for that work. Something else did, and the row paid for it. The fix on the right is to build the view objects once and bind to their fields, and it is the cheapest change on the whole list: it is a move, not a redesign. And while we are here, @let earns its keep twice over. It is how you name a repeated deep read so you are not writing the same three-level dereference in six bindings, and it is how you subscribe to an async pipe once instead of once per usage - every pipe in a template is its own instance and its own subscription, so lifting it into a single @let collapses six subscriptions into one.
-->

---
layout: section
number: '05'
transition: fade
---
## Async state

<p class="lead" style="margin-top:40px">Loading, empty, error, and the difference between them.</p>

<!--
Chapter five. This is where the damage becomes user-visible, and it is the part of the research I found least comfortable to read back. Every finding in this section shipped, or came within a review of shipping, something that looked completely fine on screen and was lying to whoever was looking at it.
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

readonly users = httpResource<User[]>(
  () => `/api/teams/${this.teamId()}/users`,
);
```

</div>
<div>
<div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:20px;">YOU GET, FOR FREE</div> <p style="font-size:28px;line-height:1.5;margin:0 0 14px;color:#C9D4E2;">Refetch when the parameters change</p> <p style="font-size:28px;line-height:1.5;margin:0 0 14px;color:#C9D4E2;">Cancellation of superseded requests</p> <p style="font-size:28px;line-height:1.5;margin:0 0 14px;color:#C9D4E2;">Loading, error and status as signals</p> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">No race between two in-flight responses</p> </div>
</div>
</div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:40px 0 0;max-width:1600px;">Reads driven by signals belong in a resource. Writes do not: a resource re-issues its request whenever the parameters change, and again on every reload. A POST or DELETE is an action with a moment, not a value with parameters, so it stays on the HTTP client.</p>

<!--
The shape on the left is the one to have in your fingers. A function that returns the request, reading whatever signals it needs. Because it is a function of signals, the team ID changing is the trigger - you do not wire anything up, and you do not write the cancellation yourself. Everything in the green box comes with it. One thing to watch inside that function: it reruns when the signals it reads change, so key it on the few values the request is actually made of. Hand it a whole state object and every unrelated field on that object becomes a refetch. Also note there is no default value here, so the type of value is User array or undefined, and you will be branching on that. Reads driven by signals go in a resource. Writes do not. Nothing stops you setting method to POST, the request type has method and body on it, but a resource re-issues its request whenever the parameters change and again every time you reload it, and "send the delete a second time" is not a thing you want happening on a parameter change. A write is an action with a moment. It stays on the HTTP client. And the last point there was a real argument in review, settled the right way. Taking a resource as an input couples a shared component to one loading mechanism. Take the finished value, and let the consumer decide where it came from - it might be a resource, it might be three of them, it might be a constant in a test.
-->

---
layout: content
eyebrow: 'Interop'
heading: 'An unguarded toSignal is a state you did not model'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">Without an initial value, the signal is <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">T | undefined</code> until the first emission. That <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">undefined</code> means "not yet" - and it renders exactly like "none".</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
<div>

```ts
// AVOID
readonly user = toSignal(this.user$);
// Signal<User | undefined>

// reads as "no user"
@if (!user()) { <p>Not signed in</p> }
```

</div>
<div>

```ts
// PREFER
readonly user = toSignal(this.user$, {
  requireSync: true,
});
// Signal<User> - throws if it is a lie
```

</div>
</div>
<p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:36px 0 0;max-width:1600px;"><code style="font-family:'JetBrains Mono',monospace;font-size:26px;">requireSync</code> when the source really does emit on subscribe, an <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">initialValue</code> when it does not, and a branch on <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">undefined</code> when it genuinely has a meaning. Picking none of the three is the bug.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:20px 0 0;max-width:1600px;">And if the source is already a signal, a <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">toObservable</code> round trip through a pipe and back is an effect with extra steps. Use a <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">computed</code>, or a resource.</p>

<!--
This is the biggest number in the whole research and we have not talked about it yet. There are close to fifteen hundred toSignal calls in the codebase, and around thirteen hundred and seventy of them pass neither an initial value nor requireSync. Every single one of those is typed T-or-undefined, and is genuinely undefined for at least one tick.

Now look at what that does to a template. You get undefined, so the falsy branch runs, so you render "not signed in" - or an empty list, or a dash - for one tick before the real value arrives. Most of the time nobody notices, because the gap is a frame. But this is the silent shape from the very first slide: an undefined that means "we do not know yet" being rendered as though it means "there is nothing". And when the source is slower than a frame, it stops being invisible.

There are three honest answers and you have to pick one. If the observable genuinely emits synchronously on subscribe - a BehaviorSubject, a ReplaySubject, a store selector - use requireSync, and you get a plain Signal of T with no undefined anywhere. If it does not emit immediately, give it an initialValue, and now the initial state is something you chose rather than something you inherited. And if undefined really does mean something distinct in your UI, keep it and branch on it deliberately. What you cannot do is pick none of the three and hope.

The last line is a separate thing but it belongs here. If what you are starting from is already a signal, and you convert it to an observable, pipe it, and convert it back - that round trip is implemented with an effect underneath. So you have reintroduced every problem from chapter one, and paid for two conversions to do it. If the source is a signal, stay in signals: use a computed, or if it is async, use a resource.
-->
---
layout: content
eyebrow: 'States'
heading: 'Four states, not two'
---
<div class="compare" style="grid-template-columns:0.6fr 1fr 1fr;margin-bottom:40px;"> <div class="head">STATE</div> <div class="head teal">MEANS</div> <div class="head">GETS RENDERED AS</div> <div class="row-label">loading&nbsp;/&nbsp;reloading</div> <div>The answer is not known yet</div> <div>A skeleton - though a reload keeps the old value on screen</div> <div class="row-label">resolved</div> <div>The answer is known, and may be empty</div> <div>Content, or a real empty state</div> <div class="row-label">error</div> <div>The answer is unknown and will not arrive</div> <div>An error, with a way to retry</div> <div class="row-label last">idle</div> <div class="last">Nothing has been asked for yet</div> <div class="last">Usually the same as loading</div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">Collapsing any two of these produces a bug that testers cannot reproduce and users report as "it showed nothing".</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:0;max-width:1600px;">The value survives <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">reload()</code>. It is discarded whenever the parameters change - and a change to <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">undefined</code> is still a change, except the resource then goes <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">idle</code> rather than loading, so nothing is coming to replace it.</p>

<!--
Four things to render, and the API gives you six statuses to get there. Loading and reloading both mean you are waiting; the difference is that reloading keeps the previous value on screen while it waits. Resolved and local both mean you have a value - local just means somebody called set on it. And the one I would underline is idle, because that is what you get when the parameters function returns undefined, and it is not the same as loading. Nothing is in flight, and nothing is coming. Collapse any two of these and you get a bug testers cannot reproduce and users report as "it showed nothing". Which brings me to the line at the bottom. The value survives a reload, but it is discarded the moment the parameters change, and a change to undefined is still a change. So if a transient gap in your parameters is reachable, the list empties itself on the way through - and because the resource goes idle rather than loading, a template that shows a skeleton while loading will show you an empty state instead. We filed exactly this, and it was then correctly argued down, because that intermediate state could not actually be reached in that flow. The mechanism is real either way. Whether it bites you is a question about your flow, and that is a question to answer in review rather than something to patch defensively.
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
readonly users = resource({
  params: this.teamId,
  loader: ({ params }) =>
    loadUsers(params).catch(() => []),
});   // failure becomes "no users"
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
<div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 38px;margin-top:36px;"> <p style="font-size:30px;line-height:1.45;margin:0;color:#C9D4E2;">Guard with <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">hasValue()</code> - it is reactive, and already false in the error state - then render the error branch as an error. Reading <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">value()</code> while a resource has errored <em>throws</em>, and inside a <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">computed</code> that exception poisons everything downstream. An empty list, a zero, a dash and a missing button are all valid renderings of real data, so none of them can carry the meaning "this failed".</p> </div>

<!--
We filed this one five separate times in four different costumes, and every one of them reads as defensive good practice when you meet it in a diff. A catchError to an empty array. A default value supplied so the template does not have to branch. No value quietly treated as no data. And a ternary returning an empty string, which is the one on the right - the link does not break, it just is not there any more, and nobody files a bug about a button they never saw. In every case the code stops throwing and starts lying. Now, the pressure that produces all four of those is real, and it lives on the other side of this same line. If you read value while the resource is in its error state, it throws. And if that read is inside a computed, the computed does not absorb it - it stores the error and rethrows it to every consumer, so one failed request takes out everything downstream of it. So people add the guard, and then they need something to return, and they reach for a fallback. Guard with hasValue, which is reactive and already returns false in the error state, and then let the error branch render as an error. An empty list, a zero, a dash, a missing button - those are all valid renderings of real data. Not one of them can carry the meaning "this failed".
-->

---
layout: content
eyebrow: 'Composition'
heading: 'Two resources, one verdict'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:40px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">HALF-WIRED STATE</div> <p style="font-size:28px;line-height:1.5;margin:0 0 16px;color:#C9D4E2;">An aggregate <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">error</code> that reads only one of the two sources reports success while half the data is missing.</p> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">A retry that reloads only one of them can never recover the other.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">AND / OR</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Requiring <em>both</em> to fail before showing an error means one failure renders as a legitimate "not available". Ask which combination the user should be warned about, then pick the operator deliberately.</p> </div> </div>
<div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin:0 0 18px;">TWO MORE ASSUMPTIONS</div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 16px;max-width:1600px;">Two resources over the same parameters are two requests. Nothing deduplicates them for you, so if both are heavy, share one owner.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:0;max-width:1600px;">A resource lives as long as the injector that created it. Destroy a component-scoped service while something it fed is still on screen, and the request is cancelled and the resource reports <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">idle</code> with no value from then on - which most templates render as a spinner that never ends.</p>

<!--
Both of these boxes are about the same question: what does "this screen failed" mean when there are two requests behind it. If your aggregate error signal reads only one of the two sources, the screen reports success while half the data is missing, and the same asymmetry comes back in retry, where reloading one source can never recover the other. Go the other way and require both to fail before you show anything, and a single failure renders as a perfectly legitimate "not available". There is no default answer here. Ask which combination the user needs to be warned about, and then choose and or or on purpose. The two lines underneath are things people assume and should not. Two resources over the same parameters are two requests - nothing deduplicates them for you, so if both are expensive, give them a single owner and derive from it. And the last one I have watched happen. A drawer opens and reads from a panel-scoped service. The user switches tabs behind it. The panel is destroyed, the injector goes with it, the resource is torn down, the in-flight request is aborted, and the drawer is still sitting open on screen. Nothing errors. Nothing logs. The resource reports idle with no value from then on, which in most templates is a spinner that never stops. So decide who owns the request, and scope it to whatever outlives the interaction.
-->

---
layout: section
number: '06'
transition: fade
---
## Boundaries

<p class="lead" style="margin-top:40px">What a signal exposes, and to whom.</p>

<!--
This is chapter six, and it is the cheap one. Everything in it takes about a minute to fix, and that is exactly the problem - none of it is hard, nobody argues with any of it in review, and it turns up again in the next pull request anyway. So I would rather you took these three as habits you build than as things you catch. By the time review catches them you have already written them, and writing them is the part I want to change. It is about what a signal exposes, and who it exposes it to.
-->

---
layout: content
eyebrow: 'Visibility'
heading: 'Template-only state is not public API'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:40px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;margin-bottom:18px;">protected readonly</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Anything the template reads and nothing outside needs: derived state, signal queries, view helpers.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;margin-bottom:18px;">#private</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Anything neither the template nor a consumer touches. Enforced at runtime, not just by the compiler.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">A signal that anything outside can reach is an invitation. Somebody accepts it, from a place you did not plan for, and the invariant you were maintaining now has two owners. <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">protected</code> is what closes that door - <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">readonly</code> only stops the property being reassigned.</p>

<!--
Angular templates can read protected members. That is not incidental, it is the whole reason protected is the right default here rather than public - your template is not an external consumer, so you do not owe it a public API. And the thing I find over and over when I look at this in review is not somebody deliberately exposing state. It is a signal that ended up public for no reason at all: nothing outside needs it, nothing outside reads it, that is just how it got typed the first time somebody wrote the line. Narrowing it costs you nothing while the change is still open. Once it has merged, narrowing it is a breaking change to somebody, and now you are having a conversation instead of pressing a key. So do it while it is free. The second card is our own rule rather than Angular's: for genuinely internal state, use a hash-private field, because that one is enforced at runtime and not just by the compiler, and nothing can reach past it. And on the last line - if the only reason you are widening visibility is that a test wants to see something, that is the test telling you it is asserting on the wrong thing. Bracket-indexing a protected signal to check it is not null is a smell, not an access strategy.
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

service.items().pop();          // compiles fine
```

</div>
<div>

```ts
// PREFER
readonly items: Signal<readonly Item[]> = this.#items;

service.items().pop();          // Property 'pop' does not exist
```

<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:24px 0 24px;">The signal protects the reference, not the contents. Edit the cached array in place and every later reader sees it immediately, while the graph sees nothing change at all.</p>
<p style="font-size:29px;color:#8A97A8;line-height:1.45;margin:0;">It stops <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">pop()</code>. It does not stop <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">items()[0].label = 'edited'</code> - for that the elements need <code style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;">Readonly&lt;Item&gt;</code> too.</p>
</div>
</div>

<!--
Everything else in this talk is a stale bug: something changed and nobody heard about it. This one is the exact opposite, which is what makes it so disorienting the first time you hit it. The moment a consumer pops that array, every single person who reads the cached value sees the edit immediately - it is not late, it is instant. And the reactive graph hears nothing at all, because the reference never changed. So your UI and your state genuinely disagree with each other, and there is no changed reference anywhere for anyone to notice. Nothing reruns, nothing recomputes, nothing looks wrong until a user tells you the count in the header does not match the rows in the table. Let me be precise about the fix, because it is easy to overclaim. Typing it as a readonly array stops them calling pop, and that is a compile error, which is what you want. It does not stop them reaching into an item and editing a field on it. If the objects themselves are shared, you need the elements readonly too. But start with the array, because the array is where this actually bites.
-->

---
layout: content
eyebrow: 'Restraint'
heading: 'Fewer signals, better named'
---
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-bottom:40px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">FIXED AT CREATION</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">Data that cannot change while the view is alive does not need to be writable. Making it writable invents a state transition nobody handles.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">A RENAME, NOT A DERIVATION</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">A computed that just renames another signal is a second place to read from, and a chance for the two to disagree.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">NAME THE MEANING</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">Derived state names a concept, so name the concept and not the mechanism. Reviewers read the name before the formula.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0;max-width:1600px;">The reactive question to ask about any new signal: what writes this, and when? If the honest answer is "only the thing it came from", it is a computed. If it is "nothing, ever", it is a constant.</p>

<!--
Let me make the first card concrete, because "fixed at creation" sounds abstract until it costs you something. Say you have a dialog, and it is seeded once from whatever the user had selected at the moment they opened it. If you turn that seed into live writable state, you have just invented a moment that did not exist before: the thing changes halfway through the interaction, while the dialog is still open, and now the request you send is built from a shape nobody wrote code for. That is a bug that happens to one real user, once, and you never reproduce it. On the change this came from, three separate review comments pushed the same value back from live writable state to derived state for exactly that reason. And the other two cards are smaller but they come from the same instinct - reaching for a signal because signals are what we reach for. A computed that only renames another signal has not derived anything, it has just given you a second place to read the same value from and a chance for the two of them to drift. And when you do genuinely need derived state, name the concept it represents rather than the mechanism that produces it, because in review people read the name long before they read the formula.
-->

---
layout: section
number: '07'
transition: fade
---
## Testing

<p class="lead" style="margin-top:40px">Reactive code fails in ways that make tests pass.</p>

<!--
Chapter seven, and it is a short one. The point of it is this: a signals bug can hide behind a green test exactly as easily as it hides behind a screen that looks like it is working. It is the same property that lets these things get through review in the first place - none of them throw. A stale value, an empty list, a chart of zeroes, all of it looks like working software, and it looks like a passing test too. So neither of the next two slides is really about a signals API. Both are about what your test is actually waiting for, and whether it can tell the difference between finished and not started.
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
expect(state.error()).toBeUndefined();
```

</div>
<div>

```ts
// PREFER
await vi.waitFor(() =>
  expect(state.status()).toBe('resolved'),
);
expect(state.error()).toBeUndefined();
```

</div>
</div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:40px 0 0;max-width:1600px;">A fixed number of flushes encodes today's scheduling. One extra turn, one delayed response, and the assertion runs against the initial state and passes for the wrong reason.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:24px 0 0;max-width:1600px;">Set a property on a component directly rather than through its inputs, and the view has not been checked by the time your next line runs. Flush before asserting on the DOM.</p>

<!--
The dangerous failure here is not a flaky test. It is a test that goes green while the feature is broken, and green tests do not get read again. Walk through the left-hand side. You wait six turns, the resource settles on the seventh, and your assertion runs against the state the component was in before anything loaded. If that initial state happens to satisfy what you asserted - no error, nothing rendered yet, whatever it is - the test passes and you ship. Six is not a magic number either. Six is however many turns it happened to take on the machine of the person who wrote the test. Add one await anywhere upstream, let the response come back a tick later, change a scheduler, and you are asserting against a component that has not done anything yet. Waiting on a predicate takes the guess out entirely: you stop encoding today's scheduling and start describing the state you actually care about, and if that state never arrives the test tells you so instead of quietly agreeing with you. One more thing while we are here, and it is a separate trap. If you set a property on a component directly instead of going through its inputs, the view has not been checked by the time your next line runs. So flush first, then assert on the DOM.
-->

---
layout: content
eyebrow: 'Readiness'
heading: 'A readiness signal that can never arrive'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">Waiting for a count to become non-zero works right up until zero is the correct answer.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:20px;">AMBIGUOUS</div> <p style="font-size:29px;line-height:1.5;margin:0;color:#C9D4E2;">"Has it produced results yet?" cannot distinguish a finished empty pass from a pass that never ran.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:20px;">UNAMBIGUOUS</div> <p style="font-size:29px;line-height:1.5;margin:0;color:#C9D4E2;">"Has it finished?" A status, a settled state, an explicit first-emission flag. Empty is then a result like any other.</p> </div> </div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:40px 0 0;max-width:1600px;">A timeout is a diagnosis to start from, not a verdict. Check the interaction, the locator and the setup before you conclude the component is broken.</p>

<!--
This is the four-states slide from earlier, except now it is your test infrastructure making the mistake rather than your component. If the thing you are waiting on cannot tell the difference between "nothing has happened yet" and "nothing was there", you have written a test that can only pass when the data is non-empty - and the non-empty case is almost always the one that already worked. The empty case is the one you needed the test for. What happens in practice is worse than a failing test, by the way. The test hangs. It times out. And the timeout gets filed as a bug against whatever the test was pointing at, so somebody loses a morning reading a component that was fine the whole time. That is why I want you to treat a timeout as the start of a diagnosis rather than as a verdict. Check the interaction, check the locator, check how the fixture was set up, and only then start suspecting the code. The fix on the right is genuinely small: wait for a status, or a settled state, or an explicit flag that says the first emission has happened. Once you are asking "has it finished" instead of "has it produced anything", empty is just a result like any other.
-->

---
layout: section
number: '08'
transition: fade
---
## Signal Forms

<p class="lead" style="margin-top:40px">The same ideas, applied to the one API built entirely on them.</p>

<!--
Last chapter, and I'll admit up front that it's shorter than it wants to be. Signal Forms really deserves a session of its own, and one day it will get one. The reason it's here at all is that it's the one API in Angular built entirely on the ideas we've spent the last seven chapters on. So as we go through it, I want you to keep recognising things: derived state instead of synchronisation, rules that declare what they depend on instead of code that keeps things in step by hand, and one source of truth instead of two.
-->

---
layout: content
eyebrow: 'Introduction'
heading: 'A third forms API, built on signals'
---
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0 0 52px;max-width:1550px;">Signal Forms became stable in v22 - public API, semver-protected, still growing. You keep your data in a signal, pass it to <code style="font-family:'JetBrains Mono',monospace;font-size:29px;color:#2FD8B4;">form()</code>, and get a form back - no control tree to build and keep in sync.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Your own data is the form's data, and everything the form knows about a field is a signal.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS NOT</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A migration. Reactive forms still work, and so do the controls we have already built - but new forms should use signal forms.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT CHANGES</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Validators stop being things you add and remove. They become rules that know when they apply.</p> </div> </div>

<!--
Before we go anywhere near the API, let me orient you. Signal Forms became stable in v22. That means it's public API, it's semver-protected, and it is still growing. What it is not is a migration. Reactive Forms are still supported and still perfectly fine for plenty of screens, and the custom controls you've already built keep working - we'll come back to exactly how in a few minutes. The difference is where the data lives. Your own data is the form's data: you keep it in a signal, you hand that signal to form(), and everything the form knows about a field - its value, whether it's valid, whether it's been touched - is itself a signal. There's no control tree to build and no control tree to keep in sync. And because the whole thing is signals underneath, validators stop being static objects that you add and remove by hand. They become rules that know when they apply and which fields they depend on.
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
There are three pieces to this, and that is genuinely all of it. First, your data lives in an ordinary writable signal. Nothing special about it - it's the same signal call you'd write anywhere else in the component. Second, you pass that signal to form, and what you get back is a field tree shaped exactly like your data. Third, you bind a control with formField, pointing it at the field you want: loginForm dot email, loginForm dot password. And here is the part I want you to hold on to. loginModel is not a DTO sitting beside the form waiting to be filled in at the end. It is the form's editable data. When somebody types in that email box on the right, loginModel updates, because the form does not keep its own copy of anything.
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
Let's put that next to something familiar. On the left, Reactive Forms: we construct a separate control tree - a FormGroup of FormControls - and then bind controls out of that tree into the template. On the right, the signal form: a signal holding plain data, a call to form, and bindings that point straight at the fields. I've deliberately not marked anything red here, because I'm not trying to make Reactive Forms look bad. At this size the difference is architectural rather than dramatic, and for a form this simple there honestly isn't much wrong with the version on the left. The difference starts to matter when data has to move into and out of the form, or when one field's behaviour depends on what's in another field. Which is to say: if all our forms were two inputs with no real behaviour, this workshop would be very short.
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
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:48px;" v-click="2"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:18px;">REACTIVE FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#8A97A8;">listen → inspect → mutate → recalculate</div> </div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:18px;">SIGNAL FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#E8ECF2;">describe the relationship</div> </div> </div>

<!--
Here's the requirement, and you have all built this form. Email is required, but only when the user has opted in to notifications. On the left is how we write that today. We subscribe to notify's value changes. We prime it with startWith so it also runs for the initial value. We take until destroyed so it doesn't outlive the component. And then on every change we inspect the value, we add a validator or we remove one, and finally we tell email to recalculate itself. Four steps, and every single one of them is us doing the bookkeeping by hand. Now watch what it becomes. Email is required, when notify is true. That's the whole thing. We don't subscribe. We don't add a validator. We don't remove one. We don't tell email to recalculate. We describe the relationship once, and the framework works out when it applies and when it stops applying. This is the moment where the last two hours pay off, because it is exactly the move we made with computed at the very start of the day: stop orchestrating the response, and describe the rule.
-->

---
layout: content
eyebrow: 'Custom controls'
heading: 'One interface, one signal, no ControlValueAccessor'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">The <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">[formField]</code> directive detects the interface and binds the field's value to your <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#C9D4E2;">value</code> model. No provider, no callbacks.</p>
<div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:center;"> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:32px 38px;font-family:&#x27;JetBrains Mono&#x27;,monospace;font-size:24px;line-height:1.65;color:#C9D4E2;"> <div>@Component({</div> <div style="padding-left:1.2em;">selector: <span style="color:#2FD8B4;">'app-custom-input'</span>,</div> <div style="padding-left:1.2em;">template: <span style="color:#2FD8B4;">`</span></div> <div style="padding-left:2.4em;">&lt;input [value]=<span style="color:#2FD8B4;">"value()"</span></div> <div style="padding-left:3.6em;">(input)=<span style="color:#2FD8B4;">"value.set($any($event.target).value)"</span></div> <div style="padding-left:3.6em;">(blur)=<span style="color:#2FD8B4;">"touch.emit()"</span> /&gt;</div> <div style="padding-left:1.2em;"><span style="color:#2FD8B4;">`</span>,</div> <div>})</div> <div><span style="color:#8B7CF6;">export class</span> <span style="color:#7CC4FF;">CustomInput</span> <span style="color:#8B7CF6;">implements</span> FormValueControl&lt;string&gt; {</div> <div style="padding-left:1.2em;"><span style="color:#8B7CF6;">readonly</span> value = <span style="color:#7CC4FF;">model</span>(<span style="color:#2FD8B4;">''</span>);</div> <div style="padding-left:1.2em;"><span style="color:#8B7CF6;">readonly</span> touch = <span style="color:#7CC4FF;">output</span>&lt;<span style="color:#8B7CF6;">void</span>&gt;();</div> <div>}</div> </div> <div style="display:flex;flex-direction:column;gap:24px;"> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;margin-bottom:10px;">REQUIRED SURFACE</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">A <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">value</code> model signal. Checkbox-style controls implement <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">FormCheckboxControl</code> with <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">checked</code> instead - never both.</p> </div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:10px;">OPTIONAL STATE INPUTS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#C9D4E2;"> <div>errors  invalid  pending</div> <div>disabled  disabledReasons  readonly  hidden</div> <div>touched  dirty  name</div> <div>required  min  max  minLength  maxLength  pattern</div> </div> <p style="font-size:25px;line-height:1.4;margin:14px 0 0;color:#8A97A8;">Declare only the ones the control uses. There is also <span style="color:#C9D4E2;">focus()</span> and <span style="color:#C9D4E2;">reset()</span> - no <span style="color:#FF7A6B;">valid</span>, so declaring one silently never updates.</p> </div> <p style="font-size:27px;line-height:1.4;margin:0;color:#8A97A8;">The schema validates. The control displays the result.</p> </div> </div>

<!--
Same custom input component, now written against Signal Forms. You implement FormValueControl, and you declare a value model signal. That is the required surface - one property. The formField directive detects the interface on your component and two-way binds the field's value to that model. No provider, no forwardRef, no ControlValueAccessor callbacks to write. If you want blur tracking, add a touch output and emit it on blur, and the field will mark itself touched for you. Everything in the box underneath is optional: errors, invalid, pending, disabled, disabled reasons, readonly, hidden, touched, dirty, name, and the constraint values - required, min, max, min length, max length and pattern. Declare the ones your control actually renders and ignore the rest. There are also focus and reset methods you can implement if focusing the host element isn't the right behaviour for your control. Two rules to remember. A FormValueControl must not have a checked property, and a checkbox-style control - which implements FormCheckboxControl and has checked instead - must not have a value. Never both. And one trap I want you to see coming: there is no valid input. TypeScript will happily let you declare one, because implementing an interface doesn't stop you adding extra members, and it will then sit there for the rest of its life never updating. Use invalid. Last thing, and it's a design point rather than an API point: don't put validation logic inside the control. The schema validates. The control displays the result.
-->

---
layout: content
eyebrow: 'Footguns'
heading: 'The ones that catch everybody'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:26px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:26px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:18px;">THE SCHEMA IS NOT AN EFFECT</div> <p style="font-size:27px;line-height:1.4;margin:0 0 18px;color:#C9D4E2;">The callback builds the rules once. A plain <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">if</code> is evaluated at construction and never again.</p> <div style="font-family:'JetBrains Mono',monospace;font-size:22px;line-height:1.55;color:#8A97A8;"> <div><span style="color:#FF7A6B;">if</span> (this.order().express) {</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">disabled</span>(p.pickupTime);</div> <div>}</div> <div style="height:0.5em;"></div> <div style="color:#2FD8B4;"><span style="color:#7CC4FF;">disabled</span>(p.pickupTime, ({ valueOf }) =&gt;</div> <div style="padding-left:1.2em;color:#2FD8B4;">valueOf(p.express));</div> </div> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:26px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:14px;">MISSING MEANS ABSENT</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">A field left out of the model - or initialised to <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">undefined</code> - is not in the tree. The rule type-checks, never runs, and the form reports itself valid.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:26px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:14px;">SHAPE IS STRUCTURE</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">The tree follows the model, so swapping one object shape for another destroys field state. Keep a stable shape and switch behaviour with rules. Arrays of objects are the exception - those items are tracked by identity, not position.</p> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:26px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:14px;">VALIDATION IS NOT THE BROWSER'S</div> <p style="font-size:28px;line-height:1.45;margin:0;color:#C9D4E2;">Validity lives in the field tree, not in native validity, and the old status classes are opt-in. CSS keyed on them stops applying, silently.</p> </div> </div>
<p style="font-size:28px;color:#8A97A8;line-height:1.4;margin:28px 0 0;max-width:1600px;">Three smaller ones: <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">required</code> treats an empty array as present, class instances lose their prototype on the first write, and hidden, disabled or readonly fields do not validate and do not count towards the parent.</p>

<!--
Four of these catch everybody, and two of them are lessons from earlier in this deck wearing different clothes. First: the schema callback is not an effect. It builds the rules once, when the form is constructed, and it never runs again. So if you wrap a rule in a plain if, that condition is evaluated exactly once and then frozen forever. That is the constructor-sees-defaults problem all over again - code that runs once, sitting in a place that looks reactive. The condition belongs inside the rule, in a when. Second: if a field isn't in the model, it isn't in the tree. Your rule still type-checks against the type, it just never runs. No error, no warning, and the form cheerfully reports itself valid - which is the silent-failure shape from chapter one. Initialise every field you actually want, and be aware that a field initialised to undefined counts as absent too. Third: the tree follows the shape of the model, so if you swap one object shape for another, the fields underneath are destroyed and rebuilt, and their touched and dirty state goes with them. Keep the shape stable and switch behaviour with rules instead. Arrays of objects are the exception there - items in an array are tracked by identity rather than by position. And fourth: validity lives in the field tree, not in the browser's native validity, and the old ng-valid and ng-invalid classes are opt-in now. So if you have CSS keyed on those class names, it stops applying, and it stops applying quietly. Three smaller ones to take away. Required treats an empty array as present, so an empty multi-select passes. Class instances lose their prototype the first time any field is written, because the write spreads the object into a plain one. And hidden, disabled and readonly fields don't validate at all, and don't count towards their parent's validity.
-->

---
layout: content
eyebrow: 'Guidance'
heading: 'What we do about it'
---
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:20px;">NEW FORMS</div> <p style="font-size:29px;line-height:1.45;margin:0;color:#C9D4E2;">Signal Forms. It is stable, it is semver-protected, and it is where the framework is going.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">EXISTING FORMS</div> <p style="font-size:29px;line-height:1.45;margin:0;color:#C9D4E2;">Leave them. Reactive Forms are supported and fine. Migrate when the form is being changed anyway, not as a project.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">EXISTING CONTROLS</div> <p style="font-size:29px;line-height:1.45;margin:0;color:#C9D4E2;">They keep working. <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">[formField]</code> binds any component that provides a <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">ControlValueAccessor</code>. Beyond that, <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">compatForm</code> and <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">SignalFormControl</code> bridge each direction.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:48px 0 0;max-width:1600px;">Be careful with examples online. The API was renamed repeatedly through its experimental phase, so a lot of material published before v22 uses names that no longer exist.</p>

<!--
Let me answer the question I know at least half of you are holding, which is whether this is a migration mandate. It is not. New forms use Signal Forms - it's stable, it's semver-protected, and it is where the framework is heading. Existing forms stay exactly where they are. Reactive Forms are supported and they are fine, so migrate a form when you're already in there changing it, not as a project with its own ticket and its own risk. And your existing controls keep working: formField will bind to a component that provides a ControlValueAccessor, which is the backwards-compatibility path rather than the preferred one, and where you need more than that there are bridges in both directions. compatForm lets a signal form hold real reactive controls inside its model, and SignalFormControl is an AbstractControl you can drop straight into an existing FormGroup. One warning to finish on, and it's a practical one. Be careful with what you find online. This API was renamed repeatedly while it was experimental, so a lot of material published before v22 uses names that simply don't exist any more. If you're following a blog post and the thing it tells you to import isn't there, check the version before you assume you've done something wrong. The churn was real, and it's over.
-->

---
layout: section
number: '09'
transition: fade
---
## In review

<p class="lead" style="margin-top:40px">The reactivity chapters, as questions you can ask about a diff.</p>

<!--
Right. If you were going to photograph one slide from today, it's the next one. Everything up to here has been the explanation - why these things happen and what's going on underneath. This is the part you can take back to a code review tomorrow morning and actually use.
-->

---
layout: content
eyebrow: 'Checklist'
heading: 'Symptom, and what to reach for'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:start;"> <div><div class="compare" style="grid-template-columns:1fr 1.1fr;font-size:24px;"> <div class="head">IF YOU SEE</div> <div class="head teal">REACH FOR</div> <div class="row-label">An effect that writes a signal</div> <div class="new"><code style="font-family:'JetBrains Mono',monospace;">computed</code>, or <code style="font-family:'JetBrains Mono',monospace;">linkedSignal</code></div> <div class="row-label">An effect that writes another component's signal</div> <div class="new">An input, or an explicit method on the owner</div> <div class="row-label">An <code style="font-family:'JetBrains Mono',monospace;">await</code> inside an effect</div> <div class="new">A resource keyed on a computed of the parameters</div> <div class="row-label">A non-signal read inside derived state</div> <div class="new">Bring it into the graph, or read it at render time</div> <div class="row-label">A decision taken in a constructor</div> <div class="new">Derived state, or a hook that runs after inputs are set</div> <div class="row-label last">A DOM write in a plain effect</div> <div class="new last"><code style="font-family:'JetBrains Mono',monospace;">afterRenderEffect</code> with a phase</div> </div></div> <div><div class="compare" style="grid-template-columns:1fr 1.1fr;font-size:24px;"> <div class="head">IF YOU SEE</div> <div class="head teal">REACH FOR</div> <div class="row-label">A fresh array or object per read</div> <div class="new">A <code style="font-family:'JetBrains Mono',monospace;">computed</code>, so identity is cached</div> <div class="row-label">A method call in a binding</div> <div class="new">A precomputed view object, bound field by field</div> <div class="row-label">An error mapped to an empty value</div> <div class="new">A distinct error state, carried to the template</div> <div class="row-label">Side effects in derived state</div> <div class="new">An owner that can also tear it down</div> <div class="row-label">A public writable signal</div> <div class="new"><code style="font-family:'JetBrains Mono',monospace;">protected readonly</code>, readonly at boundaries</div> <div class="row-label last">A fixed number of ticks in a test</div> <div class="new last">A predicate the test can wait on</div> </div></div></div>

<!--
This is the whole deck compressed into things you can look for in a diff. Left-hand column is the symptom, the thing you can literally see on the screen; right-hand column is what to reach for instead. I'm not going to read all twelve at you, because you'll have the slide - but I do want to put a finger on two of them. The first row is the one you will hit most often, by a distance: an effect that reads signals and writes a signal. That is the single largest cluster in everything we looked at, and almost every instance of it wants to be a computed, or a linkedSignal if the value also has to stay writable. And the one I would most like you to catch is over on the right: an error mapped to an empty value. That's the row where the cost isn't a wasted render - it's a person being told there is nothing there, when the truth is that we don't know. Everything else on here we've been through together: effects reaching into another component, an await inside an effect, non-signal reads inside derived state, decisions taken in a constructor, DOM writes in a plain effect, a fresh array or object on every read, a method call in a binding, side effects in derived state, public writable signals, and a fixed number of ticks in a test. The value of this slide isn't in me narrating it. It's in having it written down somewhere you'll see it again.
-->

---
layout: content
center: true
---
<div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.18em;text-transform:uppercase;color:#2FD8B4;margin-bottom:36px;">One thing to take away</div>
<h2 style="font-size:64px;line-height:1.15;margin:0 0 44px;max-width:1600px;">These bugs do not throw. They render.</h2>
<p style="font-size:32px;color:#8A97A8;line-height:1.5;margin:0;max-width:1500px;">Nothing in this deck fails loudly. A stale label, an empty list, a chart of zeroes and a form that says it is valid all look like working software. That is why the habits matter more than the review: by the time it reaches review, it already looks fine.</p>

<!--
I want to finish on this rather than on a summary. Every bug we have talked about today shares one property: not one of them throws. A stale label, an empty list, a chart full of zeroes, and a form that says it is valid - all four of those look exactly like working software. And the reason we keep shipping them isn't that they're hard to fix. Most of them are a one-line change once you can see them. It's that they're invisible when they work and invisible when they don't, so by the time the code reaches review, it already looks fine. That's why the habits matter more than the review does. Thank you - and I'm very happy to take questions.
-->
