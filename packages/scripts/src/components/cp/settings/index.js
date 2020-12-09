// eslint-disable no-undef
$(() => {
  const purgeToggle = $("input[name='purge-toggle']").parents('.lightswitch');
  purgeToggle.on({
    change: function () {
      var isOn = $('input', this).val();
      if (!isOn) {
        $('select#purge-value').val(0);
      }
    },
  });

  const spamProtectionBehaviour = $('select#spam-protection-behaviour');
  spamProtectionBehaviour.on({
    change: function () {
      const customError = $('#custom-spam-error-message');
      if ($(this).val() === 'display_errors') {
        customError.show('fast');
      } else {
        customError.hide('fast');
      }
    },
  });
});
