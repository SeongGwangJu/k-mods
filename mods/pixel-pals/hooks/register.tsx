import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

import type { Activity, DockPet, FinaleState, PetStats, Preview } from '../types'
import type { Action, Emote, Face, Form, Fx, FxKind, Hat, Hero, Holiday, Limit, Stats, Worker } from '../types'
import { USAGE, parseCommand } from './command'
import { readConfig } from './config'
import type { Choice } from './config'
import { lang, m, setLang } from './i18n'
import { isPickerOpen, stackAbove } from './kit/band'
import { drawPet, drawPetLine } from './kit/pet'
import { resolveLanguage } from './kit/lang'
import { keptRows, migrateStore, persist } from './kit/prefs'
import type { Prefs } from './kit/prefs'
import { bubbleOf, busyLabel, finaleOf, formatDuration, formatDurationKo, levelOf, newsOf, toolLabel } from './pet'
import { FINALE_MS, THEMES, THEME_NAMES, isThemeName, pickRandom, textWidth } from './themes'
import type { Act, Mood, ThemeName } from './themes'
import { PET_ROWS, dockPetOf, petArtOf } from './pets'
import type { PetState } from './pets'
import type { StageProps } from './stage'
import { CONGA_AT, HERO_W, SCENE_COUNT, TIER_COLOR, glyph, lines, speed, stage, tierOf, weatherOf } from './tales/art'
import type { Egg } from './tales/story'
import {
  fitCells,
  COMBO_AT,
  CROWN_AT,
  FORM_HAT,
  FORM_KO,
  GROW_AT,
  NEW_STATS,
  REST,
  THINKING,
  THINKING_KO,
  bashEggs,
  beat,
  clockTime,
  countCall,
  eggBeat,
  eggDone,
  ending,
  endingAction,
  fidgetAt,
  fishing,
  formOf,
  growCaption,
  holidayOf,
  isLate,
  isMidnightNewYear,
  moodOf,
  notFound,
  readStats,
  restCaption,
  scarfColor,
  skyOf,
  startCaption,
  testCounts,
  tokenMilestone,
  tr,
  tripCaption,
  waitBeat,
  warpColor,
} from './tales/story'

// k-mods 수정: 스피너 줄 옆 마스코트 끄기
const SPINNER_MASCOT = false

// The theme drawn this session ('' until session.start picks one).
const theme = atom({ plugin: 'pixel-pals', key: 'theme' } as const, '')
// The `theme` row: a theme, or `random`.
const choice = atom({ plugin: 'pixel-pals', key: 'choice' } as const, 'random')
// Session mirrors of the `visible`, `stage` and `companion` rows, so a command shows at once.
const isHidden = atom({ plugin: 'pixel-pals', key: 'isHidden' } as const, false)
const isStageOff = atom({ plugin: 'pixel-pals', key: 'isStageOff' } as const, false)
const isCompanionOff = atom({ plugin: 'pixel-pals', key: 'isCompanionOff' } as const, false)
const finale = atom({ plugin: 'pixel-pals', key: 'finale' } as const, null)
const preview = atom({ plugin: 'pixel-pals', key: 'preview' } as const, null)
const activity = atom({ plugin: 'pixel-pals', key: 'activity' } as const, { act: 'think' as Act })
const mood = atom({ plugin: 'pixel-pals', key: 'mood' } as const, 'hello' as Mood)
const pet = atom({ plugin: 'pixel-pals', key: 'pet' } as const, { xp: 0, love: 0 })
const pat = atom({ plugin: 'pixel-pals', key: 'pat' } as const, null)
const news = atom({ plugin: 'pixel-pals', key: 'news' } as const, null)
// The pet for whoever draws it (hud beside its rows, or this plugin above the prompt).
const dock = atom({ plugin: 'pixel-pals', key: 'dock' } as const, null as DockPet | null)
const isTurn = atom({ plugin: 'pixel-pals', key: 'isTurn' } as const, false)
// True while a picker is open above the band (see kit/band).
const isPicking = atom({ plugin: 'pixel-pals', key: 'isPicking' } as const, false)

const PREVIEW_MS = 8000
/** Below this many columns the band draws the pet in one row. */
const COMPACT_COLUMNS = 60
/** Cells the pet's bubble and stats take beside it above the prompt. */
const PET_LABEL_W = 24
/** How long the pet speaks of tests or a commit. */
const NEWS_MS = 4000
/** How long a pat's hearts float. */
const PAT_MS = 2500
/** How long an `ask` must stand before the pet shows it: the mode settles most at once. */
const ASK_DELAY_MS = 600
/** Quiet this long after a turn, the companion dozes off. */
const SLEEP_MS = 5 * 60_000

/** The kit's hold on this mod's store and `/config` rows. */
function prefsOf($: EngineInterface): Prefs {
  return {
    kept: key => $.store.get(key),
    forget: key => $.store.delete(key),
    write: (field, value) => $.config.set({ key: `pixel-pals.${field}`, value }),
  }
}

/**
 * The theme a choice names. `random` keeps the one this session already drew
 * at random (a reload brought by another row's change), unless `isFresh`.
 */
async function choose($: EngineInterface, picked: Choice, isFresh = false): Promise<ThemeName> {
  const current = await read($, theme)
  const wasRandom = (await read($, choice)) === 'random'
  const name =
    picked !== 'random' ? picked : !isFresh && wasRandom && isThemeName(current) ? current : pickRandom(await $.clock.now())
  await update($, choice, () => picked)
  await update($, theme, () => name)
  await publishPet($)
  return name
}

/** The pet's stats as the store keeps them, shared by every session. */
async function keptPet($: EngineInterface): Promise<PetStats> {
  const stats = (await $.store.get('pet')) as Partial<PetStats> | undefined
  return { xp: Number(stats?.xp) || 0, love: Number(stats?.love) || 0 }
}

/**
 * Adds `by` to the kept stats, read again just before: sessions running side
 * by side all raise the one pet instead of writing back their own copy.
 */
async function bumpPet($: EngineInterface, by: PetStats): Promise<PetStats> {
  const kept = await keptPet($)
  const next = { xp: kept.xp + by.xp, love: kept.love + by.love }
  await $.store.set('pet', next)
  return update($, pet, () => next)
}

/** One more xp, kept, and a toast when it brings a level. */
async function gainXp($: EngineInterface): Promise<void> {
  const after = await bumpPet($, { xp: 1, love: 0 })
  if (levelOf(after.xp) > levelOf(after.xp - 1)) {
    $.ui.toast(m('pet.levelUp', { theme: await read($, theme), level: levelOf(after.xp) }))
  }
}

/** Tests or a commit the main thread just ran: a word from the pet for a moment, and xp for good news. */
async function noteNews($: EngineInterface, command: string, isError: boolean, id: string): Promise<void> {
  const kind = newsOf(command, isError)
  if (kind === null) return
  await update($, news, () => ({ kind, id }))
  if (kind !== 'testFail') await gainXp($)
  $.clock.after(NEWS_MS, async () => {
    if ((await read($, news))?.id !== id) return
    await update($, news, () => null)
    await publishPet($)
  })
}

/** A pat: hearts in the band, one more point of affection, kept. */
async function patPet($: EngineInterface): Promise<PetStats> {
  const next = await bumpPet($, { xp: 0, love: 1 })
  const id = String(next.love)
  await update($, pat, () => id)
  if ((await read($, mood)) === 'sleep') await update($, mood, () => 'hello' as Mood)
  await publishPet($)
  $.clock.after(PAT_MS, async () => {
    if ((await read($, pat)) !== id) return
    await update($, pat, () => null)
    await publishPet($)
  })
  return next
}

/** Reduced motion (the `reducedMotion` row): every animation one still frame. */
let isStill = false

const TONE: Partial<Record<PetState, DockPet['tone']>> = { ask: 'ask', error: 'error', aborted: 'aborted', sleep: 'sleep' }

/** Publishes the pet as it is now (`pixel-pals.dock`), or null while it is off. */
async function publishPet($: EngineInterface): Promise<void> {
  if ((await read($, isHidden)) || (await read($, isCompanionOff))) {
    if ((await read($, dock)) !== null) await update($, dock, () => null)
    return
  }
  const name = await read($, theme)
  const now = await read($, activity)
  const state: PetState = (await read($, isTurn)) ? now.act : await read($, mood)
  const stats = await read($, pet)
  const patId = await read($, pat)
  // A permission prompt waiting outranks news: it is the one the person must act on.
  const said = state === 'ask' ? null : await read($, news)
  const art = petArtOf(name, isThemeName(name) ? THEMES[name].color : THEMES.clawd.color)
  const view = {
    id: `${name}:${state}:${patId ?? ''}`,
    bubble: said ? m(`pet.${said.kind}`) : bubbleOf(state, now.tool),
    tone: said?.kind === 'testFail' ? 'error' : (TONE[state] ?? 'plain'),
    stats: `Lv.${levelOf(stats.xp)} ♥${stats.love}`,
  }
  const was = await read($, dock)
  // The same loop with new words keeps its frames.
  const next = was?.id === view.id ? { ...was, ...view } : dockPetOf(art, state, view, patId !== null, isStill)
  if (was?.id === next.id && was.bubble === next.bubble && was.stats === next.stats && was.tone === next.tone) return
  await update($, dock, () => next)
}

/** Busy with the latest tool still running (subagents counted), else back to thinking. */
async function settle($: EngineInterface, running: Map<string, string>): Promise<void> {
  const last = busyLabel([...running.values()])
  await update($, activity, () => (last ? { act: 'tool' as Act, tool: last } : { act: 'think' as Act }))
  await publishPet($)
}

/** Sets a switch's session mirror and, when it changed, its row. */
async function setSwitch($: EngineInterface, field: 'visible' | 'stage' | 'companion', isOn: boolean): Promise<void> {
  // Each mirror spelled out: the engine reads which state a hook touches from the source.
  const wasOff =
    field === 'visible'
      ? await read($, isHidden)
      : field === 'stage'
        ? await read($, isStageOff)
        : await read($, isCompanionOff)
  if (wasOff === !isOn) return
  if (field === 'visible') await update($, isHidden, () => !isOn)
  else if (field === 'stage') await update($, isStageOff, () => !isOn)
  else await update($, isCompanionOff, () => !isOn)
  await publishPet($)
  await persist(prefsOf($), field, isOn)
}

