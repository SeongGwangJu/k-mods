/**
 * Turns a tool call into an action and a one-line caption, from templates.
 * No model calls: Claude Fables asks Sonnet every few seconds; this reads the call itself.
 */
import type { Action, Emote, Form, Hat, Holiday, Stats } from '../../types'
import { textWidth } from '../cells'
import { lang } from '../i18n'

/** pixel-pals: 한국어 화면이면 한국어 문구, 아니면 clawd-tales 원본의 영어 문구. 언어는 장면 쪽(/config language)을 따른다. */
export function tr(en: string, ko: string): string {
  return lang() === 'ko' ? ko : en
}

export type Beat = { action: Action; caption: string }

type Args = Record<string, unknown>

function str(a: Args, key: string): string {
  const v = a[key]
  return typeof v === 'string' ? v : ''
}

function base(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? path
}

function host(url: string): string {
  const m = /^[a-z]+:\/\/([^/]+)/i.exec(url)
  return m?.[1] ?? url
}

/** pixel-pals: 글자 수가 아니라 터미널 칸 수로 자른다(한글은 한 글자에 두 칸). 영어는 원본과 결과가 같다. */
export function fitCells(text: string, room: number): string {
  if (textWidth(text) <= room) return text
  let out = ''
  let used = 0
  for (const ch of text) {
    const w = textWidth(ch)
    if (used + w > room - 1) break
    out += ch
    used += w
  }
  return out + '…'
}

function clip(text: string, room: number): string {
  return fitCells(text.replace(/\s+/g, ' ').trim(), room)
}

/** A stable pick among phrasings, so a reload or redraw keeps the same line. */
function pick(lines: readonly string[], seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return lines[Math.abs(h) % lines.length] ?? lines[0] ?? ''
}

export function beat(tool: string, args: Args, seed: string): Beat {
  const file = base(str(args, 'file_path') || str(args, 'notebook_path') || str(args, 'path'))
  switch (tool) {
    case 'Read':
      return {
        action: 'read',
        caption: pick(
          [
            tr(`Claude pores over ${file}`, `Claude가 ${file} 파일을 꼼꼼히 읽어요`),
            tr(`Claude studies ${file}`, `Claude가 ${file} 파일을 들여다봐요`),
            tr(`Claude reads ${file} by lamplight`, `Claude가 등불 아래서 ${file} 파일을 읽어요`),
          ],
          seed,
        ),
      }
    case 'Edit':
    case 'NotebookEdit':
      return {
        action: 'dig',
        caption: pick(
          [
            tr(`Claude digs into ${file}`, `Claude가 ${file} 파일을 파고들어요`),
            tr(`Claude reshapes ${file}`, `Claude가 ${file} 파일을 다듬어요`),
            tr(`Claude tunnels through ${file}`, `Claude가 ${file} 파일에 굴을 파요`),
          ],
          seed,
        ),
      }
    case 'Write':
      return {
        action: 'dig',
        caption: pick(
          [
            tr(`Claude builds ${file}`, `Claude가 ${file} 파일을 만들어요`),
            tr(`Claude lays the stones of ${file}`, `Claude가 ${file} 파일의 주춧돌을 놓아요`),
          ],
          seed,
        ),
      }
    case 'Grep':
    case 'Glob': {
      const what = clip(str(args, 'pattern'), 40)
      return {
        action: 'sneak',
        caption: pick(
          [
            tr(`Claude sniffs out “${what}”`, `Claude가 “${what}” 냄새를 쫓아요`),
            tr(`Claude tracks “${what}” through the brush`, `Claude가 수풀 속에서 “${what}” 흔적을 따라가요`),
          ],
          seed,
        ),
      }
    }
    case 'Bash': {
      const what = clip(str(args, 'description') || str(args, 'command'), 60)
      return {
        action: 'run',
        caption: pick(
          [
            tr(`Claude runs off to ${lower(what)}`, `Claude가 달려가요: ${what}`),
            tr(`Claude hurries: ${what}`, `Claude가 서둘러요: ${what}`),
          ],
          seed,
        ),
      }
    }
    case 'WebFetch':
      return {
        action: 'fly',
        caption: tr(`Claude flies off to ${host(str(args, 'url'))}`, `Claude가 ${host(str(args, 'url'))}(으)로 날아가요`),
      }
    case 'WebSearch':
      return {
        action: 'fly',
        caption: tr(
          `Claude scouts the skies for “${clip(str(args, 'query'), 40)}”`,
          `Claude가 “${clip(str(args, 'query'), 40)}” 찾아 하늘을 살펴요`,
        ),
      }
    case 'Agent':
    case 'Task':
      return {
        action: 'carry',
        caption: tr(
          `Claude hands a parcel to a helper: ${clip(str(args, 'description'), 50)}`,
          `Claude가 도우미에게 꾸러미를 건네요: ${clip(str(args, 'description'), 50)}`,
        ),
      }
    case 'Skill':
      return {
        action: 'read',
        caption: tr(
          `Claude opens the ${str(args, 'skill') || 'old'} spellbook`,
          `Claude가 ${str(args, 'skill') || '낡은'} 마법책을 펼쳐요`,
        ),
      }
    case 'TodoWrite':
      return { action: 'read', caption: tr('Claude writes the quest list', 'Claude가 퀘스트 목록을 적어요') }
    case 'AskUserQuestion':
      return { action: 'alert', caption: tr('Claude waves you over with a question', 'Claude가 질문이 있다며 손짓해요') }
    default:
      if (tool.startsWith('mcp__')) {
        const server = tool.split('__')[1]?.replace(/^claude_ai_/, '').replace(/_/g, ' ') ?? 'a stranger'
        return { action: 'carry', caption: tr(`Claude sends word to ${server}`, `Claude가 ${server} 서버에 소식을 전해요`) }
      }
      return { action: 'walk', caption: tr(`Claude tries the ${tool}`, `Claude가 ${tool} 도구를 써봐요`) }
  }
}

