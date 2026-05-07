---
description: Implement a feature using the podrao-feature-builder agent (writes code following Clean Architecture)
argument-hint: <feature description or plan>
---

Use the `podrao-feature-builder` subagent to implement the following:

$ARGUMENTS

The builder MUST:

1. Read CLAUDE.md and ARCHITECTURE.md before writing any code.
2. Search for existing components, hooks, and utils to reuse before creating new ones.
3. Follow the vertical slice template (entity → interface → DTO → use case → repo impl → container → schema → API route → hook).
4. Run `npm run typecheck`, `npm run format:check`, and `npm run lint` before declaring done.
5. NOT commit or push — leave changes staged for me to review.

After the builder finishes, automatically invoke the `podrao-reviewer` subagent to check the diff before reporting back to me.
