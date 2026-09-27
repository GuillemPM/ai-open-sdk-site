import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { parseAlObjects } from '../lib/al-source.mjs';
import { ApiIndex, checkAlCode, checkMdx, loadAliases, loadManifest, loadPin } from '../lib/public-api.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixtures = path.join(root, 'scripts/tests/fixtures/toolset');
const index = new ApiIndex(loadManifest(root));
const aliases = loadAliases(root);
const read = (...parts) => fs.readFileSync(path.join(...parts), 'utf8');

function problems(file, source = read(file)) {
  const references = file.endsWith('.mdx') ? checkMdx(source, { index, aliases }) : checkAlCode(source, { index, aliases });
  return references.filter((reference) => reference.problem).map((reference) => `${reference.line}: ${reference.problem}`);
}

function assertProblem(list, pattern) {
  assert.ok(
    list.some((problem) => pattern.test(problem)),
    `expected a problem matching ${pattern}, got:\n${list.join('\n') || '(none)'}`,
  );
}

test('manifest was generated from the pinned SDK commit', () => {
  const pin = loadPin(root);
  assert.equal(loadManifest(root, pin).source.commit, pin.commit);
  assert.match(pin.commit, /^[0-9a-f]{40}$/);
});

test('manifest records Tool Set ownership as declared in the SDK', () => {
  const toolSet = index.object('AIOS Tool Set');
  const publicNames = new Set(toolSet.procedures.filter((p) => p.access === 'Public').map((p) => p.name));
  for (const name of ['Add', 'Use', 'Execute', 'GetDefinitions', 'Count', 'HasTool', 'ClearTools']) {
    assert.ok(publicNames.has(name), `Tool Set should expose ${name}`);
  }
  assert.ok(!publicNames.has('ToolDefinition'));
  assert.ok(!publicNames.has('Register'));
  assert.equal(toolSet.procedures.find((p) => p.name === 'SetHandler')?.access, 'Local');
  assert.ok(index.object('AIOS Schema').procedures.some((p) => p.name === 'ToolDefinition' && p.access === 'Public'));
});

test('old Tool Set page fails for every wrong reference', () => {
  const list = problems(path.join(fixtures, 'before/tools.mdx'));
  assertProblem(list, /"AIOS Tool Set" has no ToolDefinition\. It is declared on "AIOS Schema"/);
  assertProblem(list, /qualify ToolDefinition with its owner; it is public on "AIOS Schema"/);
  assertProblem(list, /"AIOS Tool Set" has no public member named Register/);
  assertProblem(list, /SetHandler on "AIOS Tool Set" is local, so consumers cannot call it/);
});

test('old Tool Set page without owner comments fails on its procedure tables', () => {
  const source = read(fixtures, 'before/tools.mdx').replace(/\{\/\* api-owner: [^*]*\*\/\}\n\n/g, '');
  assertProblem(problems(path.join(fixtures, 'before/tools.mdx'), source), /a "Procedure" table needs an owner/);
});

test('old Tool Set samples fail on ToolSet.ToolDefinition', () => {
  for (const file of ['AddDefinition.al', 'MyAppTools.al']) {
    assertProblem(problems(path.join(fixtures, 'before', file)), /"AIOS Tool Set" has no ToolDefinition\. It is declared on "AIOS Schema"/);
  }
});

test('corrected Tool Set page and samples pass', () => {
  for (const file of ['tools.mdx', 'AddDefinition.al', 'MyAppTools.al']) {
    assert.deepEqual(problems(path.join(fixtures, 'after', file)), [], file);
  }
});

test('live Tool Set page and samples pass', () => {
  const live = path.join(root, 'content/docs/concepts');
  for (const file of ['tools.mdx', ...fs.readdirSync(path.join(live, 'samples/tools')).map((name) => `samples/tools/${name}`)]) {
    assert.deepEqual(problems(path.join(live, file)), [], file);
  }
});

test('ownership check catches arity, visibility, object type, enum, event, and interface mistakes', () => {
  const al = (code) => problems('inline.al', code);
  assertProblem(al("ToolSet.Add('echo', 'Echoes');"), /"AIOS Tool Set"\.Add takes 1 or 3 argument\(s\), not 2/);
  assertProblem(al('Binder: Codeunit "AIOS Json Binder";'), /"AIOS Json Binder" is internal to its app/);
  assertProblem(al('Request: Codeunit "AIOS Chat Request";'), /"AIOS Chat Request" is a table, not Codeunit/);
  assertProblem(al('ErrorType := "AIOS Error Type"::Throttled;'), /"AIOS Error Type" has no value named Throttled/);
  assertProblem(
    al(
      "[EventSubscriber(ObjectType::Codeunit, Codeunit::\"AIOS Tool Set\", 'OnExecuteTool', '', false, false)]\n" +
        'local procedure Handle(Name: Text)\nbegin\nend;',
    ),
    /"AIOS Tool Set" has no public member named OnExecuteTool/,
  );
  assertProblem(
    al(
      "[EventSubscriber(ObjectType::Codeunit, Codeunit::\"AIOS Tool Set\", 'OnBeforeExecuteTool', '', false, false)]\n" +
        'local procedure Handle(Name: Text; ResultText: Text)\nbegin\nend;',
    ),
    /subscriber parameter ResultText must be var/,
  );
  assertProblem(
    al('codeunit 50100 "My Tool" implements "AIOS Tool"\n{\n    procedure Name(): Text\n    begin\n    end;\n}'),
    /"My Tool" implements "AIOS Tool" but does not declare Execute/,
  );
  assert.deepEqual(al('Mine: Codeunit "My Tools";\nbegin\n    Mine.Register(1, 2);\nend;'), [], 'consumer objects are not checked');
});

