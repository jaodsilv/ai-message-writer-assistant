---
allowed-tools: Bash(claude:*), Bash(git add:*), Bash(git commit:*), Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git push:*), Bash(gh:*), Bash(gh pr create:*), Bash(sleep:*)
description: Update a PR with the current changes
argument-hint: [TaskID] [Context]
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Arguments: $ARGUMENTS

## Your Task

### 1. Parse Arguments using tags and address the PR comment
* Set $TYPE to the type of the comment that is being addressed. This should be the part between `<type>` and `</type>` tags.
* Set $COMMENT to the comment that is being addressed. This should be the part between `<comment>` and `</comment>` tags.

### 2. Address the PR comment

Address the PR comment properly following the rules below:

1. Think deeply in a Plan to address the comment