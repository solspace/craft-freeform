var form = document.querySelector('form[data-id="{{ id }}"]');
var jsTest = function (event) {
  event.form.querySelector('input[name="{{ name }}"]').value = '';
}

form.addEventListener('freeform-ready', jsTest);
form.addEventListener('freeform-ajax-after-submit', jsTest);
