type Filter = {
  expression: string;
};

export const EVENT_INTEGRATION_UPDATE = 'integration-update';

$(() => {
  const $propertyEditor = $('.property-editor');
  const $classSelect = $('select[name="class"]');

  $classSelect.on('change', function () {
    $(this).trigger(EVENT_INTEGRATION_UPDATE);
  });

  $('select', $propertyEditor).on('change', function () {
    $(this).trigger(EVENT_INTEGRATION_UPDATE);
  });

  $('input, textarea', $propertyEditor).on('keyup', function () {
    $(this).trigger(EVENT_INTEGRATION_UPDATE);

    if ($(this).hasClass('handle-generator')) {
      $(this).val(generateHandle($(this).val() as string));
    }
  });

  const updateFieldVisibility = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: Record<string, any> = {
      values: {},
    };

    let currentClass: string;
    if ($classSelect.get(0)) {
      currentClass = $classSelect.val() as string;
    } else {
      const $currentSelection = $('ul.integration-stack-items > li.active > a[data-type]');
      currentClass = $currentSelection.data('type');
    }

    $('form#main-form')
      .serializeArray()
      .forEach((item) => {
        const { name, value } = item;

        if (name === 'class') {
          return;
        }

        if (!name.startsWith('properties[')) {
          values[name] = value;
          return;
        }

        if (name.startsWith(`properties[${currentClass}]`)) {
          const updatedName = name.replace(`properties[${currentClass}]`, '').replace(/[[\]]/g, '');

          values.values[updatedName] = value;
        }
      });

    $propertyEditor.find('.field').each(function () {
      const $field = $(this);
      const $filterScripts = $field.find('script.visibility-filters');
      if (!$filterScripts.length) {
        return;
      }

      const filters = JSON.parse($filterScripts.html()) as Filter[];

      filters.forEach((filter) => {
        const { expression } = filter;

        const fn = new Function(...Object.keys(values), `return ${expression};`);

        if (fn(...Object.values(values))) {
          $field.show();
        } else {
          $field.hide();
        }
      });
    });
  };

  $(document).on(EVENT_INTEGRATION_UPDATE, updateFieldVisibility);

  updateFieldVisibility();
});

const generateHandle = (value: string) => value.replace(/[^a-zA-Z0-9\-_]/g, '');
