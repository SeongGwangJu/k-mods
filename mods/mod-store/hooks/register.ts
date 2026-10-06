import type { EngineInterface, On } from 'claude-code'

import { CATALOG, SELF_NAME } from './catalog'
import {
  type Banner,
  MARKETPLACE_ADD_COMMAND,
  MIN_CLAUDE_VERSION,
  errorBannerOf,
  firstVersionToken,
  installArgsFor,
  installedNamesFrom,
  isVersionAtLeast,
  messageOf,
  parseInstallOutcome,
  parseUninstallOutcome,
  uninstallArgsFor,
  visibleCatalog,
  widthTierOf,
} from './lib'
import { paneView, type StoreActions, type StoreModel } from './view'

const PANE_ID = 'k-mods-store'
const PANE_TITLE = 'k-mods 모드 상점'
const COMMAND_NAME = 'k-mods'

// ---------------------------------------------------------------------------
// 모듈 상태. 모듈이 새로 로드(핫 리로드)될 때까지만 유지된다 — CONTRIBUTING.md의
// "모듈 전역 변수" 수명과 같다. $.state를 쓰지 않는 이유: 패널을 쓰는 동안만
// 의미 있는 값들이라 세션을 넘어 지킬 필요가 없다.
// ---------------------------------------------------------------------------

let tab: StoreModel['tab'] = 'all'
let expanded: string | null = null
let installed = new Set<string>()
let busy = new Set<string>()
let banner: Banner = { kind: 'none' }
let justInstalled: string | null = null

const CATALOG_VISIBLE = visibleCatalog(CATALOG, SELF_NAME)

// ---------------------------------------------------------------------------
// $를 받는 도우미. 모두 이 파일(register.ts) 최상위에 선언했다 — mods API는
// 같은 파일 최상위 함수에만 넘길 수 있고, 클로저·다른 파일의 함수는 안 된다.
// ---------------------------------------------------------------------------

function redraw($: EngineInterface): void {
  $.ui.invalidate('ui.render')
}

/** PATH의 claude가 mods를 지원하는 2.1.287 이상인지 확인한다. */
async function checkCliVersion(
  $: EngineInterface,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const result = await $.process.run(['claude', '--version'], { timeoutMs: 10_000 })
    const version = firstVersionToken(result.stdout)
    if (version === null) {
      return { ok: false, message: 'PATH의 claude 명령에서 버전을 읽지 못했어요.' }
    }
    if (!isVersionAtLeast(version, MIN_CLAUDE_VERSION)) {
      return {
        ok: false,
        message: `PATH의 claude(${version})가 너무 오래됐어요. ${MIN_CLAUDE_VERSION} 이상이 필요해요.`,
      }
    }
    return { ok: true }
  } catch (error) {
    return { ok: false, message: `claude 명령을 실행하지 못했어요: ${messageOf(error)}` }
  }
}

/** enabledPlugins에서 설치 상태를 다시 읽는다. 패널을 열 때, 설치·제거 뒤에 부른다. */
async function refreshInstalled($: EngineInterface): Promise<void> {
  try {
    const settings = await $.settings.read()
    installed = installedNamesFrom(settings, CATALOG)
  } catch {
    // 설정을 못 읽으면 이전 상태를 그대로 둔다
  }
}

async function installMod($: EngineInterface, name: string): Promise<void> {
  if (busy.has(name)) return
  busy = new Set(busy).add(name)
  banner = { kind: 'none' }
  redraw($)

  try {
    const version = await checkCliVersion($)
    if (!version.ok) {
      banner = errorBannerOf(installArgsFor(name), version.message)
      return
    }

    const argv = installArgsFor(name)
    const result = await $.process.run(argv, { timeoutMs: 60_000 })
    const outcome = parseInstallOutcome(result)

    if (outcome.kind === 'marketplace-missing') {
      banner = { kind: 'no-marketplace', addCommand: MARKETPLACE_ADD_COMMAND }
    } else if (outcome.kind === 'failed') {
      banner = errorBannerOf(argv, outcome.message)
    } else {
      installed = new Set(installed).add(name)
      justInstalled = name
      $.ui.toast('설치했어요')
    }
  } catch (error) {
    banner = errorBannerOf(installArgsFor(name), messageOf(error))
  } finally {
    const nextBusy = new Set(busy)
    nextBusy.delete(name)
    busy = nextBusy
    redraw($)
  }
}

