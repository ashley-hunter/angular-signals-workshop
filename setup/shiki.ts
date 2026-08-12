import { defineShikiSetup } from '@slidev/types'
import { deckShikiTheme } from '../theme/deck-shiki'

export default defineShikiSetup(() => ({
  themes: { dark: deckShikiTheme, light: deckShikiTheme },
  // `angular-ts` highlights inline component templates as HTML rather than as one
  // flat string, which is what the live demo file needs.
  langs: ['angular-ts', 'angular-html'],
}))
