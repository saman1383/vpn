import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';
const run = args => spawnSync('bash', ['install.sh', ...args], { cwd: new URL('..', import.meta.url), encoding: 'utf8', timeout: 5000 });

test('installer shell syntax and help', () => {
  assert.equal(spawnSync('bash', ['-n', 'install.sh']).status, 0);
  const result = run(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /front-end demo only/);
  assert.match(result.stdout, /--dry-run/);
});

test('HTTP dry run validates and creates no deployment files', () => {
  const before = existsSync('.deploy') ? readdirSync('.deploy') : [];
  const result = run(['--yes', '--dry-run', '--port', '9090', '--name', 'vira-test']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /0\.0\.0\.0:9090/);
  assert.match(result.stdout, /no changes made/);
  assert.deepEqual(existsSync('.deploy') ? readdirSync('.deploy') : [], before);
});

test('HTTPS dry run restricts direct HTTP binding to localhost', () => {
  const result = run(['--dry-run', '--domain', 'vpn.example.com', '--email', 'owner@example.com']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /127\.0\.0\.1:8080/);
  assert.match(result.stdout, /https:\/\/vpn\.example\.com/);
});

for (const args of [
  ['--port', '0'], ['--port', '65536'], ['--port', 'abc'], ['--port', '-1'],
  ['--name', '../unsafe'], ['--name', 'UPPER'], ['--domain'], ['--unknown'],
  ['--domain', 'https://example.com', '--email', 'a@example.com'],
  ['--domain', 'example.com'],
  ['--domain', 'example..com', '--email', 'a@example.com'],
  ['--domain', 'example.com/path', '--email', 'a@example.com'],
  ['--domain', 'example.com\nBIND_ADDRESS=0.0.0.0', '--email', 'a@example.com'],
  ['--domain', '127.0.0.1', '--email', 'a@example.com'],
  ['--domain', '-unsafe.example.com', '--email', 'a@example.com'],
  ['--domain', 'example.com', '--email', 'invalid'],
  ['--domain', 'example.com', '--email', 'a@example.com', '--port', '443'],
  ['--domain', 'example.com', '--email', 'a@example.com', '--port', '80'],
  ['--email', 'a@example.com'],
]) {
  test(`installer rejects unsafe/invalid input: ${JSON.stringify(args)}`, () => {
    const result = run(['--dry-run', ...args]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Error:/);
  });
}


test('deployment configuration parses and preserves isolation/HTTPS defaults', () => {
  const config = parse(readFileSync('compose.yaml', 'utf8'));
  assert.deepEqual(Object.keys(config.services), ['web', 'proxy']);
  assert.equal(config.services.web.read_only, true);
  assert.deepEqual(config.services.web.cap_drop, ['ALL']);
  assert.ok(config.services.web.tmpfs[0].startsWith('/tmp:'));
  assert.deepEqual(config.services.proxy.profiles, ['https']);
  assert.ok(config.services.proxy.ports.includes('443:443'));
  assert.equal(config.services.web.labels['io.vira.installer'], 'true');
  assert.equal(config.services.proxy.labels['io.vira.installer'], 'true');
  const dockerfile = readFileSync('Dockerfile', 'utf8');
  assert.match(dockerfile, /USER nginx/);
  assert.match(dockerfile, /HEALTHCHECK/);
  assert.match(dockerfile, /npm ci/);
  const nginx = readFileSync('deploy/nginx.conf', 'utf8');
  assert.match(nginx, /listen 8080/);
  assert.match(nginx, /location = \/healthz/);
});
