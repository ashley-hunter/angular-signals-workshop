---
theme: default
title: Angular Signal Forms
info: Your data is the form. Everything else is derived.
canvasWidth: 1920
colorSchema: dark
highlighter: shiki
transition: slide-left
mdc: true
layout: cover
eyebrow: '@angular/forms/signals &middot; stable in v22'
meta: ['Ashley Hunter', 'angular.dev/guide/forms/signals']
---

# Angular Signal Forms

Angular's third forms API, and the first one built on signals. Your data is the form - everything else is derived from it.

<!--
Title up while people settle. Introduce yourself here, not later.

"Angular shipped a new forms API in v21, and it went stable in v22. I've spent the last few
months in it. This is what it is, how it differs from what you know, and what it costs."
-->

---
layout: content
eyebrow: Orientation
heading: What are Signal Forms?
split: 1.15fr 0.85fr
---

<p class="lead" style="max-width:1560px">
A third forms API, living beside template-driven and reactive forms in <code>@angular/forms/signals</code>. It went stable in v22, and it is purely additive - nothing you already have changes.
</p>

<div v-click="1">

````md magic-move {at:2}
```ts
model = signal({ email: '', notify: false });
```

```ts
model = signal({ email: '', notify: false });

f = form(this.model, (p) => required(p.email));
```
````

</div>

<div v-click="3" style="margin-top:28px">

```html
<input [formField]="f.email" />
```

</div>

::right::

<div class="notes-col" style="padding-top:0">
  <div v-click="1">
    <div class="label">1 &middot; THE SIGNAL</div>
    <p>Your data, in a plain writable signal. This is the only copy of it that exists.</p>
  </div>
  <div v-click="2">
    <div class="label">2 &middot; THE FORM</div>
    <p><code>form()</code> wraps that signal and derives a field tree of the same shape, carrying your rules.</p>
  </div>
  <div v-click="3">
    <div class="label">3 &middot; THE TEMPLATE</div>
    <p>One directive binds a field to an input. Two-way, and there is no <code>patchValue</code>.</p>
  </div>
</div>

<!--
Read the paragraph, then walk the three pieces. Thirty seconds, no more - this is the map,
not the tour.

CLICK 1: the signal lights up. "Your data. That is the whole model."
CLICK 2: the form() call. "Wrap it. You now have a field tree with the same shape."
CLICK 3: the template appears. "Bind a leaf. That is the entire API surface."

Then: "So why did Angular build a third one?"
-->

---
layout: content
eyebrow: 'Where we are today'
heading: 'Eighteen lines, and every one of them is necessary'
split: 1.25fr 0.75fr
---

<div class="code-sm">

```ts
export class SignupForm {
  form = this.fb.group({ email: [''], notify: [false] });

  constructor(private fb: FormBuilder) {
    this.form.controls.notify.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((notify) => {
        const email = this.form.controls.email;
        if (notify) {
          email.setValidators([Validators.required, Validators.email]);
        } else {
          email.clearValidators();
        }
        email.updateValueAndValidity();
      });
  }
}
```

</div>

::right::

<div class="demo-panel">
  <div class="label">DEMO</div>
  <ReactiveSignupDemo />
</div>

<!--
No animation - let them read it, then show them what it does.

"This does one thing. Email is required, but only when 'notify me' is ticked. That's the whole
feature. Eighteen lines."

Then TICK THE BOX on the right. `required` flips to yes, the form flips to invalid. Untick it
and it goes back. That is everything those eighteen lines buy.

"And I want to be clear: this is good code. It passes review. I've written it, most of you have
written it. There is nothing to fix here."

Then advance and take it apart.
-->

---
layout: content
eyebrow: 'Where we are today'
heading: Why it has to be that long
---

<div class="cards" style="--cols:3">
  <div class="card" v-click="1">
    <div class="label">THE SUBSCRIPTION</div>
    <p>Validation is attached at construction, so anything conditional has to be pushed in later, from a stream.</p>
  </div>
  <div class="card" v-click="2">
    <div class="label">THE TEARDOWN</div>
    <p><code>takeUntilDestroyed</code>, because you have created a lifetime that has to be managed.</p>
  </div>
  <div class="card" v-click="3">
    <div class="label">THE REVALIDATE CALL</div>
    <p><code>updateValueAndValidity()</code>. Leave it out and the validator attaches but nothing re-runs, and QA finds it in three weeks.</p>
  </div>
</div>

<p class="lead" style="margin-top:48px;max-width:1560px" v-click="4">
None of that is about your feature. All of it is bookkeeping between two copies of the same state.
</p>

<!--
Three clicks, one per piece, then the point.

The tone matters: this is not a takedown of reactive forms. Date-stamp them instead. Reactive
forms were designed in 2016, before Angular had signals as an option. Rickabaugh says it
plainly: "Neither of these things plug-and-play very well with signals, because they were
designed obviously before Angular had signals as an option."

Nobody in the room is being criticised - a date is not an insult.
-->

---
layout: content
eyebrow: The diagnosis
heading: You are maintaining two copies of your state
---

<p class="lead">
Component state lives in signals. Form state lives in a parallel tree of control objects. Every screen you own is a hand-written bridge between the two, and the bridge is where the bugs live.
</p>

