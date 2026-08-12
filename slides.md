---
theme: default
title: Angular Signal Forms
info: There is no form object any more. There is your data, and a view of it.
canvasWidth: 1920
colorSchema: dark
highlighter: shiki
transition: slide-left
mdc: true
layout: content
eyebrow: ''
---

<div style="font-family:var(--font-mono);font-size:24px;color:var(--dim);margin-bottom:36px">Find the bug.</div>

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

<!--
Deliberately NO click animation on this slide. They are hunting for a bug - highlighting a line
would hand them the answer.

Walk to the centre before speaking. Do not introduce yourself yet.

"This does exactly one thing. It makes email required, but only when 'notify me' is ticked.
Find the bug."

WAIT. Five full seconds. Count them. Do not fill the gap.
-->

---
layout: content
center: true
alt: true
eyebrow: 'The answer'
---

<h2 style="font-size:76px;letter-spacing:-0.03em;line-height:1.1;max-width:1500px">
There isn't one. That is the correct way to write it.
</h2>

<p class="lead" style="font-size:34px;max-width:1400px" v-click>
The subscription is right. <code>takeUntilDestroyed</code> is right. And <code>updateValueAndValidity()</code> is right - leave it out and the validator attaches but nothing revalidates, and QA finds it three weeks later.
</p>

<p class="lead" style="font-size:34px;max-width:1400px;color:var(--text)" v-click>
Eighteen lines. To say: <em>this field is required when that box is ticked.</em>
</p>

<!--
Let "there isn't one" sit alone for a beat before clicking. The silence does the work.

CLICK 1: why each line is correct.
CLICK 2: the count. This is the line they should still remember at the end.

"This code passes review. I've written it. Most of you have written it this month.

I'm Ashley. Hold that snippet - we're deleting most of it in about ten minutes."
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
  <div class="card" v-click>
    <div class="label">READING OUT</div>
    <p><code>valueChanges</code> into a signal. A subscription and a teardown per dependency.</p>
  </div>
  <div class="card" v-click>
    <div class="label">WRITING BACK</div>
    <p><code>patchValue</code>, and the <code>{{ '{' }} emitEvent: false {{ '}' }}</code> you add after the first infinite loop.</p>
  </div>
  <div class="card" v-click>
    <div class="label">VALIDATION IS FROZEN</div>
    <p>Rules attach at construction, so anything conditional becomes imperative setter calls.</p>
  </div>
  <div class="card" v-click>
    <div class="label">SUBMIT</div>
    <p>Touch-all, check validity, loading flag, map server errors back onto controls. Rewritten per feature.</p>
  </div>
</div>

<!--
Four clicks, ~20 seconds each. Do not dwell - past 2.5 minutes this turns into whining.

Do not attack reactive forms. Date-stamp them. Let the tech lead say the harsh part:

"Neither of these things plug-and-play very well with signals, because they were designed
obviously before Angular had signals as an option." - Alex Rickabaugh

"These systems are like eight years old at this point. There's a lot of stuff that's happened
in HTML."

And the war: template-driven vs reactive was never resolvable because each side was right about
a different thing. One had the logic where the fields are. The other had it where the types are.
-->

---
layout: content
center: true
alt: true
eyebrow: 'The part nobody mentions'
---

<p style="font-family:var(--font-display);font-size:64px;font-weight:500;letter-spacing:-0.03em;line-height:1.25;max-width:1560px">
You would assume forms were the last part of Angular to get signals.<br>
<span v-click>They are the reason Angular <em>has</em> signals.</span>
</p>

<div v-click>

<p class="lead" style="font-size:30px;margin-top:48px;max-width:1500px;font-style:italic">
"We were looking at replacing zone.js with something and signals was one option on the table. There were a few others. But forms was actually one of the main drivers of that decision. So we even knew back then that we wanted to do a signal form system if we created a signal reactivity system in the framework."
</p>

<p style="font-family:var(--font-mono);font-size:24px;color:var(--dim);margin-top:24px">Alex Rickabaugh, tech lead, Angular core framework</p>

</div>

<!--
The first line is a setup, so let it hang. CLICK 1 is the turn - deliver it flat, no emphasis,
and let the room do the reacting. CLICK 2 is the receipt.

