<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Carbon\Carbon;
use Carbon\Exceptions\InvalidFormatException;
use craft\gql\types\DateTime as DateTimeType;
use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\DatePickerInterface;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\MaxLengthInterface;
use Solspace\Freeform\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Fields\Interfaces\SkipGibberishCheckInterface;
use Solspace\Freeform\Fields\Traits\EncryptionTrait;
use Solspace\Freeform\Fields\Traits\MaxLengthTrait;
use Solspace\Freeform\Freeform;

#[Type(
    name: 'Date & Time',
    typeShorthand: 'datetime',
    iconPath: __DIR__.'/../Icons/date-time.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/date-time.ejs',
)]
class DatetimeField extends AbstractField implements PlaceholderInterface, DatePickerInterface, ExtraFieldInterface, EncryptionInterface, MaxLengthInterface, SkipGibberishCheckInterface
{
    use EncryptionTrait;
    use MaxLengthTrait;

    public const DATETIME_TYPE_BOTH = 'both';
    public const DATETIME_TYPE_DATE = 'date';
    public const DATETIME_TYPE_TIME = 'time';

    public const PICKER_OPTIONS = [
        'freeform' => 'Freeform',
        'flatpickr' => 'Classic',
        'browser' => 'Browser',
        'none' => 'None',
    ];

