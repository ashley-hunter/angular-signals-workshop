# Research: recurring Angular signals mistakes

Background notes for the workshop in `slides.md`. Every pattern here was derived from evidence
rather than opinion: usage counts across a large Angular 22 monorepo, and a keyword and cluster
pass over roughly 4,000 recent pull request review comments from the same codebase.

Deliberately sanitised. No source code, file paths, component or service names, employer or
product names, reviewer identities, or verbatim review comments. Findings are paraphrased into
the general Angular pattern they represent, which is also the form they need to be in to be
teachable.

## Method, and how much to trust it

- **Corpus**: ~4,000 PR review comments pulled from the repository's review API, deduplicated to
  3,951 unique comments. Roughly half are from an automated reviewer, the rest from people.
- **Reactivity subset**: 290 comments matched signals or reactivity vocabulary (`signal`,
  `computed`, `effect`, `linkedSignal`, `untracked`, resource APIs, change detection,
  `ngOnChanges`, render hooks). 143 of those are distinct findings with their own title.
- **Codebase counts**: `grep` over the library and application source, counting occurrences,
  not semantic analysis.

Caveats worth stating before quoting any number below:

1. Keyword matching over-counts and under-counts. A finding phrased unusually is missed.
2. Counting occurrences is not counting problems. 1,691 `effect()` calls does not mean 1,691 bad
   effects.
3. The comment corpus is recent activity, not the project's whole history, so it is weighted
   toward whatever areas were active.
4. One measurement error is recorded in the corrections section at the bottom. Assume there could
   be others of the same kind.

## Where the codebase actually sits

Angular 22, TypeScript 6, RxJS 7, zone.js still present (one small app is zoneless).

| Modern | Count | Legacy counterpart | Count |
| --- | --- | --- | --- |
| `input()` | 8,590 | `@Input()` | 3,702 (211 with setters) |
| `output()` | 2,185 | `@Output()` | 957 |
| `viewChild()` / `contentChild()` | 745 | `@ViewChild` family | 485 |
| `computed()` | 8,109 | method calls in template bindings | ~11,260 |
| `@if` | 8,882 | `*ngIf` | 7 |
| `linkedSignal()` | 95 | `effect()` plus `.set()` | ~293 |
| resource APIs | 410 | `toSignal()` | 1,483 |
| `takeUntilDestroyed` | 3,707 | hand-rolled destroy subject | 195 |

Other figures the slides lean on: 1,691 `effect()` calls across 908 files; 8 `async` effects;
517 `untracked()` calls; 649 `toObservable()` (37 co-located with an effect or computed); 1,374
`toSignal()` calls with neither an initial value nor `requireSync`; 119 places where a
non-reactive translation lookup sits within two lines of a `computed(`; 144 surviving
`ngOnChanges` (39 of them in files that already use `input()`); 563 `ChangeDetectorRef`
references and 1,062 manual `markForCheck`/`detectChanges` calls; 16 uses of a custom `equal:`
comparator.

**The headline gap**: `linkedSignal` is the prescribed fix for the single largest cluster of
findings, and it appears 95 times against ~293 instances of the workaround it replaces.

## The three shapes

Within the 290 reactivity comments, findings sort into a small number of recognisable failure
modes. Counts are comment-level and multi-label, so they do not sum to 290.

| Shape | Comments | Nature of the bug |
| --- | --- | --- |
| Stale, never reruns | 44 | Dependency problem. Something changed and nobody was listening. |
| Wasteful, repeated work | 38 | Identity problem. Correct output, recomputed or refetched needlessly. |
| Silent failure | 27 | State-modelling problem. A failure rendered as ordinary data. |
| Race, ordering, lifetime | 11 | Two writers, or work outliving the thing that wanted it. |

The common property, and the reason these survive review: **none of them throw**. A stale label,
an empty list, a chart of zeroes and a form reporting itself valid all look like working software.

