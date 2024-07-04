const adDomains = [
  "*://*.doubleclick.net/*",
  "*://*.googlesyndication.com/*",
  "*://*.googleadservices.com/*",
  "*://*.google-analytics.com/*",
  "*://*.adnxs.com/*",
  "*://*.advertising.com/*",
  "*://*.taboola.com/*",
  "*://*.outbrain.com/*",
  "*://*.clickbank.net/*",
  "*://*.scorecardresearch.com/*",
  "*://*.quantserve.com/*",
  "*://*.amazon-adsystem.com/*",
  "*://*.moatads.com/*",
  "*://*.facebook.com/tr/*",
  "*://*.youtube.com/api/stats/ads*",
  "*://*.youtube.com/pagead/*",
  "*://*.youtube.com/ptracking*",
  "*://*.adform.net/*",
  "*://*.pubmatic.com/*",
  "*://*.rubiconproject.com/*",
  "*://*.criteo.com/*",
  "*://*.casalemedia.com/*",
  "*://*.openx.net/*",
  "*://*.exponential.com/*",
  "*://*.adroll.com/*",
  "*://*.mathtag.com/*",
  "*://*.bidswitch.net/*",
  "*://*.adtech.de/*",
  "*://*.adsrvr.org/*",
  "*://*.adtago.s3.amazonaws.com/*",
  "*://*.analyticsengine.s3.amazonaws.com/*",
  "*://*.analytics.s3.amazonaws.com/*",
  "*://*.advice-ads.s3.amazonaws.com/*",
  "*://*.adservice.google.com/*",
  "*://*.ads30.adcolony.com/*",
  "*://*.adc3-launch.adcolony.com/*",
  "*://*.events3alt.adcolony.com/*",
  "*://*.wd.adcolony.com/*",
  "*://*.static.media.net/*",
  "*://*.media.net/*",
  "*://*.adservetx.media.net/*",
  "*://*.iot-eu-logser.realme.com/*",
  "*://*.iot-logser.realme.com/*",
  "*://*.bdapi-ads.realmemobile.com/*",
  "*://*.bdapi-in-ads.realmemobile.com/*",
  "*://*.api.ad.xiaomi.com/*",
  "*://*.data.mistat.xiaomi.com/*",
  "*://*.data.mistat.india.xiaomi.com/*",
  "*://*.data.mistat.rus.xiaomi.com/*",
  "*://*.sdkconfig.ad.xiaomi.com/*",
  "*://*.sdkconfig.ad.intl.xiaomi.com/*",
  "*://*.tracking.rus.miui.com/*",
  "*://*.adsfs.oppomobile.com/*",
  "*://*.adx.ads.oppomobile.com/*",
  "*://*.ck.ads.oppomobile.com/*",
  "*://*.data.ads.oppomobile.com/*",
  "*://*.logservice.hicloud.com/*",
  "*://*.logservice1.hicloud.com/*",
  "*://*.logbak.hicloud.com/*",
  "*://*.metrics.icloud.com/*",
  "*://*.books-analytics-events.apple.com/*",
  "*://*.weather-analytics-events.apple.com/*",
  "*://*.notes-analytics-events.apple.com/*",
  "*://*.metrics.mzstatic.com/*",
  "*://*.smetrics.samsung.com/*",
  "*://*.samsung-com.112.2o7.net/*",
  "*://*.analytics-api.samsunghealthcn.com/*",
];

const trackerDomains = [
  "*://*.click.googleanalytics.com/*",
  "*://*.analytics.google.com/*",
  "*://*.google-analytics.com/*",
  "*://*.hotjar.com/*",
  "*://*.mixpanel.com/*",
  "*://*.newrelic.com/*",
  "*://*.segment.io/*",
  "*://*.crazyegg.com/*",
  "*://*.kissmetrics.com/*",
  "*://*.heap.io/*",
  "*://*.mouseflow.com/*",
  "*://*.optimizely.com/*",
  "*://*.fullstory.com/*",
  "*://*.loggly.com/*",
  "*://*.statcounter.com/*",
  "*://*.clicktale.net/*",
  "*://*.inspectlet.com/*",
  "*://*.freshmarketer.com/*",
  "*://*.claritybt.freshmarketer.com/*",
  "*://*.fwtracks.freshmarketer.com/*",
  "*://*.luckyorange.com/*",
  "*://*.api.luckyorange.com/*",
  "*://*.realtime.luckyorange.com/*",
  "*://*.cdn.luckyorange.com/*",
  "*://*.w1.luckyorange.com/*",
  "*://*.upload.luckyorange.net/*",
  "*://*.cs.luckyorange.net/*",
  "*://*.settings.luckyorange.net/*",
  "*://*.stats.wp.com/*",
  "*://*.notify.bugsnag.com/*",
  "*://*.sessions.bugsnag.com/*",
  "*://*.api.bugsnag.com/*",
  "*://*.app.bugsnag.com/*",
  "*://*.browser.sentry-cdn.com/*",
  "*://*.app.getsentry.com/*",
  "*://*.pixel.facebook.com/*",
  "*://*.an.facebook.com/*",
  "*://*.static.ads-twitter.com/*",
  "*://*.ads-api.twitter.com/*",
  "*://*.ads.linkedin.com/*",
  "*://*.analytics.pointdrive.linkedin.com/*",
  "*://*.ads.pinterest.com/*",
  "*://*.log.pinterest.com/*",
  "*://*.analytics.pinterest.com/*",
  "*://*.trk.pinterest.com/*",
  "*://*.events.reddit.com/*",
  "*://*.events.redditmedia.com/*",
  "*://*.ads.youtube.com/*",
];

let isEnabled = true;
let blockedAds = 0;
let blockedTrackers = 0;

chrome.storage.local.get(
  ["adBlockerEnabled", "blockedAds", "blockedTrackers"],
  (result) => {
    isEnabled = result.adBlockerEnabled !== false;
    blockedAds = result.blockedAds || 0;
    blockedTrackers = result.blockedTrackers || 0;
  }
);

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (isEnabled) {
      if (
        adDomains.some((domain) =>
          details.url.includes(domain.replace("*://*.", "").replace("/*", ""))
        )
      ) {
        blockedAds++;
        updateCounters();
      } else if (
        trackerDomains.some((domain) =>
          details.url.includes(domain.replace("*://*.", "").replace("/*", ""))
        )
      ) {
        blockedTrackers++;
        updateCounters();
      }
    }
    return { cancel: isEnabled };
  },
  { urls: [...adDomains, ...trackerDomains] },
  ["blocking"]
);

function updateCounters() {
  chrome.storage.local.set({ blockedAds, blockedTrackers });
  chrome.runtime.sendMessage({
    action: "updateCounters",
    blockedAds,
    blockedTrackers,
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getStats") {
    sendResponse({
      blockedAds,
      blockedTrackers,
      adBlockerEnabled: isEnabled,
    });
  } else if (request.action === "toggleAdBlocker") {
    isEnabled = request.enabled;
    chrome.storage.local.set({ adBlockerEnabled: isEnabled });
    sendResponse({ success: true });
  } else if (request.action === "updateStats") {
    if (request.type === "ads") {
      blockedAds += request.count;
    } else if (request.type === "trackers") {
      blockedTrackers += request.count;
    }
    updateCounters();
    sendResponse({ success: true });
  }
  return true;
});
