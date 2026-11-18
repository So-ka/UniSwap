# Contributing to UniSwap

## Branch workflow

`main` is the protected, deployable branch. All changes should go through a
short-lived branch and a pull request.

1. Pull the latest `main` before starting.
2. Create one branch for one concern:
   - `feature/<short-name>` for product work
   - `fix/<short-name>` for a defect
   - `docs/<short-name>` for documentation only
   - `chore/<short-name>` for tooling or maintenance
3. Use lower-case kebab-case, for example `feature/register-user`.
4. Commit small, coherent changes with imperative messages.
5. Push the branch and open a pull request. Include what changed, how it was
   tested, and screenshots for visible UI work.
6. The pull request must pass CI and receive at least one teammate approval.
7. Resolve review conversations, squash merge, and delete the branch.

Do not commit `.env` files, passwords, session secrets, local databases,
generated build output, or dependencies.

## Definition of done for Sprint 1

- The change stays within the agreed Sprint 1 scope.
- `npm run check` passes locally.
- New behavior has an automated test where practical.
- API errors are clear without exposing sensitive data.
- The UI remains usable at narrow mobile widths.
- Relevant documentation is updated.
