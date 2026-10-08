# What are mods?

Mods are an official Claude Code feature, available from Claude Code 2.1.287. JavaScript or TypeScript code inside a plugin receives events such as tool calls and prompt submissions directly, then changes how Claude Code behaves or draws the screen. This guide covers what a mod is, what it can do, where it runs, how it differs from similar features, and how to turn it on and off.

## Contents

- [One-line definition](#one-line-definition)
- [How it works](#how-it-works)
- [What a mod can do](#what-a-mod-can-do)
- [Where mods run](#where-mods-run)
- [How mods differ from settings hooks, skills, and MCP](#how-mods-differ-from-settings-hooks-skills-and-mcp)
- [Mods built into Claude Code](#mods-built-into-claude-code)
- [Turn mods on or off](#turn-mods-on-or-off)
- [Version requirements](#version-requirements)

## One-line definition

A mod is **plugin code that runs directly inside Claude Code**. Whenever Claude Code is about to do something, such as a tool call, a prompt submission, or drawing the screen, an "event" fires. A mod receives that event in a function written in JavaScript or TypeScript (a hook), and it watches the event, changes it, or intercepts it and handles it instead.

> In one line: A mod is middleware between Claude Code events. It observes, rewrites, and answers.

Claude Code also calls the older approach, registered in settings files, "hooks". In the k-mods docs, "hook" always means a mod's handler. The older approach, which runs shell commands, HTTP requests, or prompts, is called a "settings hook".

Official docs: [Mods overview](https://code.claude.com/docs/en/plugins/mods/overview)

## How it works

A mod's code (the hooks module) exports a `register(on)` function, and inside it registers events with `on(eventName, handler)`. Claude Code passes three things to the handler.

- `$`: The mod API. It is the only way to reach the outside world, such as drawing the screen or reading files.
- `e`: The event data. It is read-only, so you can't edit it in place.
- `next`: A function that calls the next handler (another mod, or Claude Code's own behavior).

A handler processes the event in one of these three ways.

| Handling | What it does | Code |
| --- | --- | --- |
| Observe | Passes the event through unchanged | `return next(e)` |
| Rewrite | Changes the content and passes it through | `return next({ ...e, text: e.text.trim() })` |
| Answer | Answers directly without calling `next`, which ends the chain | `return { deny: 'reason' }` |

For example, a mod that raises a count on every tool call and shows it next to the spinner looks like this.

```javascript
let calls = 0

export function register(on) {
  on('tool.call', async ($, e, next) => {
    calls += 1
    $.ui.invalidate('ui.render') // Ask for the screen to be redrawn
    return next(e) // The tool runs as usual
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    return next({ ...e, props: { ...e.props, suffix: ' · 도구 ' + calls + '번' } })
  })
}
```

The first hook only observes `tool.call`. The second hook rewrites `ui.render` and appends the call count after the spinner text. When several mods hook the same event, they run in order, like a middleware chain. Registration order rules and failure handling are covered further in the [cheatsheet](cheatsheet.en.md) and [Make your own mod](make-your-own.en.md).

Official docs: [How a mod works](https://code.claude.com/docs/en/plugins/mods/overview#how-a-mod-works), [React to events](https://code.claude.com/docs/en/plugins/mods/events)

## What a mod can do

Settings hooks, skills, status lines, and MCP servers all run **outside** Claude Code. They only run scripts or give Claude text or tools. A mod runs **inside** Claude Code, so it can do these things.

1. **Draw on the screen**: Draw tabs, buttons, and input fields in a pane next to the transcript or in the band above the prompt input (`AbovePrompt`).
2. **Redraw Claude Code's own screens**: Change or redraw things like tool call rows, the spinner, and the dialog Claude uses when it asks a question.
3. **Intercept tool calls and requests**: Pause a tool call to ask the user, answer immediately without running it, or send a request to a different model.
4. **Run your own code from a command**: Add a `/command` that runs immediately, without a Claude turn. It can run even while Claude is working.
5. **Share data between hooks**: Hooks in one mod share the variables of the same file. For example, one hook counts tool calls and another shows that value on screen.

Official docs: [What a mod can do](https://code.claude.com/docs/en/plugins/mods/overview#what-a-mod-can-do)

## Where mods run

A mod's hooks run in every session where the plugin loads. But **drawing features** only show up in the terminal and the desktop app.

| Environment | Hooks run | Display shown |
| --- | :-: | :-: |
| Terminal (`claude`), editor-integrated terminals, JetBrains plugin | Yes | Shown |
| Desktop app Code tab (except WSL sessions) | Yes | Shown (except some terminal-only elements) |
| Desktop app WSL session | No (plugins don't work in WSL at all) | Not shown |
| VS Code extension chat panel | Yes | Not shown |
| `claude -p`, Agent SDK | Yes | Not shown |
| Remote Control from claude.ai or the mobile app | Yes (in the session on your computer) | Shown only in the terminal on your computer |
| Cloud sessions | Only when the plugin reaches the cloud session | Not shown |

A mod that draws on screen should check which app it is running in. Where it can't draw, it should fall back to a transcript line or the text of a command reply.

Official docs: [Where mods run](https://code.claude.com/docs/en/plugins/mods/overview#where-mods-run)

## How mods differ from settings hooks, skills, and MCP

| | mod | settings hook | skill | MCP server |
| --- | --- | --- | --- | --- |
| What it is | A plugin function that runs directly inside the Claude Code process | A shell command, HTTP request, or prompt that Claude Code runs on lifecycle events | A `SKILL.md` with instructions Claude reads | An external process or service that gives Claude tools |
| What it can change | Tool calls, prompts, commands, turns, what is drawn on screen | Whether an event proceeds, the arguments and results of tool calls, the context added for Claude | What Claude knows and does | The tools Claude can use |
| Can it draw on screen? | Yes | No | No | No |
| What you build it with | JavaScript or TypeScript | A script plus a `settings.json` entry | Markdown | A server in any language |
| When to choose it | When you need a pane or a band above the prompt, a custom command, or to change the event itself | When an existing script is enough to block, allow, or just log an event | When you keep pasting the same instructions | When Claude needs to reach an external system |

A single plugin can contain a mod, a skill, and an MCP server at once. k-mods' `mod-store` is an example: a mod with both a command (`/k-mods`) and screen drawing.

Official docs: [Compare mods, settings hooks, skills, and MCP servers](https://code.claude.com/docs/en/plugins/mods/overview#compare-mods-settings-hooks-skills-and-mcp-servers)

## Mods built into Claude Code

Some of Claude Code's own features are also built as mods. You can see them under **Built-in** on the `/plugin` → **Installed** tab. They can't be updated or deleted, but you can turn them off.

| Name shown in `/plugin` | What it does | How to turn it off |
| --- | --- | --- |
| `cc-plugin-agents-md` | Loads `AGENTS.md` as project instructions | Turn it off in `/plugin`, or change the setting for which instruction file to use |
| `cc-plugin-diff` | Handles the `/diff` command and its pane | If you turn it off in `/plugin`, `/diff` works as Claude Code's default version |
| `cc-plugin-plugin-authoring` | Provides the `plugin-authoring` skill for writing mods | Turn it off in `/plugin` |
| `cc-plugin-sec-default` | Protects organization-managed settings from mods the user installed | Users can't turn it off. Admins set the order in managed settings |
| `cc-plugin-telemetry` | Sends usage records for Claude Code and the built-in mods | Turn it off in `/plugin`, or turn off analytics itself (`DISABLE_TELEMETRY` and similar) |
| `cc-plugin-you-should-know` | A helper agent that points out things that are easy to miss when work runs long | Off by default. Turn it on and off in `/plugin` |

The sources of `diff`, `agents-md`, `sec-default`, and `telemetry`, tests included, are public in the [mods directory of the claude-code repository](https://github.com/anthropics/claude-code/tree/main/mods). They are a good reference for what real mod code looks like.

Official docs: [Mods built into Claude Code](https://code.claude.com/docs/en/plugins/mods/overview#mods-built-into-claude-code)

## Turn mods on or off

The method depends on how much you want to turn off.

- **One mod**: Disable or delete it in `/plugin` → **Installed** tab.
- **All mods for this session**: Start with `claude --safe-mode`. Other customizations turn off too.
- **All mods you installed, in every session**: Set `"disableAllHooks": true` in `~/.claude/settings.json`. Settings hooks and custom status lines turn off too. Only what your organization manages keeps running.

If you belong to an organization, an admin can also restrict mod loading itself with managed settings. Details are in the [Safety guide](safety.en.md).

> If you set `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` during early access, remove it. Claude Code 2.1.287 and later ignore this variable, so setting it to `0` does not turn mods off.

Official docs: [Turn mods on or off](https://code.claude.com/docs/en/plugins/mods/overview#turn-mods-on-or-off)

## Version requirements

- **Terminal**: Claude Code 2.1.287 or later. Check with `claude --version`.
- **Desktop app**: 2.1.286 or later. Enter `/status` in the Code tab and the version appears on the **Claude Code** line.

With an older version, a mod installs but does not load. See the [Install guide](install.en.md) for how to install and update.

Official docs: [Turn mods on or off](https://code.claude.com/docs/en/plugins/mods/overview#turn-mods-on-or-off)

---

Learn more: [Install guide](install.en.md) · [Make your own mod](make-your-own.en.md) · [Safety guide](safety.en.md) · [Cheatsheet](cheatsheet.en.md) · [README](../../README.en.md)
