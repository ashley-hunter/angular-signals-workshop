---
theme: default
title: Angular Signals
info: Signals in practice - the patterns we reach for, and the pitfalls we keep
  shipping.
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
Hi everyone, I'm Ashley Hunter and today we're going to take a little bit of a deep dive into Angular signals. 

I'm sure most of you are very familiar with signals at this stage, signals themselves are nothing new here and adoption is not our problem. The code base is already overwhelmingly signal based. 

But what does keep happening is a small set of mistakes That keep occurring, or certain patterns that have better alternatives and Today that we should start adopting more widely.  we're going to cover some of those things here.
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
So I have taken some time to analyze thousands of pull requests and go through our code base and identify some of the issues that keep coming up, or some of the patterns that we should try and move away from for more modern alternatives. 

Typically the issues fall into three categories. 

The first being stale, which is where a value may have been updated but the ui has not updated to reflect that. 

Next is Wasteful, which is the opposite essentially, where we are performing updates more frequently than necessary, or perhaps making network requests unnecessarily. 

And the last most common category is where errors occur but are maybe not handled in the best way - Sometimes making it unobvious to users, Or perhaps we can handle it better ourselves in the code.

There were a few others such as race conditions and things like that as well, but they weren't quite as prevalent. 

We have made updates to things like our Claude rules to try and prevent these issues from happening. However, sometimes Claude is more familiar with older patterns, or if it sees code written a certain way in our code base, it may replicate that, letting these things slip through, so Hopefully after today you might be a little bit more familiar with a few of these things and catch them whenever you're reviewing your own code or other people's code yourself.
-->

---
layout: section
number: '01'
transition: fade
---

## Derived state

<p class="lead" style="margin-top:40px">Where the largest share of review findings live.</p>

<!--
So we'll start off with some of the more basic things and then we'll work into more complicated scenarios. 

So we'll start off with derived state and this is where the largest group of findings were. So even though this is simple in terms of code complexity, it's also the most common place where we can improve.
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
So Angular gives us multiple primitives to use when working with signals. Signal and computed I'm sure we're all very familiar with. Linked Signal is a fairly recent addition and I'm going to cover it and how to use it in this talk Because this is something we don't use enough. 

And lastly, we have effect. It's not really a reactive primitive, but it is, of course, part of the reactive system, and it's something you need to be careful with it's absolutely fine to use in the right place, but we'll go over some of the caveats around it as well.
-->

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

<!--
Okay, so here we have an example where we have a rows input and a visible signal, and essentially we have an effect that updates any time the rows change and populates the visible signal with the enabled rows. 

So I suspect most people will immediately notice that this is something that could be changed to use a computed. But I do just want to go over some of the reasons why, because there is slightly more to it than what meets the eye. 

So first of all the visible signal is writable, which means that any part of this component could make changes to it. And that could result in stale or incorrect data, Or it getting overridden unexpectedly, which is an avenue for bugs Which doesn't need to be there. 

With agents writing The code these days, it may just see a visible signal that is writable and it will make some changes directly to it rather than looking at the bigger picture. So changing this to a computed eliminates this potential source of bugs.

--- change slide

Secondly, there are some performance aspects to it. Now, this is a very simple case, so it's very unlikely to have a noticeable impact on the page performance, But on a heavy page with more logic performance might be something to consider. 

So the first thing is that the effect reruns every time rows changes, even if nothing is listening to the visible value. So for example, let's say the thing in the UI rendering the visible rows is conditionally shown with an @if - In our current state, that effect is going to rerun even though it's not being rendered in the UI. So completely unnecessary logic running. 

Secondly, the way Angular updates things is effects run after all of the signals have stabilized, So rows gets updated in one change detection pass and then effect runs and we are modifying a signal which would need a second change detection pass. If we were to switch to computed, both of these issues go away. We only need one change detection pass and it would only update the computed whenever something is actually listening to it.
-->

---
layout: content
eyebrow: 'The same shape, older API'
heading: 'You already refuse to write this in RxJS'
clicks: 2
---

<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:0 0 24px;max-width:1660px;">Writing into a subject from inside a subscribe is the same bug with a different import. It migrates to the same place.</p>
<div style="max-width:1180px;">

