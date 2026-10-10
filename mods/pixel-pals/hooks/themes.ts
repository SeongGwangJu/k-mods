// Frame tables and scenes, shared by the hooks module and both surface modules
// (sprite.tsx draws the spinner's mascot, stage.tsx the band). Pure:
// everything here is a function of the theme, the tick and the width.
import { blank, frame, hsl, mod, noise, padTo, put, textWidth } from './cells'
import type { Grid, Style } from './cells'
import { SCENE_ROWS, bluecatScene, chompScene, clawdScene, nyanScene, sparkyScene, thunderScene } from './scenes'

export * from './cells'

export const THEME_NAMES = [
  'clawd',
  'thunder',
  'chomp',
  'sparky',
  'bluecat',
  'nyan',
  // pixel-pals: clawd-tales의 무대(hooks/tales)가 띠를 통째로 그리는 테마
  'tales',
] as const
export type ThemeName = (typeof THEME_NAMES)[number]

export type Mode = 'requesting' | 'responding' | 'thinking' | 'tool-input' | 'tool-use'
export type Pose = 'think' | 'tool' | 'say' | 'wait'
/** What the turn is doing, as the band's companion tells it. */
export type Act = 'think' | 'tool' | 'ask' | 'say' | 'wait'
export type Finale = 'answer' | 'aborted' | 'error'
/** The companion's mood between turns. */
export type Mood = 'hello' | 'ready' | 'aborted' | 'error' | 'sleep'

export type Theme = {
  name: ThemeName
  /** The mascot's color, and a second one for its props. */
  color: string
  accent: string
  /** Frames of the mascot beside the spinner's word, by what the turn is doing. */
  sprite: Record<Pose, string[]>
  /** Each character of the mascot in its own color, cycling. */
  isRainbow?: boolean
  happy: string
  sad: string
  dead: string
  sleep: string
  /** Particles of the finale's burst, and their colors. */
  confetti: string[]
  palette: string[]
  /** Rows the scene takes in the band. */
  rows: number
  /** The band's scene while a turn runs: `rows` rows of `w` cells. */
  scene: (t: number, w: number, act: Act) => Grid
}

/** Milliseconds per frame: the mascot's, the band's, the companion's between turns. */
export const SPRITE_MS = 140
export const STAGE_MS = 100
export const IDLE_MS = 400
/** How long the finale stays after a turn ends. */
export const FINALE_MS = 3000

export function poseOf(mode: string): Pose {
  if (mode === 'thinking' || mode === 'think') return 'think'
  if (mode === 'tool-use' || mode === 'tool-input' || mode === 'tool') return 'tool'
  if (mode === 'responding' || mode === 'say') return 'say'
  return 'wait'
}

export function isThemeName(name: unknown): name is ThemeName {
  return typeof name === 'string' && (THEME_NAMES as readonly string[]).includes(name)
}

/** pixel-pals: `random`이 턴마다 고르는 테마 (엄선한 7종 전부) */
export const RANDOM_POOL: ThemeName[] = [...THEME_NAMES]

/** A theme drawn from `seed`, for the `random` choice. */
export function pickRandom(seed: number): ThemeName {
  const pool = RANDOM_POOL
  return pool[Math.floor(noise(seed) * pool.length)]!
}

// ---- the newer scenes: Claude's mascot and pixel art --------------------


const CLAUDE = '#d77757'
const RAINBOW = ['#ff0000', '#ff9900', '#ffff00', '#33ff00', '#0099ff', '#6633ff']

// ---- themes --------------------------------------------------------------

