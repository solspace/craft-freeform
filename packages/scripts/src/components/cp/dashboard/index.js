// eslint-disable no-undef
(function () {
  'use strict';

  $('.card-actions a.delete-form').on({
    click: function (event) {
      const { id, message } = event.target.dataset;

      if (confirm(message)) {
        $.ajax({
          type: 'post',
          url: Craft.getCpUrl('freeform/forms/delete'),
          data: {
            [Craft.csrfTokenName]: Craft.csrfTokenValue,
            id,
          },
          success: ({ error = null }) => {
            if (error) {
              Craft.cp.displayError(error);
              return;
            }
            $(event.target).parents('li[data-id]').remove();
          },
          error: (response) => {
            Craft.cp.displayError(response);
          },
        });
      }
    },
  });

  $('.card-actions a.duplicate-form').on({
    click: function (event) {
      const { id, message } = event.target.dataset;

      if (confirm(message)) {
        $.ajax({
          type: 'post',
          url: Craft.getCpUrl('freeform/forms/duplicate'),
          data: {
            [Craft.csrfTokenName]: Craft.csrfTokenValue,
            id,
          },
          success: ({ errors = [] }) => {
            if (errors.length) {
              errors.forEach((error) => Craft.cp.displayError(error));

              return;
            }

            window.location.reload();
          },
          error: (response) => {
            Craft.cp.displayError(response.message);
          },
        });
      }
    },
  });

  const cardGrid = document.getElementById('form-cards');
  if (cardGrid) {
    const sortable = new Sortable.default(cardGrid, {
      draggable: 'li[data-id]',
      handle: '.drag-handle',
    });

    sortable.on('sortable:stop', () => {
      setTimeout(() => {
        const order = [...document.querySelectorAll('#form-cards > li')].map((item) => item.dataset.id);

        $.ajax({
          type: 'post',
          url: Craft.getCpUrl('freeform/forms/sort'),
          data: {
            [Craft.csrfTokenName]: Craft.csrfTokenValue,
            order,
          },
        });
      }, 100);
    });
  }

  $('a.reset-spam').on({
    click: function () {
      const { id, message } = $(this).data();
      const self = $(this);

      if (!confirm(message)) {
        return false;
      }

      $.ajax({
        url: Craft.getCpUrl('freeform/forms/reset-spam-counter'),
        type: 'post',
        dataType: 'json',
        data: {
          [Craft.csrfTokenName]: Craft.csrfTokenValue,
          formId: id,
        },
        success: (response) => {
          if (response.success) {
            self.siblings('.counter').html('0');
          } else {
            console.error(response);
          }
        },
      });

      return false;
    },
  });

  $('.exporter').on({
    change: function () {
      const val = $(this).val();

      if (val) {
        $(this).parents('form').submit();
      }

      $(this).val('');
    },
  });
})();
