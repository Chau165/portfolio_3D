# Project Instructions — Token Efficient Engineering

Follow the global AGENTS.md first.

This file adds repository-specific working rules.

## Main Goal

Solve tasks with minimal context usage while preserving:
- correctness
- reasoning quality
- code quality
- maintainability
- verification quality

Do not trade correctness for token savings.

## Project Workflow

For every task:

1. Understand the user request.
2. Identify the smallest relevant area.
3. Inspect only necessary files.
4. Find the root cause.
5. Make the smallest safe change.
6. Verify with the narrowest command.
7. Report only useful information.

Avoid broad repository exploration.

## Investigation Rules

Start from:
- files mentioned by the user
- error messages
- stack traces
- changed files
- related routes/components/services
- project map, if available

Only expand search when the current evidence is insufficient.

Do not guess.

Do not inspect unrelated modules.

## Token Efficiency

Always use RTK for noisy commands:

```bash
rtk git status --short
rtk git diff --stat
rtk git diff -- path/to/file
rtk grep -R "keyword" src
rtk find src -name "*.ts"
rtk tree -L 2
rtk npm test
rtk pnpm test
rtk pytest
```

Avoid:

```bash
git diff
tree .
find .
grep -R "." .
cat large-file
```

If RTK is unavailable, manually limit output.

## File Inspection Rules

Do not read whole files unless small.

Prefer chunks:

```bash
sed -n '1,160p' path/to/file
sed -n '160,320p' path/to/file
```

PowerShell:

```powershell
Get-Content path/to/file -TotalCount 160
Get-Content path/to/file | Select-Object -Skip 160 -First 160
```

Do not inspect:
- dependency folders
- build output
- generated files
- cache folders
- logs
- virtual environments

Unless directly required.

## Code Change Rules

Preserve existing architecture.

Prefer:
- small patches
- local fixes
- existing utilities
- existing naming style
- existing patterns

Avoid:
- large rewrites
- new dependencies
- unnecessary abstractions
- unrelated formatting
- moving files without need
- changing public APIs without reason

Fix the root cause, not just the symptom.

## Debugging Rules

When debugging, capture only:

```text
Symptom:
Cause:
Relevant file:
Fix:
Verification:
```

Do not include full terminal logs.

When tests fail, extract only the useful failure details.

## Verification Rules

Run the smallest useful verification.

Examples:

```bash
rtk npm test path/to/test
rtk pnpm test path/to/test
rtk pytest tests/test_file.py
rtk python -m pytest tests/test_file.py
```

For frontend changes, prefer:
- specific component test
- typecheck
- lint for affected files
- targeted build only if needed

For backend changes, prefer:
- specific unit test
- specific API route test
- targeted script
- minimal reproduction command

Avoid full builds or full test suites unless necessary.

## Communication Rules

Keep final responses short and useful.

Use this format:

```text
Root Cause:
- ...

Changes:
- file: what changed

Verification:
- command: result

Risks:
- ...

Next Steps:
- optional
```

Do not include:
- full diffs
- full logs
- long theory
- repeated explanations
- unrelated suggestions

## Quality Rules

All new code must:
- be readable
- match existing style
- handle obvious edge cases
- avoid duplication
- avoid hidden side effects
- keep behavior stable outside the requested change

## Context Discipline

Do not reread files already inspected unless necessary.

Do not rerun the same command repeatedly.

Do not paste command output unless it changes the decision.

Summarize findings compactly and continue.

## Dependency Policy

Do not add packages unless:
- the task cannot be reasonably solved with existing code
- the benefit is clear
- the impact is explained

Prefer built-in or existing project dependencies.

## Final Rule

Use the least context necessary to produce a correct, verified, maintainable fix.