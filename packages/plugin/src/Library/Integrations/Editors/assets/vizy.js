(() => {
  function register() {
    const { Node } = Craft.Vizy.tiptap.core;
    const FreeformForm = Node.create({
      name: 'freeformForm',
      group: 'block',
      atom: true,
      draggable: true,
      addAttributes() { return { formId: { default: null } }; },
      parseHTML() {
        return [{ tag: 'div[data-freeform-form]', getAttrs: (element) => ({ formId: Number(element.dataset.freeformForm) || null }) }];
      },
      renderHTML({ node }) { return ['div', { 'data-freeform-form': node.attrs.formId }]; },
      addNodeView() {
        return ({ node }) => {
          const dom = document.createElement('div');
          dom.className = 'freeform-editor-form';
          dom.contentEditable = 'false';
          dom.setAttribute('role', 'group');
          dom.setAttribute('aria-label', window.FreeformEditor.label(node.attrs.formId));
          dom.append(window.FreeformEditor.preview(node.attrs.formId));
          return { dom };
        };
      },
    });
    Craft.Vizy.registerModule('solspace/freeform/form', () => FreeformForm);
    Craft.Vizy.registerControl('freeformForm', {
      async run(editor) {
        if (window.FreeformEditorSettings?.enabled?.vizy === false) return false;
        const { selection } = editor.state;
        const existing = selection.node?.type.name === 'freeformForm';
        const choice = await window.FreeformEditor.pick(existing ? selection.node.attrs.formId : null, 'vizy');
        if (editor.isDestroyed) return;
        if (choice && editor.isEditable) {
          if (existing) editor.chain().focus().updateAttributes('freeformForm', { formId: choice.id }).run();
          else editor.chain().focus().insertContent({ type: 'freeformForm', attrs: { formId: choice.id } }).run();
        } else editor.commands.focus();
      },
      isActive: (editor) => editor.isActive('freeformForm'),
      isVisible: () => window.FreeformEditorSettings?.enabled?.vizy !== false,
    });
  }
  if (window.Craft?.Vizy?.registerModule) register();
  else document.addEventListener('vizy:register', register, { once: true });
})();
