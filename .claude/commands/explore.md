---
description: Map a concept in the Podrao codebase using the podrao-explorer agent (fast, read-only)
argument-hint: <question, e.g. "where is geo radius search implemented?">
---

Use the `podrao-explorer` subagent to answer the following question about the Podrao codebase:

$ARGUMENTS

The explorer should produce a focused report with file paths and line numbers, tracing across architectural layers when relevant (presentation → application → domain ← infrastructure). Do not suggest changes — just map what exists.