This is not a library release. It is the payload the last four years of Angular were built to
deliver. It also retroactively legitimises the previous slide: the pain was real enough to
change the framework's reactivity strategy.
-->

---
layout: content
center: true
eyebrow: The one idea
---

<h2 style="font-size:84px;letter-spacing:-0.035em;line-height:1.1;max-width:1560px">
Signal Forms delete the second copy of your state.
</h2>

<p class="lead" style="font-size:36px;margin-top:44px;max-width:1450px" v-click>
Your model signal <em>is</em> the form. Structure, validation, touched, errors and submission are all derived from it.
</p>

<!--
State it bare, then admit it's unproven: "That's the claim. Here's the proof."

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
heading: There is no form object
split: 1.15fr 0.85fr
---

````md magic-move
```ts
// 1. your data. a plain writable signal.
model = signal({ email: '', notify: false });
```

```ts
// 2. wrap it. the tree is derived from the shape.
model = signal({ email: '', notify: false });

f = form(this.model);
```

```ts
// 3. bind a leaf. that is the whole API surface.
model = signal({ email: '', notify: false });

f = form(this.model);

// <input [formField]="f.email" />
```
````

::right::

<div class="notes-col">
  <div v-click="1">
    <div class="label">THE MODEL</div>
    <p>A writable signal of plain data. It is yours. <code>form()</code> does not copy it.</p>
  </div>
  <div v-click="2">
    <div class="label">THE FIELD TREE</div>
    <p>Derived from the data's shape, typed end to end. No control classes to declare.</p>
  </div>
  <div v-click="3">
    <div class="label">THE BINDING</div>
    <p>One directive: value, state, validation, blur-to-touched.</p>
  </div>
</div>

<!--
The code grows as each note appears - magic-move keeps the earlier lines anchored so the eye
tracks what was ADDED rather than re-reading the whole block.

LIVE DEMO 1 (~2.5 min) after the third click. Build this from an empty component.

1. Type in the input - the JSON dump of model() changes. Expected.
2. Click a button wired to model.set({...}) - THE INPUT CHANGES. No patchValue. This is the
   moment; a slide can only assert bidirectionality, a demo proves it.
3. Hover f.email in Monaco. The type came from the data.

Land it on Deborah Kurata's line: "Forms don't maintain their own data. Rather, they use the
passed signal."
-->

---
layout: content
eyebrow: 'Core &middot; the tripwire'
heading: 'Two objects, one letter apart'
---

<div class="split">

<div>

```ts
// p - a SchemaPath. A description of WHERE.
// Only valid inside the schema function.
f = form(model, (p) => {
  required(p.email);
});
```

</div>

<div v-click>

```ts
// f - a FieldTree. A handle on WHAT.
// Navigate with dots, call to read state.
f.email           // FieldTree<string>
f.email()         // FieldState<string>
f.email().value() // 'a@b.com'
```

</div>

</div>

<p class="lead" style="margin-top:44px;max-width:1500px" v-click>
<code>p.email</code> is not callable. <code>p.items[0]</code> does not compile. They look identical in every code sample you will ever read, including mine.
</p>

<!--
PREDICTION MOMENT - the only show of hands in the talk, and it goes BEFORE the first click.

Put [formField]="f.email" and [formField]="f.email()" to the room. "Which one binds?"
Most vote for the called one, because form.get('email') trained them to expect the call to
return the thing.

CLICK 1 reveals: uncalled. Binding needs an address, not a snapshot.
CLICK 2 is the warning - they will misread this in every blog post they read next week.

This single distinction causes more confusion than the rest of the API combined.
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
  <div class="card" v-click>
    <div class="label">SO AN <code style="color:var(--purple)">if</code> DOESN'T WORK</div>
    <p>An <code>if</code> in the schema is evaluated once at construction and frozen. Use <code>applyWhen</code>.</p>
  </div>
  <div class="card" v-click>
    <div class="label">SO THERE IS NO <code style="color:var(--purple)">setValidators</code></div>
    <p>Rules never change. Their <code>when</code> does. Mutation is not an API because it needs none.</p>
  </div>
  <div class="card" v-click>
    <div class="label">SO <code style="color:var(--purple)">valueOf</code> EXISTS</div>
    <p>Inside a rule you are in a reactive context, so reading another field tracks it.</p>
  </div>
  <div class="card" v-click>
    <div class="label">SO PATHS ARE SCOPED</div>
    <p>Using a path outside its own schema throws NG1908. The tree is built, then sealed.</p>
  </div>
