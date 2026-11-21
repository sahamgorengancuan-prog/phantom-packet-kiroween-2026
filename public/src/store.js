// Core message store module with localStorage persistence
// PHANTOM PACKET v1 - BBS-style message store-and-forward

export const STORE_KEY = 'phantom_packet_store';
const VERSION = '1.0.0';

export const DEFAULT_ROOMS = [
  { id: 'lobby', name: 'Lobby', description: 'General discussion area' },
  { id: 'tech', name: 'Tech Exchange', description: 'Hardware, software, and codes' },
  { id: 'poetry', name: 'Haunted Verse', description: 'Poetry and prose' },
  { id: 'mystery', name: 'Mystery Board', description: 'Unsolved cases and theories' },
  { id: 'emergency', name: 'Emergency Alert', description: 'Critical system notices' }
];

export function createMessage(id, roomId, author, subject, content, isEmergency = false) {
  return {
    id,
    roomId,
    author,
    subject,
    content,
    timestamp: Date.now(),
    isEmergency,
    replyTo: null
  };
}

export function createReply(parentId, author, content) {
  return {
    id: `${parentId}-reply-${Date.now()}`,
    roomId: null,
    author,
    subject: `Re: Reply`,
    content,
    timestamp: Date.now(),
    isEmergency: false,
    replyTo: parentId
  };
}

export function loadStore() {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data && Array.isArray(data.messages) && Array.isArray(data.rooms) && data.rooms.length) {
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to load store:', e);
  }
  return createEmptyStore();
}

export function saveStore(store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return true;
  } catch (e) {
    console.error('Failed to save store:', e);
    return false;
  }
}

export function createEmptyStore() {
  return {
    version: VERSION,
    messages: [],
    rooms: JSON.parse(JSON.stringify(DEFAULT_ROOMS)),
    lastId: 0
  };
}

export function getRoom(store, roomId) {
  return store.rooms.find((r) => r.id === roomId);
}

export function addMessage(store, message) {
  store.messages.push(message);
  store.lastId = (Number.isInteger(store.lastId) ? store.lastId : 0) + 1;
  return message;
}

export function getMessagesByRoom(store, roomId) {
  return store.messages
    .filter((m) => m.roomId === roomId || m.id === roomId)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getReplies(store, messageId) {
  return store.messages
    .filter((m) => m.replyTo === messageId)
    .sort((a, b) => a.timestamp - b.timestamp);
}

export function toggleEmergency(store, messageId) {
  const message = store.messages.find((m) => m.id === messageId);
  if (message) {
    message.isEmergency = !message.isEmergency;
    return message;
  }
  return null;
}

export function clearAllData() {
  try {
    localStorage.removeItem(STORE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear data:', e);
    return false;
  }
}
