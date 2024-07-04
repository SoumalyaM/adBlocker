let isEnabled = true;

chrome.storage.local.get("adBlockerEnabled", (result) => {
  isEnabled = result.adBlockerEnabled !== false;
  if (isEnabled) {
    init();
  }
});

function removeAds() {
  if (!isEnabled) return;

  const adSelectors = [
    ".ad",
    ".ads",
    ".adsbygoogle",
    ".advertisement",
    ".advertising",
    ".banner",
    ".banner-ads",
    'iframe[src*="ads"]',
    'iframe[id*="ads"]',
    'div[id*="google_ads"]',
    'div[class*="google_ads"]',
    "ins.adsbygoogle",
    '[class*="sponsored"]',
    '[id*="sponsored"]',
    '[class*="promoted"]',
    '[id*="promoted"]',
    'a[href*="/ads/"]',
    'a[href*="doubleclick"]',
    'img[src*="ads"]',
    'img[src*="doubleclick"]',
    ".commercial",
    ".commercials",
    ".dfp-ad",
    ".dfp_ad",
    ".display-ad",
    ".displayAd",
    ".pub_300x250",
    ".pub_300x250m",
    ".pub_728x90",
    ".text-ad",
    ".textAd",
    ".trc_rbox_div",
    ".trc_related_container",
    '[id^="div-gpt-ad"]',
    '[id^="google_ads_iframe"]',
    '[id^="ad_slider"]',
    "[data-ad-slot]",
    "[data-native_ad]",
    '[id^="taboola-"]',
    '[id^="outbrain_widget_"]',
    ".gpt-ad",
    ".gpt_ad",
    ".pane-dfp",
    ".pane-openx",
  ];

  let removedAds = 0;

  adSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.remove();
      removedAds++;
    });
  });

  if (removedAds > 0) {
    chrome.runtime.sendMessage({
      action: "updateStats",
      type: "ads",
      count: removedAds,
    });
  }
}

function blockPopups() {
  if (!isEnabled) return;

  window.open = function () {};
  Object.defineProperty(window, "open", {
    configurable: false,
    writable: false,
  });
}

function removeTrackingPixels() {
  if (!isEnabled) return;

  const trackingPixelSelectors = [
    'img[width="1"][height="1"]',
    'img[width="0"][height="0"]',
    'img[src*="pixel"]',
    'img[src*="tracking"]',
    'img[src*="beacon"]',
    'img[src*="analytics"]',
    'img[src*="telemetry"]',
  ];

  let removedPixels = 0;

  trackingPixelSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.remove();
      removedPixels++;
    });
  });

  if (removedPixels > 0) {
    chrome.runtime.sendMessage({
      action: "updateStats",
      type: "trackers",
      count: removedPixels,
    });
  }
}

function init() {
  blockPopups();
  removeAds();
  removeTrackingPixels();

  const observer = new MutationObserver((mutations) => {
    removeAds();
    removeTrackingPixels();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.adBlockerEnabled) {
    isEnabled = changes.adBlockerEnabled.newValue;
    if (isEnabled) {
      init();
    }
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
