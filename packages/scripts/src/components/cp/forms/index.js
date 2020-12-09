// eslint-disable no-undef
$(function () {
  $('.clone').on({
    click: (event) => {
      const { id } = event.target.dataset;

      $.ajax({
        url: Craft.getActionUrl('freeform/forms/duplicate'),
        type: 'post',
        dataType: 'json',
        data: {
          id,
          [Craft.csrfTokenName]: Craft.csrfTokenValue,
        },
        success: (response) => {
          if (response.success) {
            window.location.reload();
          }

          if (response.errors) {
            response.errors.forEach((error) => Craft.cp.displayNotification('error', error));
          }
        },
      });
    },
  });

  $('.reset-spam-count').on({
    click: function () {
      const msg = $(this).data('confirm-message');

      if (!confirm(msg)) {
        return false;
      }

      const formId = $(this).data('form-id');
      const data = {
        formId: formId,
      };

      data[Craft.csrfTokenName] = Craft.csrfTokenValue;

      $.ajax({
        url: Craft.getActionUrl('freeform/forms/reset-spam-counter'),
        type: 'post',
        data: data,
        dataType: 'json',
        success: function (response) {
          if (response.error) {
            Craft.cp.displayNotification('error', response.error);
          } else if (response.success) {
            $('td.spam-count[data-form-id=' + formId + '] > span').html(0);
          }
        },
      });
    },
  });
});
