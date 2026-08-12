---
theme: default
title: Angular Signal Forms
info: A talk on Angular's signal-based forms
canvasWidth: 1920
colorSchema: dark
highlighter: shiki
transition: slide-left
mdc: true
layout: cover
eyebrow: '@angular/forms/signals &middot; stable in v22'
meta: ['Frontend Guild', '20 min']
---

# Angular Signal Forms

A third forms API, rebuilt on signals - what it looks like, how it compares to what we run today, and what adopting it would cost us.

<!--
Twenty minutes. Goal: you leave knowing the shape of the API, how it differs from what we run
today, and whether it is worth a pilot.
-->

---
layout: content
eyebrow: Starting point
title: Where reactive forms strain
---

<div class="cards" style="--cols:2">
  <div class="card">
    <div class="label">TWO MODELS</div>
    <p>Component state lives in signals. Form state lives in a tree of control objects. Every screen syncs the two by hand.</p>
  </div>
  <div class="card">
    <div class="label">SUBSCRIPTIONS</div>
    <p>Change propagation runs through <code>valueChanges</code>, so each dependency needs a subscription and a teardown.</p>
  </div>
  <div class="card">
    <div class="label">VALIDATION AT CONSTRUCTION</div>
    <p>Rules attach when the control is built, so conditional rules become imperative setter calls scattered across the component.</p>
  </div>
  <div class="card">
    <div class="label">BOILERPLATE ON SUBMIT</div>
    <p>Loading flags, touch-all-on-error, mapping server errors back onto controls - written again in every feature.</p>
  </div>
</div>

<!--
Not a takedown. These are the four places our own codebase pays a tax every sprint.
-->

---
layout: content
eyebrow: The core idea
center: true
alt: true
---

<p style="font-family:var(--font-display);font-size:72px;font-weight:500;letter-spacing:-0.03em;line-height:1.2;max-width:1500px">
You give <code>form()</code> a writable signal. You get back a field tree whose value, validation, metadata and submission state are all signals.
</p>

<p class="lead" style="font-size:34px;margin-top:56px;max-width:1300px">
No second abstraction layer, no subscriptions, no separate change-detection story. Form state joins the signal graph the rest of the component already lives in.
</p>

<!--
This is the whole thesis. Signal Forms are not an evolution of reactive forms; they are a
from-scratch implementation on the same reactivity primitives we already use.

Worth adding: per Alex Rickabaugh, forms were one of the main drivers of picking signals to
replace zone.js in the first place.
-->

---
layout: section
number: '01'
---

## The API

<!-- Seven slides on the API. Snippets are illustrative, not copy-paste ready. -->

---
layout: content
eyebrow: 'Api &middot; 1 of 7'
title: Anatomy of a signal form
split: 1.15fr 0.85fr
---

```ts
import { form, FormField } from '@angular/forms/signals';

loginModel = signal({ email: '', password: '' });
loginForm = form(this.loginModel);

// template
// <input [formField]="loginForm.email" />
// <input [formField]="loginForm.password" />
```

::right::

<div class="notes-col">
  <div>
    <div class="label">THE MODEL</div>
    <p>A writable signal holding plain data. It is yours; the form does not own it.</p>
  </div>
  <div>
    <div class="label">THE FIELD TREE</div>
    <p>Structure mirrors the model, typed end to end. No control classes to declare.</p>
  </div>
  <div>
    <div class="label">THE BINDING</div>
    <p>One directive wires value, state and validation into the DOM control.</p>
  </div>
</div>

<!--
Model is a plain writable signal of plain data. form() wraps it. The FormField directive binds a
leaf to an input. That is the minimum viable form.
-->

---
layout: content
eyebrow: 'Api &middot; 2 of 7'
title: Field state is a signal you read
---

<p class="lead" style="max-width:1250px">
Every node in the tree carries its own value, validation and interaction state. Templates read it directly; derived UI state is just a <code>computed</code>.
</p>

<div class="cards tight" style="--cols:4">
  <div class="card">
    <div class="label teal">value()</div>
    <p>The current value, writable through the same node.</p>
  </div>
  <div class="card">
    <div class="label teal">errors()</div>
    <p>Structured errors with kind and message, ready to render.</p>
  </div>
  <div class="card">
    <div class="label teal">touched()</div>
    <p>Interaction tracking, plus dirty and disabled alongside it.</p>
  </div>
  <div class="card">
    <div class="label teal">pending()</div>
    <p>In-flight async validation, no manual flag to maintain.</p>
  </div>
