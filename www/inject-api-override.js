(function () {
  "use strict";

  var API_HOST_RE = /https:\/\/api(?:\.test2)?\.bom\.gov\.au/g;
  var API_HOST_MATCH = /api(?:\.test2)?\.bom\.gov\.au/;
  var THIRD_PARTY_BLOCK = /googletagmanager\.com|google-analytics\.com|google\.com\/recaptcha|gstatic\.com\/recaptcha/i;
  var BLOCKED_SCRIPT_URL = window.location.origin + "/blocked-external/script";

  function shouldDropNode(node) {
    if (!node || typeof node !== "object" || Array.isArray(node)) {
      return false;
    }

    var id = typeof node.id === "string" ? node.id.toLowerCase() : "";
    var name = typeof node.name === "string" ? node.name.toLowerCase() : "";

    if (id === "overlay_3187" || id.indexOf("towns_and_cities") !== -1) {
      return true;
    }

    if (name.indexOf("towns and cities") !== -1) {
      return true;
    }

    if (Array.isArray(node.endpoints)) {
      for (var i = 0; i < node.endpoints.length; i += 1) {
        var endpoint = node.endpoints[i];
        var endpointUrl = endpoint && typeof endpoint.url === "string" ? endpoint.url.toLowerCase() : "";
        if (endpointUrl.indexOf("/overlays/towns_and_cities/") !== -1) {
          return true;
        }
      }
    }

    return false;
  }

  function rewriteApiUrl(url) {
    var text = String(url || "");
    if (API_HOST_MATCH.test(text)) {
      text = text.replace(API_HOST_RE, window.location.origin);
    }

    return text;
  }

  function pruneSettings(node) {
    if (Array.isArray(node)) {
      var outArray = [];
      for (var i = 0; i < node.length; i += 1) {
        var child = pruneSettings(node[i]);
        if (child !== null) {
          outArray.push(child);
        }
      }
      return outArray;
    }

    if (node && typeof node === "object") {
      if (shouldDropNode(node)) {
        return null;
      }

      var outObject = {};
      for (var key in node) {
        if (!Object.prototype.hasOwnProperty.call(node, key)) {
          continue;
        }
        var value = pruneSettings(node[key]);
        if (value !== null) {
          outObject[key] = value;
        }
      }
      return outObject;
    }

    return node;
  }

  function patchJSONParse() {
    if (!window.JSON || typeof window.JSON.parse !== "function") {
      return;
    }

    var nativeJSONParse = window.JSON.parse;
    window.JSON.parse = function (text, reviver) {
      var parsed = nativeJSONParse.call(window.JSON, text, reviver);
      return pruneSettings(parsed);
    };
  }

  function bootstrapDrupalSettings() {
    try {
      var settingsElement = document.querySelector(
        "head > script[data-drupal-selector=drupal-settings-json], body > script[data-drupal-selector=drupal-settings-json]"
      );

      if (settingsElement && settingsElement.type === "application/json" && settingsElement.textContent) {
        window.drupalSettings = JSON.parse(settingsElement.textContent);
      } else {
        window.drupalSettings = window.drupalSettings || {};
      }

      window.drupalSettings = pruneSettings(window.drupalSettings) || {};

      if (window.drupalSettings.gtm) {
        window.drupalSettings.gtm.tagId = null;
        window.drupalSettings.gtm.tagIds = [];
        window.drupalSettings.gtm.settings = window.drupalSettings.gtm.settings || {};
        window.drupalSettings.gtm.settings.include_classes = false;
      }

      if (window.drupalSettings.gtag) {
        window.drupalSettings.gtag.tagId = "";
        window.drupalSettings.gtag.otherIds = [];
        window.drupalSettings.gtag.events = [];
      }

      if (window.drupalSettings.bomRum) {
        window.drupalSettings.bomRum.apmUrl = window.location.origin + "/blocked-external/apm";
        window.drupalSettings.bomRum.transactionSampleRate = 0;
        window.drupalSettings.bomRum.eventsLimit = 0;
      }
    } catch (_error) {
      window.drupalSettings = window.drupalSettings || {};
    }
  }

  function patchFetch() {
    if (!window.fetch) {
      return;
    }

    var nativeFetch = window.fetch;
    window.fetch = function (input, init) {
      if (typeof input === "string") {
        return nativeFetch(rewriteApiUrl(input), init);
      }

      if (input && typeof input.url === "string") {
        var rewritten = rewriteApiUrl(input.url);
        if (rewritten !== input.url) {
          return nativeFetch(new Request(rewritten, input), init);
        }
      }

      return nativeFetch(input, init);
    };
  }

  function patchXHR() {
    if (!window.XMLHttpRequest || !window.XMLHttpRequest.prototype) {
      return;
    }

    var nativeOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
      if (typeof url === "string") {
        url = rewriteApiUrl(url);
      }
      return nativeOpen.call(this, method, url, async, user, password);
    };
  }

  function patchScriptInjection() {
    try {
      var descriptor = Object.getOwnPropertyDescriptor(window.HTMLScriptElement.prototype, "src");
      if (descriptor && typeof descriptor.set === "function") {
        Object.defineProperty(window.HTMLScriptElement.prototype, "src", {
          configurable: true,
          enumerable: descriptor.enumerable,
          get: descriptor.get,
          set: function (value) {
            var src = String(value || "");
            if (THIRD_PARTY_BLOCK.test(src)) {
              return descriptor.set.call(this, BLOCKED_SCRIPT_URL);
            }
            return descriptor.set.call(this, value);
          }
        });
      }
    } catch (_error) {
      // no-op
    }

    var nativeSetAttribute = window.Element.prototype.setAttribute;
    window.Element.prototype.setAttribute = function (name, value) {
      if (this && this.tagName === "SCRIPT" && String(name).toLowerCase() === "src") {
        var srcValue = String(value || "");
        if (THIRD_PARTY_BLOCK.test(srcValue)) {
          return nativeSetAttribute.call(this, name, BLOCKED_SCRIPT_URL);
        }
      }
      return nativeSetAttribute.call(this, name, value);
    };

    var nativeAppendChild = window.Node.prototype.appendChild;
    window.Node.prototype.appendChild = function (child) {
      try {
        if (child && child.tagName === "SCRIPT") {
          var childSrc = String((child.getAttribute && child.getAttribute("src")) || child.src || "");
          if (THIRD_PARTY_BLOCK.test(childSrc)) {
            child.setAttribute("src", BLOCKED_SCRIPT_URL);
          }
        }
      } catch (_error) {
        // no-op
      }
      return nativeAppendChild.call(this, child);
    };
  }

  function patchKnownGlobals() {
    setTimeout(function () {
      var vars = ["BOM_API", "API_BASE", "apiBase", "apiUrl", "baseUrl", "endpoint", "apiHost", "api_host"];
      for (var i = 0; i < vars.length; i += 1) {
        var key = vars[i];
        if (typeof window[key] === "string") {
          window[key] = rewriteApiUrl(window[key]);
        }
      }
    }, 50);
  }

  patchJSONParse();
  bootstrapDrupalSettings();
  patchFetch();
  patchXHR();
  patchScriptInjection();
  patchKnownGlobals();
})();
