// Copyright 2026 Anthropic PBC
// SPDX-License-Identifier: Apache-2.0
//
// Blast Radius: holds a risky Bash command and shows what it would change.
//
// k-mods 수정본 (anthropics/claude-code-playground 샘플 기반, Apache-2.0). 그 바탕 위에 k-mods가
// 다시 고친 점은 CHANGES-KO.md에 전부 있습니다. 요약:
// - 파괴적인 명령만 잡습니다. 일반 마이그레이션(alembic·rails·django·migrate)은 뺐습니다.
// - 추가: prisma db push / migrate reset, psql·mysql의 DROP·TRUNCATE, docker 볼륨·system prune, compose down -v
// - 문구를 한글화했습니다.
// - 색은 테마 키(warning/error)가 기본입니다. userConfig `palette`를 "gray"로 두면 회색 배경
//   (#bdbec6)에 맞춰 짙게 조정한 고정 색(이 수정본을 처음 만든 사람의 개인 설정)을 씁니다.
// - 실패했을 때의 처리(`.catch`)를 이름 붙은 함수(handleToolCallFailure)로 빼서 바로 단위
//   테스트합니다. 분류 로직(classify)도 내보내 따로 테스트합니다.
//
// tool.call (Bash): if the command is risky, work out its blast radius, open a
// pane with Proceed and Cancel, and hold the call until one is pressed.
// ui.render (Pane): draws the report. If the surface won't place the pane (a
// narrow terminal), the same report is drawn in the AbovePrompt band instead.
//
// Holding: a hook has 10 s of its own time, but time spent inside a `$` call is
// free. So the hold loop waits on a short `$.process.run(["sleep", ...])` until
// a button's onPress sets the decision.
//
// The host reads `on(...)` and `$.noun.method(...)` from source, so they are
// spelled literally, and helpers that take `$` are top-level functions.

const PANE_ID = "blast-radius";
const POLL_SECONDS = "0.25";
const HOLD_LIMIT_MS = 10 * 60 * 1000;
const LIST_MAX = 10;

// k-mods: colours by userConfig `palette`. "theme" (the default) uses Claude Code's own
// theme keys, which follow the user's light/dark theme; "gray" reproduces the fixed hex
// this mod's first author tuned for one grey terminal background (#bdbec6).
const PALETTES = {
  theme: { title: "warning", summary: "error" },
  dark: { title: "#F0C987", summary: "#F28B9B" },
  gray: { title: "#7c4a03", summary: "#9f1239" },
};

function paletteOf(options) {
  return PALETTES[options.palette] ?? PALETTES.dark;
}

// The call being held, or null. One at a time: Bash calls in a turn run in order.
let held = null;

