# Command Reference (with Explanations)

> Based on official docs: https://www.jj-vcs.dev/latest/git-command-table/

## Basic Operations

| Git | Jujutsu | Notes |
|-----|---------|-------|
| `git status` | `jj st` | View current state |
| `git diff` | `jj diff` | View uncommitted changes |
| `git diff HEAD` | `jj diff` | Same, jj compares to HEAD by default |
| `git diff <A>..<B>` | `jj diff -r A..B` | Compare two commits |
| `git add` | ❌ Not needed | jj auto-tracks all changes |
| `git commit` | `jj commit -m "msg"` | Commit all current changes |
| `git commit -a` | `jj commit` | Same, jj doesn't need -a |
| `git commit --amend` | `jj squash` | Squash changes into parent |
| `git restore <file>` | `jj restore <file>` | Discard file changes |
| `git checkout -- <file>` | `jj restore <file>` | Same |

## History Viewing

| Git | Jujutsu | Notes |
|-----|---------|-------|
| `git log` | `jj log` | View history |
| `git log --oneline` | `jj log -r ::@` | Compact format |
| `git log --graph` | `jj log --graph` | Graph view |
| `git log --all` | `jj log -r 'all()'` | View all |
| `git show <rev>` | `jj show <rev>` | View commit details |
| `git blame <file>` | `jj file annotate <file>` | File annotation |

## ⚠️ Branch Operations (Key Differences!)

| Git | Jujutsu | Notes |
|-----|---------|-------|
| `git checkout <commit>` | `jj edit <revision>` | **Switch to edit commit** |
| `git checkout -b <name>` | `jj new <base> -b <name>` | Create and set bookmark |
| `git switch <branch>` | `jj new <bookmark>` | Create new change |
| `git branch` | `jj bookmark list` | List |
| `git branch <name>` | `jj bookmark create <name>` | Create |
| `git branch -d <name>` | `jj bookmark delete <name>` | Delete |
| `git branch -f <name> <rev>` | `jj bookmark move <name> --to <rev>` | Move |

**Key Points**:
- jj has no `jj co` or `jj checkout` commands!
- Use `jj edit <revision>` to switch to a commit for editing
- Use `jj new` to create new changes (not switching!)

## Rebase and Merge

| Git | Jujutsu | Notes |
|-----|---------|-------|
| `git merge <A>` | `jj new @ A` | Merge (create new merge commit) |
| `git rebase A B` | `jj rebase -s A -o B` | A and descendants onto B |
| `git rebase --onto B A^ <branch>` | `jj rebase -s A -o B` | Same |

**Key Differences**:
- `-b` = Move entire branch (includes ancestors, excluding destination's ancestors)
- `-s` = Move specified commit and all descendants
- `-r` = Move only the specified commit (no descendants)

## Remote Operations

| Git | Jujutsu | Notes |
|-----|---------|-------|
| `git fetch` | `jj git fetch` | Fetch |
| `git pull` | `jj git fetch` (+ `jj new`) | |
| `git push` | `jj git push` | Push |
| `git push <remote> <branch>` | `jj git push --bookmark <name>` | |
| `git remote add` | `jj git remote add` | |
| `git branch -u <remote>/<branch>` | `jj bookmark track <name> --remote=<remote>` | Track remote |

## Stashing and Undo

| Git | Jujutsu | Notes |
|-----|---------|-------|
| `git stash` | `jj new @-` | Stash to sibling commit |
| `git stash pop` | `jj edit <commit>` | Restore |
| `git reset --hard` | `jj abandon` | Abandon current change |
| `git reset --soft HEAD~` | `jj squash --from @-` | Keep changes |
| `git cherry-pick <rev>` | `jj duplicate <rev> -o @` | Copy commit |

## Undo Operations

| Git | Jujutsu | Notes |
|-----|---------|-------|
| `git reflog` | `jj op log` | View operation log |
| `git reset --hard <ref>` | `jj undo` | Undo last operation |

**jj's `jj undo` is more powerful** — can undo almost any operation!

## File Operations

| Git | Jujutsu | Notes |
|-----|---------|-------|
| `git ls-files` | `jj file list` | List files |
| `git rm <file>` | `jj file delete <file>` | Delete |
| `git rm --cached <file>` | `jj file untrack <file>` | Untrack (must match ignore pattern) |
| `git rev-parse --show-toplevel` | `jj workspace root` | Repo root |

## Advanced Operations

| Git | Jujutsu | Notes |
|-----|---------|-------|
| `git add -p` | `jj split` | Interactive split |
| `git rebase -i` | `jj rebase -r` | Interactive rebase |
| | `jj absorb` | Auto-absorb changes into earlier commits |
| | `jj diffedit` | Interactive edit diff of a commit |
| | `jj describe` | Edit commit message |
| | `jj evolog` | View evolution history of a change |
