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

eval("var $prefix = $('#prefix');\nvar $components = $('#components-wrapper');\nvar firstFileLists = $('> div > ul.directory-structure', $components);\nvar $submit = $('.btn.submit');\nvar prefixTimeout = null;\n$(function () {\n  $prefix.on({\n    keyup: function keyup() {\n      if (/[\\\\/]/gi.test($prefix.val())) {\n        $prefix.addClass('error');\n        $submit.addClass('disabled').prop('disabled', true).prop('readonly', true);\n      } else {\n        $prefix.removeClass('error');\n        $submit.removeClass('disabled').prop('disabled', false).prop('readonly', false);\n      }\n      clearTimeout(prefixTimeout);\n      prefixTimeout = setTimeout(function () {\n        updateFilePrefixes();\n      }, 50);\n    }\n  });\n  updateFilePrefixes();\n});\nfunction updateFilePrefixes() {\n  firstFileLists.each(function () {\n    var $fileList = $(this);\n    $('> li > span[data-name]', $fileList).each(function () {\n      $(this).html($prefix.val() + $(this).data('name'));\n    });\n  });\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9jcC9jb2RlLXBhY2svaW5kZXguanMiLCJuYW1lcyI6WyIkcHJlZml4IiwiJCIsIiRjb21wb25lbnRzIiwiZmlyc3RGaWxlTGlzdHMiLCIkc3VibWl0IiwicHJlZml4VGltZW91dCIsIm9uIiwia2V5dXAiLCJ0ZXN0IiwidmFsIiwiYWRkQ2xhc3MiLCJwcm9wIiwicmVtb3ZlQ2xhc3MiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwidXBkYXRlRmlsZVByZWZpeGVzIiwiZWFjaCIsIiRmaWxlTGlzdCIsImh0bWwiLCJkYXRhIl0sInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmYvc2NyaXB0cy8uL3NyYy9jb21wb25lbnRzL2NwL2NvZGUtcGFjay9pbmRleC5qcz82ODRkIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0ICRwcmVmaXggPSAkKCcjcHJlZml4Jyk7XG5jb25zdCAkY29tcG9uZW50cyA9ICQoJyNjb21wb25lbnRzLXdyYXBwZXInKTtcbmNvbnN0IGZpcnN0RmlsZUxpc3RzID0gJCgnPiBkaXYgPiB1bC5kaXJlY3Rvcnktc3RydWN0dXJlJywgJGNvbXBvbmVudHMpO1xuY29uc3QgJHN1Ym1pdCA9ICQoJy5idG4uc3VibWl0Jyk7XG5cbmxldCBwcmVmaXhUaW1lb3V0ID0gbnVsbDtcblxuJChmdW5jdGlvbiAoKSB7XG4gICRwcmVmaXgub24oe1xuICAgIGtleXVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoL1tcXFxcL10vZ2kudGVzdCgkcHJlZml4LnZhbCgpKSkge1xuICAgICAgICAkcHJlZml4LmFkZENsYXNzKCdlcnJvcicpO1xuICAgICAgICAkc3VibWl0LmFkZENsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSkucHJvcCgncmVhZG9ubHknLCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRwcmVmaXgucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICAgICRzdWJtaXQucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSkucHJvcCgncmVhZG9ubHknLCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIGNsZWFyVGltZW91dChwcmVmaXhUaW1lb3V0KTtcbiAgICAgIHByZWZpeFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdXBkYXRlRmlsZVByZWZpeGVzKCk7XG4gICAgICB9LCA1MCk7XG4gICAgfSxcbiAgfSk7XG5cbiAgdXBkYXRlRmlsZVByZWZpeGVzKCk7XG59KTtcblxuZnVuY3Rpb24gdXBkYXRlRmlsZVByZWZpeGVzKCkge1xuICBmaXJzdEZpbGVMaXN0cy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCAkZmlsZUxpc3QgPSAkKHRoaXMpO1xuICAgICQoJz4gbGkgPiBzcGFuW2RhdGEtbmFtZV0nLCAkZmlsZUxpc3QpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgJCh0aGlzKS5odG1sKCRwcmVmaXgudmFsKCkgKyAkKHRoaXMpLmRhdGEoJ25hbWUnKSk7XG4gICAgfSk7XG4gIH0pO1xufVxuIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFNQSxPQUFPLEdBQUdDLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDNUIsSUFBTUMsV0FBVyxHQUFHRCxDQUFDLENBQUMscUJBQXFCLENBQUM7QUFDNUMsSUFBTUUsY0FBYyxHQUFHRixDQUFDLENBQUMsZ0NBQWdDLEVBQUVDLFdBQVcsQ0FBQztBQUN2RSxJQUFNRSxPQUFPLEdBQUdILENBQUMsQ0FBQyxhQUFhLENBQUM7QUFFaEMsSUFBSUksYUFBYSxHQUFHLElBQUk7QUFFeEJKLENBQUMsQ0FBQyxZQUFZO0VBQ1pELE9BQU8sQ0FBQ00sRUFBRSxDQUFDO0lBQ1RDLEtBQUssRUFBRSxTQUFQQSxLQUFLQSxDQUFBLEVBQWM7TUFDakIsSUFBSSxTQUFTLENBQUNDLElBQUksQ0FBQ1IsT0FBTyxDQUFDUyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDakNULE9BQU8sQ0FBQ1UsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUN6Qk4sT0FBTyxDQUFDTSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUNDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUNBLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDO01BQzVFLENBQUMsTUFBTTtRQUNMWCxPQUFPLENBQUNZLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDNUJSLE9BQU8sQ0FBQ1EsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDRCxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDQSxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQztNQUNqRjtNQUVBRSxZQUFZLENBQUNSLGFBQWEsQ0FBQztNQUMzQkEsYUFBYSxHQUFHUyxVQUFVLENBQUMsWUFBWTtRQUNyQ0Msa0JBQWtCLENBQUMsQ0FBQztNQUN0QixDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQ1I7RUFDRixDQUFDLENBQUM7RUFFRkEsa0JBQWtCLENBQUMsQ0FBQztBQUN0QixDQUFDLENBQUM7QUFFRixTQUFTQSxrQkFBa0JBLENBQUEsRUFBRztFQUM1QlosY0FBYyxDQUFDYSxJQUFJLENBQUMsWUFBWTtJQUM5QixJQUFNQyxTQUFTLEdBQUdoQixDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3pCQSxDQUFDLENBQUMsd0JBQXdCLEVBQUVnQixTQUFTLENBQUMsQ0FBQ0QsSUFBSSxDQUFDLFlBQVk7TUFDdERmLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQ2lCLElBQUksQ0FBQ2xCLE9BQU8sQ0FBQ1MsR0FBRyxDQUFDLENBQUMsR0FBR1IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BELENBQUMsQ0FBQztFQUNKLENBQUMsQ0FBQztBQUNKIiwiaWdub3JlTGlzdCI6W119\n//# sourceURL=webpack-internal:///./src/components/cp/code-pack/index.js\n");

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