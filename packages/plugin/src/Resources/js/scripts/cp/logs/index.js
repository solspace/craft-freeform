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

/***/ "./src/components/cp/logs/index.js":
/*!*****************************************!*\
  !*** ./src/components/cp/logs/index.js ***!
  \*****************************************/
/***/ (function() {

eval("function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n(function () {\n  'use strict';\n\n  $('.clear-logs').on({\n    click: function click(event) {\n      event.stopPropagation();\n      event.preventDefault();\n      var msg = 'Are you sure you want to clear error logs?';\n\n      if (!confirm(msg)) {\n        return false;\n      }\n\n      $.ajax({\n        url: $(this).attr('href'),\n        data: _defineProperty({}, Craft.csrfTokenName, Craft.csrfTokenValue),\n        type: 'post',\n        dataType: 'json',\n        success: function success(json) {\n          if (json.success) {\n            window.location.reload(true);\n          }\n        }\n      });\n      return false;\n    }\n  });\n})();//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmYvc2NyaXB0cy8uL3NyYy9jb21wb25lbnRzL2NwL2xvZ3MvaW5kZXguanM/MTczOSJdLCJuYW1lcyI6WyIkIiwib24iLCJjbGljayIsImV2ZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJtc2ciLCJjb25maXJtIiwiYWpheCIsInVybCIsImF0dHIiLCJkYXRhIiwiQ3JhZnQiLCJjc3JmVG9rZW5OYW1lIiwiY3NyZlRva2VuVmFsdWUiLCJ0eXBlIiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwianNvbiIsIndpbmRvdyIsImxvY2F0aW9uIiwicmVsb2FkIl0sIm1hcHBpbmdzIjoiOztBQUFBLENBQUMsWUFBWTtBQUNYOztBQUVBQSxFQUFBQSxDQUFDLENBQUMsYUFBRCxDQUFELENBQWlCQyxFQUFqQixDQUFvQjtBQUNsQkMsSUFBQUEsS0FBSyxFQUFFLGVBQVVDLEtBQVYsRUFBaUI7QUFDdEJBLE1BQUFBLEtBQUssQ0FBQ0MsZUFBTjtBQUNBRCxNQUFBQSxLQUFLLENBQUNFLGNBQU47QUFFQSxVQUFNQyxHQUFHLEdBQUcsNENBQVo7O0FBQ0EsVUFBSSxDQUFDQyxPQUFPLENBQUNELEdBQUQsQ0FBWixFQUFtQjtBQUNqQixlQUFPLEtBQVA7QUFDRDs7QUFFRE4sTUFBQUEsQ0FBQyxDQUFDUSxJQUFGLENBQU87QUFDTEMsUUFBQUEsR0FBRyxFQUFFVCxDQUFDLENBQUMsSUFBRCxDQUFELENBQVFVLElBQVIsQ0FBYSxNQUFiLENBREE7QUFFTEMsUUFBQUEsSUFBSSxzQkFDREMsS0FBSyxDQUFDQyxhQURMLEVBQ3FCRCxLQUFLLENBQUNFLGNBRDNCLENBRkM7QUFLTEMsUUFBQUEsSUFBSSxFQUFFLE1BTEQ7QUFNTEMsUUFBQUEsUUFBUSxFQUFFLE1BTkw7QUFPTEMsUUFBQUEsT0FBTyxFQUFFLGlCQUFDQyxJQUFELEVBQVU7QUFDakIsY0FBSUEsSUFBSSxDQUFDRCxPQUFULEVBQWtCO0FBQ2hCRSxZQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLE1BQWhCLENBQXVCLElBQXZCO0FBQ0Q7QUFDRjtBQVhJLE9BQVA7QUFjQSxhQUFPLEtBQVA7QUFDRDtBQXpCaUIsR0FBcEI7QUEyQkQsQ0E5QkQiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgJCgnLmNsZWFyLWxvZ3MnKS5vbih7XG4gICAgY2xpY2s6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBjb25zdCBtc2cgPSAnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGNsZWFyIGVycm9yIGxvZ3M/JztcbiAgICAgIGlmICghY29uZmlybShtc2cpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiAkKHRoaXMpLmF0dHIoJ2hyZWYnKSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIFtDcmFmdC5jc3JmVG9rZW5OYW1lXTogQ3JhZnQuY3NyZlRva2VuVmFsdWUsXG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgc3VjY2VzczogKGpzb24pID0+IHtcbiAgICAgICAgICBpZiAoanNvbi5zdWNjZXNzKSB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgfSk7XG59KSgpO1xuIl0sImZpbGUiOiIuL3NyYy9jb21wb25lbnRzL2NwL2xvZ3MvaW5kZXguanMuanMiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/components/cp/logs/index.js\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/components/cp/logs/index.js"]();
/******/ 	
/******/ })()
;