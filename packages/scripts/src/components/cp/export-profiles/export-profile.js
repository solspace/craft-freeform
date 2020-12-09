// eslint-disable no-undef
$(() => {
  new Garnish.DragSort($('#field-settings tbody tr'), {
    handle: '.move',
    axis: 'y',
  });

  const addFilterButton = $('#add-filter');
  const filterTable = $('#filter-table');
  const template = $('template', filterTable);

  addFilterButton.on({
    click: () => {
      let clone = template.html();
      const lastIterator = $('tbody > tr[data-iterator]:last').data('iterator');

      let currentIterator = 0;
      if (lastIterator !== undefined) {
        currentIterator = parseInt(lastIterator) + 1;
      }

      clone = clone.replace(/__iterator__/g, currentIterator);

      $('tbody', filterTable).append(clone);
    },
  });

  filterTable.on(
    {
      click: function () {
        if (!confirm('Are you sure?')) {
          return false;
        }

        $(this).parents('tr:first').remove();
      },
    },
    '.delete.icon'
  );
});
