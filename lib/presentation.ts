import type {Card,Kind} from './game';
const WILD_ORDER:Partial<Record<Kind,number>>={set21:100,set10:90,draw2:80,draw1:70,bomb:60,reverse:50,skip:40,redeal:30,pass:20,set0:10};
/** Sort for display only. Dealing order and the engine's hand stay untouched. */
export function sortHand(cards:Card[]){return cards.map((card,index)=>({card,index})).sort((a,b)=>{if(a.card.kind==='number'&&b.card.kind==='number')return b.card.value-a.card.value||a.index-b.index;if(a.card.kind==='number')return -1;if(b.card.kind==='number')return 1;return (WILD_ORDER[b.card.kind]??0)-(WILD_ORDER[a.card.kind]??0)||a.index-b.index}).map(x=>x.card)}
export type Cue='tap'|'card'|'deal'|'turn'|'draw'|'reverse'|'skip'|'reset'|'bomb'|'life'|'round'|'win';
export const CUE_DURATION:Record<Cue,number>={tap:0,card:480,deal:1350,turn:650,draw:1100,reverse:1000,skip:850,reset:950,bomb:1450,life:1050,round:1500,win:2100};
