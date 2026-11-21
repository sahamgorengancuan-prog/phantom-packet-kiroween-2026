// PHANTOM PACKET - Main Application Controller
// Offline-first BBS with localStorage persistence

import { loadStore, saveStore, createEmptyStore, addMessage, createMessage, getMessagesByRoom, getReplies, DEFAULT_ROOMS } from './store.js';
import { exportPacket, importPacket, sanitizeMessage, verifyPacket } from './packet.js';
import { generateDemoStore } from './demo.js';
import * as UI from './ui.js';

let currentStore = null;
let currentRoomId = 'lobby';

export function initApp() {
  // Load store from localStorage or create new
  currentStore = loadStore();

  // Set up UI event listeners
  setupRoomButtons();
  setupMessageForm();
  setupExportImport();
  setupAppMenu();

  // Show initial room
  showRoom('lobby');
}

export function setupRoomButtons() {
  const roomsContainer = document.querySelector('.rooms-list');
  if (!roomsContainer) return;

  roomsContainer.innerHTML = '';
  currentStore.rooms.forEach((room) => {
    const btn = document.createElement('button');
    btn.textContent = room.name;
    btn.className = `room-btn ${room.id === currentRoomId ? 'active' : ''}`;
    btn.dataset.roomId = room.id;
    btn.addEventListener('click', () => showRoom(room.id));
    roomsContainer.appendChild(btn);
  });
}

export function showRoom(roomId) {
  currentRoomId = roomId;
  const room = currentStore.rooms.find((r) => r.id === roomId);
  if (!room) return;

  // Update active button
  document.querySelectorAll('.room-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.roomId === roomId);
  });

  // Update room info
  const titleEl = document.querySelector('.room-title');
  if (titleEl) titleEl.textContent = room.name;

  const descEl = document.querySelector('.room-description');
  if (descEl) descEl.textContent = room.description;

  // Load messages
  const messages = getMessagesByRoom(currentStore, roomId);
  displayMessages(messages);
}

export function displayMessages(messages) {
  const messagesContainer = document.querySelector('.messages-list');
  if (!messagesContainer) return;

  messagesContainer.innerHTML = '';

  messages.forEach((msg) => {
    const msgEl = document.createElement('div');
    msgEl.className = `message ${msg.isEmergency ? 'emergency' : ''}`;
    msgEl.dataset.messageId = msg.id;

    const headerEl = document.createElement('div');
    headerEl.className = 'message-header';

    const authorEl = document.createElement('span');
    authorEl.className = 'message-author';
    authorEl.textContent = msg.author;

    const timeEl = document.createElement('span');
    timeEl.className = 'message-time';
    timeEl.textContent = new Date(msg.timestamp).toLocaleString();

    headerEl.appendChild(authorEl);
    headerEl.appendChild(timeEl);

    const subjectEl = document.createElement('div');
    subjectEl.className = 'message-subject';
    subjectEl.textContent = msg.subject;

    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.textContent = msg.content;

    msgEl.appendChild(headerEl);
    msgEl.appendChild(subjectEl);
    msgEl.appendChild(contentEl);

    // Add reply button
    const replyBtn = document.createElement('button');
    replyBtn.className = 'reply-btn';
    replyBtn.textContent = 'Reply';
    replyBtn.addEventListener('click', () => showReplyForm(msg.id));

    msgEl.appendChild(replyBtn);

    // Check for replies
    const replies = getReplies(currentStore, msg.id);
    if (replies.length > 0) {
      const repliesEl = document.createElement('div');
      repliesEl.className = 'replies-list';
      replies.forEach((reply) => {
        const replyEl = document.createElement('div');
        replyEl.className = 'reply-item';

        const replyHeaderEl = document.createElement('div');
        replyHeaderEl.className = 'reply-header';
        replyHeaderEl.textContent = `${reply.author} @ ${new Date(reply.timestamp).toLocaleString()}`;

        const replyContentEl = document.createElement('div');
        replyContentEl.className = 'reply-content';
        replyContentEl.textContent = reply.content;

        replyEl.appendChild(replyHeaderEl);
        replyEl.appendChild(replyContentEl);
        repliesEl.appendChild(replyEl);
      });
      msgEl.appendChild(repliesEl);
    }

    messagesContainer.appendChild(msgEl);
  });
}

