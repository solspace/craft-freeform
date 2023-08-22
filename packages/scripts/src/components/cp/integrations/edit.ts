type Filter = {
  expression: string;
};

$(() => {
  const $propertyEditor = $('.property-editor');
  const $classSelect = $('select[name="class"]');

  $propertyEditor.on('change', 'input, select, textarea', () => updateFieldVisibility());

  const updateFieldVisibility = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: Record<string, any> = {
      properties: {},
    };
    const currentClass = $classSelect.val();

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

          values.properties[updatedName] = value;
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

  updateFieldVisibility();
});
