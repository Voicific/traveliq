// Mocked-data self-test for the Vee structured lead capture tool.
//
// Simulates the ElevenLabs `capture_demo_lead` client_tool_call arguments
// (which arrive typed per the agent config — notably `confirmed` as the string
// "true"/"false", and a phone that may be a JSON number) and asserts that
// `processVeeLeadCall` behaves correctly WITHOUT a live voice conversation.
//
// Run:  node scripts/vee-lead-selftest.mjs
//
// It transpiles the real src/services/veeLeadTool.ts (no test runner needed)
// so it always exercises the shipping code, then cleans up.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const outDir = mkdtempSync(join(root, '.vee-selftest-'));

try {
  // Invoke tsc's JS entrypoint through Node directly — avoids the platform
  // .CMD/.ps1 shim, which execFileSync can't spawn on Windows.
  const tscJs = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
  execFileSync(process.execPath, [
    tscJs,
    'src/services/veeLeadTool.ts',
    '--outDir', outDir,
    '--module', 'esnext',
    '--target', 'es2020',
    '--moduleResolution', 'bundler',
    '--skipLibCheck',
  ], { stdio: 'inherit' });

  const { processVeeLeadCall } = await import(pathToFileURL(join(outDir, 'veeLeadTool.js')).href);

  let pass = 0, fail = 0;
  const expect = (label, params, wantOk) => {
    try {
      const r = processVeeLeadCall(params);
      const ok = r.ok === wantOk;
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${label} -> ok=${r.ok}${r.needsConfirmation ? ' needsConfirmation' : ''}`);
      ok ? pass++ : fail++;
    } catch (e) {
      console.log(`FAIL  ${label} -> THREW ${e.constructor.name}: ${e.message}`);
      fail++;
    }
  };

  const base = { visitorType: 'supplier', name: 'Jane Doe', email: 'jane.doe@example.com', company: 'Skyward' };

  console.log('=== confirmed="true" save must NOT throw for any param type ===');
  expect('phone STRING', { ...base, phone: '07700900123', confirmed: 'true' }, true);
  expect('phone NUMBER (the original bug)', { ...base, phone: 7700900123, confirmed: 'true' }, true);
  expect('company NUMBER', { ...base, company: 12345, phone: '07700900123', confirmed: 'true' }, true);
  expect('notes NUMBER', { ...base, notes: 999, phone: '07700900123', confirmed: 'true' }, true);
  expect('no phone', { ...base, confirmed: 'true' }, true);
  expect('confirmed boolean true (Gemini path)', { ...base, phone: '07700900123', confirmed: true }, true);

  console.log('=== two-step flow + intent gating still correct ===');
  expect('step1 confirmed="false" -> needsConfirmation', { ...base, phone: 7700900123, confirmed: 'false' }, false);
  expect('agent visitorType -> rejected', { visitorType: 'agent', name: 'A', email: 'a@b.com', confirmed: 'true' }, false);
  expect('visitorType NUMBER -> rejected cleanly', { visitorType: 123, name: 'A', email: 'a@b.com', confirmed: 'true' }, false);
  expect('missing name -> rejected', { visitorType: 'supplier', email: 'a@b.com', confirmed: 'true' }, false);
  expect('garbled email -> rejected', { ...base, email: 'not-an-email', confirmed: 'true' }, false);

  console.log(`\n${pass}/${pass + fail} assertions passed`);
  process.exitCode = fail ? 1 : 0;
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
