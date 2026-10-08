# Using mods safely

Mods run inside Claude Code with your permissions and without a sandbox. So it matters to know what a mod can do before you install it. This guide covers what a mod can reach, how to check a mod yourself before installing, k-mods' review criteria and access labels, the controls available to organization admins, and warning signs.

## Contents

- [Mods are not sandboxed](#mods-are-not-sandboxed)
- [Check before you install](#check-before-you-install)
- [How k-mods reviews mods](#how-k-mods-reviews-mods)
- [Access labels](#access-labels)
- [How to read a k-mods mod page](#how-to-read-a-k-mods-mod-page)
- [Using mods at work or in an organization](#using-mods-at-work-or-in-an-organization)
- [Mods to be careful with](#mods-to-be-careful-with)

## Mods are not sandboxed

Once a mod is loaded, it can do these things.

- **Act as you on your computer**: Read and write files anywhere your account can reach, run programs, and send network requests.
- **Read your secrets**: Read environment variables and settings files, including any API keys in them.
- **See your session**: See every prompt you send and every tool Claude calls.
- **Change your session**: Rewrite prompts or tool calls, send prompts as if you typed them, or send messages to your other sessions.
- **Act without asking**: Approve tool calls before the user is even asked.
- **Use your quota**: Call models with your plan or API key.

Even with [sandboxing](https://code.claude.com/docs/en/sandboxing) turned on, mods are not affected. The sandbox isolates only the Bash commands Claude runs, and processes a mod starts itself run outside the sandbox.

A mod that approves tool calls can also approve calls that an `ask` rule would prompt for, or that your `PreToolUse` hook blocked. Going further, for an **individual user with no managed settings who is not logged in with a Team or Enterprise plan**, the built-in guard (`sec-default@builtin`) is not loaded at all, so a mod can even override and approve calls you blocked with `deny` rules. However, a mod **cannot change Claude Code's permission confirmation dialog itself.** It cannot control what is shown to the user. (Official docs: [Extend permissions with hooks](https://code.claude.com/docs/en/permissions#extend-permissions-with-hooks))

Official docs: [Decide whether to trust a mod](https://code.claude.com/docs/en/plugins/mods/overview#decide-whether-to-trust-a-mod), [Know what happens by default](https://code.claude.com/docs/en/plugins/mods/admin#know-what-happens-by-default)

## Check before you install

Before installing straight from a marketplace, you can see which events a mod receives and which APIs it calls, without running it. Clone the repository, then run this in the shell.

```bash
claude plugin validate ./some-mod
```

```text
  ❯ ./register.js hooks: session.start, tool.call, ui.render{component=Pane}
  ❯ ./register.js calls: $.fs.read, $.http.fetch, $.store.set, $.ui.open
```

Pay particular attention to these items on the `calls:` line.

| Call | Meaning |
| --- | --- |
| `$.fs.read`, `$.fs.write` | Reads or writes files anywhere your account can reach |
| `$.process.run`, `$.process.spawn` | Runs programs with your permissions |
| `$.http.fetch` | Sends network requests |
| `$.env.get`, `$.settings.read` | Reads environment variables and settings. They may contain API keys. The `env reads:` line in the output shows which variables. |
| `$.env.set` | Sets environment variables. This can affect every command and MCP server Claude Code runs afterward. The `env writes:` line shows which variables. |
| `$.mcp.call` | Calls a connected MCP server's tools, under the session's permission rules |
| `$.model.complete` | Calls a model with your plan or API key |
| `$.prompt.submit` | Sends a prompt on your behalf. It can look like you typed it |
| `$.session.send` | Sends a message that Claude in another session or subagent reads |

On the `hooks:` line, these matter. `tool.call` and `prompt.submit` mean the mod can see and change every tool call and prompt, and `session.append` means it can rewrite each line of the conversation before it is saved. `ui.render{component=AskUserQuestion}` means it can redraw the dialog where Claude asks the user a question, and `tool.check` means it can approve or deny a tool call before the permission prompt even appears.

Official docs: [Review what a mod can do](https://code.claude.com/docs/en/plugins/mods/admin#review-what-a-mod-can-do)

## How k-mods reviews mods

A mod listed in the k-mods catalog goes through these steps before you install it.

1. **License gate**: Code from a repository with no license is not listed without the author's permission.
2. **Commit pinning (`sha`)**: A mod taken as is from its source is pinned to the exact commit that was reviewed. Even if the source repository changes later, you get exactly the code that was reviewed. Updates are listed only after a new review.
3. **Static analysis + code reading**: We check that it passes `claude plugin validate`, and a person reads all of the code (`code-read`). If the mod has tests, we check that they pass (`unit-test`), and for mods that draw on screen, we run them once in a real session (`live-session`). The "Review method" section of each mod page shows which steps it went through.
4. **Access labels**: Based on the calls found by static analysis, we attach labels that describe what the mod does on your computer. See [Access labels](#access-labels) below.
5. **Re-review on update**: A mod with a new version goes through the same steps as the first time.
6. **Removal on author request**: If the original author asks for it to be taken down, it is removed from the catalog right away.

Official docs: [Plugin security and trust](https://code.claude.com/docs/en/plugins/security)

## Access labels

Each mod page has labels for the permissions found by static analysis. They are listed from the most dangerous.

| Label | Meaning |
| --- | --- |
| 🌐 Network | Talks to the internet or external servers through `$.http` or `$.mcp`. Conversation content may leave your machine, so check the destination |
| ⚙️ Runs programs | Runs programs on your computer through `$.process` |
| ✏️ File writes | Writes files through `$.fs.write` |
| 🤖 Model calls | Calls a model through `$.model`. Uses your quota |
| 🛡️ Tool-call gating | Can block a tool call or answer in its place through the `tool.call` or `tool.check` hooks |
| 💬 Prompt input | Puts in or sends a prompt on your behalf through `$.prompt.submit` or `$.prompt.fill` |
| 👀 Reads conversation | Reaches conversation content through the `prompt.submit`, `turn.complete`, or `session.append` hooks, screens that draw the conversation, or `$.session.messages` |
| 🔑 Env/settings reads | Reads `$.env` or `$.settings` |
| 📂 File reads | Reads files through the `$.fs.read` family |
| 📨 Session messages | Sends messages to other sessions through `$.session.send` |
| 🔊 Sound | Plays sound through `$.audio` |
| 🎨 Display only | Draws on screen and does none of the above |

**How to read the labels.** Almost every mod that draws on screen gets 👀 (Reads conversation). Even just receiving the signal that a turn ended brings in Claude's last answer. So 👀 alone is nothing to worry about. What you should really look at is the **combination**. Even with 👀, if there is no 🌐 (Network), ⚙️ (Runs programs), or 💬 (Prompt input), the mod has no way to send the conversation off your device. 💬 is checked together with them because it can be a detour: asking Claude to send things on its behalf. On the other hand, if 👀 and 🌐 appear together, be sure to check the "addresses in the code" on the mod page and the review notes to see what is sent where.

A mod can have several labels. If there are no labels, the mod only changes the display.

## How to read a k-mods mod page

On each mod page (or the details you see in `/plugin`), check these.

- **Kind**: `오리지널` (k-mods built it from scratch), `한국 수정판` (k-mods patched the original), `원본` (the original as is, with only the commit pinned), `묶음` (an install set that groups several other mods)
- **Access labels**: The labels in the table above
- **Review record**: Review date, the Claude Code version used for the review, the review method (`validate`/`code-read`/`unit-test`/`live-session`), and what was found during the review (network destinations, external programs run, and so on)
- **Source**: For a mod taken from upstream, the original author's repository and a link to the pinned commit. For a patched edition, what was changed from the original

If anything looks suspicious, run `claude plugin validate <cloned folder>` yourself once more before installing.

## Using mods at work or in an organization

In a company Claude Code environment, admins can set their own mod policy.

- **`allowManagedModsOnly`**: When on, mods that users installed do not load at all. Only mods the organization deployed and Claude Code's built-in mods run. k-mods mods may not load under this policy either.
- **`prependPlugins`/`appendPlugins`**: Set the order so the organization's policy mods run before (or after) user mods.
- **`sec-default@builtin`**: A built-in guard that loads before every mod the user installed, when managed settings exist or you are logged in with a Team or Enterprise plan. It keeps user mods from touching the organization-managed system prompt, the managed `CLAUDE.md`, and the tools and descriptions of managed MCP servers. It blocks nothing else.

If a particular k-mods mod does not show up in a company environment, first check whether these policies are the cause. How admins configure them is in the official docs.

Official docs: [Manage mods for your organization](https://code.claude.com/docs/en/plugins/mods/admin)

## Mods to be careful with

- The `calls:` line has `$.http.fetch` or `$.process.run`, but nothing in the description says why it is needed.
- The `hooks:` line has `prompt.submit` or `session.append`, but nothing says that conversation content is not sent off your device.
- It can approve or deny tool calls, like `tool.check`, but the source is private or you cannot tell which commit you are getting.
- It is code from a repository with no license at all.
- It takes a token or password but stores it in plain text, without marking it `sensitive` in `userConfig`.
- The description says it "only changes the display", but it carries a 🌐 Network or ⚙️ Runs programs label. When the description and the permissions do not match, it is better to read more of the code.

---

Learn more: [What are mods?](what-are-mods.en.md) · [Install guide](install.en.md) · [Make your own mod](make-your-own.en.md) · [Cheatsheet](cheatsheet.en.md) · [Contributing guide](../../CONTRIBUTING.md) · [README](../../README.en.md)
