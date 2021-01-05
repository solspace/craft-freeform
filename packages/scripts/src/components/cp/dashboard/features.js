// eslint-disable no-undef
(function () {
  'use strict';

  tippy('.info-popup', {
    theme: 'light-border',
    allowHTML: true,
    placement: 'right',
    maxWidth: 600,
    animation: 'scale',
  });

  $('.banner .action-buttons .mark-as-read').on('click', function () {
    const row = $(this).parents('tr[data-id]:first');
    const id = row.data('id');

    $.ajax({
      type: 'post',
      url: Craft.getCpUrl('freeform/feeds/dismiss-message'),
      dataType: 'json',
      data: {
        id,
        [Craft.csrfTokenName]: Craft.csrfTokenValue,
      },
      success: (response) => {
        if (response.success === true) {
          if (row.parents('table').find('tr').length <= 1) {
            row.parents('div.banner:first').remove();
          }

          row.remove();
        }
      },
    });
  });

  $('.banner .button.dismiss-type').on('click', function () {
    const banner = $(this).parents('div[data-type]:first');
    const type = banner.data('type');

    $.ajax({
      type: 'post',
      url: Craft.getCpUrl('freeform/feeds/dismiss-type'),
      dataType: 'json',
      data: {
        type,
        [Craft.csrfTokenName]: Craft.csrfTokenValue,
      },
      success: (response) => {
        if (response.success === true) {
          banner.remove();
        }
      },
    });
  });
})();
