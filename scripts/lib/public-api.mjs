// Public API ownership checks for MDX pages and AL samples.
//
// Every SDK reference in the docs must resolve against docs/public-api.json,
// the manifest generated from the pinned AL-AI-Toolkit commit. A reference
// fails when the object does not exist, the member is not declared on that
// object, the member is not callable by a consumer (local, internal,
// protected, or on an internal object), or no overload takes that many
// arguments. Objects from the Examples app (role "examples") are demos, not
// API: a page may name them only after declaring them with api-demo.

import fs from 'node:fs';
import path from 'node:path';
import { lineAt, maskAl, matchParen, parseAlObjects, splitTopLevel, unquote } from './al-source.mjs';

export function loadPin(root) {
  return JSON.parse(fs.readFileSync(path.join(root, 'docs/sdk-source.json'), 'utf8'));
}

export function loadManifest(root, pin = loadPin(root)) {
  return JSON.parse(fs.readFileSync(path.join(root, pin.manifest), 'utf8'));
}

/** Stable, reviewable JSON: one line per procedure, event, value, or field. */
export function formatManifest(manifest) {
  return `${JSON.stringify(
    manifest,
    (key, value) =>
      ['procedures', 'events', 'values', 'fields'].includes(key) && Array.isArray(value)
        ? value.map((entry) => `\u0000${JSON.stringify(entry)}`)
        : value,
    2,
  ).replace(/"\\u0000((?:[^"\\]|\\.)*)"/g, (_, encoded) => JSON.parse(`"${encoded}"`))}\n`;
}

// AL built-in members that exist on every object of a given kind.
const BUILT_INS = {
  table: new Set(
    [
      'Init', 'Insert', 'Modify', 'Delete', 'DeleteAll', 'ModifyAll', 'Get', 'Find', 'FindFirst', 'FindLast', 'FindSet',
      'Next', 'Reset', 'SetRange', 'SetFilter', 'GetFilter', 'GetFilters', 'Count', 'IsEmpty', 'IsTemporary',
      'TransferFields', 'Validate', 'TestField', 'CalcFields', 'SetAutoCalcFields', 'Copy', 'Rename', 'LockTable',
      'SetCurrentKey', 'SetLoadFields', 'FieldNo', 'FieldCaption', 'TableCaption', 'TableName', 'RecordId', 'SystemId',
      'Mark', 'MarkedOnly', 'ClearMarks', 'FilterGroup', 'HasFilter', 'CopyFilters', 'Ascending', 'ReadIsolation',
    ].map((name) => name.toLowerCase()),
  ),
  codeunit: new Set(['run']),
  interface: new Set(),
  enum: new Set(['ordinals', 'names', 'fromInteger', 'asInteger'].map((name) => name.toLowerCase())),
};

// AL global methods that a page may call bare without an owner in scope.
const AL_GLOBAL_METHODS = new Set(
  [
    'Clear', 'ClearAll', 'Error', 'Message', 'Confirm', 'StrMenu', 'Format', 'Evaluate', 'StrSubstNo', 'StrLen',
    'CopyStr', 'SelectStr', 'StrPos', 'LowerCase', 'UpperCase', 'DelChr', 'PadStr', 'ConvertStr', 'IncStr',
    'Round', 'Abs', 'Power', 'Random', 'Today', 'Time', 'WorkDate', 'CurrentDateTime', 'CreateDateTime', 'CalcDate',
    'CreateGuid', 'IsNullGuid', 'Commit', 'Sleep', 'GuiAllowed', 'UserId', 'CompanyName', 'GetLastErrorText',
    'ClearLastError',
  ].map((name) => name.toLowerCase()),
);

export const DEMO_PROBLEM = 'is a demo object from the Examples app, not SDK API';

function demoProblem(object) {
  return `"${object.name}" ${DEMO_PROBLEM}. Consumers do not install that app; name it only on a page that declares {/* api-demo: "${object.name}" */}`;
}

const OBJECT_KEYWORDS = {
  codeunit: 'codeunit',
  record: 'table',
  interface: 'interface',
  enum: 'enum',
  page: 'page',
  report: 'report',
  query: 'query',
  permissionset: 'permissionset',
  xmlport: 'xmlport',
};

