import {CARD_INFO,type Card,type Kind} from './game.ts';
type CardDesign={color:string;label:string};
const NUMBERS=['red','orange','gold','lime','blue','magenta','gold','violet'];
const LABELS:Record<Exclude<Kind,'number'>,string>={
 draw1:'DRAW 1',draw2:'DRAW 2',pass:'PASS',reverse:'REVERSE',skip:'SKIP',
 set21:'SET 21',set10:'SET 10',set0:'RESET 0',redeal:'RESHUFFLE',bomb:'BOMB',
};
/** Visual metadata never changes card IDs, deck composition, or dealing. */
export function cardDesign(card:Card):CardDesign{return card.kind==='number'?{color:NUMBERS[card.value%NUMBERS.length],label:''}:{color:CARD_INFO[card.kind].color,label:LABELS[card.kind]}}