````md magic-move
```ts
// AVOID
readonly rows$ = new BehaviorSubject<Row[]>([]);
readonly visible$ = new BehaviorSubject<Row[]>([]);

readonly #sync = this.rows$.subscribe((rows) => {
  this.visible$.next(rows.filter((r) => r.enabled));
});
```

```ts
// BETTER
readonly rows$ = new BehaviorSubject<Row[]>([]);

readonly visible$ = this.rows$.pipe(
  map((rows) => rows.filter((r) => r.enabled)),
);
```

```ts
// PREFER
// no subscription, and no async pipe in the template
readonly rows = signal<Row[]>([]);

readonly visible = computed(() =>
  this.rows().filter((r) => r.enabled),
);
```
````
</div>

<!--
There's also opportunity to improve similar situations in RxJS code. So here we have the exact same scenario, but instead we're using a subscribe on the observable To perform the filtering and you would be using an async pipe in the template to read it. 

--- change slide

Of course one optimization here would be to change this to use pipe and use a map operator Instead.

--- change slide

But switching this to signals removes the subscription and there's no async pipe needed in the template and we also don't have to deal with the initial null state of an observable, whereas you might have before had to handle this with like an if block.
-->

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

<!--
Okay, so here is a Slightly different example. In this case it would be a pagination scenario. So we need to store the current page, we need to be able to move to the next and previous pages, and we also need to be able to reset back to the first page any time a filter changes. 

So, yet again, we have a signal that's writable, and we have an effect performing an update. 

We can't use a computed here because while we do want to react whenever a Dependency changes we can't write to your computed.

Fortunately, recently Angular has come up with an alternative here, which is essentially a linked signal, which if you're not familiar with is Essentially a writable computed. 

-- change slide

So now we remove the signal and the effect. And we use a link signal which has a function which gets run anytime any of its dependencies change and returns the appropriate value. In this case, anytime filter changes we are returning a value of 1, so that handles our reset and our next and previous methods stay as they are, as we still allow updates, and those updates don't re-trigger the Computation function.
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
Next is another slightly more complicated example, And I'd like you to think about how we could handle this kind of scenario. We have two input fields, and changing one should automatically update the other. 

So when we enter a Celsius value, Fahrenheit should be updated, and vice versa. 

Currently we have a Celsius signal and we have a Fahrenheit linked signal. So as it stands, any time I change the Celsius value, the Fahrenheit linked signal will rerun and get recomputed. 

However, if I was to currently type in the Fahrenheit input, Celsius wouldn't update. 

Your initial gut feeling might be to change Celsius also to a link signal, but doing that would introduce a circular dependency. 

Luckily, with Angular 22, linked Signal comes with a new option. 

--- change slide

Which is a set function on a link signal. This is an untracked function that gets called whenever a linked signal gets set, And allows us to update the source. By this one simple change, now both fields stay in sync, With no risk of them getting out of date Or showing stale data.
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
I will not go into too much detail on this, but just something to be aware of whenever you're using any of Angular's signal functions. Some of the functions you pass are tracked, meaning that they rerun automatically whenever any dependencies change, Others are not tracked, so it's just good to have some awareness to ensure that things are updating when you expect and also things aren't running more often than you expect. 

So the green functions are tracked and the red ones are not tracked.
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
In the previous slides, we've kind of discussed how to avoid using effect, but I don't want to insinuate that effect should never be used. There are absolutely valid reasons to use effect, it's just we want to make sure you're using them in the right place. 

Quite often with dealing with third party libraries that may not be using signals, we might need to use effects to bridge that gap of connecting the reactive world to the non-reactive world. 

Also when storing Data, for example, in local storage or a URL, that is also another potential use case for using an effect, or also things like logging etc..

But the key thing to ask yourself any time you're using an effect is what is the non-reactive thing this effect is driving? If you can't answer that question, you're probably using an effect when you don't need to. 

Ideally also you would have one effect per side effect And it's often better to have this as a named property on the class rather than something buried in the constructor. This helps Make it clear why the effect is needed, and what it does.
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
Okay, so Now moving on to some examples where you're using an effect but things can go subtly wrong. 

In this example we have an effect that Updates a third-party library, in this case a grid. but it is using the async keyword and an await in its function body. One thing that may not be immediately obvious is that effects stop tracking the moment it goes async. 

So in this example as it stands We have the team ID being read, which is a dependency, and that dependency is registered because nothing asynchronous has happened at this point yet. 

