# AI Working Instructions

## Core Principles

- **Minimal impact**: Only change what the task requires. Do not touch unrelated files, functions, or logic.
- **No unsolicited refactoring**: Do not rename, reorganize, or clean up code unless explicitly asked.
- **Simple over clever**: The simplest solution that works is the right solution.
- **Root causes only**: Fix the actual problem, not symptoms. No workarounds or temporary patches.

## Before You Write Any Code

1. State what you plan to change and why
2. List every file you intend to modify
3. Wait for confirmation before proceeding

If the task is ambiguous, ask one clarifying question rather than making assumptions.

## While Working

- Change only the files and lines directly related to the task
- If you notice something unrelated that looks wrong, flag it as a comment — do not fix it
- Keep a running summary of every file modified and why

## Before You Call It Done

- Confirm the change does what was asked and nothing more
- Check that no unrelated behavior has changed
- Summarize what was changed, what was not changed, and why

## Task Management

1. Write a short plan before starting (`tasks/todo.md` if the repo has one)
2. Check in on the plan before writing code
3. Mark items complete as you go
4. Add a changes summary when done

## What Not To Do

- Do not refactor code that is not part of the task
- Do not add new dependencies without asking
- Do not create new files without prior approval
- Do not modify tests, configs, or CI files unless the task specifically requires it
- Do not assume that "fixing" adjacent issues is helpful — it introduces risk