</div>

<div class="card" style="margin-top:48px;font-family:var(--font-mono);font-size:26px;color:var(--text-strong);padding:36px 44px">
  &#64;if (loginForm.email().touched() &amp;&amp; !loginForm.email().valid()) { &hellip; }
</div>

<!--
Every node exposes state as signals you read in the template. valid/pending/touched are derived,
not stored.

Tripwire worth calling out: while pending() is true, valid() and invalid() are BOTH false.
-->

---
layout: content
eyebrow: 'Api &middot; 3 of 7'
title: Validation lives in a schema
split: 1.2fr 0.8fr
---

```ts
loginForm = form(this.loginModel, (path) => {
  required(path.email, { message: 'Email is required' });
  email(path.email);
  minLength(path.password, 12);
  debounce(path.email, 500);
});
```

::right::

<div class="notes-col">
  <p>Built-ins cover the usual set: <code>required</code>, <code>email</code>, <code>min</code>/<code>max</code>, <code>minLength</code>/<code>maxLength</code>, <code>pattern</code>.</p>
  <p>Messages are part of the rule, so error copy stops living in the template.</p>
  <p class="dim">Hidden and disabled fields skip validation until they become interactive again.</p>
</div>

<!--
The second argument to form() is the schema function. It runs once at creation and declares the
logic tree.
-->

---
layout: content
eyebrow: 'Api &middot; 4 of 7'
title: Conditional and cross-field rules
---

<p class="lead">
Rules take reactive logic. A <code>when</code> predicate activates them; <code>valueOf</code> reaches other fields. Both recompute when the signals they read change.
</p>

<div class="split">

```ts
// conditional
required(path.promoCode, {
  message: 'Promo code required',
  when: ({ valueOf }) =>
    valueOf(path.applyDiscount),
});
```

```ts
// cross-field
validate(path.confirm, ({ value, valueOf }) => {
  return value() === valueOf(path.password)
    ? null
    : { kind: 'mismatch', message: '...' };
});
```

</div>

<p class="lead" style="margin-top:44px;max-width:1400px">
Because a rule takes a field path, the same function can validate one leaf or a whole subtree - which is how the Zod and Valibot bridges work.
</p>

<!--
This is the slide that usually sells it to reactive-forms people: conditional and cross-field
rules stay declarative.
-->

---
layout: content
eyebrow: 'Api &middot; 5 of 7'
title: Async validation without the state machine
---

<div class="split">

```ts
validateHttp(path.username, {
  debounce: 300,
  request: ({ value }) =>
    `/api/users/check?username=${value()}`,
  onSuccess: (res) => res.available
    ? null
    : { kind: 'taken', message: 'Already taken' },
  onError: () => ({ kind: 'serverError' }),
});
```

<div class="notes-col">
  <div>
    <div class="label">DEBOUNCE IS DECLARED</div>
    <p>Either on the field or on the validator. No <code>debounceTime</code> operator to wire up.</p>
  </div>
  <div>
    <div class="label">PENDING IS FREE</div>
    <p>Bind the spinner to <code>pending()</code> instead of tracking in-flight requests yourself.</p>
  </div>
  <div>
    <div class="label">THE TRADE</div>
    <p class="dim">Deeply composed observable chains need restructuring - the API is promise and resource shaped.</p>
  </div>
</div>

</div>

<!--
Async rules only run once the synchronous ones pass, so you are not hammering the endpoint on
every keystroke of an obviously-invalid value. validateAsync() is the lower-level escape hatch,
backed by resource() or rxResource().
-->

---
layout: content
eyebrow: 'Api &middot; 6 of 7'
title: Schemas are values, so they compose
---

<p class="lead" style="margin-bottom:32px">
Pull a schema out of the <code>form()</code> call and it becomes a reusable, typed unit you can apply to any matching subtree.
</p>

```ts
const addressSchema = schema<Address>((path) => {
  required(path.street);
  pattern(path.postcode, POSTCODE);
});

orderForm = form(this.order, (path) => {
  apply(path.billing, addressSchema);
  apply(path.shipping, addressSchema);
  applyEach(path.lineItems, lineItemSchema);
});
```

