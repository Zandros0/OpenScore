# Changelog

All notable changes to OpenScore are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- The score evolution chart now starts from zero, so a clear trend is visible as soon as the first round is filled in.
- A "Rejouer" option, from history or a finished game's detail page, to start a new game with the same players and the same game straight away, without retyping names.
- A "Terminer et rejouer" option in the in-game menu, to end the current game and jump straight into a new one with the same players.
- Papayo games can now be given a target score (500 by default) that ends the game once a player clearly crosses it — with a confetti celebration and a top-3 podium.
- The home screen no longer forces you straight back into a game in progress: it now shows it as a card you can resume or delete, and the game screen has a way back to that home screen. Once a game is finished, that same card offers to end it and return to the menu, end it and start over with the same players, or delete it.

### Fixed

- The app crashing on launch on the newest iOS version.
- The keyboard pushing the New Game and custom-game forms to the top instead of scrolling to the field being typed into.
- "Ajouter un joueur" not focusing the newly added player field, requiring an extra tap before typing.

## [1.2.0]

Baseline version at the start of changelog tracking.

[Unreleased]: https://github.com/aclec/OpenScore/compare/main...HEAD
