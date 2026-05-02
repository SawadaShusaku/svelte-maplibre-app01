---
title: "CodexとJujutsuを並列運用するなら、AGENTS.mdより先にgitを止めたほうがいい"
emoji: "🧰"
type: "tech"
topics: ["jj", "jujutsu", "codex", "ai", "git"]
published: false
---

## はじめに

最近、`jj workspace` を使って AI エージェントを並列で動かす運用を試していました。

やりたかったこと自体はシンプルです。

- 人間は元の workspace で作業する
- AI エージェントは sibling directory の別 workspace で作業する
- VCS は `git` ではなく `jj` を使う

ただ、実際に回してみると、思ったより簡単に運用が壊れました。

原因はだいたいこの 2 つです。

- `AGENTS.md` に「git を使わないでください」と書いても、他のエージェントやツールは普通に `git` を叩く
- `jj` と `git` を同じ working copy で混ぜると、「たまたま動く」ことはあっても、気づきにくいズレが積み上がる

この記事は、その対策として最終的に

- `jj workspace` の使い分けを整理し
- `git` コマンドを shim で全面ブロックし
- agent 用の起動 wrapper を用意した

という備忘録です。

:::message
結論を先に書くと、`AGENTS.md` は大事ですが、抑止力としては弱いです。  
「使うな」と書くより、「使えないようにする」ほうが効きます。
:::

## 何が起きたのか

最初は「このリポジトリでは `jj` を使う」とルールを書いていました。

ですが実際には、こんなことが起きました。

- `git` と `jj` を混在させた過去の操作が残っていた
- `main` が remote より古いように見える場面があった
- Cloudflare Workers 側で preview 的な deploy と production の切り替えが混ざって見えた
- AI エージェントが `git status` のような“ harmless に見えるコマンド”から入り、結果的に `git` ベースで状況把握してしまう

ここで効いていなかったのが `AGENTS.md` です。

`AGENTS.md` は「意図」を伝えるには良いのですが、次のような相手には弱いです。

- 別の AI エージェント
- IDE の自動 Git 連携
- 背後で動く補助ツール
- その repo を初見で触る人間

つまり、**ルールは共有できても、強制はできない**ということです。

## `jj workspace` 自体はとても良い

これは先に書いておきたいのですが、`jj workspace` 自体はかなり良かったです。

特に AI エージェントを並列で動かすとき、同じ workspace の中で `jj new` だけで分けるより、最初から別 directory に分けたほうが圧倒的に安全でした。

使い分けは今こんな感じにしています。

```bash
# パターンA: main から派生させる（一般的）
jj workspace add ../myproj.feature-a -r main
jj workspace add ../myproj.feature-b -r main

# パターンB: 現在の作業状態を引き継ぐ（-r を省略）
# 「今いじっている続きを別ワークスペースでエージェントに任せたい」時に使う
jj workspace add ../myproj.feature-a

# パターンC: 任意のリビジョンから派生
jj workspace add ../myproj.feature-a -r @-
jj workspace add ../myproj.feature-a -r abc123
jj workspace add ../myproj.feature-a -r my-branch
```

個人的には、次の理解に落ち着きました。

- パターンAは「きれいな新規作業」
- パターンBは「今の続きを切り出す」
- パターンCは「親を正確にコントロールしたい時」

## でも `jj workspace` だけでは事故は防げない

問題は、workspace を分けても `git` を叩けてしまうことでした。

たとえば、

- 人は `jj` で作業している
- 別のエージェントは `git status` から文脈を読もうとする
- IDE は裏で `git fetch` する

という状態だと、結局 repo 全体としては `git` と `jj` が混ざります。

Jujutsu の公式ドキュメントでも、colocated repository では `git` と `jj` を混在できる一方で、branch conflict や divergence の原因になりやすいことが明記されています。

https://docs.jj-vcs.dev/latest/git-compatibility/

また、`jj git colocation disable` を使うと、workspace 直下の `.git` を隠して、Git コマンドを直接使えない形にできます。

https://docs.jj-vcs.dev/latest/cli-reference/

この 2 つを読むと、方向性はかなりはっきりしていました。

- 理想は non-colocated に寄せる
- それがすぐ難しくても、少なくとも `git` は agent に使わせない

## なぜ `git status` すら許可しないのか

最初は少し迷いました。

「`git status` くらいなら read-only だし許可してもよいのでは？」とも思ったからです。

でも今回はやめました。

理由は単純で、`jj` で全部代替できるからです。

