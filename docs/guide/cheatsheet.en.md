# mods cheatsheet

File layout, events, APIs, render sites, and limits for mod development, condensed into tables. Descriptions are kept as short as possible, so read [What are mods?](what-are-mods.en.md) and [Make your own mod](make-your-own.en.md) first for the full context.

> This sheet is based on Claude Code **2.1.291**. Events and APIs can change between versions, so for exact definitions, the type declarations generated when you load a mod with `--plugin-dir` (`.claude-plugin/types/claude-code/index.d.ts`) take precedence over this document.

## Contents

- [File layout](#file-layout)
- [Hook function arguments](#hook-function-arguments)
- [Events](#events)
- [`$` API namespaces](#-api-namespaces)
- [Render sites](#render-sites)
- [Elements](#elements)
- [Limits](#limits)
- [Settings and environment variables](#settings-and-environment-variables)
- [Commands](#commands)

## File layout

| File | Required | Contents |
| --- | --- | --- |
| `.claude-plugin/plugin.json` | Yes | The plugin manifest. A mod needs no extra fields |
| `hooks/hooks.json` | Yes | `modules`: an array of hook module paths. List just one, like `"modules": ["./register.js"]`. Settings hooks can also go under the `hooks` key here |
| Hook module (for example `hooks/register.ts`) | Yes | The mod's entry point. An ES module that exports `register(on, options)`. Extensions: `.js`, `.mjs`, `.cjs`, `.jsx`, `.ts`, `.mts`, `.cts`, `.tsx` |
| `types/index.d.ts` (pointed to by `types` in the manifest) | Only when you use `$.state` or add namespaces to the mods API | `PluginState` values and extra namespace declarations |
| `*.test.ts` / `*.test.tsx` | No | Tests that `claude plugin test` runs |

`register` receives `on` and `options`. `options` holds the `userConfig` field values, with defaults filled in.

## Hook function arguments

You register with `on(eventName, matcher?, hook)`. The matcher is an optional filter on event fields, and `on` returns a registration that you can attach `.catch(handler)` to.

| Argument | Meaning |
| --- | --- |
| `$` | The mods API. Always write it fully expanded, as `$.namespace.method(...)` |
| `e` | The event input. It is deeply frozen, so you cannot edit it directly. To change it, copy it and pass the copy to `next` |
| `next(e)` | Calls the next handler (another mod, and last, Claude Code's own behavior). It resolves to the result |
| `next.signal` | An `AbortSignal` that aborts when the event is interrupted |
| `next.origin` | `{ plugin, tier }` for whoever fired this event. Claude Code itself is `{ plugin: 'engine', tier: 'core' }`, and a mod's `tier` is `prepend`/`user`/`append`/`builtin` |
| `next.budget` | This hook's time limit. `next.budget.ms` is the total limit and `next.budget.remainingMs` is the time left |
| `next.to(e, tier)` | Skips ahead to a later tier among `append`/`builtin`/`core`. Only mods in `prependPlugins` or `appendPlugins` can call it |
| `next.error`, `next.called` | Use only inside a `.catch` handler. `next.error.kind` is `throw` or `timeout`, and `next.called` tells whether the failed hook had called `next` |

## Events

In the "What it can return" column, `next(e)` passes the event through unchanged, `next({ ...e, text })` changes only that field and passes it through, and returning an object directly answers without calling `next`.

**Tools**

| Event | When | What it can return |
| --- | --- | --- |
| `tool.call` | Right before a tool runs | `next(e)`, `{ deny: reason }`, `{ result }` |
| `tool.check` | After `tool.call` and the `PreToolUse` hook, when deciding whether to run | `{ decision }` (`allow`/`ask`/`deny`) |
| `tool.describe` | When a tool's description is first sent to Claude, once per tool | `{ description, isDeferred? }` |

**Prompts and what Claude reads**

| Event | When | What it can return |
| --- | --- | --- |
| `prompt.submit` | When a prompt is submitted | `next({ ...e, text })`, `next({ ...e, context })`, `{ drop: reason }` |
| `prompt.fill`, `prompt.suggest` | Right before a draft or a dim suggestion goes into the prompt input | `next(e)` with the changed text |
| `prompt.edit` | When the user edits the prompt input | `next(e)` |
| `prompt.compose` | When the system prompt is built | `{ sections }` |
| `prompt.section` | Once for each named section of the system prompt | `{ text }`, or `{ text: null }` to omit it |
| `prompt.context` | Once per conversation: the first message and the context sent along with it | `{ blocks }` |
| `prompt.attachment` | When Claude Code adds a message of its own, such as a reminder | `{ text }`, or `{ text: null }` to omit it |
| `skill.prompt` | When a skill's text is expanded for Claude | `{ text }` |
| `attribution.text` | When the commit or PR attribution text is built | `{ text }` |

**Commands and settings**

| Event | When | What it can return |
| --- | --- | --- |
| `command.run` | Right before a command runs | `{ text }`, `{}`, `next(e)` |
| `command.describe` | The description for the command list, once per command | `{ description, argumentHint, isHidden }` |
| `config.set` | Right before a `/config` row value changes | `next({ ...e, value })`, `{ deny: reason }` |
| `config.describe` | Once per `/config` row | `{ label, description, isHidden }` |

**Turns**

| Event | When | What it can return |
| --- | --- | --- |
| `turn.start` | When a turn starts | `next(e)` |
| `turn.step` | Right before one request is sent to the model (several times if there are tool calls) | `yield* next(e)`, `next({ ...e, model })`, `next({ ...e, effort })` |
| `turn.complete` | When a turn ends | `next(e)`, or `{ text }` to show one line under the answer |

**Sessions**

| Event | When | What it can return |
| --- | --- | --- |
| `session.start` | Once per mod, before the first prompt (also runs after a reload, but not after `/clear`, `/resume`, or `/branch`) | `next(e)` |
| `session.end` | When the session ends, or on `/clear`, `/resume`, or `/branch` | `next(e)` |
| `session.compact` | Right before the conversation is compacted | `{ skip: reason }` |
| `session.receive`, `session.send` | When messages are exchanged with other agents or sessions | Receive: `{ consumed: reason }`. Send: `{ isDelivered: false, reason }` |
| `session.append` | Before each row that stays in the conversation is saved | `next({ ...e, message })` |
| `session.attach`, `session.detach` | When another app attaches to or detaches from the session | `next(e)` |
| `session.measure` | At the end of every turn, and when the plan limit percentage changes | `next(e)` |

**Subagents**

| Event | When | What it can return |
| --- | --- | --- |
| `agent.offer` | When subagent types are offered to Claude | `{ isOffered: false }` to hide one |
| `agent.spawn` | Right before a subagent or an agent-team teammate starts | Set the model with `next({ ...e, model })`, refuse with `{ deny: reason }` |

**Interface**

| Event | When |
| --- | --- |
| `ui.render` | Right before a render site is drawn |
| `ui.resolve` | When a mod loads, once per app, site, and mod |
| `ui.press`, `ui.input`, `ui.select` | When someone uses a `Button`/`Input`/`Select` that a mod drew |
| `ui.focus`, `ui.scroll` | Right before the focus or scroll position changes |
| `ui.close` | Right before a pane closes |
| `ui.message` | When a `Client` element sends data to the mod |
| `ui.fault` | When a `Client` that a mod drew fails to load, render, or run (2.1.289+) |

**Other mods**

| Event | When | What it can return |
| --- | --- | --- |
| `plugin.register` | Right before a hook module loads. `e.uses` holds the events, calls, environment variables, and state that mod uses | `{ refuse: reason }` |
| `engine.create` | When the mods API for this mod is created | An API with namespaces added or removed |

**Telemetry**

| Event | When | What it can return |
| --- | --- | --- |
| `telemetry.log`, `telemetry.mark` | When a usage record is written or feature use is marked. Installed mods must use the `{ to: 'collector' }` matcher | `next(e)`, `{ deny: reason }` |

**Settings hook events**: These look like `classic.<event>` (for example `classic.Stop`, `classic.PostToolUse`). `e` is exactly the JSON that a settings hook receives on stdin.

**mods API calls themselves**: Every mods API method is also an event named `namespace.method` (for example `fs.read`, `model.complete`, `ui.open`). An earlier mod can intercept it and answer with `next(e)`, `{ deny: reason }`, or `{ value }`.

## `$` API namespaces

| Namespace | Methods | Meaning |
| --- | --- | --- |
| `$.plugin` | `name`, `root` | This plugin's name and directory |
| `$.ui` | `resolve`, `invalidate`, `open`, `close`, `panes`, `focus`, `scroll`, `toast`, `status`, `log`, `notice`, `ask`, `copy`, `selection`, `blit` | Draw on screen, open and close panes, show toasts and questions |
| `$.command` | `register`, `run`, `list` | Add, run, and list `/command`s |
| `$.tool` | `register`, `call`, `check`, `list` | Add, call, check, and list tools for Claude to use |
| `$.agent` | `register`, `spawn`, `list` | Register, spawn, and list subagents |
| `$.model` | `complete`, `fork`, `classify` | Ask the model directly, outside the conversation |
| `$.prompt` | `submit`, `read`, `fill`, `suggest`, `compose` | Submit and read prompts, fill the prompt input |
| `$.turn` | `abort` | Abort the turn in progress |
| `$.session` | `messages`, `cwd`, `root`, `model`, `turns`, `id`, `repo`, `surfaces`, `usage`, `version`, `compact`, `send`, `append`, `authorize` | Read session info, send messages to other sessions |
| `$.config` | `list`, `set` | Read and write `/config` values |
| `$.settings` | `read` | Read settings files and managed policy |
| `$.env` | `get`, `set` | Read and write environment variables |
| `$.fs` | `read`, `write`, `list`, `exists`, `stat`, `ancestors` | Read, write, and list files |
| `$.store` | `get`, `set`, `delete`, `keys` | A key-value store shared by all sessions on this computer |
| `$.state` | `get`, `set` (+ `atom`, `read`, `update`, `derive`, `memberOf` imports) | Reactive state. Writing a value automatically redraws every screen that reads it |
| `$.clock` | `now`, `sleep`, `after`, `every` | Timers (use these instead of `setTimeout` and `setInterval`) |
| `$.http` | `fetch` | Network requests |
| `$.process` | `run`, `spawn` | Run programs |
| `$.mcp` | `call`, `connect` | Call tools on connected MCP servers |
| `$.audio` | `play`, `speak` | Play sound |
| `$.telemetry` | `log`, `mark` | Usage records (actually sent only when Claude Code or a built-in mod calls them) |

## Render sites

| Site | `e.props` | `e.requestId` | Where it is drawn |
| --- | --- | --- | --- |
| `Pane` | `title`, `isFocused`, `bodyColumns`, `placement`, `scroll`, `view` | That pane's `id` | Terminal, desktop |
| `AbovePrompt` | `hasSurvey`, `isWorking`, `maxRows`, `bodyColumns`, `scroll`, `view` | Single instance | Terminal, desktop |
| `UserMessage` | `text`, `origin`, `isExpanded`, and others | Message id | Terminal, desktop |
| `AssistantMessage` | The answer text | Message id | Terminal, desktop |
| `ToolUse`, `ToolResult`, `ToolGroup` | Tool name, input, result | Tool call id | Terminal, desktop |
| `CommandOutput` | `command`, `text` | Message id | Terminal, desktop |
| `AskUserQuestion` | The question and choices | Tool call id | Terminal, desktop |
| `ToolProgress` | `kind` | Tool call id | Terminal |
| `Spinner` | `word`, `message`, `suffix`, `mode` | Agent id | Terminal, desktop |
| `TurnDuration` | `word`, `durationMs` | Message id | Terminal |
| `InfoNotice` | `text`, `command` | Message id | Terminal |
| `SessionMode` | `modes` | Single instance | Terminal, desktop |
| `PromptHint` | `isDraft`, `isWorking`, `hint` | Single instance | Terminal, desktop |

`e.viewport` holds `columns`, `rows`, and `isFullscreen` (absent before measurement). Size the width of a pane or band with `e.props.bodyColumns`, and the height of a docked pane with `e.props.scroll.bodyRows`.

## Elements

| Element | Main props | Terminal | Desktop |
| --- | --- | :-: | :-: |
| `Box` | `key`, flex layout, `gap`, `padding`, `margin`, `width`, `height`, `borderStyle`, `backgroundColor` | ✓ | ✓ |
| `Text` | `color`, `backgroundColor`, `bold`, `italic`, `underline`, `dimColor`, `inverse`, `wrap` | ✓ | ✓ |
| `Button` | `key`, `label`, `onPress`, `hotkey`, `plain`, `dimColor`, `autoFocus`, `action` | ✓ | ✓ |
| `Link` | `href`, `label` | ✓ | ✓ |
| `Code` | The code body (up to 10,000 characters) | ✓ | ✓ |
| `Markdown` | `text` (up to 10,000 characters), `key`, `dimColor`, `onLinkPress` | ✓ | ✓ |
| `Input` | `key`, `label`, `placeholder`, `value`, `submitLabel`, `onSubmit`, `onInput`, `autoFocus` | ✓ | ✓ |
| `Select` | `key`, `label`, `options`, `value`, `onSelect`, `autoFocus` | ✓ | ✓ |
| `Svg` | An SVG document (up to 131,072 characters) | | ✓ |
| `Client` | `module`, `key`. An area drawn by a separate file (animation, pointer input) | ✓ | ✓ |
| `Raster` | `key`, `columns` (up to 512), `rows` (up to 256), `cells` | ✓ | |
| `Image` | PNG or RGBA bytes (up to 2 MiB) or a file path | ✓ | |

## Limits

| Item | Value |
| --- | --- |
| Run time of one hook (not counting time waiting on `next` and mods API calls) | 10 seconds; 50 ms for `prompt.edit` |
| Run time of a `.catch` handler | 1 second |
| The whole `session.end` hook | The SessionEnd hook budget (1.5 seconds by default) |
| `$.process.run` timeout | 30 seconds by default, 10 minutes at most |
| `maxTokens` of `$.model.complete` | 1024 by default, up to 64,000 or the model's limit |
| `$.fs.read`/`$.fs.write` | 4 MiB per file |
| One `Text` child string | 10,000 characters |
| `$.store` | 4 MiB of JSON in total |
| `$.session.messages()` | The latest 4,096 entries |
| `$.ui.invalidate('ui.render')` redraws | Limited to 10 per second (30 for visible panes, expanded bands, and hint lines in the terminal). Faster calls are merged |
| `$.ui.toast` | Shown for 4 seconds by default |
| A pane opened without a user request | Shown from 144 columns in the terminal, or from 110 columns if it has been opened before |
| Names of commands, tools, subagents, and panes | English letters, digits, `_`, and `-`, up to 64 characters |
| One `claude plugin test` test | 5 seconds by default |

## Settings and environment variables

| Name | Where | Meaning |
| --- | --- | --- |
| `CLAUDE_CODE_PLUGIN_DIRS` | An environment variable, or `env` in `~/.claude/settings.json` | Loads plugin directories, like `--plugin-dir` |
| `CLAUDE_CODE_PLUGIN_DIR_WATCH` | An environment variable | If `1`, non-interactive sessions also reload `--plugin-dir` mods on save |
| `prependPlugins`, `appendPlugins` | managed settings (individual users without managed settings can set them directly) | Pins the mod run order before or after user mods |
| `allowManagedModsOnly` | managed settings (built-in guard option) | Loads only organization mods and built-in mods |
| `allowModsToOverrideDenyRules` | managed settings (built-in guard option) | Lets user mods override `deny` rules and approve |
| `allowManagedHooksOnly` | managed settings | Blocks hooks and installed mods that are not the organization's |
| `disableAllHooks` | Any settings file | Turns off all hooks of installed mods (in your own settings, only your mods; in managed settings, all) |
| `disableSideloadFlags` | managed settings | Rejects `--plugin-dir` and `--plugin-url` at startup |
| `pluginConfigs` | User or managed settings | Stores a mod's `userConfig` values |

## Commands

| Command | What it does |
| --- | --- |
| `/plugin` | Shows the number of loaded mods under the tabs, like `N mods active · name` |
| `claude plugin validate <path>` | Reads the manifest and hook modules and prints errors, the events it receives (`hooks:`), and the APIs it calls (`calls:`). `--strict` turns warnings into errors, and `--json` gives a machine-readable report |
| `claude plugin test [path]` | Runs every file that ends in `.test.ts` or `.test.tsx`. Exits with code 1 on failure |
| `claude --plugin-dir <path>` | Loads a plugin directory for this one session only and reloads the hook module on every save. Can be repeated |
| `/reload-plugins` | Applies plugin changes to the running session right away |

---

Learn more: [What are mods?](what-are-mods.en.md) · [Install guide](install.en.md) · [Make your own mod](make-your-own.en.md) · [Safety guide](safety.en.md) · [README](../../README.en.md)