/** `/pals` with no arguments: the theme, the pet, what is off, the themes and the usage. */
async function status($: EngineInterface): Promise<string> {
  const current = await read($, theme)
  const stats = await read($, pet)
  const lines = [
    m('cmd.status', { theme: `${current}${(await read($, choice)) === 'random' ? m('cmd.randomNote') : ''}` }),
    m('cmd.petStats', { theme: current, level: levelOf(stats.xp), xp: stats.xp, love: stats.love }),
  ]
  if (await read($, isHidden)) lines.push(m('cmd.hidden'))
  if (await read($, isStageOff)) lines.push(m('cmd.stageOff'))
  if (await read($, isCompanionOff)) lines.push(m('cmd.companionOff'))
  lines.push(m('cmd.themes', { list: THEME_NAMES.map(n => `${n} ${THEMES[n].happy}`).join(' · ') }), m('cmd.usage'))
  return lines.join('\n')
}

// What versions before 0.3 kept in the store, as `/config` rows.
const STORE_MOVES = {
  theme: (kept: unknown) => (kept === 'random' || isThemeName(kept) ? (['theme', kept] as const) : null),
  isHidden: (kept: unknown) => ['visible', kept !== true] as const,
  isStageOff: (kept: unknown) => ['stage', kept !== true] as const,
  isCompanionOff: (kept: unknown) => ['companion', kept !== true] as const,
}

export const register: Register = (on, options) => {
  const config = readConfig(options)
  isStill = config.isStill
  // Tool calls running now: a pet stays busy until the last of parallel calls ends.
  const running = new Map<string, string>()
  // Every call still open, a subagent's too: an ask is shown only while its call is.
  const open = new Set<string>()
  let sleepTimer: { cancel: () => void } | undefined

  on('session.start', async ($, e, next) => {
    const settings = (await $.settings.read().catch(() => ({}))) as { language?: unknown }
    const locale = await Promise.all([
      $.env.get('LC_ALL').catch(() => undefined),
      $.env.get('LC_MESSAGES').catch(() => undefined),
      $.env.get('LANG').catch(() => undefined),
    ])
    setLang(resolveLanguage(config.language, settings.language, locale))
    await $.command.register({ name: 'pals', description: m('cmd.description'), argumentHint: USAGE })

    const rows = readConfig({ ...options, ...(await keptRows(prefsOf($), STORE_MOVES)) })
    await choose($, rows.theme)
    await update($, isHidden, () => !rows.isVisible)
    await update($, isStageOff, () => !rows.hasStage)
    await update($, isCompanionOff, () => !rows.hasCompanion)
    const stats = await keptPet($)
    await update($, pet, () => stats)
    await publishPet($)
    const result = await talesSessionStart($, e, next)
    await migrateStore(prefsOf($), STORE_MOVES)
    return result
  })

  on('turn.start', async ($, e, next) => {
    // k-mods 수정: 무작위 테마를 세션마다가 아니라 턴마다 새로 고른다
    if ((await read($, choice)) === 'random') await choose($, 'random', true)
    running.clear()
    sleepTimer?.cancel()
    await update($, activity, () => ({ act: 'think' as Act }))
    await update($, isTurn, () => true)
    if (await read($, finale)) await update($, finale, () => null)
    await publishPet($)
    return talesTurnStart($, e, next)
  })

  on('tool.call', async ($, e, next) => {
    // A subagent's call is no news for the bubble, but its permission ask is.
    if (e.agentId) {
      open.add(e.tool_use_id)
      try {
        return await talesToolCall($, e, next)
      } finally {
        open.delete(e.tool_use_id)
        // Its ask answered: back to what the main thread is doing.
        if ((await read($, activity)).act === 'ask') await settle($, running)
      }
    }
    open.add(e.tool_use_id)
    const label = toolLabel(e as unknown as { tool: string } & Record<string, unknown>)
    running.set(e.tool_use_id, label)
    await update($, activity, () => (e.tool === 'AskUserQuestion' ? { act: 'ask' as Act } : { act: 'tool' as Act, tool: busyLabel([...running.values()]) }))
    await publishPet($)
    try {
      const result = await talesToolCall($, e, next)
      const command = (e as unknown as { command?: unknown }).command
      if (e.tool === 'Bash' && typeof command === 'string' && !('deny' in result && result.deny !== undefined)) {
        await noteNews($, command, result.isError === true, e.tool_use_id)
      }
      return result
    } finally {
      open.delete(e.tool_use_id)
      running.delete(e.tool_use_id)
      await settle($, running)
    }
  })

  // A call the engine puts to the person: `ask` from the permission check. The
  // mode often settles an ask by itself at once, so the pet waits a moment and
  // asks only if the call is still open.
  on('tool.check', async ($, e, next) => {
    const verdict = await next(e)
    const id = e.tool_use_id
    if (verdict.decision === 'ask' && id !== undefined && open.has(id)) {
      $.clock.after(ASK_DELAY_MS, async () => {
        if (!open.has(id)) return
        await update($, activity, a => ({ ...a, act: 'ask' as Act }))
        await publishPet($)
      })
    }
    return verdict
  })

  on('turn.complete', async ($, e, next) => {
    const result = await talesTurnComplete($, e, next)
    if (e.agentId) return result
    running.clear()
    await update($, activity, () => ({ act: 'think' as Act }))
    await update($, isTurn, () => false)

    const kind = finaleOf(e.reason)
    await update($, mood, () => (kind === 'answer' ? 'ready' : kind))
    sleepTimer?.cancel()
    sleepTimer = $.clock.after(SLEEP_MS, async () => {
      await update($, mood, () => 'sleep' as Mood)
      await publishPet($)
    })

    if (kind === 'answer') {
      await gainXp($)
    }

    await publishPet($)
    if (config.hasFinale) {
      const label =
        kind === 'answer' ? m('finale.done', { time: lang() === 'ko' ? formatDurationKo(e.durationMs) : formatDuration(e.durationMs) }) : m(kind === 'aborted' ? 'finale.aborted' : 'finale.error')
      const id = e.turnId
      await update($, finale, () => ({ kind, label, id }))
      $.clock.after(FINALE_MS, () => void update($, finale, f => (f?.id === id ? null : f)))
    }
    return result
  })

  // A click on the pet, where this plugin draws it.
  on('ui.message', async ($, e, next) => {
    const data = e.data as { pat?: unknown } | null
    if (data?.pat === true) await patPet($)
    return next(e)
  })

  on('command.run', { command: 'pals' }, async ($, e) => {
    const command = parseCommand(e.args)
    const list = THEME_NAMES.join(' · ')
    switch (command.kind) {
      case 'status':
        return { text: await status($) }
      case 'visible':
        await setSwitch($, 'visible', command.isOn)
        return { text: m(command.isOn ? 'cmd.shown' : 'cmd.hidden') }
      case 'stage':
        await setSwitch($, 'stage', command.isOn)
        return { text: m(command.isOn ? 'cmd.stageOn' : 'cmd.stageOff') }
      case 'companion':
        await setSwitch($, 'companion', command.isOn)
        return { text: m(command.isOn ? 'cmd.companionOn' : 'cmd.companionOff') }
      case 'pat': {
        const stats = await patPet($)
        return { text: m('cmd.pat', { theme: await read($, theme), love: stats.love }) }
      }
      case 'preview': {
        const current = await read($, theme)
        const name: ThemeName = command.theme ?? (isThemeName(current) ? current : 'clawd')
        // tales는 장면이 아니라 이야기라서 미리 보기는 /tales demo가 맡는다
        if (name === 'tales') return { text: m('cmd.talesPreview') }
        const id = String(await $.clock.now())
        await update($, preview, () => ({ theme: name, id }))
        $.clock.after(PREVIEW_MS, () => void update($, preview, p => (p?.id === id ? null : p)))
        return { text: m('cmd.preview', { theme: name }) }
      }
      case 'pick': {
        // 2-4 options fit the dialog: random and three others; any theme typed under Other.
        const current = await read($, theme)
        const others = THEME_NAMES.filter(n => n !== current)
        const start = (await $.clock.now()) % others.length
        const offered = ['random', ...[0, 1, 2].map(i => others[(start + i) % others.length]!)]
        let answer: string
        try {
          answer = (await $.ui.ask(m('cmd.pick', { list }), { options: offered, header: 'Theme' })).trim().toLowerCase()
        } catch {
          // Dismissed, or no one to ask (-p): what `/pals` alone says.
          return { text: await status($) }
        }
        if (answer !== 'random' && !isThemeName(answer)) return { text: m('cmd.unknown', { name: answer, list }) }
        const name = await choose($, answer, true)
        await persist(prefsOf($), 'theme', answer)
        return { text: answer === 'random' ? m('cmd.random', { theme: name }) : m('cmd.switched', { theme: name }) }
      }
      case 'theme': {
        const name = await choose($, command.theme, true)
        await persist(prefsOf($), 'theme', command.theme)
        return { text: command.theme === 'random' ? m('cmd.random', { theme: name }) : m('cmd.switched', { theme: name }) }
      }
      case 'unknown':
        return { text: m('cmd.unknown', { name: command.name, list }) }
    }
  })

  // The mascot rides in front of the engine's own line, which keeps its word,
  // elapsed time and tokens.
  // A picker (`/` commands, `@` files) opens above the band: the band steps aside meanwhile.
  on('prompt.edit', async ($, e, next) => {
    const box = await next(e)
    const isOpen = isPickerOpen(box.text, box.cursor)
    if ((await read($, isPicking)) !== isOpen) await update($, isPicking, () => isOpen)
    return box
  })
  on('prompt.submit', async ($, e, next) => {
    if (await read($, isPicking)) await update($, isPicking, () => false)
    return talesPromptSubmit($, e, next)
  })

  // A button in the prompt footer: `/pals off` / `on`. Mode labels other plugins add stay beside it.
  if (config.hasFooterButton) {
    on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
      const hidden = await read($, isHidden)
      const below = await next(e)
      const { Box, Button } = $.ui.resolve(e)
      return (
        <Box flexDirection="row" alignItems="center" gap={1}>
          <Button key="pals-toggle" plain dimColor={hidden} label="Pals" onPress={() => setSwitch($, 'visible', hidden)} />
          {below}
        </Box>
      )
    })
  }

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    // k-mods 수정: 스피너 줄 옆 마스코트는 그리지 않는다 (줄 앞에 들여쓰기가 생긴다). 장면은 입력창 위 띠에서만.
    if (!SPINNER_MASCOT) return next(e)
    // One mascot at a time: with the companion's row showing, it stays there.
    if ((await read($, isHidden)) || !(await read($, isCompanionOff))) return next(e)
    const ui = $.ui.resolve(e)
    if (!('Client' in ui)) return next(e)
    const { Box, Client } = ui
    const current = await read($, theme)
    const name: ThemeName = isThemeName(current) ? current : 'clawd'
    const native = await next(e)
    return (
      <Box flexDirection="row" columnGap={1}>
        {/* The engine's line opens with a blank row; the mascot sits on the line itself. */}
        <Box marginTop={1}>
          <Client key="sprite" module="./sprite.tsx" width={spriteWidth(name)} props={{ theme: name, mode: e.props.mode, still: isStill }} />
        </Box>
        {native}
      </Box>
    )
  })

  // The band: a preview, else the running turn's scene or its finale, and the
  // pet right-aligned beside it.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isPicking))) return talesBand($, e, next)
    const ui = $.ui.resolve(e)
    if (!('Client' in ui)) return talesBand($, e, next)
    const { Box, Client } = ui

    const shown: Preview | null = await read($, preview)
    const current = await read($, theme)
    // pixel-pals: tales 테마는 clawd-tales의 무대(hooks/tales)가 띠를 통째로 그린다
    if (!shown && current === 'tales') return talesBand($, e, next)
    const name: ThemeName = isThemeName(current) ? current : 'clawd'
    const pet = (await read($, isHidden)) ? null : await read($, dock)
    // Two cells in, and the pet's block on the right.
    const petColumns = pet ? pet.width + 1 + PET_LABEL_W : 0
    const columns = e.props.bodyColumns - 2 - petColumns
    const sceneFits = (rows: number) => e.props.maxRows >= Math.max(rows, pet ? PET_ROWS : 0)
    let scene = null

    if (shown && isThemeName(shown.theme)) {
      const props: StageProps = { theme: shown.theme, columns, act: 'think', still: isStill }
      scene = <Client key={`preview-${shown.id}`} module="./stage.tsx" width={columns} props={props} />
    } else if (!(await read($, isHidden)) && !(await read($, isStageOff)) && sceneFits(THEMES[name].rows)) {
      const ended: FinaleState | null = await read($, finale)
      const now: Activity = await read($, activity)
      if (e.props.isWorking) {
        const props: StageProps = { theme: name, columns, act: now.act, still: isStill }
        scene = <Client key="work" module="./stage.tsx" width={columns} props={props} />
      } else if (ended) {
        const props = { theme: name, columns, act: now.act, finale: ended.kind, label: ended.label, still: isStill }
        scene = <Client key={`finale-${ended.id}`} module="./stage.tsx" width={columns} props={props} />
      }
    }
    if (!scene && !pet) return talesBand($, e, next)

    // Too short or narrow for the pet's block: the pet in one row, the scene left out.
    if (pet && !shown && (e.props.maxRows < PET_ROWS || e.props.bodyColumns < COMPACT_COLUMNS)) {
      const mascot = { text: THEMES[name].sprite.say[0] ?? '', color: THEMES[name].color }
      return stackAbove(ui, <Box justifyContent="flex-end">{drawPetLine(ui, pet, mascot)}</Box>, await talesBand($, e, next))
    }
    const band = (
      <Box flexDirection="row" justifyContent="space-between" alignItems="flex-end">
        {scene ?? <Box />}
        {pet ? <Box width={petColumns} justifyContent="flex-end">{drawPet(ui, pet, 'pet')}</Box> : null}
      </Box>
    )
    return stackAbove(ui, band, await talesBand($, e, next))
  })

  // pixel-pals: clawd-tales(tales 테마)만 쓰는 이벤트. 겹치는 이벤트(session.start·turn·tool.call·prompt.submit·띠)는
  // 위 훅이 next 자리에서 tales 함수를 불러 잇는다. 이야기는 테마와 상관없이 이어 가고, 띠는 tales 테마일 때만 그린다.
  on('command.run', { command: 'tales' }, async ($, e) => talesCommand($, e))
  on('classic.UserPromptSubmit', async ($, e, next) => talesClassicPromptSubmit($, e, next))
  on('session.measure', async ($, e, next) => talesSessionMeasure($, e, next))
  on('classic.PermissionRequest', async ($, e, next) => talesPermissionRequest($, e, next))
  on('agent.spawn', async ($, e, next) => talesAgentSpawn($, e, next))
  on('session.compact', async ($, e, next) => talesSessionCompact($, e, next))
  on('classic.SessionStart', async ($, e, next) => talesClassicSessionStart($, e, next))
}

