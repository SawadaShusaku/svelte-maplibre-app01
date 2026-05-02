---
name: jujutsu
description: "Use Jujutsu (jj) for version control in jj-enabled projects. Covers command workflows, bookmark management, rebasing, conflict resolution, revsets, and common pitfalls. Triggers when: project has a `.jj/` directory, README requires jj, or user explicitly requests jj commands. Do NOT use for regular git-only projects."
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
4. **Bookmarks** — lightweight pointers, similar to Git branches but with tracked concept
5. **Revsets** — powerful query syntax for complex conditions
6. **No checkout** — use `jj edit` to switch to a commit
7. **Non-blocking conflicts** — conflicts are recorded in commits, can be resolved later

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

### Colocated Workspaces

jj and git can coexist in the same directory:
- `.jj/` + `.git/` coexist
- jj and git commands can be mixed
- jj automatically imports/exports to git

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
