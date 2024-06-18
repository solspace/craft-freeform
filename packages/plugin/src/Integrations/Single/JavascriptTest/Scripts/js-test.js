var form = document.querySelector('form[data-id="{{ id }}"]');
var jsTest = function (event) {
  event.form.querySelector('[data-ff-check] + input[name]').value = '';
}

document.addEventListener('freeform-ready', jsTest);
document.addEventListener('freeform-ajax-after-submit', jsTest);