## Pattern catalogue

### 1. `effect()` used to derive state

The largest single cluster. Seven distinct findings with near-identical titles, which is a strong
signal that it is a habit rather than a one-off. An effect reads reactive state and writes
reactive state, so it looks reactive while actually being a manual subscription.

Four concrete costs: the value is a frame late; anything can write it, so the invariant is not
enforced; identity is not cached, so downstream work reruns; and it adds a change detection pass.

Fix ladder, in the order reviewers ask for it: `computed` → `linkedSignal` → an explicit method
on the owner → an effect, but only as a documented bridge.

### 2. Effects that write across a component boundary

The same mistake one level up. An effect writes a child's signal, a shared store, or the
parameters feeding a request. The child's derived work then reruns on a schedule it cannot see,
ownership of the value becomes ambiguous, and two writers can disagree.

Review question that settles it: who owns this value? If the child owns it, the parent passes it
in. If a request owns it, hand the request a computed of its parameters rather than a mirror kept
current by an effect.

### 3. Derived-and-writable, solved with an effect instead of `linkedSignal`

The reason people reach for an effect is usually legitimate: the value is derived, but it must
also stay writable. Selected row, current page, active tab, a field seeded from loaded data, a
selection that should survive a filter change but not a dataset change. The tell is a sentence
with "but" in it.

Less widely known, and relevant here: the linked signal write hook lets a write be forwarded to
whoever owns the value rather than kept as a local override, which removes the remaining case
where an effect was doing the plumbing by hand.

### 4. Async effects

Tracking covers the synchronous run only. After an `await`, a `then`, or a timer, reads are
invisible to the graph. This half-works, which is what makes it expensive to debug: the first
dependency does fire, so the wiring looks correct, and a change to the second silently does
nothing. Async work driven by signal parameters belongs in a resource, which also cancels
superseded work.

### 5. Non-reactive reads inside reactive code

Highest-volume single bug in the corpus, and the best slide in the deck because the cause is
invisible. A `computed` can only track signals. Reading from anything that cannot notify takes a
snapshot: correct once, then frozen.

Five separate findings were the same instance of this: a translation lookup called imperatively
and cached, so a language change updated everything rendered through a reactive pipe and left the
snapshotted strings in the old language. Same shape applies to an imperative service getter,
storage, the current time, the current URL, and the contents of a DOM node.

### 6. Wrong dependency sets, in both directions

Too narrow gives stale: a value the code genuinely uses is not tracked, often because the read
sits behind a helper or inside `untracked`. Observed symptoms include selections that only update
if you touch something else first, and browser back/forward changing nothing.

Too wide gives churn: work keyed on a whole state object instead of the few fields the result is
made of, so unrelated changes trigger remeasurement or refetching.

Both directions appeared roughly equally, and in several cases a comment above the code described
a dependency set the code did not implement. That makes such comments the most productive thing
to check in review, because they are the one kind of comment that can be verified line by line.

### 7. `untracked()` as an unexamined escape hatch

Sometimes exactly right, and also the easiest way to build a permanently stale value. Defensible
when the rerun is driven by something outside the graph and the read only supplies context to it,
or when a write is being kept out of the read that caused it. Not defensible when it silences a
loop nobody wanted to think about, or when it was added to make a test settle.

Useful test: if this value changed right now and nothing reran, would that be correct?

Authors successfully defended `untracked` three times in the corpus, always by naming the
non-reactive driver. One reviewer thread went the other way and removed a wrapper from a shared
helper because every call site already wrapped its own write, making the inner wrapper a second
place for the rule to drift.

### 8. Reading signal inputs in the constructor

Two findings, both confirmed by the authors, both silently wrong for a long time. Template-bound
inputs are not set when the constructor runs, so any decision taken there sees the default and
keeps that answer permanently.

