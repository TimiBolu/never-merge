const DEFAULT_SETTINGS = {
  blockedOwners: [],
  blockedRepositories: [],
};

const DEFAULT_LOCAL_STATE = {
  snoozedRepositories: {},
};

const MERGE_BUTTON_PATTERNS = [
  /\bmerge pull request\b/i,
  /\bsquash and merge\b/i,
  /\brebase and merge\b/i,
  /\bconfirm merge\b/i,
  /\bconfirm squash and merge\b/i,
  /\bconfirm rebase and merge\b/i,
];

const NOTICE_ID = 'never-merge-notice';
const SNOOZE_NOTICE_ID = 'never-merge-snooze-notice';
const RECHECK_DELAYS_MS = [0, 50, 150, 400, 1000, 2000, 4000];

let settings = DEFAULT_SETTINGS;
let localState = DEFAULT_LOCAL_STATE;
let observer;
let enforceTimer;
let snoozeExpiryTimer;
let lastPathname = window.location.pathname;

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeList(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map(normalizeValue).filter(Boolean);
}

function parsePullRequestLocation() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length < 4 || parts[2] !== 'pull') {
    return null;
  }

  return {
    owner: normalizeValue(parts[0]),
    repository: normalizeValue(`${parts[0]}/${parts[1]}`),
  };
}

function shouldBlockCurrentPage() {
  const location = parsePullRequestLocation();
  if (!location) {
    return false;
  }

  return (
    settings.blockedOwners.includes(location.owner) ||
    settings.blockedRepositories.includes(location.repository)
  );
}

function getSnoozeUntil(repository) {
  return Number(localState.snoozedRepositories?.[repository] || 0);
}

function isCurrentPageSnoozed() {
  const location = parsePullRequestLocation();
  if (!location) {
    return false;
  }

  return getSnoozeUntil(location.repository) > Date.now();
}

function shouldProtectCurrentPage() {
  return shouldBlockCurrentPage() && !isCurrentPageSnoozed();
}

function formatSnoozeTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isMergeButton(element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const tagName = element.tagName.toLowerCase();
  if (tagName !== 'button' && tagName !== 'a') {
    return false;
  }

  const text = normalizeValue(element.textContent);
  const ariaLabel = normalizeValue(element.getAttribute('aria-label'));
  const title = normalizeValue(element.getAttribute('title'));
  const combined = `${text} ${ariaLabel} ${title}`;

  return MERGE_BUTTON_PATTERNS.some((pattern) => pattern.test(combined));
}

function getMergeButtons() {
  return Array.from(document.querySelectorAll('button, a')).filter(isMergeButton);
}

function stopMergeClick(event) {
  const button = event.target instanceof Element ? event.target.closest('button, a') : null;
  if (!isMergeButton(button)) {
    return;
  }

  if (!shouldProtectCurrentPage()) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
}

function applyVisualObliteration(button) {
  button.setAttribute('aria-disabled', 'true');
  button.setAttribute('data-never-merge-blocked', 'true');
  button.style.setProperty('display', 'none', 'important');
}

function renderNotice() {
  if (!shouldProtectCurrentPage()) {
    document.getElementById(NOTICE_ID)?.remove();
    return;
  }

  const mergeBox = document.querySelector('.merge-pr, .js-merge-pr');
  if (!mergeBox || document.getElementById(NOTICE_ID)) {
    return;
  }

  const notice = document.createElement('div');
  notice.id = NOTICE_ID;
  notice.className = 'flash flash-warn mb-3';
  notice.textContent = 'Never Merge is hiding merge controls for this protected repository.';
  mergeBox.prepend(notice);
}

function renderSnoozeNotice() {
  const location = parsePullRequestLocation();
  if (!location || !shouldBlockCurrentPage() || !isCurrentPageSnoozed()) {
    document.getElementById(SNOOZE_NOTICE_ID)?.remove();
    return;
  }

  const mergeBox = document.querySelector('.merge-pr, .js-merge-pr');
  if (!mergeBox) {
    return;
  }

  const snoozeUntil = getSnoozeUntil(location.repository);
  let notice = document.getElementById(SNOOZE_NOTICE_ID);
  if (!notice) {
    notice = document.createElement('div');
    notice.id = SNOOZE_NOTICE_ID;
    notice.className = 'flash flash-warn mb-3';
    mergeBox.prepend(notice);
  }

  notice.textContent = `Never Merge is snoozed for ${location.repository} until ${formatSnoozeTime(snoozeUntil)}.`;
}