We then wait for users to load and we render them in the grid. But notice that format here is also a signal, and that signal read is not tracked because it comes after the await. 

This can lead to unexpected results because any time the format changes the grid is not going to get re-rendered. 

--- change slide

So, the fix of course is to get rid of async await from the effect. However, this also gives us the opportunity to start leveraging some of Angular's other reactive primitives, and in this case, we can use a resource which is perfect for handling asynchronous code in an effect.

So let's look at what has changed here. We have created a user's resource and we pass the team id to params, Which if you remember from the list earlier, is one of the reactive functions. So any time team id changes, the loader function will get called - no effect needed for this.

Now, the effect can simply call the resource's value signal, and even though there is some asynchronous work going on, we write our code in a completely synchronous way. So not only does this avoid the async bug, but it also makes our code cleaner, simpler to maintain and understand. 

There are also a few improvements here. So for example, if Team ID changes multiple times in quick succession, Resource takes care of cancellation, so we're not going to have race conditions. It will always be the latest value wins. But not only that, now if we change format We don't need to refetch the users either, so we have reduced network calls as well.
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
Cleanup is another important aspect of writing effects. Particularly when your effect does something like setting timeouts or intervals, making requests or setting up event listeners. 

In this very simple example, we can see here that we have an effect that performs a check every five seconds. However, we are tracking order ID here, so any time this changes we will register a new interval. 

If the order ID changes three times, we now have three intervals running and two of them are checking stale information. 

--- change slide

So any time you're doing something like this, just be sure to accept the cleanup function as an argument and tear down anything you need. And this not only runs whenever a component is destroyed, it also runs any time the effect re-evaluates.
-->

---
layout: section
number: '02'
transition: fade
---

## Dependencies

<p class="lead" style="margin-top:40px">The set is observed, not declared. That is where stale comes from.</p>

<!--
So we've touched a little bit on dependencies so far, but we're going to dive in a little bit deeper into them.

Signal dependencies are all determined at runtime, so this can let issues slip through very easily. There's no compile time checking, and equally additional dependencies are easy to add, without noticing the impact they might have.
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
Dependencies in a signal graph can be wrong in Two ways. 

Dependencies may not update often enough, or they may update too often. This can either lead to stale data being presented to a user, Or updating too often, potentially leading to performance degradation or additional server requests that are completely unnecessary. 

So let's take a look at this example. We have a state signal that contains the team ID, page and the sort by field. And we have a rows resource which any time the state changes will fetch the rows.

So here we have a prime example of something that might call the server more often than necessary. If we look at what is being passed to the load rows function, We can see that sort by is never used. So if sort by is changed, this would make a request that It is completely unnecessary. 

--- Change slide. 

The initial thing you might think to do is let's change params so that it only returns the team ID and the page, dropping sort by. 

However, this also will still cause the request to be made anytime sort by changes, because in the params function. We are still Tracking the state object in full. So while it looks better, it is no different In terms of how it behaves. 

--- Change slide. 

So the correct solution for this would be to split these up into multiple signals. Or you could potentially create a params computed that accepts inequality function, As by default they are compared by reference.
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
Another area where bugs can very easily creep in, is effects that call another function or method in our code base. Here we have an effect that any time a page changes we send some analytics. 

This works absolutely fine, and there is nothing wrong with this code At the moment. However, in this scenario, the analytics service is in a completely separate file and has no real connection to the effect that calls it. So if six months down the line someone comes along and updates the analytics service and introduces a signal read, This can have Unexpected consequences. 

--- Change slide. 

Now someone has added a recent signal that takes the current value and spreads it and updates it. While Normally I would rather the update function on the signal was used instead. What we have here is a case where Ping now has introduced an infinite loop. 

If we look at the chain of events here, any time page gets updated, analytics are sent, the recent signal is updated but we're doing a signal read here as well and because we are still within the effect this is now tracked. As recent is both being read and set within the same method here, we now have gotten ourselves into a bad situation. 

Again, This is something that if the change was made in isolation would look fine and there's no compile time safety that would detect this. This is purely something that you're going to have to discover at runtime. 

--- Change slide. 

An easy solution to this is any time you are calling an external function or method within an effect where you do not have control of what signals are being read or written to should be wrapped in the untracked function, which prevents effect from adding any more dependencies.
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
This kind of bug was the most common detected one in our code base. 

