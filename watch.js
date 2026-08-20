/* Kasua — zero-touch publisher.
   Watches the repo, and a few seconds after you stop saving it commits and
   pushes, so the live Pages site follows along.

     node watch.js            watch and publish
     node watch.js --dry-run  watch and report, but never commit or push

   Ctrl+C stops it. Nothing is pushed while it is not running.            */
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const QUIET_MS = 4000;           // wait this long after the last save
const DRY = process.argv.includes('--dry-run');

// Never react to these — .git churns constantly and would loop forever.
const IGNORE = /(^|[\\/])(\.git|node_modules|\.claude)([\\/]|$)/i;

function git(args) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: ROOT, windowsHide: true }, (err, stdout, stderr) => {
      if (err) reject(new Error((stderr || stdout || err.message).trim()));
      else resolve(stdout.trim());
    });
  });
}

const stamp = () => new Date().toLocaleTimeString('en-GB');
const log = (msg) => console.log(`[${stamp()}] ${msg}`);

/* Build a commit message from what actually changed, so the history stays
   readable instead of 400 commits all saying "update". */
function describe(porcelain) {
  const files = porcelain.split('\n').filter(Boolean)
    .map(l => l.slice(3).trim().replace(/^.*? -> /, ''));
  const names = [...new Set(files.map(f => path.basename(f)))];
  const head = names.length <= 3 ? names.join(', ') : `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
  return `Update ${head}`;
}

let timer = null;
let running = false;
let dirtyAgain = false;

async function publish() {
  if (running) { dirtyAgain = true; return; }
  running = true;
  try {
    const status = await git(['status', '--porcelain']);
    if (!status) { log('nothing to publish'); return; }

    log(`changes:\n${status.split('\n').map(l => '   ' + l).join('\n')}`);
    if (DRY) { log('dry run — not committing'); return; }

    await git(['add', '-A']);
    await git(['commit', '-m', describe(status)]);
    await git(['push', 'origin', 'HEAD']);
    const sha = await git(['rev-parse', '--short', 'HEAD']);
    log(`pushed ${sha} — live in about a minute`);
  } catch (e) {
    // A failed push (offline, rejected, conflict) must not kill the watcher.
    log(`FAILED: ${e.message.split('\n')[0]}`);
    log('still watching — fix it and save again, or push by hand');
  } finally {
    running = false;
    if (dirtyAgain) { dirtyAgain = false; schedule(); }
  }
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(publish, QUIET_MS);
}

fs.watch(ROOT, { recursive: true }, (_evt, file) => {
  if (!file || IGNORE.test(file)) return;
  log(`saved ${file}`);
  schedule();
});

log(`watching ${ROOT}`);
log(DRY ? 'DRY RUN — will not commit or push' : `will commit + push ${QUIET_MS / 1000}s after you stop saving`);
log('Ctrl+C to stop');
