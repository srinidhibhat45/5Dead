import type {Cue} from './presentation';
/** Small synthesized effects keep sound available offline without downloads. */
export class GameAudio{
 private ctx:AudioContext|null=null;private master:GainNode|null=null;
 unlock(){try{this.ctx??=new AudioContext();if(!this.master){this.master=this.ctx.createGain();this.master.gain.value=.23;this.master.connect(this.ctx.destination)}void this.ctx.resume()}catch{}}
 close(){if(this.ctx)void this.ctx.close();this.ctx=null;this.master=null}
 play(cue:Cue){const c=this.ctx,master=this.master;if(!c||!master||c.state!=='running'||document.hidden)return;
 const tone=(freq:number,start:number,len:number,type:OscillatorType='sine',end=freq,vol=.5)=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,c.currentTime+start);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),c.currentTime+start+len);g.gain.setValueAtTime(.001,c.currentTime+start);g.gain.exponentialRampToValueAtTime(vol,c.currentTime+start+.012);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+start+len);o.connect(g);g.connect(master);o.start(c.currentTime+start);o.stop(c.currentTime+start+len+.02)};
 const noise=(start:number,len:number,freq:number,vol=.35)=>{const b=c.createBuffer(1,Math.ceil(c.sampleRate*len),c.sampleRate),data=b.getChannelData(0);let seed=17325;for(let i=0;i<data.length;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;data[i]=(seed>>>0)/2147483648-1}const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=b;f.type='lowpass';f.frequency.setValueAtTime(freq,c.currentTime+start);g.gain.setValueAtTime(vol,c.currentTime+start);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+start+len);src.connect(f);f.connect(g);g.connect(master);src.start(c.currentTime+start)};
 if(cue==='tap'){tone(900,0,.065,'sine',1100,.2)}
 else if(cue==='card'){noise(0,.13,2600,.4);tone(250,.07,.09,'sine',130,.3)}
 else if(cue==='deal'){for(let i=0;i<8;i++){noise(i*.07,.07,1900,.25);tone(450+i*40,i*.07,.055,'sine',300,.16)}}
 else if(cue==='turn'){tone(660,0,.12,'sine',660,.3);tone(880,.1,.18,'sine',880,.25)}
 else if(cue==='draw'){for(let i=0;i<3;i++){noise(i*.11,.09,2200,.4);tone(400+i*110,i*.11,.15,'triangle',650+i*100,.3)}}
 else if(cue==='reverse'){tone(250,0,.33,'triangle',1300,.35);tone(1300,.3,.33,'triangle',250,.3);noise(0,.5,1700,.2)}
 else if(cue==='skip'){tone(450,0,.12,'square',220,.18);tone(220,.13,.18,'square',180,.14)}
 else if(cue==='reset'){for(let i=0;i<5;i++)tone(1100-i*170,i*.06,.17,'sine',900-i*140,.3)}
 else if(cue==='bomb'){noise(0,.75,550,.9);tone(120,0,.8,'sine',26,.85);tone(72,.04,.7,'triangle',25,.45)}
 else if(cue==='life'){tone(420,0,.25,'triangle',190,.45);tone(190,.18,.35,'sine',85,.4)}
 else if(cue==='round'||cue==='win'){const notes=cue==='win'?[523,659,784,1047,784,1047,1319]:[440,554,659,880];notes.forEach((n,i)=>tone(n,i*.12,.32,'triangle',n,.38));if(cue==='win'){[523,659,784].forEach(n=>tone(n,.85,1,'sine',n,.2))}}
 }
}
