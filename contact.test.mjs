import assert from 'node:assert/strict';
import { test } from 'node:test';
import { copyEmail } from './contact.mjs';

test('confirms only after the given address was copied', async () => {
    const addresses = [];
    const clipboard = { writeText: async address => addresses.push(address) };
    assert.equal(await copyEmail('public@example.test', clipboard), 'Endereço copiado.');
    assert.deepEqual(addresses, ['public@example.test']);
});

test('unavailable or rejected clipboard access gives manual options without false success', async () => {
    const clipboard = { writeText: async () => { throw new Error('denied'); } };
    assert.match(await copyEmail('public@example.test', clipboard), /Não foi possível copiar/);
    assert.match(await copyEmail('public@example.test', undefined), /aplicativo de e-mail/);
});
