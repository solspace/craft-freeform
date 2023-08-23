const events = {
  form: {
    ready: 'freeform-ready',
    onReset: 'freeform-on-reset',
    onSubmit: 'freeform-on-submit',
    removeMessages: 'freeform-remove-messages',
    fieldRemoveMessages: 'freeform-remove-field-messages',
    renderSuccess: 'freeform-render-success',
    renderFieldErrors: 'freeform-render-field-errors',
    renderFormErrors: 'freeform-render-form-errors',
    ajaxSuccess: 'freeform-ajax-success',
    ajaxError: 'freeform-ajax-error',
    ajaxBeforeSubmit: 'freeform-ajax-before-submit',
    ajaxAfterSubmit: 'freeform-ajax-after-submit',
    handleActions: 'freeform-handle-actions',
  } as const,
  table: {
    onAddRow: 'freeform-field-table-on-add-row',
    afterRowAdded: 'freeform-field-table-after-row-added',
    onRemoveRow: 'freeform-field-table-on-remove-row',
    afterRemoveRow: 'freeform-field-table-after-remove-row',
  } as const,
  dragAndDrop: {
    renderPreview: 'freeform-field-dnd-on-render-preview',
    renderPreviewRemoveButton: 'freeform-field-dnd-on-render-preview-remove-button',
    renderErrorContainer: 'freeform-field-dnd-render-error-container',
    showGlobalMessage: 'freeform-field-dnd-show-global-message',
    appendErrors: 'freeform-field-dnd-append-errors',
    clearErrors: 'freeform-field-dnd-clear-errors',
    onChange: 'freeform-field-dnd-on-change',
    onUploadProgress: 'freeform-field-dnd-on-upload-progress',
  } as const,
  saveAndContinue: {
    saveFormhandleToken: 'freeform-save-form-handle-token',
  } as const,
} as const;

export default events;
