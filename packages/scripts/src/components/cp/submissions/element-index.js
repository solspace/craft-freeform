// eslint-disable no-undef
if (typeof Craft.Freeform === typeof undefined) {
  Craft.Freeform = {};
}

const getDefaultSourceKey = function () {
  // Did they request a specific category group in the URL?
  var defaultFormHandle = window.defaultFormHandle;
  if (this.settings.context === 'index' && typeof defaultFormHandle !== 'undefined') {
    for (var i = 0; i < this.$sources.length; i++) {
      var $source = $(this.$sources[i]);

      if ($source.data('handle') === defaultFormHandle) {
        return $source.data('key');
      }
    }
  }

  return this.base();
};

const updateButton = function () {
  if (!this.$source) {
    return;
  }

  const handle = this.$source.data('handle');
  if (this.settings.context === 'index' && typeof history !== 'undefined') {
    let uri = this.baseUrl;

    if (handle) {
      uri += '/' + handle;
    }

    history.replaceState({}, '', Craft.getUrl(uri));
  }
};

Craft.Freeform.SubmissionsIndex = Craft.BaseElementIndex.extend({
  baseUrl: 'freeform/submissions',

  afterInit: function () {
    this.on('selectSource', $.proxy(this, 'updateButton'));
    this.on('selectSite', $.proxy(this, 'updateButton'));

    this.base();
  },
  getViewClass: function (mode) {
    switch (mode) {
      case 'table':
        return Craft.Freeform.SubmissionsTableView;
      default:
        return this.base(mode);
    }
  },
  getDefaultSort: function () {
    return ['dateCreated', 'desc'];
  },
  getDefaultSourceKey,
  updateButton,
});

Craft.Freeform.SpamSubmissionsIndex = Craft.BaseElementIndex.extend({
  baseUrl: 'freeform/spam',
  reasonContainer: null,
  reasonMenuBtn: null,
  selectedReason: null,

  getDefaultSourceKey,
  afterInit: function () {
    this.reasonContainer = $('<div></div>');
    this.reasonContainer.append($('#spam-reasons').html());
    this.reasonMenuBtn = $('.btn.menubtn', this.reasonContainer);

    this.$statusMenuContainer.before(this.reasonContainer);

    $('*[data-reason]', this.reasonContainer).on({
      click: (event) => {
        const { target } = event;
        const reason = $(target).data('reason');
        const label = $(target).text();

        $(target).addClass('sel').parent().siblings().find('a').removeClass('sel');

        this.reasonMenuBtn.text(label);
        this.selectedReason = reason;

        this.settings.criteria = {
          ...this.settings.criteria,
          spamReason: reason,
        };

        this.updateElements();
      },
    });

    this.on('selectSource', $.proxy(this, 'updateButton'));
    this.on('selectSite', $.proxy(this, 'updateButton'));

    this.base();
  },
  updateButton,
});

