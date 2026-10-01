(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var url = script.getAttribute("data-freeform-url");
  if (!url) return;

  var frameUrl;
  try {
    frameUrl = new URL(url, script.src);
  } catch (_) {
    return;
  }

  // This version supports HTML pages on the same origin as the Craft site.
  if (frameUrl.origin !== window.location.origin) return;

  var frame = document.createElement("iframe");
  frame.src = frameUrl.href;
  frame.title = script.getAttribute("data-freeform-title") || "Form";
  frame.style.width = "100%";
  frame.style.minHeight = "400px";
  frame.style.border = "0";
  frame.style.display = "block";
  frame.setAttribute("scrolling", "no");
  frame.setAttribute("allow", "payment");
  script.parentNode.insertBefore(frame, script);

  frame.addEventListener("load", function () {
    var doc;
    try {
      doc = frame.contentDocument;
    } catch (_) {
      return;
    }
    if (!doc) return;
    var content = doc.getElementById("freeform-embed-content");
    if (!content) return;

    var resize = function () {
      frame.style.minHeight = "0";
      frame.style.height = Math.max(1, Math.ceil(content.getBoundingClientRect().height)) + "px";
    };

    if (window.ResizeObserver) {
      var observer = new ResizeObserver(resize);
      observer.observe(content);
      frame.addEventListener("load", function () { observer.disconnect(); }, { once: true });
    } else {
      var changes = new MutationObserver(resize);
      changes.observe(content, { childList: true, subtree: true, attributes: true });
      frame.addEventListener("load", function () { changes.disconnect(); }, { once: true });
    }
    resize();
  });
})();
