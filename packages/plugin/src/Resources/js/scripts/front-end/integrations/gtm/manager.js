/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/front-end/integrations/gtm/manager.ts":
/*!**************************************************************!*\
  !*** ./src/components/front-end/integrations/gtm/manager.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GTMManager: function() { return /* binding */ GTMManager; }\n/* harmony export */ });\nvar GTMManager = /** @class */ (function () {\n    function GTMManager() {\n        this.containerIds = new Set();\n        window.dataLayer = window.dataLayer || [];\n        this.dataLayer = window.dataLayer;\n    }\n    GTMManager.getInstance = function () {\n        if (!GTMManager.instance) {\n            GTMManager.instance = new GTMManager();\n        }\n        return GTMManager.instance;\n    };\n    GTMManager.prototype.loadContainer = function (id) {\n        if (this.containerIds.has(id)) {\n            return;\n        }\n        if (this.containerIds.size === 0) {\n            this.loadScript(id);\n        }\n        this.dataLayer.push({\n            'gtm.start': new Date().getTime(),\n            event: 'gtm.js',\n            'gtm.container': id,\n        });\n        this.containerIds.add(id);\n    };\n    GTMManager.prototype.loadScript = function (id) {\n        var script = document.createElement('script');\n        script.async = true;\n        script.src = \"https://www.googletagmanager.com/gtm.js?id=\".concat(id);\n        var firstScript = document.getElementsByTagName('script')[0];\n        firstScript.parentNode.insertBefore(script, firstScript);\n    };\n    GTMManager.prototype.observeNewForms = function () {\n        var _this = this;\n        var observer = new MutationObserver(function (mutations) {\n            mutations.forEach(function (mutation) {\n                mutation.addedNodes.forEach(function (node) {\n                    if (node instanceof HTMLFormElement) {\n                        var gtmId = node.dataset.gtmId;\n                        if (gtmId) {\n                            _this.loadContainer(gtmId);\n                        }\n                    }\n                });\n            });\n        });\n        observer.observe(document.body, {\n            childList: true,\n            subtree: true,\n        });\n    };\n    return GTMManager;\n}());\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9mcm9udC1lbmQvaW50ZWdyYXRpb25zL2d0bS9tYW5hZ2VyLnRzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLENBQUM7QUFDcUIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmYvc2NyaXB0cy8uL3NyYy9jb21wb25lbnRzL2Zyb250LWVuZC9pbnRlZ3JhdGlvbnMvZ3RtL21hbmFnZXIudHM/MzY4NiJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgR1RNTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBHVE1NYW5hZ2VyKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lcklkcyA9IG5ldyBTZXQoKTtcbiAgICAgICAgd2luZG93LmRhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXIgfHwgW107XG4gICAgICAgIHRoaXMuZGF0YUxheWVyID0gd2luZG93LmRhdGFMYXllcjtcbiAgICB9XG4gICAgR1RNTWFuYWdlci5nZXRJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFHVE1NYW5hZ2VyLmluc3RhbmNlKSB7XG4gICAgICAgICAgICBHVE1NYW5hZ2VyLmluc3RhbmNlID0gbmV3IEdUTU1hbmFnZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gR1RNTWFuYWdlci5pbnN0YW5jZTtcbiAgICB9O1xuICAgIEdUTU1hbmFnZXIucHJvdG90eXBlLmxvYWRDb250YWluZXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGFpbmVySWRzLmhhcyhpZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jb250YWluZXJJZHMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkU2NyaXB0KGlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRhdGFMYXllci5wdXNoKHtcbiAgICAgICAgICAgICdndG0uc3RhcnQnOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICAgICAgICAgIGV2ZW50OiAnZ3RtLmpzJyxcbiAgICAgICAgICAgICdndG0uY29udGFpbmVyJzogaWQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbnRhaW5lcklkcy5hZGQoaWQpO1xuICAgIH07XG4gICAgR1RNTWFuYWdlci5wcm90b3R5cGUubG9hZFNjcmlwdCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgIHNjcmlwdC5hc3luYyA9IHRydWU7XG4gICAgICAgIHNjcmlwdC5zcmMgPSBcImh0dHBzOi8vd3d3Lmdvb2dsZXRhZ21hbmFnZXIuY29tL2d0bS5qcz9pZD1cIi5jb25jYXQoaWQpO1xuICAgICAgICB2YXIgZmlyc3RTY3JpcHQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XG4gICAgICAgIGZpcnN0U2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNjcmlwdCwgZmlyc3RTY3JpcHQpO1xuICAgIH07XG4gICAgR1RNTWFuYWdlci5wcm90b3R5cGUub2JzZXJ2ZU5ld0Zvcm1zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgICAgICAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobXV0YXRpb24pIHtcbiAgICAgICAgICAgICAgICBtdXRhdGlvbi5hZGRlZE5vZGVzLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBIVE1MRm9ybUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBndG1JZCA9IG5vZGUuZGF0YXNldC5ndG1JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChndG1JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmxvYWRDb250YWluZXIoZ3RtSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gR1RNTWFuYWdlcjtcbn0oKSk7XG5leHBvcnQgeyBHVE1NYW5hZ2VyIH07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/components/front-end/integrations/gtm/manager.ts\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/components/front-end/integrations/gtm/manager.ts"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;