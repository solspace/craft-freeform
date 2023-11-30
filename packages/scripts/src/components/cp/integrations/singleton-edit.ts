import { EVENT_INTEGRATION_UPDATE } from '@components/cp/integrations/edit';

$(() => {
  const stack = $('ul.integration-stack-items');

  $('a[data-type]').on('click', function (event) {
    event.preventDefault();

    const type = $(this).data('type');
    const name = $(this).data('name');

    const val = type.split('\\').join('');
    $('div#properties-' + val)
      .show()
      .siblings()
      .hide();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = (Craft as any).getCpUrl(`freeform/settings/integrations/single/${name}`);

    window.history.pushState({}, '', url);

    $('input[name="selectedIntegration"]').val(name);

    $(this).trigger(EVENT_INTEGRATION_UPDATE);
    $(this).parent().addClass('active').siblings('.active').removeClass('active');
  });

  $('.enabled-switch[data-name] button.lightswitch').on('click', function () {
    const name = $(this).parents('.enabled-switch').data('name');
    const isOn = $(this).data('lightswitch').on;

    $(`a[data-name="${name}"] > div`, stack).toggleClass('enabled', isOn);
  });

  if (!$('li.active > a[data-type]').get(0)) {
    $('ul.integration-stack-items > li:first-child > a[data-type]').trigger('click');
  }
});
