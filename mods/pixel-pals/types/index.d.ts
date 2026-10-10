// pixel-pals의 상태 계약. 장면 쪽(원본 spinner, hoobnn)과 tales 쪽(원본 clawd-tales, plaxagoras)의 값을
// 이 플러그인 이름 하나로 모았다. 두 쪽의 키는 겹치지 않는다.

// ---- 장면 쪽 (spinner) ----
export type FinaleState = { kind: 'answer' | 'aborted' | 'error'; label: string; id: string }
export type Preview = { theme: string; id: string }
/** What the running turn is doing, and the tool when it is running one. */
export type Activity = { act: 'think' | 'tool' | 'ask' | 'say' | 'wait'; tool?: string }
export type PetStats = { xp: number; love: number }

/** A run of cells in a pet's frame. */
export type DockSeg = { text: string; c?: string; bg?: string; b?: boolean; d?: boolean }

/**
 * The companion as the scenes publish it (`pixel-pals.dock`): one loop of its current state.
 */
export type DockPet = {
  /** Changes with the state or a pat: the player starts over. */
  id: string
  /** Distinct frames, each its rows of runs. */
  frames: DockSeg[][][]
  /** The frames in play order, by index. */
  order: number[]
  ms: number
  /** Cells the pet takes across. */
  width: number
  bubble: string
  tone: 'plain' | 'ask' | 'error' | 'aborted' | 'sleep'
  /** `Lv.3 ♥12`. */
  stats: string
}

// ---- tales 쪽 (clawd-tales) ----
export type Action =
  | 'walk'
  | 'run'
  | 'sneak'
  | 'read'
  | 'dig'
  | 'fly'
  | 'carry'
  | 'trip'
  | 'cheer'
  | 'alert'
  | 'sit'
  | 'yawn'
  | 'sleep'
  | 'wave'
  | 'scratch'
  | 'look'
  | 'cover'
  | 'wink'
  | 'fish'
  | 'reel'
  | 'dizzy'
  | 'flip'
  | 'sweep'
  | 'drop'
  | 'nod'
  | 'dance'
  | 'flag'
  | 'listen'
  | 'juggle'
  | 'stretch'
  | 'hatch'

/**
 * A small overlay on Claude: thought bubble, blush, sweat drop, a visiting butterfly;
 * smitten adds heart eyes to the blush, sheepish adds worried brows to the sweat.
 */
export type Emote = 'think' | 'blush' | 'sweat' | 'butterfly' | 'smitten' | 'sheepish'

/** Timed effects that cross or burst over the stage. */
export type FxKind = 'confetti' | 'plane' | 'boxes' | 'train' | 'whale' | 'ufo' | 'warp'
/** color: a palette key, for effects tinted per source (an MCP server's warp). */
export type Fx = { id: number; kind: FxKind; start: number; dur: number; x: number; color?: string }

export type Holiday = 'halloween' | 'christmas' | 'newyear' | 'valentine' | 'aprilfools'
export type Hat =
  | 'witch'
  | 'santa'
  | 'party'
  | 'nightcap'
  | 'crown'
  | 'tophat'
  | 'gradcap'
  | 'captain'
  | 'wizard'
  | 'hardhat'
  | 'shell'
  | 'deerstalker'
  | 'beanie'
  | 'pith'
/** What Clawd grows into after GROW_AT tool calls, from the work it does most. */
export type Form = 'scholar' | 'detective' | 'builder' | 'hacker' | 'explorer' | 'captain'
/** Lifetime progress, saved in $.store: tool calls in all, per form, and the form it grew into. */
export type Stats = { xp: number; by: Partial<Record<Form, number>>; form: Form | null }
/** Worn over the face: /tales face. */
export type Face = 'glasses' | 'shades' | 'mustache'

export type Hero = {
  /** idle draws nothing; resting is the sit, yawn, sleep ladder after a turn. */
  mode: 'idle' | 'working' | 'ending' | 'resting'
  action: Action
  caption: string
  x: number
  dir: 1 | -1
  scene: number
  steps: number
  /** When the current mode began (clock ms), for the rest ladder. */
  since: number
  emote?: Emote | null
  /** Clock ms the emote ends; Infinity holds it until the next tool call. */
  emoteUntil?: number
  /** The last tool pose, which Claude dreams about. */
  last?: Action
  /** Eyes glancing left or right until glanceUntil (clock ms). */
  glance?: -1 | 1 | null
  glanceUntil?: number
}

/** A spawned subagent, drawn as a tinted critter in the same scene. */
export type Worker = {
  id: string
  label: string
  tier: 'opus' | 'sonnet' | 'haiku' | 'fable' | 'other'
  /** returning: done, running back to Claude to hand in the result. */
  state: 'running' | 'returning' | 'done' | 'failed'
  action: Action
  x: number
  dir: 1 | -1
  steps: number
  /** Failed, then walked back to Claude for a pat on the head. */
  sad?: boolean
}

export type Limit = { kind: string; percent: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    'pixel-pals': {
      // ---- 장면 쪽
      theme: string
      choice: string
      isHidden: boolean
      isStageOff: boolean
      isCompanionOff: boolean
      finale: FinaleState | null
      preview: Preview | null
      activity: Activity
      mood: 'hello' | 'ready' | 'aborted' | 'error' | 'sleep'
      pet: PetStats
      pat: string | null
      /** What the pet says for a moment about a command that just ran: tests, a commit. */
      news: { kind: 'testPass' | 'testFail' | 'commit'; id: string } | null
      /** The pet for whoever draws it; null while it is off. */
      dock: DockPet | null
      /** Whether a turn is running. */
      isTurn: boolean
      /** True while a `/` or `@` picker is open above the band. */
      isPicking: boolean
      // ---- tales 쪽
      hero: Hero
      workers: Worker[]
      frame: number
      isOn: boolean
      /** What Claude is waiting on the user for, or null. */
      alert: string | null
      /** Context fill 0-100, or null before the first measure. */
      context: number | null
      /** Plan rate-limit windows (5h, 7d), as last measured. */
      limits: Limit[]
      /** Calm mode: one frame a second, no wandering. */
      calm: boolean
      bugs: number
      todos: { done: number; total: number } | null
      fx: Fx[]
      /** Rolled once a session: null until then. */
      shiny: boolean | null
      /** Clean main-loop tool calls in a row this turn. */
      combo: number
    }
  }
}
