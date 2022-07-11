$(() => {
  $('.action-buttons .clone').on({
    click: (event) => {
      const button = $(event.target);
      const { id, type } = button.data();

      $.ajax({
        url: Craft.getCpUrl(`freeform/notifications/${type}/duplicate`),
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

  $('[data-file-templates] a.delete[data-id]').on({
    click: (event) => {
      const button = $(event.target);
      const { id, type } = button.data();

      if (!confirm(confirmDeleteMessage)) {
        return;
      }

      $.ajax({
        url: Craft.getCpUrl(`freeform/notifications/${type}/delete`),
        type: 'POST',
        dataType: 'json',
        data: {
          id,
          [Craft.csrfTokenName]: Craft.csrfTokenValue,
        },
        success: (response) => {
          if (response.success) {
            button.parents('tr:first').remove();
          }
        },
      });
    },
  });
});
