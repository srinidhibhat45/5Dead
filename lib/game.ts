export type Kind = 'number'|'draw1'|'draw2'|'pass'|'reverse'|'skip'|'set21'|'set10'|'set0'|'redeal'|'bomb';
export type Card = {id:string;kind:Kind;value:number};
export type Player = {id:string;name:string;bot:boolean;lives:number;hand:Card[];team:number};
export type GameEvent = {id:string;revision:number;actorId:string;actorName:string;action:Kind|'bust';type:'play'|'round'|'win';card?:Card;total:number;losses:{id:string;name:string;amount:number;out:boolean}[];draws:{id:string;name:string;count:number}[];winners:string[]};
export type Game = {events?:GameEvent[];players:Player[];deck:Card[];discard:Card[];turn:number;direction:number;total:number;round:number;phase:'playing'|'finished';winners:string[];log:string[];variant:'classic'|'sudden'|'teams';decks:number;revision:number};
export const CARD_INFO:Record<Kind,{label:string;symbol:string;detail:string;color:string}>={
number:{label:'Number',symbol:'',detail:'Add this number to the total.',color:'yellow'},
draw1:{label:'Draw one',symbol:'+1',detail:'Every other player draws one. Total stays.',color:'purple'},
draw2:{label:'Draw two',symbol:'+2',detail:'Every other player draws two. Total stays.',color:'purple'},
pass:{label:'Pass',symbol:'→',detail:'Pass your turn. Total stays.',color:'teal'},
reverse:{label:'Reverse',symbol:'⇄',detail:'Reverse direction. With two players, pass.',color:'coral'},
skip:{label:'Skip',symbol:'⊘',detail:'Skip the next player.',color:'yellow'},
set21:{label:'Set to 21',symbol:'=21',detail:'Set the total to 21.',color:'coral'},
set10:{label:'Set to 10',symbol:'=10',detail:'Set the total to 10.',color:'purple'},
set0:{label:'Reset',symbol:'=0',detail:'Reset the total to zero.',color:'teal'},
redeal:{label:'Re-deal',symbol:'⇆',detail:'Shuffle and re-deal all active hands. Reset to zero.',color:'purple'},
bomb:{label:'Bomb',symbol:'',detail:'Others discard a number zero or lose a life. Reset to zero.',color:'coral'}};
export function randomInt(n:number){if(!Number.isSafeInteger(n)||n<1||n>2**32)throw Error('Invalid random range');const a=new Uint32Array(1);const limit=Math.floor(2**32/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%n}
export function shuffle<T>(items:T[]){const a=[...items];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
export function makeDeck(copies=1):Card[]{const out:Card[]=[];for(let d=0;d<copies;d++){const add=(kind:Kind,value:number,count:number)=>{for(let i=0;i<count;i++)out.push({id:`${d}-${kind}-${value}-${i}`,kind,value})};[8,8,8,8,8,4,2,1].forEach((n,v)=>add('number',v,n));const counts:Partial<Record<Kind,number>>={draw1:2,draw2:2,pass:4,reverse:6,skip:4,set21:5,set10:2,set0:3,redeal:1,bomb:1};for(const [k,n] of Object.entries(counts))add(k as Kind,0,n!)}return shuffle(out)}
export function alive(g:Game){return g.players.filter(p=>p.lives>0)}
function note(g:Game,s:string){g.log=[s,...g.log].slice(0,30)}
function next(g:Game,from=g.turn,steps=1,dir=g.direction){let n=from;for(let j=0;j<steps;j++){for(let i=0;i<g.players.length;i++){n=(n+dir+g.players.length)%g.players.length;if(g.players[n].lives>0)break}}return n}
function lose(g:Game,p:Player,n=1){if(g.variant==='teams'){g.players.filter(x=>x.team===p.team).forEach(x=>x.lives=Math.max(0,x.lives-n))}else p.lives=Math.max(0,p.lives-n);note(g,`${p.name} lost ${n===1?'a life':`${n} lives`}.`)}
function end(g:Game){const a=alive(g);let winners:Player[]=[];if(g.variant==='teams'){const t=[...new Set(a.map(p=>p.team))];if(t.length<=1)winners=a}else if(a.length<=1)winners=a;else if(g.variant==='sudden'&&g.players.some(p=>!p.lives)){const max=Math.max(...a.map(p=>p.lives));const tied=a.filter(p=>p.lives===max);const sum=(p:Player)=>p.hand.reduce((s,c)=>s+(c.kind==='number'?c.value:0),0);const min=Math.min(...tied.map(sum));winners=tied.filter(p=>sum(p)===min)}if(winners.length||!a.length){g.phase='finished';g.winners=winners.map(p=>p.id);note(g,winners.length?`${winners.map(p=>p.name).join(' & ')} won!`:'No survivors — a draw!');return true}return false}
function deal(g:Game,starter:number){g.deck=makeDeck(g.decks);g.discard=[];g.total=0;g.direction=1;g.players.forEach(p=>p.hand=[]);const active=alive(g);for(let i=0;i<10;i++)for(let n=0;n<g.players.length;n++){const p=g.players[(starter+n)%g.players.length];if(p.lives>0)p.hand.push(g.deck.pop()!)}g.turn=g.players[starter]?.lives>0?starter:next(g,starter,1,1);g.round++;note(g,`Hand ${g.round}. ${active.length} players remain.`)}
export function createGame(names:{name:string;id?:string;bot?:boolean}[],variant:Game['variant']='classic'):Game{if(names.length<2||names.length>24)throw Error('Choose 2–24 players.');if(variant==='teams'&&(names.length<4||names.length%2))throw Error('Teams need an even number of 4–24 players.');const g:Game={players:names.map((p,i)=>({id:p.id??crypto.randomUUID(),name:p.name.trim().slice(0,20)||`Player ${i+1}`,bot:!!p.bot,lives:5,hand:[],team:i%2})),deck:[],discard:[],turn:0,direction:1,total:0,round:0,phase:'playing',winners:[],log:[],variant,decks:Math.ceil(names.length/6),revision:0};deal(g,randomInt(names.length));return g}
export function playable(c:Card,total:number){return c.kind!=='number'||c.value+total<=21}
function draw(g:Game,p:Player){if(!g.deck.length){const top=g.discard.pop();g.deck=shuffle(g.discard);g.discard=top?[top]:[]}if(g.deck.length)p.hand.push(g.deck.pop()!);else note(g,'Draw pile empty: all remaining cards are in hands.')}
function applyPlay(g:Game,playerId:string,cardId?:string):Game{if(g.phase!=='playing')throw Error('This game is finished.');const p=g.players[g.turn];if(p.id!==playerId)throw Error('Wait for your turn.');const h=p.hand;const legal=h.filter(c=>playable(c,g.total));g=structuredClone(g);const actor=g.players[g.turn];const oldTurn=g.turn;
if(!cardId){if(legal.length)throw Error('You have a playable card.');lose(g,actor);g.total=0;if(!actor.lives){g.discard.push(...actor.hand);actor.hand=[]}if(!end(g))g.turn=next(g,oldTurn);g.revision++;return g}
const index=actor.hand.findIndex(c=>c.id===cardId);if(index<0)throw Error('That card is not in your hand.');const c=actor.hand[index];if(!playable(c,g.total))throw Error('That card would exceed 21.');actor.hand.splice(index,1);g.discard.push(c);note(g,`${actor.name} played ${c.kind==='number'?c.value:CARD_INFO[c.kind].label}.`);
// A final card ends the hand before its wild effect is applied.
if(!actor.hand.length){const opponents=alive(g).filter(x=>x.id!==actor.id&&(g.variant!=='teams'||x.team!==actor.team));if(g.variant==='teams'){if(opponents[0])lose(g,opponents[0])}else opponents.forEach(x=>lose(g,x));if(!end(g))deal(g,next(g,oldTurn,1,1));g.revision++;return g}
let steps=1;
if(c.kind==='number')g.total+=c.value;
if(c.kind==='set0')g.total=0;if(c.kind==='set10')g.total=10;if(c.kind==='set21')g.total=21;
if(c.kind==='reverse')g.direction*=-1;
if(c.kind==='skip')steps=2;
if(c.kind==='draw1'||c.kind==='draw2'){const targets=alive(g).filter(x=>x.id!==actor.id);for(let i=0;i<(c.kind==='draw1'?1:2);i++)for(const t of targets)draw(g,t)}
if(c.kind==='bomb'){g.total=0;for(const t of alive(g).filter(x=>x.id!==actor.id)){const zero=t.hand.findIndex(x=>x.kind==='number'&&x.value===0);if(zero>=0){g.discard.push(...t.hand.splice(zero,1));note(g,`${t.name} blocked the bomb with 0.`)}else lose(g,t)}}
if(c.kind==='redeal'){g.total=0;const pool=shuffle(alive(g).flatMap(x=>x.hand));alive(g).forEach(x=>x.hand=[]);let n=oldTurn;while(pool.length){n=next(g,n,1,1);g.players[n].hand.push(pool.pop()!)}g.direction=1}
for(const t of g.players)if(!t.lives&&t.hand.length){g.discard.push(...t.hand);t.hand=[]}
if(!end(g)){const empty=alive(g).find(x=>!x.hand.length);if(empty){const others=alive(g).filter(x=>x.id!==empty.id&&(g.variant!=='teams'||x.team!==empty.team));if(g.variant==='teams'){if(others[0])lose(g,others[0])}else others.forEach(x=>lose(g,x));if(!end(g))deal(g,next(g,g.players.indexOf(empty),1,1))}else g.turn=next(g,oldTurn,steps)}g.revision++;return g}
// A bot is handed only its own cards and the public running total.
export function botChoice(hand:Card[],total:number){const legal=hand.filter(c=>playable(c,total));if(!legal.length)return undefined;const nums=legal.filter(c=>c.kind==='number');if(nums.length&&randomInt(4)!==0)return nums.sort((a,b)=>b.value-a.value)[0].id;return legal[randomInt(legal.length)].id}
export function publicGame(g:Game,id:string){return {...g,deck:[],players:g.players.map(p=>({...p,count:p.hand.length,hand:p.id===id?p.hand:[]})),discard:g.discard.slice(-1)}}

// Public animation receipts contain played cards and counts, never draw-pile order or private draws.
export function play(before:Game,playerId:string,cardId?:string):Game{
 const actor=before.players[before.turn];
 const card=actor.hand.find(c=>c.id===cardId);
 const after=applyPlay(before,playerId,cardId);
 const event:GameEvent={id:crypto.randomUUID(),revision:after.revision,actorId:actor.id,actorName:actor.name,action:card?.kind??'bust',type:after.phase==='finished'?'win':after.round!==before.round?'round':'play',...(card?{card}:{}),total:after.total,losses:[],draws:[],winners:after.winners};
 for(const p of after.players){const prev=before.players.find(x=>x.id===p.id)!;if(p.lives<prev.lives)event.losses.push({id:p.id,name:p.name,amount:prev.lives-p.lives,out:p.lives===0});if(after.round===before.round&&p.hand.length>prev.hand.length)event.draws.push({id:p.id,name:p.name,count:p.hand.length-prev.hand.length})}
 after.events=[...(before.events??[]),event].slice(-12);return after;
}