<div class="cards" style="--cols:2">
  <div class="card" v-click="1">
    <div class="label">READING OUT</div>
    <p><code>valueChanges</code> into a signal. A subscription and a teardown per dependency.</p>
  </div>
  <div class="card" v-click="2">
    <div class="label">WRITING BACK</div>
    <p><code>patchValue</code>, and the <code>{{ '{' }} emitEvent: false {{ '}' }}</code> you add after the first infinite loop.</p>
  </div>
  <div class="card" v-click="3">
    <div class="label">VALIDATION IS FROZEN</div>
    <p>Rules attach at construction, so anything conditional becomes imperative setter calls.</p>
  </div>
  <div class="card" v-click="4">
    <div class="label">SUBMIT</div>
    <p>Touch-all, check validity, loading flag, map server errors back onto controls. Rewritten per feature.</p>
  </div>
</div>

<!--
Four clicks, ~20 seconds each. Do not dwell - past 2.5 minutes this turns into whining.

Close the beat on the old war: template-driven vs reactive was never resolvable because each
side was right about a different thing. One had the logic in the template where the fields are,
the other had it in TypeScript where the types are.
-->

---
layout: content
center: true
alt: true
eyebrow: 'The part nobody mentions'
---

<p style="font-family:var(--font-display);font-size:64px;font-weight:500;letter-spacing:-0.03em;line-height:1.25;max-width:1560px">
You would assume forms were the last part of Angular to get signals.<br>
<span v-click="1">They are the reason Angular <em>has</em> signals.</span>
</p>

<div v-click="2">

<p class="lead" style="font-size:30px;margin-top:48px;max-width:1500px;font-style:italic">
"We were looking at replacing zone.js with something and signals was one option on the table. There were a few others. But forms was actually one of the main drivers of that decision. So we even knew back then that we wanted to do a signal form system if we created a signal reactivity system in the framework."
</p>

<p style="font-family:var(--font-mono);font-size:24px;color:var(--dim);margin-top:24px">Alex Rickabaugh, tech lead, Angular core framework</p>

</div>

<!--
The first line is a setup, so let it hang. CLICK 1 is the turn - deliver it flat, no emphasis,
and let the room react. CLICK 2 is the receipt.

Signal Forms are not a library release bolted on after signals. They are the thing the
reactivity rewrite was chosen for.
-->

---
layout: content
center: true
eyebrow: The one idea
---

<h2 style="font-size:84px;letter-spacing:-0.035em;line-height:1.1;max-width:1560px">
Signal Forms delete the second copy of your state.
</h2>

<p class="lead" style="font-size:36px;margin-top:44px;max-width:1450px" v-click="1">
Your model signal <em>is</em> the form. Structure, validation, touched, errors and submission are all derived from it.
</p>

<!--
State it bare, then admit it's unproven: "That's the claim. The rest of the talk is the proof."

If someone genuinely holds this idea they can derive the rest of the API themselves - which is
the test of a thesis.
-->

---
layout: section
number: '01'
transition: fade
---

## The model

---
layout: content
eyebrow: 'Core &middot; anatomy'
heading: The form has no state of its own
split: 1.15fr 0.85fr
---

````md magic-move
```ts
// your data. a plain writable signal.
model = signal({ email: '', notify: false });
```

```ts
// wrap it. the tree is derived from the shape.
model = signal({ email: '', notify: false });

f = form(this.model);
```

```ts
// bind a leaf. two-way, no patchValue.
model = signal({ email: '', notify: false });

f = form(this.model);

// <input [formField]="f.email" />
```
````

::right::

<div class="notes-col">
  <div>
    <div class="label">THE MODEL</div>
    <p>A writable signal of plain data. It is yours, and <code>form()</code> does not copy it.</p>
  </div>
  <div v-click="1">
    <div class="label">THE FIELD TREE</div>
    <p>Derived from the data's shape, typed end to end. No control classes to declare.</p>
  </div>
  <div v-click="2">
    <div class="label">THE BINDING</div>
    <p>One directive: value, state, validation, blur-to-touched.</p>
  </div>
</div>

<!--
Each magic-move step lands with its own note - code and explanation arrive together.

LIVE DEMO 1 (~2.5 min) after the last click. Build this from an empty component.

1. Type in the input - the JSON dump of model() changes. Expected.
2. Click a button wired to model.set({...}) - THE INPUT CHANGES. No patchValue. A slide can only
   assert bidirectionality; a demo proves it.
3. Hover f.email in Monaco. The type came from the data.
-->

---
layout: content
eyebrow: 'Core &middot; the field tree'
heading: 'What form() actually hands you'
---

<div class="split" style="--split:1.05fr 0.95fr">

```ts {all|1-4|6|7-8|10-11}
model = signal({
  email: '',
  addresses: [{ street: '', postcode: '' }],
});

f = form(this.model);           // FieldTree<Profile>
f.email                         // FieldTree<string>
f.email()                       // FieldState<string>

f.addresses[0].street           // indexable
f.addresses().value()           // the whole array
```

<div class="notes-col">
  <p v-click="1">The tree mirrors the shape of your data. Add a property to the model and the field exists; there is nothing to declare.</p>
  <p v-click="2"><code>form()</code> returns a <code>FieldTree</code> of the same shape. No control classes, no builder.</p>
  <p v-click="3"><strong>Dots navigate. Calling reads.</strong> <code>f.email</code> is an address you can pass around and bind to. <code>f.email()</code> is the state at that address, right now.</p>
  <p v-click="4">Arrays are indexable and iterable, but they are not real arrays - there is no <code>.map</code> or <code>.filter</code>, only <code>[i]</code>, <code>length</code> and <code>for..of</code>.</p>
  <p class="dim" v-click="4">Nodes are materialised lazily, so a subtree nobody touches never allocates.</p>
