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

  document.addEventListener('input', function () { send('values'); });
  document.addEventListener('change', function () { send('values'); });
  document.addEventListener('DOMContentLoaded', function () { send('values'); });
  document.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    send('next');
  }, true);
  document.addEventListener('click', function (event) {
    if (!(event.target instanceof Element)) return;
    var control = event.target.closest('button, input[type="submit"], a');
    if (!control) return;
    if (control.tagName === 'A') {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (!control.closest('form[data-freeform]')) return;
    var action = control.getAttribute('data-freeform-action');
    if (action === 'back' || control.hasAttribute('data-freeform-back') || control.name === 'form_previous_page_button') {
      event.preventDefault();
      event.stopImmediatePropagation();
      send('back');
    } else if (action === 'save' || control.hasAttribute('data-freeform-save')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.getElementById('freeform-preview-status').hidden = false;
    } else if (action === 'submit' || control.type === 'submit') {
      event.preventDefault();
      event.stopImmediatePropagation();
      send('next');
    }
  }, true);
})();
