import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sortHand} from '../lib/presentation.ts';
import type {Card} from '../lib/game.ts';
test('display sort is highest to lowest and leaves the actual deal untouched',()=>{const hand:Card[]=[{id:'a',kind:'number',value:1},{id:'wild',kind:'set21',value:0},{id:'seven',kind:'number',value:7},{id:'zero',kind:'number',value:0},{id:'b',kind:'number',value:1},{id:'bomb',kind:'bomb',value:0}];const copy=structuredClone(hand);const shown=sortHand(hand);assert.deepEqual(shown.map(c=>c.id),['seven','a','b','zero','wild','bomb']);assert.deepEqual(hand,copy);assert.equal(new Set(shown.map(c=>c.id)).size,hand.length)});

import {acceptsCardRelease,dropZone,isOverTable,tablePoint} from '../lib/card-gesture.ts';
test('drag coordinates follow native landscape and the portrait rotation fallback',()=>{assert.deepEqual(tablePoint({x:215,y:112},{left:15,top:12,right:859},false),{x:200,y:100});assert.deepEqual(tablePoint({x:290,y:200},{left:0,top:0,right:390},true),{x:200,y:100});const zone=dropZone(844,390);assert(isOverTable({x:422,y:164},zone));assert(!isOverTable({x:50,y:350},zone))});
test('dropping onto the table is accepted without requiring a fast movement',()=>{const zone=dropZone(844,390);assert(acceptsCardRelease({x:410,y:340},{x:415,y:175},{x:0,y:0},zone));assert(!acceptsCardRelease({x:415,y:175},{x:417,y:174},{x:1,y:-1},zone),'A tap must not turn into a play')});
test('a deliberate throw can reach the table after release, including fast overshoots',()=>{const zone=dropZone(844,390);assert(acceptsCardRelease({x:420,y:350},{x:420,y:310},{x:0,y:-.9},zone));assert(acceptsCardRelease({x:420,y:350},{x:420,y:310},{x:0,y:-4},zone),'The swept path crosses the table even if the projected endpoint overshoots')});
test('sideways swipes, slow releases, short twitches, and throws away never commit',()=>{const zone=dropZone(844,390);const start={x:420,y:350},point={x:420,y:310};assert(!acceptsCardRelease(start,point,{x:1.5,y:0},zone));assert(!acceptsCardRelease(start,point,{x:0,y:.9},zone));assert(!acceptsCardRelease(start,point,{x:0,y:-.3},zone));assert(!acceptsCardRelease(start,{x:420,y:330},{x:0,y:-3},zone));assert(!acceptsCardRelease(start,{x:800,y:300},{x:0,y:-3},zone))});

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
