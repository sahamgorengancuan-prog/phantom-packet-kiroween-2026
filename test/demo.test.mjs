import test from 'node:test';
import assert from 'node:assert';
import { generateDemoMessages, generateDemoStore } from '../src/demo.mjs';

test('Demo: generate demo messages', () => {
  const messages = generateDemoMessages(10);
  // generateDemoMessages adds replies, so actual count will be > requested count
  assert(messages.length >= 10);
});

test('Demo: demo messages have required fields', () => {
  const messages = generateDemoMessages(5);
  
  messages.forEach((msg) => {
    assert(msg.id || msg.id === 0, 'id should exist');
    // Replies have null roomId, so check accordingly
    assert(msg.author);
    assert(msg.subject !== undefined);
    assert(msg.content !== undefined);
    assert(typeof msg.timestamp === 'number');
    assert(typeof msg.isEmergency === 'boolean');
  });
});

test('Demo: demo messages distributed across rooms', () => {
  const messages = generateDemoMessages(20);
  const rooms = new Set(messages.map((m) => m.roomId));
  
  assert(rooms.size > 1); // Multiple rooms
});

test('Demo: generate demo store', () => {
  const store = generateDemoStore();
  assert.strictEqual(store.version, '1.0.0');
  assert(store.messages.length > 0);
  assert.strictEqual(store.rooms.length, 5);
  assert(store.lastId > 0);
});

test('Demo: demo store includes replies', () => {
  const store = generateDemoStore();
  const replies = store.messages.filter((m) => m.replyTo !== null);
  assert(replies.length > 0);
});
