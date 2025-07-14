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

/***/ "./src/components/cp/integrations/edit.ts":
/*!************************************************!*\
  !*** ./src/components/cp/integrations/edit.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   EVENT_INTEGRATION_UPDATE: function() { return /* binding */ EVENT_INTEGRATION_UPDATE; }\n/* harmony export */ });\nvar __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {\n    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {\n        if (ar || !(i in from)) {\n            if (!ar) ar = Array.prototype.slice.call(from, 0, i);\n            ar[i] = from[i];\n        }\n    }\n    return to.concat(ar || Array.prototype.slice.call(from));\n};\nvar EVENT_INTEGRATION_UPDATE = 'integration-update';\n$(function () {\n    var $propertyEditor = $('.property-editor');\n    var $classSelect = $('[name=\"class\"]');\n    $classSelect.on('change', function () {\n        $(this).trigger(EVENT_INTEGRATION_UPDATE);\n    });\n    $('select', $propertyEditor).on('change', function () {\n        $(this).trigger(EVENT_INTEGRATION_UPDATE);\n    });\n    $('input, textarea', $propertyEditor).on('keyup', function () {\n        $(this).trigger(EVENT_INTEGRATION_UPDATE);\n        if ($(this).hasClass('handle-generator')) {\n            $(this).val(generateHandle($(this).val()));\n        }\n    });\n    var updateFieldVisibility = function () {\n        // eslint-disable-next-line @typescript-eslint/no-explicit-any\n        var values = {\n            values: {\n                enabled: true,\n            },\n        };\n        var currentClass;\n        if ($classSelect.get(0)) {\n            currentClass = $classSelect.val();\n        }\n        else {\n            var $currentSelection = $('ul.integration-stack-items > li.active > a[data-type]');\n            currentClass = $currentSelection.data('type');\n        }\n        $('form#main-form')\n            .serializeArray()\n            .forEach(function (item) {\n            var name = item.name, value = item.value;\n            if (name === 'class') {\n                return;\n            }\n            if (!name.startsWith('properties[')) {\n                values[name] = value;\n                return;\n            }\n            if (name.startsWith(\"properties[\".concat(currentClass, \"]\"))) {\n                var updatedName = name.replace(\"properties[\".concat(currentClass, \"]\"), '').replace(/[[\\]]/g, '');\n                values.values[updatedName] = value;\n            }\n        });\n        $propertyEditor.find('.field').each(function () {\n            var $field = $(this);\n            var $filterScripts = $field.find('script.visibility-filters');\n            if (!$filterScripts.length) {\n                return;\n            }\n            var filters = JSON.parse($filterScripts.html());\n            filters.forEach(function (filter) {\n                var expression = filter.expression;\n                var fn = new (Function.bind.apply(Function, __spreadArray(__spreadArray([void 0], Object.keys(values.values), false), [\"return \".concat(expression, \";\")], false)))();\n                if (fn.apply(void 0, Object.values(values))) {\n                    $field.show();\n                }\n                else {\n                    $field.hide();\n                }\n            });\n        });\n    };\n    $(document).on(EVENT_INTEGRATION_UPDATE, updateFieldVisibility);\n    updateFieldVisibility();\n});\nvar generateHandle = function (value) { return value.replace(/[^a-zA-Z0-9\\-_]/g, ''); };\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9jcC9pbnRlZ3JhdGlvbnMvZWRpdC50cyIsIm1hcHBpbmdzIjoiOzs7O0FBQUEscUJBQXFCLFNBQUksSUFBSSxTQUFJO0FBQ2pDLDZFQUE2RSxPQUFPO0FBQ3BGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzS0FBc0s7QUFDdEs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Qsd0NBQXdDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGZmL3NjcmlwdHMvLi9zcmMvY29tcG9uZW50cy9jcC9pbnRlZ3JhdGlvbnMvZWRpdC50cz8zZmYxIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBfX3NwcmVhZEFycmF5ID0gKHRoaXMgJiYgdGhpcy5fX3NwcmVhZEFycmF5KSB8fCBmdW5jdGlvbiAodG8sIGZyb20sIHBhY2spIHtcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoYXIgfHwgIShpIGluIGZyb20pKSB7XG4gICAgICAgICAgICBpZiAoIWFyKSBhciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20sIDAsIGkpO1xuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xufTtcbmV4cG9ydCB2YXIgRVZFTlRfSU5URUdSQVRJT05fVVBEQVRFID0gJ2ludGVncmF0aW9uLXVwZGF0ZSc7XG4kKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHByb3BlcnR5RWRpdG9yID0gJCgnLnByb3BlcnR5LWVkaXRvcicpO1xuICAgIHZhciAkY2xhc3NTZWxlY3QgPSAkKCdbbmFtZT1cImNsYXNzXCJdJyk7XG4gICAgJGNsYXNzU2VsZWN0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykudHJpZ2dlcihFVkVOVF9JTlRFR1JBVElPTl9VUERBVEUpO1xuICAgIH0pO1xuICAgICQoJ3NlbGVjdCcsICRwcm9wZXJ0eUVkaXRvcikub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKEVWRU5UX0lOVEVHUkFUSU9OX1VQREFURSk7XG4gICAgfSk7XG4gICAgJCgnaW5wdXQsIHRleHRhcmVhJywgJHByb3BlcnR5RWRpdG9yKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykudHJpZ2dlcihFVkVOVF9JTlRFR1JBVElPTl9VUERBVEUpO1xuICAgICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnaGFuZGxlLWdlbmVyYXRvcicpKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnZhbChnZW5lcmF0ZUhhbmRsZSgkKHRoaXMpLnZhbCgpKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgdXBkYXRlRmllbGRWaXNpYmlsaXR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICB2YXIgdmFsdWVzID0ge1xuICAgICAgICAgICAgdmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHZhciBjdXJyZW50Q2xhc3M7XG4gICAgICAgIGlmICgkY2xhc3NTZWxlY3QuZ2V0KDApKSB7XG4gICAgICAgICAgICBjdXJyZW50Q2xhc3MgPSAkY2xhc3NTZWxlY3QudmFsKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgJGN1cnJlbnRTZWxlY3Rpb24gPSAkKCd1bC5pbnRlZ3JhdGlvbi1zdGFjay1pdGVtcyA+IGxpLmFjdGl2ZSA+IGFbZGF0YS10eXBlXScpO1xuICAgICAgICAgICAgY3VycmVudENsYXNzID0gJGN1cnJlbnRTZWxlY3Rpb24uZGF0YSgndHlwZScpO1xuICAgICAgICB9XG4gICAgICAgICQoJ2Zvcm0jbWFpbi1mb3JtJylcbiAgICAgICAgICAgIC5zZXJpYWxpemVBcnJheSgpXG4gICAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSBpdGVtLm5hbWUsIHZhbHVlID0gaXRlbS52YWx1ZTtcbiAgICAgICAgICAgIGlmIChuYW1lID09PSAnY2xhc3MnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFuYW1lLnN0YXJ0c1dpdGgoJ3Byb3BlcnRpZXNbJykpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKFwicHJvcGVydGllc1tcIi5jb25jYXQoY3VycmVudENsYXNzLCBcIl1cIikpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHVwZGF0ZWROYW1lID0gbmFtZS5yZXBsYWNlKFwicHJvcGVydGllc1tcIi5jb25jYXQoY3VycmVudENsYXNzLCBcIl1cIiksICcnKS5yZXBsYWNlKC9bW1xcXV0vZywgJycpO1xuICAgICAgICAgICAgICAgIHZhbHVlcy52YWx1ZXNbdXBkYXRlZE5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkcHJvcGVydHlFZGl0b3IuZmluZCgnLmZpZWxkJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJGZpZWxkID0gJCh0aGlzKTtcbiAgICAgICAgICAgIHZhciAkZmlsdGVyU2NyaXB0cyA9ICRmaWVsZC5maW5kKCdzY3JpcHQudmlzaWJpbGl0eS1maWx0ZXJzJyk7XG4gICAgICAgICAgICBpZiAoISRmaWx0ZXJTY3JpcHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBmaWx0ZXJzID0gSlNPTi5wYXJzZSgkZmlsdGVyU2NyaXB0cy5odG1sKCkpO1xuICAgICAgICAgICAgZmlsdGVycy5mb3JFYWNoKGZ1bmN0aW9uIChmaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXhwcmVzc2lvbiA9IGZpbHRlci5leHByZXNzaW9uO1xuICAgICAgICAgICAgICAgIHZhciBmbiA9IG5ldyAoRnVuY3Rpb24uYmluZC5hcHBseShGdW5jdGlvbiwgX19zcHJlYWRBcnJheShfX3NwcmVhZEFycmF5KFt2b2lkIDBdLCBPYmplY3Qua2V5cyh2YWx1ZXMudmFsdWVzKSwgZmFsc2UpLCBbXCJyZXR1cm4gXCIuY29uY2F0KGV4cHJlc3Npb24sIFwiO1wiKV0sIGZhbHNlKSkpKCk7XG4gICAgICAgICAgICAgICAgaWYgKGZuLmFwcGx5KHZvaWQgMCwgT2JqZWN0LnZhbHVlcyh2YWx1ZXMpKSkge1xuICAgICAgICAgICAgICAgICAgICAkZmllbGQuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJGZpZWxkLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAkKGRvY3VtZW50KS5vbihFVkVOVF9JTlRFR1JBVElPTl9VUERBVEUsIHVwZGF0ZUZpZWxkVmlzaWJpbGl0eSk7XG4gICAgdXBkYXRlRmllbGRWaXNpYmlsaXR5KCk7XG59KTtcbnZhciBnZW5lcmF0ZUhhbmRsZSA9IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdmFsdWUucmVwbGFjZSgvW15hLXpBLVowLTlcXC1fXS9nLCAnJyk7IH07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/components/cp/integrations/edit.ts\n");

/***/ }),

/***/ "./src/components/cp/integrations/singleton-edit.ts":
/*!**********************************************************!*\
  !*** ./src/components/cp/integrations/singleton-edit.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_cp_integrations_edit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @components/cp/integrations/edit */ \"./src/components/cp/integrations/edit.ts\");\n\n$(function () {\n    var stack = $('ul.integration-stack-items');\n    $('a[data-type]').on('click', function (event) {\n        event.preventDefault();\n        var type = $(this).data('type');\n        var name = $(this).data('name');\n        var val = type.split('\\\\').join('');\n        $('div#properties-' + val)\n            .show()\n            .siblings()\n            .hide();\n        // eslint-disable-next-line @typescript-eslint/no-explicit-any\n        var url = Craft.getCpUrl(\"freeform/settings/integrations/single/\".concat(name));\n        window.history.pushState({}, '', url);\n        $('input[name=\"selectedIntegration\"]').val(name);\n        $(this).trigger(_components_cp_integrations_edit__WEBPACK_IMPORTED_MODULE_0__.EVENT_INTEGRATION_UPDATE);\n        $(this).parents('li[data-name]').addClass('active').siblings('.active').removeClass('active');\n    });\n    $('.enabled-switch[data-name] button.lightswitch').on('click', function () {\n        var name = $(this).parents('.enabled-switch').data('name');\n        var isOn = $(this).data('lightswitch').on;\n        $(\"a[data-name=\\\"\".concat(name, \"\\\"] > div\"), stack).toggleClass('enabled', isOn);\n    });\n    if (!$('li.active > a[data-type]').get(0)) {\n        $('ul.integration-stack-items > li:first-child > a[data-type]').trigger('click');\n    }\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9jcC9pbnRlZ3JhdGlvbnMvc2luZ2xldG9uLWVkaXQudHMiLCJtYXBwaW5ncyI6Ijs7QUFBNEU7QUFDNUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQSx3QkFBd0Isc0ZBQXdCO0FBQ2hEO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmYvc2NyaXB0cy8uL3NyYy9jb21wb25lbnRzL2NwL2ludGVncmF0aW9ucy9zaW5nbGV0b24tZWRpdC50cz83OGEyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVWRU5UX0lOVEVHUkFUSU9OX1VQREFURSB9IGZyb20gJ0Bjb21wb25lbnRzL2NwL2ludGVncmF0aW9ucy9lZGl0JztcbiQoZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGFjayA9ICQoJ3VsLmludGVncmF0aW9uLXN0YWNrLWl0ZW1zJyk7XG4gICAgJCgnYVtkYXRhLXR5cGVdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciB0eXBlID0gJCh0aGlzKS5kYXRhKCd0eXBlJyk7XG4gICAgICAgIHZhciBuYW1lID0gJCh0aGlzKS5kYXRhKCduYW1lJyk7XG4gICAgICAgIHZhciB2YWwgPSB0eXBlLnNwbGl0KCdcXFxcJykuam9pbignJyk7XG4gICAgICAgICQoJ2RpdiNwcm9wZXJ0aWVzLScgKyB2YWwpXG4gICAgICAgICAgICAuc2hvdygpXG4gICAgICAgICAgICAuc2libGluZ3MoKVxuICAgICAgICAgICAgLmhpZGUoKTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgdmFyIHVybCA9IENyYWZ0LmdldENwVXJsKFwiZnJlZWZvcm0vc2V0dGluZ3MvaW50ZWdyYXRpb25zL3NpbmdsZS9cIi5jb25jYXQobmFtZSkpO1xuICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCB1cmwpO1xuICAgICAgICAkKCdpbnB1dFtuYW1lPVwic2VsZWN0ZWRJbnRlZ3JhdGlvblwiXScpLnZhbChuYW1lKTtcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKEVWRU5UX0lOVEVHUkFUSU9OX1VQREFURSk7XG4gICAgICAgICQodGhpcykucGFyZW50cygnbGlbZGF0YS1uYW1lXScpLmFkZENsYXNzKCdhY3RpdmUnKS5zaWJsaW5ncygnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICB9KTtcbiAgICAkKCcuZW5hYmxlZC1zd2l0Y2hbZGF0YS1uYW1lXSBidXR0b24ubGlnaHRzd2l0Y2gnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBuYW1lID0gJCh0aGlzKS5wYXJlbnRzKCcuZW5hYmxlZC1zd2l0Y2gnKS5kYXRhKCduYW1lJyk7XG4gICAgICAgIHZhciBpc09uID0gJCh0aGlzKS5kYXRhKCdsaWdodHN3aXRjaCcpLm9uO1xuICAgICAgICAkKFwiYVtkYXRhLW5hbWU9XFxcIlwiLmNvbmNhdChuYW1lLCBcIlxcXCJdID4gZGl2XCIpLCBzdGFjaykudG9nZ2xlQ2xhc3MoJ2VuYWJsZWQnLCBpc09uKTtcbiAgICB9KTtcbiAgICBpZiAoISQoJ2xpLmFjdGl2ZSA+IGFbZGF0YS10eXBlXScpLmdldCgwKSkge1xuICAgICAgICAkKCd1bC5pbnRlZ3JhdGlvbi1zdGFjay1pdGVtcyA+IGxpOmZpcnN0LWNoaWxkID4gYVtkYXRhLXR5cGVdJykudHJpZ2dlcignY2xpY2snKTtcbiAgICB9XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/components/cp/integrations/singleton-edit.ts\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/components/cp/integrations/singleton-edit.ts");
/******/ 	
/******/ })()
;