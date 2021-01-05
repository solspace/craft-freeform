// eslint-disable no-undef
$(() => {
  $('#webhook-type').on({
    change: function () {
      const val = $(this).val().replace(/\\/g, '\\\\');

      $('div[data-class-settings]').addClass('hidden');
      $(`div[data-class-settings="${val}"]`).removeClass('hidden');
    },
  });
});
