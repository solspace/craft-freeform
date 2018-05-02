<?php

namespace Solspace\Freeform\Library\Factories;

use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExternalOptionsInterface;
use Solspace\Freeform\Library\Configuration\ExternalOptionsConfiguration;

class PredefinedOptionsFactory
{
    const TYPE_INT              = 'int';
    const TYPE_INT_LEADING_ZERO = 'int_w_zero';
    const TYPE_FULL             = 'full';
    const TYPE_ABBREVIATED      = 'abbreviated';

    /** @var ExternalOptionsConfiguration */
    private $configuration;

    /** @var array */
    private $selectedValues;

    /**
     * @param string                       $type
     * @param ExternalOptionsConfiguration $configuration
     * @param array                        $selectedValues
     *
     * @return Option[]
     */
    public static function create(string $type, ExternalOptionsConfiguration $configuration, array $selectedValues = []): array
    {
        $instance = new self($configuration, $selectedValues);
        
        switch ($type) {
            case ExternalOptionsInterface::PREDEFINED_NUMBERS:
                return $instance->getNumberOptions();

            case ExternalOptionsInterface::PREDEFINED_YEARS:
                return $instance->getYearOptions();

            case ExternalOptionsInterface::PREDEFINED_MONTHS:
                return $instance->getMonthOptions();

            case ExternalOptionsInterface::PREDEFINED_DAYS:
                return $instance->getDayOptions();

            case ExternalOptionsInterface::PREDEFINED_DAYS_OF_WEEK:
                return $instance->getDaysOfWeekOptions();

            case ExternalOptionsInterface::PREDEFINED_COUNTRIES:
                return $instance->getCountryOptions();

            case ExternalOptionsInterface::PREDEFINED_LANGUAGES:
                return $instance->getLanguageOptions();

            case ExternalOptionsInterface::PREDEFINED_PROVINCES:
                return $instance->getProvinceOptions();

            case ExternalOptionsInterface::PREDEFINED_STATES:
                return $instance->getStateOptions();
        }

        return [];
    }

    /**
     * PredefinedOptionsFactory constructor.
     *
     * @param ExternalOptionsConfiguration $configuration
     * @param array                        $selectedValues
     */
    private function __construct(ExternalOptionsConfiguration $configuration, array $selectedValues)
    {
        $this->configuration  = $configuration;
        $this->selectedValues = $selectedValues;
    }

    /**
     * @return Option[]
     */
    private function getNumberOptions(): array
    {
        $options = [];

        $start = $this->getConfig()->getStart() ?? 0;
        $end   = $this->getConfig()->getEnd() ?? 20;
        foreach (range($start, $end) as $number) {
            $options[] = new Option($number, $number, $this->isChecked($number));
        }

        return $options;
    }

    /**
     * @return Option[]
     */
    private function getYearOptions(): array
    {
        $options = [];

        $currentYear = (int) date('Y');
        $start       = $this->getConfig()->getStart() ?? 100;
        $end         = $this->getConfig()->getEnd() ?? 0;
        $isDesc      = $this->getConfig()->getSort() === 'desc';

        $range = $isDesc ? range($currentYear + $end, $currentYear - $start) : range($currentYear - $start, $currentYear + $end);
        foreach ($range as $year) {
            $options[] = new Option($year, $year, $this->isChecked($year));
        }

        return $options;
    }

    /**
     * @return Option[]
     */
    private function getMonthOptions(): array
    {
        $options = [];

        $labelFormat = self::getMonthFormatFromType($this->getConfig()->getListType());
        $valueFormat = self::getMonthFormatFromType($this->getConfig()->getValueType());
        foreach (range(0, 11) as $month) {
            $label = date($labelFormat, strtotime("january 2017 +$month month"));
            $value = date($valueFormat, strtotime("january 2017 +$month month"));

            $options[] = new Option($label, $value, $this->isChecked($value));
        }

        return $options;
    }

    /**
     * @return Option[]
     */
    private function getDayOptions(): array
    {
        $options = [];

        $labelFormat = self::getDayFormatFromType($this->getConfig()->getListType());
        $valueFormat = self::getDayFormatFromType($this->getConfig()->getValueType());

        foreach (range(1, 31) as $dayIndex) {
            $label = $labelFormat === 'd' ? str_pad($dayIndex, 2, '0', STR_PAD_LEFT) : $dayIndex;
            $value = $valueFormat === 'd' ? str_pad($dayIndex, 2, '0', STR_PAD_LEFT) : $dayIndex;

            $options[] = new Option($label, $value, $this->isChecked($value));
        }

        return $options;
    }

