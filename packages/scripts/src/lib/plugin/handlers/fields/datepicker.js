/* eslint-disable no-undef */
class DatePicker {
  loadedLocales = [];
  freeform;

  scriptAdded = false;

  constructor(freeform) {
    this.freeform = freeform;

    if (!this.scriptAdded) {
      const script = document.createElement('script');
      script.src = '//cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.6/flatpickr.min.js';
      script.async = false;
      script.defer = false;
      script.addEventListener('load', () => {
        this.reload();
      });
      document.body.appendChild(script);

      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = '//cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.6/flatpickr.min.css';
      document.body.appendChild(style);

      this.scriptAdded = true;
    }
  }

  reload = () => {
    const pickers = this.freeform.form.querySelectorAll('*[data-datepicker][data-datepicker-enabled]');
    pickers.forEach((picker) => {
      const locale = picker.getAttribute('data-datepicker-locale');
      const options = {
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
        locale,
      };

      const optionsEvent = this.freeform._dispatchEvent('flatpickr-before-init', { detail: options, options });
      const assembledOptions = {
        ...optionsEvent.detail,
        ...optionsEvent.options,
      };

      const instance = flatpickr(picker, assembledOptions);
      picker.setAttribute('autocomplete', 'off');

      this.freeform._dispatchEvent('flatpickr-ready', { detail: instance, flatpickr: instance });

      if (!this.loadedLocales.includes(locale)) {
        const script = document.createElement('script');
        script.src = `//cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.6/l10n/${locale}.js`;
        script.async = false;
        script.defer = false;
        script.addEventListener('load', () => {
          instance.set('locale', locale);
        });
        document.body.appendChild(script);

        this.loadedLocales.push(locale);
      }
    });
  };
}

export default DatePicker;
