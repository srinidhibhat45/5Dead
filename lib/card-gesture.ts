export type GesturePoint={x:number;y:number};
export type DropZone={x:number;y:number;rx:number;ry:number};
/** Pointer coordinates must follow the CSS-rotated phone table as well as native landscape. */
export function tablePoint(client:GesturePoint,bounds:{left:number;top:number;right:number},rotated:boolean):GesturePoint{return rotated?{x:client.y-bounds.top,y:bounds.right-client.x}:{x:client.x-bounds.left,y:client.y-bounds.top}}
export function dropZone(width:number,height:number):DropZone{return {x:width*.5,y:height*.455,rx:width*.38,ry:height*.315}}
export function isOverTable(point:GesturePoint,zone:DropZone){return ((point.x-zone.x)/zone.rx)**2+((point.y-zone.y)/zone.ry)**2<=1}
/** Keep almost-horizontal swipes for browsing a long hand; lift immediately otherwise. */
export function cardDragIntent(delta:GesturePoint,scrollable:boolean):'pending'|'scroll'|'drag'{
 const x=Math.abs(delta.x),y=Math.abs(delta.y);
 if(Math.hypot(x,y)<5)return 'pending';
 if(scrollable&&x>y*3&&y<12)return x<12?'pending':'scroll';
 return 'drag';
}
/** A casual toss leaves the hand toward the table. Its landing is automatic. */
export function acceptsCardRelease(start:GesturePoint,point:GesturePoint,velocity:GesturePoint,zone:DropZone,grip?:GesturePoint){
 const dx=point.x-start.x,up=start.y-point.y;
 if(Math.hypot(dx,up)<10)return false;
 if(isOverTable(point,zone)||(grip&&isOverTable(grip,zone)))return true;
 const travel=Math.max(16,Math.min(24,zone.ry*.09));
 // Broad upward intent works even at low speed or when released beside the table.
 if(up>=travel&&up>=Math.abs(dx)*.15)return true;
 // Short, quick flicks count too; tiny twitches and sideways/downward swipes do not.
 return up>=12&&up>=Math.abs(dx)*.15&&velocity.y<=-.22&&-velocity.y>=Math.abs(velocity.x)*.15;
}
