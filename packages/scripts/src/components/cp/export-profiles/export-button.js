// eslint-disable no-undef

const toolbarTable = $('#toolbar');
const button = $(`
<div>
  <div class="btn" id="quick-export" tabindex="1" role="combobox">
    ${Craft.t('freeform', 'Quick Export')}
  </div>
</div>
`);
toolbarTable.prepend(button);

$('div.btn', button).on({
  click: function () {
    const selectedSource = $('#sidebar').find('li a[data-key].sel').data('key');

    let formId = null;
    if (/^form:\d+/i.test(selectedSource)) {
      formId = parseInt(selectedSource.replace('form:', ''));
    }

    $.ajax({
      url: Craft.getCpUrl('freeform/export/export-dialogue'),
      type: 'get',
      data: {
        formId,
      },
      success: (response) => {
        const content = $('<div id="export-modal-wrapper" class="modal fitted">');
        content.html(response);

        const exportWrapper = $('#export-modal-wrapper');

        const modal = new Garnish.Modal(content, {
          onHide: () => {
            setTimeout(() => {
              $('#export-modal-wrapper').remove();
              $('.modal-shade').remove();
            }, 10);
          },
          onShow: () => {
            const modal = $('#export-modal-wrapper');

            $('.checkbox-select', modal).each(function () {
              if (!$(this).data('dragger')) {
                $(this).data('dragger', true);
                new Garnish.DragSort($('div', $(this)), {
                  handle: '.move',
                  axis: 'y',
                });
              }
            });

            $('.btn.submit', modal).on({
              click: () => {
                modal.data('modal').hide();
              },
            });
            $('.btn.cancel', modal).on({
              click: () => {
                modal.data('modal').hide();
              },
            });

            const formSelector = $('select[name=form_id]', modal);
            formSelector.on({
              change: function () {
                const val = $(this).val();

                $('.form-field-list').addClass('hidden');
                $('.form-field-list[data-id=' + val + ']').removeClass('hidden');
              },
            });
          },
        });

        exportWrapper.data('modal', modal);
      },
    });
  },
});
