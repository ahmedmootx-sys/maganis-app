# Rollback procedure

## Principles

- Every release state is tagged: annotated tags v0.x.y on main.
- Shared history is never rewritten: rollback on main means git revert.
- git reset is allowed only for local commits that were never pushed.

## Standard flow

1. Identify the last good release: git tag --list, git describe --tags.
2. Revert the bad change (keep history):
   git revert --no-edit <bad-commit-sha>
   For a range:
   git revert --no-edit <oldest-bad>^..<newest-bad>
3. Verify: npm run gates must pass after the revert. Do not ship unverified.
4. Tag a patch release if this was a release rollback:
   git tag -a v0.1.1 -m "Rollback of <what>"
5. Push: git push && git push --tags

## Emergency: local-only bad commits

Only if the bad commits were never pushed and nobody else built on them:

    git reset --hard v0.1.0

Then re-apply the good work as new commits.

## Hotfix from a tag (rare)

    git checkout -b hotfix v0.1.0
    # fix, then npm run gates
    # commit, merge to main, tag a patch version

## Drill log

(evidence of executed rollback drills is appended below by verification runs)