</div>

<!--
THIS IS THE SLIDE. Everything after it is a corollary, and the four clicks are the corollaries
arriving one at a time so the audience can feel them being derived rather than listed.

Frame it as "the four reasons your form looks broken" if the room is flagging:
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
  <div class="card" v-click>
    <div class="label teal">value()</div>
    <p>Writable, and it writes through to your model.</p>
  </div>
  <div class="card" v-click>
    <div class="label teal">errors()</div>
    <p>An <em>array</em> of <code>{{ '{' }} kind, message {{ '}' }}</code>. All validators run.</p>
  </div>
  <div class="card" v-click>
    <div class="label teal">touched()</div>
    <p>Plus <code>dirty</code>, <code>disabled</code>, <code>readonly</code>, <code>hidden</code>.</p>
  </div>
  <div class="card" v-click>
    <div class="label teal">pending()</div>
    <p>Async validation in flight. No flag to maintain.</p>
  </div>
</div>

<p class="lead" style="margin-top:44px;max-width:1500px" v-click>
There are about twenty more. That is what autocomplete is for.
</p>

<!--
Four fast clicks - two seconds each, no dwelling. The last click is the joke that stops anyone
asking you to enumerate the rest.

Worth saying once: errors() is an ARRAY, not reactive forms' {[key]: any} bag, and nothing
short-circuits - every validator runs every time.
-->

---
layout: section
number: '02'
transition: fade
---

## Validation

---
layout: content
eyebrow: 'Cashing the cold open'
heading: Eighteen lines becomes three
---

````md magic-move {at:1}
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

<p class="lead" style="margin-top:48px;max-width:1560px" v-click>
Same behaviour. No subscription, no teardown, no <code>updateValueAndValidity</code>, and nothing to forget.
</p>

<!--
THE HIGHEST-VALUE MOMENT IN THE DECK. Do not rush the click.

Bring the snippet up, let them recognise it from the cold open, then click ONCE and let the
code physically collapse. Say nothing while it animates.

LIVE DEMO 2 (~2 min) straight after: type the `when` clause in Monaco and save. The running
form's validation behaviour changes with no reload.

This is the release of the tension you set up at 0:00. If you only keep one demo, keep this one.
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
  <p>The ones you would expect: <code>required</code>, <code>email</code>, <code>min</code>/<code>max</code>, <code>minDate</code>/<code>maxDate</code>, <code>minLength</code>/<code>maxLength</code>, <code>pattern</code>.</p>
  <p class="dim" v-click="[5,6]">Careful: <code>required()</code> passes on an empty array. Use <code>minLength(p.items, 1)</code>. And every other validator skips entirely when the value is empty, so <code>required</code> and <code>minLength</code> are both needed.</p>
</div>

</div>

<!--
Walk the four lines: message on the rule / a plain bound / a REACTIVE bound, which is the one
worth pausing on / a regex. Then the caution appears on the final click.

Second prediction, rhetorical, two-second beat:

  <input required [formField]="f.email">   - does the browser block submit?

No. FormRoot sets novalidate. Angular mirrors required/min/max/minlength/maxlength/readonly/
disabled/name onto the element for behaviour and accessibility, and validates entirely in
signals. Note pattern is NOT mirrored - signal forms supports multiple regexes, the attribute
takes one.
-->

---
layout: content
eyebrow: Validation
heading: Rules can see the whole form
---

<div class="split">

```ts {all|3|4-6}
// one field, reading another
validate(p.confirm, ({ value, valueOf, stateOf }) => {
  if (!stateOf(p.password).touched()) return null;
  return value() === valueOf(p.password)
    ? null
    : { kind: 'mismatch', message: 'Passwords differ' };
});
```

<div v-click="3">

```ts {all|5}
// one validator, errors aimed at descendants
validateTree(p, ({ valueOf, fieldTreeOf }) => {
  return valueOf(p.start) >= valueOf(p.end)
    ? { kind: 'range',
        message: 'End must be after start',
        fieldTree: fieldTreeOf(p.end) }
    : null;
});
```

