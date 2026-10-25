# Never Merge

Hide GitHub merge buttons on the repositories you do not want to merge by accident.

[![How to make use of Never Merge](https://img.youtube.com/vi/wUdnPQW40Tg/maxresdefault.jpg)](https://www.youtube.com/watch?v=wUdnPQW40Tg)

**[Add Never Merge to Chrome](https://chromewebstore.google.com/detail/never-merge/lepmgimlhicmfkjjegdbkhfbafoklnel)**

Never Merge is a browser extension for pull requests on production, corporate, or other high-risk repositories. You choose the GitHub organizations, users, or exact repositories to protect. On those pull request pages it hides **Merge pull request**, **Squash and merge**, and **Rebase and merge**, including the confirm step. If GitHub redraws a merge control during a page update, the click is still blocked.

It is a guardrail in your own browser. It does not change branch protection, repository settings, or anyone else's account, and it does not stop a merge made from the command line or the API.

## Install

Chrome and other Chromium browsers: [Never Merge on the Chrome Web Store](https://chromewebstore.google.com/detail/never-merge/lepmgimlhicmfkjjegdbkhfbafoklnel). The published version is 1.0.0.

Firefox can be loaded from this repository. See [Develop locally](#develop-locally).

## Protect a repository

Open the extension options and save either of these, one entry per line:

- A GitHub owner, such as `acme-corp`
- A repository, such as `acme-corp/payroll`

An owner entry covers every repository under that account or organization. Everything you do not list keeps its normal merge buttons.

## Merge on purpose

On a protected pull request, open the Never Merge toolbar icon and snooze that repository for 5, 15, or 30 minutes. Merge controls come back only there, and the page shows when protection returns. **Resume now** ends the snooze immediately. When the timer runs out, the buttons disappear again.

The popup reports the current page as:

- **Protected.** Merge controls are hidden.
- **Snoozed.** They are visible until the timer ends.
- **Open.** This repository is not on your list.
- **Idle.** This tab is not a GitHub pull request.

## Privacy

Never Merge does not use analytics, tracking, advertising, remote code, or an external server. Your list and snooze timers stay in the browser. Pull request pages are read locally so the extension can find merge controls.

## Develop locally

Chrome:

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Choose **Load unpacked** and select this folder.

Firefox:

1. Run `scripts/build-firefox.sh`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Choose **Load Temporary Add-on** and select `dist/firefox/manifest.json`.

The script writes `never-merge-firefox.zip` next to this folder, with `manifest.json` at the archive root for AMO. `dist/` is generated and is not committed.
