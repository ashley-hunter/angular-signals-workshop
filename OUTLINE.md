# Angular Signal Forms - candidate slides

Source of truth for the API: `node_modules/@angular/forms/types/*.d.ts` (v22.1.1), cross-checked
against angular.dev guides. Most blog posts are written against v21 previews and are wrong now -
see "API churn" below.

`[demo]` = good candidate for a live editable demo (Monaco + running Angular).

---

## 0. Framing

1. **Title** - Angular Signal Forms.
2. **Where we are** - third forms system: template-driven (v2), reactive (v2), signal (v21
   experimental → **v22 stable**). Existing APIs coexist indefinitely; nothing is deprecated.
3. **The pitch in one slide** - your model is a `signal`, the form is derived from it, validation
   is a schema function. Everything else is a computed.
4. **The 30-second version** `[demo]`
   ```ts
   model = signal({ name: '', email: '' });
   f = form(this.model, (p) => {
     required(p.name);
     email(p.email);
   });
   ```
   ```html
   <input [formField]="f.name" />
   ```
5. **Why now** - signal forms close the template-driven vs reactive debate: one system, typed,
   with the schema in TS rather than split between class and template.
5b. **Forms are why Angular has signals** - per Rickabaugh, forms were "one of the main drivers"
   of choosing signals to replace zone.js. Signal forms aren't a bolt-on; they're the thing the
   reactivity system was chosen for. See quotes below.
5c. **The team wants this to win** - "we would like to replace the existing systems eventually...
   the one true form solution." No deprecation planned, but this answers "what do we teach now".

## 1. The model

6. **The model is the source of truth** - a `WritableSignal<T>` of plain data. The form doesn't own
   the value, it wraps it. Two-way: user input writes the signal, `.set()` on the signal updates
   the UI.
7. **`form()` derives a FieldTree** mirroring the model shape - `f.address.street` exists because
   the model has it. Dot access = navigation, call = state: `f.email` vs `f.email()`.
8. **Constraints worth saying out loud** - plain objects and arrays only. Class instances, `Map`,
   `Set` are unsupported. `undefined` means "field doesn't exist", not "empty" - model with
   concrete defaults and map to/from your domain model at the edges.
9. **Arrays** `[demo]` - `f.items[0].product`, adding items via
   `f.items().value.update(xs => [...xs, item])`. Note the verbosity honestly.
10. **Domain model vs form model** - the impedance mismatch signal forms make visible
    (`delay: model.delay ?? 0`). Good slide for the "this is a design forcing function" argument.

## 2. Binding

11. **`FormField` directive** - `<input [formField]="f.email" />`. Two-way binds value, mirrors
    `disabled`/`readonly`/`required`/`min`/`max`/`minlength`/`maxlength`/`pattern`, relays blur →
    touched.
12. **No browser constraint validation** - Angular sets `novalidate` and mirrors the attributes for
    a11y only. Validation is entirely in signals. This surprises people.
13. **`FormRoot`** - `<form [formRoot]="f">` wires submit, novalidate, preventDefault.

## 3. Field state

14. **`FieldState` is all signals** - the full list is worth one dense slide:
    `value`, `controlValue`, `touched`, `dirty`, `valid`, `invalid`, `pending`, `submitting`,
    `errors`, `errorSummary`, `disabled`, `disabledReasons`, `readonly`, `hidden`, `required`,
    `min`, `max`, `minLength`, `maxLength`, `pattern`, `name`, `keyInParent`.
15. **State propagates up** - a child going invalid invalidates its parent and the root.
    Hidden/disabled/readonly fields are non-interactive: they don't validate and don't affect
    parent validity, touched, or dirty.
16. **Methods, not signals** - `markAsTouched({skipDescendants})`, `reset(newModel?)`,
    `focusBoundControl({preventScroll})`, `metadata(key)`, `hasMetadata(key)`.
17. **`errors()` vs `errorSummary()`** `[demo]` - own errors vs everything beneath this node.
    `errorSummary()` is how you build "jump to first error".

## 4. Validation

