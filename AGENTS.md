# AGENTS.md

This file provides guidance to Codex and other OpenAI agents when working with code in this repository.

The primary reference for this repo is [`CLAUDE.md`](CLAUDE.md), which contains the full architecture overview, commands, conventions, and verification checklist. Read it before making any changes.

## Ground rules

- **Ask before modifying any file.** Propose the change and wait for approval before editing.
- Do not edit `node_modules/`, `public/`, or `src/pages/composition/scripts/waveform-playlist.umd.js`.
- Do not edit the `waveform-playlist` submodule unless explicitly requested. Source repo: https://github.com/gilpanal/waveform-playlist
- Update `CLAUDE.md` (and this file) when you detect drift — treat that update as a file modification subject to the same approval rule.
