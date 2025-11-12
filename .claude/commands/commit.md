
---
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git switch:*), Bash(just precommit:*)
description: Create a git commit
argument-hint: <Optional: Context>
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Read @DEV_PLAN.md file for the list of tasks
- Arguments: $ARGUMENTS
- Use arguments, if provided, as an extra context to the commit message.

### If Branch name follows the current convention and contains a TaskID

- Extract TaskID from the branch name.
- Push the new branch to the remote repository with `git push -u origin`

### If Branch name does not follow the current convention and does not contain a TaskID

- Based on current changes, branch name, find among the tasks in @DEV_PLAN.md the task which best fits the branch name and changes done.
- If task is not found, pause the process and ask for clarification.
- Otherwise, Change the branch name to follow the current convention and contain the TaskID using `git branch -M`
- Push the new branch to the remote repository with `git push -u origin`

## Your task


📝 Commit the local changes to git.

- Based on the above changes and branch name, create a single git commit including only the files with changes related to the task
- Run `just precommit` (if a `justfile` exists and contains a `precommit` recipe)
- Stage individually using `git add <file1> <file2> ...`
  - Only stage changes that you remember editing yourself.
  - Avoid commands like `git add .` and `git add -A` and `git commit -am` which stage all changes
- Use single quotes around file names containing `$` characters
  - Example: `git add 'app/routes/_protected.foo.$bar.tsx'`
- If the user's prompt was a compiler or linter error, create a `fixup!` commit message.
- Otherwise:
- Commit messages should:
  - Start with a present-tense verb (Fix, Add, Implement, etc.)
  - Not include adjectives that sound like praise (comprehensive, best practices, essential)
  - Be concise (60-120 characters)
  - Be a single line
  - Sound like the title of the issue we resolved, and not include the implementation details we learned during implementation
  - End with a period.
  - Describe the intent of the original prompt
- Commit messages should not include a Claude attribution footer
  - Don't write: 🤖 Generated with [Claude Code](https://claude.ai/code)
  - Don't write: Co-Authored-By: Claude <noreply@anthropic.com>

Run git commit without confirming again with the user.

- If pre-commit hooks fail, then there are now local changes
  - `git add` those changes and try again
  - Never use `git commit --no-verify`