So if we take a look here, we have our computed rows which takes in items and maps over it. But we're doing a translation on the label. The issue is that If a language were to change, our UI would not get re-rendered because we're taking a snapshot for the label rather than having any kind of Reactive dependency. . 

While this is a very specific example, the pattern applies to a lot of different places. This could be function calls, getters. Storage reads, Reading something like the current time, Or a URL parameter - All of these things are not reactive and therefore won't update when you might expect - even though we're using a reactive feature like computed.
-->

---
layout: section
number: '03'
transition: fade
---

## Timing

<p class="lead" style="margin-top:40px">When your code runs relative to inputs and to render.</p>

<!--
Timing is an interesting topic because the code in these examples generally look correct and it's not always obvious what is causing the problem. 

There are no logic errors and there are no compile time errors. Things just don't quite work as you might anticipate.
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
So we've had pull requests do this exact thing multiple times. Luckily they have been caught in the code reviews, but it's something to be aware of. 

In this example we have an input and in our constructor we are checking whether it's a tree and if it is we start observing. 

There are a few issues here. First, Angular doesn't set inputs by the time the constructor runs, so mode will always be the default, which is tree.

--- Change slide. 

Great, so let's move this check to the NG on init lifecycle hook. That does resolve the problem with the initial value being read incorrectly. But we still do Not handle the case where mode changes after the component is initialized. 

--- Change slide. 

So, this is a good use case of an effect. And here we also have an onCleanup function which allows us to tear down the observation that starts whenever mode is set to a tree.
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
Some of you may have considered using ngion changes in the previous example, and there still are 140 usages in our code base, 39 of which are in files using the new signal inputs. 

Ideally we should try and move away from ng on changes and move to more reactive primitives. 

If you have something that recomputes From one or more inputs, use a computed. 

If you're resetting some local state, but the user can still override it, reach for linkedsignal

And if you're driving something non-reactive, reach for an effect. 

There is no equivalent for first change in these reactive primitives, but if you're reaching for that, it's probably something that belongs somewhere that runs once, for example, ng on init.
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
So the DOM itself is a non-reactive api - So occasionally we do need to perform some kind of effect to update the UI whenever signals change.

You might initially go to use an effect for this kind of behaviour.
 
But there are A few issues with using effect. An effect may fire too early, for example if an element is initially hidden due to an if or for block that may not have refreshed by the time the effect fires. A similar situation can happen if you're targeting child components. 

But Angular provides us with a utility specifically for interacting with the DOM On signals. 

--- Change slide. 

After render effect ensures that it gets run after everything in the view is refreshed, but more importantly it gives us control over when to run the code. 

You can see here that we are using the write phase because we are performing an update to the DOM. Batching things in the correct phase can give us some great Performance benefits.
-->

---
layout: content
eyebrow: 'Render phases'
heading: 'Pick the phase, do not take the default'
---

<div class="compare" style="grid-template-columns:0.5fr 1fr 1fr;margin-bottom:40px;"> <div class="head">PHASE</div> <div class="head teal">FOR</div> <div class="head">CONSTRAINT</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">earlyRead</code></div> <div>Measuring, before anything writes</div> <div>Never write here. Prefer <code style="font-family:'JetBrains Mono',monospace;">read</code> if it can wait</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">write</code></div> <div>Mutating the DOM</div> <div>Never read layout here</div> <div class="row-label"><code style="font-family:'JetBrains Mono',monospace;">mixedReadWrite</code></div> <div>The default, and the reason to be explicit</div> <div>Only when unavoidable</div> <div class="row-label last"><code style="font-family:'JetBrains Mono',monospace;">read</code></div> <div class="last">Inspecting after all writes</div> <div class="last">Never write here</div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">A read after a write in the same phase forces layout. The phases run in a fixed order, so splitting them is usually a two-line change.</p>

<!--
There are four phases available to you.

The first is early read. This is when you want to measure some DOM elements before anything writes - Ideally you would use the read phase where possible, you would only use the early read if you're trying to measure the DOM before you make any updates to it. 

The next is the write phase, where you can perform DOM manipulation. Never read in this phase. 

mixed read-write is the default and you typically want to avoid it wherever possible. You should ideally use one or more of the other phases. 

