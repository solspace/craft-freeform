// eslint-disable no-undef
$(function () {
  const $classSelector = $('[name=class]');
  $classSelector.on({
    change: function () {
      let val = <string>$(this).val();
      val = val.split('\\').join('');

      $('div#properties-' + val)
        .show()
        .siblings()
        .hide();
    },
  });

  $classSelector.trigger('change');

  const $name = $('#name');
  if ($name.get(0) && !(<string>$name.val()).length) {
    $name.on({
      keyup: function () {
        $('#handle')
          .val(generateHandle(<string>$(this).val()))
          .trigger('change');
      },
    });
  }
});

const generateHandle = (value: string): string => {
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
};
