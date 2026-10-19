# Product
<!-- impeccable:product-schema 1 -->
## Platform
web
## Users
Friends and families playing a fast card game together across phones, tablets, and computers.
## Product Purpose
5 Dead recreates the play mechanics of 5 Alive with an original identity, offline PWA play, bots, local pass-and-play, and online rooms.
## Capabilities and Constraints
Five lives, ten cards per player, a running total capped at 21. Correct special-card effects. User confirmed: above six players, scale complete decks equally while preserving hands, lives, and cap. Cryptographic unbiased shuffle and random starting seat. No hidden bot advantages. Online rooms require connectivity. Offline mode remains fully playable after installation.
## Brand Commitments
Name: 5 Dead. User confirmed a playful dark tabletop, bold original AI card artwork, clean uncluttered interface and minimal text except How to play.
## Open Implementation Decisions
Framework and hosting selected to support server-authoritative online rooms and offline caching. Party implementation supports 2–24 players; larger counts remain an explicitly unverified extension.
## Product Principles
Play first. Keep hands private. Apply the same rules and random distribution to everyone. Explain party rules openly. Do not imply affiliation with Hasbro.

## October 19 presentation update
User explicitly requested an UNO Mobile-inspired interface with bold graphics, meaningful game animations, sound effects, descending hand sorting, and landscape phone play. Keep the existing rules, privacy, offline play, and larger-group fairness. The latest visual request supersedes the first release's restrained game table.