And lastly we have the read phase. This is where you can read DOM sizes after all updates have taken place. 

This helps us ensure we don't accidentally cause some expensive reflow. Which if you're not familiar with is when we perform a read after a write - And this causes the browser to have to recompute all of the sizes on the page right away. And this can cause significant slowdown on a page.
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
Here we have an example where we're iterating through every row, collecting the row's height, and then updating it, increasing the size by eight pixels. 

If there are 200 rows, this forces the browser to relay out everything 200 times. This is very inefficient and can noticeably slow down your page. 

There are lots of properties and methods in the browser that would cause force layout, and I've listed some of them here. 

--- Change slide. 

A better way to deal with this would be to use the phases that we previously touched on, and we can use multiple phases. 

So here we have an early read phase which goes through every row and collects the height. This value is returned and gets passed to the write function. Now, the write function can simply iterate overall of the rows and update their height. 

This has now changed the scenario from two hundred forced layouts on a page down to one. 

So this is an important one to bear in mind when you're working with the DOM.
-->

---
layout: section
number: '04'
transition: fade
---

## Purity and cost

<p class="lead" style="margin-top:40px">Derived state is read often, and at unpredictable times.</p>

<!--
This next section covers things that can slip through reviews and often render correctly at first, but on subsequent changes or under load can begin to reveal their flaws.
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
We previously discussed trying to use a computed instead of an effect where possible, but there are occasions where Where an effect is still preferable, even though it might not seem obvious. 

In this case, we are creating a worker whenever some dependent signals change. However, a computed has no teardown capability. 

As such, every time these signals change, a new worker is created and the old ones never stop. 

This works and will not throw an error. So it can be very easy to have this slip through and slowly accumulate memory behind the scenes. Things like this could go unnoticed for quite a while. 

--- Change slide. 

Instead, this is a good case where you might want to use an effect And the cleanup function provided to terminate the worker any time it Needs reinstantiated. 

The same applies to similar things like sockets or resize observers or mutation observers. Anything that might need disposed cannot live in a computed
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
So let's take a look at this grid example where we're passing the visible rows in via an input. 

Currently, this is using a method, which is inefficient in itself because the method gets called and performs filtering on every change detection cycle, whereas really it should only get recalled whenever the rows change. 

--- Change slide. 

Quite often this is enough, but Let's say for example we were polling the server frequently to update the rows. In most cases, it returned the identical results every time. But computeds work based on referential equality, not the values within it. 

So one feature that Angular does provide us to assist with this is a equality function. And we can provide this to a computed to tell it exactly how we want it to compare values to prevent it from updating more often than necessary. 

--- Change slide. 

So here we've added our own comparator function where we check if the length is different, we know rows have most certainly changed. And in this case we're also checking whether the IDs and revisions have changed. 

Now only when those exact properties have changed will the computed essentially be marked as changed. You shouldn't need to reach for this often, but it's good to be aware of its existence, when performance really matters.
-->

---
layout: section
number: '05'
transition: fade
---

## Async state

<p class="lead" style="margin-top:40px">Loading, empty, error, and the difference between them.</p>

<!--
Moving on to dealing with asynchronous state. And this is where a lot of issues become user visible, And pretty much every finding here was something that we have shipped or came very close to shipping - These were things that looked completely fine on screen but there was a real issue hiding behind the scenes.
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
This is a similar example to earlier when we touched on avoiding async await in an effect. But typically when we're making requests, there are other things we also want to consider that we didnt touch on.

The first being a loading flag, so that we can show a loading spinner in the UI. Nothing actually cancels the request if another one fires before it finishes. And we're not handling any errors anywhere. 

Angular provides us with three resource types that we can use in our code to Help address all of these issues for us with minimal code.   

--- Change slide. 

The first is HTTP resource. This allows us to simply pass a function That returns a URL. We can also call signals within this function and they are tracked, so any time that signal changes, we re-perform the request. The great thing is what you get for free is access to the value as a signal. We also get access to the loading state and the error state and the status. We get a reload function that we can call manually if we want to perform a manual reload. It automatically prevents race conditions and cancels superseded requests. 

So as you can see, not only is our code much simpler and easier to understand, but we also eliminate several different categories of issues.

The other two Utilities are Rx Resource, Which essentially does the same thing but lets you use an observable to load the data, while still giving you signals back. And the last one is resource, which is is essentially the same as HTTP resource, only rather than returning a string, you would actually perform the request yourself in there. 

