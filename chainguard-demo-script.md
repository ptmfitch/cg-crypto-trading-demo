# TradeSim × Chainguard demo: run sheet

Repo: [ptmfitch/cg-crypto-trading-demo](https://github.com/ptmfitch/cg-crypto-trading-demo). Peter drives Cursor. Kalle covers Chainguard.

Use a new chat for each numbered step unless it says "same chat". Prompts are in code blocks so they can be pasted.

## Before going live (Peter, within an hour of start)

1. Uninstall the Chainguard plugin in Cursor's plugin settings.
2. In a new chat:

   ```
   /reset-tradesim-demo
   ```

   Expected result: `main` is at the baseline and pushed. npm uses the public registry. `next-intl`, the hook, and the sandbox policy are gone, and verify-tradesim is unhardened. `chainctl` is logged in and the app is running on http://localhost:3000.
3. Reload the window. Confirm the Chainguard skills are no longer listed.
4. Open http://localhost:3000 in Cursor's browser and log in as the demo user.
5. Open these tabs: [PR #4](https://github.com/ptmfitch/cg-crypto-trading-demo/pull/4) (foundation), [#6](https://github.com/ptmfitch/cg-crypto-trading-demo/pull/6) (Swedish), [#5](https://github.com/ptmfitch/cg-crypto-trading-demo/pull/5) (Danish), [#3](https://github.com/ptmfitch/cg-crypto-trading-demo/pull/3) (Norwegian), and [cursor.com/agents](https://cursor.com/agents).

Between rehearsals, run steps 1–3 again. `/reset-tradesim-demo` undoes every repo change below, including anything that was pushed.

## Part 1: from running app to Chainguard Libraries (local agent)

### 1. Show the app (no prompt)

In Cursor's browser, show the dashboard and the live BTC price. Buy 0.1 BTC, then show the wallet balance and the trade history.

### 2. Install the Chainguard plugin (manual), then authenticate

Install Chainguard from the Cursor marketplace. Talk track: the plugin adds 9 skills, 5 rules (including `chainguard-policy` and `chainguard-libraries-javascript`), and 4 MCP servers.

```
/chainguard-setup-auth
```

Expected result: already logged in (the reset logged in beforehand), and the org is listed.

### 3. Point npm at Chainguard Libraries

```
/chainguard-libraries-javascript set this project up to install npm packages from Chainguard Libraries. Keep the token out of git.
```

Expected result: `.npmrc` points at `libraries.cgr.dev` with a token, and `.npmrc` stays gitignored.

### 4. Add the latest next-intl, first attempt

```
Add the latest version of next-intl to the project.
```

Expected result, which is the wrong outcome we want to show: the latest public release (4.14.9 in rehearsal) is not on Chainguard, so the agent works around it, for example with `npm install next-intl@4.14.9 --registry https://registry.npmjs.org`. The install "succeeds".

Talk track: the agent succeeded for the wrong reasons. The Chainguard skill says to configure a fallback when a package is missing, and `registry.npmjs.org` is on Cursor's default sandbox allowlist, so it ran without asking. A rule guides the agent but does not enforce anything.

### 5. Kalle: check where the packages came from (same chat)

```
/<KALLE-PROVENANCE-SKILL>
```

Expected result: `next-intl` and its new dependencies are flagged as coming from the public npm registry.

### 6. Lock it down with a hook and a network policy (same chat)

```
Make sure agents in this repo can only install npm packages from Chainguard Libraries. Add a project hook that blocks any shell command pointing npm, yarn, pnpm, or bun at a public registry, and a project sandbox network policy that allows libraries.cgr.dev and denies the public npm and yarn registries. When the hook blocks an install, tell the agent to install the newest version Chainguard has instead.
```

Expected result: `.cursor/hooks.json`, `.cursor/hooks/deny-public-npm.sh`, and `.cursor/sandbox.json`.

Talk track: a rule is guidance, a hook is a deterministic check on every shell command, and the sandbox blocks the network. All three are committed to the repo, so cloud agents get them too.

### 7. Undo the bad install (same chat)

```
Undo adding next-intl.
```

### 8. Add the latest next-intl, second attempt

The prompt is the same as step 4, so the audience sees that only the guardrails changed.

```
Add the latest version of next-intl to the project.
```

Expected result: the hook blocks the public registry, and the agent installs the newest Chainguard version (4.14.4 in rehearsal). The lockfile resolves from `libraries.cgr.dev`.

### 9. Kalle: check provenance again (same chat)

```
/<KALLE-PROVENANCE-SKILL>
```

Expected result: every package came from Chainguard or was built from source by Chainguard. Nothing came from a public registry.

### 10. Verify the app still works

```
/verify-tradesim verify registration, login, a BTC buy, and the profile report.
```

Expected result: screenshots and accessibility snapshots under `.cursor/skills/verify-tradesim/artifacts/`. This takes a few minutes.

### 11. Push so the cloud agent starts from here (same chat)

```
Commit these changes and push to main.
```

That is the end of part 1. The app now has `next-intl`, and the repo installs packages only from Chainguard.

## Part 2: from idea to PR (cloud agent)

### 12. Hand the Nordic languages to a cloud agent

In the agent picker, choose Cloud, then send:

```
Add Swedish, Danish, and Norwegian Bokmål to TradeSim with next-intl. English stays the default and the existing URLs stay the same.

Add a language picker to the user's profile page. Save the chosen language on the user so it persists across sessions and browsers.

Use subagents in parallel and open a separate PR for each piece:
1. next-intl plumbing, the English message catalog, the saved language on the user, and the profile language picker
2. Swedish translations
3. Danish translations
4. Norwegian Bokmål translations

Test the app with the verify-tradesim skill. Record a video of switching languages on the profile page and attach it to the first PR.
```

Expected result: about 25–30 minutes, and four PRs shaped like #3–#6. Do not wait for it.

### 13. Kalle: verification and skill hardening (while the cloud agent runs)

```
<KALLE-HARDENING-PROMPT>
```

Expected result: a hardened verify-tradesim skill, like [PR #1](https://github.com/ptmfitch/cg-crypto-trading-demo/pull/1). The reset restores the unhardened version, so this step has something to change every run.

### 14. "Here's one I made earlier"

Switch to the prepared PRs:

- [#4 foundation](https://github.com/ptmfitch/cg-crypto-trading-demo/pull/4): the summary, the video, and the Bugbot and security reviewer results
- [#6](https://github.com/ptmfitch/cg-crypto-trading-demo/pull/6), [#5](https://github.com/ptmfitch/cg-crypto-trading-demo/pull/5), [#3](https://github.com/ptmfitch/cg-crypto-trading-demo/pull/3): one PR per language

Talk track: how the security reviewer was built, and why. That ends the live demo: idea to PR, using both a synchronous and an asynchronous agent.

## Fixes needed before tomorrow

- PRs #3–#6 are drafts and have no Bugbot or security reviewer comments yet. Mark #4 ready for review, or trigger both reviewers, and check that the results are there.
- The cloud agent needs Chainguard credentials. After step 11, the lockfile resolves from `libraries.cgr.dev` and `.npmrc` is not in git. Confirm the cloud agent's secrets give it a token, or it cannot run `npm ci`.
- Kalle's open PRs [#2](https://github.com/ptmfitch/cg-crypto-trading-demo/pull/2) (next 15.5.25) and [#7](https://github.com/ptmfitch/cg-crypto-trading-demo/pull/7) (chart types): merge them before the first reset, or the reset will revert them. If they land later, move the `demo-baseline` tag.
- Kalle needs to fill in the two placeholders: the provenance skill name and the hardening prompt.
- Step 4 can go the "right" way by accident if the agent reads the Chainguard rule and picks 4.14.4 first time. If that happens, tell the story from rehearsal and skip to step 6.
- The Chainguard libraries token expired during rehearsal. Run the reset within an hour of going live.