function lower(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s
}

export function tripCaption(tool: string, seed: string): string {
  return pick(
    [
      tr(`Claude trips over the ${tool} and dusts off`, `Claude가 ${tool} 도구에 걸려 넘어졌다 털고 일어나요`),
      tr(`The ${tool} bites back. Claude regroups`, `${tool} 도구가 반격해요. Claude가 숨을 골라요`),
    ],
    seed,
  )
}

export const THINKING = ['Claude ponders the path ahead…', 'Claude wanders, thinking…', 'Claude mutters to itself…']
// THINKING의 한국어판(같은 순서). 배열은 모듈이 불릴 때 값이 굳는데 그때는 언어가 아직 'en'이라, 여기서 tr()을 부르지 않고 쓰는 쪽에서 tr()로 고른다.
export const THINKING_KO = ['Claude가 갈 길을 곰곰이 생각해요…', 'Claude가 생각하며 서성여요…', 'Claude가 혼잣말을 중얼거려요…']

export function ending(steps: number, seconds: number, isAborted: boolean, best = 0, milestone: number | null = null): string {
  if (isAborted) return tr('Claude stops mid-stride and takes a bow.', 'Claude가 걸음을 멈추고 꾸벅 인사해요.')
  const s = steps === 1 ? 'step' : 'steps'
  const tokens = milestone ? tr(` · ${Math.round(milestone / 1000)}K tokens!`, ` · 토큰 ${Math.round(milestone / 1000)}K!`) : ''
  return tr(
    `The end · ${steps} ${s} · ${seconds}s${best >= CROWN_AT ? ` · crown ×${best}` : ''}${tokens}`,
    `끝 · ${steps}걸음 · ${seconds}초${best >= CROWN_AT ? ` · 왕관 ×${best}` : ''}${tokens}`,
  )
}

/** The closing pose by turn length: a nod for a quick one, a hop, a dance, then a flag at the summit. */
export function endingAction(seconds: number, isAborted: boolean): Action {
  if (isAborted || seconds < 4) return 'nod'
  if (seconds < 60) return 'cheer'
  if (seconds < 300) return 'dance'
  return 'flag'
}

/** Every 50K tokens the session spends is a small party. */
export const TOKEN_MILESTONE = 50_000
/** The milestone crossed going from before to after, or null. */
export function tokenMilestone(before: number, after: number): number | null {
  const m = Math.floor(after / TOKEN_MILESTONE)
  return m > Math.floor(before / TOKEN_MILESTONE) && m > 0 ? m * TOKEN_MILESTONE : null
}