export class ApiIndex {
  constructor(manifest) {
    this.manifest = manifest;
    this.prefix = manifest.objectPrefix;
    this.all = manifest.objects;
    this.byName = new Map();
    for (const object of manifest.objects) {
      const key = object.name.toLowerCase();
      this.byName.set(key, [...(this.byName.get(key) ?? []), object]);
    }
  }

  /**
   * AL object names are unique per object type, so "AIOS Mock" can be both a
   * codeunit and a permission set. Without a type, prefer the object a call
   * or variable would bind to.
   */
  object(name, type) {
    const candidates = this.byName.get(name.toLowerCase()) ?? [];
    if (type) return candidates.find((object) => object.type === type) ?? candidates[0];
    const rank = ['codeunit', 'table', 'interface', 'enum', 'page', 'report', 'query', 'xmlport', 'permissionset'];
    return [...candidates].sort((a, b) => rank.indexOf(a.type) - rank.indexOf(b.type))[0];
  }

  isSdkName(name) {
    return name.startsWith(this.prefix) || this.byName.has(name.toLowerCase());
  }

  /** Public objects (other than `except`) that declare a public procedure named `member`. */
  publicOwners(member, except) {
    const owners = [];
    for (const object of this.all) {
      if (object.access !== 'Public' || object.role !== 'sdk' || object === except) continue;
      if (object.procedures.some((p) => p.name.toLowerCase() === member.toLowerCase() && p.access === 'Public')) {
        owners.push(object.name);
      }
    }
    return owners;
  }

  anchor(object, entry) {
    const { repository, commit } = this.manifest.source;
    return `${repository}/blob/${commit}/${object.file}#L${entry?.line ?? object.line}`;
  }
}

function describeArity(overloads) {
  const counts = [...new Set(overloads.map((p) => p.params.length))].sort((a, b) => a - b);
  return counts.length === 1 ? `${counts[0]}` : `${counts.slice(0, -1).join(', ')} or ${counts.at(-1)}`;
}

function signature(entry) {
  return `${entry.name}(${entry.params.map((p) => `${p.var ? 'var ' : ''}${p.name}: ${p.type}`).join('; ')})${
    entry.returns ? `: ${entry.returns}` : ''
  }`;
}

/**
 * Resolve `Owner.Member(args)` against the manifest. Returns a reference
 * record; `problem` is set when the docs would mislead a consumer.
 */
export function resolveMember(index, ownerName, member, argCount) {
  const reference = resolveDeclaredMember(index, ownerName, member, argCount);
  const object = index.object(ownerName);
  // A wrong member on a demo object stays an error even on an api-demo page.
  if (object?.access === 'Public' && object.role === 'examples' && !reference.problem) {
    return { ...reference, demo: true, problem: demoProblem(object) };
  }
  return reference;
}

function resolveDeclaredMember(index, ownerName, member, argCount) {
  const object = index.object(ownerName);
  const reference = { owner: ownerName, member, kind: 'procedure' };
  if (!object) {
    reference.problem = `"${ownerName}" is not an object in the pinned SDK`;
    return reference;
  }
  reference.owner = object.name;
  if (object.access !== 'Public') {
    reference.problem = `"${object.name}" is ${object.access.toLowerCase()} to its app, so consumers cannot use ${member}`;
    return reference;
  }
  const lower = member.toLowerCase();

  if (object.type === 'enum') {
    const value = object.values.find((v) => v.name.toLowerCase() === lower);
    if (value) return { ...reference, kind: 'enum value', member: value.name, anchor: index.anchor(object) };
  }
  if (object.type === 'table') {
    const field = object.fields.find((f) => f.name.toLowerCase() === lower);
    if (field && argCount === undefined) {
      if (field.access !== 'Public') reference.problem = `field "${field.name}" on "${object.name}" is ${field.access.toLowerCase()}`;
      return { ...reference, kind: 'field', member: field.name, anchor: index.anchor(object) };
    }
  }

  const declared = object.procedures.filter((p) => p.name.toLowerCase() === lower);
  const callable = declared.filter((p) => p.access === 'Public');
  const events = object.events.filter((p) => p.name.toLowerCase() === lower);

  if (callable.length) {
    const match = argCount === undefined ? callable : callable.filter((p) => p.params.length === argCount);
    if (!match.length) {
      reference.problem = `"${object.name}".${callable[0].name} takes ${describeArity(callable)} argument(s), not ${argCount}`;
    }
    const entry = match[0] ?? callable[0];
    return { ...reference, member: entry.name, signature: signature(entry), anchor: index.anchor(object, entry), problem: reference.problem };
  }
  if (events.length) {
    const event = events[0];
    return {
      ...reference,
      kind: 'event',
      member: event.name,
      signature: signature(event),
      anchor: index.anchor(object, event),
      problem:
        argCount !== undefined
          ? `${event.name} is an event on "${object.name}"; subscribe to it instead of calling it`
          : event.access !== 'Public'
            ? `${event.name} on "${object.name}" is an internal event`
            : undefined,
    };
  }
  if (BUILT_INS[object.type]?.has(lower)) return { ...reference, kind: 'built-in' };

  if (declared.length) {
    const others = index.publicOwners(member, object);
    reference.problem =
      `${declared[0].name} on "${object.name}" is ${declared[0].access.toLowerCase()}, so consumers cannot call it` +
      (others.length ? `. Public ${declared[0].name} exists on ${others.map((o) => `"${o}"`).join(', ')}` : '');
    return reference;
  }
  if (object.type === 'enum') {
    reference.problem = `"${object.name}" has no value named ${member}`;
    return reference;
  }
  const others = index.publicOwners(member, object);
  reference.problem = others.length
    ? `"${object.name}" has no ${member}. It is declared on ${others.map((o) => `"${o}"`).join(', ')}`
    : `"${object.name}" has no public member named ${member}`;
  return reference;
}

