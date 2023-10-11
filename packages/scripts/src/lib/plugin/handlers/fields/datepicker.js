import flatpickr from 'flatpickr';
import Locales from 'flatpickr/dist/l10n';
import 'flatpickr/dist/flatpickr.min.css';

/* eslint-disable no-undef */
class DatePicker {
  constructor(freeform) {
    if (!freeform.has('data-scripts-datepicker')) {
      return;
    }

    const pickers = freeform.form.querySelectorAll('*[data-datepicker][data-datepicker-enabled]');
    pickers.forEach((picker) => {
      picker.setAttribute('autocomplete', 'off');

      const locale = picker.getAttribute('data-datepicker-locale');

      const options = {
        locale: Locales[locale],
        disableMobile: true,
        allowInput: true,
        dateFormat: picker.getAttribute('data-datepicker-format'),
        enableTime: picker.getAttribute('data-datepicker-enabletime') !== null,
        noCalendar: picker.getAttribute('data-datepicker-enabledate') === null,
        time_24hr: picker.getAttribute('data-datepicker-clock_24h') !== null,
        minDate: picker.getAttribute('data-datepicker-min-date'),
        maxDate: picker.getAttribute('data-datepicker-max-date'),
        minuteIncrement: 1,
        hourIncrement: 1,
        static: picker.getAttribute('data-datepicker-static') !== null,
      };

      const optionsEvent = freeform._dispatchEvent('flatpickr-before-init', { detail: options, options });

      const instance = flatpickr(picker, {
        ...optionsEvent.detail,
        ...optionsEvent.options,
      });

      freeform._dispatchEvent('flatpickr-ready', { detail: instance, flatpickr: instance });
    });
  }
}

export default DatePicker;
