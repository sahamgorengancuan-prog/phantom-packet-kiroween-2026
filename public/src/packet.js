// PHANTOM PACKET - Import/Export with SHA256 integrity
// Handles JSON packet generation, validation, and crypto signing

const PACKET_VERSION = '1.0.0';
const PACKET_TYPE = 'phantom-packet-data';

export class PacketError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PacketError';
  }
}

export async function computeHash(data) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function validateSchema(packet) {
  if (!packet || typeof packet !== 'object') {
    throw new PacketError('Invalid packet: not an object');
  }
  if (packet.version !== PACKET_VERSION) {
    throw new PacketError(`Invalid packet version: ${packet.version}`);
  }
  if (packet.type !== PACKET_TYPE) {
    throw new PacketError(`Invalid packet type: ${packet.type}`);
  }
  if (!packet.data || typeof packet.data !== 'object') {
    throw new PacketError('Invalid packet data');
  }
  if (!packet.data.messages || !Array.isArray(packet.data.messages)) {
    throw new PacketError('Invalid messages array');
  }
  if (!packet.data.rooms || !Array.isArray(packet.data.rooms)) {
    throw new PacketError('Invalid rooms array');
  }
  if (typeof packet.hash !== 'string') {
    throw new PacketError('Missing hash');
  }
  return true;
}

export async function createPacket(store) {
  const payload = {
    version: PACKET_VERSION,
    type: PACKET_TYPE,
    timestamp: Date.now(),
    data: {
      messages: store.messages,
      rooms: store.rooms,
      version: store.version
    }
  };

  const payloadStr = JSON.stringify(payload.data);
  const hash = await computeHash(payloadStr);

  return {
    ...payload,
    hash
  };
}

export async function exportPacket(store) {
  const packet = await createPacket(store);
  return JSON.stringify(packet, null, 2);
}

export async function verifyPacket(packet) {
  if (!packet) throw new PacketError('No packet provided');
  validateSchema(packet);

  const payloadStr = JSON.stringify(packet.data);
  const computedHash = await computeHash(payloadStr);

  if (computedHash !== packet.hash) {
    throw new PacketError('Hash mismatch: packet data integrity check failed');
  }
  return true;
}

export const MAX_PACKET_BYTES = 500_000;

// Checksum protects against accidental corruption, NOT against a malicious author
// who can recompute a new digest. Never treat the packet as an identity credential.
export async function importPacket(packetJson) {
  if (typeof packetJson !== 'string' || new TextEncoder().encode(packetJson).length > MAX_PACKET_BYTES) {
    throw new PacketError('Packet must be JSON text and no larger than 500 KB');
  }
  let packet;
  try {
    packet = JSON.parse(packetJson);
  } catch (error) {
    throw new PacketError('Invalid JSON packet');
  }
  await verifyPacket(packet);
  if (packet.data.rooms.length > 20 || packet.data.messages.length > 1000) {
    throw new PacketError('Packet exceeds room or message limit');
  }
  const rooms = [];
  const roomIds = new Set();
  for (const room of packet.data.rooms) {
    if (!room || typeof room !== 'object' ||
        typeof room.id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,39}$/i.test(room.id) ||
        typeof room.name !== 'string' || room.name.trim().length < 1 || room.name.length > 80 ||
        typeof room.description !== 'string' || room.description.length > 250 ||
        roomIds.has(room.id)) throw new PacketError('Invalid or repeated room definition');
    roomIds.add(room.id);
    rooms.push({id:room.id,name:room.name,description:room.description});
  }
  if (!rooms.length) throw new PacketError('Packet has no rooms');
  const messages = [];
  const messageIds = new Set();
  for (const message of packet.data.messages) {
    if (!message || typeof message !== 'object' ||
        typeof message.id !== 'string' || !/^[A-Za-z0-9._:-]{1,100}$/.test(message.id) ||
        (message.roomId !== null && !roomIds.has(message.roomId)) ||
        typeof message.author !== 'string' || message.author.length > 120 ||
        typeof message.subject !== 'string' || message.subject.length > 200 ||
        typeof message.content !== 'string' || message.content.length > 4096 ||
        !Number.isFinite(message.timestamp) || message.timestamp <= 0 ||
        message.timestamp > Date.now() + 86400_000 ||
        (message.replyTo !== null && (typeof message.replyTo !== 'string' || !/^[A-Za-z0-9._:-]{1,100}$/.test(message.replyTo)))) {
      throw new PacketError('Invalid message in packet');
    }
    if (messageIds.has(message.id)) continue; // exact-ID deduplication
    messageIds.add(message.id);
    messages.push(sanitizeMessage(message));
  }
  return {version:'1.0.0',rooms,messages,lastId:messages.length};
}

export function sanitizeMessage(msg) {
  if (!msg || typeof msg !== 'object') return null;
  return {
    id: String(msg.id || '').substring(0, 256),
    roomId: String(msg.roomId || '').substring(0, 256),
    author: String(msg.author || 'Anonymous').substring(0, 256),
    subject: String(msg.subject || '').substring(0, 512),
    content: String(msg.content || '').substring(0, 4096),
    timestamp: Number(msg.timestamp) || Date.now(),
    isEmergency: Boolean(msg.isEmergency),
    replyTo: msg.replyTo ? String(msg.replyTo).substring(0, 256) : null
  };
}
