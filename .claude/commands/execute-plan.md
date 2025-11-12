---
allowed-tools: Bash(claude:*), Bash(git add:*), Bash(git commit:*), Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git push:*), Bash(gh:*), Bash(gh pr create:*), Bash(sleep:*)
description: Execute the next task in the DEV_PLAN.md file
argument-hint: [TaskIndex]
---

## Context

- Read @DEV_PLAN.md file for the list of tasks
- Read @.llm/todo.md file for the plan to be executed

## Task

- For each step of the plan described in the @.llm/todo.md file, run `claude -p "/execute-step"` sequentially
- If a pull request for this branch does not exist yet, create a pull request for the changes