One thing to note is that you want to avoid doing post requests in an HTTP resource, It's intended to be only used for fetching data. 


Just keep that function to the few signals the request actually needs, otherwise every unrelated change becomes a refetch. And keep resources for reads only, because they reissue the request on every parameter change, and you don't want a delete being sent again.
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
So creating a resource is the easy part. Where people tend to go wrong is how they render it.

There are four things you need to show on screen: an error, a value, a loading state, and idle, which is when params returns undefined and nothing has been asked for yet.

And the order of this template is actually most of the job.

We check error first. Otherwise a failed reload just renders the old data, and the user has no idea anything went wrong.

Then hasValue comes before isLoading, because during a reload both are true. If isLoading came first, we'd flash a skeleton every time we refresh. This way we keep the old rows on screen while the new ones load.

Then isLoading, which now genuinely means a first load. And the final else is idle, so we prompt the user rather than pretending to load.

If you collapse any two of these, you usually end up with a bug report that just says "it showed nothing", and it's really hard to reproduce.
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
This one was filed five separate times, and every time it looked like good defensive code in the diff. Somebody added a catch so the page wouldn't blow up.

But because the promise no longer rejects, the resource never reaches its error state. So our template takes the hasValue branch and renders an empty list. The request failed, and the user is told the team has no members.

The fix here is actually deleting code. Just let the loader reject. The resource already has an error state, and we've already written the branch for it.

To be fair, there is a reason people do this. Reading value in an error state throws, and inside a computed that error gets passed on to everything downstream. So people hit that and reach for a fallback.

But the answer is to guard rather than swallow. Use hasValue, which is already false in the error state.

Because an empty list, a zero or a missing button are all valid ways to render real data. None of them can tell the user that something failed.
-->

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

<!--
This is actually the biggest number in the whole research. We have close to 1,500 toSignal calls in our code base, and around 1,370 of them look like this where it returns a value or undefined.

That means the signal is undefined for at least one tick. So in a template we fall into the empty branch and show something like "not signed in" or an empty list before the real value arrives.

Usually it's only a frame, so nobody notices. But It's something to keep in mind where our UI might flicker or show stale data temporarily. 

--- Change slide.

So the first option is requireSync. If your observable emits as soon as you subscribe, like a BehaviorSubject or a store selector, you get a plain Signal of User. And if you're wrong about that, it throws straight away in dev, rather than causing a problem in production months later.

--- Change slide.

The second is an initial value, for sources that can't emit straight away. That way the starting state is something you safely show, rather than undefined.

Keeping undefined is also fine if it actually means something to you, like showing a skeleton. The bug is just not picking any of these.
-->

---
layout: section
number: '06'
transition: fade
---
## Boundaries

<p class="lead" style="margin-top:40px">What a signal exposes, and to whom.</p>

<!--
This next section is a fairly quick one. Everything in here takes about a minute to fix, but because it's so easy, it tends to come back in the next pull request. So think of these more as habits to build.
-->

---
layout: content
eyebrow: 'Visibility'
heading: 'Template-only state is not public API'
---

<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:40px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;margin-bottom:18px;">protected readonly</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Anything the template reads and nothing outside needs: derived state, signal queries, view helpers.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;margin-bottom:18px;">#private</div> <p style="font-size:28px;line-height:1.5;margin:0;color:#C9D4E2;">Anything neither the template nor a consumer touches. Enforced at runtime, not just by the compiler.</p> </div> </div>
<p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0 0 20px;max-width:1600px;">A signal anything can reach is an invitation, and your invariant now has two owners. <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">protected</code> closes that door; <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">readonly</code> only stops reassignment.</p>

<!--
So Angular templates can read protected members, And I believe they recently added support for private members - im not sure if that is availble to use yet. Your template isn't an external consumer, so it doesn't need a public API.

For signals in particular, mark them as read-only. You typically never want to override a signal with a brand new signal, as that completely removes It from the reactive graph. 