export function register(on, options) {
  const colors = paletteOf(options);

  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    const risk = classify(String(e.command ?? ""));
    if (risk === null) {
      return next(e);
    }
    // One hold at a time. If another risky call is already held (a subagent's,
    // say), wait until it is answered. `held` is claimed with no await between
    // the check and the claim, so two waiting calls can't both get through.
    while (held !== null) {
      if (next.signal.aborted) {
        return { deny: "Blast Radius가 이 명령을 멈추고 실행하지 않았습니다: 턴이 중단됐습니다. 사용자가 요청하지 않으면 다시 시도하지 마세요." };
      }
      await $.process.run(["sleep", POLL_SECONDS], { timeoutMs: 5000 });
    }
    const mine = { command: String(e.command), risk, report: null, decision: null, where: "pane" };
    held = mine;

    let opened = { isPlaced: false };
    let decision;
    let summary = risk.label;
    try {
      // Measure where the command will run: the session folder, moved by any
      // `cd dir &&` or `git -C dir` earlier in the same command line.
      const sessionCwd = await $.session.cwd();
      const cwd = risk.dir ? await resolveDir($, sessionCwd, risk.dir) : sessionCwd;
      mine.report = cwd === null
        ? { summary: `${risk.dir}에서 ${risk.label}`, lines: [], note: `${risk.dir} 폴더를 찾지 못해 영향 범위를 잴 수 없습니다.` }
        : await measure($, risk, cwd);
      summary = mine.report.summary;

      opened = await $.ui.open({ id: PANE_ID, title: "Blast Radius", focus: true, rows: paneRows(mine.report) });
      if (!opened.isPlaced) {
        mine.where = "band";
      }
      $.ui.invalidate("ui.render");

      const startedAt = await $.clock.now();
      while (mine.decision === null) {
        if (next.signal.aborted) {
          mine.decision = "interrupted";
          break;
        }
        if ((await $.clock.now()) - startedAt > HOLD_LIMIT_MS) {
          mine.decision = "timeout";
          break;
        }
        await $.process.run(["sleep", POLL_SECONDS], { timeoutMs: 5000 });
      }
    } catch {
      mine.decision = "error"; // anything unexpected refuses the command
    } finally {
      decision = mine.decision;
      // Close this call's pane before releasing the hold, so the next call's
      // pane can't be the one that gets closed.
      try {
        if (opened.isPlaced) {
          await $.ui.close({ id: PANE_ID });
        }
      } catch {
        // the pane is already gone
      }
      if (held === mine) {
        held = null;
      }
      $.ui.invalidate("ui.render");
    }

    if (decision === "proceed") {
      $.ui.toast("Blast Radius: 실행합니다");
      return next(e);
    }
    return { deny: denyText(decision, summary) };
  }).catch(handleToolCallFailure);

  on("ui.render", { component: "Pane" }, ($, e, next) => {
    if (e.requestId !== PANE_ID || held === null || held.report === null) {
      return next(e);
    }
    return draw($.ui.resolve(e), held, colors);
  });

  on("ui.render", { component: "AbovePrompt" }, ($, e, next) => {
    if (held === null || held.report === null || held.where !== "band") {
      return next(e);
    }
    return draw($.ui.resolve(e), held, colors);
  });
}

// k-mods: what a settled decision other than "proceed" tells Claude, pulled out to a
// pure, exported function so the text for every decision (cancel, timeout, interrupted,
// error, and an unrecognised one) is tested directly, with no hold, no pane, no $.
export function denyText(decision, summary) {
  const why = {
    cancel: "사용자가 취소를 눌렀습니다",
    timeout: "10분 안에 응답이 없었습니다",
    interrupted: "턴이 중단됐습니다",
    error: "Blast Radius가 확인 중 오류를 만났습니다",
  }[decision] ?? "응답이 기록되지 않았습니다";

  return `Blast Radius가 이 명령을 멈추고 실행하지 않았습니다: ${why}. 실행했다면: ${summary}. 사용자가 요청하지 않으면 다시 시도하지 마세요.`;
}

// k-mods: the tool.call hook's own fail-closed .catch, pulled out to a named function so
// it can be unit-tested directly (construct a fake `next` with `.called`), rather than
// only through a full hold. CONTRIBUTING.md: a hook that can block a call must fail closed
// here. `next.called` is true once the main hook reached `return next(e)` — proceeding,
// or the early pass-through for a non-risky command — so a failure there means `next`
// itself didn't settle (it threw or timed out); the safest thing is to try it again
// rather than deny a call that may already be running. A failure anywhere before that
// (classifying, queueing behind another held call, measuring, or waiting for a press)
// never reached `next`, so it denies.
export function handleToolCallFailure($, e, next) {
  return next.called
    ? next(e)
    : { deny: "Blast Radius가 위험 명령 확인 중 오류를 만나 실행하지 않았습니다. 사용자에게 확인을 요청하세요." };
}

// ---- What counts as risky -------------------------------------------------

// sudo options that take a value, so the value isn't read as the command.
const SUDO_VALUE_OPTIONS = new Set(["-u", "-g", "-C", "-D", "-h", "-p", "-r", "-t", "-T", "-U"]);

/** A folder a later `cd arg` moves to, given the folder so far (null = the session folder). */
function joinDir(dir, arg) {
  if (arg === undefined || arg === "~" || arg.startsWith("/") || arg.startsWith("~/")) {
    return arg ?? "~";
  }
  return dir ? `${dir}/${arg}` : arg;
}

