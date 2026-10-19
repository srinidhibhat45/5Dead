/** Fit the visible hand, keeping every card's selection area inside its tray. */
export function handLayout(count:number,width:number,height:number){
 const available=Math.max(44,width-32);
 const preferred=Math.min(112,Math.max(68,height*.205));
 const fanWidth=Math.min(preferred,Math.max(64,preferred*Math.sqrt(10/Math.max(10,count))));
 const step=count<2?0:Math.min(fanWidth*.76,(available-fanWidth)/(count-1));
 if(count<=1||step>=44)return {width:Math.min(fanWidth,available),step:Math.max(0,step),columns:Math.max(1,count),rows:1,grid:false};
 // Crowded hands become complete cards in two readable rows instead of a clipped fan.
 const columns=Math.max(1,Math.min(Math.ceil(count/2),Math.floor((available+8)/52)));
 const cardWidth=Math.min(76,Math.max(44,(height-150)/4.3),(available-(columns-1)*8)/columns);
 return {width:cardWidth,step:8,columns,rows:Math.min(2,Math.ceil(count/columns)),grid:true};
}