For anything that's genuinely internal, our rule is to use a hash private field, which is enforced at runtime as well.
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
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 30px;"><div style="font-size:22px;color:#8A97A8;margin-bottom:8px;">After a consumer calls <code style="font-family:'JetBrains Mono',monospace;font-size:21px;">pop()</code></div><div class="swap"><div v-click.hide="1"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:23px;color:#8A97A8;">items().length</span><span style="font-family:'JetBrains Mono',monospace;font-size:32px;color:#FF7A6B;line-height:1;">4 &rarr; 3</span></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid #1E252F;"><span style="font-family:'JetBrains Mono',monospace;font-size:23px;color:#8A97A8;">items() === items()</span><span style="font-family:'JetBrains Mono',monospace;font-size:32px;color:#FF7A6B;line-height:1;">true</span></div><div style="font-size:24px;color:#FF7A6B;line-height:1.4;margin-top:18px;">The contents changed. The reference did not, so nothing was notified and nothing reran.</div></div><div v-click="1"><div style="font-family:'JetBrains Mono',monospace;font-size:23px;color:#2FD8B4;line-height:1.45;padding:13px 0 16px;border-bottom:1px solid #1E252F;">Property &#39;pop&#39; does not exist on type<br>&#39;readonly Item[]&#39;.</div><div style="font-size:24px;color:#2FD8B4;line-height:1.4;margin-top:18px;">The edit cannot be written in the first place, so the two can never disagree.</div></div></div></div>
</div>
<p style="font-size:28px;color:#5E6B7D;line-height:1.45;margin:30px 0 0;max-width:1660px;">The signal protects the reference, not the contents. Nothing reruns, because from the graph's point of view nothing changed.</p>

<!--
In most of the examples so far, the signal changed and something wasn't listening. In this one, the signal never changes at all, but the data inside it does.

So here a consumer pops an item off the array it was given. But a signal hands out a reference, not a copy, so that's the exact same array sitting inside the signal.

As you can see on the right, the array went from four items to three, but it's still the same object. And signals only compare the reference, so as far as Angular is concerned, nothing happened. No computed reruns and no effect fires.

So anything that reads the array directly sees three items, but anything derived from it, like a computed count, still thinks there are four. And it stays that way until something unrelated triggers an update. 

--- Change slide.

The fix is just a type. If we mark the array as readonly, pop isn't there to call, so you get a compile error the moment someone writes it. And there's no runtime cost to this at all.
-->

---
layout: section
number: '07'
transition: fade
---
## Signal Forms

<p class="lead" style="margin-top:40px">The same ideas, applied to the one API built entirely on them.</p>

<!--
So this is the last section, and it'll be a bit shorter than it deserves, as signal forms really needs a session of its own. But it's the one API in Angular built entirely on the ideas we've just gone through, so you'll probably recognise a lot of it.
-->

---
layout: content
eyebrow: 'Introduction'
heading: 'A third forms API, built on signals'
---

<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0 0 52px;max-width:1550px;">Stable in v22. You keep your data in a signal, pass it to <code style="font-family:'JetBrains Mono',monospace;font-size:29px;color:#2FD8B4;">form()</code>, and get a form back - no control tree to keep in sync.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Your own data is the form's data, and everything the form knows about a field is a signal.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS NOT</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A migration. Reactive forms still work, and so do the controls we have already built - but new forms should use signal forms.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT CHANGES</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Validators stop being things you add and remove. They become rules that know when they apply.</p> </div> </div>

<!--
So signal forms is stable as of v22.

It isn't a migration though. Reactive forms are still supported, and your existing custom controls will keep working.

The main difference is where the data lives. Your data is the form's data. You keep it in a signal, hand it to form, and everything about each field, so its value, whether it's valid, whether it's been touched, is itself a signal.

So there's no control tree to build or keep in sync, and validators become rules that know when they apply.
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
So there are three pieces to a signal form, and that genuinely is all there is to it.

--- Change slide.

First, your data goes in an ordinary writable signal. There's nothing special about it, it's the same signal you'd write anywhere else.

--- Change slide.

Then you pass it to form, and you get back a field tree that's shaped exactly like your data.

--- Change slide.

And then you bind a control using formField, pointing it at the field. So loginForm.email and loginForm.password.

--- Change slide.

So if you type in that email box, loginModel updates, because the form doesn't keep a copy of anything.
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
So here's how it compares to something more familiar. On the left we have reactive forms, where we build a control tree and bind out of it. On the right, we have a signal with plain data, a call to form, and bindings pointing straight at the fields.

