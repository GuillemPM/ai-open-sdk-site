// API review report for a narrow API reviewer.
//
//   pnpm docs:api-review                    pages and samples changed since main (plus uncommitted work)
//   pnpm docs:api-review <file> [...]       specific pages or samples
//   pnpm docs:api-review --all              every page and sample
//   pnpm docs:api-review --name Register    feature audit: where a name is declared and where the docs use it
//   --base <ref>                            compare against another branch
//   --out <file>                            also write the report to a file
//
// Prints a Markdown report: every SDK reference with its owner, signature,
// and a source anchor at the pinned commit, then the problems and the calls
// the checker could not attribute to an owner. Exits 1 when a problem exists.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { ApiIndex, apiCheckedFiles, applyExceptions, checkFiles, loadAliases, loadManifest, loadPin } from './lib/public-api.mjs';

const root = process.cwd();
const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const optionValues = new Set(['--base', '--out', '--name'].map((name) => option(name)).filter(Boolean));
const positional = args.filter((arg) => !arg.startsWith('--') && !optionValues.has(arg));

const pin = loadPin(root);
const manifest = loadManifest(root, pin);
const index = new ApiIndex(manifest);
const aliases = loadAliases(root);
const output = [];
const print = (line = '') => output.push(line);
const relative = (file) => path.relative(root, file).split(path.sep).join('/');

