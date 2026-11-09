/** biome-ignore-all lint/suspicious/noDoubleEquals: We need to use == for type coercion */

import { bindSpamReviewActions } from "@lib/cp/spam-review";
import { mountSubmissionStatuses } from "@lib/cp/submission-status";
import { bindSubmissionUndo } from "@lib/cp/submission-undo";

if (typeof Craft.Freeform === typeof undefined) {
  Craft.Freeform = {};
}

const getDefaultSourceKey = function () {
  // Did they request a specific category group in the URL?
  var defaultFormHandle = window.defaultFormHandle;
  if (
    this.settings.context === "index" &&
    typeof defaultFormHandle !== "undefined"
  ) {
    for (let i = 0; i < this.$sources.length; i++) {
      const $source = $(this.$sources[i]);

      if ($source.data("handle") === defaultFormHandle) {
        return $source.data("key");
      }
    }
  }

  return this.base();
};

const updateButton = function () {
  if (!this.$source) {
    return;
  }

  const handle = this.$source.data("handle");
  if (this.settings.context === "index" && typeof history !== "undefined") {
    let uri = this.baseUrl;

    if (handle) {
      uri += `/${handle}`;
    }

    history.replaceState({}, "", Craft.getUrl(uri));
  }
};

const initStatusMenus = function () {
  const undoTemplate = document.getElementById("freeform-submission-undo");
  if (this.settings.context === "index" && undoTemplate) {
    const slot = undoTemplate.content.firstElementChild.cloneNode(true);
    const button = slot.querySelector("button");
    this.$statusMenuContainer.before(slot);
    this.submissionUndo = bindSubmissionUndo(button, {
      initialHistory: window.freeformSubmissionUndoHistory || [],
      requestUndo: async (token) => {
        const response = await Craft.sendActionRequest(
          "POST",
          "freeform/submissions/undo",
          { data: { token } },
        );
        return response.data;
      },
      loadHistory: async () => {
        const response = await Craft.sendActionRequest(
          "GET",
          "freeform/submissions/undo-history",
        );
        return response.data.undoHistory;
      },
      refresh: () => this.updateElements(true),
      focusFallback: () =>
        this.$statusMenuContainer.find("[role=combobox]")[0]?.focus(),
      notify: (type, message) =>
        type === "success"
          ? Craft.cp.displayNotice(message)
          : Craft.cp.displayError(message),
      translate: (message) => Craft.t("freeform", message),
    });
  }
  this.on("afterAction", () => {
    void this.submissionUndo?.sync();
  });
  this.on("beforeUpdateElements", () => {
    this.$elements.find(".ff-submission-status-button").each((_, button) => {
      $(button).data("menubtn")?.hideMenu();
    });
  });
  this.on("updateElements", () => {
    this.destroyStatusMenus?.();
    this.destroySpamReviewActions?.();
    if (this.settings.context !== "index") return;
    this.destroyStatusMenus = mountSubmissionStatuses(this.$elements[0], {
      statuses: window.freeformSubmissionStatuses || [],
      createMenu: (button, onOptionSelect) =>
        new Garnish.MenuBtn($(button), { onOptionSelect }),
      saveStatus: async (submissionId, statusId) => {
        const response = await Craft.sendActionRequest(
          "POST",
          this.statusAction,
          { data: { submissionId, statusId } },
        );
        if (!response.data.success) throw new Error("Status update failed");
        this.submissionUndo?.setHistory(response.data.undoHistory);
      },
      refresh: (focusId) => {
        this.statusFocusId = focusId;
        return this.updateElements(true);
      },
      notify: (type, message) =>
        type === "success"
          ? Craft.cp.displayNotice(message)
          : Craft.cp.displayError(message),
      translate: (message) => Craft.t("freeform", message),
    });
    if (this.statusFocusId) {
      const button = this.$elements[0].querySelector(
        `[data-submission-id="${this.statusFocusId}"] button`,
      );
      (button || this.$statusMenuContainer.find("[role=combobox]")[0])?.focus();
      this.statusFocusId = null;
    }
    if (this.spamReview) {
      this.destroySpamReviewActions = bindSpamReviewActions(this.$elements[0], {
        request: async (submissionId, operation) => {
          const response = await Craft.sendActionRequest(
            "POST",
            "freeform/spam-submissions/review",
            { data: { submissionId, operation } },
          );
          if (!response.data.success) throw new Error("Spam review failed");
          this.submissionUndo?.setHistory(response.data.undoHistory);
        },
        refresh: ({ focus, nextId }) => {
          if (focus) this.spamReviewFocus = { nextId };
          return this.updateElements(true);
        },
        notify: (type, message) =>
          type === "success"
            ? Craft.cp.displayNotice(message)
            : Craft.cp.displayError(message),
        translate: (message) => Craft.t("freeform", message),
      });
      if (this.spamReviewFocus) {
        const nextId = this.spamReviewFocus.nextId;
        const button =
          (nextId &&
            this.$elements[0].querySelector(
              `[data-spam-review-id="${nextId}"] button`,
            )) ||
          this.$elements[0].querySelector("[data-spam-review-id] button") ||
          this.$statusMenuContainer.find("[role=combobox]")[0];
        button?.focus();
        this.spamReviewFocus = null;
      }
    }
  });
};