/** Claude idles while the helpers work: headphones for one, juggling for more. */
export function waitBeat(out: number, label?: string): Beat {
  if (out <= 1) {
    return {
      action: 'listen',
      caption: tr(
        `Claude puts on headphones while ${label ? `“${clip(label, 30)}”` : 'the helper'} works…`,
        `${label ? `“${clip(label, 30)}” ` : ''}도우미가 일하는 동안 Claude가 헤드폰을 써요…`,
      ),
    }
  }
  return { action: 'juggle', caption: tr(`Claude juggles while ${out} helpers work…`, `도우미 ${out}명이 일하는 동안 Claude가 저글링해요…`) }
}

function hashOf(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** A stable palette key per MCP server, for its warp. */
const WARP_COLORS = ['p', 't', 'h', 'f', 'c', 'q', 'O', 'b', 'z']
export function warpColor(server: string): string {
  return WARP_COLORS[hashOf(server) % WARP_COLORS.length] ?? 'p'
}

/** A scarf color per project, from its root folder; the helpers' tier colors are left out. */
const SCARF_COLORS = ['r', 'b', 'W', 'A', 'c', 'Y', 'q', 'O'] // no green: it vanishes against the trees
export function scarfColor(root: string): string {
  return SCARF_COLORS[hashOf(root) % SCARF_COLORS.length] ?? 'r'
}

/** Tool calls before the hatchling grows up. */
export const GROW_AT = 200
const FORM_OF: Partial<Record<Action, Form>> = {
  read: 'scholar',
  sneak: 'detective',
  dig: 'builder',
  run: 'hacker',
  fly: 'explorer',
  carry: 'captain',
}
export const FORM_HAT: Record<Form, Hat> = {
  scholar: 'gradcap',
  detective: 'deerstalker',
  builder: 'hardhat',
  hacker: 'beanie',
  explorer: 'pith',
  captain: 'captain',
}
// 게터로 둔 이유: 이 모듈이 불릴 때는 언어가 아직 'en'이라, 값을 읽는 순간마다 tr()이 언어를 봐야 한다.
const FORM_WORK: Record<Form, string> = {
  get scholar() { return tr('reading', '읽기') },
  get detective() { return tr('searching', '검색') },
  get builder() { return tr('editing', '편집') },
  get hacker() { return tr('running commands', '명령 실행') },
  get explorer() { return tr('browsing the web', '웹 탐색') },
  get captain() { return tr('sending helpers', '도우미 파견') },
}
/** 형태 이름의 한국어. 영어 문장은 form 키를 그대로 쓰고, 한국어 문장만 이 표를 본다. */
export const FORM_KO: Record<Form, string> = {
  scholar: '학자',
  detective: '탐정',
  builder: '건축가',
  hacker: '해커',
  explorer: '탐험가',
  captain: '선장',
}
export const NEW_STATS: Stats = { xp: 0, by: {}, form: null }

/** One main-loop tool call, counted toward the form its pose belongs to. */
export function countCall(stats: Stats, action: Action): Stats {
  const form = FORM_OF[action]
  return { ...stats, xp: stats.xp + 1, by: form ? { ...stats.by, [form]: (stats.by[form] ?? 0) + 1 } : stats.by }
}

/** The form Clawd has grown into: none before GROW_AT, then the most-done work. A rival has to lead by 10% to take over. */
export function formOf(stats: Stats): Form | null {
  if (stats.xp < GROW_AT) return null
  let top: Form | null = null
  for (const [form, n] of Object.entries(stats.by) as [Form, number][]) if (!top || n > (stats.by[top] ?? 0)) top = form
  const cur = stats.form
  if (cur && top && (stats.by[cur] ?? 0) * 1.1 >= (stats.by[top] ?? 0)) return cur
  return top
}

export function growCaption(form: Form, was: Form | null): string {
  const a = /^[aeiou]/.test(form) ? 'an' : 'a'
  return was
    ? tr(`Clawd is ${a} ${form} now: mostly ${FORM_WORK[form]} lately.`, `Clawd가 이제 ${FORM_KO[form]} 모습이에요: 요즘은 ${FORM_WORK[form]} 위주예요.`)
    : tr(`Clawd grows up into ${a} ${form}! Mostly ${FORM_WORK[form]}.`, `Clawd가 쑥쑥 자라 ${FORM_KO[form]} 모습이 돼요! ${FORM_WORK[form]} 위주예요.`)
}

/** Old store data back into shape; anything unreadable starts over. */
export function readStats(raw: unknown): Stats | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<Stats>
  if (typeof r.xp !== 'number') return null
  const by = r.by && typeof r.by === 'object' ? r.by : {}
  return { xp: r.xp, by, form: typeof r.form === 'string' && r.form in FORM_HAT ? r.form : null }
}