/** Cells the mascot's region takes: its widest frame, with room for a symbol a terminal draws wide. */
function spriteWidth(name: ThemeName): number {
  return Math.max(...Object.values(THEMES[name].sprite).flat().map(textWidth)) + 2
}

// ---- clawd-tales (tales 테마) ----------------------------------------------
// plaxagoras/clawd-tales @ 89c7f95 (MIT)의 hooks/register.tsx. Claude Code는 플러그인마다 훅 모듈 하나만 받고 $는 같은
// 파일의 함수로만 넘길 수 있어서 장면 쪽과 한 파일에 둔다. 그림은 tales/art.ts, 문구는 tales/story.ts에 있다.

const IDLE: Hero = { mode: 'idle', action: 'walk', caption: '', x: 0, dir: 1, scene: 0, steps: 0, since: 0 }

const hero = atom({ plugin: 'pixel-pals', key: 'hero' } as const, IDLE)
const workers = atom({ plugin: 'pixel-pals', key: 'workers' } as const, [])
const frame = atom({ plugin: 'pixel-pals', key: 'frame' } as const, 0)
const isOn = atom({ plugin: 'pixel-pals', key: 'isOn' } as const, true)
const alert = atom({ plugin: 'pixel-pals', key: 'alert' } as const, null)
const context = atom({ plugin: 'pixel-pals', key: 'context' } as const, null)
const limits = atom({ plugin: 'pixel-pals', key: 'limits' } as const, [])
const calm = atom({ plugin: 'pixel-pals', key: 'calm' } as const, false)
const bugs = atom({ plugin: 'pixel-pals', key: 'bugs' } as const, 0)
const todos = atom({ plugin: 'pixel-pals', key: 'todos' } as const, null)
const fx = atom({ plugin: 'pixel-pals', key: 'fx' } as const, [])
const shiny = atom({ plugin: 'pixel-pals', key: 'shiny' } as const, null)
const combo = atom({ plugin: 'pixel-pals', key: 'combo' } as const, 0)

const TICK_MS = 200
const CALM_TICK_MS = 1000 // calm mode: one beat a second
const POLL_EVERY = 5 // ticks between $.agent.list() checks
const THINK_AFTER_MS = 15000 // a helper with no tool call for this long wanders again
const TRIP_MS = 2500
const LINGER_MS = 8000 // the closing cheer lasts this long, then the rest ladder
const HUG_MS = 3000 // a helper that made it back stays this long with hearts
const RETURN_MAX_MS = 10_000 // a helper that can't reach Claude hands in anyway
const ENDED = new Set(['completed', 'failed', 'killed'])
const THINK_POSE_MS = 8000 // no tool call for this long mid-turn: a thought bubble
const MOOD_MS = 4000 // a blush or a sweat drop lasts this long
const VISITOR_ODDS = 1 / 25 // per prompt
const SHINY_ODDS = 1 / 100 // per session
const FX_MS: Record<FxKind, number> = { confetti: 2200, plane: 3500, boxes: 6000, train: 8000, whale: 16000, ufo: 10000, warp: 1200 }
const HOLIDAYS: readonly Holiday[] = ['halloween', 'christmas', 'newyear', 'valentine', 'aprilfools']

// Module-level: a reload starts these over, and session.start picks the story back up.
let timer: Timer | undefined
let isCalm = false // mirrors the calm atom for the tick's own pacing
let ticks = 0
let cols = 100
let heroCalls = 0 // main-loop tool calls still running: a trip waits for them to end
let tripUntil = 0
let startedAt = 0
let lastCallAt = 0 // the last main-loop tool call's end, for the thought bubble
let best = 0 // the turn's best combo
let fxId = 0
let holidayPick: Holiday | 'none' | null = null // /tales holiday: a preview, this load only
let alertAt: number | null = null // when the current call for the user began
let errStreak = 0 // main-loop errors in a row
let nextGlanceAt = 0
let planMode = false // the last prompt went in under plan mode: the wizard hat
let agentCalls = 0 // main-loop Agent calls still running: Claude is waiting on helpers
let sessionTokens = 0 // input, cache writes and output this session; cache reads left out
let tokensSeen = 0 // the count at the last main-loop ending, so a helper's crossing waits for it
const HARDHAT_MS = 120_000 // two minutes into a turn: hard hat on
const WAKE_MS = 60_000 // a minute before a limit resets, Claude stretches; a minute after, it's up
const TIE_AT = 3 // helpers out for the boss tie
const FAST_YES_MS = 6000 // approved and done this fast: hearts
const NERVOUS_MS = 30_000 // a call for the user waiting this long: a sweat drop and a timer
const FLIP_MS = 4000
let wornHat: Hat | null = null // /tales hat, saved in $.store
let wornFace: Face | null = null // /tales face, saved in $.store
const HATS_TO_WEAR: readonly Hat[] = ['tophat', 'gradcap', 'captain', 'wizard', 'hardhat', 'deerstalker', 'beanie', 'pith', 'shell', 'witch', 'santa', 'party', 'nightcap', 'crown']
let stats: Stats | null = null // lifetime progress from $.store; null until Clawd has hatched
let scarfOn = true // /tales scarf, saved in $.store
let scarfKey: string | null = null // the project's scarf color
const HATCH_MS = 2400
let demoGrowth: Form | 'shell' | null = null // /tales demo's own hatch and growth; real stats untouched
const FACES_TO_WEAR: readonly Face[] = ['glasses', 'shades', 'mustache']
const workerBeatAt = new Map<string, number>()
const workerTripUntil = new Map<string, number>()
const returningSince = new Map<string, number>()

