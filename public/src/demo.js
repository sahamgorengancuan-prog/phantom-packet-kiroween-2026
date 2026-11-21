// PHANTOM PACKET - Demo Data Generator
// Sample labeled fictional content for testing and demo purposes

import { DEFAULT_ROOMS } from './store.js';

const DEMO_AUTHORS = [
  'Ghost_Protocol',
  'CyberPhanty',
  'Spectral_Echo',
  'Phantom_User',
  'Nocturnal_Sys'
];

const DEMO_SUBJECTS = {
  lobby: [
    'Welcome to Phantom Packet',
    'Has anyone seen the old BBS archives?',
    'New member introduction',
    'System maintenance window'
  ],
  tech: [
    'Retro modem protocols discussion',
    'Z80 assembly tips',
    'Building a packet radio setup',
    'Dial-up optimization tricks'
  ],
  poetry: [
    'A haunting in silicon',
    'Echoes of forgotten networks',
    'The ghost in the machine poem',
    'Digital solitude'
  ],
  mystery: [
    'The disappearing packets',
    'Lost transmission from 1987',
    'Strange activity on port 666',
    'Unsolved network mystery'
  ],
  emergency: [
    'SYSTEM ALERT: Spectral interference detected',
    'CRITICAL: Phantom traffic surge',
    'WARNING: Unauthorized transmission incoming'
  ]
};

const DEMO_CONTENT = {
  lobby: [
    'Welcome, visitor. This is PHANTOM PACKET—a peer-to-peer BBS revival from the digital grave.',
    'I remember the old days of FidoNet... does anyone else here?',
    'Hello! New to retro BBSes. Excited to join this community.',
    'Notice: Weekly system maintenance Saturday 0200 UTC. Plan accordingly.'
  ],
  tech: [
    'The 300 baud modem was truly a marvel of its time. Simple, robust, haunting.',
    'Anyone have tips for Z80 assembly? I\'m building a retro controller.',
    'Packet radio is making a comeback. RF over fiber shows promise.',
    'Pro tip: Use XModem for reliable transfers. Still unbeaten after decades.'
  ],
  poetry: [
    'Between the wires, a voice calls—\nWho listens in the dark?\nA phantom user, never seen,\nLeaves only digital marks.',
    'The modem screams its lonely song,\nA handshake in the night.\nTwo machines that never meet,\nExchange their bit-light.',
    'Silicon dreams of being real,\nData flows like pain.\nIn the phosphor glow, we find\nWhat cannot be explained.',
    'Disconnected, yet we linger—\nGhosts of networks past.\nBound by protocols we love,\nIn memory we\'re cast.'
  ],
  mystery: [
    'Has anyone noticed the traffic spike at 3:33 AM? No one sends packets then. Yet they come.',
    'Found a message dated 1987-06-06. Timestamp from the future? Impossible.',
    'Port 666 opened itself. No user action. Just appeared in the log.',
    'My packet router logged a transmission from IP address all zeros. What does that mean?'
  ],
  emergency: [
    'ALERT: Unusual data patterns detected on backbone network. Investigate immediately.',
    'CRITICAL: Unauthorized access attempt via deprecated FTP gateway. All systems secure.',
    'WARNING: Phantom traffic source identified as external. Source remains unknown. Stay vigilant.'
  ]
};

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateDemoMessages(count = 20) {
  const messages = [];
  let id = 1;
  let baseTime = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago

  const rooms = DEFAULT_ROOMS.map((r) => r.id);

  for (let i = 0; i < count; i++) {
    const roomId = pickRandom(rooms);
    const subjects = DEMO_SUBJECTS[roomId] || [];
    const contents = DEMO_CONTENT[roomId] || [];

    messages.push({
      id: String(id++),
      roomId,
      author: pickRandom(DEMO_AUTHORS),
      subject: pickRandom(subjects) || `Message ${i}`,
      content: pickRandom(contents) || 'Sample message content',
      timestamp: baseTime + i * 2 * 60 * 60 * 1000, // 2 hours apart
      isEmergency: roomId === 'emergency' ? Math.random() > 0.7 : false,
      replyTo: null
    });
  }

  // Add some replies
  const mainMsgs = messages.slice(0, Math.floor(messages.length * 0.7));
  for (let i = 0; i < 5; i++) {
    const parent = pickRandom(mainMsgs);
    messages.push({
      id: `${parent.id}-reply-${Date.now()}-${i}`,
      roomId: null,
      author: pickRandom(DEMO_AUTHORS),
      subject: `Re: ${parent.subject}`,
      content: 'Interesting point. I agree with your analysis.',
      timestamp: parent.timestamp + 24 * 60 * 60 * 1000,
      isEmergency: false,
      replyTo: parent.id
    });
  }

  return messages;
}

export function generateDemoStore() {
  return {
    version: '1.0.0',
    messages: generateDemoMessages(20),
    rooms: DEFAULT_ROOMS.map((r) => ({ ...r })),
    lastId: 20
  };
}