Especially good at hiding, because the default is usually the common case, so the code appears to
work. In one instance a guard intended to skip expensive setup for cheap configurations never
fired at all, and the comment directly above it claimed the opposite. In another, fixtures seeded
from an input in the constructor rendered empty in every case that mattered.

Not covered by our written guidance at the time of writing. Worth adding.

### 9. DOM work in the wrong primitive

- A plain effect can run before the DOM it wants to touch exists, so a write lands on the old view
  or on nothing.
- A raw animation frame opts out of the framework's render coordination entirely.
- The default render phase mixes reads and writes, which forces synchronous layout. Splitting into
  a measure phase and a write phase is usually a two-line change, and each phase hands its result
  to the next.
- A measurement taken once inside a render callback is not reactive. If the measured element can
  resize on its own, it needs observing.
- A render callback that positions an overlay must depend on everything that changes the geometry,
  including content that arrives later from a deferred block. One finding was exactly this: both
  tracked values settled, positioning ran against a placeholder, then the deferred content
  replaced it and the measured height was wrong, with nothing in the dependency set having changed.
- Reads that force layout, worth listing on a slide: `offsetHeight`, `clientWidth`, `scrollTop`,
  `getBoundingClientRect()`, `getComputedStyle()`, `scrollIntoView()`, and `focus()`.

Cost scales with placement. An unbatched read in something rendered once is free; the same read in
a per-row or per-cell component becomes one forced reflow per instance.

### 10. Impurity and identity in derived state

Purity findings: a `computed` that injects a stylesheet, and a `computed` that constructs an
object owning a worker and an async initialisation, with no disposal path, so each recomputation
leaks the previous one. The author's pushback on the second is itself the teaching point: the rule
is about mutating external state, not about constructing an object that happens to do work. Worth
presenting both sides.

Identity findings: a helper returning a fresh array on every call, bound to something that does
real work with the value, so referential inequality invalidated cached ranges and rebuilt work on
every check. Also a template fabricating a throwaway iterable per row.

This explains a whole family of mystery performance problems, and the fix direction matters: a
`computed` is not merely tidier, the caching is the point.

### 11. Work in templates rather than in derived state

Method calls in bindings run on every check of that view, including checks caused by something
entirely unrelated elsewhere in the component. Two findings named the concrete cost: rebuilding
URL filters and re-reading a map per row, and allocating a date and repeating locale formatting on
every pass. ~11,260 method-call bindings exist in the codebase.

Cheapest fix in the whole catalogue: precompute a view object once and bind to its fields. It is a
move, not a redesign.

### 12. Async state modelling with the resource APIs

The densest cluster after effects, and the one with the worst user-visible consequences. Every
item here was a real shipped or nearly-shipped bug.

- **Failures flattened into empty values.** Five separate findings. An error mapped to an empty
  array, a default supplied so the template need not branch, no-value treated as no-data, a
  ternary returning an empty string so a link silently vanished. Each one reads as defensive good
  practice and each one converts "we do not know" into "there is nothing".
- **Error aggregation.** An aggregate error signal that read only one of two sources reported
  success while half the data was missing. Elsewhere, requiring *both* sources to fail before
  showing an error meant one failure rendered as a legitimate "not available".
- **Reading the value in the error state throws**, and if that read is inside a computed, the
  exception poisons everything downstream.
- **Parameters going from defined to `undefined` discards the previous value.** Filed as a
  finding, then correctly rebutted on the grounds that the intermediate state was unreachable in
  that flow. The mechanism is real; whether it bites is a reachability question. Good example of a
  finding worth understanding even when it is not actionable.
- **Retry paths that cannot recover**, because reload refreshed only one of two sources.
- **Resource lifetime is injector lifetime.** A panel-scoped service was destroyed by a tab
  switch, cancelling its requests, while a drawer it fed stayed open and permanently loading.
- **No request deduplication.** Two resources over the same parameters are two requests.
- **Not everything should take a resource as an input.** A shared component taking a resource
  couples itself to one loading mechanism. Take the finished value and let the consumer decide
  where it came from.

