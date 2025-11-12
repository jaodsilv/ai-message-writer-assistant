# 🌳 Create Git Worktree for Next Available Todo

You are to create $ARGUMENTS new git worktree(s) in peer directories for the first available todo items (not completed and not already in progress).

## Todo Status Icons:
- `[ ]` - Not started
- `[x]` - Completed
- `[>]` - In progress in a peer directory/worktree

## Steps to follow:

1. **Find the next available todo**:
- Spawn a sub-agent or sub-task to find the next task in the todo list.
  - Read the file `.llm/todo.md`. The file will only be valid in this directory. Don't look in other locations. Don't look in the home directory.
  - Look for the first todo that is marked with `[ ]` (not `[x]` or `[>]`)
  - This will be the todo to work on
- End the sub-agent or sub-task here and share back the entire task information verbatim.
  - If no available todos exist, inform the user that all todos are either completed or in progress

2. **Update the todo status**:
   - Spawn a sub-agent or sub-task to update the task to show that it's in progress
   - Change the selected todo from `[ ]` to `[>]` in the original todo list
   - Add a comment indicating which worktree it's being worked on in, e.g.:
     ```markdown
     - [>] Implement user authentication with JWT <!-- worktree: implement-user-auth-jwt -->
     ```

3. **Create the git worktree**:
   - In parallel with marking the task in progress, spawn a second sub-agent or sub-task to create the git worktree
   - Determine the current repository's root directory
   - Create a worktree name based on the todo item (use kebab-case)
   - Create the worktree in a peer directory: `git worktree add ../<worktree-name> -b <branch-name> ${UPSTREAM_REMOTE:-origin}/${UPSTREAM_BRANCH:-main}`
     - `<worktree-name>` and `<branch-name>` are placeholders for you to replace with names of your choice
     - `UPSTREAM_REMOTE` and `UPSTREAM_BRANCH` are real environment variables
   - The `<branch-name>` should be prefixed with `task/`
   - The `<worktree-name>` should start with the original repository's directory name
   - If there is a `.envrc` file in this directory, copy it into the new directory and run `direnv allow ../<worktree-name>`
   - Run `mise trust ../<worktree-name>`

- Set up the todo file in the new worktree:
   - Create the directory `.llm` if it doesn't exist
   - Create `.llm/todo.md` with ONLY this single todo item:

```markdown
# Todo

- [ ] [Single todo item text here]
  - [Other context that was under the original todo]

When this task is complete:
- Edit the original task list at `<this directory>/.llm/todo.md`, on line <line>
- Update the todo status from `[>]` to `[x]`
```

## Conclusion

Run a command to create a new terminal tab in tme newly created worktree, and run `claude --dangerously-skip-permissions /todo` in that tab.

If we are running in iTerm:

```console
osascript -e '
tell application "iTerm"
    tell current window
        create tab with default profile command "claude code --dangerously-skip-permissions /todo" working directory "../<worktree-name>"
    end tell
end tell
'
```

If we are running in xfce4-terminal:

```console
xfce4-terminal --tab --working-directory="../<worktree-name>" -x bash -c "claude code --dangerously-skip-permissions /todo; exec bash"
```

## Loop

Say how many worktrees you have created.

Repeat the instructions to create another worktree until you have created $ARGUMENTS worktrees.