18. **Built-ins** - `required`, `email`, `min`, `max`, `minDate`, `maxDate`, `minLength`,
    `maxLength`, `pattern`. All take `{message}`, all take `{when}`.
19. **Every rule is conditional** `[demo]`
    ```ts
    required(p.promoCode, {
      message: 'Promo code required',
      when: ({valueOf}) => valueOf(p.applyDiscount),
    });
    ```
    The `when` recomputes like a `computed`. This replaces most of `setValidators`.
20. **Custom validators are just functions returning `{kind, message} | null`** `[demo]` - no
    `customError()` wrapper any more, no `ValidatorFn` type gymnastics.
21. **All rules run** - validation doesn't stop at the first failure; `errors()` is an array.
22. **Cross-field: `valueOf` vs `stateOf`** `[demo]` - the password-confirm example, including the
    nice touch of gating on `stateOf(p.password).touched()` so it doesn't shout too early.
23. **`validateTree()`** - one validator, errors targeted at specific child fields via `fieldTree`.
    The thing reactive forms genuinely could not do cleanly.
24. **Standard Schema interop** - `validateStandardSchema(p, zodSchema)`. Zod/Valibot as your
    validation layer, errors flow into the field tree. Big slide for teams already on Zod.
25. **Typed error classes** - `RequiredValidationError`, `MinValidationError`, ... plus factory
    functions (`requiredError()`, `minError(5)`). Useful for i18n of messages at the render layer
    instead of hardcoding strings in the schema.

## 5. Schemas and composition

26. **`schema<T>()`** - extract rules into a reusable, typed unit. Guidance from the docs: inline
    until you need it twice.
27. **`apply()`** - mount a schema at a path. Layering (`apply(p, base)` then extra rules).
28. **`applyEach()`** `[demo]` - per-array-item rules, including items added later.
29. **`applyWhen()` / `applyWhenValue()`** `[demo]` - conditional blocks of rules. `applyWhenValue`
    takes a type guard and **narrows the path type** - discriminated-union forms
    (credit card vs bank transfer) with no casts. This is the slide that sells the type system.
30. **Structural vs behavioural layer** - the schema function runs once to build structure; the
    rules inside it are reactive and re-run. Getting this distinction across prevents most
    confusion about "why does my schema not re-run".

## 6. Interaction state

31. **`disabled()`, `readonly()`, `hidden()`** `[demo]` - what each means, all three skip
    validation, only `hidden` has no DOM equivalent (you write the `@if`).
32. **`disabledReasons()`** - return a string instead of `true` and the reason is available to the
    UI; multiple `disabled()` calls accumulate. Small feature, very demo-able.

## 7. Async

33. **`validateHttp()`** `[demo]` - `request` / `onSuccess` / `onError`, return `undefined` to skip.
    Username availability is the canonical demo.
34. **`validateAsync()`** - the escape hatch, backed by `resource()` / `rxResource()`.
35. **Async runs only after sync passes** - free protection against hammering your API.
36. **`debounce()`** - field-level `debounce(p.username, 300)`, `'blur'`, or a custom `Debouncer`;
    versus validator-level `{debounce: 300}` which only throttles the request.
37. **`pending()` semantics** - while pending, `valid()` is false *and* `invalid()` is false, and
    `errors()` is empty. Tri-state, not boolean. Worth a slide, people get this wrong.

## 8. Submission

38. **`submit()` lifecycle** - mark touched → check validity → run action with `submitting()` true
    → map errors. Returns `Promise<boolean>`.
39. **Declarative submission** `[demo]` - `form(model, schema, {submission: {action, onInvalid,
    ignoreValidators}})` plus `<form [formRoot]="f">`. No `(ngSubmit)` handler.
40. **Server errors land on fields** - return `{kind, message, fieldTree: f.email}`, or an array to
    scatter errors across fields. They auto-clear when the user edits.
41. **`ignoreValidators`** - `'pending'` (default) | `'none'` | `'all'`. The default lets users
    submit while async validators are still in flight - know this before you ship.
