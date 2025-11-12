---
allowed-tools: Bash(claude:*), Bash(git add:*), Bash(git commit:*), Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git push:*), Bash(gh:*), Bash(gh pr create:*), Bash(sleep:*)
description: Create a PR with the current changes
argument-hint: [TaskID] [Context]
---

## Context

- Current git status: <git_status>!`git status`</git_status>
- Current git diff (staged and unstaged changes): <git_diff>!`git diff HEAD`</git_diff>
- Current branch: <git_branch>!`git branch --show-current`</git_branch>

## Your task

Based on the above context do:
1. If there are uncommitted changes do: `claude -p "/commit Push:true $ARGUMENTS"`
2. Create a PR with the current changes
3. `sleep 10m`
4. `claude -p "/check-pr"`