</div>

</div>

<p class="lead" style="margin-top:44px;max-width:1520px" v-click>
<code>validate</code> cannot target another field - that is a compile error, and it is <code>validateTree</code>'s job. The error lands where the user fixes it, not on the group.
</p>

<!--
The stateOf().touched() gate gets its own highlight because it is the humane touch: don't shout
"passwords differ" at someone halfway through typing the first one.

Then validateTree arrives, and the final highlight is the fieldTree line - the error carrying
its own target. That is the bit reactive forms cannot express cleanly. A row validator can
return an ARRAY of errors, each aimed at a different cell - every duplicate flagged at once.
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
  <div v-click="5">
    <div class="label">PENDING IS FREE</div>
    <p>Bind the spinner to <code>pending()</code>. Nothing to track.</p>
  </div>
  <div v-click="6">
    <div class="label">SYNC RUNS FIRST</div>
    <p>Async only fires once the field's own sync rules pass. You are not hammering the endpoint on every keystroke of an obviously broken value.</p>
  </div>
  <div v-click="7">
    <div class="label">DEBOUNCE IS DECLARED</div>
    <p class="dim">Not piped. <code>validateAsync</code> is the lower-level escape hatch, backed by <code>resource()</code>.</p>
  </div>
</div>

</div>

<!--
Walk the config keys, then the three consequences. Every part of the state machine you would
have hand-rolled is one key in an object literal.

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

<p class="lead" style="font-size:34px;margin-top:44px;max-width:1500px" v-click>
Standard Schema, so Zod, Valibot or ArkType. Issues are routed to the exact nested field they came from. Zod is already a dependency of <code>@angular/forms</code>.
</p>

<p class="lead" style="margin-top:28px;max-width:1500px" v-click>
It validates. It does not transform - so <code>z.coerce</code> and <code>.transform()</code> do not apply. Your model must already be the shape Zod expects.
</p>

<!--
One line, two clicks, move on. First thing to cut for time.

The transform caveat is inferred from the signature (returns void, nothing written back). The
docs say nothing about it. Say "test it" rather than asserting it.
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

```ts {all|1-4|6-10|8-9}
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

<p class="lead" style="margin-top:36px;max-width:1500px" v-click>
Nested objects, arrays and sub-forms all go through the same two functions. Your shared validators become shared schemas.
</p>

<!--
Highlight the definition, then the application, then the two lines that matter: the SAME schema
mounted at two different paths. That is the whole argument for schemas being values.

Do not demo composition live - it is a reading activity and the payoff is seeing two files at
once, which a slide does better than an editor you have to scroll.

applyEach also works on Record<string, T>, which is the primitive for generic renderers.
-->

---
layout: content
eyebrow: 'Composition &middot; the peak'
heading: The schema path narrows
---

<div class="split">

```ts {all|3|4-5|8|10-11}
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
  <p v-click="2">A TypeScript type guard, used as the predicate, narrows the schema path inside the branch.</p>
  <p v-click="5">Discriminated-union forms with no casts and no ceremony.</p>
  <p class="dim" v-click="6">Honest footnote: this narrows the <em>schema path</em>, not the field tree. In the template, a union model still needs a superset model with <code>hidden()</code> per variant - which is what the docs recommend anyway, because switching branches loses user input.</p>
</div>

</div>

<!--
Highlight the type guard, then what it bought you inside the branch, then the OTHER branch, then
the line that would not compile.

LIVE DEMO 3 (~2 min) here. Reach for card.cardNumber inside the bank-transfer branch and let the
red squiggle land on the projector. The payload lives in the EDITOR, not the app - a screenshot
of a type error is a screenshot; a live one is proof.

And it is on thesis: the types narrow because the form was derived from your data, and your
data was a discriminated union all along.
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

No animation here on purpose. The next slide does the work.
-->

---
layout: content
eyebrow: 'Custom controls'
heading: Four methods, a provider and a forwardRef
---

````md magic-move {at:1}
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

