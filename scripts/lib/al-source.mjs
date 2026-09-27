// Minimal AL source reader for the documentation harness.
//
// This is not an AL compiler. It reads object headers, procedure and event
// signatures, enum values, table fields, and access modifiers well enough to
// build the public API manifest and to find API references in doc samples.

/** Replace comments and string literals with spaces, keeping offsets and line breaks. */
export function maskAl(source, { keepStrings = false } = {}) {
  let out = '';
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') {
        out += ' ';
        i++;
      }
      continue;
    }
    if (ch === '/' && next === '*') {
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        out += source[i] === '\n' ? '\n' : ' ';
        i++;
      }
      out += '  ';
      i += 2;
      continue;
    }
    if (ch === "'") {
      out += keepStrings ? ch : "'";
      i++;
      while (i < source.length) {
        if (source[i] === "'" && source[i + 1] === "'") {
          out += keepStrings ? "''" : '  ';
          i += 2;
          continue;
        }
        if (source[i] === "'") break;
        out += keepStrings || source[i] === '\n' ? source[i] : ' ';
        i++;
      }
      if (i < source.length) {
        out += "'";
        i++;
      }
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

export function lineAt(source, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i++) if (source[i] === '\n') line++;
  return line;
}

/** Split a parenthesised argument list on top-level separators. */
export function splitTopLevel(text, separator) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (const ch of text) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === separator && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim() || parts.length) parts.push(current);
  return parts.map((part) => part.trim()).filter((part, index, all) => part || all.length > 1);
}

/** Return the index of the parenthesis that closes the one at `open`, or -1. */
export function matchParen(text, open) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function unquote(name) {
  return name.trim().replace(/^"(.*)"$/, '$1');
}

const OBJECT_HEADER =
  /^(codeunit|interface|enum|table|page|permissionset|report|query|xmlport|enumextension|tableextension|pageextension)\b[ \t]+(?:(\d+)[ \t]+)?("[^"]+"|[A-Za-z_]\w*)([^\n]*)$/gim;

const PROCEDURE =
  /^([ \t]*)((?:\[[^\]\n]*\][ \t]*\n[ \t]*)*)(?:(local|internal|protected)[ \t]+)?procedure[ \t]+("[^"]+"|[A-Za-z_]\w*)[ \t]*\(/gim;

function parseParameters(text) {
  if (!text.trim()) return [];
  return splitTopLevel(text, ';').map((part) => {
    const match = part.match(/^(var\s+)?("[^"]+"|[A-Za-z_]\w*)\s*:\s*([\s\S]+)$/i);
    if (!match) return { name: part.trim(), type: '' };
    const parameter = { name: unquote(match[2]), type: match[3].replace(/\s+/g, ' ').trim() };
    if (match[1]) parameter.var = true;
    return parameter;
  });
}

function objectAccess(body) {
  // Object-level properties appear before the first nested section or procedure.
  const head = body.split(/\n[ \t]*(?:fields|keys|layout|actions|procedure|local procedure|internal procedure|protected procedure|value\(|\[)/i)[0];
  const match = head.match(/^[ \t]*Access[ \t]*=[ \t]*(\w+)[ \t]*;/im);
  return match ? match[1] : 'Public';
}

/**
 * Parse one AL file into object descriptions. `file` is stored as the source
 * anchor path and is not read from disk.
 */
export function parseAlObjects(source, file) {
  const masked = maskAl(source, { keepStrings: true });
  const headers = [...masked.matchAll(OBJECT_HEADER)];
  const objects = [];
  headers.forEach((header, index) => {
    const start = header.index;
    const end = index + 1 < headers.length ? headers[index + 1].index : masked.length;
    const body = masked.slice(start, end);
    const type = header[1].toLowerCase();
    const object = {
      type,
      id: header[2] ? Number(header[2]) : undefined,
      name: unquote(header[3]),
      access: objectAccess(body),
      file,
      line: lineAt(masked, start),
    };
    const implementsMatch = header[4].match(/implements\s+(.+)$/i);
    if (implementsMatch) object.implements = splitTopLevel(implementsMatch[1], ',').map(unquote);

    if (type === 'enum') {
      object.extensible = /^[ \t]*Extensible[ \t]*=[ \t]*true/im.test(body);
      object.values = [...body.matchAll(/value\(\s*(\d+)\s*;\s*("[^"]+"|[A-Za-z_]\w*)\s*\)/gi)].map((m) => ({
        ordinal: Number(m[1]),
        name: unquote(m[2]),
      }));
    }

    if (type === 'table') {
      object.fields = [];
      for (const m of body.matchAll(/field\(\s*(\d+)\s*;\s*("[^"]+"|[A-Za-z_]\w*)\s*;\s*([^)]+)\)\s*\{([^}]*)\}/gi)) {
        const access = m[4].match(/Access\s*=\s*(\w+)\s*;/i)?.[1] ?? 'Public';
        object.fields.push({ id: Number(m[1]), name: unquote(m[2]), type: m[3].trim(), access });
      }
    }

    if (type === 'permissionset') {
      object.assignable = /^[ \t]*Assignable[ \t]*=[ \t]*true/im.test(body);
    }

    object.procedures = [];
    object.events = [];
    for (const m of body.matchAll(PROCEDURE)) {
      const open = m.index + m[0].length - 1;
      const close = matchParen(body, open);
      if (close < 0) continue;
      const attributes = m[2] ?? '';
      const modifier = (m[3] ?? '').toLowerCase();
      const after = body.slice(close + 1).match(/^[ \t]*(?::[ \t]*([^\n;]+?))?[ \t]*(?:;|\n)/);
      const returns = after?.[1]?.trim();
      const entry = {
        name: unquote(m[4]),
        params: parseParameters(body.slice(open + 1, close)),
        line: lineAt(masked, start + m.index + m[1].length + attributes.length),
      };
      if (returns) entry.returns = returns;
      const eventKind = attributes.match(/\[(IntegrationEvent|BusinessEvent|InternalEvent)\b/i)?.[1];
      if (/\[Obsolete\b/i.test(attributes)) entry.obsolete = true;
      if (eventKind) {
        entry.kind = eventKind;
        entry.access = eventKind === 'InternalEvent' || modifier === 'internal' ? 'Internal' : 'Public';
        object.events.push(entry);
      } else {
        entry.access =
          type === 'interface'
            ? 'Public'
            : modifier === 'local'
              ? 'Local'
              : modifier === 'internal'
                ? 'Internal'
                : modifier === 'protected'
                  ? 'Protected'
                  : 'Public';
        object.procedures.push(entry);
      }
    }
    objects.push(object);
  });
  return objects;
}
