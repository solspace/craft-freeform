// eslint-disable no-undef
$(() => {
  const purgeToggle = $("input[name='purge-toggle']").parents('.lightswitch');
  purgeToggle.on({
    change: function () {
      const isOn = $('input', this).val();
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

  const scriptInsertLocation = $('select[name="settings[scriptInsertLocation]"]');
  const warningText = $('#script-insert-warning').text();
  scriptInsertLocation.on({
    change: function () {
      const value = $(this).val();
      const parent = $(this).parents('.field:first');

      if (value === 'manual') {
        const warning = document.createElement('div');
        warning.classList.add('warning', 'with-icon');
        warning.innerText = warningText;

        console.log(parent, warning);
        parent.append(warning);
      } else {
        parent.find('.warning.with-icon').remove();
      }
    },
  });

  scriptInsertLocation.trigger('change');
});
