/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/cp/submissions/index.js":
/*!************************************************!*\
  !*** ./src/components/cp/submissions/index.js ***!
  \************************************************/
/***/ (function() {

eval("function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n// eslint-disable no-undef\n$(function () {\n  var $statusSelect = $('#status-menu-btn');\n  var menu = $statusSelect.data('menubtn');\n\n  if (menu) {\n    menu.setSettings({\n      onOptionSelect: function onOptionSelect(data) {\n        var id = $(data).data('id');\n        var name = $(data).data('name');\n        var color = $(data).data('color');\n        var $status = $('#status-menu-select');\n        $('#statusId').val(id);\n        var html = \"<span class='status \" + color + \"'></span>\" + Craft.uppercaseFirst(name);\n        $statusSelect.html(html);\n        $status.find('li a.sel').removeClass('sel');\n        $status.find('li a[data-id=' + id + ']').addClass('sel');\n      }\n    });\n  }\n\n  var $assetDownloadForm = $('form#asset_download');\n  $('#content').on({\n    click: function click() {\n      var _$$data = $(this).data(),\n          assetId = _$$data.assetId;\n\n      $('input[name=assetId]', $assetDownloadForm).val(assetId);\n      $assetDownloadForm.submit();\n    }\n  }, 'a[data-asset-id]');\n  $('canvas[data-image]').each(function () {\n    var canvas = $(this)[0];\n    var img = new window.Image();\n    img.addEventListener('load', function () {\n      canvas.getContext('2d').drawImage(img, 0, 0);\n    });\n    img.setAttribute('src', $(this).data('image'));\n  });\n  var signatureLinksWrapper = $('.download-signature-links');\n  $('a[data-type]', signatureLinksWrapper).on('click', function () {\n    var canvas = $(this).parents('.signature-wrapper').find('canvas:first')[0];\n    var type = $(this).data('type');\n    var link = document.createElement('a');\n    link.download = \"signature.\".concat(type);\n    link.href = canvas.toDataURL(\"image/\".concat(type)).replace(\"image/\".concat(type), 'image/octet-stream');\n    link.click();\n    return false;\n  });\n  $('#export-btn').remove();\n  $('#delete-button').on('click', function () {\n    if (!confirm(Craft.t('freeform', 'Are you sure you want to delete this?'))) {\n      return;\n    }\n\n    $(this).attr('disabled', true).addClass('disabled').text('Deleting...');\n    var id = $(this).data('id');\n    $.ajax({\n      type: 'post',\n      url: Craft.getCpUrl('freeform/spam/delete'),\n      dataType: 'json',\n      data: _defineProperty({\n        id: id\n      }, Craft.csrfTokenName, Craft.csrfTokenValue),\n      success: function success(response) {\n        if (response.success) {\n          window.location.href = Craft.getCpUrl('freeform/spam');\n        } else {\n          console.error('Could not delete spam submission');\n        }\n      }\n    });\n  });\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmYvc2NyaXB0cy8uL3NyYy9jb21wb25lbnRzL2NwL3N1Ym1pc3Npb25zL2luZGV4LmpzPzkxNjQiXSwibmFtZXMiOlsiJCIsIiRzdGF0dXNTZWxlY3QiLCJtZW51IiwiZGF0YSIsInNldFNldHRpbmdzIiwib25PcHRpb25TZWxlY3QiLCJpZCIsIm5hbWUiLCJjb2xvciIsIiRzdGF0dXMiLCJ2YWwiLCJodG1sIiwiQ3JhZnQiLCJ1cHBlcmNhc2VGaXJzdCIsImZpbmQiLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwiJGFzc2V0RG93bmxvYWRGb3JtIiwib24iLCJjbGljayIsImFzc2V0SWQiLCJzdWJtaXQiLCJlYWNoIiwiY2FudmFzIiwiaW1nIiwid2luZG93IiwiSW1hZ2UiLCJhZGRFdmVudExpc3RlbmVyIiwiZ2V0Q29udGV4dCIsImRyYXdJbWFnZSIsInNldEF0dHJpYnV0ZSIsInNpZ25hdHVyZUxpbmtzV3JhcHBlciIsInBhcmVudHMiLCJ0eXBlIiwibGluayIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImRvd25sb2FkIiwiaHJlZiIsInRvRGF0YVVSTCIsInJlcGxhY2UiLCJyZW1vdmUiLCJjb25maXJtIiwidCIsImF0dHIiLCJ0ZXh0IiwiYWpheCIsInVybCIsImdldENwVXJsIiwiZGF0YVR5cGUiLCJjc3JmVG9rZW5OYW1lIiwiY3NyZlRva2VuVmFsdWUiLCJzdWNjZXNzIiwicmVzcG9uc2UiLCJsb2NhdGlvbiIsImNvbnNvbGUiLCJlcnJvciJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUVBQSxDQUFDLENBQUMsWUFBWTtBQUNaLE1BQU1DLGFBQWEsR0FBR0QsQ0FBQyxDQUFDLGtCQUFELENBQXZCO0FBQ0EsTUFBTUUsSUFBSSxHQUFHRCxhQUFhLENBQUNFLElBQWQsQ0FBbUIsU0FBbkIsQ0FBYjs7QUFFQSxNQUFJRCxJQUFKLEVBQVU7QUFDUkEsSUFBQUEsSUFBSSxDQUFDRSxXQUFMLENBQWlCO0FBQ2ZDLE1BQUFBLGNB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QUEsTUFBTSxDQUFDNkIsUUFBUCxDQUFnQmhCLElBQWhCLEdBQXVCMUIsS0FBSyxDQUFDb0MsUUFBTixDQUFlLGVBQWYsQ0FBdkI7QUFDRCxTQUZELE1BRU87QUFDTE8sVUFBQUEsT0FBTyxDQUFDQyxLQUFSLENBQWMsa0NBQWQ7QUFDRDtBQUNGO0FBZEksS0FBUDtBQWdCRCxHQXhCRDtBQXlCRCxDQXBGQSxDQUFEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gZXNsaW50LWRpc2FibGUgbm8tdW5kZWZcblxuJChmdW5jdGlvbiAoKSB7XG4gIGNvbnN0ICRzdGF0dXNTZWxlY3QgPSAkKCcjc3RhdHVzLW1lbnUtYnRuJyk7XG4gIGNvbnN0IG1lbnUgPSAkc3RhdHVzU2VsZWN0LmRhdGEoJ21lbnVidG4nKTtcblxuICBpZiAobWVudSkge1xuICAgIG1lbnUuc2V0U2V0dGluZ3Moe1xuICAgICAgb25PcHRpb25TZWxlY3Q6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGNvbnN0IGlkID0gJChkYXRhKS5kYXRhKCdpZCcpO1xuICAgICAgICBjb25zdCBuYW1lID0gJChkYXRhKS5kYXRhKCduYW1lJyk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gJChkYXRhKS5kYXRhKCdjb2xvcicpO1xuICAgICAgICBjb25zdCAkc3RhdHVzID0gJCgnI3N0YXR1cy1tZW51LXNlbGVjdCcpO1xuXG4gICAgICAgICQoJyNzdGF0dXNJZCcpLnZhbChpZCk7XG4gICAgICAgIGNvbnN0IGh0bWwgPSBcIjxzcGFuIGNsYXNzPSdzdGF0dXMgXCIgKyBjb2xvciArIFwiJz48L3NwYW4+XCIgKyBDcmFmdC51cHBlcmNhc2VGaXJzdChuYW1lKTtcbiAgICAgICAgJHN0YXR1c1NlbGVjdC5odG1sKGh0bWwpO1xuXG4gICAgICAgICRzdGF0dXMuZmluZCgnbGkgYS5zZWwnKS5yZW1vdmVDbGFzcygnc2VsJyk7XG4gICAgICAgICRzdGF0dXMuZmluZCgnbGkgYVtkYXRhLWlkPScgKyBpZCArICddJykuYWRkQ2xhc3MoJ3NlbCcpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0ICRhc3NldERvd25sb2FkRm9ybSA9ICQoJ2Zvcm0jYXNzZXRfZG93bmxvYWQnKTtcbiAgJCgnI2NvbnRlbnQnKS5vbihcbiAgICB7XG4gICAgICBjbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCB7IGFzc2V0SWQgfSA9ICQodGhpcykuZGF0YSgpO1xuXG4gICAgICAgICQoJ2lucHV0W25hbWU9YXNzZXRJZF0nLCAkYXNzZXREb3dubG9hZEZvcm0pLnZhbChhc3NldElkKTtcbiAgICAgICAgJGFzc2V0RG93bmxvYWRGb3JtLnN1Ym1pdCgpO1xuICAgICAgfSxcbiAgICB9LFxuICAgICdhW2RhdGEtYXNzZXQtaWRdJ1xuICApO1xuXG4gICQoJ2NhbnZhc1tkYXRhLWltYWdlXScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGNhbnZhcyA9ICQodGhpcylbMF07XG4gICAgY29uc3QgaW1nID0gbmV3IHdpbmRvdy5JbWFnZSgpO1xuICAgIGltZy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgY2FudmFzLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgfSk7XG4gICAgaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgJCh0aGlzKS5kYXRhKCdpbWFnZScpKTtcbiAgfSk7XG5cbiAgY29uc3Qgc2lnbmF0dXJlTGlua3NXcmFwcGVyID0gJCgnLmRvd25sb2FkLXNpZ25hdHVyZS1saW5rcycpO1xuICAkKCdhW2RhdGEtdHlwZV0nLCBzaWduYXR1cmVMaW5rc1dyYXBwZXIpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBjYW52YXMgPSAkKHRoaXMpLnBhcmVudHMoJy5zaWduYXR1cmUtd3JhcHBlcicpLmZpbmQoJ2NhbnZhczpmaXJzdCcpWzBdO1xuICAgIGNvbnN0IHR5cGUgPSAkKHRoaXMpLmRhdGEoJ3R5cGUnKTtcblxuICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgbGluay5kb3dubG9hZCA9IGBzaWduYXR1cmUuJHt0eXBlfWA7XG4gICAgbGluay5ocmVmID0gY2FudmFzLnRvRGF0YVVSTChgaW1hZ2UvJHt0eXBlfWApLnJlcGxhY2UoYGltYWdlLyR7dHlwZX1gLCAnaW1hZ2Uvb2N0ZXQtc3RyZWFtJyk7XG4gICAgbGluay5jbGljaygpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICAkKCcjZXhwb3J0LWJ0bicpLnJlbW92ZSgpO1xuXG4gICQoJyNkZWxldGUtYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIGlmICghY29uZmlybShDcmFmdC50KCdmcmVlZm9ybScsICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXM/JykpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJCh0aGlzKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpLmFkZENsYXNzKCdkaXNhYmxlZCcpLnRleHQoJ0RlbGV0aW5nLi4uJyk7XG5cbiAgICBjb25zdCBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICAkLmFqYXgoe1xuICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgdXJsOiBDcmFmdC5nZXRDcFVybCgnZnJlZWZvcm0vc3BhbS9kZWxldGUnKSxcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGlkLFxuICAgICAgICBbQ3JhZnQuY3NyZlRva2VuTmFtZV06IENyYWZ0LmNzcmZUb2tlblZhbHVlLFxuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gQ3JhZnQuZ2V0Q3BVcmwoJ2ZyZWVmb3JtL3NwYW0nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgZGVsZXRlIHNwYW0gc3VibWlzc2lvbicpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbn0pO1xuIl0sImZpbGUiOiIuL3NyYy9jb21wb25lbnRzL2NwL3N1Ym1pc3Npb25zL2luZGV4LmpzLmpzIiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/components/cp/submissions/index.js\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/components/cp/submissions/index.js"]();
/******/ 	
/******/ })()
;