/** The first risky segment of a shell command, or null. Exported for direct unit tests. */
export function classify(command) {
  let dir = null; // where a `cd` earlier on the line moved to; null means the session folder
  const scopes = []; // dir to restore when a ( subshell ) closes
  const pushed = []; // pushd stack, for popd
  for (const raw of command.split(/&&|\|\||;|\||\n/)) {
    const opens = (raw.match(/^\s*\(+/)?.[0].trim().length) ?? 0;
    // Trailing redirects and & don't hide a closing ) : `(cd sub && make) > log`.
    const tail = raw.replace(/(?:\s*(?:\d*>>?|&>>?|<)\s*\S+|\s*&)+\s*$/, "");
    const closes = (tail.match(/\)+\s*$/)?.[0].trim().length) ?? 0;
    for (let k = 0; k < opens; k += 1) {
      scopes.push(dir);
    }
    const risk = classifySegment(raw, dir, pushed);
    if (risk !== null && risk.cd === undefined) {
      return risk;
    }
    if (risk !== null) {
      dir = risk.cd; // a cd, pushd or popd moved the folder
    }
    for (let k = 0; k < closes && scopes.length > 0; k += 1) {
      dir = scopes.pop(); // a cd inside ( ... ) doesn't outlive it
    }
  }
  return null;
}

// Words that can come before the real command without changing what it does.
const PREFIXES = new Set(["command", "exec", "env", "nohup", "time", "then", "do", "else", "!"]);

