// eslint-disable no-undef
$(function () {
  const $classSelector = $('select#class');
  $classSelector.on({
    change: function () {
      const val = $(this).val().split('\\').join('');

      $('div#settings-' + val)
        .show()
        .siblings()
        .hide();
    },
  });

  $classSelector.trigger('change');

  const $name = $('#name');
  if (!$name.val().length) {
    $name.on({
      keyup: function () {
        $('#handle')
          .val(generateHandle($(this).val()))
          .trigger('change');
      },
    });
  }

  const $returnUri = $('input.setting-return_uri');
  const urlType = $('#integration-type').data('type');

  $('#handle').on({
    change: function () {
      const val = $(this).val();
      const updatedUrl = Craft.getCpUrl('freeform/settings/' + urlType + '/' + val);

      $returnUri.val(updatedUrl);
    },
    keyup: function () {
      $(this).trigger('change');
    },
  });

  const $authChecker = $('#auth-checker');
  const pendingStatusCheck = $('.pending-status-check', $authChecker);
  const integrationId = pendingStatusCheck.data('id');
  const type = pendingStatusCheck.data('type');

  if (integrationId) {
    const data = {
      id: integrationId,
    };

    data[Craft.csrfTokenName] = Craft.csrfTokenValue;

    $.ajax({
      url: Craft.getCpUrl('freeform/' + type + '/check'),
      data: data,
      type: 'post',
      dataType: 'json',
      success: function (json) {
        pendingStatusCheck.hide();

        if (json.success) {
          $('.authorized', $authChecker).show();
        } else {
          $('.not-authorized', $authChecker).show();

          if (json.errors) {
            let errors = json.errors;
            if (typeof errors !== 'string') {
              errors = errors.join('. ');
            }

            $('.not-authorized .errors', $authChecker).empty().text(errors);
          }
        }
      },
    });
  }
});

function generateHandle(value) {
  // Remove HTML tags
  let handle = value.replace('/<(.*?)>/g', '');

  // Remove inner-word punctuation
  handle = handle.replace(/['"‘’“”[\](){}:]/g, '');

  // Make it lowercase
  handle = handle.toLowerCase();

  // Convert extended ASCII characters to basic ASCII
  handle = Craft.asciiString(handle);

  // Handle must start with a letter
  handle = handle.replace(/^[^a-z]+/, '');

  // Get the "words"
  const words = Craft.filterArray(handle.split(/[^a-z0-9]+/));

  handle = '';

  // Make it camelCase
  for (let i = 0; i < words.length; i++) {
    if (i === 0) {
      handle += words[i];
    } else {
      handle += words[i].charAt(0).toUpperCase() + words[i].substr(1);
    }
  }

  return handle;
}
