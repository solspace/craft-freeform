(function () {
  var config = JSON.parse(document.getElementById('freeform-preview-config').textContent);
  var handles = new Set(config.handles);
  var encoder = new TextEncoder();

  function answers() {
    var form = document.querySelector('form[data-freeform]');
    var values = Object.create(null);
    var size = 2;
    if (!form) return values;
    var data = new FormData(form);
    Array.from(form.elements).forEach(function (input) {
      if (!input.name || input.type === 'file' || input.type === 'submit' || input.type === 'button') return;
      var name = input.name;
      var handle = name.replace(/\[\]$/, '');
      if (!handles.has(handle)) return;
      if (Object.prototype.hasOwnProperty.call(values, handle)) return;
      var items = data.getAll(name).filter(function (value) { return typeof value === 'string'; });
      if (items.length > 100 || items.some(function (value) { return encoder.encode(value).length > 10000; })) return;
      var value = name.endsWith('[]') || input.multiple ? items : (items[items.length - 1] || '');
      var bytes = encoder.encode(JSON.stringify(handle) + ':' + JSON.stringify(value)).length + 1;
      if (size + bytes > 65000) return;
      size += bytes;
      values[handle] = value;
    });
    return values;
  }

  function send(action) {
    window.parent.postMessage({type: 'freeform-preview', channel: config.channel, action: action, values: answers()}, config.parentOrigin);
  }

  function showNotice() {
    var status = document.getElementById('freeform-preview-status');
    if (status) status.hidden = false;
  }

  function advance() {
    if (config.hasNextPage === true) send('next');
    else showNotice();
  }

  function isBack(control) {
    return control.getAttribute('data-freeform-action') === 'back' || control.hasAttribute('data-freeform-back') || control.name === 'form_previous_page_button';
  }

  function isSave(control) {
    return control.getAttribute('data-freeform-action') === 'save' || control.hasAttribute('data-freeform-save');
  }

  function isSubmit(control) {
    return control.getAttribute('data-freeform-action') === 'submit' || control.type === 'submit' || control.type === 'image';
  }

  function isPreviewControl(control) {
    var form = control.form || control.closest('form[data-freeform]');
    return form && form.matches('form[data-freeform]');
  }

  document.addEventListener('input', function () { send('values'); });
  document.addEventListener('change', function () { send('values'); });
  document.addEventListener('DOMContentLoaded', function () {
    if (config.hasNextPage !== true) {
      document.querySelectorAll('button, input[type="submit"], input[type="image"]').forEach(function (control) {
        if (isPreviewControl(control) && isSubmit(control) && !isBack(control) && !isSave(control)) {
          control.disabled = true;
          control.setAttribute('aria-disabled', 'true');
        }
      });
    }
    send('values');
  });
  document.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    advance();
  }, true);
  document.addEventListener('click', function (event) {
    if (!(event.target instanceof Element)) return;
    var control = event.target.closest('button, input[type="submit"], input[type="image"], a');
    if (!control) return;
    if (control.tagName === 'A') {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (!isPreviewControl(control)) return;
    if (isBack(control)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      send('back');
    } else if (isSave(control)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showNotice();
    } else if (isSubmit(control)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      advance();
    }
  }, true);
})();
