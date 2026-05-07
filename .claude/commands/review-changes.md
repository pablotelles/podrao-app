---
description: Review pending changes with the podrao-reviewer agent (Clean Architecture, SOLID, DRY, design tokens)
argument-hint: <optional: scope or specific files>
---

Use the `podrao-reviewer` subagent to review the current changes in the Podrao repo.

Scope (if specified): $ARGUMENTS
If no scope given, review `git diff` (unstaged) and `git diff --cached` (staged) — everything that is not yet committed.

The reviewer should categorize findings under: Critical (blocks merge), Important, Suggestions, Passes. It should check the dependency rule, the 5 monorepo split-readiness rules, API conventions, design system tokens, code reuse / DRY, and SOLID principles. Cite file paths and line numbers.