<p class="lead" style="margin-top:36px;max-width:1400px">
Nested objects, arrays and subforms all go through the same two functions. Our shared validators become shared schemas.
</p>

<!--
This is the piece that matters for our codebase: address, contact, money - define once, apply
everywhere. applyWhenValue() also takes a type guard and narrows the path, which is how you get
discriminated-union forms with no casts.
-->

---
layout: content
eyebrow: 'Api &middot; 7 of 7'
title: Submission is one function call
---

<div class="split">

```ts
orderForm = form(this.order, orderSchema, {
  submission: {
    action: async (f) => {
      const res = await api.save(f().value());
      return res.errors ?? null;
    },
  },
});
// <form [formRoot]="orderForm">
```

<div class="notes-col">
  <p style="font-size:32px">Marks fields touched, blocks invalid submits, tracks <code>submitting()</code> for the button state.</p>
  <p style="font-size:32px">Returned server errors are mapped back onto the fields they belong to, by path, and clear when the user edits.</p>
  <p style="font-size:32px" class="dim">This is the single largest deletion of code in a migration - every feature has its own version of it today.</p>
</div>

</div>

<!--
submit() is the boilerplate eliminator. Server errors map back onto fields by path.

Watch out: ignoreValidators defaults to 'pending', so users CAN submit while async validators are
still in flight. Set it to 'none' if that matters.
-->

---
layout: content
eyebrow: 'Api &middot; bonus'
title: 'Custom controls, without ControlValueAccessor'
---

<p class="lead" style="margin-bottom:64px">
A component declares the signals it exposes; the <code>formField</code> directive connects it to value, state and validation. Our design-system inputs get simpler, not harder.
</p>

<div class="cards" style="--cols:3">
  <div class="card">
    <div class="label">BEFORE</div>
    <p>Four callbacks, a provider entry, and manual touched propagation per control.</p>
  </div>
  <div class="card">
    <div class="label">AFTER</div>
    <p><code>value = model('')</code>. That is the whole required surface of <code>FormValueControl</code>.</p>
  </div>
  <div class="card">
    <div class="label">EFFORT</div>
    <p>Each shared control needs a rewrite. Roughly a dozen in our library.</p>
  </div>
</div>

<!--
No more ControlValueAccessor. Implement FormValueControl (or FormCheckboxControl) with signals and
the formField directive connects it. Never implement both interfaces on one component.

The official Angular launch video's running joke: "being in this fight is worse than dealing with
the control value accessor."
-->

---
layout: section
number: '02'
---

## Adopting it

<!-- Second half: what it would actually mean for us. -->

---
layout: content
eyebrow: Comparison
title: Side by side
---

<div class="compare" style="margin-top:52px">
  <div class="head">&nbsp;</div>
  <div class="head">REACTIVE FORMS</div>
  <div class="head teal">SIGNAL FORMS</div>

  <div class="row-label">State</div>
  <div>FormGroup / FormControl tree</div>
  <div class="new">A writable signal plus a field tree</div>

  <div class="row-label">Reads</div>
  <div>valueChanges observables</div>
  <div class="new">Signal reads, no subscriptions</div>

  <div class="row-label">Validation</div>
  <div>Attached at construction, changed imperatively</div>
  <div class="new">Declared in a schema, reactive by default</div>

  <div class="row-label">Typing</div>
  <div>Typed, but lost across get() paths</div>
  <div class="new">Inferred from the model, end to end</div>

  <div class="row-label">Submit</div>
  <div>Hand-rolled per feature</div>
  <div class="new">submit(), with server error mapping</div>

  <div class="row-label last">Maturity</div>
  <div class="last">Battle-tested, deep ecosystem</div>
  <div class="new last">Stable since v22, ecosystem still young</div>
</div>

<!--
Walk the rows, not the cells. The point is that every row is a place our code shrinks.
-->

---
layout: content
eyebrow: Interop
center: true
alt: true
title: The two systems meet at a compat layer
---

<p style="font-family:var(--font-display);font-size:48px;font-weight:400;line-height:1.35;max-width:1500px;margin-bottom:44px">
Don't mix imports from <code style="font-size:42px">@angular/forms</code> and <code style="font-size:42px">@angular/forms/signals</code> in the same form - unless you go through <code style="font-size:42px;color:var(--purple)">compatForm</code>.
</p>