/** One segment: a risk, { cd } for a folder change, or null. */
function classifySegment(segment, dir, pushed) {
  {
    const words = tokenize(segment.trim().replace(/^[({]+\s*/, "").replace(/\s*[)}]+$/, ""));
    while (words.length > 0 && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[0])) {
      words.shift(); // leading VAR=value
    }
    if (words[0] === "sudo") {
      words.shift();
      while (words.length > 0 && words[0].startsWith("-")) {
        const option = words.shift();
        if (SUDO_VALUE_OPTIONS.has(option)) {
          words.shift();
        }
      }
    }
    while (words.length > 0 && (PREFIXES.has(words[0]) || /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[0]))) {
      words.shift();
    }
    if (words[0] === "nice") {
      words.shift();
      if (words[0] === "-n") {
        words.splice(0, 2);
      } else if (/^-\d+$/.test(words[0] ?? "")) {
        words.shift();
      }
    }
    const [first, ...args] = words;
    if (first === undefined) {
      return null;
    }
    const cmd = first.replace(/^\\/, ""); // \rm skips aliases; it's still rm
    if (cmd === "cd") {
      return { cd: args[0] === "-" ? "-" : joinDir(dir, args[0]) };
    }
    if (cmd === "pushd") {
      pushed.push(dir);
      return { cd: joinDir(dir, args[0]) };
    }
    if (cmd === "popd") {
      return { cd: pushed.length > 0 ? pushed.pop() : "-" };
    }
    if (cmd === "rm" || cmd.endsWith("/rm")) {
      const flags = args.filter((a) => a.startsWith("-"));
      const recursive = flags.some((f) => f === "--recursive" || (/^-[^-]/.test(f) && /[rR]/.test(f)));
      const force = flags.some((f) => f === "--force" || (/^-[^-]/.test(f) && f.includes("f")));
      if (recursive || force) {
        const targets = args.filter((a) => !a.startsWith("-") || a === "-");
        return { kind: "rm", label: `rm ${flags.join(" ")}`.trim(), targets, dir };
      }
    }
    if (cmd === "git") {
      // Git's own options come before the subcommand; -C moves where it runs.
      let gitDir = dir;
      let i = 0;
      while (i < args.length && args[i].startsWith("-")) {
        if (args[i] === "-C" && i + 1 < args.length) {
          gitDir = joinDir(gitDir, args[i + 1]);
          i += 2;
        } else if (args[i] === "-c" && i + 1 < args.length) {
          i += 2;
        } else {
          i += 1;
        }
      }
      const sub = args[i];
      const rest = args.slice(i + 1);
      if (sub === "reset" && rest.includes("--hard")) {
        return { kind: "git-reset", label: "git reset --hard", args: rest, dir: gitDir };
      }
      if (sub === "clean") {
        return { kind: "git-clean", label: "git clean", args: rest, dir: gitDir };
      }
      if (sub === "push" && rest.some((a) => a === "--force" || a === "-f" || a.startsWith("--force-with-lease") || /^\+/.test(a))) {
        return { kind: "git-push-force", label: "git push --force", args: rest, dir: gitDir };
      }
      const stagedOnly = sub === "restore" && rest.includes("--staged") && !rest.includes("--worktree") && !rest.includes("-W");
      if ((sub === "checkout" || sub === "restore") && rest.includes(".") && !stagedOnly) {
        return { kind: "git-checkout", label: `git ${sub} -- .`, args: rest, dir: gitDir };
      }
    }
    const joined = words.join(" ");
    if (/\bprisma\s+db\s+push\b/.test(joined)) {
      return { kind: "note", label: "prisma db push", summary: "스키마를 DB에 직접 반영 (마이그레이션 기록 없이, 데이터 손실 가능)", note: "인덱스 이름이 다르면 다시 만들면서 잠금이 걸릴 수 있습니다. 공유 DB라면 migrate deploy를 쓰세요.", dir };
    }
    if (/\bprisma\s+migrate\s+reset\b/.test(joined)) {
      return { kind: "note", label: "prisma migrate reset", summary: "DB를 지우고 마이그레이션을 처음부터 다시 적용 (모든 데이터 삭제)", note: "연결된 DATABASE_URL의 데이터가 전부 사라집니다.", dir };
    }
    if (/^(psql|mysql|sqlite3|mongosh)$/.test(cmd) || /\b(psql|mysql)\b/.test(joined)) {
      const m = joined.match(/\b(DROP\s+(TABLE|DATABASE|SCHEMA|INDEX|VIEW)|TRUNCATE)\b[^;"']*/i);
      if (m) {
        return { kind: "note", label: m[1].toUpperCase().replace(/\s+/g, " "), summary: `SQL 실행: ${m[0].trim().slice(0, 120)}`, note: "되돌릴 수 없는 SQL입니다. 접속 대상 DB를 확인하세요.", dir };
      }
    }
    if (cmd === "docker" || cmd === "docker-compose") {
      if (/\bvolume\s+(rm|prune)\b/.test(joined) || /\bsystem\s+prune\b/.test(joined)) {
        return { kind: "note", label: "docker 볼륨 삭제", summary: "도커 볼륨·데이터 삭제", note: "볼륨에 있던 DB 데이터 등은 복구할 수 없습니다.", dir };
      }
      if (/\bdown\b/.test(joined) && /(^|\s)(-v|--volumes)(\s|$)/.test(joined)) {
        return { kind: "note", label: "compose down -v", summary: "컨테이너와 함께 볼륨 삭제", note: "볼륨에 있던 DB 데이터 등은 복구할 수 없습니다.", dir };
      }
    }
  }
  return null;
}

// Resolves a `cd` target to an absolute folder, or null if it doesn't exist.
// The target is passed as an argument, never as source.
const CD_SCRIPT = `unset CDPATH; d="$1"; case "$d" in "~") d="$HOME";; "~/"*) d="$HOME/\${d#\\~/}";; esac; cd -- "$d" 2>/dev/null && pwd -P`;

async function resolveDir($, sessionCwd, dir) {
  if (dir === "-") {
    return null; // `cd -` depends on the shell's history
  }
  const run = await $.process.run(["bash", "-c", CD_SCRIPT, "blast-radius", dir], { cwd: sessionCwd, timeoutMs: 5000 });
  const out = run.stdout.trim();
  return run.exitCode === 0 && out !== "" ? out : null;
}

