---
allowed-tools: Bash(claude:*), Bash(git add:*), Bash(git commit:*), Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git push:*), Bash(gh:*), Bash(gh pr create:*), Bash(sleep:*)
description: Execute the next task in the DEV_PLAN.md file
argument-hint: [TaskIndex]
---

## Context

- Read @DEV_PLAN.md file for the list of tasks
- TaskIndex: <task-index>$ARGUMENTS</task-index>
- TaskIndex is the number of the task in the DEV_PLAN.md file

## Your Task

1. `claude -p "/switch-master"`
2. Find the task using the provided TaskIndex and memorize its description and issue number
3. read github issue description using `gh issue view`
4. Think harder on a plan for what needs to be done
5. apply the plan
7. `claude -p "/git-cp
commit Push:true"`
8. `claude -p "/push"`
9. `claude -p "/create-pr $issue-number"`
11. `claude -p "/check-pr"`
12. Check on last comment if there are required and optional changes or if the claude-review failed.
13. if claude-review failed let me know and exit this command
14. While there are required OR optional changes:
14.1. For each optional change do:
14.1.1. evaluate if it is easy AND small to perform
14.1.2. if it is easy AND small do:
14.1.2.1. Plan change
14.1.2.2. Execute plan
14.1.2.3. Commit change
14.1.3. otherwise, i.e., if it is not easy or not small, do:
14.1.3.1. create a github issue for this. Attribute correct priority.
14.1.3.2. Update DEV_PLAN.md with the change. Evaluate where is best fit in the roadmap.
14.1.3.3. Memorize that this change should be ignored while this command is not finished.
14.1.3.4. commit change to DEV_PLAN.md
14.1.2. commit the changes
14.2. for each required change do:
14.2.1. create a plan for it
14.2.2. Execute plan
14.2.3. Commit change
14.3. If any commit was created do:
14.3.1. Push changes
14.3.2. Wait 10 minutes
14.3.3. /pr-comments
14.3.4. Check on last comment if there are required and optional changes or if the claude-review failed.
14.3.5. If there are no optional changes, commit changed files.
15. if there were commits, push and go to step 10. 