I'm not trying to make reactive forms look bad here. For a form this simple, there honestly isn't much wrong with the left side. Where it really starts to matter is when data has to move in and out of the form, or when one field depends on another.
-->

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

<!--
So validation rules go in the schema, which is the second argument to form. Rather than attaching validators to controls one at a time, you describe in one place what has to be true about the data.

This schema function gives you what's called a schema path, which is essentially just Another object that has the same structure as your data, and it essentially is a path to each property in your object. So it gives us a type safe way to reference these fields and then we can just use these validator functions to apply rules to them. 

One nice change because every rule can carry its own message, the template doesn't need to know which rules were applied. One loop over the field's errors can render any field in the form, rather than an if block for every error type on every field like we often write today.

And if you need something custom, there's also validate for your own rules, and validateHttp for checks that need to hit a server.
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
Here's an example of where the new forms API starts to shine. When the checkbox is on, email is required, and when it's off, it isn't.

Today we'd typically subscribe to valueChanges, use startWith for the initial value and takeUntilDestroyed for cleanup, and then add or remove the validator and update the validity ourselves. That's four steps of bookkeeping done by hand.

--- Change slide.

With signal forms, this is it. Email is required when notify is true.

No subscription, no adding or removing validators. We describe the relationship once, and the framework works out when it applies. And the form on the right behaves exactly the same.

--- Change slide.

So it's really the same idea as computed. We stop orchestrating the response, and just describe the rule. And Angular provides us with quite a few helpers in this when function for accessing other properties or states of other components. And every validator supports a when property.
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
If you've ever had to write a custom form control, you will know very well about how Much boiler pit is required to integrate it. 

With ControlValueAccessor, we need a provider with a forwardRef, a private copy of the value, two stored callbacks, and the interface methods to wire it all together. Very verbose. 

--- Change slide.

With signal forms, we implement FormValueControl and declare a value model signal, and that's it. No provider, no forwardRef and no callbacks. If we add a touch output, the field gets marked as touched on blur.

Everything along the bottom is optional, so you only declare the things your control actually needs.

One trap to watch out for is that there's no valid input. TypeScript will let you add one, but it'll never update, so use invalid instead.

And keep validation out of the control itself. The schema does the validating, and the control just displays the result.
-->

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

<!--
So this slide really answers why you'd want to switch.

The first one is really the whole argument. Everything is a signal, and that's the reason the rest of this list is true.

Most of these we've already seen, so I won't go over them again. A couple of new ones are reusable schemas, so you can define the rules for something like an address once and use them anywhere, and type-safe paths, so renaming a field gives you a compile error.

And the one that surprises most people is Standard Schema support. So the same Zod schema that's validating a payload on the server can validate your form as well.

It's also backwards compatible, so your existing controls and reactive forms keep working alongside it.
-->

---
layout: section
number: '08'
transition: fade
---
## In review

<p class="lead" style="margin-top:40px">The reactivity chapters, as questions you can ask about a diff.</p>

<!--
So everything up to now has been the explanation. This next part is something you can actually take into a code review tomorrow, and if you're going to take a photo of one slide today, make it the next one.
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
So this is essentially the whole talk compressed down into things you can look out for in a diff, with the symptom on the left and what to reach for on the right.

I won't read them all out, but Hopefully this gives you a little bit of an insight into the most common source of bugs and issues around signals and perhaps some More modern approaches that we can take in our code going forward.
-->

---
layout: content
center: true
title: 'Questions?'
---
<h2 style="font-size:88px;line-height:1.1;margin:0 0 56px;">Questions?</h2>
<div style="display:flex;gap:44px;font-family:'JetBrains Mono',monospace;font-size:26px;color:#5E6B7D;"> <div>angular.dev/guide/signals</div> <div>angular.dev/guide/forms/signals</div> </div>

<!--
So I'll open it up for questions now.

[If nothing comes straight away]

I'm curious, which of these have you actually run into yourselves? And is there one you disagree with?

I'm genuinely more interested in the second one. A couple of these findings were argued down when we first raised them, and the arguments were good.

[If someone asks how to find these in a running app, given none of them throw]

That's a great question. Honestly, the best answer is debugName plus the signal graph in Angular DevTools, and it's a lot better than it sounds. If you name your signals when you create them, the graph becomes really readable. A stale value is essentially a missing edge, and the graph draws the edges for you.
-->