</div>

</div>

<!--
This is the concept to get right, because the rest of the API is navigation over this tree.

PREDICTION MOMENT - the only show of hands in the talk. Before revealing line 7 and 8, put
[formField]="f.email" and [formField]="f.email()" to the room and ask which one binds.

Most vote for the called one, because form.get('email') trained them to expect the call to
return the thing. It is the uncalled one: binding needs an address, not a snapshot.
-->

---
layout: content
eyebrow: 'Core &middot; the schema path'
heading: 'And what the schema function hands you'
---

<div class="split" style="--split:1.05fr 0.95fr">

```ts {all|1|2|4-6|8-10}
form(this.model, (p) => {      // p is a SchemaPath
  required(p.email);           // "the email field, whenever it exists"

  applyEach(p.addresses, (a) => {
    required(a.street);        // every item, present and future
  });

  validate(p.confirm, ({ valueOf }) => {
    return valueOf(p.password) === ... ;
  });
});
```

<div class="notes-col">
  <p v-click="1"><code>p</code> is not a field. It is a <em>description of a location</em> in the tree - which is why one rule can cover an array item that does not exist yet.</p>
  <p v-click="2">It has no state and is not callable. <code>p.email()</code> is a type error, and so is <code>p.addresses[0]</code>; you reach items with <code>applyEach</code>, not by index.</p>
  <p v-click="3">To read across the form, ask the context: <code>valueOf(path)</code> for a value, <code>stateOf(path)</code> for state.</p>
  <p class="dim" v-click="4">A path only works inside the schema that owns it. Close over an outer <code>p</code> from inside an applied sub-schema and you get NG1908 at runtime.</p>
</div>

</div>

<!--
The pairing to land: `p` is the blueprint, `f` is the building. You write rules against the
blueprint once; you read state from the building forever.

That is also why a rule can target items that do not exist yet - it was never about a
particular field object.

They will meet `p` and `f` one letter apart in every code sample they read, including mine.
-->

---
layout: content
eyebrow: 'Core &middot; the model that explains everything'
heading: The schema runs once. The rules inside it are reactive.
---

<p class="lead" style="max-width:1500px">
The schema function executes one time, to build a tree of logic. The functions you pass to <code>when</code>, to <code>validate</code>, to <code>min</code> - those re-run like a <code>computed</code>, forever.
</p>

<div class="cards" style="--cols:2">
  <div class="card" v-click="1">
    <div class="label">SO AN <code style="color:var(--purple)">if</code> DOESN'T WORK</div>
    <p>An <code>if</code> in the schema is evaluated once at construction and frozen. Use <code>applyWhen</code>.</p>
  </div>
  <div class="card" v-click="2">
    <div class="label">SO THERE IS NO <code style="color:var(--purple)">setValidators</code></div>
    <p>Rules never change. Their <code>when</code> does. Mutation is not an API because it needs none.</p>
  </div>
  <div class="card" v-click="3">
    <div class="label">SO <code style="color:var(--purple)">valueOf</code> EXISTS</div>
    <p>Inside a rule you are in a reactive context, so reading another field tracks it.</p>
  </div>
  <div class="card" v-click="4">
    <div class="label">SO PATHS ARE SCOPED</div>
    <p>Using a path outside its own schema throws NG1908. The tree is built, then sealed.</p>
  </div>
</div>

<!--
THIS IS THE SLIDE. Everything after it is a corollary, and the four clicks are those corollaries
being derived one at a time rather than listed.

If the room is flagging, reframe as "the four reasons your form looks broken":
  1. the schema ran once
  2. you mutated the model instead of replacing it
  3. you debounced it (value() lags; controlValue() is the un-debounced one)
  4. NG1908 - a path escaped its schema
-->

---
layout: content
eyebrow: 'Core &middot; field state'
heading: Everything you read is a signal
---

<div class="cards tight" style="--cols:4">
  <div class="card">
    <div class="label teal">value()</div>
    <p>Writable, and it writes through to your model.</p>
  </div>
  <div class="card">
    <div class="label teal">errors()</div>
    <p>An <em>array</em> of <code>{{ '{' }} kind, message {{ '}' }}</code>. All validators run.</p>
  </div>
  <div class="card">
    <div class="label teal">touched()</div>
    <p>Plus <code>dirty</code>, <code>disabled</code>, <code>readonly</code>, <code>hidden</code>.</p>
  </div>
  <div class="card">
    <div class="label teal">pending()</div>
    <p>Async validation in flight. No flag to maintain.</p>
  </div>
</div>

<p class="lead" style="margin-top:44px;max-width:1500px">
There are about twenty more. That is what autocomplete is for.
</p>

<!--
Four fast clicks - two seconds each, no dwelling. The last one is the joke that stops anyone
asking you to enumerate the rest.

Worth saying once: errors() is an ARRAY, not reactive forms' {[key]: any} bag, and nothing
short-circuits - every validator runs, every time.
-->

---
layout: section
number: '02'
transition: fade
---

## Validation

---
layout: content
eyebrow: 'Back to those eighteen lines'
heading: Same behaviour, three lines
---

