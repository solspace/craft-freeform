<?php

namespace Solspace\Freeform\Library\Factories;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExternalOptionsInterface;
use Solspace\Freeform\Library\Configuration\ExternalOptionsConfiguration;

class PredefinedOptionsFactory
{
    const TYPE_INT = 'int';
    const TYPE_INT_LEADING_ZERO = 'int_w_zero';
    const TYPE_FULL = 'full';
    const TYPE_ABBREVIATED = 'abbreviated';

    /** @var ExternalOptionsConfiguration */
    private $configuration;

    /** @var array */
    private $selectedValues;

    /**
     * PredefinedOptionsFactory constructor.
     */
    private function __construct(ExternalOptionsConfiguration $configuration, array $selectedValues)
    {
        $this->configuration = $configuration;
        $this->selectedValues = $selectedValues;
    }

    /**
     * @return Option[]
     */
    public static function create(string $type, ExternalOptionsConfiguration $configuration, array $selectedValues = []): array
    {
        $instance = new self($configuration, $selectedValues);

        switch ($type) {
            case ExternalOptionsInterface::PREDEFINED_NUMBERS:
                $options = $instance->getNumberOptions();

                break;

            case ExternalOptionsInterface::PREDEFINED_YEARS:
                $options = $instance->getYearOptions();

                break;

            case ExternalOptionsInterface::PREDEFINED_MONTHS:
                $options = $instance->getMonthOptions();

                break;

            case ExternalOptionsInterface::PREDEFINED_DAYS:
                $options = $instance->getDayOptions();

                break;

            case ExternalOptionsInterface::PREDEFINED_DAYS_OF_WEEK:
                $options = $instance->getDaysOfWeekOptions();

                break;

            case ExternalOptionsInterface::PREDEFINED_COUNTRIES:
                $options = $instance->getCountryOptions();

                break;

            case ExternalOptionsInterface::PREDEFINED_LANGUAGES:
                $options = $instance->getLanguageOptions();

                break;

            case ExternalOptionsInterface::PREDEFINED_PROVINCES:
            case ExternalOptionsInterface::PREDEFINED_PROVINCES_FR:
            case ExternalOptionsInterface::PREDEFINED_PROVINCES_BIL:
                $options = $instance->getProvinceOptions($type);

                break;

            case ExternalOptionsInterface::PREDEFINED_STATES:
                $options = $instance->getStateOptions();

                break;

            case ExternalOptionsInterface::PREDEFINED_STATES_TERRITORIES:
                $options = $instance->getStateTerritoryOptions();

                break;

            case ExternalOptionsInterface::PREDEFINED_CURRENCIES:
                $options = $instance->getCurrencyOptions();

                break;

            default:
                $options = [];

                break;
        }

        if ($configuration->getEmptyOption()) {
            array_unshift($options, new Option(Freeform::t($configuration->getEmptyOption()), ''));
        }

        return $options;
    }

    /**
     * @return Option[]
     */
    private function getNumberOptions(): array
    {
        $options = [];

        $start = $this->getConfig()->getStart() ?? 0;
        $end = $this->getConfig()->getEnd() ?? 20;
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
        $start = $this->getConfig()->getStart() ?? 100;
        $end = $this->getConfig()->getEnd() ?? 0;
        $isDesc = 'desc' === $this->getConfig()->getSort();

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
            $label = date($labelFormat, strtotime("january 2017 +{$month} month"));
            $value = date($valueFormat, strtotime("january 2017 +{$month} month"));

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
            $label = 'd' === $labelFormat ? str_pad($dayIndex, 2, '0', \STR_PAD_LEFT) : $dayIndex;
            $value = 'd' === $valueFormat ? str_pad($dayIndex, 2, '0', \STR_PAD_LEFT) : $dayIndex;

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
        $labelFormat = self::getDayOfTheWeekFormatFromType($this->getConfig()->getListType());
        $valueFormat = self::getDayOfTheWeekFormatFromType($this->getConfig()->getValueType());
        foreach (range(0, 6) as $dayIndex) {
            $dayIndex += $firstDayOfWeek;

            $label = date($labelFormat, strtotime("Sunday +{$dayIndex} days"));
            $value = date($valueFormat, strtotime("Sunday +{$dayIndex} days"));

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
            $countries = json_decode(file_get_contents(__DIR__.'/Data/countries.json'), true);
        }

        $options = [];
        $isShortLabel = self::TYPE_ABBREVIATED === $this->getConfig()->getListType();
        $isShortValue = self::TYPE_ABBREVIATED === $this->getConfig()->getValueType();
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
            $languages = json_decode(file_get_contents(__DIR__.'/Data/languages.json'), true);
        }

