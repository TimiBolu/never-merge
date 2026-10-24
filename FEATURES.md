# Never Merge Features

Never Merge is a browser extension that helps prevent accidental merges on important GitHub repositories.

## Repository Protection

Never Merge can protect GitHub pull request pages by organization, user, or exact repository.

- Block an entire GitHub owner, such as `acme-corp`
- Block a specific repository, such as `acme-corp/payroll`
- Keep unprotected repositories working normally

## Merge Control Hiding

On protected pull request pages, Never Merge hides merge controls from the page layout.

It targets common GitHub merge actions, including:

- Merge pull request
- Squash and merge
- Rebase and merge
- Confirm merge actions

The merge controls are removed visually with a high-priority CSS rule, so the page naturally closes the empty space.

## Click Safety Net

Never Merge also intercepts merge-related clicks and submit events before GitHub receives them.

This adds a second defensive layer for cases where GitHub dynamically redraws controls or a merge button appears briefly during page updates.

## GitHub Soft Navigation Support

GitHub often changes pages without a full browser refresh. Never Merge watches for those dynamic page transitions and re-applies protection automatically.

This helps keep merge controls hidden when moving between pull requests, tabs, or GitHub-rendered page states.

## Temporary Snooze

When a merge is intentional, protection can be temporarily snoozed from the extension popup.

Snooze options are repo-scoped:

- 5 minutes
- 15 minutes
- 30 minutes

While snoozed, merge controls become visible only for the current repository. Protection resumes automatically when the timer expires.

## Resume Protection

The popup includes a Resume now action.

This immediately ends an active snooze and hides merge controls again for the current protected repository.

## Visual Status

The extension popup shows the current page state:

- Protected: merge controls are hidden
- Snoozed: merge controls are temporarily visible
- Open: the current repo is not protected
- Idle: the current page is not a GitHub pull request

## On-Page Notices

Never Merge shows lightweight notices on GitHub pull request pages:

- A protection notice when merge controls are hidden
- A snooze notice showing when temporary access expires

## Local Configuration

Configuration is managed from the extension options page.

Settings include:

- Protected GitHub organizations or users
- Protected repositories in `owner/repository` format

## Privacy

Never Merge does not use analytics, tracking, advertising, remote code, or external servers.

Protected repository settings are stored with browser extension storage. Temporary snooze timers are stored locally in the browser.

GitHub pull request pages are processed locally only so the extension can identify and hide merge controls.

## Browser Support

Never Merge has builds for:

- Chrome and Chromium-based browsers
- Firefox

The Chrome package is `never-merge.zip`.

The Firefox package is `never-merge-firefox.zip`.
