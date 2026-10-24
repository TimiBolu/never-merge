const DEFAULT_SETTINGS = {
  blockedOwners: [],
  blockedRepositories: [],
};

const DEFAULT_LOCAL_STATE = {
  snoozedRepositories: {},
};

const repoText = document.getElementById('repo');
const statePill = document.getElementById('state-pill');
const message = document.getElementById('message');
const githubControls = document.getElementById('github-controls');
const emptyState = document.getElementById('empty-state');
const resumeButton = document.getElementById('resume');
const optionsButton = document.getElementById('options');
const snoozeButtons = Array.from(document.querySelectorAll('[data-snooze-minutes]'));

let currentRepository;
let settings = DEFAULT_SETTINGS;
let localState = DEFAULT_LOCAL_STATE;

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeList(values) {
  return Array.isArray(values) ? values.map(normalizeValue).filter(Boolean) : [];
}

function parseGitHubPullRequest(url) {
  const parsedUrl = new URL(url);
  if (parsedUrl.hostname !== 'github.com') {
    return null;
  }

  const parts = parsedUrl.pathname.split('/').filter(Boolean);
  if (parts.length < 4 || parts[2] !== 'pull') {
    return null;
  }

  return {
    owner: normalizeValue(parts[0]),
    repository: normalizeValue(`${parts[0]}/${parts[1]}`),
  };
}

function isProtected(location) {
  return (
    settings.blockedOwners.includes(location.owner) ||
    settings.blockedRepositories.includes(location.repository)
  );
}

function getSnoozeUntil(repository) {
  return Number(localState.snoozedRepositories?.[repository] || 0);
}

function formatSnoozeTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function render(location) {
  if (!location) {
    repoText.textContent = 'Not on a GitHub PR';
    statePill.textContent = 'Idle';
    statePill.className = '';
    githubControls.hidden = true;
    emptyState.hidden = false;
    return;
  }

  const protectedRepo = isProtected(location);
  const snoozeUntil = getSnoozeUntil(location.repository);
  const snoozed = snoozeUntil > Date.now();

  currentRepository = location.repository;
  repoText.textContent = location.repository;
  githubControls.hidden = false;
  emptyState.hidden = true;
  resumeButton.hidden = !snoozed;
  snoozeButtons.forEach((button) => {
    button.disabled = !protectedRepo;
  });

  if (!protectedRepo) {
    statePill.textContent = 'Open';
    statePill.className = 'open';
    message.textContent = 'This repo is not in your protected list.';
    return;
  }

  if (snoozed) {
    statePill.textContent = 'Snoozed';
    statePill.className = 'snoozed';
    message.textContent = `Merge controls are visible until ${formatSnoozeTime(snoozeUntil)}.`;
    return;
  }

  statePill.textContent = 'Protected';
  statePill.className = 'protected';
  message.textContent = 'Merge controls are hidden. Snooze this repo when you intentionally need to merge.';
}

function saveSnooze(minutes) {
  if (!currentRepository) {
    return;
  }

  const snoozedRepositories = {
    ...localState.snoozedRepositories,
    [currentRepository]: Date.now() + minutes * 60 * 1000,
  };

  chrome.storage.local.set({ snoozedRepositories }, () => {
    localState = { snoozedRepositories };
    render({ owner: currentRepository.split('/')[0], repository: currentRepository });
  });
}

function resumeProtection() {
  if (!currentRepository) {
    return;
  }

  const snoozedRepositories = { ...localState.snoozedRepositories };
  delete snoozedRepositories[currentRepository];

  chrome.storage.local.set({ snoozedRepositories }, () => {
    localState = { snoozedRepositories };
    render({ owner: currentRepository.split('/')[0], repository: currentRepository });
  });
}

snoozeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    saveSnooze(Number(button.dataset.snoozeMinutes));
  });
});

resumeButton.addEventListener('click', resumeProtection);

optionsButton.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const location = tab?.url ? parseGitHubPullRequest(tab.url) : null;

  chrome.storage.sync.get(DEFAULT_SETTINGS, (storedSettings) => {
    chrome.storage.local.get(DEFAULT_LOCAL_STATE, (storedLocalState) => {
      settings = {
        blockedOwners: normalizeList(storedSettings.blockedOwners),
        blockedRepositories: normalizeList(storedSettings.blockedRepositories),
      };
      localState = {
        snoozedRepositories: storedLocalState.snoozedRepositories || {},
      };

      render(location);
    });
  });
});