/** Splits one segment into words, honouring quotes. Good enough to read flags and paths. */
function tokenize(text) {
  const words = [];
  const re = /"((?:[^"\\]|\\.)*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    words.push(m[1] ?? m[2] ?? m[3]);
  }
  return words;
}

// ---- Measuring the blast radius -------------------------------------------

/** { summary, lines, note } for the pane. Never throws: a failed read is said, not hidden. */
async function measure($, risk, cwd) {
  try {
    if (risk.kind === "rm") {
      return await measureRm($, risk, cwd);
    }
    if (risk.kind === "note") {
      return { summary: risk.summary, lines: [], note: risk.note };
    }
    return await measureGit($, risk, cwd);
  } catch (error) {
    return { summary: `${risk.label} (영향 범위를 재지 못함)`, lines: [], note: `재지 못함: ${String(error?.message ?? error).slice(0, 200)}` };
  }
}

// The paths are passed to bash as arguments, never as source, so nothing in
// them runs. compgen -G expands a glob without command substitution.
const RM_SCRIPT = `
shopt -s nullglob dotglob
paths=()
for p in "$@"; do
  case "$p" in "~"|"~/"*) p="$HOME\${p#\\~}";; esac
  if [[ "$p" == *[*?[]* ]]; then
    while IFS= read -r m; do paths+=("$m"); done < <(compgen -G "$p")
  elif [[ -e "$p" || -L "$p" ]]; then
    paths+=("$p")
  fi
done
if (( \${#paths[@]} == 0 )); then echo "0 0 0"; exit 0; fi
# A relative path gets ./ in front, so find never reads a name like -delete as an action.
for i in "\${!paths[@]}"; do case "\${paths[$i]}" in /*) ;; *) paths[$i]="./\${paths[$i]}";; esac; done
files=$(find "\${paths[@]}" \\( -type f -o -type l \\) 2>/dev/null | wc -l | tr -d ' ')
kb=$(du -skc "\${paths[@]}" 2>/dev/null | tail -n1 | cut -f1)
echo "$files $(( \${kb:-0} * 1024 )) \${#paths[@]}"
find "\${paths[@]}" \\( -type f -o -type l \\) 2>/dev/null | head -n ${LIST_MAX}
`;