<p class="lead" style="margin-top:48px;max-width:1560px" v-click>
That is the whole required contract. <code>errors</code>, <code>disabled</code>, <code>touched</code> and the rest are optional inputs you take only if you render them.
</p>

<!--
Leave the "before" up for three seconds without apologising for it. Do not read it. Do not say
"you can't see this". The volume IS the content.

Then click once and let it collapse to two lines. Say nothing during the animation.

Two things worth saying after:
- Never implement both interfaces. The CVA silently wins, no warning.
- FormValueControl components work in reactive AND template-driven forms unmodified. That makes
  porting your control library a no-regret move.
-->

---
layout: content
eyebrow: 'One more consequence'
heading: 'Your form is already a machine-readable contract'
split: 1.1fr 0.9fr
---

```ts {all|2-5|7|all}
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
  <p v-click="2">Angular walks your model and generates a JSON schema from it. Your <code>required()</code> calls become the agent's mandatory arguments.</p>
  <p v-click="3">If the submission fails, it hands back <code>errorSummary()</code> per field, so the agent can correct itself and retry.</p>
  <p class="dim" v-click="4">Experimental - the only such API left in the package. Schema inference rejects <code>null</code>, <code>undefined</code> and empty arrays, which fights the model-design advice coming up.</p>
</div>

<!--
Forty-five seconds, and frame it ON THESIS, not as an AI slide: because the form is derived
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

```ts {all|1-2|3-4|6-8}
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
  <p v-click="3"><code>undefined</code> does not mean "empty". It means <em>this field does not exist</em>, and Angular deletes the node.</p>
  <p v-click="4"><code>null</code> is allowed and is the sanctioned empty for number and date inputs - but a nullable <em>object</em> makes that whole subtree unnavigable.</p>
  <p class="dim" v-click="5">And <code>string | null</code> silently costs you <code>email</code>, <code>pattern</code>, <code>minLength</code> and <code>maxLength</code> - they are declared on <code>string</code>.</p>
</div>

</div>

<p class="lead" style="margin-top:40px;max-width:1560px" v-click="6">
The rule: <code>''</code> for text, <code>null</code> for numbers and dates, never <code>undefined</code>, never optional. Map to and from your domain model at the edges.
</p>

<!--
The single most valuable slide in the FAQ section. It is a compile error, not a lint, and people
hit it in the first hour.

The final click is the rule. If they photograph one slide in this section, it is this one.

Also: class instances lose their prototype on first write (shallow copy), and Map/Set produce
EMPTY field trees because children are enumerated with Object.keys. The type system does not
stop you on either - the failure is silent and at runtime.
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

<div v-click>

```html
@if (!f.spouseName().hidden()) {
  <input [formField]="f.spouseName" />
}
```

</div>

</div>

<div class="cards" style="--cols:3;margin-top:44px">
  <div class="card" v-click>
    <div class="label">IT DOES NOT TOUCH THE DOM</div>
    <p>You write the <code>&#64;if</code>. Render it anyway and you get a dev-mode warning.</p>
  </div>
  <div class="card" v-click>
    <div class="label">IT SKIPS VALIDATION</div>
    <p>Hidden, disabled <em>and readonly</em> all skip. A hidden <code>required</code> field will not block submit.</p>
  </div>
  <div class="card" v-click>
    <div class="label">IT KEEPS THE VALUE</div>
    <p><code>f().value()</code> still contains it. It still goes to your server.</p>
  </div>
</div>

<!--
Order matters: the rule, then the @if they have to write themselves, then the three
consequences with the surprise LAST.

LIVE DEMO 4 (~1 min) on the final click. This is demos/signup.ts. Toggle the dropdown, the
input vanishes, spouseName stays in the JSON blob. Eight seconds, and it lands the most
misunderstood behaviour in the API.

THE MIGRATION BOMB, say it loudly: reactive forms' form.value STRIPPED disabled controls and
you needed getRawValue(). Signal forms is exactly reversed - the model is the truth, so
disabled and hidden fields are in the payload by default. Anyone migrating a form that leaned
on disabled-means-omitted starts silently sending fields they used to drop.

