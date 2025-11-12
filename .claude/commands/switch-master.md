---
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git pull:*), Bash(git switch:*), Bash(git branch -D:*), Bash(git stash push:*)
description: Switch to master branch
argument-hint: [DoPush] [TaskID] [Context]
---

## Context

- Current branch: !`git branch --show-current`
- Current git status: !`git status`

## Your Task

### If the current branch is not master
1. If there are uncommitted changes, `git stash push -m "Stashed changes before switching to master"`
2. `git switch master`
3. `git branch -D <current-branch>`
4. `git pull origin master`

### If the current branch is master
1. `git pull origin master`
