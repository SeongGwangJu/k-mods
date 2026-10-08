# Make your own mod

There are two ways to make a mod. You can ask Claude in plain language, or you can write the code yourself. This guide covers both, and ends with the steps for adding a finished mod to k-mods.

## Contents

- [Have Claude make it](#have-claude-make-it)
- [Build it yourself](#build-it-yourself)
  - [1. Create three files](#1-create-three-files)
  - [2. Write the code](#2-write-the-code)
  - [3. Load it and try it](#3-load-it-and-try-it)
  - [4. Type declarations and validate](#4-type-declarations-and-validate)
  - [5. Static analysis rules](#5-static-analysis-rules)
  - [6. Write tests](#6-write-tests)
  - [7. Storing state: variable vs state vs store](#7-storing-state-variable-vs-state-vs-store)
- [Submit to k-mods](#submit-to-k-mods)

## Have Claude make it

This is the fastest way. In a session, just say what you want.

```
Make a mod that shows the current git branch above the prompt input
```

Claude writes the mod using the built-in skill `plugin-authoring`. This skill knows which events and APIs are available in the Claude Code version you are using and where the mod has to be saved. To invoke the skill yourself, enter `/plugin-authoring` in a session.

The flow goes like this.

1. **Where it writes**: Claude writes files to `~/.claude/dev-mods/<session ID>/<mod name>/`. In the `default` and `acceptEdits` permission modes, `~/.claude` is a protected path, so it asks for approval every time it saves a file.
2. **Hot reload approval**: When the first file is saved, it asks whether to turn on hot reload in this session. If you choose **Enable for this session only**, the mods in this session's `dev-mods` folder load when a turn ends, and reload at the end of every turn where a file changed. This choice persists when you resume the session. If you choose **Not now**, the files stay, and they load the next time that session is restarted.
3. **Check that it loaded**: In `/plugin` → **Installed** tab, check that the mod appears. You can turn it off there too.
4. **Try it and fix it**: If it did not work as you wanted, tell Claude what to change. When the turn that changed the file ends, you can try again right away.

In some sessions a mod that Claude wrote does not load at all: `claude -p` runs or `dontAsk` mode, where nobody can approve; workspaces you have not trusted yet; and cases where mods themselves are turned off by `--safe-mode`, `--bare`, `disableAllHooks`, or organization policy.

**To keep using the mod**: The `dev-mods` folder belongs only to the session that created it, and it is deleted automatically after `cleanupPeriodDays` (30 days by default). To keep the mod, copy the folder somewhere you manage.

```bash
cp -r ~/.claude/dev-mods/<session ID>/git-branch ~/mods/git-branch
```

After copying, load it with `--plugin-dir` as described in [Build it yourself](#build-it-yourself), or publish it through a marketplace to use it with other people.

Official docs: [Ask Claude for a mod](https://code.claude.com/docs/en/plugins/mods/create#ask-claude-for-a-mod)

## Build it yourself

If you want to learn how the code works, writing it yourself is fastest. You need no Node.js or bundler. Claude Code reads `.ts` and `.js` files directly.

Here we build a mod called `tool-tally`. It counts each tool use and shows the count next to the spinner, like `· 도구 3번` (Korean for "tool 3 times"), and when you enter `/tally`, it tells you the count so far.

### 1. Create three files

```bash
mkdir -p tool-tally/.claude-plugin tool-tally/hooks
```

`tool-tally/.claude-plugin/plugin.json` is the plugin's manifest.

```json
{
  "name": "tool-tally",
  "version": "0.1.0",
  "description": "Counts tool calls, shows the count next to the spinner, and reports it with /tally",
  "author": { "name": "Your name" }
}
```

`tool-tally/hooks/hooks.json` tells Claude Code where the code file is. With this `modules` key, the plugin becomes a mod.

```json
{
  "modules": ["./register.ts"]
}
```

### 2. Write the code

`tool-tally/hooks/register.ts` is the hooks module. If it exports a `register` function, Claude Code calls it once when it loads the mod.

```typescript
import type { On } from 'claude-code'

// The count. The hooks below share it
let calls = 0

export function register(on: On): void {
  // Once when the session starts: register the /tally command
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'tally', description: 'Show how many tools have been used so far' })
    return next(e)
  })

  // Every time Claude is about to use a tool
  on('tool.call', async ($, e, next) => {
    calls += 1
    $.ui.invalidate('ui.render') // Redraw the screen so the new number shows
    return next(e) // The tool runs as usual
  })

  // Only when /tally is entered
  on('command.run', { command: 'tally' }, async () => {
    return { text: '지금까지 도구를 ' + calls + '번 썼어요' }
  })

  // Every time the spinner is drawn
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    return next({ ...e, props: { ...e.props, suffix: ' · 도구 ' + calls + '번' } })
  })
}
```

The four hooks do this.

- `session.start`: Runs once before the first turn of the session, and again every time the module reloads. Adds the `/tally` command.
- `tool.call`: Runs right before each time Claude uses a tool. Raises the count and asks for the screen to be redrawn.
- `command.run`: Runs only when `/tally` is entered. It answers directly without calling `next`, which is the "answer" mode.
- `ui.render`: Runs every time the spinner is drawn. It leaves Claude Code's spinner as it is and only appends the count after the word, which is the "rewrite" mode.

### 3. Load it and try it

`--plugin-dir` loads a plugin directory for this session only, without installing it.

```bash
claude --plugin-dir ./tool-tally
```

Ask it to use a few tools (for example `List the files here and read the README`), and the spinner text changes to something like `Thinking · 도구 2번…`. When it finishes, enter `/tally` and check that `tool-tally: 지금까지 도구를 2번 썼어요` appears.

With the session still open, change `' · 도구 '` ("tool") in `register.ts` to `' · 지금까지 '` ("so far") and save. After you save, a `tool-tally` reloaded line appears in the transcript, and the next spinner shows the new text right away. This is hot reload.

Official docs: [Write a mod yourself](https://code.claude.com/docs/en/plugins/mods/create#write-a-mod-yourself)

### 4. Type declarations and validate

Every time you load or reload a mod with `--plugin-dir`, Claude Code writes type declarations that match your exact version under `tool-tally/.claude-plugin/types/`.

| Path | Contents |
| --- | --- |
| `claude-code/index.d.ts` | All events and their inputs and outputs, all mod API methods, and the elements each screen can draw |
| `claude-code-tools/index.d.ts` | Input and result types of the built-in tools (so you can narrow with `e.tool === 'Bash'`) |
| `claude-code-mcp/index.d.ts` | Input types of the MCP tools that were connected at the most recent save |
| `tsconfig.json` | Compile options for hook modules |

Editor autocomplete and type checking read these files. Events and APIs can change between versions, so these generated files are more accurate than any other document.

`claude plugin validate` shows how Claude Code reads your mod, without starting a session.

```bash
claude plugin validate ./tool-tally
```

```text
  ❯ ./register.ts hooks: session.start, tool.call, command.run{command=tally}, ui.render{component=Spinner}
  ❯ ./register.ts calls: $.command.register, $.ui.invalidate

✔ Validation passed
```

The `hooks:` line shows the events this module receives, with their matchers. If an event you intended is not on this line (usually a typo in the event name), that hook does not run. The `calls:` line shows every mod API this module calls. For a mod going into k-mods, `scripts/check.sh mods/<name>` runs `--strict` validate and the tests in one go.

Official docs: [Get type definitions for your version](https://code.claude.com/docs/en/plugins/mods/create#get-type-definitions-for-your-version), [Check what Claude Code reads from your mod](https://code.claude.com/docs/en/plugins/mods/create#check-what-claude-code-reads-from-your-mod)

### 5. Static analysis rules

Claude Code reads which events a mod receives and which APIs it calls without running the code. For that, your code has to follow a few rules. If you break them, `claude plugin validate` reports an error.

- **Write `$.namespace.method(...)` fully expanded**: You cannot put it in a variable like `const ui = $.ui`, destructure it, or access it with a computed name like `$[name]`. If you put `$.ui` in a variable, it fails with `$.ui is used as a value`.
- **Helper functions that take `$` must be functions declared at the top level of the same file**: You cannot pass `$` to closures, methods, or functions imported from another file. (`read` and `update` of `$.state` are exceptions.)
- **Event names are string literals**: Write them directly, like `on('tool.call', ...)`. Looping over event names with a variable or a loop fails.
- **Do not register the same event twice without a matcher**: An event with no matcher, like `session.start`, is registered only once per module.
- **Do not redeclare the name `on` inside `register`**: If you shadow `on` with a variable or parameter, it fails with `"on" is declared again (shadowed)`.
- **Imports are limited to relative paths inside the plugin and `claude-code`**: Dynamic `import()` and `require` are not allowed. Every file is an ES module.
- **No Node APIs, global `fetch`, or `setTimeout`**: Use `$.fs` for files, `$.http` for the network, and `$.clock` for timers.
- **(k-mods extra rule) Attach `.catch` to hooks that can block tool calls**: If a hook that can end the chain, such as `tool.call`, `tool.check`, or `prompt.submit`, fails, you must decide what happens with `.catch` to pass `--strict` validate. If the mod's job is to block, answer on the blocking side even when it fails (fail closed).

Official docs: [Follow these rules so that static analysis can find every hook and call](https://code.claude.com/docs/en/plugins/mods/create#check-what-claude-code-reads-from-your-mod)

### 6. Write tests

`claude plugin test` tests hooks with no session, no login, and no network. You import the test tools from `claude-code/testing`.

`tool-tally/tests/tool-tally.test.ts`:

```typescript
import { expect, test } from 'claude-code/testing'

test('/tally reports the number of tool calls received so far', async ($, on) => {
  // Answer tool calls in place of Claude Code (no real tool runs)
  on('tool.call', () => ({ result: 'ok' }))

  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await $.tool.call({ tool: 'Read', file_path: 'README.md' })

  const answer = await $.command.run({ command: 'tally', args: '' })
  expect(answer.text).toBe('지금까지 도구를 2번 썼어요')
})
```

```bash
claude plugin test
```

Run it in the `tool-tally` directory and the test names and whether they passed appear. For a mod going into k-mods, we recommend pulling pure logic (classification, format conversion, and so on) into functions that do not take `$` and verifying it with ordinary unit tests, and using `claude plugin test` only to check the flow of events.

Official docs: [Test a mod](https://code.claude.com/docs/en/plugins/mods/test)

### 7. Storing state: variable vs state vs store

Where you put a value decides how long it survives.

| Where it is stored | How long it survives | When to use it |
| --- | --- | --- |
| Module variable (`let calls = 0`) | Until the module reloads (resets on every save during development) | Values you can afford to lose, like `calls` in this tutorial |
| `$.state` | Until the session ends or you run `/clear`, `/resume`, or `/branch`. It survives reloads. | When a screen depends on the value and it must survive a reload. When you write a value, every screen that reads it redraws automatically (reactive). |
| `$.store` | Until you delete it, or until no session uses it for `cleanupPeriodDays` | Values that must still be there the next time you open a session, like settings and records. All sessions on this computer share one. |

Mixing all three is common. Detailed code examples (declaring a type for `$.state`, restoring a value after `/clear`, and so on) are in the official docs.

Official docs: [Keep state](https://code.claude.com/docs/en/plugins/mods/interface#keep-state)

## Submit to k-mods

When your mod is done, you can add it to the k-mods catalog. There are two ways: one that needs no code from you, and one where you register it yourself.

- **If you know a good mod**: You do not need to know code. Just open a [Suggest a mod](https://github.com/SeongGwangJu/k-mods/issues/new?template=suggest-mod.yml) issue.
- **If you want to register it yourself**: Send a PR that adds one `registry/<name>.json` file. Automated checks verify the install, static analysis, and license.

The detailed steps and rules for both paths are in the [Contributing guide](../../CONTRIBUTING.md).

---

Learn more: [What are mods?](what-are-mods.en.md) · [Install guide](install.en.md) · [Safety guide](safety.en.md) · [Cheatsheet](cheatsheet.en.md) · [Contributing guide](../../CONTRIBUTING.md) · [README](../../README.en.md)
