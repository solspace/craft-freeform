import { Plugin, ButtonView, Widget, toWidget } from 'ckeditor5';

export class FreeformForm extends Plugin {
  static get pluginName() { return 'FreeformForm'; }
  static get requires() { return [Widget]; }

  init() {
    const editor = this.editor;
    editor.model.schema.register('freeformForm', { inheritAllFrom: '$blockObject', allowAttributes: ['formId'] });
    editor.conversion.for('upcast').elementToElement({
      view: { name: 'div', attributes: { 'data-freeform-form': /^[1-9][0-9]*$/ } },
      model: (element, { writer }) => writer.createElement('freeformForm', { formId: element.getAttribute('data-freeform-form') }),
    });
    editor.conversion.for('dataDowncast').elementToElement({
      model: { name: 'freeformForm', attributes: ['formId'] },
      view: (element, { writer }) => writer.createEmptyElement('div', { 'data-freeform-form': element.getAttribute('formId') }),
    });
    editor.conversion.for('editingDowncast').elementToElement({
      model: { name: 'freeformForm', attributes: ['formId'] },
      view: (element, { writer }) => {
        const formId = element.getAttribute('formId');
        const label = window.FreeformEditor.label(formId);
        const view = writer.createContainerElement('div', { class: 'freeform-editor-form' });
        const preview = writer.createUIElement('div', {}, (domDocument) => window.FreeformEditor.preview(formId, domDocument));
        writer.insert(writer.createPositionAt(view, 0), preview);
        return toWidget(view, writer, { label });
      },
    });
    editor.ui.componentFactory.add('freeformForm', (locale) => {
      const button = new ButtonView(locale);
      const enabled = window.FreeformEditorSettings?.enabled?.ckeditor !== false;
      button.set({ label: Craft.t('freeform', 'Freeform Form'), icon: window.FreeformEditorSettings?.icon, tooltip: true, isVisible: enabled });
      button.bind('isEnabled').to(editor, 'isReadOnly', (readOnly) => !readOnly && enabled);
      this.listenTo(button, 'execute', async () => {
        const selected = editor.model.document.selection.getSelectedElement();
        const existing = selected?.is('element', 'freeformForm') ? selected : null;
        const choice = await window.FreeformEditor.pick(existing?.getAttribute('formId'), 'ckeditor');
        if (choice && !editor.isReadOnly) {
          editor.model.change((writer) => {
            if (existing && existing.root.rootName !== '$graveyard') {
              writer.setAttribute('formId', String(choice.id), existing);
            } else {
              editor.model.insertObject(writer.createElement('freeformForm', { formId: String(choice.id) }), null, null, { setSelection: 'on' });
            }
          });
        }
        editor.editing.view.focus();
      });
      return button;
    });
  }
}
