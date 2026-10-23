/**
 * App-owned web font family constants.
 *
 * Keep this module free of SDK imports: public share pages reuse the same
 * typography as the main app without loading the authenticated SDK runtime.
 * The matching @font-face declarations live in web/fonts.css.
 */
export const FONTS = {
  // Legacy aliases
  medium: 'Selecta',
  serifItalic: 'CaslonIonic',

  // Sans-serif
  regular: 'Selecta',
  sans: 'Selecta',
  inter: 'Inter',
  graphik: 'Graphik',
  // Legacy alias: Space Grotesk is retired; preserve the key for existing app source.
  spaceGrotesk: 'Neue Haas Grotesk',
  neueHaas: 'Neue Haas Grotesk',
  cofoSona: 'CoFo Sona',

  // Serif
  serif: 'CaslonIonic',
  canela: 'Canela',
  // Legacy alias: EB Garamond is retired; preserve the key for existing app source.
  garamond: 'Delusse',
  orleans: 'Orleans',
  fraunces: 'Fraunces',
  delusse: 'Delusse',
  terzaReader: 'Terza Reader',
  williamText: 'William Text',

  // Display
  boldWide: 'Mattone',
  boldNarrow: 'CoFo Kak',
  druk: 'Druk Cy',
  normalBold: 'Normal Bold',

  // Monospace
  mono: 'IBM Plex Mono',
  semiMono: 'ABC Monument Grotesk Semi-Mono',
  diatypeMono: 'ABC Diatype Mono',
} as const;

export type FontKey = keyof typeof FONTS;
export type FontFamily = (typeof FONTS)[FontKey];

export const FONT_STACKS = {
  sans: `'${FONTS.regular}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  serif: `'${FONTS.serif}', Georgia, 'Times New Roman', serif`,
  mono: `'${FONTS.mono}', 'SF Mono', Menlo, Consolas, monospace`,
} as const;
