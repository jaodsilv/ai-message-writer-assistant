---
allowed-tools: Bash(claude:*), Bash(git add:*), Bash(git commit:*), Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git push:*)
description: Check PR comments for required and/or optional suggested changes or if the claude-review failed.
---

## Context

- Current PR comments: <pr_comments>!`claude -p "/pr-comments"`</pr_comments>
- Current git status: <git_status>!`git status`</git_status>
- Current git diff (staged and unstaged changes): <git_diff>!`git diff HEAD`</git_diff>
- Current branch: <git_branch>!`git branch --show-current`</git_branch>

## Your task

Based on the above context, check if there are required and/or optional changes or if the claude-review failed. and only the LAST comment current from PR comments

### From the above context, check if
1. There are required changes
2. There are optional changes
3. claude-review failed

#### IF Claude Review Failed
1. Let me know it failed
2. Exit the command, i.e., ignore everything below here

#### If there are Optional  changes
For each optional change do:
1. Evaluate if it is easy AND small to perform
2. Print two lists: required and optional

#### If there are Required changes
Print the list of required changes
