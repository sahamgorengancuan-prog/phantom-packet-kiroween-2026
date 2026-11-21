import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createEmptyStore, createMessage, loadStore, STORE_KEY } from '../src/store.mjs';
import { exportPacket, importPacket, createPacket, computeHash, PacketError } from '../src/packet.mjs';

function fixture(){ const s=createEmptyStore();s.messages.push(createMessage('message-1','lobby','Test','Sample','Example'));return s; }
async function sign(packet){packet.hash=await computeHash(JSON.stringify(packet.data));return JSON.stringify(packet);}

test('UAT: zero-dependency package and all browser file assets present',()=>{
 const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url)));
 assert.equal(Object.keys(pkg.dependencies||{}).length,0);
 for(const f of ['index.html','service-worker.js','manifest.json','src/app.js','src/store.js','src/packet.js','src/ui.js','src/demo.js','icons/icon-192x192.png','icons/icon-512x512.png']) assert(fs.existsSync(new URL('../public/'+f,import.meta.url)),f);
});
test('UAT: legitimate packet round-trips without mutation',async()=>{
 const f=fixture();const original=JSON.stringify(f);
 const loaded=await importPacket(await exportPacket(f));
 assert.equal(loaded.messages.length,1);
 assert.equal(loaded.messages[0].content,'Example');
 assert.equal(JSON.stringify(f),original);
});
test('UAT: changed message is rejected by checksum',async()=>{
 const packet=await createPacket(fixture());packet.data.messages[0].content='TAMPERED';
 await assert.rejects(()=>importPacket(JSON.stringify(packet)),PacketError);
});
test('UAT: oversized JSON packet is rejected before parse',async()=>{
 await assert.rejects(()=>importPacket('x'.repeat(500001)),/500 KB/);
});
test('UAT: malformed room identifier is rejected even with matching digest',async()=>{
 const packet=await createPacket(fixture());packet.data.rooms[0].id='../unsafe';
 await assert.rejects(async ()=>importPacket(await sign(packet)),PacketError);
});
test('UAT: duplicate message IDs are deduplicated on import',async()=>{
 const packet=await createPacket(fixture());packet.data.messages.push({...packet.data.messages[0]});
 const result=await importPacket(await sign(packet));assert.equal(result.messages.length,1);
});
test('UAT: unknown room ID and future timestamps are rejected',async()=>{
 const a=await createPacket(fixture());a.data.messages[0].roomId='not-room';await assert.rejects(async ()=>importPacket(await sign(a)),PacketError);
 const b=await createPacket(fixture());b.data.messages[0].timestamp=Date.now()+2*86400_000;await assert.rejects(async ()=>importPacket(await sign(b)),PacketError);
});
test('UAT: script-like user text remains inert data and is never HTML-injected',async()=>{
 const evil='<img src=x onerror=alert(1)>',f=fixture();f.messages[0].content=evil;
 const result=await importPacket(await exportPacket(f));assert.equal(result.messages[0].content,evil);
 const app=fs.readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
 assert(app.includes('contentEl.textContent = msg.content'));
 assert(!/contentEl\.innerHTML\s*=/.test(app));
});
test('UAT: corrupt local cache is safely reset to empty board',()=>{
 const prior=globalThis.localStorage;
 globalThis.localStorage={getItem(k){assert.equal(k,STORE_KEY);return JSON.stringify({messages:[{}]});},setItem(){},removeItem(){}};
 try {const store=loadStore();assert.equal(store.messages.length,0);assert.equal(store.rooms.length,5);}
 finally {globalThis.localStorage=prior;}
});