export const THEMES: Record<ThemeName, Theme> = {
  clawd: {
    name: 'clawd',
    rows: SCENE_ROWS,
    color: CLAUDE,
    accent: '#e9b49a',
    sprite: {
      think: ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'].map(s => `▐▛█▜▌ ${s}`),
      tool: ['▐▛█▜▌▭▭', '▐▛█▜▌▬▭', '▐▛█▜▌▭▬'],
      say: ['▐▛█▜▌ ✎  ', '▐▛█▜▌ ✎· ', '▐▛█▜▌ ✎··'],
      wait: ['▐▛█▜▌ .  ', '▐▛█▜▌ .. ', '▐▛█▜▌ ...'],
    },
    happy: '▐▛█▜▌ ✻',
    sad: '▐▀█▀▌',
    dead: '▐x█x▌',
    sleep: '▐▄█▄▌ zZ',
    confetti: ['✻', '✶', '✳', '·', '✢'],
    palette: [CLAUDE, '#e9b49a', '#f5e6d3', '#c15f3c'],
    scene: clawdScene,
  },
  thunder: {
    name: 'thunder',
    rows: SCENE_ROWS,
    color: '#4cc9f0',
    accent: '#ffd60a',
    sprite: {
      think: ['=▷ ·    ', '=▷  ·   ', '=▷   ·  ', '=▷    · '],
      tool: ['=▷━   ◆', '=▷ ━  ◆', '=▷  ━ ◆', '=▷    ✶'],
      say: ['=▷ ⁘ ⁘ ', '=▷⁘ ⁘ ⁘'],
      wait: ['=▷ .  ', '=▷ .. ', '=▷ ...'],
    },
    happy: '=▷ ✶✶✶',
    sad: '=▷ ...',
    dead: '=▷ ✕',
    sleep: '=▷ zZ',
    confetti: ['✶', '✦', '+', '·', '◆'],
    palette: ['#4cc9f0', '#ffd60a', '#f72585', '#ff9f1c'],
    scene: thunderScene,
  },
  chomp: {
    name: 'chomp',
    rows: SCENE_ROWS,
    color: '#ffd60a',
    accent: '#ff595e',
    sprite: {
      think: ['ᗧ • • •', '● • • •'],
      tool: ['ᗧ•••  ᗣ', '●••  ᗣ ', 'ᗧ•  ᗣ  ', '● ᗣ    '],
      say: ['ᗧ ♪ ', '●  ♫'],
      wait: ['ᗧ .  ', '● .. ', 'ᗧ ...'],
    },
    happy: 'ᗧ ᗣᗣᗣ',
    sad: 'ᗣ ᗧ',
    dead: '✕ᗧ✕',
    sleep: 'ᗧ zZ',
    confetti: ['•', '●', '·', 'ᗣ', '+'],
    palette: ['#ffd60a', '#ff595e', '#ffafcc', '#00f5d4', '#ff9f1c'],
    scene: chompScene,
  },
  sparky: {
    name: 'sparky',
    rows: SCENE_ROWS,
    color: '#ffd60a',
    accent: '#e63946',
    sprite: {
      think: ['ϟ(•ᴥ•)  ', 'ϟ(•ᴥ•) ?', ' (•ᴥ•)ϟ?'],
      tool: ['ϟϟ(>ᴥ<)ϟϟ', ' ϟ(>ᴥ<)ϟ '],
      say: ['(•ᴥ•)ﾉϟ ', '(•ᴥ•)ﾉ ϟ'],
      wait: ['(•ᴥ•) .  ', '(•ᴥ•) .. ', '(•ᴥ•) ...'],
    },
    happy: 'ϟ(^ᴥ^)ϟ',
    sad: '(;ᴥ;)',
    dead: '(×ᴥ×)',
    sleep: '(-ᴥ-) zZ',
    confetti: ['ϟ', '✦', '*', '·', '+'],
    palette: ['#ffd60a', '#e63946', '#fff3b0', '#c68b59'],
    scene: sparkyScene,
  },
  bluecat: {
    name: 'bluecat',
    rows: SCENE_ROWS,
    color: '#00b4d8',
    accent: '#e63946',
    sprite: {
      think: ['⊂(◉‿◉)つ  ', '⊂(◉‿◉)つ ?', '⊂(◔‿◔)つ ?'],
      tool: ['⊂(◉‿◉)つ✦  ', '⊂(◉‿◉)つ ✧ ', '⊂(◉‿◉)つ  ✦'],
      say: ['⊂(◕‿◕)つ ♪', '⊂(◕‿◕)つ ♫'],
      wait: ['⊂(◉‿◉)つ .  ', '⊂(◉‿◉)つ .. ', '⊂(◉‿◉)つ ...'],
    },
    happy: '⊂(◕‿◕)つ',
    sad: '⊂(╥﹏╥)つ',
    dead: '⊂(×﹏×)つ',
    sleep: '⊂(－‿－)つ zZ',
    confetti: ['✦', '✧', '●', '·', '+'],
    palette: ['#00b4d8', '#e63946', '#ffd60a', '#ffffff'],
    scene: bluecatScene,
  },
  nyan: {
    name: 'nyan',
    rows: SCENE_ROWS,
    color: '#ff99cc',
    accent: '#999999',
    isRainbow: true,
    sprite: {
      think: ['~=[,,_,,]:3', '=~[,,_,,]:3'],
      tool: ['~=[,,_,,]:3 *', '=~[,,_,,]:3 +'],
      say: ['~=[,,o,,]:3', '=~[,,_,,]:3'],
      wait: ['~=[,,_,,]:3 .  ', '=~[,,_,,]:3 .. ', '~=[,,_,,]:3 ...'],
    },
    happy: '~=[,,^,,]:3',
    sad: '~=[,,;,,]:3',
    dead: '~=[,,x,,]:3',
    sleep: '~=[,,-,,]:3 zZ',
    confetti: ['*', '+', '·', '✦', '✧'],
    palette: RAINBOW,
    scene: nyanScene,
  },
  // pixel-pals: tales는 clawd-tales의 무대가 띠를 그린다. 여기 값은 목록·펫·미리보기에서만 쓴다.
  tales: {
    name: 'tales',
    rows: SCENE_ROWS,
    color: CLAUDE,
    accent: '#7aa2f7',
    sprite: {
      think: ['▐▛█▜▌ ?  ', '▐▛█▜▌ ?? ', '▐▛█▜▌ ...'],
      tool: ['▐▛█▜▌ ⚒  ', '▐▛█▜▌  ⚒ ', '▐▛█▜▌ ⚒⚒ '],
      say: ['▐▛█▜▌ ✎  ', '▐▛█▜▌ ✎· ', '▐▛█▜▌ ✎··'],
      wait: ['▐▛█▜▌ .  ', '▐▛█▜▌ .. ', '▐▛█▜▌ ...'],
    },
    happy: '▐▛█▜▌ ♪',
    sad: '▐▀█▀▌',
    dead: '▐x█x▌',
    sleep: '▐▄█▄▌ zZ',
    confetti: ['✻', '♥', '✶', '·', '✢'],
    palette: [CLAUDE, '#7aa2f7', '#9ece6a', '#e0af68'],
    scene: clawdScene,
  },
}

