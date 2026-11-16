(() => {
  const t = (message) => Craft.t('freeform', message);
  window.FreeformEditor = {
    name(id) {
      const option = window.FreeformEditorForms?.find((item) => item.value === `freeform:${id}`);
      return option?.label || t('Unavailable form');
    },
    label(id) {
      return `${t('Freeform Form')}: ${this.name(id)}`;
    },
    preview(id, domDocument = document) {
      const preview = domDocument.createElement('div');
      preview.className = 'freeform-editor-preview';
      preview.setAttribute('aria-hidden', 'true');
      const heading = domDocument.createElement('div');
      heading.className = 'freeform-editor-preview-heading';
      const icon = domDocument.createElement('span');
      icon.className = 'freeform-editor-preview-icon';
      icon.innerHTML = window.FreeformEditorSettings?.icon || '';
      const title = domDocument.createElement('span');
      title.className = 'freeform-editor-preview-title';
      title.textContent = this.name(id);
      heading.append(icon, title);
      const fields = domDocument.createElement('div');
      fields.className = 'freeform-editor-preview-fields';
      for (let index = 0; index < 3; index++) {
        const field = domDocument.createElement('div');
        field.className = 'freeform-editor-preview-field';
        const label = domDocument.createElement('span');
        label.className = 'freeform-editor-preview-label';
        const input = domDocument.createElement('span');
        input.className = 'freeform-editor-preview-input';
        field.append(label, input);
        fields.append(field);
      }
      const button = domDocument.createElement('span');
      button.className = 'freeform-editor-preview-button';
      preview.append(heading, fields, button);
      return preview;
    },
    pick(currentId = null, integration = null) {
      if (integration && window.FreeformEditorSettings?.enabled?.[integration] === false) return Promise.resolve(null);
      return new Promise((resolve) => {
        const id = `freeform-picker-${Craft.randomString(10)}`;
        const $modal = $('<div class="modal fitted freeform-editor-picker" role="dialog" aria-modal="true"/>')
          .attr('aria-labelledby', `${id}-heading`).appendTo(document.body);
        const $body = $('<div class="body"/>').appendTo($modal);
        $('<h2/>').attr('id', `${id}-heading`).text(t('Freeform Form')).appendTo($body);
        $('<label/>').attr('for', id).text(t('Select a form')).appendTo($body);
        const $select = $('<select/>').attr('id', id).appendTo($('<div class="select"/>').appendTo($body));
        for (const option of window.FreeformEditorForms || []) {
          $('<option/>').val(option.value).text(option.label).appendTo($select);
        }
        const current = currentId ? `freeform:${currentId}` : '';
        if (current && !$select.find('option').toArray().some((option) => option.value === current)) {
          $('<option/>').val(current).text(t('Unavailable form')).appendTo($select);
        }
        $select.val(current);
        const $buttons = $('<div class="footer"><div class="buttons"/></div>').appendTo($modal).find('.buttons');
        const $cancel = $('<button type="button" class="btn"/>').text(Craft.t('app', 'Cancel')).appendTo($buttons);
        const $choose = $('<button type="button" class="btn submit"/>').text(Craft.t('app', 'Select')).appendTo($buttons);
        let result = null;
        const modal = new Garnish.Modal($modal, {
          closeOtherModals: false,
          onHide() {
            modal.destroy();
            $modal.remove();
            resolve(result);
          },
        });
        const sync = () => $choose.prop('disabled', !/^freeform:[1-9][0-9]*$/.test($select.val()));
        $select.on('change', sync);
        sync();
        $cancel.on('click', () => modal.hide());
        $choose.on('click', () => {
          result = { id: Number($select.val().slice(9)), label: $select.find(':selected').text() };
          modal.hide();
        });
        $select.trigger('focus');
      });
    },
  };
})();
