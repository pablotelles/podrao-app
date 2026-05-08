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

- `fields.customfield_10075` -> spec_path (plain text)
- `fields.customfield_10073` -> dev_spec_path (ADF paragraph, extract `.content[0].content[0].text`)
- `fields.customfield_10074` -> approved_decisions (ADF paragraph, extract text and split by newline)
- `fields.summary` -> card title
- `fields.description` -> additional context

If `customfield_10075` is null or empty, stop and tell the user the spec_path field is not filled in the Jira card. The Cowork product phase must run first.

Derive the branch name from the card key and title:

- Format: `feat/[card-lowercase]-[slug-of-title]`
- Example: KAN-9 "API de moderacao admin" -> `feat/kan-9-api-moderacao-admin`

---

## Pipeline

Execute in order. Each step uses an isolated subagent via Task tool.

### Step 1 - Architect

Use subagent `podrao-architect` with:

- Full file contents at spec_path (read the file)
- Full file contents at dev_spec_path if not null (read the file)
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

Reviewer warnings: [important[] or "none"]
```