async function measureRm($, risk, cwd) {
  if (risk.targets.length === 0) {
    return { summary: "경로 없는 rm", lines: [], note: "펼칠 경로가 없습니다." };
  }
  const run = await $.process.run(["bash", "-c", RM_SCRIPT, "blast-radius", ...risk.targets], { cwd, timeoutMs: 15000 });
  const [head, ...rest] = run.stdout.split("\n").filter((l) => l !== "");
  const [files, bytes, found] = (head ?? "0 0 0").split(" ").map(Number);
  if (!found) {
    return { summary: `삭제할 것 없음: ${risk.targets.join(" ")}와 맞는 파일이 없음`, lines: [], note: "경로가 없어서 rm이 지울 것이 없습니다." };
  }
  if (!files) {
    return { summary: `빈 경로 ${found}개 삭제`, lines: [], note: `경로: ${risk.targets.join(" ")}` };
  }
  return {
    summary: `파일 ${files}개 삭제 (약 ${size(bytes)})`,
    lines: rest.map((l) => l.replace(/^\.\//, "")),
    more: Math.max(0, files - rest.length),
    note: `경로: ${risk.targets.join(" ")}`,
  };
}

async function measureGit($, risk, cwd) {
  if (risk.kind === "git-push-force") {
    return await measurePush($, risk, cwd);
  }
  if (risk.kind === "git-clean") {
    const flags = [];
    const paths = [];
    for (let i = 0; i < risk.args.length; i += 1) {
      const a = risk.args[i];
      if (a === "--") {
        paths.push(...risk.args.slice(i + 1));
        break;
      }
      if (a === "-e" || a === "--exclude") {
        flags.push(a, risk.args[i + 1] ?? "");
        i += 1;
      } else if (a.startsWith("--exclude=") || /^-e./.test(a)) {
        flags.push(a);
      } else if (/^-[a-zA-Z]+$/.test(a)) {
        const kept = a.replace(/[finq]/g, ""); // -n is added below; -f, -i and -q would change the dry run
        if (kept !== "-") {
          flags.push(kept);
        }
      } else if (!a.startsWith("-")) {
        paths.push(a);
      }
    }
    const run = await $.process.run(["git", "clean", "-n", ...flags, "--", ...paths], { cwd, timeoutMs: 15000 });
    if (run.exitCode !== 0) {
      return { summary: "git clean (미리 실행해보지 못함)", lines: [], note: run.stderr.trim().slice(0, 200) };
    }
    const gone = run.stdout.split("\n").filter((l) => l.startsWith("Would remove ")).map((l) => l.slice(13));
    return {
      summary: gone.length === 0 ? "지울 것 없음: 추적 안 되는 파일 없음" : `추적 안 되는 경로 ${gone.length}개 삭제`,
      lines: gone.slice(0, LIST_MAX),
      more: Math.max(0, gone.length - LIST_MAX),
      note: "git clean -n 결과. 추적 안 되는 파일은 git에 없어서 복구할 수 없습니다.",
    };
  }
  const status = await $.process.run(["git", "status", "--porcelain"], { cwd, timeoutMs: 15000 });
  if (status.exitCode !== 0) {
    return { summary: `${risk.label} (git 저장소가 아닌 듯)`, lines: [], note: status.stderr.trim().slice(0, 200) };
  }
  const rows = status.stdout.split("\n").filter((l) => l.length > 3 && !l.startsWith("??"));
  // reset --hard drops staged and unstaged changes; checkout -- . drops unstaged ones.
  const lost = risk.kind === "git-reset" ? rows : rows.filter((l) => l[1] !== " ");
  const stat = await $.process.run(["git", "diff", "--shortstat", risk.kind === "git-reset" ? "HEAD" : "--"], { cwd, timeoutMs: 15000 });
  return {
    summary: lost.length === 0 ? "버릴 것 없음: 커밋 안 된 변경 없음" : `파일 ${lost.length}개의 커밋 안 된 변경을 버림`,
    lines: lost.slice(0, LIST_MAX).map((l) => `${l.slice(0, 2)} ${l.slice(3)}`),
    more: Math.max(0, lost.length - LIST_MAX),
    note: stat.stdout.trim() !== "" ? `${stat.stdout.trim()}. 커밋 안 된 변경은 복구할 수 없습니다.` : "git status --porcelain 결과.",
  };
}

async function measurePush($, risk, cwd) {
  const positional = risk.args.filter((a) => !a.startsWith("-"));
  const remote = positional[0] ?? "origin";
  // A refspec is src:dst. With no colon, the local branch of the same name is pushed.
  const spec = (positional[1] ?? "").replace(/^\+/, "");
  let [source, branch] = spec.includes(":") ? spec.split(":") : [spec, spec];
  branch = (branch ?? "").replace(/^refs\/heads\//, "");
  if (!branch) {
    const head = await $.process.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], { cwd, timeoutMs: 10000 });
    branch = head.stdout.trim();
    source = "HEAD";
  } else if (branch === "HEAD") {
    // `git push origin HEAD` pushes the current branch to its namesake.
    const head = await $.process.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], { cwd, timeoutMs: 10000 });
    branch = head.stdout.trim();
    source = "HEAD";
  }
  source = source || "HEAD";
  const ref = `${remote}/${branch}`;
  const known = await $.process.run(["git", "rev-parse", "--verify", "--quiet", ref], { cwd, timeoutMs: 10000 });
  if (known.exitCode !== 0) {
    return { summary: `${ref}에 강제 푸시`, lines: [], note: `${ref}의 로컬 사본이 없어 사라질 커밋을 알 수 없습니다. 먼저 git fetch 하세요.` };
  }
  const log = await $.process.run(["git", "log", "--oneline", "--no-decorate", `${source}..${ref}`], { cwd, timeoutMs: 15000 });
  const dropped = log.stdout.split("\n").filter((l) => l !== "");
  return {
    summary: dropped.length === 0 ? `${ref}에 강제 푸시: 사라지는 커밋 없음` : `${ref}에 강제 푸시: 커밋 ${dropped.length}개가 사라짐`,
    lines: dropped.slice(0, LIST_MAX),
    more: Math.max(0, dropped.length - LIST_MAX),
    note: `마지막 fetch 기준, ${ref}에는 있고 ${source}에는 없는 커밋.`,
  };
}