42. **`onInvalid` + `focusBoundControl()`** - accessible "focus the first error" in four lines.
43. **Concurrent submits return `false`** immediately rather than queueing.

## 9. Custom controls

44. **`FormValueControl<T>` vs `ControlValueAccessor`** `[demo]` - four methods replaced by
    `value = model('')`. Probably the single most crowd-pleasing before/after in the talk.
45. **`FormCheckboxControl`** - `checked` instead of `value`; never implement both.
46. **Optional inputs you can opt into** - `touched`/`touch` output, `disabled`, `readonly`,
    `hidden`, `errors`, `valid`, `invalid`, `pending`, `required`, `min`/`max`, `minLength`/
    `maxLength`, `pattern`, `name`.
47. **Never implement both `ControlValueAccessor` and `FormValueControl`** on one component.

## 10. Metadata (advanced, cut first if short)

48. **`createMetadataKey()` / `metadata()`** - attach arbitrary reactive data to a field. The
    built-in validators are implemented on top of this (`REQUIRED`, `MIN_NUMBER`, `PATTERN`, ...).
49. **`MetadataReducer`** - `list()`, `or()`, `and()`, `min()`, `max()`, `override()`, or your own.
50. **`createManagedMetadataKey()`** `[demo]` - the URL-preview example: an `httpResource` living
    on a field, created once in the field's injection context. Genuinely novel, good "one more
    thing" material.

## 11. Migration

51. **Two directions** - top-down `compatForm()` (keep a `FormControl`/`FormGroup` inside a signal
    form) and bottom-up `SignalFormControl` (a signal-validated leaf inside a `FormGroup`).
52. **`compatForm` gotcha** - `form().value()` returns the `FormControl` instance, not its value;
    you hand-roll a `computed` to flatten. Say this out loud, it will bite someone.
53. **Deliberately unsupported on `SignalFormControl`** - `enable()`/`disable()` (use `disabled`),
    `setValidators()` (use `applyWhen`), `setErrors()`/`markAsPending()` (errors are derived, full
    stop). This is a philosophy slide, not an API slide.
54. **Migrate components before forms** - `FormValueControl` components work in reactive and
    template-driven forms as-is, and in v22 `ControlValueAccessor` components work with
    `[formField]` and propagate their errors into the signal tree. Both directions work, so you can
    go incrementally.
55. **No `.ng-valid` / `.ng-dirty` by default** - opt in with
    `provideSignalFormsConfig({classes: NG_STATUS_CLASSES})`.
56. **Alex Rickabaugh on automated migration**: "more a task for AI and should be seen as 'best
    effort' rather than guaranteed."

## 12. Closer

57. **WebMCP** `[demo]` - `provideExperimentalWebMcpForms()` + `{experimentalWebMcpTool: {name,
    description}}` and Angular generates a JSON schema from your model so an AI agent can fill and
    submit your form. Still `@experimental` (the only experimental thing left in the package).
    Strong ending.
58. **What's still awkward** - array mutation verbosity, no per-field debounce nesting, hidden
    fields still occupy form state, dynamic JSON-schema-driven forms are the weakest migration
    path.
59. **When not to use it** - the docs themselves say reactive forms remain a solid choice for
    existing apps. Credibility slide.
60. **Resources / links.**

---

## API churn - a warning slide worth including

Between the v21 preview and v22 stable the API was renamed repeatedly. Anything you find online
may use the dead names:

| Old | Current (v22) |
| --- | --- |
| `Control` directive, then `Field` | `FormField`, bound as `[formField]` |
| `[field]="f.x"` | `[formField]="f.x"` |
| `FieldPath<T>` | `SchemaPath<T>` |
| `customError({kind, message})` | plain `{kind, message}` |
| manual `submit()` in a handler | `{submission: {action}}` + `[formRoot]` |

Verified against `@angular/forms@22.1.1` types locally. Several 2026 blog posts still show
`customError()` and `[field]`; at least one claims features that no longer exist.

---

## Suggested 45-minute cut