    #[Section(
        handle: null,
        label: 'Configuration',
        icon: __DIR__.'/../../SectionIcons/gears.svg',
        order: 1,
    )]
    #[Limitation('props.date', 'type')]
    #[DefaultValue('props.date.type')]
    #[Input\ButtonGroup(
        label: 'Type',
        instructions: 'Use date, time or both.',
        order: 0,
        options: [
            self::DATETIME_TYPE_BOTH => 'Date & Time',
            self::DATETIME_TYPE_DATE => 'Date',
            self::DATETIME_TYPE_TIME => 'Time',
        ],
    )]
    protected string $dateTimeType = self::DATETIME_TYPE_BOTH;

    #[Translatable]
    #[Limitation('props.date', 'initialValue')]
    #[DefaultValue('props.date.initialValue')]
    #[Input\DateExpression(
        label: 'Initial value',
        includeTime: true,
        instructions: "Enter an English date expression such as 'now', 'today', '5 days ago', or '2025-01-01 20:00:00'. Keep these values in English regardless of your control panel language.",
    )]
    protected string $initialValue = '';

    #[Limitation('props.date', 'picker')]
    #[DefaultValue('props.date.picker')]
    #[Input\ButtonGroup(
        label: 'Date picker',
        instructions: 'Freeform: searchable calendar and time list. Classic: Flatpickr. Browser: device controls. None: text input.',
        order: 1,
        options: self::PICKER_OPTIONS,
    )]
    protected string $picker = 'freeform';

    // Retained for older imports, integrations, and saved field metadata.
    #[Input\Hidden]
    protected bool $useNativeTypes = false;

    #[Input\Hidden]
    protected bool $useDatepicker = true;

    #[VisibilityFilter('properties.picker === "freeform"')]
    #[VisibilityFilter('["both", "time"].includes(properties.dateTimeType)')]
    #[Limitation('props.date', 'minuteStep')]
    #[DefaultValue('props.date.minuteStep')]
    #[Input\Select(
        label: 'Time interval',
        instructions: 'Choose the interval between times shown in the picker. Manually entered times are also allowed.',
        order: 2,
        options: [1 => '1 minute', 5 => '5 minutes', 10 => '10 minutes', 15 => '15 minutes', 30 => '30 minutes', 60 => '1 hour'],
    )]
    protected int $minuteStep = 30;

    #[VisibilityFilter('properties.picker !== "browser"')]
    #[Limitation('props.date', 'formatAsPlaceholder')]
    #[DefaultValue('props.date.formatAsPlaceholder')]
    #[Input\Boolean(
        label: 'Use date format as placeholder',
        order: 4,
    )]
    protected bool $generatePlaceholder = true;

    #[Translatable]
    #[VisibilityFilter('properties.picker !== "browser"')]
    #[Limitation('props.date', 'locale')]
    #[DefaultValue('props.date.locale')]
    #[VisibilityFilter('["freeform", "flatpickr"].includes(properties.picker)')]
    #[Input\Text(
        label: 'Force a locale',
        instructions: "Uses the site's locale set in Craft by default. To force a different locale, specify a 2-digit language code, e.g. `fr`, `de`, etc.",
        order: 4,
    )]
    protected ?string $locale = null;

    #[VisibilityFilter('properties.picker !== "browser"')]
    #[VisibilityFilter('properties.generatePlaceholder === false')]
    #[Input\Text(
        instructions: "The text that will be shown if the field doesn't have a value.",
        order: 4,
    )]
    protected string $placeholder = '';

    #[Section(
        handle: 'date',
        label: 'Date Settings',
        icon: __DIR__.'/../../SectionIcons/calendar.svg',
        order: 2,
    )]
    #[Translatable]
    #[VisibilityFilter('properties.picker !== "browser"')]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Limitation('props.date', 'dateOrder')]
    #[DefaultValue('props.date.dateOrder')]
    #[Input\ButtonGroup(
        label: 'Date order',
        instructions: 'Choose the order in which to show day, month and year.',
        options: [
            'ymd' => 'Y / M / D',
            'mdy' => 'M / D / Y',
            'dmy' => 'D / M / Y',
        ],
    )]
    protected string $dateOrder = 'ymd';

    #[Section('date')]
    #[Translatable]
    #[VisibilityFilter('properties.picker !== "browser"')]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Limitation('props.date', 'date4DigitYear')]
    #[DefaultValue('props.date.date4DigitYear')]
    #[Input\Boolean('Four digit year')]
    protected bool $date4DigitYear = true;

    #[Section('date')]
    #[Translatable]
    #[VisibilityFilter('properties.picker !== "browser"')]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Limitation('props.date', 'dateLeadingZero')]
    #[DefaultValue('props.date.dateLeadingZero')]
    #[Input\Boolean(
        label: 'Leading zero on date',
        instructions: 'Include a leading zero for day and month numbers.'
    )]
    protected bool $dateLeadingZero = true;

    #[Section('date')]
    #[Translatable]
    #[VisibilityFilter('properties.picker !== "browser"')]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Limitation('props.date', 'dateSeparator')]
    #[DefaultValue('props.date.dateSeparator')]
    #[Input\ButtonGroup(
        label: 'Date separator',
        instructions: 'Used to separate date values.',
        options: [
            '' => 'None',
            'space' => 'Space',
            '/' => '/',
            '-' => '-',
            '.' => '.',
        ]
    )]
    protected string $dateSeparator = '-';

    #[Section('date')]
    #[Translatable]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Limitation('props.date', 'minDate')]
    #[DefaultValue('props.date.minDate')]
    #[Input\DateExpression(
        label: 'Minimum date',
        instructions: "Enter an English date expression such as 'now', 'today', '5 days ago', or '2025-01-01 20:00:00'. Keep these values in English regardless of your control panel language.",
    )]
    protected ?string $minDate = null;

    #[Section('date')]
    #[Translatable]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Limitation('props.date', 'maxDate')]
    #[DefaultValue('props.date.maxDate')]
    #[Input\DateExpression(
        label: 'Maximum date',
        instructions: "Enter an English date expression such as 'now', 'today', '5 days ago', or '2025-01-01 20:00:00'. Keep these values in English regardless of your control panel language.",
    )]
    protected ?string $maxDate = null;

    #[Section(
        handle: 'time',
        label: 'Time settings',
        icon: __DIR__.'/../../SectionIcons/time.svg',
        order: 3,
    )]
    #[Translatable]
    #[VisibilityFilter('properties.picker !== "browser"')]
    #[VisibilityFilter('["both", "time"].includes(properties.dateTimeType)')]
    #[Limitation('props.date', 'clock24h')]
    #[DefaultValue('props.date.clock24h')]
    #[Input\ButtonGroup(label: 'Clock format', instructions: 'Use a 12-hour clock with AM/PM or a 24-hour clock.', options: ['12' => '12-hour', '24' => '24-hour'])]
    protected bool $clock24h = false;

    #[Section('time')]
    #[Translatable]
    #[VisibilityFilter('properties.picker !== "browser"')]
    #[VisibilityFilter('["both", "time"].includes(properties.dateTimeType)')]
    #[Limitation('props.date', 'clockSeparator')]
    #[DefaultValue('props.date.clockSeparator')]
    #[Input\ButtonGroup(
        label: 'Clock Separator',
        instructions: 'Used to separate clock values.',
        options: [
            '' => 'None',
            'space' => 'Space',
            ':' => ':',
            '-' => '-',
            '.' => '.',
        ]
    )]
    protected string $clockSeparator = ':';

    #[Section('time')]
    #[Translatable]
    #[VisibilityFilter('properties.picker !== "browser"')]
    #[VisibilityFilter('properties.clock24h === false')]
    #[VisibilityFilter('["both", "time"].includes(properties.dateTimeType)')]
    #[Limitation('props.date', 'clockAMPMSeparate')]
    #[DefaultValue('props.date.clockAMPMSeparate')]
    #[Input\Boolean('Separate AM/PM with a space')]
    protected bool $clockAMPMSeparate = true;

    public static function normalizePickerProperties(array $properties): array
    {
        if (!isset($properties['picker'])) {
            $properties['picker'] = !empty($properties['useNativeTypes'])
                ? 'browser'
                : (($properties['useDatepicker'] ?? true) ? 'flatpickr' : 'none');
        }

        return $properties;
    }

    public static function getSupportedLocale(string $locale): string
    {
        if (preg_match('/^([a-z]{2})-/', $locale, $matches)) {
            $locale = $matches[1];
        }

        static $supportedLocales = ['ar', 'at', 'az', 'be', 'bg', 'bn', 'cat', 'cs', 'cy', 'da', 'de', 'eo', 'es', 'et', 'fa', 'fi', 'fo', 'fr', 'gr', 'he', 'hi', 'hr', 'hu', 'id', 'is', 'it', 'ja', 'km', 'ko', 'kz', 'lt', 'lv', 'mk', 'mn', 'ms', 'my', 'nl', 'no', 'pa', 'pl', 'pt', 'ro', 'ru', 'si', 'sk', 'sl', 'sq', 'sr-cyr', 'sr', 'sv', 'th', 'tr', 'uk', 'vn', 'zh-tw', 'zh'];

        if (\in_array(strtolower($locale), $supportedLocales, true)) {
            return strtolower($locale);
        }

        return 'default';
    }

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_DATETIME;
    }

    public function getInputType(): string
    {
        if (!$this->isUseNativeTypes() && !$this->isUseDatepicker()) {
            return 'text';
        }

        if ($this->isUseDatepicker()) {
            return 'text';
        }

        return match ($this->dateTimeType) {
            self::DATETIME_TYPE_BOTH => 'datetime-local',
            self::DATETIME_TYPE_DATE => 'date',
            self::DATETIME_TYPE_TIME => 'time',
        };
    }

    public function getValueAsString(): string
    {
        return $this->getValue();
    }

    public function getInitialValue(): string
    {
        return $this->translate('initialValue', $this->initialValue);
    }

    public function getDateTimeType(): string
    {
        return $this->dateTimeType;
    }

    public function isShowDate(): bool
    {
        return \in_array($this->getDateTimeType(), [self::DATETIME_TYPE_DATE, self::DATETIME_TYPE_BOTH], true);
    }

    public function isShowTime(): bool
    {
        return \in_array($this->getDateTimeType(), [self::DATETIME_TYPE_TIME, self::DATETIME_TYPE_BOTH], true);
    }

    public function isGeneratePlaceholder(): bool
    {
        return $this->generatePlaceholder;
    }

    public function getDateOrder(): string
    {
        return $this->translate('dateOrder', $this->dateOrder);
    }

    public function isDate4DigitYear(): bool
    {
        return $this->translate('date4DigitYear', $this->date4DigitYear);
    }

    public function isDateLeadingZero(): bool
    {
        return $this->translate('dateLeadingZero', $this->dateLeadingZero);
    }

    public function getDateSeparator(): string
    {
        $separator = $this->translate('dateSeparator', $this->dateSeparator);

        return match ($separator) {
            'space' => ' ',
            'empty' => '',
            default => $separator,
        };
    }

    public function isClock24h(): bool
    {
        return $this->translate('clock24h', $this->clock24h);
    }

    public function getClockSeparator(): string
    {
        $separator = $this->translate('clockSeparator', $this->clockSeparator);

        return match ($separator) {
            'space' => ' ',
            'empty' => '',
            default => $separator,
        };
    }

    public function isClockAMPMSeparate(): bool
    {
        return $this->translate('clockAMPMSeparate', $this->clockAMPMSeparate);
    }

    public function getPicker(): string
    {
        return isset(self::PICKER_OPTIONS[$this->picker]) ? $this->picker : 'flatpickr';
    }

    public function getPickerLabels(): array
    {
        $labels = ['previous' => 'Previous month', 'next' => 'Next month', 'month' => 'Month', 'year' => 'Year', 'searchMonths' => 'Search months…', 'searchYears' => 'Search years…', 'time' => 'Time', 'today' => 'Today', 'clear' => 'Clear', 'noResults' => 'No matches found.', 'chooseDate' => 'Choose date and time'];

        return array_map(static fn ($label) => Freeform::t($label), $labels);
    }

    public function getMinuteStep(): int
    {
        return \in_array($this->minuteStep, [1, 5, 10, 15, 30, 60], true) ? $this->minuteStep : 30;
    }

    public function isUseDatepicker(): bool
    {
        return \in_array($this->getPicker(), ['freeform', 'flatpickr'], true);
    }

    public function isUseNativeTypes(): bool
    {
        return 'browser' === $this->getPicker();
    }

    public function getMinDate(): ?string
    {
        return $this->translate('minDate', $this->minDate);
    }

    public function getMaxDate(): ?string
    {
        return $this->translate('maxDate', $this->maxDate);
    }

    public function getLocale(): ?string
    {
        return $this->translate('locale', $this->locale);
    }

    public function getGeneratedMinDate(?string $format = null): ?string
    {
        if (!$this->getMinDate()) {
            return null;
        }

        return date($format ?? 'Y-m-d', strtotime($this->getMinDate()));
    }

    public function getGeneratedMaxDate(?string $format = null): ?string
    {
        if (!$this->getMaxDate()) {
            return null;
        }

        return date($format ?? 'Y-m-d', strtotime($this->getMaxDate()));
    }

    public function getMinDateBoundary(): ?Carbon
    {
        return $this->resolveDateBoundary($this->getMinDate(), false);
    }

    public function getMaxDateBoundary(): ?Carbon
    {
        return $this->resolveDateBoundary($this->getMaxDate(), true);
    }

    public function getMinDateInputValue(string $format): ?string
    {
        $date = $this->getMinDateBoundary();
        if ($date && $this->isShowTime() && $date->second) {
            $date->addMinute()->setSecond(0);
        }

        return $date?->format($format);
    }

    public function getMaxDateInputValue(string $format): ?string
    {
        return $this->getMaxDateBoundary()?->format($format);
    }

    public function getPickerMinDate(): ?string
    {
        return $this->getPickerBoundary($this->getMinDate(), false);
    }

    public function getPickerMaxDate(): ?string
    {
        return $this->getPickerBoundary($this->getMaxDate(), true);
    }

    public function getPickerReferenceDate(): string
    {
        return Carbon::now()->format('Y-m-d\TH:i:s');
    }

    public function getPickerReferenceTimestamp(): int
    {
        return Carbon::now()->getTimestamp();
    }

    public function getDateBoundaryFormat(?string $expression): string
    {
        return $this->isShowTime() && $this->hasBoundaryTime($expression ?? '')
            ? $this->getFormat() : $this->getDateFormat();
    }

    public function getMinDateOffset(): ?int
    {
        return $this->getRelativeTimeOffset($this->getMinDate());
    }

    public function getMaxDateOffset(): ?int
    {
        return $this->getRelativeTimeOffset($this->getMaxDate());
    }

    public function getPlaceholder(): string
    {
        if (!$this->isGeneratePlaceholder()) {
            return $this->translate('placeholder', $this->placeholder);
        }

        return $this->getHumanReadableFormat();
    }

    public function getValue(): ?string
    {
        $value = $this->value;

        if (empty($value)) {
            $value = $this->getInitialValue();

            if ($value) {
                try {
                    $date = new \DateTime($value);

                    return $date->format($this->isUseNativeTypes() ? $this->getNativeFormat() : $this->getFormat());
                } catch (\Exception $e) {
                }
            }
        }

        if ($value instanceof \DateTime) {
            return $value->format($this->isUseNativeTypes() ? $this->getNativeFormat() : $this->getFormat());
        }

        return $value;
    }

    public function getCarbon(): ?Carbon
    {
        if ($this->getValue()) {
            try {
                $format = $this->isUseNativeTypes() ? $this->getNativeFormat() : $this->getFormat();

                return Carbon::createFromFormat($format, $this->getValue());
            } catch (InvalidFormatException $exception) {
            }
        }

        return null;
    }

    public function getCarbonUtc(): ?Carbon
    {
        if ($this->getValue()) {
            try {
                $format = $this->isUseNativeTypes() ? $this->getNativeFormat() : $this->getFormat();

                return Carbon::createFromFormat($format, $this->getValue(), 'UTC');
            } catch (InvalidFormatException $exception) {
            }
        }

        return null;
    }

    public function getDatepickerFormat(): string
    {
        $format = $this->getFormat();

        return str_replace(
            ['G', 'g', 'a', 'A'],
            ['H', 'h', 'K', 'K'],
            $format
        );
    }

    /**
     * Converts Y/m/d to YYYY/MM/DD, etc.
     */
    public function getHumanReadableFormat(): string
    {
        $format = $this->getFormat();

        return str_replace(
            ['Y', 'y', 'n', 'm', 'j', 'd', 'H', 'h', 'G', 'g', 'i', 'A', 'a'],
            ['YYYY', 'YY', 'M', 'MM', 'D', 'DD', 'HH', 'H', 'HH', 'H', 'MM', 'TT', 'TT'],
            $format
        );
    }

    /**
     * Gets the datetime format based on selected field settings.
     */
    public function getFormat(): string
    {
        $showDate = \in_array($this->getDateTimeType(), [self::DATETIME_TYPE_BOTH, self::DATETIME_TYPE_DATE], true);
        $showTime = \in_array($this->getDateTimeType(), [self::DATETIME_TYPE_BOTH, self::DATETIME_TYPE_TIME], true);

        $formatParts = [];
        if ($showDate) {
            $formatParts[] = $this->getDateFormat();
        }

        if ($showTime) {
            $formatParts[] = $this->getTimeFormat();
        }

        return implode(' ', $formatParts);
    }

    public function getNativeFormat(): string
    {
        return match ($this->getDateTimeType()) {
            self::DATETIME_TYPE_DATE => 'Y-m-d',
            self::DATETIME_TYPE_TIME => 'H:i',
            default => 'Y-m-d\TH:i',
        };
    }

    public function getDateFormat(): string
    {
        $month = $this->isDateLeadingZero() ? 'm' : 'n';
        $day = $this->isDateLeadingZero() ? 'd' : 'j';
        $year = $this->isDate4DigitYear() ? 'Y' : 'y';

        $first = $second = $third = null;

        switch ($this->getDateOrder()) {
            case 'mdy':
                $first = $month;
                $second = $day;
                $third = $year;

                break;

            case 'dmy':
                $first = $day;
                $second = $month;
                $third = $year;

                break;

            case 'ymd':
                $first = $year;
                $second = $month;
                $third = $day;

                break;
        }

        return \sprintf(
            '%s%s%s%s%s',
            $first,
            $this->getDateSeparator(),
            $second,
            $this->getDateSeparator(),
            $third
        );
    }

    public function getTimeFormat(): string
    {
        $minutes = 'i';

        if ($this->isClock24h()) {
            $hours = 'H';
            $ampm = '';
        } else {
            $hours = 'g';
            $ampm = ($this->isClockAMPMSeparate() ? ' ' : '').'A';
        }

        return $hours.$this->getClockSeparator().$minutes.$ampm;
    }

    public function getContentGqlType(): array|GQLType
    {
        return DateTimeType::getType();
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();
        $description[] = 'Format: "'.$this->getHumanReadableFormat().'".';

        if (!empty($this->getMaxLength())) {
            $description[] = 'Max length: '.$this->getMaxLength().'.';
        }

        $description = implode("\n", $description);

        return [
            'name' => $this->getContentGqlHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    protected function getInputHtml(): string
    {
        $hasTime = \in_array($this->getDateTimeType(), [self::DATETIME_TYPE_BOTH, self::DATETIME_TYPE_TIME], true);
        $hasDate = \in_array($this->getDateTimeType(), [self::DATETIME_TYPE_BOTH, self::DATETIME_TYPE_DATE], true);
        $locale = $this->locale ?: \Craft::$app->locale->id;

        if ($this->isUseNativeTypes()) {
            $carbon = $this->getCarbon();
            $value = $carbon
                ? $carbon->format($this->getNativeFormat())
                : null;
        } else {
            $value = $this->getValue();
        }

        $minDate = $this->getMinDate() === 'today'
            ? 'today'
            : $this->getMinDateInputValue($this->getFormat());

        $maxDate = $this->getMaxDate() === 'today'
            ? 'today'
            : $this->getMaxDateInputValue($this->getFormat());

        $attributes = $this->getAttributes()
            ->getInput()
            ->clone()
            ->append('class', 'form-date-time-field')
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', $this->getInputType())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('placeholder', $this->getPlaceholder())
            ->setIfEmpty('value', $value)
            ->set($this->getRequiredAttribute())
            ->set('data-datepicker', true)
            ->set('data-datepicker-enabled', $this->isUseDatepicker())
            ->set('data-datepicker-kind', $this->getPicker())
            ->set('data-datepicker-labels', json_encode($this->getPickerLabels(), \JSON_THROW_ON_ERROR))
            ->set('data-datepicker-php-format', $this->getFormat())
            ->set('data-datepicker-minute-step', $this->getMinuteStep())
            ->set('data-datepicker-min-value', $this->getPickerMinDate())
            ->set('data-datepicker-max-value', $this->getPickerMaxDate())
            ->set('data-datepicker-reference-date', $this->getPickerReferenceDate())
            ->set('data-datepicker-reference-timestamp', $this->getPickerReferenceTimestamp())
            ->set('data-datepicker-min-offset', $this->getMinDateOffset())
            ->set('data-datepicker-max-offset', $this->getMaxDateOffset())
            ->set('data-datepicker-format', $this->getDatepickerFormat())
            ->set('data-datepicker-enabletime', $hasTime)
            ->set('data-datepicker-enabledate', $hasDate)
            ->set('data-datepicker-clock_24h', $this->isClock24h())
            ->set('data-datepicker-locale', $this->getSupportedLocale($locale))
            ->set('data-datepicker-language', $locale)
            ->set('data-datepicker-min-date', $minDate)
            ->set('data-datepicker-max-date', $maxDate)
        ;

        if ($this->isUseDatepicker()) {
            $attributes->append('class', 'form-datepicker');
        }

        if ($this->isUseNativeTypes() && $hasDate) {
            $attributes
                ->set('min', $this->getMinDateInputValue($this->getNativeFormat()))
                ->set('max', $this->getMaxDateInputValue($this->getNativeFormat()))
            ;
        }

        return Html::tag(
            $attributes->getTag('input'),
            '',
            $attributes->toHtmlTagArray(['field' => $this]),
        );
    }

    private function resolveDateBoundary(?string $expression, bool $maximum): ?Carbon
    {
        if (!$expression) {
            return null;
        }

        try {
            $date = Carbon::parse($expression)->setTimezone(date_default_timezone_get())->setMicrosecond(0);
        } catch (\InvalidArgumentException) {
            return null;
        }

        // Date-only expressions retain inclusive whole-day limits. Expressions
        // containing an explicit time or relative hours/minutes retain that time.
        if (!$this->isShowTime() || !$this->hasBoundaryTime($expression)) {
            return $maximum ? $date->endOfDay()->setMicrosecond(0) : $date->startOfDay();
        }

        return $date;
    }

    private function getPickerBoundary(?string $expression, bool $maximum): ?string
    {
        if ('today' === $expression) {
            return 'today';
        }

        return $this->resolveDateBoundary($expression, $maximum)?->format(
            $this->isShowTime() && $this->hasBoundaryTime($expression ?? '') ? 'Y-m-d\TH:i:s' : 'Y-m-d'
        );
    }

    private function hasBoundaryTime(string $expression): bool
    {
        if (preg_match('/\b(?:now|noon|midnight|hours?|hrs?|minutes?|mins?|seconds?|secs?)\b|\d{1,2}:\d{2}|\d\s*(?:am|pm)\b/i', $expression)) {
            return true;
        }

        $parts = date_parse($expression);

        return false !== $parts['hour'] && !isset($parts['relative'])
            && !\in_array(strtolower(trim($expression)), ['today', 'tomorrow', 'yesterday'], true);
    }

    private function getRelativeTimeOffset(?string $expression): ?int
    {
        if (!$expression || !$this->isShowTime() || !$this->hasBoundaryTime($expression)) {
            return null;
        }

        $parts = date_parse($expression);
        $relative = $parts['relative'] ?? [];
        if ($parts['error_count'] || false !== $parts['year'] || false !== $parts['month']
            || false !== $parts['day'] || false !== $parts['hour']
            || !empty($relative['year']) || !empty($relative['month']) || isset($relative['weekday'])) {
            return null;
        }

        return ($relative['day'] ?? 0) * 86400 + ($relative['hour'] ?? 0) * 3600
            + ($relative['minute'] ?? 0) * 60 + ($relative['second'] ?? 0);
    }
}
