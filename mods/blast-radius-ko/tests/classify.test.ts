// Pure unit tests for classify(), with no $ or event simulation: a command line in,
// a risk (or null) out. CONTRIBUTING.md: pure logic (classification) gets a unit test.
import { expect, test } from 'claude-code/testing'

import { classify, isClaudeScratch } from '../hooks/register.mjs'

test('rm variants: recursive or force (or both), long or short flags, are risky', async () => {
  expect(classify('rm -rf build')?.kind).toBe('rm')
  expect(classify('rm -fr node_modules')?.kind).toBe('rm') // flag order doesn't matter
  expect(classify('rm --recursive --force /tmp/x')?.kind).toBe('rm')
  expect(classify('rm -r only-recursive')?.kind).toBe('rm') // recursive alone is enough
  expect(classify('rm -f only-force.txt')?.kind).toBe('rm') // force alone is enough
  expect(classify('rm -rf a b c')?.targets).toEqual(['a', 'b', 'c'])
})

test('git push --force, -f, --force-with-lease and a leading + refspec are risky; a plain push is not', async () => {
  expect(classify('git push --force origin main')?.kind).toBe('git-push-force')
  expect(classify('git push -f origin main')?.kind).toBe('git-push-force')
  expect(classify('git push --force-with-lease')?.kind).toBe('git-push-force')
  expect(classify('git push origin +main')?.kind).toBe('git-push-force')
  expect(classify('git push')).toBeNull()
  expect(classify('git push origin main')).toBeNull()
})

test('git reset --hard, git clean, and checkout/restore -- . are risky', async () => {
  expect(classify('git reset --hard HEAD~1')?.kind).toBe('git-reset')
  expect(classify('git reset --soft HEAD~1')).toBeNull() // --soft touches nothing
  expect(classify('git reset HEAD')).toBeNull() // no --hard
  expect(classify('git clean -fd')?.kind).toBe('git-clean')
  expect(classify('git checkout -- .')?.kind).toBe('git-checkout')
  expect(classify('git restore .')?.kind).toBe('git-checkout')
  expect(classify('git checkout main')).toBeNull() // switching branches, not discarding
  expect(classify('git checkout -- file.txt')).toBeNull() // one file, not every change
  // --staged only unstages; it never touches the working tree, so it's not risky.
  expect(classify('git restore --staged .')).toBeNull()
  expect(classify('git restore --worktree --staged .')?.kind).toBe('git-checkout')
})

test('prisma db push / migrate reset are risky; routine migrate commands are not', async () => {
  expect(classify('prisma db push')?.label).toBe('prisma db push')
  expect(classify('npx prisma db push')?.label).toBe('prisma db push') // a runner in front still matches
  expect(classify('prisma migrate reset')?.label).toBe('prisma migrate reset')
  expect(classify('prisma migrate deploy')).toBeNull()
  expect(classify('prisma migrate dev')).toBeNull()
  expect(classify('prisma db pull')).toBeNull()
  // k-mods philosophy: generic migration tools (alembic, rails, django, bare "migrate")
  // are deliberately NOT flagged any more. Only the specific destructive commands above are.
  expect(classify('alembic upgrade head')).toBeNull()
  expect(classify('python3 manage.py migrate')).toBeNull()
  expect(classify('bin/rails db:migrate')).toBeNull()
})

test('DROP/TRUNCATE inside a psql -c or mysql -e argument are risky; a harmless query is not', async () => {
  const drop = classify('psql -c "DROP TABLE users"')
  expect(drop?.kind).toBe('note')
  expect(drop?.label).toBe('DROP TABLE')
  expect(drop?.summary).toContain('DROP TABLE users')

  const truncate = classify('mysql -e "TRUNCATE orders"')
  expect(truncate?.kind).toBe('note')
  expect(truncate?.label).toBe('TRUNCATE')

  expect(classify('psql -c "DROP DATABASE prod"')?.label).toBe('DROP DATABASE')
  expect(classify('mysql -u root -ppw mydb -e "SELECT * FROM users"')).toBeNull()
  expect(classify('psql -c "SELECT 1"')).toBeNull()
})

