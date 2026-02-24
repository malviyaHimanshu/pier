const SIDE_PANEL_PATH = "extension/sidepanel.html";

async function configureSidePanelForTab(tabId) {
  if (!chrome.sidePanel || typeof chrome.sidePanel.setOptions !== "function") {
    return;
  }

  await chrome.sidePanel.setOptions({
    tabId,
    path: SIDE_PANEL_PATH,
    enabled: true
  });
}

async function openSidePanelForSender(sender) {
  const tabId = sender?.tab?.id;
  if (!Number.isInteger(tabId)) {
    return;
  }

  if (!chrome.sidePanel || typeof chrome.sidePanel.open !== "function") {
    console.warn("[terminal.browser] chrome.sidePanel API is unavailable in this Chrome version.");
    return;
  }

  try {
    await configureSidePanelForTab(tabId);
    await chrome.sidePanel.open({ tabId });
  } catch (error) {
    console.warn(`[terminal.browser] failed to open side panel: ${error.message || error}`);
  }
}

async function initializePanelBehavior() {
  if (!chrome.sidePanel) {
    return;
  }

  try {
    if (typeof chrome.sidePanel.setPanelBehavior === "function") {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
  } catch (error) {
    console.warn(`[terminal.browser] failed to set side panel behavior: ${error.message || error}`);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  initializePanelBehavior();
});

chrome.runtime.onStartup?.addListener(() => {
  initializePanelBehavior();
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== "terminalBrowser:openSidePanel") {
    return false;
  }

  openSidePanelForSender(sender);
  return false;
});