Craft.Freeform.SubmissionsTableView = Craft.TableElementIndexView.extend(
  {
    startDate: null,
    endDate: null,

    startDatepicker: null,
    endDatepicker: null,

    $chartExplorer: null,
    $totalValue: null,
    $chartContainer: null,
    $spinner: null,
    $error: null,
    $chart: null,
    $startDate: null,
    $endDate: null,

    afterInit: function () {
      this.$explorerContainer = $('<div class="chart-explorer-container"></div>').prependTo(this.$container);

      this.createChartExplorer();

      this.base();
    },

    getStorage: function (key) {
      return Craft.Freeform.SubmissionsTableView.getStorage(this.elementIndex._namespace, key);
    },

    setStorage: function (key, value) {
      Craft.Freeform.SubmissionsTableView.setStorage(this.elementIndex._namespace, key, value);
    },

    createChartExplorer: function () {
      // chart explorer
      var $chartExplorer = $('<div class="chart-explorer"></div>').appendTo(this.$explorerContainer),
        $chartHeader = $('<div class="chart-header"></div>').appendTo($chartExplorer),
        $dateRange = $('<div class="date-range" />').appendTo($chartHeader),
        $startDateContainer = $('<div class="datewrapper"></div>').appendTo($dateRange),
        $endDateContainer = $('<div class="datewrapper"></div>').appendTo($dateRange),
        $total = $('<div class="total"></div>').appendTo($chartHeader),
        $totalValueWrapper = $('<div class="total-value-wrapper"></div>').appendTo($total),
        $totalValue = $('<span class="total-value">&nbsp;</span>').appendTo($totalValueWrapper);

      this.$chartExplorer = $chartExplorer;
      this.$totalValue = $totalValue;
      this.$chartContainer = $('<div class="chart-container"></div>').appendTo($chartExplorer);
      this.$spinner = $('<div class="spinner hidden" />').prependTo($chartHeader);
      this.$error = $('<div class="error"></div>').appendTo(this.$chartContainer);
      this.$chart = $('<div class="chart"></div>').appendTo(this.$chartContainer);

      this.$startDate = $('<input type="text" class="text" size="20" autocomplete="off" />').appendTo(
        $startDateContainer
      );
      this.$endDate = $('<input type="text" class="text" size="20" autocomplete="off" />').appendTo($endDateContainer);

      this.$startDate.datepicker(
        $.extend(
          {
            onSelect: $.proxy(this, 'handleStartDateChange'),
          },
          Craft.datepickerOptions
        )
      );

      this.$endDate.datepicker(
        $.extend(
          {
            onSelect: $.proxy(this, 'handleEndDateChange'),
          },
          Craft.datepickerOptions
        )
      );

      this.startDatepicker = this.$startDate.data('datepicker');
      this.endDatepicker = this.$endDate.data('datepicker');

      this.addListener(this.$startDate, 'keyup', 'handleStartDateChange');
      this.addListener(this.$endDate, 'keyup', 'handleEndDateChange');

      // Set the start/end dates
      var startTime = this.getStorage('startTime') || new Date().getTime() - 60 * 60 * 24 * 30 * 1000,
        endTime = this.getStorage('endTime') || new Date().getTime();

      this.setStartDate(new Date(startTime));
      this.setEndDate(new Date(endTime));

      // Load the report
      this.loadReport();
    },

    handleStartDateChange: function () {
      if (this.setStartDate(Craft.Freeform.SubmissionsTableView.getDateFromDatepickerInstance(this.startDatepicker))) {
        this.loadReport();
      }
    },

    handleEndDateChange: function () {
      if (this.setEndDate(Craft.Freeform.SubmissionsTableView.getDateFromDatepickerInstance(this.endDatepicker))) {
        this.loadReport();
      }
    },

    setStartDate: function (date) {
      // Make sure it has actually changed
      if (this.startDate && date.getTime() === this.startDate.getTime()) {
        return false;
      }

      this.startDate = date;
      this.setStorage('startTime', this.startDate.getTime());
      this.$startDate.val(Craft.formatDate(this.startDate));

      // If this is after the current end date, set the end date to match it
      if (this.endDate && this.startDate.getTime() > this.endDate.getTime()) {
        this.setEndDate(new Date(this.startDate.getTime()));
      }

      return true;
    },

    setEndDate: function (date) {
      // Make sure it has actually changed
      if (this.endDate && date.getTime() === this.endDate.getTime()) {
        return false;
      }

      this.endDate = date;
      this.setStorage('endTime', this.endDate.getTime());
      this.$endDate.val(Craft.formatDate(this.endDate));

      // If this is before the current start date, set the start date to match it
      if (this.startDate && this.endDate.getTime() < this.startDate.getTime()) {
        this.setStartDate(new Date(this.endDate.getTime()));
      }

      return true;
    },

    loadReport: function () {
      var requestData = this.settings.params;

      requestData.startDate = Craft.Freeform.SubmissionsTableView.getDateValue(this.startDate);
      requestData.endDate = Craft.Freeform.SubmissionsTableView.getDateValue(this.endDate);
      requestData.isSpam = false;

      this.$spinner.removeClass('hidden');
      this.$error.addClass('hidden');
      this.$chart.removeClass('error');

      Craft.postActionRequest(
        'freeform/api/settings/get-submission-data',
        requestData,
        $.proxy(function (response, textStatus) {
          this.$spinner.addClass('hidden');

          if (textStatus === 'success' && typeof response.error == 'undefined') {
            if (!this.chart) {
              this.chart = new Craft.charts.Area(this.$chart);
            }

            var chartDataTable = new Craft.charts.DataTable(response.dataTable);

            var chartSettings = {
              localeDefinition: response.localeDefinition,
              orientation: response.orientation,
              formats: response.formats,
              dataScale: response.scale,
            };

            this.chart.draw(chartDataTable, chartSettings);

            this.$totalValue.html(response.totalHtml);
          } else {
            var msg = Craft.t('An unknown error occurred.');

            if (typeof response != 'undefined' && response && typeof response.error != 'undefined') {
              msg = response.error;
            }

            this.$error.html(msg);
            this.$error.removeClass('hidden');
            this.$chart.addClass('error');
          }
        }, this)
      );
    },
  },
  {
    storage: {},

    getStorage: function (namespace, key) {
      if (
        Craft.Freeform.SubmissionsTableView.storage[namespace] &&
        Craft.Freeform.SubmissionsTableView.storage[namespace][key]
      ) {
        return Craft.Freeform.SubmissionsTableView.storage[namespace][key];
      }

      return null;
    },

    setStorage: function (namespace, key, value) {
      if (typeof Craft.Freeform.SubmissionsTableView.storage[namespace] === typeof undefined) {
        Craft.Freeform.SubmissionsTableView.storage[namespace] = {};
      }

      Craft.Freeform.SubmissionsTableView.storage[namespace][key] = value;
    },

    getDateFromDatepickerInstance: function (inst) {
      return new Date(inst.currentYear, inst.currentMonth, inst.currentDay);
    },

    getDateValue: function (date) {
      return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    },
  }
);

// Register the Freeform SubmissionsIndex class
Craft.registerElementIndexClass('Solspace\\Freeform\\Elements\\Submission', Craft.Freeform.SubmissionsIndex);
Craft.registerElementIndexClass('Solspace\\Freeform\\Elements\\SpamSubmission', Craft.Freeform.SpamSubmissionsIndex);
