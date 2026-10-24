# Never Merge

Never Merge is a browser extension that hides GitHub merge controls on protected repositories or organizations.

## Install locally in Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select this project folder.

## Install temporarily in Firefox

1. Run `scripts/build-firefox.sh`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Choose Load Temporary Add-on.
4. Select `dist/firefox/manifest.json`.

## Firefox package

The Firefox upload package is written next to the project as `never-merge-firefox.zip`.

The Firefox zip is packaged with `manifest.json` at the archive root, as required by AMO.

## Configure

Open the extension options page and add either:

- GitHub owners, such as `acme-corp`
- Specific repositories, such as `acme-corp/payroll`

On matching pull request pages, Never Merge removes merge buttons from layout with:

```js
button.style.setProperty('display', 'none', 'important');
```

It also captures click and submit events before GitHub receives them, so a temporarily visible merge control is still blocked.

## Snooze protection

Click the Never Merge toolbar icon while viewing a GitHub pull request to temporarily snooze protection for the current repository.

Snooze options are repo-scoped:

- 5 minutes
- 15 minutes
- 30 minutes

While snoozed, merge controls are visible and the PR page shows a warning banner with the snooze expiry time. Use Resume now in the popup to re-enable protection immediately.
