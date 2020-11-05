"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
  "use strict";

  $("*[data-auth-check]").each(function () {
    var self = $(this);

    var _self$data = self.data(),
        id = _self$data.integrationId,
        type = _self$data.integrationType;

    var $statusIndicator = $("span[data-auth-indicator]", self);
    var $statusText = $("span[data-auth-text]:first", self);

    if (!id) {
      return;
    }

    $.ajax({
      url: Craft.getCpUrl("freeform/".concat(type, "/check")),
      data: _defineProperty({
        id: id
      }, Craft.csrfTokenName, Craft.csrfTokenValue),
      type: "post",
      dataType: "json",
      success: function success(json) {
        if (json.success) {
          $statusIndicator.css({
            backgroundColor: "#27AE60"
          });
          $statusText.text($statusText.data("authSuccess"));
        } else {
          $statusIndicator.css({
            backgroundColor: "#D0021B"
          });
          $statusText.text($statusText.data("authError"));
        }
      }
    });
  });
})();