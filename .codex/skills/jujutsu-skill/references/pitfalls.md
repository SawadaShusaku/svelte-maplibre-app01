# Common Mistakes and Pitfalls

> Based on official docs, mistakes agents commonly make.

## 🔴 Critical Mistakes

### Using `git` at All in This Repository

**Mistake**: Running any `git` command in this repo

**Problem**: This repository's agent harness intentionally blocks `git` to prevent mixed `git`/`jj` workflows and branch drift

**Correct**:
```bash
# Launch shells and commands through the wrapper
.codex/with-agent-path.sh zsh

# Use jj equivalents instead
jj st
jj log
jj diff
jj git fetch
```

### Using `git add`

**Mistake**: Using `git add` to stage files

**Problem**: jj has no staging area, `git add` has no effect

**Correct**:
```bash
# jj auto-tracks all changes, just commit directly
jj commit -m "message"

# If you only want to commit some files, use jj split
jj split file1 file2
```

### Using `jj co` or `jj checkout` to Switch

**Mistake**: Using `jj co <bookmark>` or `jj checkout`

**Problem**: jj doesn't have these commands at all!

**Correct**:
```bash
# Create new change on bookmark (like checkout -b)
jj new main

# Create new change and set bookmark
jj new main -b myfeature

# Edit existing commit
jj edit <revision>
```

### Using Bookmarks or `jj new` Alone for Parallel Agent Work

**Mistake**: Starting multiple agents in one workspace and separating them only with bookmarks or `jj new`

**Problem**: The agents still share one working directory, dependency tree, and generated files, so their edits can collide

**Correct**:
```bash
# Create a sibling workspace per task or agent
jj workspace add ../myproj.feature-a -r main
jj workspace add ../myproj.feature-b -r main

# Then work inside each directory separately
cd ../myproj.feature-a
```

### Creating a Nested Workspace by Accident

**Mistake**: Running `jj workspace add feature-a`

**Problem**: Without `../` or an absolute path, the new workspace is created inside the current repo

**Correct**:
```bash
# Use a sibling path or absolute path
jj workspace add ../myproj.feature-a -r main
```

### Using `git stash`

**Mistake**: Using `git stash`

**Problem**: jj has no stash, use `jj new @-` to create sibling commit

**Correct**:
```bash
# Temporarily save current work (create sibling commit)
jj new @-

# Restore: jj edit to go back to original commit
jj edit <original-commit>
```

### Using `git merge`

**Mistake**: Using `jj merge`

**Problem**: jj has no merge command

**Correct**:
```bash
# Merge A into current commit
jj new @ A
```

## 🟠 Common Mistakes

### Confusing `-b` and `-s` in Rebase

**Misconception**: `-b` moves a single commit

**Correct**:
- `-b <bookmark>`: Move entire branch (includes ancestors, excluding destination's ancestors)
- `-s <commit>`: Move commit and all descendants
- `-r <commit>`: Move only the specified commit (no descendants)

```bash
# Move A and descendants
jj rebase -s A -o B

# Move entire branch
jj rebase -b bookmark -o main

# Move only single commit
jj rebase -r A -o B
```

### `jj new` Without Arguments

**Misconception**: `jj new` equals `git checkout -b`

**Correct**: `jj new` creates a new change based on current `@`, no bookmark name, and it does not create a separate workspace

```bash
# Create new change (no bookmark)
jj new

# Create and set bookmark
jj new -b <bookmark>

# Create based on some commit
jj new <revision>
```

### Not Knowing How to Continue After Conflicts

**Misconception**: Must resolve conflicts immediately

**Correct**: jj allows continuing work first, resolving later

```bash
# After conflict, jj creates conflicted change
# Can continue creating new commits
jj new

# Then go back to resolve
jj new <conflicted-commit>
# Resolve conflicts in files
jj resolve <file>
jj squash
```

### Using `jj file untrack` Without Setting Ignore

**Mistake**: Running `jj file untrack` directly

**Problem**: File must match ignore pattern to untrack

**Correct**:
```bash
# 1. Add to .gitignore first
echo "file.txt" >> .gitignore

# 2. Then untrack
jj file untrack file.txt
```

### Confusing Bookmarks and Changes

**Misconception**: Bookmark equals branch

**Correct**:
- **Bookmark**: Similar to Git branch, pointer to a commit
- **Change**: jj's core concept, editable commit
- **Working-copy commit**: The commit in current working directory (@ symbol)
- **No "current bookmark"** — jj has no active branch concept

### Ignoring Divergent Changes

**Misconception**: Using change ID is always unambiguous

**Correct**: If change ID has diverged, need to use commit ID or change ID with offset

```bash
# Diverged change ID
jj log  # Shows as xyz/0, xyz/1

# Use commit ID
jj edit <commit-id>

# Or use change ID with offset
jj edit xyz/0
```

## 🟡 Minor Issues

### Forgetting `-m` Flag

**Problem**: `jj commit` without `-m` opens editor

**Suggestion**: Get in habit of using `jj commit -m "message"`

### Using `git init` in Git Projects

**Problem**: Should use `jj git init`

**Correct**:
```bash
jj git init
# or
jj git clone <url>
```

### Confusing Tracked vs Untracked Bookmarks

**Misconception**: Auto-tracks after fetch

**Correct**:
```bash
# Only tracks origin/main by default
# Others need manual track
jj bookmark track <name> --remote=<remote>

# View tracked
jj bookmark list --tracked
```

## Checklist

Before operating, quick check:
- [ ] Don't use `git add`
- [ ] Don't use `git` at all in this repository
- [ ] Don't use `jj co` or `jj checkout`
- [ ] Use `jj commit` not `git commit`
- [ ] Use `jj bookmark` not `git branch`
- [ ] Use `jj new @ A` not `git merge`
- [ ] Use `jj rebase -b`, `-s`, or `-r` for rebase
- [ ] Use `jj new @-` for stash, not `git stash`
- [ ] Use `jj workspace add ../repo.task -r main` for concurrent agent work
- [ ] Do not create nested workspaces with `jj workspace add feature-a`
- [ ] Diverged change IDs need explicit commit ID
