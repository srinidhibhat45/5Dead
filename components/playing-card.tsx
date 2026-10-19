import {ArrowRight,Bomb,Heart,RefreshCw,Undo2,UserRoundX} from 'lucide-react';
import {CARD_INFO,type Card,type Kind} from '../lib/game';
import {cardDesign} from '../lib/card-design';

function DrawMark({two=false}:{two?:boolean}){return <svg viewBox="0 0 72 76" className="card-symbol" aria-hidden="true"><g fill="currentColor" stroke="#151a24" strokeWidth="1.5">{two&&<rect x="5" y="8" width="46" height="58" rx="5" transform="rotate(-12 28 37)"/>}<rect x="11" y="10" width="46" height="58" rx="5" transform="rotate(-6 34 39)"/><rect x="18" y="14" width="46" height="58" rx="5"/></g><text x="41" y="53" textAnchor="middle" fill="#151a24" fontFamily="Barlow,sans-serif" fontWeight="800" fontSize="31">+{two?'2':'1'}</text></svg>}
function RedealMark(){return <svg viewBox="0 0 80 80" className="card-symbol" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 23A29 29 0 0 1 62 17M62 8v10H52M66 58A29 29 0 0 1 18 64M18 73V63h10"/></g><g fill="currentColor" stroke="#151a24" strokeWidth="1.5"><rect x="21" y="23" width="30" height="39" rx="3" transform="rotate(-19 36 42)"/><rect x="25" y="21" width="30" height="39" rx="3" transform="rotate(-7 40 40)"/><rect x="30" y="21" width="30" height="39" rx="3" transform="rotate(7 45 40)"/></g></svg>}
function BombMark(){return <svg viewBox="0 0 80 88" className="card-symbol bomb-symbol" aria-hidden="true"><path className="bomb-blast" d="m57 2 4 13 13-7-5 13 10 5-13 4 7 12-14-5-6 13-3-14-13 6 6-13-12-6 14-2-4-13 11 8Z"/><path d="M43 39c-1-13 13-10 13-18" fill="none" stroke="#fff4c1" strokeWidth="4" strokeLinecap="round"/><path d="m33 31 15 5-4 12-15-5Z" fill="#171923" stroke="#fffaf0" strokeWidth="2"/><circle cx="33" cy="59" r="24" fill="#171923" stroke="#fffaf0" strokeWidth="2.5"/><path d="M17 53c1-6 5-10 11-11" fill="none" stroke="#8b94aa" strokeWidth="3" strokeLinecap="round"/></svg>}
function ActionMark({kind,corner=false}:{kind:Kind;corner?:boolean}){
 if(kind==='bomb')return corner?<Bomb/>:<BombMark/>;
 if(kind==='redeal')return corner?<RefreshCw/>:<RedealMark/>;
 if(kind==='reverse')return <Undo2 className={corner?'':'card-symbol'}/>;
 if(kind==='skip')return <UserRoundX className={corner?'':'card-symbol'}/>;
 return <ArrowRight className={corner?'':'card-symbol'}/>;
}
export function Face({card,back=false,className=''}:{card?:Card;back?:boolean;className?:string}){
 if(back)return <div className={`playing-card card-back ${className}`}><img src="/assets/card-back.webp" alt="Original skull card back" draggable={false}/></div>;
 const c=card!,design=cardDesign(c),numeric=c.kind==='number';
 const hasText=numeric||c.kind==='draw1'||c.kind==='draw2'||c.kind.startsWith('set');
 const index=hasText?<span>{numeric?c.value:CARD_INFO[c.kind].symbol}</span>:<ActionMark kind={c.kind} corner/>;
 return <div className={`playing-card card-face card-${c.kind} card-palette-${design.color} ${className}`} data-card-kind={c.kind} aria-hidden="true">
  <span className="card-corner">{index}</span>
  <div className="card-core">{numeric?<span className="card-value card-value-number">{c.value}</span>:c.kind==='draw1'||c.kind==='draw2'?<DrawMark two={c.kind==='draw2'}/>:c.kind.startsWith('set')?<span className="card-value card-value-set">{CARD_INFO[c.kind].symbol}</span>:<ActionMark kind={c.kind}/>}</div>
  {numeric?<span className="card-corner bottom">{c.value}</span>:<span className="card-name">{design.label}</span>}
 </div>;
}
export function Lives({n,small=false}:{n:number;small?:boolean}){return <span className={`lives ${small?'small':''}`} aria-label={`${n} of 5 lives`}>{Array.from({length:5},(_,i)=><Heart key={i} fill={i<n?'currentColor':'none'} className={i<n?'':'lost'} aria-hidden="true"/>)}</span>}
