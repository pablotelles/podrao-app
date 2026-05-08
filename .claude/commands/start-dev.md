---
description: Start the dev pipeline for the current task. Reads .claude/current-task.json and runs architect -> migration -> feature-builder -> reviewer in sequence.
argument-hint: [optional path to task file, default: .claude/current-task.json]
---

## Read the handoff

Read the file: `.claude/current-task.json`
(or the path passed as argument: $ARGUMENTS)

File schema:

- `card` - Jira card ID (ex: KAN-9)
- `title` - task title
- `spec_path` - product spec path (relative to repo root Podrao/)
- `dev_spec_path` - designer dev spec path, or null
- `approved_decisions` - decisions already approved by Pablo
- `files_to_avoid` - files that must not be touched
- `branch` - git branch to use
- `status` - must be "ready_for_dev" to proceed

If `status` is not "ready_for_dev", report and stop.

---

## Pipeline

Execute in order. Each step uses an isolated subagent via Task tool.

### Step 1 - Architect

Use subagent `podrao-architect` with:

- Full contents of spec file at `spec_path` (read from parent folder ../docs/...)
- Full contents of `dev_spec_path` if not null
- `approved_decisions` and `files_to_avoid`
- Card ID and branch name

From architect JSON output:

- `status: "awaiting_input"` -> show `open_questions` to Pablo and stop
- `agent_assignments.needs_migration` -> determines if step 2 runs
- `agent_assignments.needs_feature_builder` -> must be true to continue

### Step 2 - Migration (only if `needs_migration: true`)

Create branch first: `git checkout -b [branch]`

Use subagent `podrao-supabase-migration` with the architect plan.

From migration JSON output:

- `status: "awaiting_input"` -> destructive change detected, show to Pablo and stop
- `pablo_command` -> show the command and wait for Pablo to confirm before continuing

### Step 3 - Feature Builder

If branch not created yet (migration was skipped): `git checkout -b [branch]`

Use subagent `podrao-feature-builder` with:

- Architect plan
- Migration output (if any)
- `approved_decisions` and `files_to_avoid`

From feature-builder JSON output:

- `status: "error"` -> report and stop
- Save `files_created` and `files_modified` for reviewer and final commit

### Step 4 - Reviewer

Use subagent `podrao-reviewer` passing the files changed by feature-builder.

From reviewer JSON output (`sign_off`):

- `"approved"` or `"approved_with_warnings"` -> proceed to checks
- `"rejected"` -> re-invoke feature-builder with `critical[]` items as required fixes. Max 2 retries. If still rejected, stop and report.

### Step 5 - Final checks

Run in `podrao-app/` directory:

```
npm run typecheck
npm run lint
npm run format:check
```

Report each result. Fix any failures before continuing.

### Step 6 - Jira and final output

- Move card to "Em analise": transition id `31`
- Add Jira comment summarizing what was implemented

Present to Pablo:

```
[card] em analise no Jira

Branch: [branch]

git add [files_created + files_modified]
git commit -m "feat([card lowercase]): [title]"
git push origin [branch]

Reviewer warnings: [important[] or "none"]
```

Update `.claude/current-task.json` with `status: "done"`.
