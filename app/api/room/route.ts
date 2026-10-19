import {env} from 'cloudflare:workers';
import {createGame,play,publicGame,type Game} from '../../../lib/game';
export const dynamic='force-dynamic';
type Member={id:string;name:string;token:string};
type Room={code:string;host:string;members:Member[];game:Game|null;variant:Game['variant'];created:number};
function db(){if(!env.DB)throw Error('Online rooms are unavailable. You can still play offline.');return env.DB}
function view(r:Room,id:string,revision:number){return {code:r.code,host:r.host,members:r.members.map(({id,name})=>({id,name})),variant:r.variant,game:r.game?publicGame(r.game,id):null,revision}}
function error(e:unknown,status=400){return Response.json({error:e instanceof Error?e.message:'Unable to update the room. Try again.'},{status,headers:{'Cache-Control':'no-store'}})}
async function load(code:string){const row=await db().prepare('SELECT state, revision FROM rooms WHERE code = ? AND updated_at > ?').bind(code,Date.now()-86400000).first<{state:string;revision:number}>();if(!row)throw Error('Room not found or expired. Check the code.');return {room:JSON.parse(row.state) as Room,revision:row.revision}}
function auth(r:Room,token:string){const m=r.members.find(m=>m.token===token);if(!m)throw Error('Rejoin this room to continue.');return m}
export async function GET(req:Request){try{const url=new URL(req.url);const {room,revision}=await load((url.searchParams.get('code')??'').toUpperCase());const m=auth(room,req.headers.get('X-Player-Token')??'');return Response.json(view(room,m.id,revision),{headers:{'Cache-Control':'no-store'}})}catch(e){return error(e,404)}}
export async function POST(req:Request){try{if(Number(req.headers.get('content-length'))>4096)throw Error('Request too large.');const b=await req.json() as Record<string,unknown>;const op=b.op;const name=typeof b.name==='string'?b.name.trim().slice(0,20):'';const token=crypto.randomUUID();
if(op==='create'){if(!name)throw Error('Enter your name.');const id=crypto.randomUUID();const code=crypto.randomUUID().replaceAll('-','').slice(0,6).toUpperCase();const variant=['classic','sudden','teams'].includes(String(b.variant))?b.variant as Game['variant']:'classic';const room:Room={code,host:id,members:[{id,name,token}],game:null,variant,created:Date.now()};await db().prepare('INSERT INTO rooms (code,state,revision,updated_at) VALUES (?,?,0,?)').bind(code,JSON.stringify(room),Date.now()).run();return Response.json({...view(room,id,0),playerId:id,token})}
const code=String(b.code??'').toUpperCase();const {room,revision}=await load(code);let member:Member;
if(op==='join'){if(!name)throw Error('Enter your name.');if(room.game)throw Error('This game has started. Join a new room.');if(room.members.length>=24)throw Error('This room is full (24 players).');member={id:crypto.randomUUID(),name,token};room.members.push(member)}else member=auth(room,req.headers.get('X-Player-Token')??'');
if(op==='start'||op==='restart'){if(member.id!==room.host)throw Error('Only the host can start the game.');if(op==='start'&&room.game)throw Error('Game already started.');if(op==='restart'&&room.game?.phase!=='finished')throw Error('Finish this game before a rematch.');room.game=createGame(room.members,room.variant)}
else if(op==='play'){if(!room.game)throw Error('The game has not started.');if(b.revision!==revision)throw Error('The table changed. Try your move again.');room.game=play(room.game,member.id,typeof b.cardId==='string'?b.cardId:undefined)}
else if(op==='leave'){if(room.game?.phase==='playing')throw Error('Your seat is saved until this game ends.');room.members=room.members.filter(m=>m.id!==member.id);if(room.host===member.id)room.host=room.members[0]?.id??''}
else if(op!=='join')throw Error('Unknown room action.');
const result=await db().prepare('UPDATE rooms SET state = ?, revision = revision + 1, updated_at = ? WHERE code = ? AND revision = ?').bind(JSON.stringify(room),Date.now(),code,revision).run();if(!result.meta.changes)return error(Error('Another player just updated the room. Try again.'),409);
return Response.json({...view(room,member.id,revision+1),...(op==='join'?{playerId:member.id,token}:{})},{headers:{'Cache-Control':'no-store'}})}catch(e){return error(e)}}
