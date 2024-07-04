document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.getElementById("toggleAdBlocker");
  const adsBlockedElement = document.getElementById("adsBlocked");
  const trackersBlockedElement = document.getElementById("trackersBlocked");

  function updateCounters(blockedAds, blockedTrackers) {
    adsBlockedElement.textContent = blockedAds;
    trackersBlockedElement.textContent = blockedTrackers;
  }

  chrome.runtime.sendMessage({ action: "getStats" }, function (response) {
    updateCounters(response.blockedAds, response.blockedTrackers);
    toggleSwitch.checked = response.adBlockerEnabled;
  });

  toggleSwitch.addEventListener("change", function () {
    chrome.runtime.sendMessage(
      {
        action: "toggleAdBlocker",
        enabled: this.checked,
      },
      function (response) {
        if (response.success) {
          console.log("Ad blocker " + (this.checked ? "enabled" : "disabled"));
        }
      }
    );
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateCounters") {
      updateCounters(request.blockedAds, request.blockedTrackers);
    }
  });
});