/** Steps x along the stage, turning at either edge. */
function walk<T extends { x: number; dir: 1 | -1 }>(it: T, action: Action): T {
  const v = speed(action)
  if (v <= 0) return it
  const max = Math.max(0, cols - HERO_W)
  let x = it.x + v * it.dir
  let dir = it.dir
  if (x >= max) [x, dir] = [max, -1]
  if (x <= 0) [x, dir] = [0, 1]
  return { ...it, x, dir }
}

/** The rest ladder, by time since the turn's cheer ended. Null once Claude has gone. */
function restStep(since: number, now: number, lim: Limit | null, last?: Action): Pick<Hero, 'action' | 'caption' | 'emote'> | null {
  const resets = lim?.resetsAt ? Date.parse(lim.resetsAt) : NaN
  // The figure stays at 100 until the next response, so past the reset the clock decides.
  if (lim && lim.percent >= 100 && !(now >= resets + WAKE_MS)) {
    if (now >= resets) {
      return {
        action: 'cheer',
        caption: tr(`The ${lim.kind} limit has reset. Claude is up and ready!`, `${lim.kind} 한도가 초기화됐어요. Claude가 벌떡 일어나 준비 완료!`),
        emote: null,
      }
    }
    if (now >= resets - WAKE_MS) {
      return {
        action: 'stretch',
        caption: tr(
          `Claude stretches. The ${lim.kind} limit resets at ${clockTime(lim.resetsAt)}.`,
          `Claude가 기지개를 켜요. ${lim.kind} 한도가 ${clockTime(lim.resetsAt)}에 초기화돼요.`,
        ),
        emote: null,
      }
    }
    return {
      action: 'sleep',
      caption: tr(
        `Claude sleeps until the ${lim.kind} limit resets at ${clockTime(lim.resetsAt)}. z z z`,
        `Claude가 ${lim.kind} 한도가 ${clockTime(lim.resetsAt)}에 초기화될 때까지 자요. z z z`,
      ),
      emote: null,
    }
  }
  const t = now - since
  if (t >= REST.hideMs) return null
  const action = t < REST.sitMs ? 'sit' : t < REST.yawnMs ? 'yawn' : 'sleep'
  const fidget = action === 'sit' ? (fishing(t) ?? fidgetAt(t, Math.floor(since / 1000))) : null
  if (fidget) return { action: fidget.action, caption: fidget.caption, emote: fidget.emote ?? null }
  return { action, caption: restCaption(action, last), emote: null }
}

function holidayNow(d: Date): Holiday | null {
  if (holidayPick === 'none') return null
  return holidayPick ?? holidayOf(d)
}

/** Claude's eyes dart toward something for a moment. */
async function glanceAt($: EngineInterface, dir: -1 | 1, ms = 1500) {
  const now = await $.clock.now()
  await update($, hero, (cur): Hero => ({ ...cur, glance: dir, glanceUntil: now + ms }))
}

async function addFx($: EngineInterface, kind: FxKind, x: number) {
  if ((await read($, hero)).mode === 'idle') return
  const start = await $.clock.now()
  fxId += 1
  const one: Fx = { id: fxId, kind, start, dur: FX_MS[kind], x }
  await update($, fx, list => [...list.filter(f => f.kind !== kind), one])
  ensureTimer($)
}

/** A rare visitor crosses during the turn: a sky whale, a UFO, or the train. */
function maybeVisitor($: EngineInterface, force?: FxKind) {
  if (!force && Math.random() >= VISITOR_ODDS) return
  const kinds: FxKind[] = ['whale', 'ufo', 'train']
  const kind = force ?? kinds[Math.floor(Math.random() * kinds.length)] ?? 'whale'
  $.clock.after(force ? 0 : 3000 + Math.floor(Math.random() * 12000), () => void addFx($, kind, 0))
}

function ensureTimer($: EngineInterface) {
  if (timer) return
  timer = $.clock.every(isCalm ? CALM_TICK_MS : TICK_MS, async () => {
    ticks += 1
    const now = await $.clock.now()
    let cur = await read($, hero)
    const crew = await read($, workers)

    if (cur.mode === 'ending' && now - cur.since >= LINGER_MS) {
      cur = { ...cur, mode: 'resting', since: now, action: 'sit', caption: restCaption('sit') }
      await update($, hero, () => cur)
    }
    if (cur.emote && cur.mode !== 'resting' && cur.emote !== 'think' && now > (cur.emoteUntil ?? 0)) {
      cur = { ...cur, emote: null }
      await update($, hero, () => cur)
    }
    if (cur.mode === 'resting') {
      const step = restStep(cur.since, now, topLimit(await read($, limits)), cur.last)
      const next: Hero = step ? { ...cur, ...step } : { ...cur, mode: 'idle', emote: null }
      if (next.action !== cur.action || next.mode !== cur.mode || next.caption !== cur.caption || next.emote !== cur.emote) {
        cur = next
        await update($, hero, () => next)
        if (next.mode === 'idle') await update($, fx, () => [])
      }
    }
    let effects = await read($, fx)
    if (effects.some(f => now - f.start >= f.dur)) {
      effects = effects.filter(f => now - f.start < f.dur)
      await update($, fx, () => effects)
    }
    if (cur.mode === 'idle' && crew.length === 0 && effects.length === 0) {
      timer?.cancel()
      timer = undefined
      return
    }
    const f = (await read($, frame)) + 1
    await update($, frame, () => f)
    // Now and then the eyes wander: a look left or right for a second.
    if (cur.mode !== 'idle' && now >= nextGlanceAt) {
      if (nextGlanceAt > 0 && cur.action !== 'sleep') await glanceAt($, Math.random() < 0.5 ? -1 : 1, 1200)
      nextGlanceAt = now + 5000 + Math.floor(Math.random() * 7000)
    }

    if (cur.mode === 'working' && !(await read($, alert))) {
      let next: Hero = cur
      // Claude keeps the last pose through the model's thinking until the next tool call;
      // only a trip, once played, goes back to wandering.
      if ((cur.action === 'trip' || cur.action === 'dizzy' || cur.action === 'flip') && heroCalls === 0 && now >= tripUntil) {
        next = { ...next, action: 'walk', caption: tr(THINKING[f % THINKING.length] ?? '', THINKING_KO[f % THINKING_KO.length] ?? '') }
      }
      // A long think: the pose and caption stay, a thought bubble rises.
      if (!cur.emote && heroCalls === 0 && now - lastCallAt >= THINK_POSE_MS && next.action !== 'trip' && next.action !== 'sweep') {
        next = { ...next, emote: 'think', emoteUntil: Infinity }
      }
      // Waiting on an Agent call, Claude sits with the helpers' music or juggling: no wandering.
      if (!isCalm && agentCalls === 0) next = walk(next, next.action)
      if (next !== cur) await update($, hero, () => next)
    }

    if (crew.length > 0) {
      const homeX = cur.x
      const arrived: string[] = []
      await update($, workers, list =>
        list.map(w => {
          if (w.state === 'returning') {
            const gap = homeX - w.x
            const late = now - (returningSince.get(w.id) ?? now) > RETURN_MAX_MS
            if (Math.abs(gap) <= HERO_W - 4 || late) {
              arrived.push(w.id)
              return { ...w, state: 'done', action: w.sad ? 'sit' : 'cheer', dir: gap >= 0 ? 1 : -1 }
            }
            const dir: 1 | -1 = gap > 0 ? 1 : -1
            const step = Math.min(Math.abs(gap), isCalm ? 8 : 1)
            return { ...w, dir, x: w.x + dir * step }
          }
          if (w.state !== 'running') return w
          const quiet = now - (workerBeatAt.get(w.id) ?? 0) > THINK_AFTER_MS
          const tripping = now < (workerTripUntil.get(w.id) ?? 0)
          const action: Action = quiet && !tripping ? 'walk' : w.action
          return isCalm ? { ...w, action } : walk({ ...w, action }, action)
        }),
      )
      if (!isCalm) await update($, workers, conga)
      for (const id of arrived) $.clock.after(HUG_MS, () => void leave($, id))
      if (ticks % POLL_EVERY === 0) await talesSettle($, crew)
    }
  })
}

/** Four or more helpers out: the ones wandering fall in line behind the first. */
function conga(list: Worker[]): Worker[] {
  const line = list.filter(w => w.state === 'running' && speed(w.action) > 0)
  if (list.filter(w => w.state === 'running').length < CONGA_AT || line.length < 2) return list
  const max = Math.max(0, cols - HERO_W)
  const placed = new Map<string, Worker>()
  let ahead = line[0]!
  for (const w of line.slice(1)) {
    const want = Math.min(max, Math.max(0, ahead.x - ahead.dir * 12))
    const gap = want - w.x
    const step = Math.min(Math.abs(gap), 1)
    const moved: Worker = { ...w, action: 'walk', x: w.x + Math.sign(gap) * step, dir: gap === 0 ? ahead.dir : gap > 0 ? 1 : -1 }
    placed.set(w.id, moved)
    ahead = moved
  }
  return list.map(w => placed.get(w.id) ?? w)
}

async function leave($: EngineInterface, id: string) {
  workerBeatAt.delete(id)
  workerTripUntil.delete(id)
  returningSince.delete(id)
  await update($, workers, list => list.filter(w => w.id !== id))
}

