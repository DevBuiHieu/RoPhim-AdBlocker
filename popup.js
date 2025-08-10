const toggleSwitch = document.getElementById('toggleSwitch');
const devModeSwitch = document.getElementById('devModeSwitch');
const statusText = document.getElementById('statusText');
const countEl = document.getElementById('count');
const logContainer = document.getElementById('logContainer');

chrome.storage.local.get(['adblockEnabled', 'adsBlocked', 'devMode', 'logs'], (result) => {
  const enabled = result.adblockEnabled !== false;
  toggleSwitch.checked = enabled;
  statusText.textContent = enabled ? 'Đang bật' : 'Đang tắt';
  statusText.style.color = enabled ? '#4caf50' : '#f44336';
  countEl.textContent = result.adsBlocked || 0;

  devModeSwitch.checked = !!result.devMode;
  renderLogs(result.logs || []);
});

toggleSwitch.addEventListener('change', () => {
  const enabled = toggleSwitch.checked;
  chrome.storage.local.set({ adblockEnabled: enabled });
  statusText.textContent = enabled ? 'Đang bật' : 'Đang tắt';
  statusText.style.color = enabled ? '#4caf50' : '#f44336';
});

devModeSwitch.addEventListener('change', () => {
  chrome.storage.local.set({ devMode: devModeSwitch.checked });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.adsBlocked) {
    countEl.textContent = changes.adsBlocked.newValue;
  }
  if (changes.logs) {
    renderLogs(changes.logs.newValue);
  }
});

function renderLogs(logs) {
  logContainer.innerHTML = logs.map(log => `[${log.time}] ${log.type} → ${log.url}`).join('<br>');
}