function size(bytes) {
  if (!Number.isFinite(bytes) || bytes < 1024) {
    return `${bytes || 0} B`;
  }
  const units = ["KB", "MB", "GB", "TB"];
  let n = bytes;
  let i = -1;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(n < 10 ? 1 : 0)} ${units[i]}`;
}

// ---- Drawing --------------------------------------------------------------

function paneRows(report) {
  return Math.min(24, 8 + report.lines.length + (report.more ? 1 : 0));
}

// 버튼은 요약 바로 아래에 둔다. 좁은 화면(band)에서는 아래쪽이 잘려 버튼이 안 보이던 문제가 있었다.
// k-mods: `colors`는 register()가 userConfig `palette`로 고른 두 값(title, summary)을 그대로
// 받는다 — 기여 가이드대로 테마 키가 기본이고, "gray" 설정일 때만 고정 16진수 색을 쓴다.
//
// Exported for tests: a test draws this directly (through a small harness plugin that
// just calls draw(t, state, colors) from its own ui.render hook) instead of through a
// real held tool.call, which runs this same function from inside a hold loop that's
// also polling $.process.run — the test kit resolves a concurrent $.ui.mount there only
// after that loop's many stubbed calls settle, which is slow and timing-sensitive, not
// a reliable way to test a pure drawing function and its button wiring.
export function draw(t, state, colors) {
  const { Box, Text, Button } = t;
  const { report } = state;
  const cap = state.where === "band" ? 3 : LIST_MAX;
  const shown = report.lines.slice(0, cap);
  const more = (report.more ?? 0) + (report.lines.length - shown.length);
  const list = shown.map((line, i) => Text({ key: `l${i}`, children: `  ${tilde(line)}`, wrap: "truncate-start" }));
  if (more > 0) {
    list.push(Text({ key: "more", dimColor: true, children: `  외 ${more}개` }));
  }
  // 버튼은 그려진 호출에만 답한다. 지금 잡혀 있는 다른 호출이 아니라.
  const decide = (choice) => () => {
    if (state.decision === null) {
      state.decision = choice;
    }
  };
  return Box({
    flexDirection: "column",
    borderStyle: "round",
    borderColor: colors.title,
    paddingX: 1,
    children: [
      Text({ key: "title", bold: true, color: colors.title, children: `⚠ 위험 명령 확인 · ${state.risk.label}` }),
      Text({ key: "sum", children: [Text({ dimColor: true, children: "영향  " }), Text({ color: colors.summary, bold: true, children: report.summary })] }),
      Box({
        key: "buttons",
        gap: 2,
        children: [
          Button({ key: "proceed", label: "실행", hotkey: "1", plain: true, onPress: decide("proceed") }),
          Button({ key: "cancel", label: "취소", hotkey: "2", plain: true, autoFocus: true, onPress: decide("cancel") }),
          Text({ key: "hint", dimColor: true, children: "Enter=취소", wrap: "truncate-end" }),
        ],
      }),
      Text({ key: "cmd", children: [Text({ dimColor: true, children: "명령  " }), Text({ bold: true, children: tilde(state.command) })], wrap: "truncate-middle" }),
      Box({ key: "list", flexDirection: "column", children: list }),
      report.note ? Text({ key: "note", dimColor: true, italic: true, children: tilde(report.note), wrap: state.where === "band" ? "truncate-end" : "wrap" }) : null,
    ],
  });
}

// 홈 경로를 ~로 줄인다. 정확한 사용자명은 몰라도 /Users/<이름>/ 형태면 줄인다.
function tilde(text) {
  return String(text).replace(/\/(?:Users|home)\/[^/\s]+/g, "~");
}
