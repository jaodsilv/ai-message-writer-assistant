---
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git switch:*), Bash(gh:*), Bash(gh issue view:*)
description: Add a new task to the @DEV_PLAN.md file
argument-hint: <Optional TaskID or Github Issue Number: [TaskIndex]> <TaskDescription>
---

# Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Arguments: $ARGUMENTS

## Arguments

- Parse $ARGUMENTS to get TaskID or Github Issue Number or TaskDescription
- Task Description is required

# Your Task

## If TaskID is provided

- Try to find the task in @DEV_PLAN.md using the provided TaskID and memorize its description, TaskID and, if present, github issue number.

### Task not found

- If the task is not found:
  - create a new task in @DEV_PLAN.md following the instructions below.
  - You should place it at the position of the given index in the @DEV_PLAN.md file.
  - Describe it better than the given description.
  - Create a Github Issue for this task.

### Task found

- If the task is found,
- Check if the description in @DEV_PLAN.md contains the same description as the one in the github issue description and both are about the task described in the arguments.
- If there is a mismatch, stop the process and ask for clarification.
- If there is no mismatch, Conclude the task is already in the @DEV_PLAN.md file.
- If there is not github issue number, Create a Github Issue for this task.

## If Github Issue Number is provided

### Get the github issue description

- Fetch the github issue description using `gh issue view` and verify if it is about the task described in the arguments.
- if the github issue is closed, pause the process and ask for clarification.

### Find the task in @DEV_PLAN.md

- Try to find the task in @DEV_PLAN.md using the provided Github Issue Number and memorize its description and TaskID.
- If the task is found, check if the description in @DEV_PLAN.md contains the same description as the one in the github issue description and both are about the task described in the arguments.
- If there is a mismatch, stop the process and ask for clarification.
- If there is no mismatch, Conclude the task is already in the @DEV_PLAN.md file.
- If the task is not found and the github issue is not closed, you should add a new task to @DEV_PLAN.md file following the instruction below.

## If only TaskDescription is provided

- Add a new task to @DEV_PLAN.md file following the instruction below.

## Inserting a new task in @DEV_PLAN.md

- Analyze the task description.
- Think hard about the task description and detail it better than the given description.
- Create a Github Issue for this task (if not already given in the arguments).
- Based in the description think hard about a priority for this task and where it would fit better in the @DEV_PLAN.md file.
- Add the task to the @DEV_PLAN.md file at the position decided above.
