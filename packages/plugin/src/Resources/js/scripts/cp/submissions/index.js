!function(){function t(e){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t(e)}$((function(){var e=$("#status-menu-btn"),a=e.data("menubtn");a&&a.setSettings({onOptionSelect:function(t){var a=$(t).data("id"),n=$(t).data("name"),r=$(t).data("color"),o=$("#status-menu-select");$("#statusId").val(a);var i="<span class='status "+r+"'></span>"+Craft.uppercaseFirst(n);e.html(i),o.find("li a.sel").removeClass("sel"),o.find("li a[data-id="+a+"]").addClass("sel")}});var n=$("form#asset_download");$("#content").on({click:function(){var t=$(this).data().assetId;$("input[name=assetId]",n).val(t),n.submit()}},"a[data-asset-id]"),$("canvas[data-image]").each((function(){var t=$(this)[0],e=new window.Image;e.addEventListener("load",(function(){t.getContext("2d").drawImage(e,0,0)})),e.setAttribute("src",$(this).data("image"))}));var r=$(".download-signature-links");$("a[data-type]",r).on("click",(function(){var t=$(this).parents(".signature-wrapper").find("canvas:first")[0],e=$(this).data("type"),a=document.createElement("a");return a.download="signature.".concat(e),a.href=t.toDataURL("image/".concat(e)).replace("image/".concat(e),"image/octet-stream"),a.click(),!1})),$("#export-btn").remove(),$("#delete-button").on("click",(function(){if(confirm(Craft.t("freeform","Are you sure you want to delete this?"))){$(this).attr("disabled",!0).addClass("disabled").text("Deleting...");var e=$(this).data("id");$.ajax({type:"post",url:Craft.getCpUrl("freeform/spam/delete"),dataType:"json",data:(a={id:e},n=Craft.csrfTokenName,r=Craft.csrfTokenValue,o=function(e,a){if("object"!=t(e)||!e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var r=n.call(e,"string");if("object"!=t(r))return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(n),(n="symbol"==t(o)?o:o+"")in a?Object.defineProperty(a,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):a[n]=r,a),success:function(t){t.success?window.location.href=Craft.getCpUrl("freeform/spam"):console.error("Could not delete spam submission")}})}var a,n,r,o}))}))}();