<p class="lead" style="max-width:1450px">
The compat layer exists so a signal form can sit inside an existing reactive-forms screen while you convert it. Treat it as a migration tool with a shelf life, not a permanent architecture.
</p>

<!--
compatForm goes top-down (a FormControl inside a signal form); SignalFormControl goes bottom-up (a
signal-validated leaf inside a FormGroup).

Gotcha: with compatForm, form().value() hands you back the FormControl instance, not its value.
You flatten it yourself with a computed.
-->

---
layout: content
eyebrow: Proposal
title: A migration path we could actually run
---

<div class="steps" style="margin-top:64px">
  <div class="step">
    <div class="n">01</div>
    <h3>New forms only</h3>
    <p>Every greenfield form written signal-first. Nothing existing is touched.</p>
  </div>
  <div class="step purple">
    <div class="n">02</div>
    <h3>Shared controls and schemas</h3>
    <p>Port the design-system inputs and the validators both systems would share.</p>
  </div>
  <div class="step grey">
    <div class="n">03</div>
    <h3>Convert on touch</h3>
    <p>Existing screens move when they are already open for other work. No migration sprint.</p>
  </div>
</div>

<p class="dimmer" style="font-size:30px;line-height:1.45;margin-top:72px;max-width:1400px">
Deliberately excluded for now: the checkout wizard and the bulk-edit grid. Both lean on FormArray patterns that are still thin on the signal side.
</p>

<!--
Concrete proposal. Three steps, each one shippable on its own.

Step 2 is cheaper than it looks: FormValueControl components work in reactive and template-driven
forms as-is, so porting the control library does not break the screens still on the old API.
-->

---
layout: content
eyebrow: 'Demo &middot; 5 min'
title: The profile form, live
split: 1.1fr 0.9fr
---

<<< @/demos/signup.ts ts {monaco-write} { height: '620px' }

::right::

<div class="demo-form">
  <SignupDemo />
</div>

<!--
Edit the schema on the left, Cmd+S, and the running form on the right recompiles. Show:
the validation rules changing live, the pending state, and a server error landing on a field.

Five minutes, hard stop.
-->

---
layout: content
eyebrow: Risk
eyebrowColor: purple
title: What's left to be careful about
---

<p class="lead">
Signal Forms arrived experimental in v21 and came out of experimental in v22. The API risk is gone; the remaining costs are ours to plan for.
</p>

<div class="cards" style="--cols:2">
  <div class="card">
    <div class="label">TEAM RAMP-UP</div>
    <p>A different mental model, not a renamed API. Reviews will be slower at first.</p>
  </div>
  <div class="card">
    <div class="label">TWO SYSTEMS AT ONCE</div>
    <p>Until the last screen is converted we maintain both, plus the compat seams between them.</p>
  </div>
  <div class="card">
    <div class="label">STALE MATERIAL</div>
    <p>The API was renamed twice before it settled. Most blog posts still show <code>[field]</code> and <code>customError()</code>.</p>
  </div>
  <div class="card">
    <div class="label">OUR HEDGE</div>
    <p>Keep schemas centralised, so a change lands in one file rather than forty.</p>
  </div>
</div>

<!--
Stable as of v22, so the API-churn objection is off the table going forward. But the churn already
happened: Control became Field became FormField, FieldPath became SchemaPath, customError() was
removed. Anything you find online predates at least one of those.

"No API survives first contact with developers." - Alex Rickabaugh
-->

---
layout: content
eyebrow: Recommendation
center: true
alt: true
---

<h2 style="font-size:76px;letter-spacing:-0.03em;line-height:1.1;max-width:1500px;margin-bottom:48px">
Signal-first for every new form, starting now. Existing screens convert on touch.
</h2>

<p class="lead" style="font-size:34px;max-width:1400px;margin-bottom:64px">
The API is stable as of v22, so the only remaining question is sequencing. Porting the shared controls and schemas is the one piece that needs planned time.
</p>

<div style="display:flex;gap:56px;font-family:var(--font-mono);font-size:26px;color:var(--teal)">
  <span>angular.dev/guide/forms/signals</span>
  <span>Questions?</span>
</div>

<!--
Ask for a decision: signal-first on new forms from now, and planned time for the shared control
library.

If asked "will reactive forms be deprecated?": no active deprecation, but the team is explicit -
"we would like to replace the existing systems eventually... the one true form solution."
-->
