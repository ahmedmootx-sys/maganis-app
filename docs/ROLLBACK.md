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

---

## Android Native Sideload Rollback Protocol

> [!CAUTION]
> **Android OS Version Downgrade Restriction:**
> Android Package Manager strictly rejects installing an APK with a lower or equal `versionCode` (`INSTALL_FAILED_VERSION_DOWNGRADE`).
> Never ask a user to uninstall the app to install an older version — uninstallation irreversibly deletes the app's internal storage and all on-device database files!

### Safe Rollback Procedure for Android:

1. Revert the code change via `git revert`.
2. **Increment `versionCode`** in `android/app/build.gradle` (e.g. from `10001` to `10002`).
3. Bump patch version in `package.json` (e.g. `0.1.1`).
4. Update `CHANGELOG.md` with a clear explanation in Egyptian Arabic explaining the fix/rollback.
5. Push commit and tag `v0.1.1` to trigger the CI release pipeline.
6. The user installs the new APK update directly over the existing one without data loss.

---

## Hotfix from a tag (rare)

    git checkout -b hotfix v0.1.0
    # fix, then npm run gates
    # commit, merge to main, tag a patch version

## Drill log

(evidence of executed rollback drills is appended below by verification runs)