function checkObjectName(index, name, keyword) {
  const expected = keyword ? OBJECT_KEYWORDS[keyword.toLowerCase()] : undefined;
  const object = index.object(name, expected);
  if (!object) return { owner: name, kind: 'object', problem: `"${name}" is not an object in the pinned SDK` };
  const reference = { owner: object.name, kind: object.type, anchor: index.anchor(object) };
  if (expected && expected !== object.type) {
    reference.problem = `"${object.name}" is ${object.type === 'interface' ? 'an' : 'a'} ${object.type}, not ${keyword}`;
  } else if (object.access !== 'Public') {
    reference.problem = `"${object.name}" is ${object.access.toLowerCase()} to its app`;
  } else if (object.role === 'examples') {
    reference.demo = true;
    reference.problem = demoProblem(object);
  }
  return reference;
}

function countArgs(text) {
  if (/\.\.\./.test(text)) return undefined;
  return text.trim() ? splitTopLevel(text, ',').length : 0;
}

/**
 * Find variable declarations (`Name: Codeunit "X"`, parameters included) so a
 * sample's own declarations override the default alias map.
 */
function declarations(masked) {
  const declared = new Map();
  for (const m of masked.matchAll(/\b([A-Za-z_]\w*)\s*:\s*(?!=)([^;:)\n]+)/g)) {
    const type = m[2].trim();
    const object = type.match(/^(?:array\s*\[[^\]]*\]\s+of\s+)?(Codeunit|Record|Interface|Enum|Page|Report|Query)\s+("[^"]+"|[A-Za-z_]\w*)/i);
    declared.set(m[1].toLowerCase(), object ? unquote(object[2]) : null);
  }
  return declared;
}

/**
 * Check AL code (a colocated sample, a fenced block, or an inline code span).
 * `aliases` maps conventional variable names to SDK objects for fragments
 * that do not declare their variables.
 */