export function themeOf(name: unknown): Theme {
  return isThemeName(name) ? THEMES[name] : THEMES.clawd
}

// ---- finale --------------------------------------------------------------

/** After a turn: a burst of the theme's confetti around its mascot and the label. */
export function finaleScene(theme: Theme, kind: Finale, label: string, t: number, w: number): Grid {
  const rows = theme.rows
  const g = blank(w, rows)
  const face = kind === 'answer' ? theme.happy : kind === 'aborted' ? theme.sad : theme.dead
  const text = `${face}  ${label}`
  const tw = textWidth(text)
  const cx = Math.floor(w / 2)
  const left = Math.max(0, cx - Math.floor(tw / 2))
  const mid = Math.floor(rows / 2)

  if (kind === 'answer') {
    const count = Math.min(40 * rows / 2, Math.max(12, Math.floor((w / 3) * rows / 2)))
    for (let i = 0; i < count; i++) {
      const dir = noise(i) < 0.5 ? -1 : 1
      const speed = 0.8 + noise(i + 9) * 2.2
      const reach = Math.min(t, 18) * speed
      const x = cx + dir * (tw / 2 + reach + noise(i + 4) * 3)
      const y = Math.floor(noise(i + 2) * rows)
      const isFading = t > 18 + noise(i + 6) * 8
      put(g, x, y, frame(theme.confetti, i + (t >> 2)), { c: frame(theme.palette, i), d: isFading })
    }
  } else if (kind === 'aborted') {
    for (let x = 0; x < w; x += 4) put(g, mod(x + (t >> 1), w), mod(x, rows), '·', { c: '#6c757d', d: true })
  } else {
    for (let x = 0; x < w; x++) if (noise(x + t) < 0.08) put(g, x, mod(x, rows), frame(['▚', '▞', '░'], x + t), { c: '#e63946', d: true })
  }

  const style: Style = kind === 'answer' ? { c: theme.color, b: true } : kind === 'aborted' ? { c: '#adb5bd' } : { c: '#e63946', b: true }
  const flicker = kind === 'error' && mod(t, 6) === 0
  put(g, left - 1, mid, ' '.repeat(tw + 2))
  if (!flicker) put(g, left, mid, text, style)
  return g
}

// ---- companion -----------------------------------------------------------

/** What the companion row shows: the turn's act while it runs, else the mood. */
export type PetView = {
  state: Act | Mood
  /** The bubble beside the mascot, already in the person's language. */
  bubble: string
  /** `Lv.3 ♥12`. */
  stats: string
}

const BUBBLE: Partial<Record<Act | Mood, Style>> = {
  ask: { c: '#ffd166', b: true },
  error: { c: '#e63946' },
  aborted: { c: '#adb5bd' },
  sleep: { c: '#6c757d', d: true },
}

/** One row: the mascot in its current mood, its bubble, its level and affection; hearts after a pat. */
export function petRow(theme: Theme, pet: PetView, t: number, w: number, hearts: number): Grid {
  const g = blank(w, 1)
  const s = pet.state
  let face: string
  if (s === 'think' || s === 'tool' || s === 'say' || s === 'wait' || s === 'ask') {
    const frames = theme.sprite[poseOf(s)]
    face = padTo(frame(frames, t), Math.max(...frames.map(textWidth)))
  } else {
    face = s === 'error' ? theme.dead : s === 'aborted' ? theme.sad : s === 'sleep' ? theme.sleep : theme.happy
  }
  const faceStyle = (i: number): Style =>
    theme.isRainbow ? { c: hsl((i * 40 + t * 24) % 360, 0.95, 0.62), b: true } : { c: theme.color, b: true }
  let x = 0
  Array.from(face).forEach((ch, i) => {
    put(g, x, 0, ch, faceStyle(i))
    x += textWidth(ch)
  })
  x += 1
  if (hearts > 0) {
    put(g, x, 0, frame(['♡', '♥', '♡ ♥', '♥ ♡'], hearts), { c: '#ff8fab', b: true })
    x += 4
  }
  if (pet.bubble) put(g, x, 0, `${s === 'ask' ? '❯ ' : '· '}${pet.bubble}`, BUBBLE[s] ?? { c: '#b8b8be' })
  put(g, w - textWidth(pet.stats) - 1, 0, pet.stats, { c: '#6c757d' })
  return g
}