### 13. Boundaries, visibility and restraint

Cheap to fix, and they keep coming back, which makes them habit material rather than review
material.

- Template-only state wants `protected readonly`. Templates can read protected members, so
  `public` on such state is an invitation somebody eventually accepts.
- Runtime-private fields over compiler-only `private` for new internals.
- **Signals do not make data immutable.** A cached array handed across a boundary can be mutated
  in place by a consumer. The mutation is immediately visible to every later reader and completely
  invisible to the graph, so the UI and the state disagree with no changed reference anywhere.
  Type the boundary as a readonly collection.
- Over-signalling. Three comments on one change reverted live writable state back to derived
  state, because the source was fixed at open and a mid-session flip would have sent the wrong
  shape of request. Also: a computed that only renames another signal, and derived state named
  after its mechanism rather than the concept it represents.

### 14. Testing reactive code

- **Fixed flush counts.** A hand-rolled loop of a set number of ticks encodes today's scheduling.
  One extra turn or a delayed response and the assertion runs against the initial state and passes
  for the wrong reason. Predicate-based waiting removes the guess.
- **Readiness signals that cannot arrive.** Waiting for a count to become non-zero works until
  zero is the correct answer, at which point the test hangs and gets reported as a defect in
  whatever it was pointing at. Wait for a settled status, not for evidence of output.
- **Imperative mutation needs a flush.** Mutating a component outside its inputs leaves the view
  unchecked.
- **Do not reach past visibility in tests.** Bracket-indexing a protected signal and asserting it
  is non-null is a test smell, not an access strategy.
- **Assertions too shallow to notice failure.** One test passed because headings render in both
  the success and error states.
- A timeout is a diagnosis to start from, not a verdict: check the interaction, the locator and
  the fixture setup before concluding the component is broken.

## What review catches overall

Important context, and a correction to an earlier framing of mine. The reactivity findings above
are a subset. Across all 3,951 comments, the automated reviewer's own declared categories are:

| Declared finding type | Count |
| --- | --- |
| Coding guideline violations | 614 |
| Logical bugs | 393 |
| Type inconsistency | 153 |
| Breaking changes | 72 |
| Naming and typos | 49 |
| Security patterns | 33 |
| Duplication and conventions | 24 |

By theme, counting comments rather than categories: missing or inadequate test coverage 274,
comments and docs that no longer match the code 268, staleness 243, duplication 212, silent
behaviour 168, crashes or throws 101, error handling 70.

So the top of the review pile overall is guideline violations, logical bugs, missing tests and
stale documentation. Reactivity is a large and expensive slice, not the majority.

## Corrections

- **"Races" was a measurement error.** An early pass counted 124 comments mentioning races, which
  was wrong: the pattern also matched *traces*, and this codebase has substantial tracing
  functionality. With word boundaries it is 25 comments across the whole corpus, 11 within the
  reactivity subset, and `race condition` appears zero times. Races was removed from the framing
  slide and replaced with wasteful work, which is genuinely the second most common shape. Recorded
  here because the same class of error could be hiding in the other counts.
- **"Most common issues in code review" was an overclaim** even before the races error. What was
  measured was the vocabulary of reactivity findings, not a ranking of all review categories. The
  slide now says three recognisable shapes of reactivity finding, and the section above gives the
  real overall ranking.

## Gaps in written guidance

Three things this research surfaced that our internal Angular rules did not cover, and that an
automated reviewer therefore cannot cite:

1. Reading signal inputs in the constructor.
2. Resource state semantics: empty versus error versus not-yet-asked, error aggregation across
   several sources, and retry paths that cover every source.
3. Mutable collections crossing a signal boundary, and typing them readonly.

Also worth adding, lower priority: custom equality for derived collections, and a mapping table
from each `ngOnChanges` shape to its signals equivalent.
