import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sortHand} from '../lib/presentation.ts';
import type {Card} from '../lib/game.ts';
test('display sort is highest to lowest and leaves the actual deal untouched',()=>{const hand:Card[]=[{id:'a',kind:'number',value:1},{id:'wild',kind:'set21',value:0},{id:'seven',kind:'number',value:7},{id:'zero',kind:'number',value:0},{id:'b',kind:'number',value:1},{id:'bomb',kind:'bomb',value:0}];const copy=structuredClone(hand);const shown=sortHand(hand);assert.deepEqual(shown.map(c=>c.id),['seven','a','b','zero','wild','bomb']);assert.deepEqual(hand,copy);assert.equal(new Set(shown.map(c=>c.id)).size,hand.length)});
