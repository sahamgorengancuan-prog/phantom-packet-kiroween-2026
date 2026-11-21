import test from 'node:test';
import assert from 'node:assert';
import { 
  PacketError,
  computeHash,
  validateSchema,
  createPacket,
  exportPacket,
  verifyPacket,
  importPacket,
  sanitizeMessage
} from '../src/packet.mjs';
import { createEmptyStore, createMessage, addMessage } from '../src/store.mjs';

test('Packet: compute hash', async () => {
  const hash1 = await computeHash('test data');
  const hash2 = await computeHash('test data');
  assert.strictEqual(hash1, hash2);
  assert.strictEqual(hash1.length, 64); // SHA256 hex string
});

test('Packet: different data produces different hash', async () => {
  const hash1 = await computeHash('data1');
  const hash2 = await computeHash('data2');
  assert.notStrictEqual(hash1, hash2);
});

test('Packet: validate schema - valid packet', () => {
  const packet = {
    version: '1.0.0',
    type: 'phantom-packet-data',
    data: {
      messages: [],
      rooms: [],
      version: '1.0.0'
    },
    hash: 'abcd'
  };
  assert.doesNotThrow(() => validateSchema(packet));
});

test('Packet: validate schema - invalid version', () => {
  const packet = {
    version: '2.0.0',
    type: 'phantom-packet-data',
    data: {
      messages: [],
      rooms: []
    },
    hash: 'abcd'
  };
  assert.throws(() => validateSchema(packet), PacketError);
});

test('Packet: validate schema - missing hash', () => {
  const packet = {
    version: '1.0.0',
    type: 'phantom-packet-data',
    data: {
      messages: [],
      rooms: []
    }
  };
  assert.throws(() => validateSchema(packet), PacketError);
});

test('Packet: create packet', async () => {
  const store = createEmptyStore();
  const msg = createMessage('msg-1', 'lobby', 'User', 'Subject', 'Content');
  addMessage(store, msg);
  
  const packet = await createPacket(store);
  assert.strictEqual(packet.version, '1.0.0');
  assert.strictEqual(packet.type, 'phantom-packet-data');
  assert.strictEqual(packet.data.messages.length, 1);
  assert.strictEqual(packet.hash.length, 64);
});

test('Packet: export and verify', async () => {
  const store = createEmptyStore();
  const msg = createMessage('msg-1', 'lobby', 'User', 'Subject', 'Content');
  addMessage(store, msg);
  
  const exported = await exportPacket(store);
  const packet = JSON.parse(exported);
  
  assert.doesNotThrow(() => validateSchema(packet));
  assert(await verifyPacket(packet));
});

test('Packet: import packet', async () => {
  const store = createEmptyStore();
  const msg = createMessage('msg-1', 'lobby', 'User', 'Subject', 'Content');
  addMessage(store, msg);
  
  const exported = await exportPacket(store);
  const imported = await importPacket(exported);
  
  assert.strictEqual(imported.version, '1.0.0');
  assert.strictEqual(imported.messages.length, 1);
  assert.strictEqual(imported.messages[0].id, 'msg-1');
});

test('Packet: verify fails with corrupted hash', async () => {
  const store = createEmptyStore();
  const packet = await createPacket(store);
  packet.hash = 'corrupted_hash';
  
  assert.rejects(() => verifyPacket(packet), PacketError);
});

test('Packet: sanitize message - valid', () => {
  const msg = {
    id: 'msg-1',
    roomId: 'lobby',
    author: 'User',
    subject: 'Subject',
    content: 'Content',
    timestamp: 1000,
    isEmergency: false,
    replyTo: null
  };
  
  const sanitized = sanitizeMessage(msg);
  assert.strictEqual(sanitized.id, 'msg-1');
  assert.strictEqual(sanitized.author, 'User');
  assert.strictEqual(sanitized.isEmergency, false);
});

test('Packet: sanitize message - truncates long strings', () => {
  const longStr = 'x'.repeat(1000);
  const msg = {
    id: longStr,
    roomId: 'lobby',
    author: 'User',
    subject: longStr,
    content: longStr
  };
  
  const sanitized = sanitizeMessage(msg);
  assert(sanitized.id.length <= 256);
  assert(sanitized.subject.length <= 512);
  assert(sanitized.content.length <= 4096);
});

test('Packet: sanitize message - null input', () => {
  const sanitized = sanitizeMessage(null);
  assert.strictEqual(sanitized, null);
});
