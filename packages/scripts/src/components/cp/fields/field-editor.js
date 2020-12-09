// eslint-disable no-undef
$(function () {
  const $typeSelect = $('select#type');

  $typeSelect.on({
    change: function () {
      const type = $(this).val();

      $('.field-settings[data-type=' + type + ']')
        .show()
        .siblings()
        .hide();
    },
  });
  $typeSelect.trigger('change');

  const $table = $('table.value-group');
  $table.each(function () {
    const $sorter = new Craft.DataTableSorter($(this), {
      helperClass: 'editabletablesorthelper',
      copyDraggeeInputValuesToHelper: true,
    });

    $(this).data('sorter', $sorter);
  });

  const $customValueSwitch = $("input[name$='[customValues]']").parents('.lightswitch');
  $customValueSwitch.on({
    change: function () {
      const isOn = $('input', this).val();
      if (isOn) {
        $table.filter(":not([data-type='dynamic_recipients'])").removeClass('hide-custom-values');
      } else {
        $table.filter(":not([data-type='dynamic_recipients'])").addClass('hide-custom-values');
      }
    },
  });
  $customValueSwitch.trigger('change');

  $('.value-group + .btn.add').on({
    click: function () {
      const $parentTable = $(this).prev('table.value-group');
      const type = $parentTable.data('type');
      const isMultiple = $parentTable.data('isMultiple') !== undefined;

      const $tr = $('<tr>')
        .append(
          $('<td>', { class: 'textual field-label' }).append(
            $('<textarea>', {
              val: '',
              rows: 1,
              name: 'types[' + type + '][labels][]',
            })
          )
        )
        .append(
          $('<td>', { class: 'textual field-value' }).append(
            $('<textarea>', {
              val: '',
              rows: 1,
              class: 'code',
              name: 'types[' + type + '][values][]',
            })
          )
        )
        .append(
          $('<td>')
            .append(
              $('<input>', {
                type: 'hidden',
                value: 0,
                class: 'code',
                name: 'types[' + type + '][checked][]',
              })
            )
            .append(
              $('<input>', {
                type: isMultiple ? 'checkbox' : 'radio',
                name: type + '_is_checked',
                checked: false,
              })
            )
        )
        .append(
          $('<td>', { class: 'thin action' }).append(
            $('<a>', {
              class: 'move icon',
              title: Craft.t('Reorder'),
            })
          )
        )
        .append(
          $('<td>', { class: 'thin action' }).append(
            $('<a>', {
              class: 'delete icon',
              title: Craft.t('Delete'),
            })
          )
        );

      $('tbody', $parentTable).append($tr);
      $parentTable.find('tbody > tr:last > td:first textarea:first').focus();

      $parentTable.data('sorter').addItems($tr);
    },
  });

  $table
    .on(
      {
        click: function () {
          $(this).parents('tr:first').remove();
        },
      },
      'tr td.action .icon.delete'
    )
    .on(
      {
        keyup: function (event) {
          if (event.which === 9 || event.keyCode === 9) {
            return false;
          }

          const $val = $(this).val();
          const $tr = $(this).parents('tr:first');

          $('td.field-value > textarea', $tr).val($val);
        },
      },
      'td.field-label > textarea'
    )
    .on(
      {
        click: function () {
          const $tbody = $(this).parents('tbody:first');
          const isChecked = $(this).is(':checked');
          const isRadio = $(this).is(':radio');

          if (isRadio && isChecked) {
            $('input:hidden', $tbody).val(0);
          }

          $(this)
            .siblings('input:hidden')
            .val(isChecked ? 1 : 0);
        },
      },
      'input:checkbox, input:radio'
    );

  const $dateTimeTypeSelector = $('#dateTimeTypeSelector');
  $dateTimeTypeSelector.on({
    change: function () {
      const val = $(this).val();
      const date = $('#date-time-date');
      const clock = $('#date-time-clock');

      switch (val) {
        case 'date':
          date.show();
          clock.hide();
          break;

        case 'time':
          date.hide();
          clock.show();
          break;

        default:
          date.show();
          clock.show();
          break;
      }
    },
  });

  $dateTimeTypeSelector.trigger('change');
});
