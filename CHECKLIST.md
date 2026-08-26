# Signals review checklist

The companion to the Angular Signals talk. Keep it open in review.

Every issue below shares one property: **none of them throw**. A stale label, an empty
list, a chart of zeroes, a form that says it is valid. They all look like working
software, which is why they survive review.

## Symptom, and what to reach for

| If you see | Reach for | Because |
| --- | --- | --- |
| An effect that writes a signal | `computed`, or `linkedSignal` | The effect lands after the view was checked, anything can overwrite the result, and it runs even when nothing reads it |
| An effect that writes another component's signal | An input, or an explicit method on the owner | Ownership of the value stops being visible from the class that declares it |
| An `await` inside an effect | A resource keyed on a computed of the parameters | Dependency tracking stops at the first `await`, so anything read after it is silently untracked |
| A non-signal read inside derived state | Bring it into the graph, or read it at render time | A plain function call cannot trigger re-evaluation, so the value goes stale and stays stale |
| A decision taken in a constructor | A `computed`, or an effect that tracks the input | Signal inputs are not set when the constructor runs, so the check always sees the default |
| A DOM write in a plain effect | `afterRenderEffect` with a phase | `@if` and `@for` blocks and child components may not have updated yet, and read-then-write forces layout |
| A fresh array or object per read | A `computed`, so identity is cached | A new reference every read defeats every downstream identity check |
| A method call in a binding | A precomputed view object, bound field by field | The method runs on every check of the view, once per row in a `@for` |
| An error mapped to an empty value | A distinct error state, carried to the template | Catching inside a loader makes the resource treat a failure as success, so the error state never becomes true |
| A resource on a component-scoped service | Scope it to whatever outlives the interaction | The request is torn down with the component, mid-flight |
| Side effects in derived state | An owner that can also tear it down | `computed` has no cleanup hook, so every recomputation leaks the previous worker, socket or timer |
| A public writable signal | `protected readonly`, readonly at boundaries | Anything that can replace the signal can break the graph that depends on it |
| A mutable array crossing a boundary | Type it `readonly` at the boundary | `push` and `pop` mutate in place, so the graph never learns anything changed. A `readonly` type catches it at compile time, with no runtime cost |

## Also worth checking

- **Effects that register anything need a cleanup function.** Intervals, timeouts and
  event listeners accumulate one per run, not one per component. The cleanup runs before
  every re-run, not only on destroy.
- **Track granularly.** A resource keyed on a whole state object refetches when any
  property changes, including ones the request does not use. Reading the properties
  inside the params function does not help, because the dependency is on the object.
  Split into separate signals.
- **Wrap external calls in `untracked`.** A service method called from an effect
  contributes its own reads and writes to that effect's dependencies. Someone adding a
  signal to that service six months from now creates a loop in code you never touched.
- **`toSignal` widens the type to include `undefined`.** Set `requireSync: true` where a
  value is always present, or supply an initial value, so the UI does not flash an empty
  state first.
- **Order the template states deliberately.** Error first, then existing values, then
  loading. Keep the current list on screen while the next page loads, or it flickers.
- **`ngOnChanges` is usually removable.** Recomputing from inputs is a `computed`,
  resetting local state on input change is a `linkedSignal`, deriving something
  non-reactive is an effect. Only `firstChange` has no direct equivalent, and that
  belongs in `ngOnInit` anyway.
- **A custom `equal` on a `computed`** is available when reference equality is too eager,
  for example comparing ids and a revision rather than array identity.

## Valid reasons to use an effect

Not every effect is a mistake. These are the cases it exists for:

- Talking to a third party library that knows nothing about signals
- Writing to local storage, session storage, or the URL
- Logging
- Calling an imperative API in response to a reactive change

## Forms

- **New forms use Signal Forms.** Stable in v22, semver protected, and supported across
  our component library through `[formField]`.
- **Existing reactive forms keep working.** Existing `ControlValueAccessor` controls bind
  to a signal form unchanged, so nothing has to be migrated first.
- **Be careful with published examples, and with generated code.** The API was renamed
  repeatedly before v22, so a lot of material online uses names that no longer exist.