- `git status` → `jj st`
- `git log` → `jj log`
- `git diff` → `jj diff`
- `git fetch` → `jj git fetch`
- `git push` → `jj git push`

`git` の一部だけを許可すると、だいたい次のどちらかが起きます。

1. 人間が「このくらいならいいか」と思って境界が緩む
2. エージェントが「`git` はこの repo で使ってよい」と誤学習する

このどちらも避けたかったので、今回は **`git` を全面禁止** にしました。

:::message alert
「危ない `git` だけ禁止する」より、「`git` という入口そのものを閉じる」ほうが運用が安定しました。
:::

## 実際にやったこと

やったことは地味です。

### 1. `AGENTS.md` に方針を書く

まずは普通に方針を書きました。

- この repo では `jj` のみを使う
- `git` は read-only も含めて使わない
- `jj workspace` は sibling directory で作る

ただし、これだけでは不十分でした。

## 2. `git` を shim で潰す

次に、repo ローカルの shim を作りました。

```bash:.codex/shims/git
#!/usr/bin/env bash
set -euo pipefail

cat >&2 <<'EOF'
git is disabled in this repository. Use jj instead.

Common replacements:
  git status        -> jj st
  git log           -> jj log
  git diff          -> jj diff
  git fetch         -> jj git fetch
  git push          -> jj git push
  git branch        -> jj bookmark list
  git checkout      -> jj edit / jj new
  git stash         -> jj new @-
EOF

exit 1
```

ポイントは、「mutating な `git` だけを止める」のではなく、**`git` コマンド全体を止める**ことです。

この shim が先に見つかるように、`PATH` を前に差し込みます。

## 3. wrapper 経由で agent を起動する

shim だけ置いても、`PATH` に入っていなければ意味がありません。

そこで、小さな wrapper も追加しました。

```bash:.codex/with-agent-path.sh
#!/usr/bin/env bash
set -euo pipefail

script_dir="$(
  cd -- "$(dirname -- "$0")" && pwd
)"

export PATH="$script_dir/shims:$PATH"

if [ "$#" -eq 0 ]; then
  exec "${SHELL:-/bin/sh}"
fi

exec "$@"
```

これで agent は次のように起動できます。

```bash
.codex/with-agent-path.sh codex
```

あるいは、shim が有効な shell を開くならこうです。

```bash
.codex/with-agent-path.sh zsh
```

## 4. 可能なら non-colocated に寄せる

shim はかなり効きますが、根本対策としてはやはり non-colocated が強いです。

既存 repo なら次のコマンドです。

```bash
jj git colocation disable
```

新しく始めるなら、最初から `--no-colocate` を使うのがよさそうです。

```bash
jj git clone --no-colocate <url>
```

## やってみて分かったこと

今回の運用でいちばん大きかった学びは、**AI エージェント運用では「人間なら察する」は通用しない**ということでした。

人間相手なら、

- README を読むだろう
- `AGENTS.md` を読むだろう
- この repo は `jj` なんだな、と察するだろう

で、ある程度は回ります。

でも agent や自動化ツールは、使えるコマンドがあれば普通に使います。

なので、設計としては

- 意図を書く
- 使い方を説明する
- でも最後は物理的に止める

までやったほうが安定します。

## 今のおすすめ構成

今のところ、自分の中では次の順番がしっくりきています。

1. `jj workspace` で sibling directory を使う
2. `AGENTS.md` に `jj` 前提の運用を書く
3. `git` shim を入れる
4. wrapper 経由で agent を起動する
5. 可能なら `jj git colocation disable` で non-colocated に寄せる

これを一言でまとめると、

**「ルールを文章で書くだけではなく、ハーネスで強制する」**

という話でした。

## おわりに

`jj` 自体はとても気に入っています。  
特に `workspace` は、AI エージェントと人間が並列で動く時代にかなり相性がいいと感じました。

ただ、その周辺運用はまだ雑にするとすぐ崩れます。

もし同じように

- `jj` を使っている
- AI エージェントを複数走らせたい
- `git` との混線を避けたい

という状況なら、まずは `git` を止めるところから始めるのがおすすめです。

:::details 参考リンク
- Zenn の Markdown 記法一覧  
  https://zenn.dev/zenn/articles/markdown-guide
- Jujutsu Git compatibility  
  https://docs.jj-vcs.dev/latest/git-compatibility/
- Jujutsu CLI reference  
  https://docs.jj-vcs.dev/latest/cli-reference/
:::