export function checkAlCode(source, { index, aliases = {}, lineOffset = 0 }) {
  const references = [];
  const add = (reference, offset) => references.push({ ...reference, line: lineOffset + lineAt(source, offset) });
  const masked = maskAl(source);
  const withStrings = maskAl(source, { keepStrings: true });
  const declared = declarations(masked);
  const receiverObject = (name) => {
    const lower = name.toLowerCase();
    if (declared.has(lower)) return declared.get(lower);
    const alias = Object.entries(aliases).find(([key]) => key.toLowerCase() === lower);
    return alias?.[1] ?? null;
  };

  // Typed object references: Codeunit "AIOS X", Record "AIOS X", Codeunit::"AIOS X".
  const typed = new Set();
  for (const m of masked.matchAll(/\b(Codeunit|Record|Interface|Enum|Page|Report|Query|PermissionSet|XmlPort)\s*(?:::)?\s*("[^"]+"|[A-Za-z_]\w*)/gi)) {
    const name = unquote(m[2]);
    if (!index.isSdkName(name)) continue;
    typed.add(m.index + m[0].length - m[2].length);
    add(checkObjectName(index, name, m[1]), m.index);
  }
  // Bare quoted SDK names (implements lists, permission set includes, prose).
  for (const m of masked.matchAll(/"([^"\n]+)"/g)) {
    if (typed.has(m.index) || !m[1].startsWith(index.prefix)) continue;
    const before = masked.slice(0, m.index);
    if (/::\s*$/.test(before) || /\.\s*$/.test(before)) continue;
    add(checkObjectName(index, m[1]), m.index);
  }

  // Enum values: "AIOS X"::Value and Enum::"AIOS X"::Value.
  for (const m of masked.matchAll(/"([^"]+)"\s*::\s*("[^"]+"|[A-Za-z_]\w*)/g)) {
    const object = index.object(m[1], 'enum');
    if (!object || object.type !== 'enum') continue;
    add({ ...resolveMember(index, object.name, unquote(m[2])), kind: 'enum value' }, m.index);
  }

  // Member access: Receiver.Member or Receiver.Member(args).
  for (const m of masked.matchAll(/(?<![\w."])("[^"\n]+"|[A-Za-z_]\w*)[ \t]*\.[ \t]*("[^"\n]+"|[A-Za-z_]\w*)(?![\w"])/g)) {
    const receiver = m[1];
    const owner = receiver.startsWith('"') ? unquote(receiver) : receiverObject(receiver);
    if (!owner || !index.isSdkName(owner)) continue;
    const rest = masked.slice(m.index + m[0].length);
    let argCount;
    const open = rest.match(/^\s*\(/);
    if (open) {
      const start = m.index + m[0].length + open[0].length - 1;
      const close = matchParen(masked, start);
      argCount = close < 0 ? undefined : countArgs(masked.slice(start + 1, close));
    }
    add(resolveMember(index, owner, unquote(m[2]), argCount), m.index);
  }

  // Event subscribers must name a public event and reuse its parameter names.
  for (const m of withStrings.matchAll(
    /\[EventSubscriber\(\s*ObjectType::(\w+)\s*,\s*\w+::("[^"]+"|[A-Za-z_]\w*)\s*,\s*'([^']*)'[^\]]*\]\s*(?:local\s+|internal\s+)?procedure\s+("[^"]+"|\w+)\s*\(/gi,
  )) {
    const owner = unquote(m[2]);
    if (!index.isSdkName(owner)) continue;
    const reference = resolveMember(index, owner, m[3]);
    if (!reference.problem && reference.kind !== 'event') {
      reference.problem = `${m[3]} on "${owner}" is not an event publisher`;
    }
    const object = index.object(owner);
    const event = object?.events.find((e) => e.name.toLowerCase() === m[3].toLowerCase());
    if (event && !reference.problem) {
      const open = m.index + m[0].length - 1;
      const close = matchParen(masked, open);
      const params = splitTopLevel(masked.slice(open + 1, close), ';');
      for (const param of params) {
        const p = param.match(/^(var\s+)?([A-Za-z_]\w*)\s*:/i);
        if (!p) continue;
        const published = event.params.find((e) => e.name.toLowerCase() === p[2].toLowerCase());
        if (!published) {
          reference.problem = `subscriber parameter ${p[2]} does not exist on ${event.name}(${event.params.map((e) => e.name).join(', ')})`;
        } else if (Boolean(published.var) !== Boolean(p[1])) {
          reference.problem = `subscriber parameter ${p[2]} must ${published.var ? '' : 'not '}be var to match ${event.name}`;
        }
      }
    }
    add(reference, m.index);
  }

  // Consumer codeunits that implement SDK interfaces must declare every method.
  for (const object of parseAlObjects(source, '')) {
    for (const name of object.implements ?? []) {
      const iface = index.object(name, 'interface');
      if (!iface || iface.type !== 'interface') continue;
      for (const method of iface.procedures) {
        const found = object.procedures.find(
          (p) => p.name.toLowerCase() === method.name.toLowerCase() && p.params.length === method.params.length,
        );
        references.push({
          owner: iface.name,
          member: method.name,
          kind: 'interface method',
          signature: signature(method),
          anchor: index.anchor(iface, method),
          line: lineOffset + object.line,
          problem: found ? undefined : `"${object.name}" implements "${iface.name}" but does not declare ${signature(method)}`,
        });
      }
    }
  }

  return references;
}

const OWNER_TABLE_HEADERS = /^\|\s*(Procedure|Method|Overload)s?\s*\|/i;

/**
 * Check an MDX page. Inline code spans are read as AL. A bare member such as
 * `Add(Tool)` is resolved against the object named by the closest preceding
 * `{/* api-owner: "AIOS X" *\/}` comment in the same section. A bare call with
 * no owner in scope is an error unless it is an AL global method or the
 * section opts out with `{/* api-owner: none *\/}`.
 */
export function checkMdx(source, { index, aliases = {} }) {
  const references = [];
  const lines = source.split('\n');
  const pageAliases = { ...aliases };
  for (const m of source.matchAll(/\{\/\*\s*api-alias:\s*([A-Za-z_]\w*)\s*=\s*"([^"]+)"\s*\*\/\}/g)) pageAliases[m[1]] = m[2];
  // Demo objects from the Examples app the page names on purpose.
  const demos = new Set();
  for (const m of source.matchAll(/\{\/\*\s*api-demo:\s*((?:"[^"]+"\s*,?\s*)+)\*\/\}/g)) {
    for (const name of m[1].matchAll(/"([^"]+)"/g)) demos.add(name[1].toLowerCase());
  }

  let owner = null;
  let optedOut = false;
  let fence = null;
  let fenceStart = 0;
  let inFrontmatter = lines[0] === '---';
  let tableOwnerChecked = false;

  lines.forEach((line, i) => {
    const lineNumber = i + 1;
    if (inFrontmatter) {
      if (i > 0 && line === '---') inFrontmatter = false;
      return;
    }
    const fenceMatch = line.match(/^\s*```(\w*)/);
    if (fenceMatch) {
      if (fence === null) {
        fence = fenceMatch[1].toLowerCase();
        fenceStart = i + 1;
      } else {
        if (fence === 'al') {
          const code = lines.slice(fenceStart, i).join('\n');
          references.push(...checkAlCode(code, { index, aliases: pageAliases, lineOffset: fenceStart }));
        }
        fence = null;
      }
      return;
    }
    if (fence !== null) return;

    if (/^#{1,6}\s/.test(line)) {
      owner = null;
      optedOut = false;
    }
    const annotation = line.match(/\{\/\*\s*api-owner:\s*(?:"([^"]+)"|(none))\s*\*\/\}/);
    if (annotation) {
      owner = annotation[1] ?? null;
      optedOut = !owner;
      if (owner) {
        const reference = checkObjectName(index, owner);
        references.push({ ...reference, line: lineNumber, annotation: true });
      }
    }

    const isTableRow = line.trimStart().startsWith('|');
    if (!isTableRow) tableOwnerChecked = false;
    if (isTableRow && !tableOwnerChecked) {
      tableOwnerChecked = true;
      const header = line.match(OWNER_TABLE_HEADERS);
      if (header && !owner) {
        references.push({
          kind: 'table',
          line: lineNumber,
          problem: `a "${header[1]}" table needs an owner: add {/* api-owner: "AIOS X" */} above it`,
        });
      }
    }
    const firstCell = isTableRow ? line.split('|')[1] ?? '' : '';

    // In prose, a quoted object earlier on the line (`"AIOS Schema"` owns
    // `ToolDefinition(...)`) takes precedence over the section owner. In a
    // table, a quoted object in the first cell owns the rest of the row.
    let lineOwner = null;
    const rowOwner = firstCell.trim().match(/^`"([^"]+)"`$/);
    if (rowOwner && index.object(rowOwner[1])) lineOwner = rowOwner[1];
    for (const span of line.matchAll(/`([^`]+)`/g)) {
      const code = span[1].trim();
      const quoted = code.match(/^"([^"]+)"$/);
      if (quoted && !isTableRow && index.object(quoted[1])) lineOwner = quoted[1];
      for (const reference of checkAlCode(code, { index, aliases: pageAliases })) {
        references.push({ ...reference, line: lineNumber, text: code });
      }
      // A bare SDK call nested in another call (`ToolSet.Add(ToolDefinition(...))`)
      // hides its owner from the reader, so it must be qualified.
      for (const nested of code.matchAll(/(?<![\w."])([A-Z][A-Za-z0-9_]*)\s*\(/g)) {
        if (nested.index === 0) continue;
        const owners = index.publicOwners(nested[1]);
        if (!owners.length) continue;
        references.push({
          kind: 'unqualified',
          member: nested[1],
          line: lineNumber,
          text: code,
          problem: `qualify ${nested[1]} with its owner; it is public on ${owners.map((o) => `"${o}"`).join(', ')}`,
        });
      }
      const bare = code.match(/^([A-Z][A-Za-z0-9_]*)(?:\s*\(([\s\S]*)\))?$/);
      const spanOwner = lineOwner ?? owner;
      if (!bare) continue;
      if (!spanOwner) {
        // A bare call with no owner is an unverified API claim. It needs an
        // owner comment, a qualified receiver, or an explicit opt-out.
        if (bare[2] === undefined || AL_GLOBAL_METHODS.has(bare[1].toLowerCase())) continue;
        const reference = { kind: 'unowned', member: bare[1], line: lineNumber, text: code };
        if (!optedOut) {
          const owners = index.publicOwners(bare[1]);
          reference.problem = owners.length
            ? `${bare[1]} has no owner in scope: add {/* api-owner: "AIOS X" */} above it or qualify the call. It is public on ${owners.map((o) => `"${o}"`).join(', ')}`
            : `${bare[1]} has no owner in scope and is not public on any SDK object: qualify it with its receiver, or mark the section {/* api-owner: none */} if it is not SDK API`;
        }
        references.push(reference);
        continue;
      }
      // In an owner's scope, read the first column of a table (the member
      // name) and bare calls in prose or lists. Other table columns describe
      // behavior and may mention members of other objects.
      const hasParens = bare[2] !== undefined;
      if (isTableRow ? !firstCell.includes(span[0]) : !hasParens) continue;
      const argCount = hasParens ? countArgs(bare[2]) : undefined;
      references.push({ ...resolveMember(index, spanOwner, bare[1], argCount), line: lineNumber, text: code, scoped: true });
    }
  });
  // References to declared demo objects are allowed; the review still lists them.
  for (const reference of references) {
    if (reference.demo && demos.has(reference.owner?.toLowerCase())) delete reference.problem;
  }
  return references;
}

/** Check every page and sample under the given roots. */
export function checkFiles(files, { root, index, aliases }) {
  const results = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const relative = path.relative(root, file).split(path.sep).join('/');
    const references = file.endsWith('.mdx') ? checkMdx(source, { index, aliases }) : checkAlCode(source, { index, aliases });
    for (const reference of references) results.push({ file: relative, ...reference });
  }
  return results;
}

/** Load the alias map from docs/docs-policy.json, skipping `$comment` keys. */
export function loadAliases(root) {
  const policy = JSON.parse(fs.readFileSync(path.join(root, 'docs/docs-policy.json'), 'utf8'));
  return Object.fromEntries(Object.entries(policy.apiAliases ?? {}).filter(([key]) => !key.startsWith('$')));
}

/** Pages and AL files whose API references must resolve against the manifest. */
export function apiCheckedFiles(root) {
  const walk = (directory) =>
    !fs.existsSync(directory)
      ? []
      : fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
          const full = path.join(directory, entry.name);
          return entry.isDirectory() ? walk(full) : [full];
        });
  return ['content/docs', 'content/learn', 'content/al']
    .flatMap((directory) => walk(path.join(root, directory)))
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.al'))
    .sort();
}

export function formatProblem(reference) {
  return `${reference.file}:${reference.line}: ${reference.problem}${reference.text ? ` (in \`${reference.text}\`)` : ''}`;
}

/**
 * Split problems into errors and documented exceptions from
 * docs/docs-policy.json `apiExceptions`. Exceptions stay visible as warnings.
 */
export function applyExceptions(references, root) {
  const policy = JSON.parse(fs.readFileSync(path.join(root, 'docs/docs-policy.json'), 'utf8'));
  const exceptions = policy.apiExceptions ?? [];
  const errors = [];
  const excepted = [];
  for (const reference of references) {
    if (!reference.problem) continue;
    const rule = exceptions.find((e) => reference.file.startsWith(e.path) && e.objects.includes(reference.owner));
    (rule ? excepted : errors).push(rule ? { ...reference, reason: rule.reason } : reference);
  }
  return { errors, excepted };
}
