import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, demoData, loadData, nextId, canDelete, paymentTotals } from '../src/adminData.js';

test('all sample records have valid relations and unique IDs', () => {
  for (const kind of ['users','plans','servers','services','tickets','payments','logs']) {
    assert.equal(new Set(demoData[kind].map(r => r.id)).size, demoData[kind].length);
  }
  for (const service of demoData.services) {
    assert.ok(demoData.users.some(u => u.id === service.userId));
    assert.ok(demoData.plans.some(p => p.id === service.planId));
    assert.ok(demoData.servers.some(s => s.id === service.serverId));
    assert.ok(service.total > 0 && service.used <= service.total && service.days >= 0);
  }
  for (const record of [...demoData.tickets, ...demoData.payments]) {
    assert.ok(demoData.users.some(u => u.id === record.userId));
  }
});

test('deletion is blocked for users, plans and servers with dependent records', () => {
  assert.equal(canDelete(demoData, 'users', 1001), false);
  assert.equal(canDelete(demoData, 'plans', 1), false);
  assert.equal(canDelete(demoData, 'servers', 1), false);
  assert.equal(canDelete(demoData, 'servers', 3), true);
  const db = { ...demoData, services: [], tickets: [], payments: [] };
  assert.equal(canDelete(db, 'users', 1001), true);
  assert.equal(canDelete(db, 'plans', 1), true);
});

test('financial summaries exclude failed and pending payments from revenue', () => {
  assert.deepEqual(paymentTotals(demoData.payments), { paid: 737000, pending: 219000, refunded: 0 });
  const refunded = demoData.payments.map((p, i) => i === 0 ? { ...p, status: 'refunded' } : p);
  assert.deepEqual(paymentTotals(refunded), { paid: 518000, pending: 219000, refunded: 219000 });
  assert.deepEqual(paymentTotals([]), { paid: 0, pending: 0, refunded: 0 });
});

test('IDs are allocated after the maximum, not the row count', () => {
  assert.equal(nextId([]), 1);
  assert.equal(nextId([{ id: 40 }, { id: 3 }]), 41);
});

test('storage loader restores data, falls back safely, and clones defaults', () => {
  const original = globalThis.localStorage;
  try {
    globalThis.localStorage = { getItem: () => null };
    const fallback = loadData();
    fallback.users[0].name = 'Changed';
    assert.notEqual(demoData.users[0].name, 'Changed');
    globalThis.localStorage = { getItem: () => '{invalid' };
    assert.equal(loadData().users.length, demoData.users.length);
    globalThis.localStorage = { getItem: () => JSON.stringify({ users: [] }) };
    assert.equal(loadData().plans.length, demoData.plans.length);
    globalThis.localStorage = { getItem: () => { throw new Error('Storage blocked'); } };
    assert.equal(loadData().servers.length, 3);
    const saved = structuredClone(demoData);
    saved.users[0].name = 'Stored name';
    globalThis.localStorage = { getItem: key => { assert.equal(key, STORAGE_KEY); return JSON.stringify(saved); } };
    assert.equal(loadData().users[0].name, 'Stored name');
  } finally {
    if (original === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = original;
  }
});
