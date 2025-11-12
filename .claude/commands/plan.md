---
allowed-tools: Bash(mkdir:*), Bash(echo:*), Bash(cat:*), Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git push:*), Bash(gh:*), Bash(gh pr create:*), Bash(sleep:*)
description: Plan in Details a task from the DEV_PLAN.md file
argument-hint: [TaskIndex]|[TaskDescription]
---

## Context

- Read @DEV_PLAN.md file for the list of tasks
- Task index or task description: <task-index-or-task-description>$ARGUMENTS</task-index-or-task-description>
- TaskIndex is the number of the task in the @DEV_PLAN.md file
- TaskDescription is the description of the task to be planned

## If TaskIndex is provided

🔎 Find the task with the given index in the @DEV_PLAN.md file

## If TaskDescription is provided

📌 It is not guaranteed, but it is most likely to be a PR review comment the we are going to address

## Task

📋 Write a detailed task list that we can work through to implement the task found

Create a markdown checklist where each checkbox represents a task that we can implement and commit on its own. Think hard about the plan.

Arrange the tasks in the order we need to implement them, not in order of importance.

Example format:
- [ ] Add a test case for feature ABC.
   - It's ok for the test to be failing at this point.
- [ ] Implement feature ABC.
- [ ] Delete DEF
   - Replace usages of DEF with ABC.

### If TaskIndex is provided

- Run `mkdir .llm`
- Write the plan into `.llm/todo.md`

### If TaskDescription is provided

- Append the plan into `.llm/todo.md`