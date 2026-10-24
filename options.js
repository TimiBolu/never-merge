const DEFAULT_SETTINGS = {
  blockedOwners: [],
  blockedRepositories: [],
};

const form = document.getElementById('settings-form');
const ownersField = document.getElementById('blocked-owners');
const repositoriesField = document.getElementById('blocked-repositories');
const status = document.getElementById('status');

function parseLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);
}

function formatLines(values) {
  return Array.isArray(values) ? values.join('\n') : '';
}

function showStatus(message) {
  status.textContent = message;
  window.setTimeout(() => {
    status.textContent = '';
  }, 1800);
}

chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  ownersField.value = formatLines(settings.blockedOwners);
  repositoriesField.value = formatLines(settings.blockedRepositories);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  chrome.storage.sync.set(
    {
      blockedOwners: parseLines(ownersField.value),
      blockedRepositories: parseLines(repositoriesField.value),
    },
    () => showStatus('Saved')
  );
});
