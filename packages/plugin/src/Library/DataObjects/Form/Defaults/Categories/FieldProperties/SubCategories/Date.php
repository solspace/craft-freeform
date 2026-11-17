<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories;

use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class Date extends BaseCategory
{
    #[Label('Type')]
    #[SetDefaultValue(DatetimeField::DATETIME_TYPE_BOTH)]
    #[OptionsGenerator([
        DatetimeField::DATETIME_TYPE_DATE => 'Date',
        DatetimeField::DATETIME_TYPE_TIME => 'Time',
        DatetimeField::DATETIME_TYPE_BOTH => 'Date & Time',
    ])]
    public SelectItem $type;

    #[Label('Initial Value')]
    public TextItem $initialValue;

    #[Label('Force a Locale')]
    public TextItem $locale;

    #[Label('Date Picker')]
    #[SetDefaultValue('freeform')]
    #[OptionsGenerator(DatetimeField::PICKER_OPTIONS)]
    public SelectItem $picker;

    #[Label('Time Interval (Minutes)')]
    #[SetDefaultValue(30)]
    #[OptionsGenerator([1 => '1', 5 => '5', 10 => '10', 15 => '15', 30 => '30', 60 => '60'])]
    public SelectItem $minuteStep;

    #[Label('Use Date Format as Placeholder')]
    #[SetDefaultValue(true)]
    public BoolItem $formatAsPlaceholder;

    #[Label('Date Order')]
    #[SetDefaultValue('ymd')]
    #[OptionsGenerator([
        'ymd' => 'Year, Month, Day',
        'mdy' => 'Month, Day, Year',
        'dmy' => 'Day, Month, Year',
    ])]
    public SelectItem $dateOrder;

    #[Label('Four-Digit Year')]
    #[SetDefaultValue(true)]
    public BoolItem $date4DigitYear;

    #[Label('Leading Zero on Date')]
    #[SetDefaultValue(true)]
    public BoolItem $dateLeadingZero;

    #[Label('Date Separator')]
    #[SetDefaultValue('-')]
    #[OptionsGenerator([
        ' ' => 'Space',
        '/' => '/',
        '-' => '-',
        '.' => '.',
    ])]
    public SelectItem $dateSeparator;

    #[Label('Minimum Date')]
    public TextItem $minDate;

    #[Label('Maximum Date')]
    public TextItem $maxDate;

    #[Label('24-Hour Clock')]
    #[SetDefaultValue(false)]
    public BoolItem $clock24h;

    #[Label('Clock Separator')]
    #[SetDefaultValue(':')]
    #[OptionsGenerator([
        ' ' => 'Space',
        ':' => ':',
        '-' => '-',
        '.' => '.',
    ])]
    public SelectItem $clockSeparator;

    #[Label('Separate AM/PM with a Space')]
    #[SetDefaultValue(true)]
    public BoolItem $clockAMPMSeparate;

    public function __construct(array $config = [])
    {
        // Preserve deliberately configured legacy defaults as well as their locks.
        if (!isset($config['picker']) && (isset($config['datepicker']) || isset($config['nativeTypes']))) {
            $native = $config['nativeTypes']['value'] ?? false;
            $enabled = $config['datepicker']['value'] ?? true;
            $config['picker'] = [
                'value' => $native ? 'browser' : ($enabled ? 'freeform' : 'none'),
                'locked' => ($config['nativeTypes']['locked'] ?? false) || ($config['datepicker']['locked'] ?? false),
            ];
        }
        if (isset($config['picker']['value']) && !isset(DatetimeField::PICKER_OPTIONS[$config['picker']['value']])) {
            $config['picker']['value'] = 'freeform';
        }
        parent::__construct($config);
    }

    public function getLabel(): string
    {
        return 'Date & Time';
    }
}
