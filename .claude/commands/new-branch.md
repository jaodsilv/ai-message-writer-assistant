---
allowed-tools: Bash(claude:*), Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git push:*), Bash(gh:*), Bash(gh issue view:*), Bash(sleep:*), Bash(git add:*), Bash(git commit:*), Bash(git switch:*)
description: Create a new branch with a meaningful name
argument-hint: TaskID:[TaskIndex]|IssueNumber:[IssueNumber]|[TaskDescription]
---

# Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Arguments: $ARGUMENTS

# Your Task

## If there are changes in the current branch

Let me know and exit this command.

## If there are no changes in the current branch

### Parse Arguments and find the task

- Parse $ARGUMENTS to get TaskID or Github Issue Number or TaskDescription
- TaskID is the task index number on the @DEV_PLAN.md document.
- Github Issue Number is the number of the github issue.
- TaskDescription is the description of the task.
- Read @DEV_PLAN.md file for the list of tasks

#### If TaskID or Github Issue Number is provided

- Find the task in @DEV_PLAN.md using the provided TaskID or github Issue Number and memorize its description, TaskID and github issue number.
- If the task is not found, pause the process and ask for clarification.
- Fetch the github issue description using `gh issue view` and merge both descriptions from the DEV_PLAN.md and github issue. If there is a conflict or contradiction ask for clarifications before continuing. Memorize if there was a conflict or contradiction and its resolution.
- if the github issue is closed, pause the process and ask for clarification.

#### If TaskDescription is provided

1. Try to find the closest task in @DEV_PLAN.md using the provided TaskDescription and ask if it is the correct one

2. If it was found:
  - Memorize its description, TaskID and github issue number.
  - Fetch the github issue description using `gh issue view` and merge both descriptions from the DEV_PLAN.md and github issue. If there is a conflict or contradiction ask for clarifications before continuing. Memorize if there was a conflict or contradiction and its resolution.
  - if the github issue is closed, pause the process and ask for clarification.

3. If you receive a negative response or you found nothing close to the description, try to find the closest task among the github issues on github using `gh issue list` and ask if it is the correct one

4. If you receive another negative response or you found nothing close to the description, create a new github issue with the provided TaskDescription, add the task to the @DEV_PLAN.md file at the end of the ongoing sprint, TaskID and github issue number.

### Create a new branch

1. Analyze the task description and determine the appropriate conventional type from the CLAUDE.md file "Git Branch naming convention" section.

2. Create a new branch with `git switch -c` and use a meaningful name based on the Task Description and task type, follow the format `<type>/<task-id>-<meaningful-name>`.
3. If the @DEV_PLAN.md file was updated, commit the changes with `claude -p "/git-cp"`
4. Push the new branch to the remote repository

Remember: This project follows Conventional Commits specification. Do NOT add co-authors to the commit message.