export function setupMessageForm() {
  const form = document.querySelector('.post-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const authorInput = document.querySelector('input[name="author"]');
    const subjectInput = document.querySelector('input[name="subject"]');
    const contentInput = document.querySelector('textarea[name="content"]');

    const author = (authorInput?.value || 'Anonymous').trim();
    const subject = (subjectInput?.value || 'Untitled').trim();
    const content = (contentInput?.value || '').trim();

    if (!content) {
      alert('Message content cannot be empty');
      return;
    }

    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = createMessage(messageId, currentRoomId, author, subject, content);

    addMessage(currentStore, message);
    saveStore(currentStore);

    // Clear form
    if (authorInput) authorInput.value = '';
    if (subjectInput) subjectInput.value = '';
    if (contentInput) contentInput.value = '';

    // Refresh display
    showRoom(currentRoomId);
  });
}

export function showReplyForm(parentId) {
  const modal = document.querySelector('.reply-modal');
  if (!modal) return;

  const form = modal.querySelector('.reply-form');
  if (form) {
    form.dataset.parentId = parentId;
    modal.style.display = 'flex';

    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    form.onsubmit = (e) => {
      e.preventDefault();
      const authorInput = form.querySelector('input[name="reply-author"]');
      const contentInput = form.querySelector('textarea[name="reply-content"]');

      const author = (authorInput?.value || 'Anonymous').trim();
      const content = (contentInput?.value || '').trim();

      if (!content) {
        alert('Reply content cannot be empty');
        return;
      }

      const replyId = `${parentId}-reply-${Date.now()}`;
      const reply = {
        id: replyId,
        roomId: null,
        author,
        subject: `Re: Reply`,
        content,
        timestamp: Date.now(),
        isEmergency: false,
        replyTo: parentId
      };

      addMessage(currentStore, reply);
      saveStore(currentStore);

      modal.style.display = 'none';
      form.reset();
      showRoom(currentRoomId);
    };
  }
}

export function setupExportImport() {
  const exportBtn = document.querySelector('.export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const packetJson = await exportPacket(currentStore);
        downloadFile(packetJson, 'phantom-packet.json');
      } catch (e) {
        alert(`Export failed: ${e.message}`);
      }
    });
  }

  const importBtn = document.querySelector('.import-btn');
  const importInput = document.querySelector('#packet-file-input');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        if (file.size > 500_000) throw new Error('Packet exceeds 500 KB');
        const newStore = await importPacket(await file.text());
        if (!confirm(`Import ${newStore.messages.length} messages? This will replace your current local board.`)) return;
        currentStore = newStore;
        saveStore(currentStore);
        setupRoomButtons();
        showRoom(currentStore.rooms.find(x => x.id === currentRoomId) ? currentRoomId : currentStore.rooms[0].id);
        alert('Packet imported successfully');
      } catch (error) {
        alert(`Import failed: ${error.message}`);
      } finally {
        importInput.value = '';
      }
    });
  }

}

export function setupAppMenu() {
  const demoBtn = document.querySelector('.load-demo-btn');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      if (confirm('Load sample demo data? This will add messages.')) {
        currentStore = generateDemoStore();
        saveStore(currentStore);
        setupRoomButtons();
        showRoom('lobby');
      }
    });
  }

  const clearBtn = document.querySelector('.clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all data? This cannot be undone.')) {
        currentStore = createEmptyStore();
        saveStore(currentStore);
        setupRoomButtons();
        showRoom('lobby');
      }
    });
  }
}

export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Register offline cache only within this web app's own path/scope.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js?v=6', {scope:'./'}).catch((error) => {
      console.warn('Offline installation unavailable:', error?.message || 'registration failed');
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
