# Angular Signals workshop

Slides for "Angular Signals: patterns we reach for, pitfalls we keep shipping", built with [Slidev](https://sli.dev).

## Running the slides

```bash
npm install
npm run dev
```

## Demos

Each slide with a code example has a runnable Angular 22 project in [`stackblitz/`](stackblitz). They open in StackBlitz straight from this repo, no login needed.

The first step on each slide is live. Later steps are in `src/app.ts` but commented out: comment out the live `STEP` block and uncomment the next one (select the lines, then Cmd+/ or Ctrl+/). The header comment in each file says what to try and what to look for.

| Slide | Topic | Demo |
|---|---|---|
| 5 | An effect that writes a signal is a computed you maintain by hand | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/05-effect-to-computed?file=src%2Fapp.ts) |
| 6 | When the user can override the derived value | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/06-linked-signal-pagination?file=src%2Fapp.ts) |
| 7 | A linkedSignal can write back to its source | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/07-linked-signal-write-back?file=src%2Fapp.ts) |
| 10 | An effect stops tracking the moment it goes async | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/10-async-effect?file=src%2Fapp.ts) |
| 11 | Cleanup is not teardown. It is undo the previous run | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/11-effect-cleanup?file=src%2Fapp.ts) |
| 13 | A dependency set can be wrong in both directions | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/13-dependency-set?file=src%2Fapp.ts) |
| 14 | A dependency can arrive in code you did not write | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/14-hidden-dependency?file=src%2Fapp.ts) |
| 15 | Non-reactive reads inside reactive code | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/15-non-reactive-reads?file=src%2Fapp.ts) |
| 17 | The constructor sees defaults, not inputs | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/17-constructor-defaults?file=src%2Fapp.ts) |
| 19 | DOM work belongs to a render phase | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/19-render-phase?file=src%2Fapp.ts) |
| 21 | Read everything, then write everything | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/21-read-then-write?file=src%2Fapp.ts) |
| 23 | A computed has no way to clean up after itself | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/23-computed-cleanup?file=src%2Fapp.ts) |
| 24 | Reference equality is the notification boundary | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/24-reference-equality?file=src%2Fapp.ts) |
| 26 | Signal-driven fetches belong in a resource | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/26-resources?file=src%2Fapp.ts) |
| 28 | A failed request that renders as no data | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/28-failed-request?file=src%2Fapp.ts) |
| 29 | An unguarded toSignal is a state you did not model | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/29-to-signal?file=src%2Fapp.ts) |
| 32 | Signals do not make your data immutable | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/32-readonly-arrays?file=src%2Fapp.ts) |
| 37 | Rules live in the schema, beside the data | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/37-signal-form-schema?file=src%2Fapp.ts) |
| 38 | Describe the rule, not the response | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/38-conditional-validation?file=src%2Fapp.ts) |
| 39 | One interface, one signal, no ControlValueAccessor | [Open in StackBlitz](https://stackblitz.com/github/ashley-hunter/angular-signals-workshop/tree/main/stackblitz/39-custom-control?file=src%2Fapp.ts) |

To run one locally, `cd` into its folder, then `npm install` and `npm start`.
