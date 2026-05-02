# Revset Query Syntax

> Based on official docs: https://www.jj-vcs.dev/latest/revsets/

Revsets are jj's powerful query syntax for precisely locating commits.

## Basic Syntax

```bash
jj log -r <revset>
```

## Common Symbols

| Symbol | Meaning |
|--------|---------|
| `@` | Current working-copy commit |
| `@-` | Parent of current commit |
| `@--` | Grandparent commit |
| `main` | Commit pointed to by bookmark `main` |
| `HEAD` | Commit pointed to by HEAD |
| `root()` | Repository root commit (virtual commit, all-zero hash) |

## Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `::` | Ancestor range (inclusive) | `main::` = all descendants of main |
| `..` | Excluding ancestors | `main..main~5` |
| `\|` | Union | `main \| feature` |
| `&` | Intersection | `main & @` |
| `~` | Difference | `@ ~ main` |
| `-` | Parent (singular) | `@-` = parent commit |
| `+` | Child (singular) | |

## Range Operators

| Operator | Meaning |
|----------|---------|
| `x::y` | Descendants between x and y (inclusive) |
| `x..y` | Ancestors between x and y (excluding x's ancestors) |
| `::x` | All ancestors of x |
| `x::` | All descendants of x |

**Note**: `..` on the left side does not distribute like `|`:
- `(A | B)..` = `A.. & B..` (intersection)
- `A.. | B..` = union

## Functions

| Function | Usage | Description |
|----------|-------|-------------|
| `all()` | `all()` | All visible commits |
| `none()` | `none()` | Empty set |
| `bookmarks()` | `bookmarks()` | All local bookmarks |
| `bookmarks(pattern)` | `bookmarks("main")` | Bookmarks matching pattern |
| `remote_bookmarks()` | `remote_bookmarks()` | All remote bookmarks |
| `visible_heads()` | `visible_heads()` | All visible heads |
| `parents(x)` | `parents(@)` | Parents of x |
| `children(x)` | `children(@)` | Children of x |
| `ancestors(x)` | `ancestors(@)` | Ancestors of x |
| `descendants(x)` | `descendants(@)` | Descendants of x |
| `first_parent(x)` | `first_parent(@)` | First parent only |
| `latest(x, n)` | `latest(@, 5)` | Most recent N commits |
| `merges()` | `merges()` | Merge commits |
| `file(path)` | `file("src/main.rs")` | Commits touching a file |
| `author(name)` | `author("yelo")` | Commits by author |
| `description(text)` | `description("feat")` | Commits with matching description |
| `date(expr)` | `date(2024-01-01)` | Commits on date |
| `empty()` | `empty()` | Commits with no file changes |
| `mutable()` | `mutable()` | Locally mutable commits |

## Common Usage

```bash
# History of current branch
jj log -r ::@

# All unpushed commits
jj log -r '@..@|bookmarks(@)..'

# History of a bookmark
jj log -r main::main

# Most recent 5 commits
jj log -r latest(@, 5)

# Commits touching a file
jj log -r 'file(path/to/file)'

# Commits after a date
jj log -r 'date(2024-01-01)..'

# Commits by author
jj log -r 'author(yelo)'

# Merge commits
jj log -r 'merges()'

# Empty commits (no file changes)
jj log -r 'empty()'

# Mutable commits (locally modified)
jj log -r 'mutable()'
```

## Shortcuts

| Shorthand | Expands to |
|-----------|-----------|
| `@~n` | nth ancestor of @ |
| `@^` | `@-`, parent commit |
| `main~3` | 3rd ancestor of main |

## Examples

```bash
# View ancestor chain of current commit
jj log -r ::@

# View commits unique to feature branch
jj log -r 'feature - main'

# View commits from the last week
jj log -r 'date(-7d)..'

# View diff between two bookmarks
jj diff -r main..feature

# View all commits by a specific author
jj log -r 'author(yelo)'

# View latest position of all bookmarks
jj log -r 'bookmarks()'
```
