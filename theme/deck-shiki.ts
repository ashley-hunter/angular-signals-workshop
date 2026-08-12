/**
 * Shiki theme built from the deck's palette, so highlighted code matches the
 * hand-coloured snippets in `Angular Signal Forms.dc.html`:
 * keywords and numbers purple, strings teal, comments dim, everything else plain.
 *
 * Shared by `setup/shiki.ts` (static code blocks) and `components/MonacoTheme.vue`
 * (the live editor), so both stay in sync.
 */
export const DECK_THEME = 'signal-forms-deck'

export const deckShikiTheme = {
  name: DECK_THEME,
  type: 'dark' as const,
  colors: {
    'editor.background': '#12171F',
    'editor.foreground': '#C9D4E2',
    'editorLineNumber.foreground': '#3A4553',
    'editorCursor.foreground': '#2FD8B4',
    'editor.selectionBackground': '#2FD8B433',
    'editor.lineHighlightBackground': '#1A212B',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#5E6B7D' },
    },
    {
      scope: [
        'string',
        'string.template',
        'punctuation.definition.string',
        'constant.other.symbol',
      ],
      settings: { foreground: '#2FD8B4' },
    },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'keyword.control',
        'keyword.operator.new',
        'keyword.operator.expression',
        'variable.language.this',
        'constant.language',
        'constant.numeric',
        'support.type.primitive',
        'entity.name.type',
      ],
      settings: { foreground: '#8B7CF6' },
    },
    {
      scope: ['punctuation', 'meta.brace', 'keyword.operator'],
      settings: { foreground: '#8A97A8' },
    },
    {
      scope: [
        'variable',
        'variable.other',
        'entity.name.function',
        'support.function',
        'meta.object-literal.key',
        'variable.other.property',
        'entity.name.tag',
      ],
      settings: { foreground: '#C9D4E2' },
    },
  ],
}