    /**
     * @return Option[]
     */
    private function getDaysOfWeekOptions(): array
    {
        $options = [];

        $firstDayOfWeek = $this->getConfig()->getStart() ?? 1;
        $labelFormat    = self::getDayOfTheWeekFormatFromType($this->getConfig()->getListType());
        $valueFormat    = self::getDayOfTheWeekFormatFromType($this->getConfig()->getValueType());
        foreach (range(0, 6) as $dayIndex) {
            $dayIndex += $firstDayOfWeek;

            $label = date($labelFormat, strtotime("Sunday +$dayIndex days"));
            $value = date($valueFormat, strtotime("Sunday +$dayIndex days"));

            $options[] = new Option($label, $value, $this->isChecked($value));
        }

        return $options;
    }

    /**
     * @return Option[]
     */
    private function getCountryOptions(): array
    {
        /** @var array $countries */
        static $countries;
        if (null === $countries) {
            $countries = json_decode(file_get_contents(__DIR__ . '/Data/countries.json'), true);
        }

        $options      = [];
        $isShortLabel = $this->getConfig()->getListType() === self::TYPE_ABBREVIATED;
        $isShortValue = $this->getConfig()->getValueType() === self::TYPE_ABBREVIATED;
        foreach ($countries as $abbreviation => $countryName) {
            $label = $isShortLabel ? $abbreviation : $countryName;
            $value = $isShortValue ? $abbreviation : $countryName;

            $options[] = new Option($label, $value, $this->isChecked($value));
        }

        return $options;
    }

    /**
     * @return Option[]
     */
    private function getLanguageOptions(): array
    {
        /** @var array $languages */
        static $languages;
        if (null === $languages) {
            $languages = json_decode(file_get_contents(__DIR__ . '/Data/languages.json'), true);
        }

        $options      = [];
        $isShortLabel = $this->getConfig()->getListType() === self::TYPE_ABBREVIATED;
        $isShortValue = $this->getConfig()->getValueType() === self::TYPE_ABBREVIATED;
        foreach ($languages as $abbreviation => $data) {
            $label = $isShortLabel ? $abbreviation : $data['name'];
            $value = $isShortValue ? $abbreviation : $data['name'];

            $options[] = new Option($label, $value, $this->isChecked($value));
        }

        return $options;
    }

    /**
     * @return Option[]
     */
    private function getProvinceOptions(): array
    {
        /** @var array $provinces */
        static $provinces;
        if (null === $provinces) {
            $provinces = json_decode(file_get_contents(__DIR__ . '/Data/provinces.json'), true);
        }

        $options      = [];
        $isShortLabel = $this->getConfig()->getListType() === self::TYPE_ABBREVIATED;
        $isShortValue = $this->getConfig()->getValueType() === self::TYPE_ABBREVIATED;
        foreach ($provinces as $abbreviation => $provinceName) {
            $label = $isShortLabel ? $abbreviation : $provinceName;
            $value = $isShortValue ? $abbreviation : $provinceName;

            $options[] = new Option($label, $value, $this->isChecked($value));
        }

        return $options;
    }

    /**
     * @return Option[]
     */
    private function getStateOptions(): array
    {
        /** @var array $states */
        static $states;
        if (null === $states) {
            $states = json_decode(file_get_contents(__DIR__ . '/Data/states.json'), true);
        }

        $options      = [];
        $isShortLabel = $this->getConfig()->getListType() === self::TYPE_ABBREVIATED;
        $isShortValue = $this->getConfig()->getValueType() === self::TYPE_ABBREVIATED;
        foreach ($states as $abbreviation => $stateName) {
            $label = $isShortLabel ? $abbreviation : $stateName;
            $value = $isShortValue ? $abbreviation : $stateName;

            $options[] = new Option($label, $value, $this->isChecked($value));
        }

        return $options;
    }

    /**
     * @param mixed $value
     *
     * @return bool
     */
    private function isChecked($value): bool
    {
        return \in_array($value, $this->selectedValues, false);
    }

    /**
     * @return ExternalOptionsConfiguration
     */
    private function getConfig(): ExternalOptionsConfiguration
    {
        return $this->configuration;
    }

    /**
     * @param string|null $type
     *
     * @return string
     */
    private static function getMonthFormatFromType(string $type = null): string
    {
        $format = 'F';
        switch ($type) {
            case self::TYPE_INT:
                $format = 'n';
                break;

            case self::TYPE_INT_LEADING_ZERO:
                $format = 'm';
                break;

            case self::TYPE_ABBREVIATED:
                $format = 'M';
                break;
        }

        return $format;
    }

    /**
     * @param string|null $type
     *
     * @return string
     */
    private static function getDayFormatFromType(string $type = null): string
    {
        $format = 'd';
        switch ($type) {
            case self::TYPE_INT:
            case self::TYPE_ABBREVIATED:
                $format = 'j';
                break;
        }

        return $format;
    }

    /**
     * @param string|null $type
     *
     * @return string
     */
    private static function getDayOfTheWeekFormatFromType(string $type = null): string
    {
        $format = 'l';
        switch ($type) {
            case self::TYPE_INT:
                $format = 'N';
                break;

            case self::TYPE_ABBREVIATED:
                $format = 'D';
                break;
        }

        return $format;
    }
}