<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Carbon\Carbon;
use Carbon\Exceptions\InvalidFormatException;
use craft\gql\types\DateTime as DateTimeType;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\DatetimeInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\InitialValueInterface;
use Solspace\Freeform\Fields\Traits\InitialValueTrait;

#[Type(
    name: 'Date & Time',
    typeShorthand: 'datetime',
    iconPath: __DIR__.'/../Icons/date-time.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/date-time.ejs',
)]
class DatetimeField extends TextField implements InitialValueInterface, DatetimeInterface, ExtraFieldInterface
{
    use InitialValueTrait;

    public const DATETIME_TYPE_BOTH = 'both';
    public const DATETIME_TYPE_DATE = 'date';
    public const DATETIME_TYPE_TIME = 'time';

    #[Input\Select(
        label: 'Type',
        instructions: 'Choose between using date, time or both.',
        options: [
            self::DATETIME_TYPE_BOTH => 'Date & Time',
            self::DATETIME_TYPE_DATE => 'Date',
            self::DATETIME_TYPE_TIME => 'Time',
        ],
    )]
    protected string $dateTimeType = self::DATETIME_TYPE_BOTH;

    #[Input\Text(
        label: 'Locale (Optional)',
        instructions: "Enter your desired custom locale (e.g. `fr`, `ru`, etc.) to force the datepicker to use that locale. Otherwise leave blank to use the default site's locale set by Craft.",
    )]
    protected ?string $locale = null;

    #[Input\Boolean('Use the Freeform datepicker for this field?')]
    protected bool $useDatepicker = true;

    #[Input\Boolean('Generate placeholder from your date format settings?')]
    protected bool $generatePlaceholder = true;

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
    )]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Input\Select(
        label: 'Date Order',
        instructions: 'Choose the order in which to show day, month and year.',
        options: [
            'ymd' => 'Year, Month, Day',
            'mdy' => 'Month, Day, Year',
            'dmy' => 'Day, Month, Year',
        ],
    )]
    protected string $dateOrder = 'ymd';

    #[Section('date')]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Input\Boolean('Four digit year?')]
    protected bool $date4DigitYear = true;

    #[Section('date')]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Input\Boolean(
        label: 'Leading zero on date?',
        instructions: 'If enabled, a leading zero will be used for days and months.'
    )]
    protected bool $dateLeadingZero = true;

    #[Section('date')]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Input\Select(
        label: 'Date Separator',
        instructions: 'Used to separate date values.',
        emptyOption: 'None',
        options: [
            ' ' => 'Space',
            '/' => '/',
            '-' => '-',
            '.' => '.',
        ]
    )]
    protected string $dateSeparator = '-';

    #[Section('date')]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Input\Text(
        label: 'Min Date',
        instructions: 'Specify a relative textual date string or static date for the earliest date available for date picker and field validation.',
    )]
    protected ?string $minDate = null;

    #[Section('date')]
    #[VisibilityFilter('["both", "date"].includes(properties.dateTimeType)')]
    #[Input\Text(
        label: 'Max Date',
        instructions: 'Specify a relative textual date string or static date for the latest date available for date picker and field validation.',
    )]
    protected ?string $maxDate = null;

    #[Section(
        handle: 'time',
        label: 'Time settings',
        icon: __DIR__.'/../../SectionIcons/time.svg',
    )]
    #[VisibilityFilter('["both", "time"].includes(properties.dateTimeType)')]
    #[Input\Boolean('24h clock?')]
    protected bool $clock24h = false;

    #[Section('time')]
    #[VisibilityFilter('["both", "time"].includes(properties.dateTimeType)')]
    #[Input\Select(
        label: 'Clock Separator',
        instructions: 'Used to separate clock values.',
        emptyOption: 'None',
        options: [
            ' ' => 'Space',
            ':' => ':',
            '-' => '-',
            '.' => '.',
        ]
    )]
    protected string $clockSeparator = ':';

    #[Section('time')]
    #[VisibilityFilter('["both", "time"].includes(properties.dateTimeType)')]
    #[Input\Boolean('Separate AM/PM with a space?')]
    protected bool $clockAMPMSeparate = true;

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

    public function getDateTimeType(): string
    {
        return $this->dateTimeType;
    }

    public function isGeneratePlaceholder(): bool
    {
        return $this->generatePlaceholder;
    }

    public function getDateOrder(): string
    {
        return $this->dateOrder;
    }

    public function isDate4DigitYear(): bool
    {
        return $this->date4DigitYear;
    }

    public function isDateLeadingZero(): bool
    {
        return $this->dateLeadingZero;
    }

    public function getDateSeparator(): string
    {
        return $this->dateSeparator;
    }

    public function isClock24h(): bool
    {
        return $this->clock24h;
    }

    public function getClockSeparator(): string
    {
        return $this->clockSeparator;
    }

    public function isClockAMPMSeparate(): bool
    {
        return $this->clockAMPMSeparate;
    }

    public function isUseDatepicker(): bool
    {
        return (bool) $this->useDatepicker;
    }

    /**
     * @return null|string
     */
    public function getMinDate()
    {
        return $this->minDate;
    }

    /**
     * @return null|string
     */
    public function getMaxDate()
    {
        return $this->maxDate;
    }

    /**
     * @return null|string
     */
    public function getLocale()
    {
        return $this->locale;
    }

    /**
     * @return null|string
     */
    public function getGeneratedMinDate(string $format = null)
    {
        if (!$this->minDate) {
            return null;
        }

        return date($format ?? 'Y-m-d', strtotime($this->minDate));
    }

    /**
     * @return null|string
     */
    public function getGeneratedMaxDate(string $format = null)
    {
        if (!$this->maxDate) {
            return null;
        }

        return date($format ?? 'Y-m-d', strtotime($this->maxDate));
    }

    public function getPlaceholder(): string
    {
        if (!$this->isGeneratePlaceholder()) {
            return $this->placeholder;
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

                    return $date->format($this->getFormat());
                } catch (\Exception $e) {
                }
            }
        }

        if ($value instanceof \DateTime) {
            return $value->format($this->getFormat());
        }

        return $value;
    }

    /**
     * @return null|Carbon
     */
    public function getCarbon()
    {
        if ($this->getValue()) {
            try {
                return Carbon::createFromFormat($this->getFormat(), $this->getValue());
            } catch (InvalidFormatException $exception) {
            }
        }

        return null;
    }

    /**
     * @return null|Carbon
     */
    public function getCarbonUtc()
    {
        if ($this->getValue()) {
            try {
                return Carbon::createFromFormat($this->getFormat(), $this->getValue(), 'UTC');
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

        return sprintf(
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

        $description = implode("\n", $description);

        return [
            'name' => $this->getHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    protected function getInputHtml(): string
    {
        $hasTime = \in_array($this->getDateTimeType(), [self::DATETIME_TYPE_BOTH, self::DATETIME_TYPE_TIME], true);
        $hasDate = \in_array($this->getDateTimeType(), [self::DATETIME_TYPE_BOTH, self::DATETIME_TYPE_DATE], true);
        $locale = $this->locale ?: \Craft::$app->locale->id;

        $attributes = $this->attributes->getInput()
            ->clone()
            ->append('class', 'form-date-time-field')
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', $this->getType())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('placeholder', $this->translate($this->getPlaceholder()))
            ->setIfEmpty('value', $this->getValue())
            ->set($this->getRequiredAttribute())
            ->set('data-datepicker', true)
            ->set('data-datepicker-enabled', $this->isUseDatepicker())
            ->set('data-datepicker-format', $this->getDatepickerFormat())
            ->set('data-datepicker-enabletime', $hasTime)
            ->set('data-datepicker-enabledate', $hasDate)
            ->set('data-datepicker-clock_24h', $this->isClock24h())
            ->set('data-datepicker-locale', $this->getSupportedLocale($locale))
            ->set('data-datepicker-min-date', $this->getGeneratedMinDate($this->getFormat()))
            ->set('data-datepicker-max-date', $this->getGeneratedMaxDate($this->getFormat()))
        ;

        if ($this->isUseDatepicker()) {
            $attributes->append('class', 'form-datepicker');
        }

        return '<input'.$attributes.' />';
    }
}
