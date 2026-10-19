'use client';
import {useEffect,useLayoutEffect,useRef,useState,type PointerEvent as ReactPointerEvent,type RefObject} from 'react';
import type {Card} from '../lib/game';
import {acceptsCardRelease,cardDragIntent,dropZone,tablePoint,type GesturePoint} from '../lib/card-gesture';
type Gesture={pointerId:number;card:Card;start:GesturePoint;center:GesturePoint;point:GesturePoint;last:GesturePoint;time:number;velocity:GesturePoint;active:boolean;scrolling:boolean;scrollStart:number;element:HTMLButtonElement};
type Visual={card:Card;point:GesturePoint;phase:'dragging'|'pending'|'returning';returnTo?:GesturePoint};
type Options={root:RefObject<HTMLElement|null>;hand:RefObject<HTMLDivElement|null>;revision:number;playerId:string;canDrag:boolean;isLegal:(card:Card)=>boolean;source:(id:string)=>GesturePoint;onSelect:(id:string)=>void;onPlay:(id:string,point:GesturePoint)=>Promise<boolean>;onLift:()=>void;onReject:()=>void};
export function useCardGesture(options:Options){const live=useRef(options);live.current=options;const gesture=useRef<Gesture|null>(null);const visualRef=useRef<Visual|null>(null);const [visual,setVisualState]=useState<Visual|null>(null);const [feedback,setFeedback]=useState('');const ghost=useRef<HTMLDivElement>(null);const raf=useRef<number|null>(null),returnTimer=useRef<ReturnType<typeof setTimeout>|null>(null),messageTimer=useRef<ReturnType<typeof setTimeout>|null>(null);const suppressUntil=useRef(0),pending=useRef(false),mounted=useRef(true);const lastTap=useRef<{id:string;time:number}|null>(null);
 function setVisual(v:Visual|null){visualRef.current=v;if(mounted.current)setVisualState(v)}
 function notify(text:string){setFeedback(text);if(messageTimer.current)clearTimeout(messageTimer.current);messageTimer.current=setTimeout(()=>{if(mounted.current)setFeedback('')},2200)}
 function local(e:{clientX:number;clientY:number}){return tablePoint({x:e.clientX,y:e.clientY},live.current.root.current!.getBoundingClientRect(),matchMedia('(max-width: 600px) and (orientation: portrait)').matches)}
 function clearFrame(){if(raf.current!==null)cancelAnimationFrame(raf.current);raf.current=null}
 function releaseCapture(g:Gesture){try{if(g.element.hasPointerCapture(g.pointerId))g.element.releasePointerCapture(g.pointerId)}catch{}}
 function updateGhost(point:GesturePoint,velocity:GesturePoint){const el=ghost.current,root=live.current.root.current;if(!el||!root)return;el.style.setProperty('--drag-x',`${point.x}px`);el.style.setProperty('--drag-y',`${point.y}px`);el.style.setProperty('--drag-tilt',`${Math.max(-14,Math.min(14,velocity.x*7))}deg`);const g=gesture.current;root.classList.toggle('drag-over-table',!!g?.active&&acceptsCardRelease(g.center,point,velocity,dropZone(root.clientWidth,root.clientHeight),g.last))}
 useLayoutEffect(()=>{if(visual)updateGhost(visual.point,{x:0,y:0})},[visual?.phase,visual?.card.id]);
 function clearVisual(){live.current.root.current?.classList.remove('drag-over-table');setVisual(null)}
 function returnCard(card:Card,point:GesturePoint){pending.current=false;const target=live.current.source(card.id);setVisual({card,point,phase:'returning',returnTo:target});if(returnTimer.current)clearTimeout(returnTimer.current);returnTimer.current=setTimeout(clearVisual,matchMedia('(prefers-reduced-motion:reduce)').matches?100:300)}
 function cancel(immediate=false){const g=gesture.current;gesture.current=null;clearFrame();if(g){releaseCapture(g);if(g.active){suppressUntil.current=performance.now()+500;if(immediate)clearVisual();else returnCard(g.card,g.point)}}else if(immediate&&!pending.current)clearVisual()}
 function pointerDown(e:ReactPointerEvent<HTMLButtonElement>,card:Card){if(!e.isPrimary||e.button!==0||!live.current.canDrag||gesture.current||visualRef.current||pending.current||!live.current.root.current)return;setFeedback('');if(messageTimer.current)clearTimeout(messageTimer.current);const point=local(e);gesture.current={pointerId:e.pointerId,card,start:point,center:live.current.source(card.id),point:live.current.source(card.id),last:point,time:performance.now(),velocity:{x:0,y:0},active:false,scrolling:false,scrollStart:live.current.hand.current?.scrollLeft??0,element:e.currentTarget};e.currentTarget.setPointerCapture(e.pointerId)}
 function pointerMove(e:ReactPointerEvent<HTMLButtonElement>){const g=gesture.current;if(!g||g.pointerId!==e.pointerId)return;const point=local(e),dx=point.x-g.start.x,dy=point.y-g.start.y;const now=performance.now(),dt=Math.max(1,now-g.time);g.velocity={x:g.velocity.x*.35+(point.x-g.last.x)/dt*.65,y:g.velocity.y*.35+(point.y-g.last.y)/dt*.65};g.last=point;g.time=now;const hand=live.current.hand.current;if(!g.active&&!g.scrolling){const intent=cardDragIntent({x:dx,y:dy},!!(e.pointerType==='touch'&&hand&&hand.scrollWidth>hand.clientWidth+4));if(intent==='pending')return;g.scrolling=intent==='scroll'}if(g.scrolling){if(hand)hand.scrollLeft=g.scrollStart-dx;suppressUntil.current=now+500;return}g.point={x:g.center.x+dx,y:g.center.y+dy};if(!g.active){g.active=true;lastTap.current=null;setVisual({card:g.card,point:g.point,phase:'dragging'});live.current.onLift()}if(raf.current===null)raf.current=requestAnimationFrame(()=>{raf.current=null;const current=gesture.current;if(current?.active)updateGhost(current.point,current.velocity)});e.preventDefault()}
 async function commit(card:Card,point:GesturePoint,dragged=false){
  if(pending.current||!live.current.canDrag)return false;
  if(!live.current.isLegal(card)){notify('That card would exceed 21. Try another.');live.current.onReject();if(dragged)returnCard(card,point);return false}
  pending.current=true;lastTap.current=null;suppressUntil.current=performance.now()+600;
  if(dragged)setVisual({card,point,phase:'pending'});
  try{const accepted=await live.current.onPlay(card.id,point);if(!mounted.current)return accepted;if(accepted){clearVisual()}else{if(dragged)returnCard(card,point);notify('The move wasn’t accepted. Try again.')}return accepted}
  catch{if(mounted.current){if(dragged)returnCard(card,point);notify('The move wasn’t accepted. Try again.')}return false}
  finally{pending.current=false;suppressUntil.current=performance.now()+400}
 }
 function activate(card:Card,detail:number){
  if(!live.current.canDrag||pending.current||(detail!==0&&performance.now()<suppressUntil.current))return;
  if(!live.current.isLegal(card)){lastTap.current=null;notify('That card would exceed 21. Try another.');live.current.onReject();return}
  const now=performance.now(),previous=lastTap.current;
  if(detail>=2||(detail!==0&&previous?.id===card.id&&now-previous.time<=350)){void commit(card,live.current.source(card.id));return}
  lastTap.current=detail===0?null:{id:card.id,time:now};live.current.onSelect(card.id);live.current.onLift();
 }
 async function pointerUp(e:ReactPointerEvent<HTMLButtonElement>){
  const g=gesture.current;if(!g||g.pointerId!==e.pointerId)return;
  // Some browsers coalesce the last movement into pointerup. Process that sample too.
  const release=local(e);if(release.x!==g.last.x||release.y!==g.last.y)pointerMove(e);
  g.point={x:g.center.x+release.x-g.start.x,y:g.center.y+release.y-g.start.y};
  gesture.current=null;clearFrame();releaseCapture(g);
  if(!g.active){if(g.scrolling){lastTap.current=null;suppressUntil.current=performance.now()+500}return}
  suppressUntil.current=performance.now()+600;e.preventDefault();
  const root=live.current.root.current;if(!root)return clearVisual();
  const age=performance.now()-g.time,decay=age>120?0:Math.exp(-age/80);
  const velocity={x:g.velocity.x*decay,y:g.velocity.y*decay};
  if(!live.current.canDrag||!live.current.isLegal(g.card)){returnCard(g.card,g.point);notify('That card can’t be played now.');live.current.onReject();return}
  if(!acceptsCardRelease(g.center,g.point,velocity,dropZone(root.clientWidth,root.clientHeight),release)){returnCard(g.card,g.point);notify('Toss upward to play, or tap to select.');return}
  await commit(g.card,g.point,true);
 }
 useEffect(()=>{lastTap.current=null;cancel()},[options.revision,options.playerId,options.canDrag]);
 useEffect(()=>{mounted.current=true;const abort=()=>cancel(true),escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&gesture.current){e.preventDefault();cancel()}},visibility=()=>{if(document.hidden)cancel(true)};window.addEventListener('blur',abort);window.addEventListener('resize',abort);window.addEventListener('keydown',escape);document.addEventListener('visibilitychange',visibility);return()=>{mounted.current=false;gesture.current=null;clearFrame();if(returnTimer.current)clearTimeout(returnTimer.current);if(messageTimer.current)clearTimeout(messageTimer.current);window.removeEventListener('blur',abort);window.removeEventListener('resize',abort);window.removeEventListener('keydown',escape);document.removeEventListener('visibilitychange',visibility);live.current.root.current?.classList.remove('drag-over-table')}},[]);
 return {visual,ghost,feedback,notify,activate,pointerDown,pointerMove,pointerUp,pointerCancel:()=>cancel(),lostCapture:()=>{if(gesture.current)cancel()},legal:visual?options.isLegal(visual.card):true};
}
