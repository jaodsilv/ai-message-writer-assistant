---
allowed-tools: Bash(claude:*), Bash(git push:*)
description: Create a git commit and push
argument-hint: <Optional: Context>
---

Commit changes with `claude -p "/commit $ARGUMENTS"` and push changes to the remote repository with `git push`