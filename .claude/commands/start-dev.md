---
description: Start the dev pipeline for a Jira card. Reads context directly from the card (Spec Path, Dev Spec Path, Approved Decisions) and runs architect -> migration -> feature-builder -> reviewer.
argument-hint: <card ID, ex: KAN-9>
---

## Read context from Jira

The card ID is: $ARGUMENTS

Use `getJiraIssue` to fetch the card:

- cloudId: `9da10909-fb30-4de2-82ca-bfc61b493507`
- issueIdOrKey: $ARGUMENTS

Extract these fields from the response:

- `fields.description` -> spec_content (ADF — extract all text nodes concatenated; this is the product spec written by podrao-product)
- `fields.customfield_10073` -> two values from ADF (two paragraphs):
  - dev_spec_slim: `.content[0].content[0].text` (component mapping + new tokens)
  - html_path: `.content[1].content[0].text` (optional — may not exist for cards without UI)
- `fields.customfield_10074` -> approved_decisions (ADF paragraph, extract text and split by newline)
- `fields.summary` -> card title

If `fields.description` is null or empty, stop and tell the user the product spec has not been written to the Jira card. The Cowork product phase must run first via /impl in the Cowork session.

Derive the branch name from the card key and title:

- Format: `feat/[card-lowercase]-[slug-of-title]`
- Example: KAN-9 "API de moderacao admin" -> `feat/kan-9-api-moderacao-admin`

---

## Pipeline

Execute in order. Each step uses an isolated subagent via Task tool.

### Step 1 - Architect

Use subagent `podrao-architect` with:

- spec_content (from fields.description — no file read needed)
- dev_spec_slim (from customfield_10073 paragraph 1 — no file read needed)
- approved_decisions list
- Card ID, title, and branch

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

If branch not created yet: `git checkout -b [branch]`

Use subagent `podrao-feature-builder` with:

- Architect plan
- Migration output (if any)
- approved_decisions and any files_to_avoid
- html_path (if extracted from Jira — pass as `html_path` for visual reference)

From feature-builder JSON output:

- `status: "error"` -> report and stop
- Save `files_created` and `files_modified` for reviewer and final commit

### Step 4 - Reviewer

Use subagent `podrao-reviewer` passing the files changed by feature-builder.

From reviewer JSON output (`sign_off`):

- `"approved"` or `"approved_with_warnings"` -> proceed to checks
- `"rejected"` -> re-invoke feature-builder with `critical[]` items as required fixes. Max 2 retries. If still rejected, stop and report.

### Step 5 - Final checks

Run in the project directory:

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

Reviewer warnings: [important[] or "n
```
