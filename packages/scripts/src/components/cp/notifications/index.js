$(() => {
  $('.action-buttons .clone').on({
    click: (event) => {
      const button = $(event.target);
      const id = button.data('id');

      $.ajax({
        url: Craft.getCpUrl('freeform/notifications/duplicate'),
        type: 'POST',
        dataType: 'json',
        data: {
          id,
          [Craft.csrfTokenName]: Craft.csrfTokenValue,
        },
        success: (response) => {
          if (response.success) {
            window.location.reload();
          }
        },
      });
    },
  });
});