````md magic-move
```ts
notify.valueChanges
  .pipe(takeUntilDestroyed())
  .subscribe((notify) => {
    const email = this.form.controls.email;
    if (notify) {
      email.setValidators([
        Validators.required, Validators.email,
      ]);
    } else {
      email.clearValidators();
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

<p class="lead" style="margin-top:48px;max-width:1560px" v-click="2">
No subscription, because nothing needs pushing. No teardown, because nothing was created. No revalidate call, because <code>when</code> is just a <code>computed</code>.
</p>

<!--
THE HIGHEST-VALUE MOMENT IN THE DECK. Do not rush it.

Bring the snippet up, let them recognise it from the opening, then click ONCE and let the code
physically collapse. Say nothing while it animates.

CLICK 2 maps each deleted thing back to the card that explained it earlier.

LIVE DEMO 2 (~2 min) straight after: type the `when` clause in Monaco and save. The running
form's validation behaviour changes with no reload.
-->

---
layout: content
eyebrow: Validation
heading: Conditional is not a special case
---

<p class="lead" style="max-width:1500px">
Every built-in takes <code>when</code>. Every bound can be a function. The message lives on the rule, so error copy leaves your template.
</p>

<div class="split">

```ts {all|1|2|3|4|all}
required(p.email, { message: 'We need an email' });
minLength(p.password, 12);
min(p.age, ({ valueOf }) => valueOf(p.country) === 'US' ? 21 : 18);
pattern(p.postcode, UK_POSTCODE);
```

<div class="notes-col">
  <p v-click="1">The message belongs to the rule, not the template.</p>
  <p v-click="2">A plain bound, when that is all you need.</p>
  <p v-click="3">Or a <em>reactive</em> bound. It recomputes like a <code>computed</code>, so the limit can depend on another field.</p>
  <p v-click="4">A regex. Note this one is not mirrored to the DOM - Signal Forms allows several, the attribute allows one.</p>
  <p class="dim" v-click="5">Careful: <code>required()</code> passes on an empty array - use <code>minLength(p.items, 1)</code>. And every other validator skips entirely when the value is empty, so <code>required</code> and <code>minLength</code> are both needed.</p>
</div>

</div>

<!--
Each line lights up as its explanation appears. Pause on the third - a reactive bound is the one
that has no reactive-forms equivalent worth writing.

Rhetorical prediction, two-second beat, before the last click:

  <input required [formField]="f.email">   - does the browser block submit?

No. FormRoot sets novalidate, and Angular mirrors required/min/max/minlength/maxlength/readonly/
disabled/name onto the element for behaviour and accessibility only.
-->

---
layout: content
eyebrow: Validation
heading: Rules can see the whole form
---

<div class="split">

```ts {all|3}
// one field, reading another
validate(p.confirm, ({ value, valueOf, stateOf }) => {
  if (!stateOf(p.password).touched()) return null;
  return value() === valueOf(p.password)
    ? null
    : { kind: 'mismatch', message: 'Passwords differ' };
});
```

<div class="notes-col">
  <p v-click="1"><code>valueOf</code> reads another field's value; <code>stateOf</code> reads its state. Gate on <code>touched()</code> so you are not shouting "passwords differ" at someone halfway through typing the first one.</p>
  <p v-click="2">A validator cannot put an error on a <em>different</em> field. That is a compile error, and it is <code>validateTree</code>'s job.</p>
</div>

</div>

<div v-click="3">

```ts {all|4}
// one validator, errors aimed at descendants
validateTree(p, ({ valueOf, fieldTreeOf }) => {
  return valueOf(p.start) >= valueOf(p.end)
    ? { kind: 'range', message: 'End must be after start', fieldTree: fieldTreeOf(p.end) }
    : null;
});
```

</div>

<!--
CLICK 1: the touched gate lights up with the text that explains it.
CLICK 2: sets up the limitation.
CLICK 3: validateTree arrives as the answer to it, with the fieldTree line highlighted.

The error carries its own target, so it lands where the user fixes it rather than on the group.
A row validator can return an ARRAY of errors, each aimed at a different cell - every duplicate
flagged at once. That is the thing reactive forms cannot express cleanly.
-->

---
layout: content
eyebrow: Validation
heading: Async, without the state machine
---

<div class="split">

```ts {all|2|3-4|5-7|8}
validateHttp(p.username, {
  debounce: 300,
  request: ({ value }) =>
    `/api/users/check?username=${value()}`,
  onSuccess: (res) => res.available
    ? null
    : { kind: 'taken', message: 'Already taken' },
  onError: () => ({ kind: 'offline' }),
});
```

<div class="notes-col">
  <p v-click="1">Debounce is declared, not piped.</p>
  <p v-click="2">The request is a function of the value. It only re-fires when that value changes - and only once the field's own sync rules pass, so you are not hammering the endpoint on obviously broken input.</p>
  <p v-click="3">Map the response to errors, or to <code>null</code>. While it is in flight, <code>pending()</code> is true and you have nothing to maintain.</p>
  <p v-click="4">Handling failure is not optional - <code>onError</code> is a required key.</p>
</div>

</div>

<!--
Four code steps, four explanations, paired. Every part of the state machine you would have
hand-rolled is one key in an object literal.

Do NOT demo this live. You will stand in silence watching a spinner on conference wifi with a
mock everyone assumes is faked. Screen recording if you want motion.
-->

---
layout: content
center: true
alt: true
eyebrow: 'If you already have schemas'
heading: Zod drops straight in
---

```ts
form(this.model, (p) => validateStandardSchema(p, userSchema));
```

<p class="lead" style="font-size:34px;margin-top:44px;max-width:1500px" v-click="1">
Standard Schema, so Zod, Valibot or ArkType. Issues are routed to the exact nested field they came from. Zod is already a dependency of <code>@angular/forms</code>.
</p>

<p class="lead" style="margin-top:28px;max-width:1500px" v-click="2">
It validates. It does not transform - so <code>z.coerce</code> and <code>.transform()</code> do not apply. Your model must already be the shape Zod expects.
</p>

<!--
One line, two clicks, move on. First thing to cut for time.

The transform caveat is inferred from the signature (returns void, nothing written back). The
docs say nothing about it, so say "test it" rather than asserting it.
-->

---
layout: section
number: '03'
transition: fade
---

## Composition

---
layout: content
eyebrow: Composition
heading: Schemas are values
---

<div class="split">

```ts {all|1-4|6-10|7-8}
const addressSchema = schema<Address>((p) => {
  required(p.street);
  pattern(p.postcode, UK_POSTCODE);
});