function scheduleSnoozeExpiryCheck() {
  window.clearTimeout(snoozeExpiryTimer);

  const location = parsePullRequestLocation();
  if (!location) {
    return;
  }

  const snoozeUntil = getSnoozeUntil(location.repository);
  if (snoozeUntil <= Date.now()) {
    return;
  }

  snoozeExpiryTimer = window.setTimeout(() => {
    enforceNeverMerge();
  }, snoozeUntil - Date.now() + 100);
}

function clearBlockedControls() {
  document.querySelectorAll('[data-never-merge-blocked="true"]').forEach((button) => {
    button.removeAttribute('aria-disabled');
    button.removeAttribute('data-never-merge-blocked');
    button.style.removeProperty('display');
  });
  document.getElementById(NOTICE_ID)?.remove();
}

function enforceNeverMerge() {
  if (!shouldProtectCurrentPage()) {
    clearBlockedControls();
    renderSnoozeNotice();
    scheduleSnoozeExpiryCheck();
    return;
  }

  window.clearTimeout(snoozeExpiryTimer);
  document.getElementById(SNOOZE_NOTICE_ID)?.remove();
  getMergeButtons().forEach(applyVisualObliteration);
  renderNotice();
}

function scheduleEnforce(delay = 0) {
  window.clearTimeout(enforceTimer);
  enforceTimer = window.setTimeout(() => {
    window.requestAnimationFrame(enforceNeverMerge);
  }, delay);
}

function scheduleRechecks() {
  RECHECK_DELAYS_MS.forEach((delay) => {
    window.setTimeout(enforceNeverMerge, delay);
  });
}

function startObserver() {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver(() => scheduleEnforce());

  const observerRoot = document.documentElement || document.body;
  if (!observerRoot) {
    scheduleEnforce(50);
    return;
  }

  observer.observe(observerRoot, {
    attributes: true,
    attributeFilter: ['class', 'hidden', 'style', 'aria-disabled'],
    childList: true,
    subtree: true,
  });
}

function handlePossibleNavigation() {
  if (lastPathname !== window.location.pathname) {
    lastPathname = window.location.pathname;
    scheduleRechecks();
    return;
  }

  scheduleEnforce();
}

function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (storedSettings) => {
    chrome.storage.local.get(DEFAULT_LOCAL_STATE, (storedLocalState) => {
      settings = {
        blockedOwners: normalizeList(storedSettings.blockedOwners),
        blockedRepositories: normalizeList(storedSettings.blockedRepositories),
      };
      localState = {
        snoozedRepositories: storedLocalState.snoozedRepositories || {},
      };

      enforceNeverMerge();
      startObserver();
      scheduleRechecks();
    });
  });
}

document.addEventListener('click', stopMergeClick, true);
document.addEventListener('submit', stopMergeClick, true);
document.addEventListener('turbo:load', handlePossibleNavigation);
document.addEventListener('turbo:render', handlePossibleNavigation);
document.addEventListener('pjax:end', handlePossibleNavigation);
window.addEventListener('popstate', handlePossibleNavigation);
window.addEventListener('pageshow', scheduleRechecks);
window.addEventListener('focus', scheduleEnforce);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    scheduleRechecks();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    settings = {
      blockedOwners: normalizeList(changes.blockedOwners?.newValue || settings.blockedOwners),
      blockedRepositories: normalizeList(changes.blockedRepositories?.newValue || settings.blockedRepositories),
    };
  }

  if (areaName === 'local') {
    localState = {
      snoozedRepositories: changes.snoozedRepositories?.newValue || localState.snoozedRepositories,
    };
  }

  enforceNeverMerge();
});

loadSettings();
