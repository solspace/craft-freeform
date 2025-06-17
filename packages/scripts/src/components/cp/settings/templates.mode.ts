export const loadTemplatesModeScript = () => {
  const $methodSelect = $('#template-method');
  const $globalBlock = $('#global-email-block');

  $methodSelect.on('change', function () {
    const value = $(this).val();

    switch (value) {
      case 'all':
      case 'global':
        $globalBlock.removeClass('hidden');
        break;

      case 'form':
        $globalBlock.addClass('hidden');
        break;
    }
  });
};
