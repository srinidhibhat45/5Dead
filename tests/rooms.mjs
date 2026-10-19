import assert from 'node:assert/strict';
const origin=process.env.GAME_TEST_ORIGIN??'http://127.0.0.1:4173';
async function request(op,body={},token){const r=await fetch(`${origin}/api/room`,{method:'POST',headers:{'Content-Type':'application/json',...(token?{'X-Player-Token':token}:{})},body:JSON.stringify({op,...body})});return {ok:r.ok,status:r.status,data:await r.json()}}
async function get(code,token){const r=await fetch(`${origin}/api/room?code=${code}`,{headers:{'X-Player-Token':token}});return {ok:r.ok,data:await r.json()}}
const host=await request('create',{name:'Test Host'});assert(host.ok,JSON.stringify(host));const {code,token,playerId}=host.data;
assert(!('token' in host.data.members[0]));
const guest=await request('join',{code,name:'Test Guest'});assert(guest.ok);assert.equal(guest.data.members.length,2);
assert(!(await request('start',{code},guest.data.token)).ok);
assert(!(await get(code,'invalid')).ok);
let r=await request('start',{code},token);assert(r.ok,JSON.stringify(r));assert.equal(r.data.game.players.length,2);
assert(!(await request('join',{code,name:'Too Late'})).ok);
const otherId=r.data.game.players.find(p=>p.id!==playerId).id;
assert.equal(r.data.game.players.find(p=>p.id===otherId).hand.length,0);assert.equal(r.data.game.deck.length,0);
const turnPlayer=r.data.game.players[r.data.game.turn];const actorToken=turnPlayer.id===playerId?token:guest.data.token;const wrongToken=turnPlayer.id===playerId?guest.data.token:token;
const own=await get(code,actorToken);const hand=own.data.game.players.find(p=>p.id===turnPlayer.id).hand;const cardId=hand[0].id;
assert(!(await request('play',{code,revision:own.data.revision,cardId},wrongToken)).ok);
const moves=await Promise.all([request('play',{code,revision:own.data.revision,cardId},actorToken),request('play',{code,revision:own.data.revision,cardId},actorToken)]);assert.equal(moves.filter(m=>m.ok).length,1,'Only one racing move may commit');
const fresh=await get(code,actorToken);assert.equal(fresh.data.revision,own.data.revision+1);
assert(!(await request('play',{code,revision:own.data.revision,cardId},actorToken)).ok);
assert(!(await request('restart',{code},token)).ok);
console.log('PASS: online create/join/start, host permissions, private hands, token auth, stale-move rejection, concurrent-move serialization and refresh recovery.');
