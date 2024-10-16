var jsTest = function (event) {
  var form = event.form;
  var input = form.querySelector('[data-ff-check] + input[name]');
  if (!input) {
    return;
  }

  input.value = '';
}

document.addEventListener('freeform-ready', jsTest);
document.addEventListener('freeform-ajax-after-submit', jsTest);
