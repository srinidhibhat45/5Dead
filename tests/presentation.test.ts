import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sortHand} from '../lib/presentation.ts';
import type {Card} from '../lib/game.ts';
test('display sort is highest to lowest and leaves the actual deal untouched',()=>{const hand:Card[]=[{id:'a',kind:'number',value:1},{id:'wild',kind:'set21',value:0},{id:'seven',kind:'number',value:7},{id:'zero',kind:'number',value:0},{id:'b',kind:'number',value:1},{id:'bomb',kind:'bomb',value:0}];const copy=structuredClone(hand);const shown=sortHand(hand);assert.deepEqual(shown.map(c=>c.id),['seven','a','b','zero','wild','bomb']);assert.deepEqual(hand,copy);assert.equal(new Set(shown.map(c=>c.id)).size,hand.length)});

import {acceptsCardRelease,cardDragIntent,dropZone,isOverTable,tablePoint} from '../lib/card-gesture.ts';
test('drag coordinates follow native landscape and the portrait rotation fallback',()=>{assert.deepEqual(tablePoint({x:215,y:112},{left:15,top:12,right:859},false),{x:200,y:100});assert.deepEqual(tablePoint({x:290,y:200},{left:0,top:0,right:390},true),{x:200,y:100});const zone=dropZone(844,390);assert(isOverTable({x:422,y:164},zone));assert(!isOverTable({x:50,y:350},zone))});
test('dropping onto the table is accepted without requiring a fast movement',()=>{const zone=dropZone(844,390);assert(acceptsCardRelease({x:410,y:340},{x:415,y:175},{x:0,y:0},zone));assert(!acceptsCardRelease({x:415,y:175},{x:417,y:174},{x:1,y:-1},zone),'A tap must not turn into a play')});
test('a deliberate throw can reach the table after release, including fast overshoots',()=>{const zone=dropZone(844,390);assert(acceptsCardRelease({x:420,y:350},{x:420,y:310},{x:0,y:-.9},zone));assert(acceptsCardRelease({x:420,y:350},{x:420,y:310},{x:0,y:-4},zone),'The swept path crosses the table even if the projected endpoint overshoots')});
test('taps, flat hand swipes, and downward drags stay in hand',()=>{
 const zone=dropZone(844,390),start={x:420,y:350};
 for(const [point,velocity] of [[{x:422,y:346},{x:0,y:-3}],[{x:500,y:345},{x:2,y:-.5}],[{x:420,y:375},{x:0,y:1}],[{x:420,y:337},{x:0,y:0}]] as const)assert(!acceptsCardRelease(start,point,velocity,zone));
});

test('slow drops on the visible table rim play without a throw',()=>{
 const zone=dropZone(1280,800);
 for(const point of [{x:640,y:580},{x:250,y:365},{x:1010,y:365}])assert(acceptsCardRelease({x:250,y:700},point,{x:0,y:0},zone),`Visible felt at ${JSON.stringify(point)} should accept the card`);
 assert(!acceptsCardRelease({x:250,y:700},{x:500,y:710},{x:0,y:0},zone),'Moving along the hand must not play');
});
test('a corner-held card drops when the release grip reaches the table',()=>{
 const zone=dropZone(1280,800),start={x:640,y:700},center={x:640,y:730},grip={x:640,y:590};
 assert(!acceptsCardRelease(start,center,{x:0,y:0},zone));
 assert(acceptsCardRelease(start,center,{x:0,y:0},zone,grip));
 assert(!acceptsCardRelease(start,{x:640,y:702},{x:0,y:0},zone,grip),'A tiny movement must remain a selection');
});

test('a small upward toss plays before reaching the felt, without speed or accurate aim',()=>{
 for(const [size,start,point] of [
  [[844,390],{x:150,y:350},{x:130,y:332}],
  [[1280,800],{x:230,y:700},{x:210,y:674}],
  [[844,390],{x:750,y:350},{x:830,y:330}],
  [[1280,800],{x:1050,y:700},{x:1150,y:674}],
 ] as const){const zone=dropZone(size[0],size[1]);assert(!isOverTable(point,zone));assert(acceptsCardRelease(start,point,{x:0,y:0},zone));}
});
test('short quick flicks play, while motion under the intent threshold stays a tap',()=>{
 const zone=dropZone(844,390),start={x:420,y:350};
 assert(acceptsCardRelease(start,{x:425,y:337},{x:.1,y:-.3},zone));
 assert(!acceptsCardRelease(start,{x:425,y:342},{x:.1,y:-3},zone));
});
test('diagonal phone lifts throw immediately while flat swipes scroll long hands',()=>{
 assert.equal(cardDragIntent({x:3,y:-2},true),'pending');
 assert.equal(cardDragIntent({x:8,y:-1},true),'pending');
 assert.equal(cardDragIntent({x:20,y:-2},true),'scroll');
 assert.equal(cardDragIntent({x:15,y:-6},true),'drag');
 assert.equal(cardDragIntent({x:2,y:-5},true),'drag');
 assert.equal(cardDragIntent({x:20,y:0},false),'drag');
});
