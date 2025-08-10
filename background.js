// init defaults and apply ruleset state
async function init() {
  const st = await chrome.storage.local.get({
    adblockEnabled: true,
    devMode: false,
    adsBlocked: 0,
    logs: []
  });
  await setRulesetEnabled(st.adblockEnabled);
  console.log("[AdBlock] Ready. Enabled =", st.adblockEnabled);
}

chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

// enable/disable the static ruleset from rules.json
function setRulesetEnabled(enable) {
  return chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: enable ? ["block_ads"] : [],
    disableRulesetIds: enable ? [] : ["block_ads"]
  });
}

// increment counter when a rule matches (needs declarativeNetRequestFeedback)
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(async () => {
  const { adsBlocked = 0 } = await chrome.storage.local.get("adsBlocked");
  chrome.storage.local.set({ adsBlocked: adsBlocked + 1 });
});

// react to popup toggles
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.adblockEnabled) {
    await setRulesetEnabled(changes.adblockEnabled.newValue);
  }
});

// Dev Mode request logging (kept super simple)
chrome.webRequest.onCompleted.addListener(
  async (details) => {
    const { devMode, logs = [] } = await chrome.storage.local.get(["devMode", "logs"]);
    if (!devMode) return;

    logs.unshift({
      url: details.url,
      type: details.type,
      time: new Date().toLocaleTimeString()
    });
    chrome.storage.local.set({ logs: logs.slice(0, 80) }); // keep last 80
  },
  { urls: ["<all_urls>"] }
);