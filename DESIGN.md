# 5 Dead: midnight arena
User requested a full game-presentation upgrade referencing UNO Mobile: a landscape social arena, large overlapping cards, expressive avatars, dramatic action feedback, animated dealing and tactile audio. This replaces the first release's flat game table. The simple setup and underlying rules remain.

## Visual world
A luminous teal card table floating in a midnight fantasy sky. Original AI environment and six rounded 3D character portraits, rich navy shadows, pearl-rimmed avatars, warm gold turn markers, coral life loss, glossy saturated cards. Barlow Condensed remains the game lettering; DM Sans remains the supporting face. No UNO marks or artwork.

## Layout
The active game fills the screen. Opponents occupy the far, left and right sides. The player's fanned hand runs along the bottom, ordered numeric 7 down to 0 then wilds. The running total and actual discard pile own the center. A compact roster includes every player at larger tables. Phones use native landscape/fullscreen where available, with a CSS-rotated live landscape table fallback. Menus, privacy screens and results remain operable in the same orientation.

## Motion thesis
Focal moment: an action card flies into the shared pile, then its consequence plays across the table: bombs create expanding shockwaves and life reactions; reverse sweeps the table; draws send cards to recipients; clearing a hand and winning emit celebration particles.
Continuity: public server receipts identify actions without leaking private hands; a bounded queue sequences cues. Newly dealt hands fan in and selected cards lift. Active player portraits identify turn order; the 21 total and life losses remain meaningful without motion.
Feedback: distinct synthesized offline sounds for card movement, dealing, turn, draw, reverse, skip, reset, bomb, life loss and victory. Sound has a persistent mute control and is unlocked by a user gesture.
Budget: CSS transforms/opacity for moving cards and bounded particles; no 3D runtime or new animation dependency. Reduced motion removes spatial sequences while retaining cue text, color and short fades. Local bot turns wait for the current effect to finish.

## Rules
Whole 77-card decks scale at one per six players, preserving the existing 2–24 player implementation. Display sorting never alters a deal. Game effects and rules use the same authoritative engine.
