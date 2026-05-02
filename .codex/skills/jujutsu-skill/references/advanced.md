# Advanced Topics

> Supplementary content based on official docs

## Colocated Workspaces

jj and git can coexist in the same directory, facilitating migration and tool interoperability.

### Creation

```bash
# Create colocated workspace (default)
jj git init
# or
jj git clone <url>

# Disable colocation
jj git init --no-colocate
jj git clone --no-colocate <url>
```

### Mixing jj and git

```bash
# In colocated workspace you can:
jj st
git status  # Can also use, but may show "detached HEAD"

# jj commands auto import/export to git
# But recommend mainly using jj, git for read-only only
```

### Notes

- jj commands frequently auto import/export, may cause branch conflicts
- In large repos jj can be slower (executes git import on every command)
- Git tools may have issues with conflicted files

## Multiple Remotes

### Typical Workflows

#### Fork Workflow (Contributing Upstream)

```bash
# 1. Configure fetch from multiple remotes
jj config set --user git.fetch '["upstream", "origin"]'

# 2. Push only to origin
jj config set --user git.push origin

# 3. Track remote bookmarks
jj bookmark track main  # Track origin/main
jj bookmark track main --remote=upstream  # Also track upstream

# 4. Set trunk (as immutable base)
jj config set --user 'revset-aliases."trunk()"' main@upstream
```

#### Integration Workflow (Independent Repo)

```bash
# 1. Only fetch and push from/to origin
jj config set --user git.fetch '["origin"]'

# 2. Only track origin
jj bookmark track main --remote=origin
jj bookmark untrack main --remote=upstream

# 3. Set trunk to origin
jj config set --user 'revset-aliases."trunk()"' main@origin
```

### Remote Bookmark References

```bash
# Reference remote bookmarks
main@origin   # main on origin
main@upstream # main on upstream

# Create on new remote
jj new main@upstream
```

## Divergent Changes

When a change ID has multiple visible commits.

### Causes

1. Local and remote both modified same change
2. Operating on same change from different workspaces
3. Concurrent operations

### Identification

```bash
jj log
# Shows:
# mzvwutvl/0 ... (divergent)
# mzvwutvl/1 ... (divergent)
```

### Resolution Strategies

#### 1. Abandon One

```bash
# Abandon unwanted version
jj abandon <commit-id>
```

#### 2. Generate New Change ID

```bash
# Generate new change ID for a commit
jj metaedit --update-change-id <commit-id>
```

#### 3. Squash Together

```bash
# Squash one into another
jj squash --from <source-commit-id> --into <target-commit-id>
```

#### 4. Ignore

If not affecting work, can leave as-is.

## Operation Log

jj records every operation that modifies the repo, more powerful than Git's reflog.

### Viewing

```bash
# Operation list
jj op log

# Operations with diffs
jj op log -p
```

### Undoing

```bash
# Undo last operation
jj undo

# Undo to specific operation
jj undo --at-operation <operation-id>
```

### Restoring to Previous State

```bash
# Restore entire repo to state at operation
jj op restore --at-operation <operation-id>
```

### Time Travel

```bash
# Run command at operation state (non-destructive)
jj --at-operation <operation-id> log
```

## Deep Dive on Conflicts

### Conflict Types

1. **File conflicts**: Same file/location modified differently
2. **Bookmark conflicts**: Local and remote bookmark move conflicts
3. **Change divergence**: Same change ID multiple visible commits

### Conflict Resolution

```bash
# 1. Create new commit on conflicted commit
jj new <conflicted-commit>

# 2. Edit files to resolve conflicts
# Edit conflict markers...

# 3. Mark resolved
jj resolve <file>

# 4. If multiple conflicted files, after all resolved
jj squash
```

### Conflict Marker Styles

Configurable (default "diff"):
```bash
# diff style (default)
jj config set --user ui.conflict-marker-style diff

# snapshot style
jj config set --user ui.conflict-marker-style snapshot

# git style
jj config set --user ui.conflict-marker-style git
```

## Filesets

Similar to revsets but for file selection.

### Syntax

```bash
# File path
jj diff file.txt

# glob pattern
jj diff 'glob:*.rs'

# cwd prefix
jj diff 'cwd:src/'

# root prefix
jj diff 'root:src/'

# Combination
jj diff 'src ~ glob:**/test*.rs'
jj diff 'glob:*.rs | glob:*.md'
```

### Use Cases

```bash
# Split only selected files
jj split 'glob:*.rs'

# View specific directory diff
jj diff 'root:src/'
```

## Configuration Examples

### User Configuration

```toml
[user]
name = "Your Name"
email = "your@email.com"

[ui]
color = "auto"
default-command = ["log", "--reversed"]

[diff]
color-words.max-inline-alternation = 3
```

### Auto-signing

```toml
[signing]
behavior = "inline"
```
