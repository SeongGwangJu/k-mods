# Install guide

k-mods is a regular Claude Code plugin marketplace. So installing, updating, and uninstalling all work through Claude Code's `/plugin` command and the `claude plugin` shell commands. This guide covers, in order, checking your version, adding the marketplace, install scopes, using k-mods with teammates, and troubleshooting.

## Contents

- [Check your version](#check-your-version)
- [Add the marketplace](#add-the-marketplace)
- [Install](#install)
- [Install scope](#install-scope)
- [Disable and uninstall](#disable-and-uninstall)
- [Apply changes to the current session](#apply-changes-to-the-current-session)
- [Check installed mods](#check-installed-mods)
- [Set config values (userConfig)](#set-config-values-userconfig)
- [Keep mods up to date](#keep-mods-up-to-date)
- [Use with your team](#use-with-your-team)
- [Troubleshooting checklist](#troubleshooting-checklist)

## Check your version

A mod needs a minimum version to load.

- **Terminal**: Claude Code 2.1.287 or later. Check with `claude --version` in the shell.
- **Desktop app**: 2.1.286 or later. Enter `/status` in the Code tab and the version appears on the **Claude Code** line.

If your version is older, update Claude Code or the desktop app and try again.

Official docs: [Turn mods on or off](https://code.claude.com/docs/en/plugins/mods/overview#turn-mods-on-or-off)

## Add the marketplace

To install k-mods, first register the marketplace once. You can do it in a session or from the shell.

**In a session**

```
/plugin marketplace add SeongGwangJu/k-mods
```

**From the shell** (without opening a session, for example in scripts)

```bash
claude plugin marketplace add SeongGwangJu/k-mods
```

On success, `Successfully added marketplace: k-mods` appears. The marketplace name comes from the `name` field in `marketplace.json`, not from the repository name. For k-mods the two are the same. After that, you install with the form `<mod name>@k-mods`.

Official docs: [Add a marketplace](https://code.claude.com/docs/en/plugins/install#add-a-marketplace)

## Install

**In a session**

```
/plugin install starter@k-mods
```

In a session, `/plugin install` does not install right away. It first shows the mod's details in the `/plugin` panel (description, added commands and hooks, permissions). It installs when you pick an install scope there.

**From the shell** (installs right away)

```bash
claude plugin install starter@k-mods
```

k-mods also has sets that are bundled in advance.

- `starter@k-mods`: The recommended set. Installs the mod store, Korean pack, memo pad, context bar, risky-command brake, and done alarm in one go.
- `korean-pack@k-mods`: The Korean pack only (menu and settings translation + Korean status lines).

To pick mods one by one, install `mod-store@k-mods`, then enter `/k-mods` in a session. The catalog opens in a pane, and you can install and delete with buttons.

Official docs: [Install a plugin](https://code.claude.com/docs/en/plugins/install#install-a-plugin)

## Install scope

When you install, you pick one of three scopes. The scope decides "who gets this mod" and "which settings file records it".

| Scope | Who gets it | File it is recorded in |
| --- | --- | --- |
| user | Only you, in every project on this computer | `~/.claude/settings.json` |
| project | Everyone who works in this repository | `.claude/settings.json` (a committed file) |
| local | Only you, in this repository | `.claude/settings.local.json` (usually not committed) |

In the shell, pick one with `--scope user|project|local`. If you omit it, the scope is `user`.

```bash
claude plugin install blast-radius-ko@k-mods --scope project
```

If the same mod is configured in several scopes, **local > project > user** takes priority. For example, to turn off a mod that the project enabled, for yourself only, turn it off in the local scope.

Official docs: [Choose an install scope](https://code.claude.com/docs/en/plugins/install#choose-an-install-scope)

## Disable and uninstall

**In a session**: In `/plugin` → **Installed** tab, select an item and menus such as **Disable plugin** and **Uninstall** appear. You can also run them directly with `/plugin enable <mod>@k-mods`, `/plugin disable <mod>@k-mods`, and `/plugin uninstall <mod>@k-mods`.

**From the shell**

```bash
claude plugin disable blast-radius-ko@k-mods
claude plugin enable blast-radius-ko@k-mods
claude plugin uninstall blast-radius-ko@k-mods --scope project
```

For `enable` and `disable`, if you omit `--scope`, the scope where the mod is already configured is found automatically. For `uninstall`, omitting it removes the `user` scope.

If you **Uninstall** a mod that the project enabled, you are asked whether to turn it off only for you or remove it for everyone. To turn it off only for you, choose the option that writes `false` in `.claude/settings.local.json` (the default key **y**). To remove it for everyone, choose the option that changes the shared file itself (**u**).

Official docs: [Manage installed plugins](https://code.claude.com/docs/en/plugins/install#manage-installed-plugins)

## Apply changes to the current session

If you installed, updated, or deleted a mod from the shell, or changed a settings file outside the `/plugin` panel, an open session does not pick up the change automatically. Enter this in the session.

```
/reload-plugins
```

When you close the `/plugin` panel and something changed, Claude Code runs `/reload-plugins` for you. But if this reload could break the prompt cache (for example, when an MCP server is added or removed), it does not apply right away and only warns you. In that case you can force it with `/reload-plugins --force`. The next request is then handled without the cache, so it costs more.

Official docs: [/reload-plugins](https://code.claude.com/docs/en/plugins/cli-reference#reload-plugins)

## Check installed mods

In a session, enter `/plugin` and a dim line like `N mods active · name1, name2` appears under the tabs. **Built-in mods are not included** in this line. If you installed a mod and its name is not on this line, it failed to load.

From the shell, you can see more detail.

```bash
claude plugin list
claude plugin details mod-store
```

`plugin list` shows version, scope, and status. `plugin details` shows the list of commands, hooks, and agents the mod adds, and its context cost.

Official docs: [See which mods a session loaded](https://code.claude.com/docs/en/plugins/mods/overview#see-which-mods-a-session-loaded)

## Set config values (userConfig)

Some mods ask for extra values when you install them (an API address, a token, and so on). These values are declared as the plugin's `userConfig`.

- **At install or enable time**: If a value is empty, a settings dialog opens automatically.
- **Reopen it later**: Enter `/plugin configure <mod>@k-mods` in a session.
- **See everything at a glance**: On Claude Code 2.1.269 or later, the `/config` panel shows a settings row for each enabled mod. Sensitive values (`sensitive`) and multi-select values (`multiple`) do not appear in `/config`.
- **Set values from the shell**: Add `--config key=value` when you install, or after installing, pipe JSON to standard input as below.

```bash
echo '{"api_url": "https://example.com"}' | claude plugin configure my-mod@k-mods --values-stdin
```

Sensitive values are stored in the operating system's secure storage (macOS Keychain and so on), not in `settings.json`.

Official docs: [User configuration](https://code.claude.com/docs/en/plugins/manifest-reference#user-configuration)

## Keep mods up to date

Each marketplace has a different default for auto-update.

- **On by default**: Most Anthropic official marketplaces
- **Off by default**: All other marketplaces, including k-mods

Auto-update is off by default for k-mods, so do one of the following once in a while to get the latest reviews and bug fixes.

- **Turn on auto-update in a session**: `/plugin` → **Marketplaces** tab → select `k-mods` → **Enable auto-update**
- **Refresh only the marketplace catalog** (to see whether new mods were added; mods you already installed stay as they are)

  ```bash
  claude plugin marketplace update k-mods
  ```

- **Update installed mods too, in one step**: In a session, `/plugin` → **Marketplaces** tab → select `k-mods` → **Update marketplace**
- **Update one mod only**

  ```bash
  claude plugin update starter@k-mods
  ```

Official docs: [Keep plugins updated](https://code.claude.com/docs/en/plugins/install#keep-plugins-updated)

## Use with your team

If you commit the setting to the repository, the k-mods marketplace is registered automatically for every teammate who opens it, and the mods you specify start in the "enabled" state. Write this in `.claude/settings.json` and commit it.

```json
{
  "extraKnownMarketplaces": {
    "k-mods": {
      "source": { "source": "github", "repo": "SeongGwangJu/k-mods" }
    }
  },
  "enabledPlugins": {
    "starter@k-mods": true
  }
}
```

Run this once in the shell and the file is created automatically.

```bash
claude plugin marketplace add SeongGwangJu/k-mods --scope project
claude plugin install starter@k-mods --scope project
```

**Note**: A mod listed in `enabledPlugins` only becomes "enabled". It is not downloaded to teammates' computers automatically. Each teammate who freshly clones the repository must run the command below once for it to actually install (after trusting the workspace).

```bash
claude plugin install starter@k-mods --scope project
```

If this step is skipped, Claude Code tells them that "`.claude/settings.json` enabled the plugin but it is not installed".

Official docs: [Register the marketplace for everyone in a repository](https://code.claude.com/docs/en/plugins/host-marketplace#register-the-marketplace-for-everyone-in-a-repository), [extraKnownMarketplaces](https://code.claude.com/docs/en/settings-reference#extraknownmarketplaces), [enabledPlugins](https://code.claude.com/docs/en/settings-reference#enabledplugins)

## Troubleshooting checklist

If a mod is installed but nothing happens, check from top to bottom.

1. **Version too old**: Check `claude --version`, or `/status` in the desktop app. See [Check your version](#check-your-version).
2. **Workspace not trusted yet**: Open an interactive session in this directory once and accept the trust prompt. Otherwise mods do not load.
3. **Started with `--bare` or `--safe-mode`**: Both flags turn off all installed mods. Restart without the flag.
4. **`disableAllHooks` is set**: If this value is `true` in your settings file or your organization's managed settings, all installed mods are off.
5. **Blocked by organization policy**: If an admin turned on `allowManagedModsOnly`, only mods the organization deployed load. See the [Safety guide](safety.en.md) for details.
6. **No name on the "N mods active" line in `/plugin`**: The mod is installed but failed to load. Check with `claude plugin validate <path>` first, or look at the debug log below.
7. **Check the debug log**: Run the following in the shell, and the reason it does not show up is logged as one line.

   ```bash
   claude --debug-file ./mod-debug.log --plugin-dir ./problem-mod
   tail -f ./mod-debug.log | grep problem-mod
   ```

Official docs: [Find out why a mod does nothing](https://code.claude.com/docs/en/plugins/mods/troubleshoot#find-out-why-a-mod-does-nothing), [Check whether mods can load](https://code.claude.com/docs/en/plugins/mods/troubleshoot#check-whether-mods-can-load)

---

Learn more: [What are mods?](what-are-mods.en.md) · [Safety guide](safety.en.md) · [Make your own mod](make-your-own.en.md) · [Cheatsheet](cheatsheet.en.md) · [Contributing guide](../../CONTRIBUTING.md) · [README](../../README.en.md)
