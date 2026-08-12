import { defineMonacoSetup } from '@slidev/types'

export default defineMonacoSetup((monaco) => {
  // The demo file imports @angular/forms/signals, whose types aren't available to
  // Monaco's TS worker, so every import and symbol is flagged (TS2307 and friends).
  // Real type checking happens in the Vite build; the editor only needs to be a
  // readable, editable surface, so drop semantic errors and keep syntax ones.
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: true,
  })
})