Framing (1-5) → model (6-9) → binding (11-12) → state (14, 17) → validation (18-24) →
schemas (26-30) → async (33, 36, 37) → submission (39-41) → custom controls (44) →
migration (51-54) → WebMCP (57) → honest limitations (58-59).

Cut first: metadata (48-50), typed error classes (25), `disabledReasons` (32).

## Talks and sources

- angular.dev guides: overview, models, validation, cross-field-logic, schemas, form-logic,
  field-state-management, field-metadata, async-operations, form-submission, custom-controls,
  ai/webmcp
- `rickabaugh-webdev-podcast.txt` - Alex Rickabaugh (tech lead, Angular core framework) on the
  WebDev podcast with Jason Lengstorf, Jan 2026. https://www.youtube.com/watch?v=hKkiivsyrHA
  The design-rationale source. Companion pair-programming episode: Learn With Jason S8E19,
  12 Dec 2025, https://codetv.dev/series/learn-with-jason/s8/angular-signal-forms
- `angular-official-launch.txt` - the official v21 launch video (Mark Thompson / Kirill
  Cherkashin). https://www.youtube.com/watch?v=7v8mIW9_NXw
- `first-look-sep2025.txt` - pre-release first look, Sep 2025.
  https://www.youtube.com/watch?v=CEAVN_pkCXU
- `kurata-first-look.txt` - Deborah Kurata, Dec 2025. https://www.youtube.com/watch?v=J0pVA4lJMso
- Reddit AMA with Alex Rickabaugh, via ng-news 25/37
- Manfred Steyer / ANGULARarchitects, "All about Angular's new Signal Forms" - the best third-party
  deep dive; source of the domain-vs-form-model argument and most of the limitations list
- ng-news 25/33 (first public demo), 25/50

Caveat on the video sources: all four predate v22. They use `[field]`, call signal forms
experimental, and the launch video says validators "return undefined - no more nulls". The types
now accept `null | undefined | void` as success, so both work.

---

## Quotes worth a slide

Verbatim from the talk and podcast transcripts listed above, lightly trimmed of filler.

**Signal forms are meant to win.** Asked directly whether a third forms system means phasing out
the other two, Rickabaugh:

> "We're very open about the fact that we would like to replace the existing systems eventually."
> [...] "This is intended to eventually become the one true form solution."

Not a deprecation - he's explicit that deprecation is community-driven, measured via HTTP Archive
and the developer survey - but it settles the "which forms API should we teach juniors" question.

**Forms are why Angular has signals at all.** The best fact in the whole research pile:

> "We actually kind of knew when we were making the decision to do signals in Angular, we were
> looking at replacing zone.js with something and signals was one option on the table. There were a
> few others. But forms was actually one of the main drivers of that decision. So we even knew back
> then that we wanted to do a signal form system if we created a signal reactivity system in the
> framework."

**The one-line mental model:**

> "The form system in Angular is really a way of creating the state to drive a form UI - and state,
> of course, is the domain of signals. You can think of the signal form system as a wrapper around
> your data, the data you actually want the user to edit, that creates all of the form state and
> keeps it updated."

**On ending the template-driven vs reactive war:**

> "There's a huge debate in the Angular community of should you use reactive forms or template
> driven forms. We wanted to resolve that once and for all by bringing the best of both worlds into
> a new form system that everyone can use."

**On shipping experimental at all:**

> "No API survives first contact with developers." [...] "We used to be very conservative about
> releasing new features - the moment it became public API we had this commitment to two major
> versions. We were missing out on the chance to get that early feedback and involve developers in
> the actual design process."

Pair this with the API-churn table: the churn was the point, and it's over now that v22 is stable.

**The official launch video's joke about `ControlValueAccessor`**, worth stealing with credit -
Mark Thompson, mid-fight, in a Mortal-Kombat parody:

> "Is there some sort of form I can fill out to get out of this? Because honestly, being in this
> fight is worse than dealing with the control value accessor."

and, as the CAPTCHA to prove he isn't a robot:

> "Tell me how to use the control value accessor." [long pause] "Exactly. Thank you."

Perfect setup for the `FormValueControl` before/after (slide 44).
