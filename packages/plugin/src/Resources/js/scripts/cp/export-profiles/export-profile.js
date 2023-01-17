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

eval("// eslint-disable no-undef\n$(function () {\n  new Garnish.DragSort($('#field-settings tbody tr'), {\n    handle: '.move',\n    axis: 'y'\n  });\n  var addFilterButton = $('#add-filter');\n  var filterTable = $('#filter-table');\n  var template = $('template', filterTable);\n  addFilterButton.on({\n    click: function click() {\n      var clone = template.html();\n      var lastIterator = $('tbody > tr[data-iterator]:last').data('iterator');\n      var currentIterator = 0;\n\n      if (lastIterator !== undefined) {\n        currentIterator = parseInt(lastIterator) + 1;\n      }\n\n      clone = clone.replace(/__iterator__/g, currentIterator);\n      $('tbody', filterTable).append(clone);\n    }\n  });\n  filterTable.on({\n    click: function click() {\n      if (!confirm('Are you sure?')) {\n        return false;\n      }\n\n      $(this).parents('tr:first').remove();\n    }\n  }, '.delete.icon');\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmYvc2NyaXB0cy8uL3NyYy9jb21wb25lbnRzL2NwL2V4cG9ydC1wcm9maWxlcy9leHBvcnQtcHJvZmlsZS5qcz9hOWE5Il0sIm5hbWVzIjpbIiQiLCJHYXJuaXNoIiwiRHJhZ1NvcnQiLCJoYW5kbGUiLCJheGlzIiwiYWRkRmlsdGVyQnV0dG9uIiwiZmlsdGVyVGFibGUiLCJ0ZW1wbGF0ZSIsIm9uIiwiY2xpY2siLCJjbG9uZSIsImh0bWwiLCJsYXN0SXRlcmF0b3IiLCJkYXRhIiwiY3VycmVudEl0ZXJhdG9yIiwidW5kZWZpbmVkIiwicGFyc2VJbnQiLCJyZXBsYWNlIiwiYXBwZW5kIiwiY29uZmlybSIsInBhcmVudHMiLCJyZW1vdmUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0FBLENBQUMsQ0FBQyxZQUFNO0FBQ04sTUFBSUMsT0FBTyxDQUFDQyxRQUFaLENBQXFCRixDQUFDLENBQUMsMEJBQUQsQ0FBdEIsRUFBb0Q7QUFDbERHLElBQUFBLE1BQU0sRUFBRSxPQUQwQztBQUVsREMsSUFBQUEsSUFBSSxFQUFFO0FBRjRDLEdBQXBEO0FBS0EsTUFBTUMsZUFBZSxHQUFHTCxDQUFDLENBQUMsYUFBRCxDQUF6QjtBQUNBLE1BQU1NLFdBQVcsR0FBR04sQ0FBQyxDQUFDLGVBQUQsQ0FBckI7QUFDQSxNQUFNTyxRQUFRLEdBQUdQLENBQUMsQ0FBQyxVQUFELEVBQWFNLFdBQWIsQ0FBbEI7QUFFQUQsRUFBQUEsZUFBZSxDQUFDRyxFQUFoQixDQUFtQjtBQUNqQkMsSUFBQUEsS0FBSyxFQUFFLGlCQUFNO0FBQ1gsVUFBSUMsS0FBSyxHQUFHSCxRQUFRLENBQUNJLElBQVQsRUFBWjtBQUNBLFVBQU1DLFlBQVksR0FBR1osQ0FBQyxDQUFDLGdDQUFELENBQUQsQ0FBb0NhLElBQXBDLENBQXlDLFVBQXpDLENBQXJCO0FBRUEsVUFBSUMsZUFBZSxHQUFHLENBQXRCOztBQUNBLFVBQUlGLFlBQVksS0FBS0csU0FBckIsRUFBZ0M7QUFDOUJELFFBQUFBLGVBQWUsR0FBR0UsUUFBUSxDQUFDSixZQUFELENBQVIsR0FBeUIsQ0FBM0M7QUFDRDs7QUFFREYsTUFBQUEsS0FBSyxHQUFHQSxLQUFLLENBQUNPLE9BQU4sQ0FBYyxlQUFkLEVBQStCSCxlQUEvQixDQUFSO0FBRUFkLE1BQUFBLENBQUMsQ0FBQyxPQUFELEVBQVVNLFdBQVYsQ0FBRCxDQUF3QlksTUFBeEIsQ0FBK0JSLEtBQS9CO0FBQ0Q7QUFiZ0IsR0FBbkI7QUFnQkFKLEVBQUFBLFdBQVcsQ0FBQ0UsRUFBWixDQUNFO0FBQ0VDLElBQUFBLEtBQUssRUFBRSxpQkFBWTtBQUNqQixVQUFJLENBQUNVLE9BQU8sQ0FBQyxlQUFELENBQVosRUFBK0I7QUFDN0IsZUFBTyxLQUFQO0FBQ0Q7O0FBRURuQixNQUFBQSxDQUFDLENBQUMsSUFBRCxDQUFELENBQVFvQixPQUFSLENBQWdCLFVBQWhCLEVBQTRCQyxNQUE1QjtBQUNEO0FBUEgsR0FERixFQVVFLGNBVkY7QUFZRCxDQXRDQSxDQUFEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gZXNsaW50LWRpc2FibGUgbm8tdW5kZWZcbiQoKCkgPT4ge1xuICBuZXcgR2FybmlzaC5EcmFnU29ydCgkKCcjZmllbGQtc2V0dGluZ3MgdGJvZHkgdHInKSwge1xuICAgIGhhbmRsZTogJy5tb3ZlJyxcbiAgICBheGlzOiAneScsXG4gIH0pO1xuXG4gIGNvbnN0IGFkZEZpbHRlckJ1dHRvbiA9ICQoJyNhZGQtZmlsdGVyJyk7XG4gIGNvbnN0IGZpbHRlclRhYmxlID0gJCgnI2ZpbHRlci10YWJsZScpO1xuICBjb25zdCB0ZW1wbGF0ZSA9ICQoJ3RlbXBsYXRlJywgZmlsdGVyVGFibGUpO1xuXG4gIGFkZEZpbHRlckJ1dHRvbi5vbih7XG4gICAgY2xpY2s6ICgpID0+IHtcbiAgICAgIGxldCBjbG9uZSA9IHRlbXBsYXRlLmh0bWwoKTtcbiAgICAgIGNvbnN0IGxhc3RJdGVyYXRvciA9ICQoJ3Rib2R5ID4gdHJbZGF0YS1pdGVyYXRvcl06bGFzdCcpLmRhdGEoJ2l0ZXJhdG9yJyk7XG5cbiAgICAgIGxldCBjdXJyZW50SXRlcmF0b3IgPSAwO1xuICAgICAgaWYgKGxhc3RJdGVyYXRvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGN1cnJlbnRJdGVyYXRvciA9IHBhcnNlSW50KGxhc3RJdGVyYXRvcikgKyAxO1xuICAgICAgfVxuXG4gICAgICBjbG9uZSA9IGNsb25lLnJlcGxhY2UoL19faXRlcmF0b3JfXy9nLCBjdXJyZW50SXRlcmF0b3IpO1xuXG4gICAgICAkKCd0Ym9keScsIGZpbHRlclRhYmxlKS5hcHBlbmQoY2xvbmUpO1xuICAgIH0sXG4gIH0pO1xuXG4gIGZpbHRlclRhYmxlLm9uKFxuICAgIHtcbiAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghY29uZmlybSgnQXJlIHlvdSBzdXJlPycpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCd0cjpmaXJzdCcpLnJlbW92ZSgpO1xuICAgICAgfSxcbiAgICB9LFxuICAgICcuZGVsZXRlLmljb24nXG4gICk7XG59KTtcbiJdLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9jcC9leHBvcnQtcHJvZmlsZXMvZXhwb3J0LXByb2ZpbGUuanMuanMiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/components/cp/export-profiles/export-profile.js\n");

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