/** A helper ends: done ones run home to Claude, failed ones trip and leave. */
async function finish($: EngineInterface, id: string, state: 'done' | 'failed') {
  if (state === 'done') {
    returningSince.set(id, await $.clock.now())
    await update($, workers, list => list.map(w => (w.id === id ? { ...w, state: 'returning', action: 'run' } : w)))
    ensureTimer($)
    return
  }
  await update($, workers, list => list.map(w => (w.id === id ? { ...w, state: 'failed', action: 'trip', sad: true } : w)))
  // It trips, dusts off, and walks back to Claude for a pat on the head.
  $.clock.after(TRIP_MS, async () => {
    returningSince.set(id, await $.clock.now())
    await update($, workers, list => list.map(w => (w.id === id ? { ...w, state: 'returning', action: 'walk' } : w)))
  })
}

async function talesSettle($: EngineInterface, list: readonly Worker[]) {
  const running = list.filter(w => w.state === 'running' && !w.id.startsWith('demo-'))
  if (running.length === 0) return
  const agents = await $.agent.list()
  for (const w of running) {
    const a = agents.find(x => x.id === w.id)
    if (!a) await finish($, w.id, 'done')
    else if (ENDED.has(a.status)) await finish($, w.id, a.status === 'completed' ? 'done' : 'failed')
  }
}

/** The spot on the stage farthest from Claude and every helper already out. */
function openSpot(taken: readonly number[], max: number): number {
  let best = 0
  let bestGap = -1
  for (let x = 0; x <= max; x += 2) {
    const gap = Math.min(...taken.map(t => Math.abs(t - x)), Infinity)
    if (gap > bestGap) [best, bestGap] = [x, gap]
  }
  return best
}

async function addWorker($: EngineInterface, id: string, label: string, model: string | undefined) {
  const max = Math.max(1, cols - HERO_W)
  const taken = [(await read($, hero)).x, ...(await read($, workers)).map(w => w.x)]
  const x = openSpot(taken, max)
  const w: Worker = {
    id,
    label,
    tier: tierOf(model),
    state: 'running',
    action: 'walk',
    x,
    dir: x > max / 2 ? -1 : 1,
    steps: 0,
  }
  workerBeatAt.set(id, await $.clock.now())
  await update($, workers, list => [...list.filter(x => x.id !== id), w])
  await glanceAt($, x >= taken[0]! ? 1 : -1)
  ensureTimer($)
}

async function workerBeat($: EngineInterface, id: string, action: Action, isError: boolean) {
  const now = await $.clock.now()
  workerBeatAt.set(id, now)
  if (isError) workerTripUntil.set(id, now + TRIP_MS)
  await update($, workers, list =>
    list.map(w => (w.id === id && w.state === 'running' ? { ...w, action, steps: w.steps + (isError ? 0 : 1) } : w)),
  )
}

/** A main-thread beat: action and caption, unless Claude is waiting on the user. */
const POSES = new Set<Action>(['read', 'dig', 'sneak', 'run', 'fly', 'carry', 'cover'])

async function heroBeat($: EngineInterface, b: Pick<Hero, 'action' | 'caption'>, step = 1, mood?: Emote) {
  const now = await $.clock.now()
  lastCallAt = now
  await update($, hero, (cur): Hero => {
    if (cur.mode !== 'working') return cur
    const emote = mood ?? (cur.emote === 'think' ? null : cur.emote)
    return {
      ...cur,
      ...b,
      steps: cur.steps + step,
      emote,
      emoteUntil: mood ? now + MOOD_MS : cur.emoteUntil,
      last: POSES.has(b.action) ? b.action : cur.last,
    }
  })
}

async function begin($: EngineInterface, text = '') {
  const now = await $.clock.now()
  const d = new Date(now)
  startedAt = now
  lastCallAt = now
  heroCalls = 0
  tripUntil = 0
  best = 0
  errStreak = 0
  alertAt = null
  const mood = moodOf(text)
  await update($, combo, () => 0)
  await update($, alert, () => null)
  await update($, hero, (cur): Hero => ({
    ...cur,
    mode: 'working',
    action: 'walk',
    caption: startCaption({ mood, woke: cur.action === 'sleep', holiday: holidayNow(d), hour: d.getHours() }),
    scene: cur.mode === 'idle' ? (cur.scene + 1) % SCENE_COUNT : cur.scene,
    steps: 0,
    since: now,
    emote: mood === 'thanks' ? 'smitten' : mood === 'scold' ? 'sheepish' : null,
    emoteUntil: now + MOOD_MS,
    // Scolded, Claude can't quite look you in the eye.
    glance: mood === 'scold' ? -1 : cur.glance,
    glanceUntil: mood === 'scold' ? now + MOOD_MS : cur.glanceUntil,
  }))
  ensureTimer($)
}

async function close($: EngineInterface, caption: string, action: Action = 'cheer') {
  const now = await $.clock.now()
  await update($, alert, () => null)
  await update($, hero, (cur): Hero => ({ ...cur, mode: 'ending', action, caption, since: now, emote: null }))
  ensureTimer($)
}

/** An MCP call: a puff in the server's own color as Claude warps a message off. */
async function onMcp($: EngineInterface, tool: string) {
  const server = tool.split('__')[1] ?? tool
  const x = (await read($, hero)).x
  await addFx($, 'warp', x)
  await update($, fx, list => list.map(f => (f.kind === 'warp' && f.id === fxId ? { ...f, color: warpColor(server) } : f)))
}

/** Test output: failures drop bugs into the scene, a green run lets Claude eat them. */
async function onTests($: EngineInterface, command: string, output: string, isMain: boolean) {
  const counts = testCounts(command, output)
  if (!counts) return
  const had = await read($, bugs)
  if (counts.failed > 0) {
    const n = Math.min(counts.failed, 8)
    await update($, bugs, () => n)
    if (isMain) {
      await heroBeat(
        $,
        {
          action: 'trip',
          caption: tr(
            `${counts.failed} bug${counts.failed === 1 ? '' : 's'} crawl out of the test run`,
            `테스트에서 버그 ${counts.failed}마리가 기어 나와요`,
          ),
        },
        0,
      )
    }
    tripUntil = (await $.clock.now()) + TRIP_MS
  } else if (counts.passed > 0 && had > 0) {
    if (isMain) {
      await heroBeat(
        $,
        {
          action: 'cheer',
          caption: tr(
            `Claude eats all ${had} bug${had === 1 ? '' : 's'}. Tests are green.`,
            `Claude가 버그 ${had}마리를 모두 먹어치워요. 테스트 초록불!`,
          ),
        },
        0,
      )
    }
    for (let n = 1; n <= had; n++) $.clock.after(n * 350, () => void update($, bugs, b => Math.max(0, b - 1)))
  }
}

/** TodoWrite: pending items are pellets; finishing one is a gobble. */
async function onTodos($: EngineInterface, input: Record<string, unknown>) {
  const list = Array.isArray(input.todos) ? (input.todos as Record<string, unknown>[]) : []
  if (list.length === 0) return
  const done = list.filter(t => t.status === 'completed')
  const prev = await read($, todos)
  const next = done.length === list.length ? null : { done: done.length, total: list.length }
  await update($, todos, () => next)
  if (prev && done.length > prev.done) {
    const last = done[done.length - 1]
    const what = typeof last?.content === 'string' ? last.content : tr('a task', '할 일')
    await heroBeat(
      $,
      {
        action: 'cheer',
        caption: next
          ? tr(`Claude gobbles a pellet: ${what}`, `Claude가 알갱이를 꿀꺽해요: ${what}`)
          : tr('Claude clears the whole quest list!', 'Claude가 퀘스트 목록을 싹 비워요!'),
      },
      0,
    )
  }
}

/** Clean calls in a row: a combo from 5, a crown at 10. */
async function onCombo($: EngineInterface) {
  let n = 0
  await update($, combo, c => (n = c + 1))
  best = Math.max(best, n)
  if (n === CROWN_AT) {
    await heroBeat(
      $,
      { action: 'cheer', caption: tr(`${CROWN_AT} clean calls in a row. Claude earns a crown!`, `연속 ${CROWN_AT}번 성공! Claude가 왕관을 얻어요!`) },
      0,
    )
  }
}

/** A fun Bash command went through: confetti, a paper plane, boxes. */
async function onEggs($: EngineInterface, eggs: readonly Egg[], command: string) {
  const x = (await read($, hero)).x
  for (const egg of eggs) {
    if (egg === 'commit') await addFx($, 'confetti', x)
    if (egg === 'push') await addFx($, 'plane', x)
    if (egg === 'install') await addFx($, 'boxes', Math.min(Math.max(0, cols - 4), x + HERO_W))
  }
  const done = eggs.map(egg => eggDone(egg, command)).filter(Boolean)
  if (done.length > 0) await heroBeat($, { action: 'cheer', caption: done.join('. ') }, 0)
}

function readLimits(rates: readonly { kind: string; percentUsed: number; resetsAt?: string }[]): Limit[] {
  return rates.map(r => ({ kind: limitLabel(r.kind), percent: Math.round(r.percentUsed), resetsAt: r.resetsAt }))
}

/** 'five_hour' and friends as the short names people know. */
function limitLabel(kind: string): string {
  if (/five|5.?h/i.test(kind)) return '5h'
  if (/seven|7.?d|week/i.test(kind)) return '7d'
  return kind.replace(/_/g, ' ')
}

function topLimit(list: readonly Limit[]): Limit | null {
  let top: Limit | null = null
  for (const l of list) if (!top || l.percent > top.percent) top = l
  return top
}

/** Restarts the tick at the new pace. */
async function setCalm($: EngineInterface, on: boolean) {
  isCalm = on
  await update($, calm, () => on)
  timer?.cancel()
  timer = undefined
  const cur = await read($, hero)
  if (cur.mode !== 'idle' || (await read($, workers)).length > 0) ensureTimer($)
}

