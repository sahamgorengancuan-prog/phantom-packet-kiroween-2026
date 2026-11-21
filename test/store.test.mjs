import test from 'node:test';
import assert from 'node:assert';
import { 
  STORE_KEY,
  DEFAULT_ROOMS,
  createMessage,
  createReply,
  createEmptyStore,
  getRoom,
  addMessage,
  getMessagesByRoom,
  getReplies,
  toggleEmergency
} from '../src/store.mjs';

test('Store: create empty store', () => {
  const store = createEmptyStore();
  assert.strictEqual(store.version, '1.0.0');
  assert.deepStrictEqual(store.messages, []);
  assert.strictEqual(store.rooms.length, 5);
  assert.strictEqual(store.lastId, 0);
});

test('Store: default rooms exist', () => {
  assert.strictEqual(DEFAULT_ROOMS.length, 5);
  assert.strictEqual(DEFAULT_ROOMS[0].id, 'lobby');
  assert.strictEqual(DEFAULT_ROOMS[1].id, 'tech');
});

test('Store: create message', () => {
  const msg = createMessage('msg-1', 'lobby', 'TestUser', 'Test Subject', 'Test content');
  assert.strictEqual(msg.id, 'msg-1');
  assert.strictEqual(msg.roomId, 'lobby');
  assert.strictEqual(msg.author, 'TestUser');
  assert.strictEqual(msg.subject, 'Test Subject');
  assert.strictEqual(msg.content, 'Test content');
  assert.strictEqual(msg.isEmergency, false);
  assert.strictEqual(msg.replyTo, null);
  assert(msg.timestamp > 0);
});

test('Store: create reply', () => {
  const reply = createReply('parent-1', 'ReplyUser', 'Reply content');
  assert(reply.id.startsWith('parent-1-reply-'));
  assert.strictEqual(reply.author, 'ReplyUser');
  assert.strictEqual(reply.content, 'Reply content');
  assert.strictEqual(reply.replyTo, 'parent-1');
  assert.strictEqual(reply.roomId, null);
});

test('Store: add message and retrieve by room', () => {
  const store = createEmptyStore();
  const msg = createMessage('msg-1', 'lobby', 'User', 'Subject', 'Content');
  addMessage(store, msg);
  
  assert.strictEqual(store.messages.length, 1);
  const msgs = getMessagesByRoom(store, 'lobby');
  assert.strictEqual(msgs.length, 1);
  assert.strictEqual(msgs[0].id, 'msg-1');
});

test('Store: get room by id', () => {
  const store = createEmptyStore();
  const room = getRoom(store, 'tech');
  assert.strictEqual(room.name, 'Tech Exchange');
});

test('Store: get replies for parent', () => {
  const store = createEmptyStore();
  const parent = createMessage('parent-1', 'lobby', 'User', 'Subject', 'Content');
  addMessage(store, parent);
  
  const reply1 = createReply('parent-1', 'User2', 'Reply 1');
  const reply2 = createReply('parent-1', 'User3', 'Reply 2');
  addMessage(store, reply1);
  addMessage(store, reply2);
  
  const replies = getReplies(store, 'parent-1');
  assert.strictEqual(replies.length, 2);
});

test('Store: toggle emergency flag', () => {
  const store = createEmptyStore();
  const msg = createMessage('msg-1', 'emergency', 'User', 'Alert', 'Critical');
  addMessage(store, msg);
  
  assert.strictEqual(msg.isEmergency, false);
  const toggled = toggleEmergency(store, 'msg-1');
  assert.strictEqual(toggled.isEmergency, true);
  const toggledAgain = toggleEmergency(store, 'msg-1');
  assert.strictEqual(toggledAgain.isEmergency, false);
});

test('Store: messages sorted by timestamp descending', () => {
  const store = createEmptyStore();
  const msg1 = createMessage('msg-1', 'lobby', 'User', 'First', 'Content');
  const msg2 = createMessage('msg-2', 'lobby', 'User', 'Second', 'Content');
  
  msg1.timestamp = 1000;
  msg2.timestamp = 2000;
  
  addMessage(store, msg1);
  addMessage(store, msg2);
  
  const msgs = getMessagesByRoom(store, 'lobby');
  assert.strictEqual(msgs[0].id, 'msg-2');
  assert.strictEqual(msgs[1].id, 'msg-1');
});
