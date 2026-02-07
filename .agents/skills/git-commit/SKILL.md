---
name: git-commit
description: 'Execute git commit with conventional commit message analysis, intelligent staging, and message generation. Use when user asks to commit changes, create a git commit, mentions "/commit", or asks to push to main. Supports: (1) Auto-detecting type and scope from changes, (2) Generating conventional commit messages from diff, (3) Interactive commit with optional type/scope/description overrides, (4) Intelligent file staging for logical grouping, (5) Auto-generating CHANGELOG.md before pushing to main'
license: MIT
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

# Git Commit with Conventional Commits

## Overview

Create standardized, semantic git commits using the Conventional Commits specification. Analyze the actual diff to determine appropriate type, scope, and message.

## Conventional Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

| Type       | Purpose                        |
| ---------- | ------------------------------ |
| `feat`     | New feature                    |
| `fix`      | Bug fix                        |
| `docs`     | Documentation only             |
| `style`    | Formatting/style (no logic)    |
| `refactor` | Code refactor (no feature/fix) |
| `perf`     | Performance improvement        |
| `test`     | Add/update tests               |
| `build`    | Build system/dependencies      |
| `ci`       | CI/config changes              |
| `chore`    | Maintenance/misc               |
| `revert`   | Revert commit                  |

## Breaking Changes

```
# Exclamation mark after type/scope
feat!: remove deprecated endpoint

# BREAKING CHANGE footer
feat: allow config to extend other configs

BREAKING CHANGE: `extends` key behavior changed
```

## Workflow

### 1. Analyze Diff

```bash
# If files are staged, use staged diff
git diff --staged

# If nothing staged, use working tree diff
git diff

# Also check status
git status --porcelain
```

### 2. Stage Files (if needed)

If nothing is staged or you want to group changes differently:

```bash
# Stage specific files
git add path/to/file1 path/to/file2

# Stage by pattern
git add *.test.*
git add src/components/*

# Interactive staging
git add -p
```

**Never commit secrets** (.env, credentials.json, private keys).

### 3. Generate Commit Message

Analyze the diff to determine:

- **Type**: What kind of change is this?
- **Scope**: What area/module is affected?
- **Description**: One-line summary of what changed (present tense, imperative mood, <72 chars)

### 4. Execute Commit

```bash
# Single line
git commit -m "<type>[scope]: <description>"

# Multi-line with body/footer
git commit -m "$(cat <<'EOF'
<type>[scope]: <description>

<optional body>

<optional footer>
EOF
)"
```

## Best Practices

- One logical change per commit
- Present tense: "add" not "added"
- Imperative mood: "fix bug" not "fixes bug"
- Reference issues: `Closes #123`, `Refs #456`
- Keep description under 72 characters

## Push to Main — Auto-generate Changelog

**IMPORTANT**: When the user asks to push to main (e.g., "push", "sube los cambios", "git push"), you MUST generate/update the `CHANGELOG.md` BEFORE pushing.

### Changelog Workflow

1. **Read the full commit history** to understand all changes:

```bash
git log --format="%H %ai %s%n%b---" --reverse
```

2. **Read the existing `CHANGELOG.md`** (if it exists) to know the last documented version.

3. **Determine the new version number** by analyzing commits since the last documented version:
   - `feat` commits → bump MINOR version (0.X.0)
   - `fix` commits only → bump PATCH version (0.0.X)
   - Breaking changes (`!` or `BREAKING CHANGE`) → bump MAJOR version (X.0.0)
   - If no new commits since last version, skip changelog update

4. **Generate a new version entry** at the top of the changelog (after the header). Follow the [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features (from `feat` commits)

### Fixed
- Bug fixes (from `fix` commits)

### Changed
- Refactors, updates (from `refactor`, `perf`, `style` commits)

### Documentation
- Docs changes (from `docs` commits)
```

   - Only include sections that have entries (skip empty sections)
   - Group related commits into meaningful bullet points
   - Write descriptions that explain the user-facing impact, not just the commit message
   - Use bold for feature names (e.g., `**Pomodoro timer**`)
   - Add sub-bullets for details when a feature has multiple parts

5. **Update `CHANGELOG.md`** using Edit or Write tool.

6. **Commit the changelog**:

```bash
git add CHANGELOG.md
git commit -m "docs: update changelog for vX.Y.Z

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

7. **Then push**:

```bash
git push origin main
```

### Changelog Format Reference

The existing `CHANGELOG.md` in this project uses this header:

```markdown
# Changelog

All notable changes to **Task-It** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---
```

Each version entry follows `## [X.Y.Z] - YYYY-MM-DD` with subsections: Added, Fixed, Changed, Documentation.

## Git Safety Protocol

- NEVER update git config
- NEVER run destructive commands (--force, hard reset) without explicit request
- NEVER skip hooks (--no-verify) unless user asks
- NEVER force push to main/master
- If commit fails due to hooks, fix and create NEW commit (don't amend)
