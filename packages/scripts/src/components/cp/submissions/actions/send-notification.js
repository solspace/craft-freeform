// eslint-disable no-undef

window.freeform_notify = (ids) => {
  const content = $('<div id="export-modal-wrapper" class="modal fitted">');

  let form;

  $.ajax({
    url: Craft.getCpUrl('freeform/notifications/send-notification-dialogue'),
    dataType: 'html',
    success: (response) => {
      content.html(response);

      new Garnish.Modal(content);

      form = content.find('form').get(0);

      $('.btn.cancel', content).on({
        click: () => {
          content.remove();
          $('.modal-shade').remove();
        },
      });

      form.addEventListener('submit', (event) => {
        event.stopPropagation();
        event.preventDefault();

        const data = {
          template: form.template.value,
          emails: form.emails.value,
          submissionIds: ids,
          [Craft.csrfTokenName]: Craft.csrfTokenValue,
        };

        $.ajax({
          url: Craft.getCpUrl('freeform/notifications/send-notification'),
          type: 'post',
          data,
          success: () => {
            content.remove();
            $('.modal-shade').remove();

            Craft.cp.displaySuccess(Craft.t('freeform', 'Additional notifications sent successfully.'));
          },
          error: (error) => {
            Craft.cp.displayError(error.responseText);
          },
        });

        return false;
      });
    },
  });
};