async function uninstallMod($: EngineInterface, name: string): Promise<void> {
  if (busy.has(name)) return
  busy = new Set(busy).add(name)
  banner = { kind: 'none' }
  redraw($)

  try {
    const version = await checkCliVersion($)
    if (!version.ok) {
      banner = errorBannerOf(uninstallArgsFor(name), version.message)
      return
    }

    const argv = uninstallArgsFor(name)
    const result = await $.process.run(argv, { timeoutMs: 60_000 })
    const outcome = parseUninstallOutcome(result)

    if (outcome.kind === 'failed') {
      banner = errorBannerOf(argv, outcome.message)
    } else {
      const nextInstalled = new Set(installed)
      nextInstalled.delete(name)
      installed = nextInstalled
      if (justInstalled === name) justInstalled = null
      $.ui.toast('제거했어요')
    }
  } catch (error) {
    banner = errorBannerOf(uninstallArgsFor(name), messageOf(error))
  } finally {
    const nextBusy = new Set(busy)
    nextBusy.delete(name)
    busy = nextBusy
    redraw($)
  }
}

/** 제거는 되돌리기 성가신 일이라 $.ui.ask로 한 번 확인한다. */
async function confirmAndUninstall($: EngineInterface, name: string): Promise<void> {
  let answer = '취소'
  try {
    answer = await $.ui.ask(`${name} 모드를 제거할까요?`, ['제거', '취소'])
  } catch {
    return
  }
  if (answer !== '제거') return
  await uninstallMod($, name)
}

async function applyReload($: EngineInterface): Promise<void> {
  try {
    await $.command.run({ command: 'reload-plugins', args: '' })
    justInstalled = null
    redraw($)
  } catch {
    $.ui.toast('자동 적용에 실패했어요. /reload-plugins 를 입력해 주세요.')
  }
}

async function copyToClipboard(
  $: EngineInterface,
  text: string,
  surface: Parameters<EngineInterface['ui']['copy']>[0]['surface'],
): Promise<void> {
  try {
    const result = await $.ui.copy({ text, surface })
    if (!result.isCopied) $.ui.toast('복사하지 못했어요. 직접 입력해 주세요.')
  } catch {
    $.ui.toast('복사하지 못했어요. 직접 입력해 주세요.')
  }
}

// ---------------------------------------------------------------------------
// register
// ---------------------------------------------------------------------------

export function register(on: On) {
  on('session.start', async ($, e, next) => {
    try {
      await $.command.register({
        name: COMMAND_NAME,
        description: 'k-mods 모드 상점을 열어요',
        immediate: true,
      })
    } catch {
      // 이름이 이미 다른 곳에서 쓰이고 있으면 조용히 넘어간다
    }

    try {
      const welcomed = await $.store.get('welcomed')
      if (welcomed !== true) {
        $.ui.toast('k-mods 설치 완료 · /k-mods 로 모드를 둘러보세요')
        await $.store.set('welcomed', true)
      }
    } catch {
      // 저장소를 못 읽어도 세션은 그대로 시작한다
    }

    return next(e)
  })

  on('command.run', { command: COMMAND_NAME }, async $ => {
    const panes = await $.ui.panes()
    const isOpen = panes.some(pane => pane.id === PANE_ID)

    if (isOpen) {
      await $.ui.close({ id: PANE_ID })
      return {}
    }

    await refreshInstalled($)
    await $.ui.open({ id: PANE_ID, title: PANE_TITLE, focus: true, closeOnEscape: true })
    return {}
  })

  on('ui.render', { component: 'Pane' }, async ($, e, next) => {
    if (e.requestId !== PANE_ID) return next(e)

    const { Box, Text, Button, Link } = $.ui.resolve(e)
    const tier = widthTierOf(e.props.bodyColumns)

    const model: StoreModel = { tab, expanded, installed, busy, banner, justInstalled, tier }

    const actions: StoreActions = {
      setTab: pickedTab => {
        tab = pickedTab
        redraw($)
      },
      toggleDetail: name => {
        expanded = expanded === name ? null : name
        redraw($)
      },
      // install/uninstall/applyReload/copyCommand는 Promise를 그대로 돌려준다:
      // 엔진과 테스트 둘 다 ui.press가 onPress의 반환값을 기다려 주므로, 눌렀을 때
      // 비동기 작업이 끝난 뒤의 상태를 바로 이어서 확인할 수 있다.
      install: name => installMod($, name),
      uninstall: name => confirmAndUninstall($, name),
      applyReload: () => applyReload($),
      copyCommand: (text, surface) => copyToClipboard($, text, surface),
      dismissBanner: () => {
        banner = { kind: 'none' }
        redraw($)
      },
    }

    return paneView({ Box, Text, Button, Link }, CATALOG_VISIBLE, model, actions)
  })
}