/** Clean calls in a row that show a combo, and that earn the crown. */
export const COMBO_AT = 5
export const CROWN_AT = 10

/** How the prompt reads: thanks makes Claude blush, a scolding makes it sheepish. */
export function moodOf(text: string): 'thanks' | 'scold' | null {
  const t = text.slice(0, 400)
  if (/\b(thanks|thank (you|u)|thx|tysm|good (job|work|bot)|great (job|work)|nice (job|work)|well done|love (it|this|you)|you('re| are) (the best|awesome|amazing))\b/i.test(t)) {
    return 'thanks'
  }
  if (/^\s*(no+|nope|wrong|wtf|ugh+|stop)\b|\b(wtf|that'?s (wrong|not (it|right|what))|not what i (asked|said|meant|wanted)|i already told you|you broke)\b/i.test(t)) {
    return 'scold'
  }
  return null
}

export type Egg = 'commit' | 'push' | 'nuke' | 'install' | 'sl'

/** The fun Bash commands, most specific first. */
export function bashEggs(command: string): Egg[] {
  const out: Egg[] = []
  if (/^\s*sl(\s|$)/.test(command)) out.push('sl')
  if (/\bgit\s+(-C\s+\S+\s+)?commit\b/.test(command)) out.push('commit')
  if (/\bgit\s+(-C\s+\S+\s+)?push\b/.test(command)) out.push('push')
  if (/\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r|-r\s+-f|-f\s+-r|--recursive\s+--force|--force\s+--recursive)/.test(command)) {
    out.push('nuke')
  }
  if (/\b(npm|pnpm|yarn|bun)\s+(i|install|add)\b|\bpip3?\s+install\b|\buv\s+(add|pip\s+install)\b|\bcargo\s+(add|install)\b|\b(apt|apt-get|brew|dnf)\s+install\b|\bgo\s+get\b/.test(command)) {
    out.push('install')
  }
  return out
}

/** A commit's first line, from -m "…" or a heredoc. */
export function commitMessage(command: string): string {
  const doc = /<<-?\s*'?"?(\w+)'?"?\s*\n\s*([^\n]+)/.exec(command)
  const flag = /\s-[a-zA-Z]*m\s+(["'])((?:(?!\1)[^\n])*)/.exec(command)
  const msg = doc?.[2] ?? (flag?.[2]?.startsWith('$(') ? '' : flag?.[2]) ?? ''
  return clip(msg, 50)
}

export function pushRemote(command: string): string {
  const m = /\bgit\s+(?:-C\s+\S+\s+)?push\s+(?:-\S+\s+)*([\w.-]+)/.exec(command)
  return m?.[1] ?? 'origin'
}

/** Before the command runs. */
export function eggBeat(egg: Egg, command: string): Beat & { emote?: Emote } {
  switch (egg) {
    case 'commit': {
      const msg = commitMessage(command)
      return {
        action: 'carry',
        caption: msg
          ? tr(`Claude wraps a parcel: “${msg}”`, `Claude가 꾸러미를 포장해요: “${msg}”`)
          : tr('Claude wraps up a commit', 'Claude가 커밋을 포장해요'),
      }
    }
    case 'push':
      return {
        action: 'carry',
        caption: tr(`Claude folds a paper plane for ${pushRemote(command)}`, `Claude가 ${pushRemote(command)}행 종이비행기를 접어요`),
      }
    case 'nuke':
      return {
        action: 'cover',
        caption: tr(`Claude covers its eyes: ${clip(command.trim(), 40)}`, `Claude가 눈을 가려요: ${clip(command.trim(), 40)}`),
        emote: 'sweat',
      }
    case 'install':
      return { action: 'carry', caption: tr('Claude orders packages from the sky', 'Claude가 하늘에서 패키지를 주문해요') }
    case 'sl':
      return { action: 'cheer', caption: tr('Choo choo!', '칙칙폭폭!') }
  }
}

/** After it ran cleanly. */
export function eggDone(egg: Egg, command: string): string | null {
  switch (egg) {
    case 'commit': {
      const msg = commitMessage(command)
      return msg
        ? tr(`Claude seals the parcel and stamps it: “${msg}”`, `Claude가 꾸러미를 봉하고 도장을 찍어요: “${msg}”`)
        : tr('Claude seals the parcel and stamps it', 'Claude가 꾸러미를 봉하고 도장을 찍어요')
    }
    case 'push':
      return tr(`The paper plane sails off to ${pushRemote(command)}`, `종이비행기가 ${pushRemote(command)}(으)로 훨훨 날아가요`)
    case 'install':
      return tr('Packages rain down. Claude stacks them', '패키지가 우수수 쏟아져요. Claude가 차곡차곡 쌓아요')
    default:
      return null
  }
}

/** The program a "command not found" names, or null. */
export function notFound(output: string): string | null {
  const m = /(?:^|\n)(?:[\w/.-]+: )?(?:line \d+: )?([\w.+-]+): (?:command )?not found/.exec(output)
  return m?.[1] ?? null
}

/** Today's holiday, by local date. */
export function holidayOf(d: Date): Holiday | null {
  const m = d.getMonth() + 1
  const day = d.getDate()
  if (m === 10 && day >= 25) return 'halloween'
  if (m === 12 && day >= 18 && day <= 26) return 'christmas'
  if ((m === 12 && day === 31) || (m === 1 && day === 1)) return 'newyear'
  if (m === 2 && day === 14) return 'valentine'
  if (m === 4 && day === 1) return 'aprilfools'
  return null
}

/** Fireworks: the hour either side of midnight on New Year's. */
export function isMidnightNewYear(d: Date): boolean {
  return (d.getMonth() === 11 && d.getDate() === 31 && d.getHours() === 23) || (d.getMonth() === 0 && d.getDate() === 1 && d.getHours() === 0)
}

export type Sky = 'day' | 'dusk' | 'night'
export function skyOf(hour: number): Sky {
  if (hour >= 20 || hour < 6) return 'night'
  if (hour < 7 || hour >= 18) return 'dusk'
  return 'day'
}

/** 1 to 4 am: nightcap and coffee. */
export function isLate(hour: number): boolean {
  return hour >= 1 && hour < 5
}

// 게터: 값을 읽는 순간의 언어를 따른다(FORM_WORK 위 주석 참고).
const HOLIDAY_START: Record<Holiday, string> = {
  get halloween() { return tr('Once upon a spooky prompt, Claude set out…', '옛날 옛적 으스스한 프롬프트 하나에, Claude가 길을 나섰어요…') },
  get christmas() { return tr('Once upon a snowy prompt, Claude set out…', '옛날 옛적 눈 내리는 프롬프트 하나에, Claude가 길을 나섰어요…') },
  get newyear() { return tr('Once upon a brand-new prompt, Claude set out…', '옛날 옛적 새해 새 프롬프트 하나에, Claude가 길을 나섰어요…') },
  get valentine() { return tr('Once upon a lovely prompt, Claude set out…', '옛날 옛적 사랑스러운 프롬프트 하나에, Claude가 길을 나섰어요…') },
  get aprilfools() { return tr('Once upon a prompt, Claude set out… backwards.', '옛날 옛적 프롬프트 하나에, Claude가 길을 나섰어요… 뒷걸음질로요.') },
}

/** The opening caption: the mood of the prompt first, then waking, the holiday, the hour. */
export function startCaption(o: { mood: 'thanks' | 'scold' | null; woke: boolean; holiday: Holiday | null; hour: number }): string {
  if (o.mood === 'thanks') return tr('Claude blushes and sets out again…', 'Claude가 얼굴을 붉히고 다시 길을 나서요…')
  if (o.mood === 'scold') return tr('Claude rubs its head sheepishly and tries again…', 'Claude가 머쓱하게 머리를 긁적이며 다시 해봐요…')
  if (o.woke) return tr('Claude wakes with a start and sets out…', 'Claude가 화들짝 깨어 길을 나서요…')
  if (o.holiday) return HOLIDAY_START[o.holiday]
  if (isLate(o.hour)) return tr('Claude pours a coffee and sets out…', 'Claude가 커피를 따르고 길을 나서요…')
  return tr('Once upon a prompt, Claude set out…', '옛날 옛적 프롬프트 하나에, Claude가 길을 나섰어요…')
}

export type Fidget = { action: Action; caption: string; emote?: Emote }
// caption은 게터: 값을 읽는 순간의 언어를 따른다(FORM_WORK 위 주석 참고).
export const FIDGETS: readonly Fidget[] = [
  { action: 'wave', get caption() { return tr('Claude waves at you.', 'Claude가 손을 흔들어요.') } },
  { action: 'scratch', get caption() { return tr('Claude scratches its head.', 'Claude가 머리를 긁적여요.') } },
  { action: 'look', get caption() { return tr('Claude looks around.', 'Claude가 두리번거려요.') } },
  { action: 'sit', get caption() { return tr('A butterfly visits Claude.', '나비 한 마리가 Claude를 찾아와요.') }, emote: 'butterfly' },
  { action: 'wink', get caption() { return tr('Claude winks at you.', 'Claude가 윙크해요.') } },
]
export const FIDGET_SLOT_MS = 7000
export const FIDGET_MS = 3000

/** While sitting: a fidget for the first few seconds of every slot but the first. */
export function fidgetAt(sitFor: number, seed: number): Fidget | null {
  if (sitFor >= REST.fishMs) return null
  const slot = Math.floor(sitFor / FIDGET_SLOT_MS)
  if (slot === 0 || sitFor - slot * FIDGET_SLOT_MS >= FIDGET_MS) return null
  return FIDGETS[Math.abs(seed + slot * 7) % FIDGETS.length] ?? null
}

// 게터: 값을 읽는 순간의 언어를 따른다(FORM_WORK 위 주석 참고).
const DREAMS: Partial<Record<Action, string>> = {
  get read() { return tr('books', '책') },
  get dig() { return tr('tunnels', '터널') },
  get sneak() { return tr('hidden trails', '숨은 오솔길') },
  get run() { return tr('open roads', '탁 트인 길') },
  get fly() { return tr('the sky', '하늘') },
  get carry() { return tr('parcels', '꾸러미') },
  get cover() { return tr('scary commands', '무서운 명령') },
}
export function dreamOf(last: Action | undefined): string {
  return (last && DREAMS[last]) || tr('electric sheep', '전기 양')
}

const TEST_CMD = /\b(test|tests|pytest|jest|vitest|mocha|rspec|phpunit|tox|nox)\b|cargo t\b|go test|npm t\b|bun test|plugin test/i

/** Pass and fail counts from a test run's output, or null when it isn't one. */
export function testCounts(command: string, output: string): { failed: number; passed: number } | null {
  if (!TEST_CMD.test(command)) return null
  const num = (re: RegExp) => {
    let best = -1
    for (const m of output.matchAll(re)) best = Math.max(best, Number(m[1]))
    return best
  }
  const failed = num(/(\d+)\s+(?:failed|failing|fail\b|failures?\b|errors?\b)/gi)
  const passed = num(/(\d+)\s+(?:passed|passing|pass\b|ok\b)/gi)
  if (failed < 0 && passed < 0) return null
  return { failed: Math.max(0, failed), passed: Math.max(0, passed) }
}

export const REST = { fishMs: 15_000, sitMs: 45_000, yawnMs: 53_000, hideMs: 180_000 }

/** A long wait: Claude casts a line, and every so often something bites. */
export const BITE_EVERY_MS = 12_000
export const BITE_MS = 3_000
export function fishing(sitFor: number): Fidget | null {
  if (sitFor < REST.fishMs || sitFor >= REST.sitMs) return null
  const t = sitFor - REST.fishMs
  if (t > BITE_MS && t % BITE_EVERY_MS < BITE_MS) {
    return { action: 'reel', caption: tr('A bite! Claude reels in a fish… and lets it go.', '앗, 입질! Claude가 물고기를 건져 올렸다가… 놓아줘요.') }
  }
  return { action: 'fish', caption: tr('Claude casts a line while it waits for you.', 'Claude가 기다리는 동안 낚싯줄을 던져요.') }
}

export function restCaption(action: 'sit' | 'yawn' | 'sleep', last?: Action): string {
  if (action === 'sit') return tr('Claude sits by the path and waits for you.', 'Claude가 길가에 앉아 기다려요.')
  if (action === 'yawn') return tr('Claude yawns…', 'Claude가 하품해요…')
  return tr(`Claude dozes off, dreaming of ${dreamOf(last)}. z z z`, `Claude가 스르르 잠들어 ${dreamOf(last)} 꿈을 꿔요. z z z`)
}

export function clockTime(iso: string | undefined): string {
  if (!iso) return tr('reset', '나중')
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return tr('reset', '나중')
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
