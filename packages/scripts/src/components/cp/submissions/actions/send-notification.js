// eslint-disable no-undef

window.freeform_notify = (ids) => {
  const content = $('<div id="export-modal-wrapper" class="modal fitted">');
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

      $('.btn.cancel', modal).on({
        click: () => {
          modal.data('modal').hide();
        },
      });
    },
  });

  exportWrapper.data('modal', modal);

  let form;

  $.ajax({
    url: Craft.getCpUrl('freeform/notifications/send-notification-dialogue'),
    async: false,
    cache: false,
    dataType: 'html',
    success: (response) => {
      content.html(response);
      form = content.find('form').get(0);
    },
  });

  form.addEventListener('submit', (event) => {
    event.stopPropagation();
    event.preventDefault();

    const data = {
      template: form.template.value,
      emails: form.emails.value,
      submissionIds: ids,
    };

    $.ajax({
      url: Craft.getCpUrl('freeform/notifications/send-notification'),
      type: 'post',
      data,
      success: () => {
        $('#export-modal-wrapper').remove();
        $('.modal-shade').remove();
        modal.data('modal').hide();
      },
      error: (error) => {
        console.log(error);
        alert(error.responseText);
      },
    });

    return false;
  });
};
