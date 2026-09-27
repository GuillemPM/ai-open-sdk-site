import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { ApiIndex, apiCheckedFiles, applyExceptions, checkFiles, formatProblem, loadAliases, loadManifest, loadPin } from './lib/public-api.mjs';

const root = process.cwd();
const contentRoots = ['content/docs', 'content/learn'];
const errors = [];
const warnings = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function report(list, file, message) {
  list.push(`${relative(file)}: ${message}`);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    report(errors, file, `invalid JSON (${error.message})`);
    return null;
  }
}

const policy = readJson(path.join(root, 'docs/docs-policy.json')) ?? { forbiddenTerms: [] };
const mdxFiles = contentRoots.flatMap((directory) =>
  walk(path.join(root, directory)).filter((file) => file.endsWith('.mdx')),
);
const sampleFiles = contentRoots.flatMap((directory) =>
  walk(path.join(root, directory)).filter(
    (file) => file.endsWith('.al') && file.split(path.sep).includes('samples'),
  ),
);
const includedSamples = new Set();

for (const file of mdxFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) {
    report(errors, file, 'missing frontmatter');
  } else {
    for (const field of ['title', 'description']) {
      const value = frontmatter[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
      if (!value || !value[1].trim()) report(errors, file, `frontmatter needs ${field}`);
    }
  }

  for (const match of source.matchAll(/<include\b([^>]*)>([^<]+)<\/include>/g)) {
    const attributes = match[1];
    const includePath = match[2].trim();
    const target = path.resolve(path.dirname(file), includePath);
    const title = attributes.match(/meta=['"][^'"]*title=['"]([^'"]+)['"]/);
    if (!fs.existsSync(target)) {
      report(errors, file, `include does not exist: ${includePath}`);
      continue;
    }
    includedSamples.add(path.normalize(target));
    if (title && title[1] !== path.basename(target)) {
      report(errors, file, `include title ${title[1]} does not match ${path.basename(target)}`);
    }
  }

  for (const rule of policy.forbiddenTerms ?? []) {
    if (source.toLowerCase().includes(rule.term.toLowerCase())) {
      report(errors, file, `contains ${rule.term}: ${rule.reason}`);
    }
  }

  if (/[—–…“”‘’]/u.test(source)) report(errors, file, 'contains disallowed curly punctuation');
  if (/[^\s][ \t]-[ \t]/.test(source)) report(errors, file, 'contains a spaced hyphen used as an aside');
}

for (const file of sampleFiles) {
  if (!includedSamples.has(path.normalize(file))) {
    report(warnings, file, 'sample is not included by an MDX page');
  }
}

for (const directory of contentRoots) {
  for (const file of walk(path.join(root, directory)).filter((candidate) => candidate.endsWith('meta.json'))) {
    const meta = readJson(file);
    if (!meta || !Array.isArray(meta.pages)) continue;
    for (const page of meta.pages) {
      if (page.startsWith('...')) {
        report(errors, file, `navigation must nest folders by name, not ${page}`);
        continue;
      }
      const base = path.join(path.dirname(file), page);
      const exists =
        fs.existsSync(`${base}.mdx`) ||
        fs.existsSync(path.join(base, 'index.mdx')) ||
        fs.existsSync(path.join(base, 'meta.json'));
      if (!exists) report(errors, file, `navigation entry does not exist: ${page}`);
    }
  }
}

// Public API ownership: every SDK reference must resolve against the manifest
// generated from the pinned AL-AI-Toolkit commit (docs/sdk-source.json).
const pin = loadPin(root);
const manifest = loadManifest(root, pin);
if (manifest.source?.commit !== pin.commit) {
  errors.push(
    `${pin.manifest}: generated from ${manifest.source?.commit}, but docs/sdk-source.json pins ${pin.commit}. ` +
      'Run pnpm docs:api-sync --sdk <checkout> --write.',
  );
}
const apiReferences = checkFiles(apiCheckedFiles(root), { root, index: new ApiIndex(manifest), aliases: loadAliases(root) });
const apiProblems = applyExceptions(apiReferences, root);
for (const reference of apiProblems.errors) errors.push(formatProblem(reference));
for (const reference of apiProblems.excepted) warnings.push(`${formatProblem(reference)} [policy exception]`);

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`docs:check failed with ${errors.length} error(s)`);
  process.exit(1);
}

console.log(
  `docs:check passed (${mdxFiles.length} pages, ${sampleFiles.length} samples, ` +
    `${apiReferences.length} API references checked against ${pin.commit.slice(0, 12)})`,
);
