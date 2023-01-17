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

/***/ "./src/components/cp/code-pack/index.js":
/*!**********************************************!*\
  !*** ./src/components/cp/code-pack/index.js ***!
  \**********************************************/
/***/ (function() {

eval("var $prefix = $('#prefix');\nvar $components = $('#components-wrapper');\nvar firstFileLists = $('> div > ul.directory-structure', $components);\nvar $submit = $('.btn.submit');\nvar prefixTimeout = null;\n$(function () {\n  $prefix.on({\n    keyup: function keyup() {\n      if (/[\\\\/]/gi.test($prefix.val())) {\n        $prefix.addClass('error');\n        $submit.addClass('disabled').prop('disabled', true).prop('readonly', true);\n      } else {\n        $prefix.removeClass('error');\n        $submit.removeClass('disabled').prop('disabled', false).prop('readonly', false);\n      }\n\n      clearTimeout(prefixTimeout);\n      prefixTimeout = setTimeout(function () {\n        updateFilePrefixes();\n      }, 50);\n    }\n  });\n  updateFilePrefixes();\n});\n\nfunction updateFilePrefixes() {\n  firstFileLists.each(function () {\n    var $fileList = $(this);\n    $('> li > span[data-name]', $fileList).each(function () {\n      $(this).html($prefix.val() + $(this).data('name'));\n    });\n  });\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmYvc2NyaXB0cy8uL3NyYy9jb21wb25lbnRzL2NwL2NvZGUtcGFjay9pbmRleC5qcz82ODRkIl0sIm5hbWVzIjpbIiRwcmVmaXgiLCIkIiwiJGNvbXBvbmVudHMiLCJmaXJzdEZpbGVMaXN0cyIsIiRzdWJtaXQiLCJwcmVmaXhUaW1lb3V0Iiwib24iLCJrZXl1cCIsInRlc3QiLCJ2YWwiLCJhZGRDbGFzcyIsInByb3AiLCJyZW1vdmVDbGFzcyIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJ1cGRhdGVGaWxlUHJlZml4ZXMiLCJlYWNoIiwiJGZpbGVMaXN0IiwiaHRtbCIsImRhdGEiXSwibWFwcGluZ3MiOiJBQUFBLElBQU1BLE9BQU8sR0FBR0MsQ0FBQyxDQUFDLFNBQUQsQ0FBakI7QUFDQSxJQUFNQyxXQUFXLEdBQUdELENBQUMsQ0FBQyxxQkFBRCxDQUFyQjtBQUNBLElBQU1FLGNBQWMsR0FBR0YsQ0FBQyxDQUFDLGdDQUFELEVBQW1DQyxXQUFuQyxDQUF4QjtBQUNBLElBQU1FLE9BQU8sR0FBR0gsQ0FBQyxDQUFDLGFBQUQsQ0FBakI7QUFFQSxJQUFJSSxhQUFhLEdBQUcsSUFBcEI7QUFFQUosQ0FBQyxDQUFDLFlBQVk7QUFDWkQsRUFBQUEsT0FBTyxDQUFDTSxFQUFSLENBQVc7QUFDVEMsSUFBQUEsS0FBSyxFQUFFLGlCQUFZO0FBQ2pCLFVBQUksVUFBVUMsSUFBVixDQUFlUixPQUFPLENBQUNTLEdBQVIsRUFBZixDQUFKLEVBQW1DO0FBQ2pDVCxRQUFBQSxPQUFPLENBQUNVLFFBQVIsQ0FBaUIsT0FBakI7QUFDQU4sUUFBQUEsT0FBTyxDQUFDTSxRQUFSLENBQWlCLFVBQWpCLEVBQTZCQyxJQUE3QixDQUFrQyxVQUFsQyxFQUE4QyxJQUE5QyxFQUFvREEsSUFBcEQsQ0FBeUQsVUFBekQsRUFBcUUsSUFBckU7QUFDRCxPQUhELE1BR087QUFDTFgsUUFBQUEsT0FBTyxDQUFDWSxXQUFSLENBQW9CLE9BQXBCO0FBQ0FSLFFBQUFBLE9BQU8sQ0FBQ1EsV0FBUixDQUFvQixVQUFwQixFQUFnQ0QsSUFBaEMsQ0FBcUMsVUFBckMsRUFBaUQsS0FBakQsRUFBd0RBLElBQXhELENBQTZELFVBQTdELEVBQXlFLEtBQXpFO0FBQ0Q7O0FBRURFLE1BQUFBLFlBQVksQ0FBQ1IsYUFBRCxDQUFaO0FBQ0FBLE1BQUFBLGFBQWEsR0FBR1MsVUFBVSxDQUFDLFlBQVk7QUFDckNDLFFBQUFBLGtCQUFrQjtBQUNuQixPQUZ5QixFQUV2QixFQUZ1QixDQUExQjtBQUdEO0FBZFEsR0FBWDtBQWlCQUEsRUFBQUEsa0JBQWtCO0FBQ25CLENBbkJBLENBQUQ7O0FBcUJBLFNBQVNBLGtCQUFULEdBQThCO0FBQzVCWixFQUFBQSxjQUFjLENBQUNhLElBQWYsQ0FBb0IsWUFBWTtBQUM5QixRQUFNQyxTQUFTLEdBQUdoQixDQUFDLENBQUMsSUFBRCxDQUFuQjtBQUNBQSxJQUFBQSxDQUFDLENBQUMsd0JBQUQsRUFBMkJnQixTQUEzQixDQUFELENBQXVDRCxJQUF2QyxDQUE0QyxZQUFZO0FBQ3REZixNQUFBQSxDQUFDLENBQUMsSUFBRCxDQUFELENBQVFpQixJQUFSLENBQWFsQixPQUFPLENBQUNTLEdBQVIsS0FBZ0JSLENBQUMsQ0FBQyxJQUFELENBQUQsQ0FBUWtCLElBQVIsQ0FBYSxNQUFiLENBQTdCO0FBQ0QsS0FGRDtBQUdELEdBTEQ7QUFNRCIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0ICRwcmVmaXggPSAkKCcjcHJlZml4Jyk7XG5jb25zdCAkY29tcG9uZW50cyA9ICQoJyNjb21wb25lbnRzLXdyYXBwZXInKTtcbmNvbnN0IGZpcnN0RmlsZUxpc3RzID0gJCgnPiBkaXYgPiB1bC5kaXJlY3Rvcnktc3RydWN0dXJlJywgJGNvbXBvbmVudHMpO1xuY29uc3QgJHN1Ym1pdCA9ICQoJy5idG4uc3VibWl0Jyk7XG5cbmxldCBwcmVmaXhUaW1lb3V0ID0gbnVsbDtcblxuJChmdW5jdGlvbiAoKSB7XG4gICRwcmVmaXgub24oe1xuICAgIGtleXVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoL1tcXFxcL10vZ2kudGVzdCgkcHJlZml4LnZhbCgpKSkge1xuICAgICAgICAkcHJlZml4LmFkZENsYXNzKCdlcnJvcicpO1xuICAgICAgICAkc3VibWl0LmFkZENsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSkucHJvcCgncmVhZG9ubHknLCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRwcmVmaXgucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICAgICRzdWJtaXQucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSkucHJvcCgncmVhZG9ubHknLCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIGNsZWFyVGltZW91dChwcmVmaXhUaW1lb3V0KTtcbiAgICAgIHByZWZpeFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdXBkYXRlRmlsZVByZWZpeGVzKCk7XG4gICAgICB9LCA1MCk7XG4gICAgfSxcbiAgfSk7XG5cbiAgdXBkYXRlRmlsZVByZWZpeGVzKCk7XG59KTtcblxuZnVuY3Rpb24gdXBkYXRlRmlsZVByZWZpeGVzKCkge1xuICBmaXJzdEZpbGVMaXN0cy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCAkZmlsZUxpc3QgPSAkKHRoaXMpO1xuICAgICQoJz4gbGkgPiBzcGFuW2RhdGEtbmFtZV0nLCAkZmlsZUxpc3QpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgJCh0aGlzKS5odG1sKCRwcmVmaXgudmFsKCkgKyAkKHRoaXMpLmRhdGEoJ25hbWUnKSk7XG4gICAgfSk7XG4gIH0pO1xufVxuIl0sImZpbGUiOiIuL3NyYy9jb21wb25lbnRzL2NwL2NvZGUtcGFjay9pbmRleC5qcy5qcyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/components/cp/code-pack/index.js\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/components/cp/code-pack/index.js"]();
/******/ 	
/******/ })()
;