The escape hatch is extractValue(f, { enabled: true }) from @angular/forms/signals/compat.

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
  <p v-click="2">Track by <em>field identity</em>, not <code>$index</code>. Angular stamps a hidden <code>Symbol</code> on each object so state follows a row across a reorder.</p>
  <p class="dim" v-click="4">Consequences: frozen objects in arrays throw. <code>structuredClone</code> of your model resets every row's touched and dirty state. Arrays of primitives are tracked by index, so removing item 0 shifts all state.</p>
  <p v-click="5">Genuinely dynamic shapes have an official pattern - derive model and schema from one config array. You surrender some type safety and cast inside each branch.</p>
</div>

</div>

<!--
f.items has NO .map/.filter/.find - only [i], .length and iteration. Compile error if you try.

Two things worth admitting: the docs say "avoid models with dynamic structure" on one page and
show you how to build them on another. Naming that tension makes you look like you read the
docs properly.
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
  <p v-click="5">No <code>TestBed.createComponent</code>. No fixture. No <code>fakeAsync</code>, no <code>tick()</code>.</p>
  <p v-click="6">Most form logic lives in the schema rather than the template, so most of it tests as plain function calls and signal reads.</p>
  <p class="dim" v-click="7">Render only for what actually needs the DOM: binding, typing, custom controls, focus.</p>
</div>

</div>

<p class="lead" style="margin-top:36px;max-width:1520px" v-click="8">
There is no <code>@angular/forms/signals/testing</code> entry point, and that is the good news - there is nothing to learn.
</p>

<!--
Walk it: build the form, assert, change the model, assert again. Then the punchline - notice
what is NOT here.

A bigger applause line for a room of maintainers than anything flashy. Testing a reactive
form's conditional validation meant a fixture and tick(). Here it is a signal read.

form() needs an injection context: runInInjectionContext, or pass { injector }.
-->

---
layout: content
eyebrow: Question
eyebrowColor: purple
heading: 'Is it stable? Are reactive forms going away?'
---

<div class="cards" style="--cols:2">
  <div class="card" v-click>
    <div class="label">STABLE IN V22</div>
    <p>Every symbol is <code>&#64;publicApi 22.0</code>. The only <code>&#64;experimental</code> thing left in the package is the WebMCP integration.</p>
  </div>
  <div class="card" v-click>
    <div class="label">BUT NOT FROZEN</div>
    <p>22.1 already deprecated passing a bare function to <code>disabled()</code> and <code>hidden()</code> in favour of <code>{{ '{' }} when {{ '}' }}</code>. One minor after stable.</p>
  </div>
  <div class="card" v-click>
    <div class="label">NOTHING IS DEPRECATED</div>
    <p>Deprecation is driven by usage data and the developer survey. NgModules have been optional since v14 and still are not deprecated.</p>
  </div>
  <div class="card" v-click>
    <div class="label">BUT THE INTENT IS CLEAR</div>
    <p>"We would like to replace the existing systems eventually... the one true form solution."</p>
  </div>
</div>

<p class="lead" style="margin-top:40px;max-width:1560px" v-click>
And everything you find online is written against a dead API: <code>Control</code> became <code>Field</code> became <code>FormField</code>. <code>FieldPath</code> became <code>SchemaPath</code>. <code>customError()</code> is gone.
</p>

<!--
The cards are deliberately paired - reassurance, then the qualifier, twice. Click them in pairs
so the rhythm reads as honesty rather than hedging.

"No API survives first contact with developers." - and the reason they shipped it experimental
was to get that contact early, instead of committing to two majors of stability on day one.

The NgModules precedent is the strongest reassurance you have. It is not a promise, it is a
ten-year track record, and everyone in the room has lived it.
-->

---
layout: content
eyebrow: Question
eyebrowColor: purple
heading: 'Will it work with our component library?'
---

<div class="cards" style="--cols:3">
  <div class="card" v-click>
    <div class="label teal">NATIVE INPUTS</div>
    <p>Work directly. Including <code>type=number</code> and <code>type=date</code>, which write <code>null</code> when empty.</p>
  </div>
  <div class="card" v-click>
    <div class="label teal">EXISTING CVA COMPONENTS</div>
    <p>Work with <code>[formField]</code> today. Angular provides a fake <code>NgControl</code> - a <em>subset</em>, so a control reaching deep into it may misbehave.</p>
  </div>
  <div class="card" v-click>
    <div class="label teal">NEW CONTROLS</div>
    <p><code>FormValueControl</code> or <code>FormCheckboxControl</code>. Never both.</p>
  </div>