orderForm = form(this.order, (p) => {
  apply(p.billing, addressSchema);
  apply(p.shipping, addressSchema);
  applyEach(p.lineItems, lineItemSchema);
});
```

<div class="notes-col">
  <p v-click="1">Pull the rules out of the <code>form()</code> call and they become a value: typed, reusable, testable on their own.</p>
  <p v-click="2">Mount it at any matching path. <code>applyEach</code> does the same for every item in an array.</p>
  <p v-click="3">The same schema, at two different paths. That is the whole argument for schemas being values rather than syntax.</p>
</div>

</div>

<!--
Do not demo composition live - it is a reading activity, and the payoff is seeing two things at
once, which a slide does better than an editor you have to scroll.

applyEach also works on Record<string, T>, which is the primitive for generic renderers.
-->

---
layout: content
eyebrow: 'Composition &middot; the peak'
heading: The schema path narrows
---

<div class="split">

```ts {all|3|4-5|8-11}
type Payment = CreditCard | BankTransfer;

applyWhenValue(p.payment, isCreditCard, (card) => {
  required(card.cardNumber);
  required(card.cvv);
});

applyWhenValue(p.payment, isBankTransfer, (bank) => {
  required(bank.accountNumber);
  required(bank.sortCode);   // card.cardNumber
});                          // would not compile here
```

<div class="notes-col">
  <p v-click="1">The predicate is a TypeScript type guard.</p>
  <p v-click="2">So inside the branch, the path has narrowed to <code>CreditCard</code>. No casts, no ceremony.</p>
  <p v-click="3">And in the other branch, reaching for a card field is a compile error. Discriminated-union forms that actually type-check.</p>
  <p class="dim" v-click="4">Honest footnote: this narrows the <em>schema path</em>, not the field tree. In the template a union model still needs a superset with <code>hidden()</code> per variant - which is what the docs recommend anyway, because switching branches loses user input.</p>
</div>

</div>

<!--
LIVE DEMO 3 (~2 min) on click 3. Reach for card.cardNumber inside the bank-transfer branch and
let the red squiggle land on the projector. The payload lives in the EDITOR, not the app - a
screenshot of a type error is a screenshot; a live one is proof.

On thesis: the types narrow because the form was derived from your data, and your data was a
discriminated union all along.
-->

---
layout: content
eyebrow: 'Custom controls'
heading: 'Nobody has ever written this from memory'
center: true
alt: true
---

<p style="font-family:var(--font-display);font-size:60px;font-weight:500;line-height:1.25;max-width:1520px">
Every Angular codebase has one component where someone implemented <code style="font-size:54px">ControlValueAccessor</code> correctly, and everyone else copies that file.
</p>

<!--
Say it, pause, let the room recognise itself. No punchline needed - the recognition is the joke.

No animation on purpose. The next slide does the work.
-->

---
layout: content
eyebrow: 'Custom controls'
heading: Four methods, a provider and a forwardRef
---

````md magic-move
```ts
@Component({
  selector: 'my-input',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MyInput),
    multi: true,
  }],
  template: `<input [value]="value" (input)="onInput($event)" (blur)="onTouched()" />`,
})
export class MyInput implements ControlValueAccessor {
  value = '';
  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};
  writeValue(v: string) { this.value = v; }
  registerOnChange(fn: (v: string) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean) { this.disabled = isDisabled; }
}
```

```ts
export class MyInput implements FormValueControl<string> {
  value = model.required<string>();
}
```
````

<p class="lead" style="margin-top:48px;max-width:1560px" v-click="2">
That is the whole required contract. <code>errors</code>, <code>disabled</code>, <code>touched</code> and the rest are optional inputs you take only if you render them.
</p>

<!--
Leave the "before" up for three seconds without apologising for it. Do not read it. Do not say
"you can't see this" - the volume IS the content.

Then click once and let it collapse. Say nothing during the animation.

Two things worth saying after:
- Never implement both interfaces. The CVA silently wins, with no warning.
- FormValueControl components work in reactive AND template-driven forms unmodified, which makes
  porting your control library a no-regret move.
-->

---
layout: content
eyebrow: 'One more consequence'
heading: 'Your form is already a machine-readable contract'
split: 1.1fr 0.9fr
---

```ts {all|2-5|6}
f = form(this.model, signupSchema, {
  experimentalWebMcpTool: {
    name: 'registerUser',
    description: 'Registers a new user.',
  },
  submission: { action: (f) => api.register(f().value()) },
});
```

::right::

<div class="notes-col">
  <p v-click="1">Declare the tool and Angular walks your model to generate a JSON schema for it. Your <code>required()</code> calls become the agent's mandatory arguments.</p>
  <p v-click="2">The agent fills the model and triggers your submission. If it fails, it gets <code>errorSummary()</code> back per field, so it can correct itself and retry.</p>
  <p class="dim" v-click="3">Experimental - the only such API left in the package. Schema inference rejects <code>null</code>, <code>undefined</code> and empty arrays, which fights the model-design advice coming up next.</p>
</div>

<!--
Forty-five seconds, framed ON THESIS rather than as an AI slide: because the form is derived
from your data, Angular already has enough information to describe it to something else. You
did not write a schema for the agent. You wrote your model.

Do not demo live - it needs an agent and a network. Record it if you want motion.

Needs provideExperimentalWebMcpForms() in your providers.
-->

---
layout: section
number: '04'
transition: fade
---

## Things people ask

---
layout: content
eyebrow: Question
eyebrowColor: purple
heading: 'My API returns optional fields. Why can''t I model that?'
---

<div class="split">

```ts {all|1-3|4-5|7-9}
// does not compile
model = signal<{ nickname?: string }>({});
required(p.nickname);
// Argument of type 'MaybeSchemaPathTree<string | undefined>'
// is not assignable to 'SchemaPath<string, 1, Child>'

