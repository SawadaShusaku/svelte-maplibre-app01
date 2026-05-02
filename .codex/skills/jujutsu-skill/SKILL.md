---
name: jujutsu
description: "Use Jujutsu (jj) for version control in jj-enabled projects. Covers command workflows, workspace management, bookmark management, rebasing, conflict resolution, revsets, and common pitfalls. Triggers when: project has a `.jj/` directory, README requires jj, or user explicitly requests jj commands. Do NOT use for regular git-only projects."
---

# Jujutsu Usage Guide

Jujutsu (jj) is a next-generation VCS compatible with Git repositories but with fundamentally different usage patterns.

## Mental Model (Fundamental Differences from Git)

### Don't Think in Git Terms

| Git Thinking | Problem |
|--------------|---------|
| `git add` | jj has no staging area, don't need add |
| Commits can't be changed | jj commits are editable "changes" |
| Use branches | jj uses bookmarks, lightweight pointers |
| `git stash` | Use `jj new @-` instead |
| Conflicts must be resolved immediately | jj conflicts can be deferred |

### Correct Mental Model

1. **Auto-tracking** — jj tracks all changes automatically, no `git add` needed
2. **Mutable commits** — commits are editable "changes", can be modified anytime
3. **Undoable operations** — almost all operations can be undone with `jj undo`
4. **Workspaces for parallelism** — separate `jj workspace`s are the isolation boundary for concurrent agents
5. **Bookmarks** — lightweight pointers for publishing/tracking, not workspace isolation
6. **Revsets** — powerful query syntax for complex conditions
7. **No checkout** — use `jj edit` to switch to a commit
8. **Non-blocking conflicts** — conflicts are recorded in commits, can be resolved later

## Core Concepts

### Change vs Commit