function runDemo($: EngineInterface) {
  const at = (ms: number, fn: () => Promise<unknown> | unknown) => $.clock.after(ms, () => void fn())
  const steps: [number, string, Record<string, unknown>][] = [
    [1500, 'Grep', { pattern: 'register' }],
    [4000, 'Read', { file_path: '/src/hooks/register.tsx' }],
    [6500, 'Agent', { description: tr('Review the diff', 'diff 검토') }],
    [9000, 'Edit', { file_path: '/src/hooks/register.tsx' }],
    [15000, 'WebSearch', { query: tr('half block pixel art', '하프 블록 픽셀 아트') }],
  ]
  // It opens on an egg and ends with the hatchling growing up.
  demoGrowth = 'shell'
  at(0, async () => {
    const now = await $.clock.now()
    await update($, hero, (h): Hero => ({ ...h, action: 'hatch', caption: tr('An egg wobbles…', '알이 흔들흔들해요…'), since: now }))
  })
  at(1100, () => heroBeat($, { action: 'cheer', caption: tr('A Clawd hatches! Hello!', 'Clawd가 알을 깨고 나와요! 안녕!') }, 0))
  for (const [ms, tool, args] of steps) at(ms, () => heroBeat($, beat(tool, args, `demo${ms}`)))
  at(2000, () => onTodos($, { todos: [1, 2, 3, 4, 5].map(n => ({ content: tr(`Task ${n}`, `할 일 ${n}`), status: n === 1 ? 'in_progress' : 'pending' })) }))
  at(3000, () => update($, context, () => 74)) // rain
  at(11000, () => heroBeat($, { action: 'run', caption: tr('Claude runs off to run the test suite', 'Claude가 달려가요: 테스트 전체 실행') }))
  at(12000, () => onTests($, 'npm test', 'Tests: 3 failed, 9 passed', true))
  at(17500, () => update($, alert, () => tr('Claude needs you: allow Bash(rm -rf build)?', 'Claude가 부르고 있어요: Bash(rm -rf build) 허용할까요?')))
  at(21000, () => update($, alert, () => null))
  at(21500, () => onTests($, 'npm test', 'Tests: 0 failed, 12 passed', true))
  at(23000, () => onTodos($, { todos: [1, 2, 3, 4, 5].map(n => ({ content: tr(`Task ${n}`, `할 일 ${n}`), status: n <= 3 ? 'completed' : 'pending' })) }))
  at(24000, () => update($, context, () => 90)) // storm
  const crew: [string, string, string, Action[], 'done' | 'failed'][] = [
    ['demo-1', tr('Review the diff', 'diff 검토'), 'claude-sonnet-5-5', ['read', 'sneak', 'read'], 'done'],
    ['demo-2', tr('Judge the art', '그림 심사'), 'claude-opus-5-5', ['read', 'dig', 'run'], 'done'],
    ['demo-3', tr('Scout old toys', '옛 장난감 정찰'), 'claude-haiku-4-5', ['fly', 'fly', 'sneak'], 'failed'],
    ['demo-4', tr('Write the fable', '우화 쓰기'), 'claude-fable-5-1', ['dig', 'read', 'dig'], 'done'],
  ]
  crew.forEach(([id, label, model, acts, end], n) => {
    const t = 7000 + n * 800
    at(t, () => addWorker($, id, label, model))
    acts.forEach((a, i) => at(t + 1500 + i * 2500, () => workerBeat($, id, a, false)))
    at(t + 1500 + acts.length * 2500 + n * 600, () => finish($, id, end))
  })
  at(16500, () => heroBeat($, beat('mcp__claude_ai_Gmail__search_threads', {}, 'demo16500')))
  at(16500, () => onMcp($, 'mcp__claude_ai_Gmail__search_threads'))
  at(24500, () => maybeVisitor($, 'whale'))
  at(25000, () => heroBeat($, eggBeat('commit', tr('git commit -m "Teach Clawd new tricks"', 'git commit -m "Clawd에게 새 재주 가르치기"'))))
  at(26000, async () => {
    await heroBeat($, { action: 'cheer', caption: eggDone('commit', tr('git commit -m "Teach Clawd new tricks"', 'git commit -m "Clawd에게 새 재주 가르치기"')) ?? '' }, 0)
    await addFx($, 'confetti', (await read($, hero)).x)
  })
  at(27000, () => update($, context, () => 30)) // the storm passes before the big moment
  at(28000, async () => {
    demoGrowth = 'explorer'
    await close($, growCaption('explorer', null))
    await addFx($, 'confetti', (await read($, hero)).x)
  })
  at(46000, () => (demoGrowth = null))
  at(40000, () => update($, todos, () => null)) // the fable's quest list leaves with it
}

/** clawd-tales의 `session.start` 훅. 위 register가 등록한다. */
async function talesSessionStart($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  await $.command.register({
    name: 'tales',
    description: tr('Clawd tales: on, off, calm, lively, demo, hat, face, scarf', 'Clawd 이야기: on, off, calm, lively, demo, hat, face, scarf'),
  })
  sessionTokens = 0
  tokensSeen = 0
  const hatSaved = await $.store.get('hat')
  wornHat = HATS_TO_WEAR.includes(hatSaved as Hat) ? (hatSaved as Hat) : null
  const faceSaved = await $.store.get('face')
  wornFace = FACES_TO_WEAR.includes(faceSaved as Face) ? (faceSaved as Face) : null
  stats = readStats(await $.store.get('stats'))
  scarfOn = (await $.store.get('scarf')) !== false
  try {
    scarfKey = scarfColor(await $.session.root())
  } catch {
    scarfKey = null
  }
  const saved = await $.store.get('isOn')
  if (typeof saved === 'boolean') await update($, isOn, () => saved)
  const savedCalm = await $.store.get('calm')
  isCalm = savedCalm === true
  await update($, calm, () => isCalm)
  try {
    const usage = await $.session.usage()
    await update($, context, () => usage.context.percent ?? null)
    await update($, limits, () => readLimits(usage.rateLimits))
  } catch {
    // No usage yet: the first measure fills it in.
  }
  if ((await read($, shiny)) === null) {
    const lucky = Math.random() < SHINY_ODDS
    await update($, shiny, () => lucky)
    if (lucky) await $.ui.toast(tr('✨ A shiny Clawd appeared this session!', '✨ 이번 세션에 반짝이는 Clawd가 나타났어요!'))
  }
  if ((await read($, hero)).mode !== 'idle' || (await read($, workers)).length > 0) ensureTimer($)
  return next(e)
}

/** clawd-tales의 `command.run` tales 훅. 위 register가 등록한다. */
async function talesCommand($: EngineInterface, e: any): Promise<any> {
  const arg = (e.args ?? '').trim().toLowerCase()
  if (arg === 'off' || arg === 'on') {
    await update($, isOn, () => arg === 'on')
    await $.store.set('isOn', arg === 'on')
    return { text: tr(`Clawd tales ${arg}.`, `Clawd 이야기를 ${arg === 'on' ? '켰어요' : '껐어요'}.`) }
  }
  if (arg === 'calm' || arg === 'lively') {
    await setCalm($, arg === 'calm')
    await $.store.set('calm', arg === 'calm')
    return {
      text:
        arg === 'calm'
          ? tr('Calm: one beat a second, Claude stays put between tool calls.', '차분 모드: 1초에 한 박자, 도구 호출 사이엔 Claude가 제자리에 있어요.')
          : tr('Lively: 5 fps, wandering on.', '활기 모드: 초당 5프레임, Claude가 돌아다녀요.'),
    }
  }
  const [word, name] = arg.split(/\s+/)
  if (word === 'scarf') {
    if (name !== 'on' && name !== 'off') {
      return {
        text: tr(
          `The scarf is ${scarfOn ? 'on' : 'off'}. Use /tales scarf on|off.`,
          `스카프를 ${scarfOn ? '두르고' : '벗고'} 있어요. 바꾸기: /tales scarf on|off`,
        ),
      }
    }
    scarfOn = name === 'on'
    await $.store.set('scarf', scarfOn)
    return {
      text: scarfOn ? tr('Clawd wraps on the project scarf.', 'Clawd가 프로젝트 스카프를 둘러요.') : tr('Clawd takes off the scarf.', 'Clawd가 스카프를 벗어요.'),
    }
  }
  if (arg === 'demo') {
    await begin($)
    runDemo($)
    return {
      text: tr(
        'A short fable: helpers, bugs, pellets, weather and a call for you. About 45 seconds.',
        '짧은 우화 한 편: 도우미, 버그, 알갱이, 날씨, 그리고 당신을 부르는 호출까지. 약 45초예요.',
      ),
    }
  }
  if (word === 'hat' || word === 'face') {
    const list: readonly string[] = word === 'hat' ? HATS_TO_WEAR : FACES_TO_WEAR
    if (name === 'none' || name === 'off') {
      if (word === 'hat') wornHat = null
      else wornFace = null
      await $.store.set(word, null)
      return {
        text: tr(
          `Clawd takes off the ${word === 'hat' ? 'hat' : 'face gear'}.`,
          `Clawd가 ${word === 'hat' ? '모자를' : '얼굴 장식을'} 벗어요.`,
        ),
      }
    }
    if (!name || !list.includes(name)) {
      return {
        text: tr(`${word === 'hat' ? 'Hats' : 'Face'}: ${list.join(', ')}, none.`, `${word === 'hat' ? '모자' : '얼굴 장식'}: ${list.join(', ')}, none.`),
      }
    }
    if (word === 'hat') wornHat = name as Hat
    else wornFace = name as Face
    await $.store.set(word, name)
    return {
      text: tr(`Clawd puts on the ${name}.`, `Clawd가 ${word === 'hat' ? '모자를 써요' : '얼굴 장식을 달아요'}: ${name}`),
    }
  }
  // Unlisted: preview a holiday look (this load only). "auto" goes back to the calendar.
  if (word === 'holiday') {
    if (name === 'auto') holidayPick = null
    else if (name === 'off') holidayPick = 'none'
    else if (HOLIDAYS.includes(name as Holiday)) holidayPick = name as Holiday
    else return { text: tr(`Holidays: ${HOLIDAYS.join(', ')}, off, auto.`, `기념일: ${HOLIDAYS.join(', ')}, off, auto.`) }
    return { text: tr(`Holiday look: ${name}.`, `기념일 모습: ${name}`) }
  }
  const mode = (await read($, calm)) ? tr('calm', '차분') : tr('lively', '활기')
  const sparkle = (await read($, shiny)) ? tr(' ✨ Shiny Clawd this session.', ' ✨ 이번 세션은 반짝이는 Clawd예요.') : ''
  const growth = !stats
    ? tr(' Clawd has not hatched yet.', ' Clawd는 아직 알 속에 있어요.')
    : stats.form
      ? tr(` Clawd is a ${stats.form} (${stats.xp} tool calls).`, ` Clawd의 모습: ${FORM_KO[stats.form]} (도구 호출 ${stats.xp}번).`)
      : tr(
          ` Clawd is a hatchling: ${stats.xp}/${GROW_AT} tool calls to grow up.`,
          ` Clawd는 아직 아기예요: 도구 호출 ${stats.xp}/${GROW_AT}번이면 다 자라요.`,
        )
  return {
    text: tr(
      `Clawd tales is ${(await read($, isOn)) ? 'on' : 'off'} (${mode}).${growth}${sparkle} Use /tales on|off|calm|lively|demo, /tales hat <name>, /tales face <name>, /tales scarf on|off.`,
      `Clawd 이야기: ${(await read($, isOn)) ? '켜짐' : '꺼짐'} (${mode}).${growth}${sparkle} 사용법: /tales on|off|calm|lively|demo, /tales hat <이름>, /tales face <이름>, /tales scarf on|off`,
    ),
  }
}