</div>

<p class="lead" style="margin-top:44px;max-width:1560px" v-click>
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
  <div class="card" v-click>
    <div class="label">NO ARIA WIRING</div>
    <p>Zero <code>aria-</code> attributes in the package. <code>aria-invalid</code>, <code>aria-describedby</code>, <code>role="alert"</code> are yours. Angular's own example writes them by hand.</p>
  </div>
  <div class="card" v-click>
    <div class="label">SSR IS UNDOCUMENTED</div>
    <p>Not a single Signal Forms page mentions SSR or hydration - including the async page, where you would most expect it. Test it before you bet on it.</p>
  </div>
  <div class="card" v-click>
    <div class="label">NO STATUS CLASSES</div>
    <p><code>.ng-valid</code> and <code>.ng-dirty</code> do not appear. Your existing CSS silently stops working until you opt in.</p>
  </div>
  <div class="card" v-click>
    <div class="label">THE BUNDLE DOES NOT SHRINK</div>
    <p>Signal Forms import <code>Validators</code>, <code>NgControl</code> and <code>FormGroup</code> from the classic package. You do not get to delete <code>@angular/forms</code>.</p>
  </div>
</div>

<p class="lead" style="margin-top:40px;max-width:1560px" v-click>
And a genuine footgun: <code>submit()</code> ignores <em>pending</em> validators by default, so a user can submit while your username check is still in flight. Set <code>ignoreValidators: 'none'</code>.
</p>

<!--
Deliver this FASTER and with MORE specificity than the good parts. Vagueness here reads as a
sales pitch; precision reads as someone who has shipped it.

Third rhetorical prediction before the last click: "A field is pending. Is it valid?"
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
  <div class="card" v-click>
    <div class="label">FIELD METADATA</div>
    <p><code>createManagedMetadataKey</code> lets an <code>httpResource</code> live on a field, created in that field's own injector and destroyed with it. Per-row link previews for free.</p>
  </div>
  <div class="card" v-click>
    <div class="label">TYPED ERRORS</div>
    <p><code>NgValidationError</code> is a runtime base class <em>and</em> a discriminated union, so <code>e.min</code> and <code>e.maxLength</code> narrow. Message i18n at the render layer.</p>
  </div>
  <div class="card" v-click>
    <div class="label">transformedValue()</div>
    <p>Parse and format between what the input gives you and what your model wants, with parse errors reported into the field automatically.</p>
  </div>
  <div class="card" v-click>
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
  <div class="step" v-click>
    <div class="n">01</div>
    <h3>Write your next form signal-first</h3>
    <p>Not a migration. The next one. You will know inside a day whether the model fits your head.</p>
  </div>
  <div class="step purple" v-click>
    <div class="n">02</div>
    <h3>Port one control off ControlValueAccessor</h3>
    <p>Not a bet at all. <code>FormValueControl</code> works in all three forms systems, so nothing breaks.</p>
  </div>
  <div class="step grey" v-click>
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

<p class="lead" style="font-size:34px;margin-top:44px;max-width:1500px" v-click>
There is one object now. The model lives in a signal, the form is a view of it, and validation, touched, errors and submission are all derived. When you stop keeping two copies in sync, all the code that kept them in sync goes away.
</p>

<div style="display:flex;gap:56px;margin-top:64px;font-family:var(--font-mono);font-size:26px;color:var(--teal)" v-click>
  <span>angular.dev/guide/forms/signals</span>
  <span>Questions?</span>
</div>

<!--
"That's where we started. Same behaviour. Eighteen lines, then three.

The thing that changed isn't that Angular added a `when` option. It's that your data stopped
being a copy.

Your reactive forms are not going anywhere - the team deprecates when we tell them we're done,
and NgModules still work in v22. Nobody is taking your code away.

But when Alex Rickabaugh was asked, straight out, whether a third forms system means phasing
out the other two: 'We would like to replace the existing systems eventually. This is intended
to eventually become the one true form solution.'

So the question was never whether you learn this. It's which form you learn it on.

Thank you."
-->