Craft.Freeform.SubmissionsIndex = Craft.BaseElementIndex.extend({
  baseUrl: "freeform/submissions",
  statusAction: "freeform/submissions/set-status",

  afterInit: function () {
    this.on("selectSource", $.proxy(this, "updateButton"));
    this.on("selectSite", $.proxy(this, "updateButton"));
    initStatusMenus.call(this);

    this.base();
  },
  destroy: function () {
    this.submissionUndo?.destroy();
    this.destroyStatusMenus?.();
    this.destroySpamReviewActions?.();
    this.base();
  },
  getViewClass: function (mode) {
    switch (mode) {
      case "table":
        return Craft.Freeform.SubmissionsTableView;
      default:
        return this.base(mode);
    }
  },
  getDefaultSort: () => ["dateCreated", "desc"],
  getDefaultSourceKey,
  updateButton,
});

Craft.Freeform.SpamSubmissionsIndex = Craft.BaseElementIndex.extend({
  baseUrl: "freeform/spam",
  statusAction: "freeform/spam-submissions/set-status",
  spamReview: true,
  reasonContainer: null,
  reasonMenuBtn: null,
  selectedReason: null,

  getDefaultSourceKey,
  afterInit: function () {
    this.reasonContainer = $("<div></div>");
    this.reasonContainer.append($("#spam-reasons").html());
    this.reasonMenuBtn = $(".btn.menubtn", this.reasonContainer);

    this.$statusMenuContainer.before(this.reasonContainer);

    $("*[data-reason]", this.reasonContainer).on({
      click: (event) => {
        const target = event.currentTarget;
        const reason = $(target).data("reason");

        $(target)
          .addClass("sel")
          .parent()
          .siblings()
          .find("a")
          .removeClass("sel");

        this.reasonMenuBtn
          .empty()
          .append(
            $(target)
              .children(".ff-spam-reason-icon, .ff-spam-reason-label")
              .clone(),
          );
        this.selectedReason = reason;

        this.settings.criteria = {
          ...this.settings.criteria,
          spamReason: reason,
        };

        this.updateElements();
      },
    });

    this.on("selectSource", $.proxy(this, "updateButton"));
    this.on("selectSite", $.proxy(this, "updateButton"));
    initStatusMenus.call(this);

    this.base();
  },
  destroy: function () {
    this.submissionUndo?.destroy();
    this.destroyStatusMenus?.();
    this.destroySpamReviewActions?.();
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
      this.$explorerContainer = $(
        '<div class="chart-explorer-container"></div>',
      ).prependTo(this.$container);

      this.createChartExplorer();

      this.base();
    },

    getStorage: function (key) {
      return Craft.Freeform.SubmissionsTableView.getStorage(
        this.elementIndex._namespace,
        key,
      );
    },

    setStorage: function (key, value) {
      Craft.Freeform.SubmissionsTableView.setStorage(
        this.elementIndex._namespace,
        key,
        value,
      );
    },

    createChartExplorer: function () {
      // chart explorer
      var $chartExplorer = $('<div class="chart-explorer"></div>').appendTo(
          this.$explorerContainer,
        ),
        $chartHeader = $('<div class="chart-header"></div>').appendTo(
          $chartExplorer,
        ),
        $dateRange = $('<div class="date-range" />').appendTo($chartHeader),
        $startDateContainer = $('<div class="datewrapper"></div>').appendTo(
          $dateRange,
        ),
        $endDateContainer = $('<div class="datewrapper"></div>').appendTo(
          $dateRange,
        ),
        $total = $('<div class="total"></div>').appendTo($chartHeader),
        $totalValueWrapper = $(
          '<div class="total-value-wrapper"></div>',
        ).appendTo($total),
        $totalValue = $('<span class="total-value">&nbsp;</span>').appendTo(
          $totalValueWrapper,
        );

      this.$chartExplorer = $chartExplorer;
      this.$totalValue = $totalValue;
      this.$chartContainer = $('<div class="chart-container"></div>').appendTo(
        $chartExplorer,
      );
      this.$spinner = $('<div class="spinner hidden" />').prependTo(
        $chartHeader,
      );
      this.$error = $('<div class="error"></div>').appendTo(
        this.$chartContainer,
      );
      this.$chart = $('<div class="chart"></div>').appendTo(
        this.$chartContainer,
      );

      this.$startDate = $(
        '<input type="text" class="text" size="20" autocomplete="off" />',
      ).appendTo($startDateContainer);
      this.$endDate = $(
        '<input type="text" class="text" size="20" autocomplete="off" />',
      ).appendTo($endDateContainer);

      this.$startDate.datepicker(
        $.extend(
          {
            onSelect: $.proxy(this, "handleStartDateChange"),
          },
          Craft.datepickerOptions,
        ),
      );

      this.$endDate.datepicker(
        $.extend(
          {
            onSelect: $.proxy(this, "handleEndDateChange"),
          },
          Craft.datepickerOptions,
        ),
      );

      this.startDatepicker = this.$startDate.data("datepicker");
      this.endDatepicker = this.$endDate.data("datepicker");

      this.addListener(this.$startDate, "keyup", "handleStartDateChange");
      this.addListener(this.$endDate, "keyup", "handleEndDateChange");

      // Set the start/end dates
      var startTime =
          this.getStorage("startTime") || Date.now() - 60 * 60 * 24 * 30 * 1000,
        endTime = this.getStorage("endTime") || Date.now();

      this.setStartDate(new Date(startTime));
      this.setEndDate(new Date(endTime));

      // Load the report
      this.loadReport();
    },

    handleStartDateChange: function () {
      if (
        this.setStartDate(
          Craft.Freeform.SubmissionsTableView.getDateFromDatepickerInstance(
            this.startDatepicker,
          ),
        )
      ) {
        this.loadReport();
      }
    },

    handleEndDateChange: function () {
      if (
        this.setEndDate(
          Craft.Freeform.SubmissionsTableView.getDateFromDatepickerInstance(
            this.endDatepicker,
          ),
        )
      ) {
        this.loadReport();
      }
    },

    setStartDate: function (date) {
      // Make sure it has actually changed
      if (this.startDate && date.getTime() === this.startDate.getTime()) {
        return false;
      }

      this.startDate = date;
      this.setStorage("startTime", this.startDate.getTime());
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
      this.setStorage("endTime", this.endDate.getTime());
      this.$endDate.val(Craft.formatDate(this.endDate));

      // If this is before the current start date, set the start date to match it
      if (this.startDate && this.endDate.getTime() < this.startDate.getTime()) {
        this.setStartDate(new Date(this.endDate.getTime()));
      }

      return true;
    },

    loadReport: function () {
      var requestData = this.settings.params;

      requestData.startDate = Craft.Freeform.SubmissionsTableView.getDateValue(
        this.startDate,
      );
      requestData.endDate = Craft.Freeform.SubmissionsTableView.getDateValue(
        this.endDate,
      );
      requestData.isSpam = false;

      this.$spinner.removeClass("hidden");
      this.$error.addClass("hidden");
      this.$chart.removeClass("error");

      Craft.postActionRequest(
        "freeform/api/submissions/get-submission-data",
        requestData,
        $.proxy(function (response, textStatus) {
          this.$spinner.addClass("hidden");

          if (
            textStatus === "success" &&
            typeof response.error == "undefined"
          ) {
            if (!this.chart) {
              this.chart = new Craft.charts.Area(this.$chart);
            }

            const chartDataTable = new Craft.charts.DataTable(
              response.dataTable,
            );

            const chartSettings = {
              localeDefinition: response.localeDefinition,
              orientation: response.orientation,
              formats: response.formats,
              dataScale: response.scale,
            };

            this.chart.draw(chartDataTable, chartSettings);

            this.$totalValue.html(response.totalHtml);
          } else {
            let msg = Craft.t("An unknown error occurred.");

            if (
              typeof response != "undefined" &&
              response &&
              typeof response.error != "undefined"
            ) {
              msg = response.error;
            }

            this.$error.html(msg);
            this.$error.removeClass("hidden");
            this.$chart.addClass("error");
          }
        }, this),
      );
    },
  },
  {
    storage: {},

    getStorage: (namespace, key) => {
      if (Craft.Freeform.SubmissionsTableView.storage[namespace]?.[key]) {
        return Craft.Freeform.SubmissionsTableView.storage[namespace][key];
      }

      return null;
    },

    setStorage: (namespace, key, value) => {
      if (
        typeof Craft.Freeform.SubmissionsTableView.storage[namespace] ===
        typeof undefined
      ) {
        Craft.Freeform.SubmissionsTableView.storage[namespace] = {};
      }

      Craft.Freeform.SubmissionsTableView.storage[namespace][key] = value;
    },

    getDateFromDatepickerInstance: (inst) =>
      new Date(inst.currentYear, inst.currentMonth, inst.currentDay),

    getDateValue: (date) =>
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
  },
);

// Register the Freeform SubmissionsIndex class
Craft.registerElementIndexClass(
  "Solspace\\Freeform\\Elements\\Submission",
  Craft.Freeform.SubmissionsIndex,
);
Craft.registerElementIndexClass(
  "Solspace\\Freeform\\Elements\\SpamSubmission",
  Craft.Freeform.SpamSubmissionsIndex,
);