// Plan mode only shows on the classic hook's input; a mid-turn shift+tab waits for the next prompt.
/** clawd-tales의 `classic.UserPromptSubmit` 훅. 위 register가 등록한다. */
async function talesClassicPromptSubmit($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  planMode = e.permission_mode === 'plan'
  return next(e)
}

/** clawd-tales의 `prompt.submit` 훅. 위 register가 등록한다. */
async function talesPromptSubmit($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  await begin($, e.text)
  maybeVisitor($)
  return next(e)
}

// A turn without a typed prompt (a background agent's notice, a continuation) raises no
// prompt.submit: without this Claude kept fishing and dozing through the whole turn.
/** clawd-tales의 `turn.start` 훅. 위 register가 등록한다. */
async function talesTurnStart($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  if ((await read($, hero)).mode !== 'working') await begin($, e.text)
  return next(e)
}

/** clawd-tales의 `session.measure` 훅. 위 register가 등록한다. */
async function talesSessionMeasure($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  await update($, context, () => e.context.percent ?? null)
  await update($, limits, () => readLimits(e.rateLimits))
  return next(e)
}

// A permission dialog is about to show (not just an "ask" verdict, which auto mode
// may settle by itself): Claude jumps and waves until the call goes on.
/** clawd-tales의 `classic.PermissionRequest` 훅. 위 register가 등록한다. */
async function talesPermissionRequest($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  const input = e.tool_input
  const cmd = typeof input === 'object' && input && 'command' in input ? String(input.command) : ''
  const what = cmd ? `${e.tool_name}(${cmd.length > 40 ? cmd.slice(0, 39) + '…' : cmd})` : e.tool_name
  alertAt = await $.clock.now()
  await update($, alert, () => tr(`Claude needs you: allow ${what}?`, `Claude가 부르고 있어요: ${what} 허용할까요?`))
  ensureTimer($)
  return next(e)
}

/** clawd-tales의 `agent.spawn` 훅. 위 register가 등록한다. */
async function talesAgentSpawn($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  const result = await next(e)
  if (!result.deny && result.agentId) await addWorker($, result.agentId, e.description || e.subagentType, result.model)
  return result
}

/** clawd-tales의 `tool.call` 훅. 위 register가 등록한다. */
async function talesToolCall($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  const seed = e.tool_use_id ?? e.tool
  const args = e as unknown as Record<string, unknown>
  const owner = e.agentId
  const command = e.tool === 'Bash' && typeof args.command === 'string' ? args.command : ''
  const eggs = owner ? [] : bashEggs(command)
  const egg = eggs[0] ? eggBeat(eggs[0], command) : null
  const b = egg ?? beat(e.tool, args, seed)
  const asks = e.tool === 'AskUserQuestion' || e.tool === 'ExitPlanMode'
  // A main-loop call means Claude is working, whatever the band missed.
  if (!owner && (await read($, hero)).mode !== 'working') await begin($)
  if (owner) await workerBeat($, owner, b.action, false)
  else {
    await heroBeat($, b, 1, egg?.emote)
    stats = countCall(stats ?? NEW_STATS, b.action)
  }
  if (eggs.includes('sl')) await addFx($, 'train', 0)
  if (asks) {
    alertAt = await $.clock.now()
    await update($, alert, () =>
      e.tool === 'ExitPlanMode'
        ? tr('Claude needs you: approve the plan?', 'Claude가 부르고 있어요: 계획을 승인할까요?')
        : tr('Claude needs you: a question is waiting', 'Claude가 부르고 있어요: 질문이 기다리고 있어요'),
    )
    ensureTimer($)
  }
  const delegates = !owner && e.tool === 'Agent'
  if (!owner && e.tool.startsWith('mcp__')) await onMcp($, e.tool)
  if (!owner) heroCalls += 1
  if (delegates) agentCalls += 1
  let result: Awaited<ReturnType<typeof next>>
  try {
    result = await next(e)
  } finally {
    if (!owner) {
      heroCalls = Math.max(0, heroCalls - 1)
      lastCallAt = await $.clock.now()
    }
    if (delegates) agentCalls = Math.max(0, agentCalls - 1)
  }
  if (e.tool === 'ExitPlanMode' && result.deny === undefined && !result.isError) planMode = false
  // Whatever it was waiting on, the call has gone ahead (or been refused).
  const waited = alertAt !== null && (await read($, alert)) ? (await $.clock.now()) - alertAt : null
  alertAt = null
  await update($, alert, () => null)
  if (waited !== null && waited < FAST_YES_MS && result.deny === undefined && !result.isError && !owner) {
    const now = await $.clock.now()
    await update($, hero, (cur): Hero => ({
      ...cur,
      emote: 'blush',
      emoteUntil: now + 3000,
      caption: tr('Claude beams at the quick yes', 'Claude가 재빠른 허락에 활짝 웃어요'),
    }))
  }
  if (result.deny !== undefined || result.isError) {
    if (owner) {
      await workerBeat($, owner, 'trip', true)
    } else {
      tripUntil = (await $.clock.now()) + TRIP_MS
      const missing = command && typeof result.text === 'string' ? notFound(result.text) : null
      errStreak += 1
      if (missing) {
        await heroBeat($, { action: 'trip', caption: tr(`Choo choo! “${missing}” isn't a command`, `칙칙폭폭! “${missing}” 명령은 없어요`) }, 0)
        await addFx($, 'train', 0)
      } else if (errStreak >= 3) {
        tripUntil = (await $.clock.now()) + FLIP_MS
        await heroBeat(
          $,
          {
            action: 'flip',
            caption: tr(
              `(╯°□°)╯︵ ┻━┻  ${errStreak} stumbles in a row. Claude flips the table`,
              `(╯°□°)╯︵ ┻━┻  ${errStreak}번 연속 삐끗. Claude가 판을 엎어요`,
            ),
          },
          0,
        )
      } else if (errStreak === 2) {
        tripUntil = (await $.clock.now()) + FLIP_MS
        await heroBeat($, { action: 'dizzy', caption: tr('Claude sees stars: two stumbles in a row', 'Claude 눈앞에 별이 번쩍여요: 두 번 연속 삐끗') }, 0)
      } else {
        await heroBeat($, { action: 'trip', caption: tripCaption(e.tool, seed) }, 0)
      }
      await update($, combo, () => 0)
    }
  } else if (!owner) {
    errStreak = 0
    await onCombo($)
    if (eggs.length > 0) await onEggs($, eggs, command)
  }
  if (result.deny === undefined && e.tool === 'Bash' && typeof result.text === 'string') {
    await onTests($, typeof args.command === 'string' ? args.command : '', result.text, !owner)
  }
  if (e.tool === 'TodoWrite' && !owner) await onTodos($, args)
  return result
}

// Compaction: Claude sweeps the stage. Between turns it gets the band to itself, then rests.
/** clawd-tales의 `session.compact` 훅. 위 register가 등록한다. */
async function talesSessionCompact($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  if (e.trigger === 'precompute' || e.agentId) return next(e)
  const cur = await read($, hero)
  const solo = cur.mode !== 'working'
  if (solo) {
    const now = await $.clock.now()
    await update($, hero, (h): Hero => ({
      ...h,
      mode: 'working',
      action: 'sweep',
      caption: tr('Claude sweeps up the old context…', 'Claude가 묵은 컨텍스트를 쓸어 담아요…'),
      since: now,
      emote: null,
    }))
    ensureTimer($)
  } else {
    await heroBeat($, { action: 'sweep', caption: tr('Claude sweeps up the old context…', 'Claude가 묵은 컨텍스트를 쓸어 담아요…') }, 0)
  }
  const result = await next(e)
  if (result.messages) {
    await update($, context, () => null) // the storm clears; the next measure says by how much
    if (solo) await close($, tr('Squeaky clean. The stage is swept.', '뽀득뽀득 깨끗해요. 무대를 다 쓸었어요.'))
    else await heroBeat($, { action: 'cheer', caption: tr('Squeaky clean. Back to work.', '뽀득뽀득 깨끗해요. 다시 일해요.') }, 0)
  } else if (solo) {
    await update($, hero, (h): Hero => ({ ...h, mode: 'idle' }))
  }
  return result
}