function git(...gitArgs) {
  try {
    return execFileSync('git', gitArgs, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

/** Changed pages and samples, plus the pages that include a changed sample. */
function changedFiles(base) {
  const mergeBase = git('merge-base', 'HEAD', base) || base;
  const names = new Set(
    [
      git('diff', '--name-only', '--diff-filter=ACMR', mergeBase, '--', 'content'),
      git('diff', '--name-only', '--diff-filter=ACMR', '--', 'content'),
      git('ls-files', '--others', '--exclude-standard', '--', 'content'),
    ]
      .join('\n')
      .split('\n')
      .filter((name) => /\.(mdx|al)$/.test(name)),
  );
  const all = apiCheckedFiles(root);
  for (const page of all.filter((file) => file.endsWith('.mdx'))) {
    const source = fs.readFileSync(page, 'utf8');
    for (const match of source.matchAll(/<include\b[^>]*>([^<]+)<\/include>/g)) {
      const target = relative(path.resolve(path.dirname(page), match[1].trim()));
      if (names.has(target)) names.add(relative(page));
    }
  }
  return all.filter((file) => names.has(relative(file)));
}

function nameAudit(names) {
  const files = apiCheckedFiles(root);
  print(`# Feature audit for ${names.join(', ')}`);
  print();
  print(`Pinned source: ${pin.repository}@${pin.commit}`);
  for (const name of names) {
    const lower = name.toLowerCase();
    print();
    print(`## ${name}`);
    print();
    print('### Declared in the pinned SDK');
    print();
    let declared = 0;
    for (const object of manifest.objects) {
      const entries = [
        ...object.procedures.map((p) => ({ ...p, kind: 'procedure' })),
        ...object.events.map((p) => ({ ...p, kind: 'event' })),
        ...(object.values ?? []).map((v) => ({ ...v, params: [], kind: 'enum value', access: 'Public' })),
      ].filter((entry) => entry.name.toLowerCase() === lower);
      if (object.name.toLowerCase().includes(lower)) {
        print(`- ${object.type} "${object.name}" (${object.access}, ${object.app}): ${index.anchor(object)}`);
        declared++;
      }
      for (const entry of entries) {
        const visible = object.access === 'Public' && entry.access === 'Public';
        print(
          `- "${object.name}".${entry.name}(${entry.params.map((p) => `${p.var ? 'var ' : ''}${p.name}: ${p.type}`).join('; ')})` +
            ` ${entry.kind}, ${visible ? 'public' : `NOT PUBLIC (${object.access === 'Public' ? entry.access : `object ${object.access}`})`}` +
            `, ${object.app}: ${index.anchor(object, entry)}`,
        );
        declared++;
      }
    }
    if (!declared) print('- Not declared on any object in the pinned SDK. Treat every use in the docs as stale.');
    print();
    print('### Used in docs and samples');
    print();
    const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    let used = 0;
    for (const file of files) {
      fs.readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (!pattern.test(line)) return;
          print(`- ${relative(file)}:${i + 1}: ${line.trim().slice(0, 160)}`);
          used++;
        });
    }
    if (!used) print('- No uses.');
  }
}

function review(files) {
  const references = checkFiles(files, { root, index, aliases });
  const { errors, excepted } = applyExceptions(references, root);
  print('# API review');
  print();
  print(`Pinned source: ${pin.repository}@${pin.commit} (${pin.commitSubject})`);
  print(`Files: ${files.length ? files.map(relative).join(', ') : 'none'}`);
  print();
  if (!files.length) {
    print('No changed pages or samples. Pass file paths or --all.');
    return 0;
  }

  print(`## Problems (${errors.length})`);
  print();
  if (!errors.length) print('None. Every checked reference resolves to a public declaration.');
  for (const reference of errors) {
    print(`- ${reference.file}:${reference.line}: ${reference.problem}${reference.text ? ` (\`${reference.text}\`)` : ''}`);
  }
  if (excepted.length) {
    print();
    print(`## Policy exceptions (${excepted.length})`);
    print();
    for (const reference of excepted) print(`- ${reference.file}:${reference.line}: ${reference.problem}. ${reference.reason}`);
  }

  const unowned = references.filter((reference) => reference.kind === 'unowned');
  print();
  print(`## Not attributed to an owner (${unowned.length})`);
  print();
  print('Bare calls outside an `api-owner` scope are not checked. Confirm each owner by hand, or qualify the call.');
  print();
  if (!unowned.length) print('None.');
  for (const reference of unowned) {
    const owners = index.publicOwners(reference.member);
    print(
      `- ${reference.file}:${reference.line}: \`${reference.text}\`, public on ${
        owners.length ? owners.map((owner) => `"${owner}"`).join(', ') : 'no SDK object'
      }`,
    );
  }

  print();
  print('## Resolved references');
  print();
  print('Check each claim in the prose against the signature and the source anchor.');
  const seen = new Set();
  for (const file of [...new Set(references.map((reference) => reference.file))]) {
    print();
    print(`### ${file}`);
    print();
    print('| Line | Reference | Kind | Signature | Source |');
    print('|---|---|---|---|---|');
    for (const reference of references.filter((r) => r.file === file && !r.problem && r.anchor && r.kind !== 'built-in')) {
      const key = `${file}|${reference.line}|${reference.owner}|${reference.member ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const name = reference.member ? `"${reference.owner}".${reference.member}` : `"${reference.owner}"`;
      print(
        `| ${reference.line} | ${name} | ${reference.kind} | ${reference.signature ? `\`${reference.signature.replace(/\|/g, '\\|')}\`` : ''} | [source](${reference.anchor}) |`,
      );
    }
  }
  return errors.length ? 1 : 0;
}

let exitCode = 0;
const names = option('--name');
if (names) {
  nameAudit(names.split(',').map((name) => name.trim()).filter(Boolean));
} else {
  const files = args.includes('--all')
    ? apiCheckedFiles(root)
    : positional.length
      ? positional.map((file) => path.resolve(root, file))
      : changedFiles(option('--base') ?? 'main');
  const missing = files.filter((file) => !fs.existsSync(file));
  if (missing.length) {
    console.error(`docs:api-review: no such file: ${missing.map(relative).join(', ')}`);
    process.exit(1);
  }
  exitCode = review(files);
}

const report = `${output.join('\n')}\n`;
process.stdout.write(report);
const out = option('--out');
if (out) fs.writeFileSync(path.resolve(root, out), report);
process.exit(exitCode);