- **Commit**: Snapshot of files + metadata (author, date, parents)
- **Change**: Evolution history of a commit, identified by change ID (similar to Gerrit's Change-Id)
- **Working-copy commit**: The commit corresponding to the current working directory (@ symbol)

### Change ID vs Commit ID

- **Change ID**: Unique to jj, 16 bytes randomly generated, format like `kntqzsqt`, remains unchanged
- **Commit ID**: Git-compatible commit hash, changes with content

### Bookmark vs Branch

- **Bookmark**: Named pointer to a commit, similar to Git branch
- **No "current bookmark"** — jj has no concept of active branch
- **Tracked bookmark**: Automatically tracks remote bookmark of the same name

### Repository Harness

This repository treats `jj` as the only supported VCS CLI for agent work.

- Do not run `git` in this repo, even for read-only inspection
- Use the repo-local wrapper `.codex/with-agent-path.sh` so `.codex/shims/git` is first on `PATH`
- Prefer non-colocated repos when operationally feasible: `jj git colocation disable`

## Workspace vs Bookmark

- **Workspace**: Separate working directory with its own working-copy commit, dependency cache, and untracked files
- **Bookmark**: Named pointer used for publishing and remote tracking
- For parallel AI agent work, use separate sibling-directory workspaces instead of splitting tasks only with bookmarks or `jj new` inside one workspace

## Quick Command Reference

```bash
# Status
jj st                    # Current changes (like git status)
jj log                   # History
jj log --graph           # Graph view

# Working with changes (no add needed)
jj diff                  # View current changes
jj describe              # Edit commit message
jj commit -m "message"   # Commit (auto-includes all changes)
jj squash                # Squash into parent (like git commit --amend)
jj restore <path>        # Discard file changes

# ⚠️ No checkout!
# Switch to edit a commit: jj edit <revision>
# Create new change: jj new

# Creation and switching
jj new                   # Create new empty change (child of current @)
jj new <revision>        # Create new change based on revision
jj new -b <bookmark>     # Create new change and set bookmark
jj edit <revision>       # Switch to a commit for editing (like checkout)

# Bookmarks
jj bookmark list                              # List bookmarks
jj bookmark create <name> -r <revision>       # Create bookmark
jj bookmark delete <name>                     # Delete bookmark
jj bookmark move <name> --to <revision>       # Move bookmark
jj bookmark track <name> --remote=<remote>    # Track remote bookmark

# Workspaces (preferred for parallel agent work)
jj workspace list                             # List workspaces
jj workspace add ../repo.feature-a -r main    # Create sibling workspace from main
jj workspace forget repo.feature-a            # Remove workspace registration (delete dir separately)

# Rebase
jj rebase -b <bookmark> -o <dest>  # Move entire branch
jj rebase -s <commit> -o <dest>    # Move commit and descendants
jj rebase -r <commit> -o <dest>    # Move only specified commit

# Remote operations
jj git fetch                       # Fetch
jj git push                        # Push
jj git push --bookmark <name>      # Push specific bookmark

# Undo
jj undo                            # Undo last operation
jj op log                          # View operation log

# Multiple remotes
jj config set --user git.fetch '["upstream", "origin"]'
jj bookmark track main --remote=origin
```

## Common Workflows

### Daily Commit
```bash
jj st
jj diff
jj commit -m "feat: add new feature"
jj log
```

### Modifying Historical Commits
```bash
# Edit current commit message
jj describe -m "new message"

# Squash current changes into parent
jj squash

# Squash into specific commit
jj squash --into <commit>
```

### Editing Existing Commit (like git checkout)
```bash
# Switch to a commit for editing — all subsequent changes amend this commit
jj edit <revision>
```

### Creating New Branch
```bash
jj new main -b topic
```

### Parallel AI Agent Work (Preferred)
```bash
# One-time setup to reduce stale workspace friction
jj config set --user snapshot.auto-update-stale true

# Pattern A: derive from main (general default)
jj workspace add ../myproj.feature-a -r main
jj workspace add ../myproj.feature-b -r main

# Pattern B: inherit the current working state (omit -r)
# Use this when you want an agent to continue what you are currently editing
jj workspace add ../myproj.feature-a

# Pattern C: derive from any specific revision
jj workspace add ../myproj.feature-a -r @-
jj workspace add ../myproj.feature-a -r abc123
jj workspace add ../myproj.feature-a -r my-branch

# Inside each workspace, install deps and link untracked env files if needed
cd ../myproj.feature-a
npm install
ln -s ../myproj/.env .env

# Cleanup after the work is no longer needed
cd ../myproj
jj workspace forget myproj.feature-a
rm -rf ../myproj.feature-a
```

- Use sibling directory names like `{repo}.{workspace}` and keep the workspace name equal to the directory name
- Pattern A is the normal choice when you want a clean workspace from the latest `main`
- Pattern B inherits the current working state, which is useful when splitting off in-progress work to another agent
- Pattern C is for exact parent control when you want to branch from a particular revision, change ID, or bookmark
- Always pass `../...` or an absolute path to `jj workspace add`
- Do not run `jj workspace add feature-a`, which nests a workspace inside the current repo
- Use one workspace per concurrent agent; `jj new` alone is not sufficient isolation for parallel edits

### Rebase
```bash
jj rebase -b topic -o main           # Move entire branch (with all descendants)
jj rebase -s <commit> -o <dest>      # Move single commit and descendants
jj rebase -r <commit> -o <dest>      # Move only single commit (no descendants)
```

### Handling Conflicts
```bash
# Conflicts don't block; jj creates a conflicted change
jj new <conflicted-commit>   # Create new commit to resolve
# Edit conflict markers in files...
jj resolve <file>            # Mark resolved
jj squash                    # Squash into original
```

### Temporarily Stashing Work
```bash
jj new @-                    # Create sibling commit (like git stash)
jj edit <original-commit>    # Restore
```

### Divergent Changes
```bash
jj log                                               # Shows divergent label
jj abandon <unwanted-commit-id>                      # Abandon one version
jj metaedit --update-change-id <commit-id>           # Generate new change ID
jj squash --from <source> --into <target>            # Merge both versions
```

## Important Notes

1. **Don't use `git add`** — jj auto-tracks
2. **No checkout** — use `jj edit` to switch, `jj new` to create
3. **`jj commit` auto-includes all changes** — no `-a` needed
4. **Conflicts don't block** — can continue working, resolve later
5. **`jj new` creates a change** — editable empty commit, NOT a checkout
6. **Bookmarks have tracked concept** — like Git's upstream
7. **`git` is disabled in this repo's agent harness** — use `jj` equivalents only
7. **Prefer `jj workspace add` for concurrent agent work** — bookmarks and sibling changes do not isolate file-system side effects

## Revset Quick Reference

```bash
@        # Current working-copy commit
@-       # Parent commit
root()   # Root commit

jj log -r ::@           # Ancestor chain of current commit
jj log -r 'all()'       # All visible commits
jj log -r main..        # Commits after main branch
```

## Getting Help

```bash
jj help
jj help <subcommand>
```

## Reference Files

- **`references/commands.md`** — Full Git-to-jj command mapping table; read when looking up a specific command equivalent
- **`references/revsets.md`** — Complete revset query syntax and functions; read when writing `-r` expressions
- **`references/pitfalls.md`** — Common mistakes and pre-operation checklist; read when uncertain about correct approach
- **`references/advanced.md`** — Colocated workspaces, multiple remotes, divergent changes, filesets, operation log; read for advanced scenarios