// A session opens: a fresh one gets Clawd dropping in, a resumed one a wave hello.
/** clawd-tales의 `classic.SessionStart` 훅. 위 register가 등록한다. */
async function talesClassicSessionStart($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  const result = await next(e)
  // The very first session: an egg instead of the drop-in.
  const unhatched = e.source === 'startup' && !readStats(await $.store.get('stats'))
  if (unhatched && (await read($, hero)).mode === 'idle') {
    stats = stats ?? { ...NEW_STATS }
    await $.store.set('stats', stats)
    const now = await $.clock.now()
    await update($, hero, (h): Hero => ({
      ...h,
      action: 'hatch',
      caption: tr('An egg wobbles…', '알이 흔들흔들해요…'),
      mode: 'ending',
      since: now,
      emote: null,
    }))
    $.clock.after(HATCH_MS, async () => {
      const at = await $.clock.now()
      await update($, hero, (h): Hero =>
        h.action === 'hatch' ? { ...h, action: 'cheer', caption: tr('A Clawd hatches! Hello!', 'Clawd가 알을 깨고 나와요! 안녕!'), since: at } : h,
      )
    })
    ensureTimer($)
    return result
  }
  const entrance: Pick<Hero, 'action' | 'caption'> | null =
    e.source === 'startup'
      ? { action: 'drop', caption: tr('Clawd drops in. Hello!', 'Clawd가 폴짝 내려와요. 안녕!') }
      : e.source === 'resume' || e.source === 'fork'
        ? { action: 'wave', caption: tr('Welcome back! Clawd waves hello.', '어서 와요! Clawd가 손을 흔들어 인사해요.') }
        : e.source === 'clear'
          ? { action: 'sweep', caption: tr('A fresh start. Clawd sweeps the stage.', '새 출발! Clawd가 무대를 쓸어요.') }
          : null
  if (entrance && (await read($, hero)).mode === 'idle') {
    const now = await $.clock.now()
    await update($, hero, (h): Hero => ({ ...h, ...entrance, mode: 'ending', since: now, emote: null }))
    ensureTimer($)
  }
  return result
}

/** clawd-tales의 `turn.complete` 훅. 위 register가 등록한다. */
async function talesTurnComplete($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  const u = e.usage
  if (u) sessionTokens += u.input_tokens + u.cache_creation_input_tokens + u.output_tokens
  // A helper's turn ends inside the main one: it counts toward tokens, not toward the ending.
  if (e.agentId) return next(e)
  const cur = await read($, hero)
  if (cur.mode === 'working') {
    const seconds = Math.round((e.durationMs ?? (await $.clock.now()) - startedAt) / 1000)
    const crossed = tokenMilestone(tokensSeen, sessionTokens)
    tokensSeen = sessionTokens
    const grown = stats ? formOf(stats) : null
    if (stats && grown && grown !== stats.form) {
      const was = stats.form
      stats = { ...stats, form: grown }
      await close($, growCaption(grown, was), 'cheer')
      await addFx($, 'confetti', cur.x)
    } else {
      await close($, ending(cur.steps, seconds, e.isAborted, best, crossed), endingAction(seconds, e.isAborted))
      if (crossed) await addFx($, 'confetti', cur.x)
    }
    if (stats) await $.store.set('stats', stats)
  }
  return next(e)
}

/** clawd-tales의 `ui.render` AbovePrompt 훅. 위 register가 등록한다. */
async function talesBand($: EngineInterface, e: any, next: (e: any) => Promise<any>): Promise<any> {
  if (e.surface === 'mobile' || e.props.hasSurvey) return next(e)
  // pixel-pals: tales 테마이고 숨김·띠 끄기·미리 보기가 아닐 때만. 나머지 테마는 장면 쪽이 띠를 그린다.
  if ((await read($, theme)) !== 'tales' || (await read($, preview)) !== null) return next(e)
  if ((await read($, isHidden)) || (await read($, isStageOff))) return next(e)
  const cur = await read($, hero)
  const crew = await read($, workers)
  const asking = await read($, alert)
  if ((cur.mode === 'idle' && crew.length === 0 && !asking) || !(await read($, isOn))) return next(e)
  const { Box, Text } = $.ui.resolve(e)
  cols = Math.max(HERO_W + 4, e.props.bodyColumns ?? 80)
  const rows = e.props.maxRows ?? 12
  const f = await read($, frame)
  const out = crew.filter(w => w.state === 'running').length || crew.length
  const running = crew.filter(w => w.state === 'running')
  let shown: Hero = cur
  // Turn over, or the main loop blocked on an Agent call: Claude idles while the helpers work.
  if (cur.mode === 'idle' || (cur.mode === 'working' && agentCalls > 0 && running.length > 0)) {
    shown = { ...cur, ...waitBeat(out, running[0]?.label ?? crew[0]?.label) }
  }
  if (asking) {
    const waited = alertAt !== null ? Math.floor(((await $.clock.now()) - alertAt) / 1000) : 0
    const nervous = waited * 1000 >= NERVOUS_MS
    shown = {
      ...shown,
      action: 'alert',
      caption: nervous ? tr(`${asking} (waiting ${waited}s)`, `${asking} (${waited}초째 기다리는 중)`) : asking,
      emote: nervous ? 'sweat' : shown.emote,
    }
  }
  // pixel-pals: 칸 수로 자른다(한글 캡션이 좁은 터미널에서 넘치지 않게)
  const fit = (s: string, room: number) => fitCells(s, Math.max(2, room))
  const caption = asking ? (
    <Text color="#e5534b" bold>
      {fit(shown.caption, cols)}
    </Text>
  ) : (
    <Text dimColor>{fit(shown.caption, cols)}</Text>
  )
  const below = await next(e)

  // Degradation ladder: full stage, then stage without sky or roster, then stage without its
  // caption (a fullscreen split pane leaves ~5 rows), then one line, then nothing. A call for
  // the person keeps its caption and gives up stage instead.
  if (rows < 1) return below
  const captionRows = asking || rows >= 6 ? 1 : 0
  const room = rows - captionRows
  if (room < 4 || cols < 30) {
    return (
      <Box flexDirection="column">
        <Box flexDirection="row">
          <Text color={asking ? '#e5534b' : '#d77757'}>{`${glyph(shown.action, f)} `}</Text>
          {caption}
        </Box>
        {below}
      </Box>
    )
  }

  const task = await read($, todos)
  const now = await $.clock.now()
  const day = new Date(now)
  const holiday = holidayNow(day)
  const hour = day.getHours()
  const streak = await read($, combo)
  const holidayHat: Hat | null = holiday === 'halloween' ? 'witch' : holiday === 'christmas' ? 'santa' : holiday === 'newyear' ? 'party' : null
  const longHaul = cur.mode === 'working' && now - startedAt >= HARDHAT_MS
  const hat: Hat | null =
    streak >= CROWN_AT
      ? 'crown'
      : (wornHat ??
        (planMode ? 'wizard' : null) ??
        holidayHat ??
        (longHaul ? 'hardhat' : null) ??
        (isLate(hour) ? 'nightcap' : null) ??
        (demoGrowth === 'shell' ? 'shell' : demoGrowth ? FORM_HAT[demoGrowth] : null) ??
        (stats?.form ? FORM_HAT[stats.form] : stats ? 'shell' : null))
  const extras = {
    weather: weatherOf(await read($, context)),
    bugs: await read($, bugs),
    todos: task,
    now,
    sky: skyOf(hour),
    holiday,
    fireworks: holiday === 'newyear' && isMidnightNewYear(day),
    hat,
    shiny: (await read($, shiny)) === true,
    late: isLate(hour),
    fx: await read($, fx),
    // Earned the crown this turn: shades on, the cool kind.
    face: wornFace ?? (best >= CROWN_AT ? 'shades' : null),
    tie: running.length >= TIE_AT,
    scarf: scarfOn ? scarfKey : null,
  }
  const all = lines(stage(shown, crew, f, cols, extras))
  // Standing Claude reaches the second line; only the alert crop cuts into him.
  const stageLines = all.slice(rows >= 8 ? 0 : Math.min(2, Math.max(1, all.length - room)))
  const ctx = await read($, context)
  const gauges = [
    ...(ctx === null ? [] : [{ label: 'ctx', percent: Math.round(ctx) }]),
    ...(await read($, limits)).map(l => ({ label: l.kind, percent: l.percent })),
  ]
  const tone = (p: number) => (p >= 95 ? '#e5534b' : p >= 80 ? '#e0b84c' : undefined)
  const hasRoom = rows >= stageLines.length + captionRows + 1
  const roster =
    !hasRoom || (crew.length === 0 && !task && gauges.length === 0 && streak < COMBO_AT) ? null : (
      // pixel-pals: 한 줄로 두고 넘치면 끝을 자른다(도우미가 많으면 게이지가 두 줄로 접히던 것)
      <Text wrap="truncate-end">
        {gauges.map((g, n) => (
          <Text color={tone(g.percent)} dimColor={!tone(g.percent)}>
            {`${n ? ' · ' : ''}${g.label} ${g.percent}%`}
          </Text>
        ))}
        {gauges.length > 0 && (task || crew.length > 0 || streak >= COMBO_AT) ? <Text dimColor>{'   '}</Text> : null}
        {streak >= COMBO_AT ? (
          <Text color="#e0b84c" bold>
            {tr(`×${streak} combo${streak >= CROWN_AT ? ' 👑' : ''}  `, `×${streak} 콤보${streak >= CROWN_AT ? ' 👑' : ''}  `)}
          </Text>
        ) : null}
        {task ? <Text color="#f5d76e">{tr(`● ${task.done}/${task.total} tasks  `, `● ${task.done}/${task.total} 할 일  `)}</Text> : null}
        {crew.slice(0, 4).map(w => (
          <Text color={TIER_COLOR[w.state === 'failed' ? 'other' : w.tier]}>
            {`${w.state === 'running' ? '●' : w.state === 'failed' ? '✗' : '✓'} ${fit(w.label, Math.max(8, Math.floor(cols / 5) - 3))}  `}
          </Text>
        ))}
        {crew.length > 4 ? <Text dimColor>{`+${crew.length - 4}`}</Text> : null}
      </Text>
    )
  return (
    <Box flexDirection="column">
      {stageLines.map(line => (
        <Box flexDirection="row">
          {line.map(s => (
            <Text color={s.color} backgroundColor={s.backgroundColor}>
              {s.text}
            </Text>
          ))}
        </Box>
      ))}
      {captionRows ? caption : null}
      {roster}
      {below}
    </Box>
  )
}
