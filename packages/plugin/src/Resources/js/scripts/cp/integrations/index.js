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

/***/ "./src/components/cp/integrations/index.ts":
/*!*************************************************!*\
  !*** ./src/components/cp/integrations/index.ts ***!
  \*************************************************/
/***/ (function() {

eval("// eslint-disable no-undef\n$(function () {\n    var $classSelector = $('[name=class]');\n    $classSelector.on({\n        change: function () {\n            var val = $(this).val();\n            val = val.split('\\\\').join('');\n            $('div#properties-' + val)\n                .show()\n                .siblings()\n                .hide();\n        },\n    });\n    $classSelector.trigger('change');\n    var $name = $('#name');\n    if ($name.get(0) && !$name.val().length) {\n        $name.on({\n            keyup: function () {\n                $('#handle')\n                    .val(generateHandle($(this).val()))\n                    .trigger('change');\n            },\n        });\n    }\n});\nvar generateHandle = function (value) {\n    // Remove HTML tags\n    var handle = value.replace('/<(.*?)>/g', '');\n    // Remove inner-word punctuation\n    handle = handle.replace(/['\"‘’“”[\\](){}:]/g, '');\n    // Make it lowercase\n    handle = handle.toLowerCase();\n    // Convert extended ASCII characters to basic ASCII\n    handle = Craft.asciiString(handle);\n    // Handle must start with a letter\n    handle = handle.replace(/^[^a-z]+/, '');\n    // Get the \"words\"\n    var words = Craft.filterArray(handle.split(/[^a-z0-9]+/));\n    handle = '';\n    // Make it camelCase\n    for (var i = 0; i < words.length; i++) {\n        if (i === 0) {\n            handle += words[i];\n        }\n        else {\n            handle += words[i].charAt(0).toUpperCase() + words[i].substr(1);\n        }\n    }\n    return handle;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9jcC9pbnRlZ3JhdGlvbnMvaW5kZXgudHMiLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isa0JBQWtCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL0BmZi9zY3JpcHRzLy4vc3JjL2NvbXBvbmVudHMvY3AvaW50ZWdyYXRpb25zL2luZGV4LnRzP2JlYjQiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gZXNsaW50LWRpc2FibGUgbm8tdW5kZWZcbiQoZnVuY3Rpb24gKCkge1xuICAgIHZhciAkY2xhc3NTZWxlY3RvciA9ICQoJ1tuYW1lPWNsYXNzXScpO1xuICAgICRjbGFzc1NlbGVjdG9yLm9uKHtcbiAgICAgICAgY2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gJCh0aGlzKS52YWwoKTtcbiAgICAgICAgICAgIHZhbCA9IHZhbC5zcGxpdCgnXFxcXCcpLmpvaW4oJycpO1xuICAgICAgICAgICAgJCgnZGl2I3Byb3BlcnRpZXMtJyArIHZhbClcbiAgICAgICAgICAgICAgICAuc2hvdygpXG4gICAgICAgICAgICAgICAgLnNpYmxpbmdzKClcbiAgICAgICAgICAgICAgICAuaGlkZSgpO1xuICAgICAgICB9LFxuICAgIH0pO1xuICAgICRjbGFzc1NlbGVjdG9yLnRyaWdnZXIoJ2NoYW5nZScpO1xuICAgIHZhciAkbmFtZSA9ICQoJyNuYW1lJyk7XG4gICAgaWYgKCRuYW1lLmdldCgwKSAmJiAhJG5hbWUudmFsKCkubGVuZ3RoKSB7XG4gICAgICAgICRuYW1lLm9uKHtcbiAgICAgICAgICAgIGtleXVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJCgnI2hhbmRsZScpXG4gICAgICAgICAgICAgICAgICAgIC52YWwoZ2VuZXJhdGVIYW5kbGUoJCh0aGlzKS52YWwoKSkpXG4gICAgICAgICAgICAgICAgICAgIC50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xudmFyIGdlbmVyYXRlSGFuZGxlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8gUmVtb3ZlIEhUTUwgdGFnc1xuICAgIHZhciBoYW5kbGUgPSB2YWx1ZS5yZXBsYWNlKCcvPCguKj8pPi9nJywgJycpO1xuICAgIC8vIFJlbW92ZSBpbm5lci13b3JkIHB1bmN0dWF0aW9uXG4gICAgaGFuZGxlID0gaGFuZGxlLnJlcGxhY2UoL1snXCLigJjigJnigJzigJ1bXFxdKCl7fTpdL2csICcnKTtcbiAgICAvLyBNYWtlIGl0IGxvd2VyY2FzZVxuICAgIGhhbmRsZSA9IGhhbmRsZS50b0xvd2VyQ2FzZSgpO1xuICAgIC8vIENvbnZlcnQgZXh0ZW5kZWQgQVNDSUkgY2hhcmFjdGVycyB0byBiYXNpYyBBU0NJSVxuICAgIGhhbmRsZSA9IENyYWZ0LmFzY2lpU3RyaW5nKGhhbmRsZSk7XG4gICAgLy8gSGFuZGxlIG11c3Qgc3RhcnQgd2l0aCBhIGxldHRlclxuICAgIGhhbmRsZSA9IGhhbmRsZS5yZXBsYWNlKC9eW15hLXpdKy8sICcnKTtcbiAgICAvLyBHZXQgdGhlIFwid29yZHNcIlxuICAgIHZhciB3b3JkcyA9IENyYWZ0LmZpbHRlckFycmF5KGhhbmRsZS5zcGxpdCgvW15hLXowLTldKy8pKTtcbiAgICBoYW5kbGUgPSAnJztcbiAgICAvLyBNYWtlIGl0IGNhbWVsQ2FzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIGhhbmRsZSArPSB3b3Jkc1tpXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZSArPSB3b3Jkc1tpXS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHdvcmRzW2ldLnN1YnN0cigxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaGFuZGxlO1xufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/components/cp/integrations/index.ts\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/components/cp/integrations/index.ts"]();
/******/ 	
/******/ })()
;