// compiles, but silently unreachable
model = signal({ address: null as Address | null });
p.address.street  // Property 'street' does not exist
```

<div class="notes-col">
  <p v-click="1"><code>undefined</code> does not mean "empty". It means <em>this field does not exist</em>, so Angular deletes the node.</p>
  <p v-click="2">And it is a compile error, not a lint. You cannot attach a single rule to an optional property.</p>
  <p v-click="3"><code>null</code> is allowed - it is the sanctioned empty for number and date inputs. But a nullable <em>object</em> makes that entire subtree unnavigable.</p>
  <p class="dim" v-click="4">Also: <code>string | null</code> silently costs you <code>email</code>, <code>pattern</code>, <code>minLength</code> and <code>maxLength</code>. They are declared on <code>string</code>.</p>
</div>

</div>

<p class="lead" style="margin-top:40px;max-width:1560px" v-click="5">
The rule: <code>''</code> for text, <code>null</code> for numbers and dates, never <code>undefined</code>, never optional. Map to and from your domain model at the edges.
</p>

<!--
The single most valuable slide in this section - people hit it in the first hour.

The final click is the rule. If they photograph one slide here, it is this one.

Also worth mentioning: class instances lose their prototype on first write, because Signal Forms
shallow-copies the parent object. Map and Set produce EMPTY field trees, because children are
enumerated with Object.keys. The type system does not stop you on either - it fails silently at
runtime.
-->

---
layout: content
eyebrow: Question
eyebrowColor: purple
heading: 'How do I hide a field? And why isn''t hidden just disabled?'
---

<div class="split">

```ts
hidden(p.spouseName, {
  when: ({ valueOf }) => valueOf(p.status) !== 'married',
});
```

<div v-click="1">

```html
@if (!f.spouseName().hidden()) {
  <input [formField]="f.spouseName" />
}
```

</div>

</div>

<div class="cards" style="--cols:3;margin-top:44px">
  <div class="card" v-click="1">
    <div class="label">IT DOES NOT TOUCH THE DOM</div>
    <p>You write the <code>&#64;if</code>. Render it anyway and you get a dev-mode warning.</p>
  </div>
  <div class="card" v-click="2">
    <div class="label">IT SKIPS VALIDATION</div>
    <p>Hidden, disabled <em>and readonly</em> all skip. A hidden <code>required</code> field will not block submit.</p>
  </div>
  <div class="card" v-click="3">
    <div class="label">IT KEEPS THE VALUE</div>
    <p><code>f().value()</code> still contains it. It still goes to your server.</p>
  </div>
</div>

<!--
CLICK 1 reveals the template AND the card that explains it, together - the @if is the thing you
have to write yourself.

Then two more consequences, with the surprise LAST.

LIVE DEMO 4 (~1 min) on click 3. This is demos/signup.ts. Toggle the dropdown: the input
vanishes, spouseName stays in the JSON blob.

THE MIGRATION BOMB, say it loudly: reactive forms' form.value STRIPPED disabled controls, and
you needed getRawValue() to see them. Signal Forms is exactly reversed - the model is the truth,
so disabled and hidden fields are in the payload by default. Anyone migrating a form that leaned
on disabled-means-omitted starts silently sending fields they used to drop.

Escape hatch: extractValue(f, { enabled: true }) from @angular/forms/signals/compat.
(Payload behaviour verified from source, not documented - flag it as such if pressed.)
-->

---
layout: content
eyebrow: Question
eyebrowColor: purple
heading: 'Where is FormArray? What about forms I don''t know the shape of?'
---

<p class="lead" style="max-width:1520px">
There is no <code>FormArray</code> and no <code>FormRecord</code>. The array in your model <em>is</em> the array.
</p>

<div class="split">

```ts {all|1|5}
@for (item of f.items; track item) {
  <input [formField]="item.name" />
}