test('docker volume rm/prune, system prune and compose down -v are risky', async () => {
  expect(classify('docker volume rm myvol')?.kind).toBe('note')
  expect(classify('docker volume prune')?.kind).toBe('note')
  expect(classify('docker system prune -f')?.kind).toBe('note')
  expect(classify('docker-compose down -v')?.label).toBe('compose down -v')
  expect(classify('docker compose down --volumes')?.label).toBe('compose down -v') // new CLI, long flag
  expect(classify('docker compose down')).toBeNull() // no volume flag: routine
  expect(classify('docker ps')).toBeNull()
  expect(classify('docker volume ls')).toBeNull()
})

test('routine, harmless and merely-mentioning commands are not held', async () => {
  expect(classify('git add .')).toBeNull()
  expect(classify('git commit -m "fix"')).toBeNull()
  expect(classify('git status')).toBeNull()
  expect(classify('rm file.txt')).toBeNull() // one file, no -r or -f
  expect(classify('echo "rm -rf"')).toBeNull() // "rm -rf" is a string argument to echo, not a command
  expect(classify('ls -la')).toBeNull()
  expect(classify('npm install')).toBeNull()
})

test("rm inside one Claude session's temp folder is not held; anything wider still is", async () => {
  const scratch = '/private/tmp/claude-502/-Users-me-repo/0b1c-session/scratchpad'
  expect(classify(`rm -rf ${scratch}/out`)).toBeNull()
  expect(classify(`rm -rf "${scratch}/a b" ${scratch}/*`)).toBeNull() // quotes, a glob below the session folder
  expect(classify('rm -rf /tmp/claude-1000/-home-me-repo/sess-1')).toBeNull() // Linux, the session folder itself
  // One target outside the scratch folder makes the whole rm risky.
  expect(classify(`rm -rf ${scratch}/out build`)?.kind).toBe('rm')
  // A relative target after a literal cd into the scratch folder.
  expect(classify(`cd ${scratch}; rm -rf cfg && mkdir cfg`)).toBeNull()
  expect(classify(`cd ${scratch} && rm -rf cfg out/*`)).toBeNull()
  expect(classify(`cd ${scratch} && cd sub && rm -rf cfg`)).toBeNull()
  // ...but not when the cd can't be read, climbs out, or isn't there.
  expect(classify('rm -rf cfg')?.kind).toBe('rm')
  expect(classify('cd "$SCRATCH" && rm -rf cfg')?.kind).toBe('rm')
  expect(classify(`cd ${scratch} && rm -rf ../other`)?.kind).toBe('rm')
  expect(classify(`cd ${scratch} && rm -rf .`)?.kind).toBe('rm')
  expect(classify(`cd ${scratch} && cd - && rm -rf cfg`)?.kind).toBe('rm')
  expect(classify(`(cd ${scratch} && make) && rm -rf cfg`)?.kind).toBe('rm')
  expect(classify('cd /private/tmp/claude-502/-Users-me-repo && rm -rf sess')).toBeNull() // lands in a session folder
  expect(classify('cd /private/tmp/claude-502 && rm -rf proj')?.kind).toBe('rm') // project folder: too shallow
  // Too shallow: the uid or project folder holds other sessions' files.
  expect(isClaudeScratch('/private/tmp/claude-502')).toBe(false)
  expect(isClaudeScratch('/private/tmp/claude-502/-Users-me-repo')).toBe(false)
  expect(isClaudeScratch('/private/tmp/claude-502/-Users-me-repo/')).toBe(false)
  // The target can't be read from the command line.
  expect(isClaudeScratch('/tmp/claude-*/proj/sess')).toBe(false)
  expect(isClaudeScratch('/tmp/claude-502/proj/*')).toBe(false)
  expect(isClaudeScratch('/tmp/claude-502/$PROJ/sess')).toBe(false)
  expect(isClaudeScratch('$TMPDIR/claude-502/proj/sess')).toBe(false)
  expect(isClaudeScratch('/tmp/claude-502/proj/sess/../..')).toBe(false)
  expect(isClaudeScratch('/tmp/claude-502/proj/.')).toBe(false)
  // Look-alikes that aren't Claude's folder.
  expect(isClaudeScratch('/tmp/claude-code/proj/sess')).toBe(false)
  expect(isClaudeScratch('tmp/claude-502/proj/sess')).toBe(false)
  expect(isClaudeScratch('/var/tmp/claude-502/proj/sess')).toBe(false)
})
