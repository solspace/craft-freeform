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

/***/ "./src/components/cp/export-profiles/export-profile.js":
/*!*************************************************************!*\
  !*** ./src/components/cp/export-profiles/export-profile.js ***!
  \*************************************************************/
/***/ (function() {

eval("// eslint-disable no-undef\n$(function () {\n  new Garnish.DragSort($('#field-settings tbody tr'), {\n    handle: '.move',\n    axis: 'y'\n  });\n  var addFilterButton = $('#add-filter');\n  var filterTable = $('#filter-table');\n  var template = $('template', filterTable);\n  addFilterButton.on({\n    click: function click() {\n      var clone = template.html();\n      var lastIterator = $('tbody > tr[data-iterator]:last').data('iterator');\n      var currentIterator = 0;\n      if (lastIterator !== undefined) {\n        currentIterator = parseInt(lastIterator) + 1;\n      }\n      clone = clone.replace(/__iterator__/g, currentIterator);\n      $('tbody', filterTable).append(clone);\n    }\n  });\n  filterTable.on({\n    click: function click() {\n      if (!confirm('Are you sure?')) {\n        return false;\n      }\n      $(this).parents('tr:first').remove();\n    }\n  }, '.delete.icon');\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9jcC9leHBvcnQtcHJvZmlsZXMvZXhwb3J0LXByb2ZpbGUuanMiLCJuYW1lcyI6WyIkIiwiR2FybmlzaCIsIkRyYWdTb3J0IiwiaGFuZGxlIiwiYXhpcyIsImFkZEZpbHRlckJ1dHRvbiIsImZpbHRlclRhYmxlIiwidGVtcGxhdGUiLCJvbiIsImNsaWNrIiwiY2xvbmUiLCJodG1sIiwibGFzdEl0ZXJhdG9yIiwiZGF0YSIsImN1cnJlbnRJdGVyYXRvciIsInVuZGVmaW5lZCIsInBhcnNlSW50IiwicmVwbGFjZSIsImFwcGVuZCIsImNvbmZpcm0iLCJwYXJlbnRzIiwicmVtb3ZlIl0sInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmYvc2NyaXB0cy8uL3NyYy9jb21wb25lbnRzL2NwL2V4cG9ydC1wcm9maWxlcy9leHBvcnQtcHJvZmlsZS5qcz9hOWE5Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmXG4kKCgpID0+IHtcbiAgbmV3IEdhcm5pc2guRHJhZ1NvcnQoJCgnI2ZpZWxkLXNldHRpbmdzIHRib2R5IHRyJyksIHtcbiAgICBoYW5kbGU6ICcubW92ZScsXG4gICAgYXhpczogJ3knLFxuICB9KTtcblxuICBjb25zdCBhZGRGaWx0ZXJCdXR0b24gPSAkKCcjYWRkLWZpbHRlcicpO1xuICBjb25zdCBmaWx0ZXJUYWJsZSA9ICQoJyNmaWx0ZXItdGFibGUnKTtcbiAgY29uc3QgdGVtcGxhdGUgPSAkKCd0ZW1wbGF0ZScsIGZpbHRlclRhYmxlKTtcblxuICBhZGRGaWx0ZXJCdXR0b24ub24oe1xuICAgIGNsaWNrOiAoKSA9PiB7XG4gICAgICBsZXQgY2xvbmUgPSB0ZW1wbGF0ZS5odG1sKCk7XG4gICAgICBjb25zdCBsYXN0SXRlcmF0b3IgPSAkKCd0Ym9keSA+IHRyW2RhdGEtaXRlcmF0b3JdOmxhc3QnKS5kYXRhKCdpdGVyYXRvcicpO1xuXG4gICAgICBsZXQgY3VycmVudEl0ZXJhdG9yID0gMDtcbiAgICAgIGlmIChsYXN0SXRlcmF0b3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjdXJyZW50SXRlcmF0b3IgPSBwYXJzZUludChsYXN0SXRlcmF0b3IpICsgMTtcbiAgICAgIH1cblxuICAgICAgY2xvbmUgPSBjbG9uZS5yZXBsYWNlKC9fX2l0ZXJhdG9yX18vZywgY3VycmVudEl0ZXJhdG9yKTtcblxuICAgICAgJCgndGJvZHknLCBmaWx0ZXJUYWJsZSkuYXBwZW5kKGNsb25lKTtcbiAgICB9LFxuICB9KTtcblxuICBmaWx0ZXJUYWJsZS5vbihcbiAgICB7XG4gICAgICBjbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWNvbmZpcm0oJ0FyZSB5b3Ugc3VyZT8nKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgICQodGhpcykucGFyZW50cygndHI6Zmlyc3QnKS5yZW1vdmUoKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAnLmRlbGV0ZS5pY29uJ1xuICApO1xufSk7XG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0FBLENBQUMsQ0FBQyxZQUFNO0VBQ04sSUFBSUMsT0FBTyxDQUFDQyxRQUFRLENBQUNGLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFO0lBQ2xERyxNQUFNLEVBQUUsT0FBTztJQUNmQyxJQUFJLEVBQUU7RUFDUixDQUFDLENBQUM7RUFFRixJQUFNQyxlQUFlLEdBQUdMLENBQUMsQ0FBQyxhQUFhLENBQUM7RUFDeEMsSUFBTU0sV0FBVyxHQUFHTixDQUFDLENBQUMsZUFBZSxDQUFDO0VBQ3RDLElBQU1PLFFBQVEsR0FBR1AsQ0FBQyxDQUFDLFVBQVUsRUFBRU0sV0FBVyxDQUFDO0VBRTNDRCxlQUFlLENBQUNHLEVBQUUsQ0FBQztJQUNqQkMsS0FBSyxFQUFFLFNBQVBBLEtBQUtBLENBQUEsRUFBUTtNQUNYLElBQUlDLEtBQUssR0FBR0gsUUFBUSxDQUFDSSxJQUFJLENBQUMsQ0FBQztNQUMzQixJQUFNQyxZQUFZLEdBQUdaLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDYSxJQUFJLENBQUMsVUFBVSxDQUFDO01BRXpFLElBQUlDLGVBQWUsR0FBRyxDQUFDO01BQ3ZCLElBQUlGLFlBQVksS0FBS0csU0FBUyxFQUFFO1FBQzlCRCxlQUFlLEdBQUdFLFFBQVEsQ0FBQ0osWUFBWSxDQUFDLEdBQUcsQ0FBQztNQUM5QztNQUVBRixLQUFLLEdBQUdBLEtBQUssQ0FBQ08sT0FBTyxDQUFDLGVBQWUsRUFBRUgsZUFBZSxDQUFDO01BRXZEZCxDQUFDLENBQUMsT0FBTyxFQUFFTSxXQUFXLENBQUMsQ0FBQ1ksTUFBTSxDQUFDUixLQUFLLENBQUM7SUFDdkM7RUFDRixDQUFDLENBQUM7RUFFRkosV0FBVyxDQUFDRSxFQUFFLENBQ1o7SUFDRUMsS0FBSyxFQUFFLFNBQVBBLEtBQUtBLENBQUEsRUFBYztNQUNqQixJQUFJLENBQUNVLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtRQUM3QixPQUFPLEtBQUs7TUFDZDtNQUVBbkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDb0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDQyxNQUFNLENBQUMsQ0FBQztJQUN0QztFQUNGLENBQUMsRUFDRCxjQUNGLENBQUM7QUFDSCxDQUFDLENBQUMiLCJpZ25vcmVMaXN0IjpbXX0=\n//# sourceURL=webpack-internal:///./src/components/cp/export-profiles/export-profile.js\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/components/cp/export-profiles/export-profile.js"]();
/******/ 	
/******/ })()
;