f.items().value.update((xs) => [...xs, blank]);
```

<div class="notes-col">
  <p v-click="1">Track by <em>field identity</em>, not <code>$index</code>. Angular stamps a hidden <code>Symbol</code> on each object so state follows a row across a reorder.</p>
  <p v-click="2">Add and remove by replacing the array. There is no <code>push</code>, and <code>f.items</code> has no <code>.map</code> or <code>.filter</code> - only indexing, <code>length</code> and iteration.</p>
  <p class="dim" v-click="3">Consequences of that hidden Symbol: frozen objects in arrays throw, and <code>structuredClone</code> of your model resets every row's touched and dirty state.</p>
  <p v-click="4">Genuinely dynamic shapes have an official pattern - derive the model and the schema from one config array. You surrender some type safety and cast inside each branch.</p>
</div>

</div>

<!--
Worth admitting: the docs say "avoid models with dynamic structure" on one page and show you how
to build them on another. Naming that tension makes you look like you read the docs properly.
-->

---
layout: content
eyebrow: Question
eyebrowColor: purple
heading: 'How do I test these?'
---

<div class="split">

```ts {all|2-4|6|8-9}
it('requires email when notify is on', () => {
  const model = signal({ email: '', notify: false });
  const f = TestBed.runInInjectionContext(() =>
    form(model, signupSchema));

  expect(f.email().valid()).toBe(true);

  model.set({ email: '', notify: true });
  expect(f.email().errors()[0].kind).toBe('required');
});
```

<div class="notes-col">
  <p v-click="1">Build the form in an injection context - that is the only ceremony.</p>
  <p v-click="2">Assert by reading a signal.</p>
  <p v-click="3">Change the model, assert again. No fixture, no <code>detectChanges</code>, no <code>fakeAsync</code>, no <code>tick()</code>.</p>
  <p class="dim" v-click="4">Render a component only for what genuinely needs the DOM: binding, typing, custom controls, focus.</p>
</div>

</div>

<p class="lead" style="margin-top:36px;max-width:1520px" v-click="5">
There is no <code>@angular/forms/signals/testing</code> entry point, and that is the good news - there is nothing to learn.
</p>

<!--
Because the logic lives in the schema rather than the template, most of it tests as plain
function calls and signal reads.

This is a bigger applause line for a room of maintainers than anything flashy. Testing a
reactive form's conditional validation meant a fixture and tick(). Here it is a signal read.
-->

---
layout: content
eyebrow: Question
eyebrowColor: purple
heading: 'Is it stable? Are reactive forms going away?'
---

<div class="cards" style="--cols:2">
  <div class="card" v-click="1">
    <div class="label">STABLE IN v22</div>
    <p>Every symbol is <code>&#64;publicApi 22.0</code>. The only <code>&#64;experimental</code> thing left in the package is the WebMCP integration.</p>
  </div>
  <div class="card" v-click="2">
    <div class="label">BUT NOT FROZEN</div>
    <p>22.1 already deprecated passing a bare function to <code>disabled()</code> and <code>hidden()</code> in favour of <code>{{ '{' }} when {{ '}' }}</code>. One minor release after stable.</p>
  </div>
  <div class="card" v-click="3">
    <div class="label">NOTHING IS DEPRECATED TODAY</div>
    <p>Reactive forms carry no deprecation and no announced timeline. But the stated intent is explicit: "we would like to replace the existing systems eventually".</p>
  </div>
  <div class="card" v-click="4">
    <div class="label">YOU CHOOSE PER FORM</div>
    <p>The interop layer runs both directions, so this is not an application-wide decision. That is what makes the risk small, not a promise about the future.</p>
  </div>
</div>

<p class="lead" style="margin-top:40px;max-width:1560px" v-click="5">
And everything you find online is written against a dead API: <code>Control</code> became <code>Field</code> became <code>FormField</code>. <code>FieldPath</code> became <code>SchemaPath</code>. <code>customError()</code> is gone.
</p>

<!--
Do not reassure with "Angular never removes anything" - it does, and the room knows it. The
honest reassurance is that adoption is per-form and reversible, because interop runs both ways.

"No API survives first contact with developers." The reason they shipped it experimental was to
get that contact early, rather than committing to two majors of stability on day one. That is
also why the churn table above exists.
-->

---
layout: content
eyebrow: Question
eyebrowColor: purple
heading: 'Will it work with our component library?'
---

<div class="cards" style="--cols:3">
  <div class="card" v-click="1">
    <div class="label teal">NATIVE INPUTS</div>
    <p>Work directly. Including <code>type=number</code> and <code>type=date</code>, which write <code>null</code> when empty.</p>
  </div>
  <div class="card" v-click="2">
    <div class="label teal">EXISTING CVA COMPONENTS</div>
    <p>Work with <code>[formField]</code> today. Angular provides a fake <code>NgControl</code> - a <em>subset</em>, so a control reaching deep into it may misbehave.</p>
  </div>
  <div class="card" v-click="3">
    <div class="label teal">NEW CONTROLS</div>
    <p><code>FormValueControl</code> or <code>FormCheckboxControl</code>. Never both.</p>
  </div>
</div>

<p class="lead" style="margin-top:44px;max-width:1560px" v-click="4">
Check your specific library before promising it to your team - I am not going to assert Material's status from this stage.
</p>

<!--
The reassuring half: FormValueControl components work in reactive and template-driven forms
unmodified. So you can port the control library FIRST, without deciding anything about forms.
That is what unblocks an incremental migration.
-->

---
layout: section
number: '05'
transition: fade
---

## What it costs

---
layout: content
eyebrow: Risk
eyebrowColor: purple
heading: 'The gaps, named before you find them'
---

<div class="cards" style="--cols:2">
  <div class="card" v-click="1">
    <div class="label">NO ARIA WIRING</div>
    <p>Zero <code>aria-</code> attributes in the package. <code>aria-invalid</code>, <code>aria-describedby</code>, <code>role="alert"</code> are yours. Angular's own example writes them by hand.</p>
  </div>
  <div class="card" v-click="2">
    <div class="label">SSR IS UNDOCUMENTED</div>
    <p>Not a single Signal Forms page mentions SSR or hydration - including the async page, where you would most expect it. Test it before you bet on it.</p>
  </div>
  <div class="card" v-click="3">
    <div class="label">NO STATUS CLASSES</div>
    <p><code>.ng-valid</code> and <code>.ng-dirty</code> do not appear. Your existing CSS silently stops working until you opt in.</p>
  </div>
  <div class="card" v-click="4">
    <div class="label">THE BUNDLE DOES NOT SHRINK</div>
    <p>Signal Forms import <code>Validators</code>, <code>NgControl</code> and <code>FormGroup</code> from the classic package. You do not get to delete <code>@angular/forms</code>.</p>
  </div>
</div>

<p class="lead" style="margin-top:40px;max-width:1560px" v-click="5">
And a genuine footgun: <code>submit()</code> ignores <em>pending</em> validators by default, so a user can submit while your username check is still in flight. Set <code>ignoreValidators: 'none'</code>.
</p>

<!--
Deliver this FASTER and with MORE specificity than the good parts. Vagueness here reads as a
sales pitch; precision reads as someone who has shipped it.

Rhetorical prediction before the last click: "A field is pending. Is it valid?"
Neither. Quote the type definition verbatim - quoting the .d.ts lands differently from quoting
a podcast:

  "invalid() is false because there are no errors. However valid() is also false because of
   the pending validator."

So [disabled]="f().invalid()" leaves your submit button ENABLED mid-validation. Use !valid().
-->

---
layout: content
eyebrow: 'We did not cover'
heading: 'Where to go next'
---

<div class="cards" style="--cols:2">
  <div class="card" v-click="1">
    <div class="label">FIELD METADATA</div>
    <p><code>createManagedMetadataKey</code> lets an <code>httpResource</code> live on a field, created in that field's own injector and destroyed with it. Per-row link previews for free.</p>
  </div>
  <div class="card" v-click="2">
    <div class="label">TYPED ERRORS</div>
    <p><code>NgValidationError</code> is a runtime base class <em>and</em> a discriminated union, so <code>e.min</code> and <code>e.maxLength</code> narrow. Message i18n at the render layer.</p>
  </div>
  <div class="card" v-click="3">
    <div class="label">transformedValue()</div>
    <p>Parse and format between what the input gives you and what your model wants, with parse errors reported into the field automatically.</p>
  </div>
  <div class="card" v-click="4">
    <div class="label">disabledReasons()</div>
    <p>Return a string instead of <code>true</code> from <code>disabled</code> and the UI can finally answer "why is this greyed out?"</p>
  </div>
</div>

<!--
This slide exists so you can say "yes, and here's where it lives" to four different questions
without derailing. Click through it fast - it is a menu, not a lesson.
-->

---
layout: content
eyebrow: Monday
heading: 'Three things, and only the first is a bet'
---

<div class="steps" style="margin-top:56px">
  <div class="step" v-click="1">
    <div class="n">01</div>
    <h3>Write your next form signal-first</h3>
    <p>Not a migration. The next one. You will know inside a day whether the model fits your head.</p>
  </div>
  <div class="step purple">
    <div class="n">02</div>
    <h3>Port one control off ControlValueAccessor</h3>
    <p>Not a bet at all. <code>FormValueControl</code> works in all three forms systems, so nothing breaks.</p>
  </div>
  <div class="step grey">
    <div class="n">03</div>
    <h3>Leave the big dynamic form alone</h3>
    <p>The JSON-schema-driven one, the giant grid. Weakest path today, and no prize for being early.</p>
  </div>
</div>

<!--
Naming what NOT to do is what makes the other two credible. Land on step three.
-->

---
layout: content
center: true
alt: true
eyebrow: 'One more time'
---

<h2 style="font-size:72px;letter-spacing:-0.03em;line-height:1.15;max-width:1560px">
Your data stopped being a copy.
</h2>

<p class="lead" style="font-size:34px;margin-top:44px;max-width:1500px" v-click="1">
There is one object now. The model lives in a signal, the form is a view of it, and validation, touched, errors and submission are all derived. When you stop keeping two copies in sync, all the code that kept them in sync goes away.
</p>

<div style="display:flex;gap:56px;margin-top:64px;font-family:var(--font-mono);font-size:26px;color:var(--teal)" v-click="2">
  <span>angular.dev/guide/forms/signals</span>
  <span>Questions?</span>
</div>

<!--
"That's where we started. Eighteen lines, then three. Same behaviour.

What changed isn't that Angular added a `when` option. It's that your data stopped being a copy.

Adoption is per-form and the interop runs both ways, so this is not a decision you have to make
for a whole application. Write the next form in it and find out.

Thank you."
-->
