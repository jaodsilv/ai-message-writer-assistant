📋 Find and implement the next incomplete item from the @.llm/todo.md file.

- Spawn a sub-agent or sub-task to find the next item in the @.llm/todo.md file.
  - In the sub-agent or sub-task:
  - Read the file @.llm/todo.md
  - Find the first line with an incomplete task, with `- [ ] <task>` (not `[x]` or `[>]`)
    - Keep in mind that the completed tasks might not be contiguous, since it's common to prepend new tasks at the top
  - End the sub-agent or sub-task here and share back the entire task information verbatim.

- Show the user the task we just found. Use the format:

```markdown
 The next incomplete task is:
 - [ ] Replace DEF with ABC.
```

- Think hard about a Plan to implement this item
- Execute this plan to implement this item
- Focus ONLY on planning and implementing this specific item
- Ignore all other items in the `.llm/todo.md` file or TODOs in the source code
- Work through the implementation methodically and completely, addressing all aspects of the task
- Run appropriate tests and validation to ensure the implementation works
- Consider corner cases and edge cases
- Consider performance and scalability
- Consider security and privacy
- Consider maintainability and readability

- ✅ After the implementation is complete and verified
  - Spawn a sub-agent or sub-task to mark the task as complete
  - Find the task we are working on in `.llm/todo.md` again
  - Mark the completed task as done by changing `- [ ]` to `- [x]`
  - End the sub-agent or sub-task here and confirm the task was marked complete.

- At the same time as we are marking the task complete, spawn a second sub-agent or sub-task in parallel to perform a git commit
  - In the sub-agent, run `claude -p "/commit-push"