        $options = [];
        $isShortLabel = self::TYPE_ABBREVIATED === $this->getConfig()->getListType();
        $isShortValue = self::TYPE_ABBREVIATED === $this->getConfig()->getValueType();
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
    private function getProvinceOptions(string $source = null): array
    {
        switch ($source) {
            case ExternalOptionsInterface::PREDEFINED_PROVINCES_FR:
                $path = __DIR__.'/Data/provinces_fr.json';

                break;

            case ExternalOptionsInterface::PREDEFINED_PROVINCES_BIL:
                $path = __DIR__.'/Data/provinces_bil.json';

                break;

            case ExternalOptionsInterface::PREDEFINED_PROVINCES:
            default:
                $path = __DIR__.'/Data/provinces.json';

                break;
        }

        /** @var array $provinces */
        static $provinces;
        if (null === $provinces) {
            $provinces = json_decode(file_get_contents($path), true);
        }

        $options = [];
        $isShortLabel = self::TYPE_ABBREVIATED === $this->getConfig()->getListType();
        $isShortValue = self::TYPE_ABBREVIATED === $this->getConfig()->getValueType();
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
            $states = json_decode(file_get_contents(__DIR__.'/Data/states.json'), true);
        }

        $options = [];
        $isShortLabel = self::TYPE_ABBREVIATED === $this->getConfig()->getListType();
        $isShortValue = self::TYPE_ABBREVIATED === $this->getConfig()->getValueType();
        foreach ($states as $abbreviation => $stateName) {
            $label = $isShortLabel ? $abbreviation : $stateName;
            $value = $isShortValue ? $abbreviation : $stateName;

            $options[] = new Option($label, $value, $this->isChecked($value));
        }

        return $options;
    }

    /**
     * @return Option[]
     */
    private function getStateTerritoryOptions(): array
    {
        /** @var array $states */
        static $states;
        if (null === $states) {
            $states = json_decode(file_get_contents(__DIR__.'/Data/states-territories.json'), true);
        }

        $options = [];
        $isShortLabel = self::TYPE_ABBREVIATED === $this->getConfig()->getListType();
        $isShortValue = self::TYPE_ABBREVIATED === $this->getConfig()->getValueType();
        foreach ($states as $abbreviation => $stateName) {
            $label = $isShortLabel ? $abbreviation : $stateName;
            $value = $isShortValue ? $abbreviation : $stateName;

            $options[] = new Option($label, $value, $this->isChecked($value));
        }

        return $options;
    }

    /**
     * @return Option[]
     */
    private function getCurrencyOptions(): array
    {
        /** @var array $states */
        static $states;
        if (null === $states) {
            $states = json_decode(file_get_contents(__DIR__.'/Data/currencies.json'), true);
        }

        $options = [];
        $isShortLabel = self::TYPE_ABBREVIATED === $this->getConfig()->getListType();
        $isShortValue = self::TYPE_ABBREVIATED === $this->getConfig()->getValueType();
        foreach ($states as $isoCode => $data) {
            $label = $isShortLabel ? $isoCode : $data['name'];
            $value = $isShortValue ? $isoCode : $data['name'];

            $options[] = new Option($label, $value, $this->isChecked($value));
        }

        return $options;
    }

    /**
     * @param mixed $value
     */
    private function isChecked(string $value): bool
    {
        return \in_array($value, $this->selectedValues, true);
    }

    private function getConfig(): ExternalOptionsConfiguration
    {
        return $this->configuration;
    }

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