test('bare SDK calls outside an owner scope fail', () => {
  const mdx = (body) => problems('inline.mdx', `---\ntitle: T\ndescription: D\n---\n\n${body}\n`);
  assertProblem(mdx('Call `GenerateText(Model, Request)` to send it.'), /GenerateText has no owner in scope.*public on "AIOS Client"/);
  assertProblem(mdx('- `SetMaxRetries(0)`'), /SetMaxRetries has no owner in scope/);
  assertProblem(mdx('Then call `Register(Tool)`.'), /Register has no owner in scope and is not public on any SDK object/);
  assertProblem(
    mdx('{/* api-owner: "AIOS Client" */}\n\n- `GenerateText(Model, Request)`\n\n## Next\n\n- `GenerateText(Model, Request)`'),
    /^12: GenerateText has no owner in scope/,
  );
  assert.deepEqual(mdx('{/* api-owner: "AIOS Client" */}\n\n- `GenerateText(Model, Request)`'), [], 'owner comment');
  assert.deepEqual(mdx('Call `Client.GenerateText(Model, Request)`.'), [], 'qualified call');
  assert.deepEqual(mdx('Use `Clear(Request)` to start over.'), [], 'AL global method');
  assert.deepEqual(mdx('{/* api-owner: none */}\n\nYour own `RegisterTools()` procedure.'), [], 'explicit opt-out');
  assert.deepEqual(
    mdx('| Object | Role |\n|---|---|\n| `"AIOS Tool Handler"` | `GetDefinitions()` + `Execute(Name, ...)` |'),
    [],
    'a quoted object in the first cell owns the row',
  );
  assertProblem(
    mdx('{/* api-owner: "AIOS Tool Set" */}\n\n| Procedure | Behavior |\n|---|---|\n| `Register(Tool)` | adds a tool |'),
    /"AIOS Tool Set" has no public member named Register/,
  );
});

test('Examples app objects are demos, not SDK API', () => {
  const mdx = (body) => problems('inline.mdx', `---\ntitle: T\ndescription: D\n---\n\n${body}\n`);
  const demo = /"AIOS Usage Example" is a demo object from the Examples app/;
  assert.equal(index.object('AIOS Usage Example').role, 'examples');
  assert.deepEqual(index.publicOwners('RunTools_UseHandler'), [], 'demo procedures have no public SDK owner');
  assertProblem(problems('inline.al', 'Demo: Codeunit "AIOS Usage Example";'), demo);
  assertProblem(mdx('See `"AIOS Usage Example"`.'), demo);
  assertProblem(mdx('{/* api-owner: "AIOS Usage Example" */}\n\n| Procedure | Pattern |\n|---|---|\n| `RunTools_UseHandler` | x |'), demo);
  assert.deepEqual(
    mdx(
      '{/* api-demo: "AIOS Usage Example" */}\n\nSee `"AIOS Usage Example"`.\n\n' +
        '{/* api-owner: "AIOS Usage Example" */}\n\n| Procedure | Pattern |\n|---|---|\n| `RunTools_UseHandler` | x |',
    ),
    [],
    'declared demo references pass',
  );
  assertProblem(
    mdx('{/* api-demo: "AIOS Usage Example" */}\n\n{/* api-owner: "AIOS Usage Example" */}\n\n| Procedure | Pattern |\n|---|---|\n| `RunTools_Missing` | x |'),
    /"AIOS Usage Example" has no public member named RunTools_Missing/,
  );
  assertProblem(mdx('{/* api-demo: "AIOS Usage Example" */}\n\nSee `"AIOS Toolkit Demo"`.'), /"AIOS Toolkit Demo" is a demo object/);
});

test('api-review exits nonzero for an unowned API claim', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'api-review-'));
  const page = path.join(directory, 'unowned.mdx');
  try {
    fs.writeFileSync(page, '---\ntitle: T\ndescription: D\n---\n\nCall `GenerateText(Model, Request)`.\n');
    const run = spawnSync(process.execPath, ['scripts/api-review.mjs', page], { cwd: root, encoding: 'utf8' });
    assert.equal(run.status, 1, run.stdout + run.stderr);
    assert.match(run.stdout, /## Problems \(1\)/);
    assert.match(run.stdout, /GenerateText has no owner in scope/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('AL reader keeps access modifiers, events, and object access', () => {
  const [object] = parseAlObjects(
    [
      'codeunit 50100 "AIOS Sample"',
      '{',
      '    Access = Internal;',
      '',
      '    procedure Visible(Value: Text; var Result: Integer): Boolean',
      '    begin',
      '    end;',
      '',
      '    [IntegrationEvent(false, false)]',
      '    local procedure OnSomething(var Handled: Boolean)',
      '    begin',
      '    end;',
      '',
      '    local procedure Hidden()',
      '    begin',
      '    end;',
      '}',
    ].join('\n'),
    'Sample.Codeunit.al',
  );
  assert.equal(object.access, 'Internal');
  assert.deepEqual(
    object.procedures.map((p) => [p.name, p.access, p.params.length, p.returns ?? '']),
    [
      ['Visible', 'Public', 2, 'Boolean'],
      ['Hidden', 'Local', 0, ''],
    ],
  );
  assert.deepEqual(object.events.map((e) => [e.name, e.access, e.params[0].var]), [['OnSomething', 'Public', true]]);
});
