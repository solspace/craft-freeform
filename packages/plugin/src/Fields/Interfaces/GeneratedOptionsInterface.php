<?php

namespace Solspace\Freeform\Fields\Interfaces;

use Solspace\Freeform\Fields\Properties\Options\OptionsConfigurationInterface;

interface GeneratedOptionsInterface extends OptionsInterface
{
    public const PREDEFINED_DAYS = 'days';
    public const PREDEFINED_DAYS_OF_WEEK = 'days_of_week';
    public const PREDEFINED_MONTHS = 'months';
    public const PREDEFINED_NUMBERS = 'numbers';
    public const PREDEFINED_YEARS = 'years';
    public const PREDEFINED_PROVINCES = 'provinces';
    public const PREDEFINED_PROVINCES_FR = 'provinces_fr';
    public const PREDEFINED_PROVINCES_BIL = 'provinces_bil';
    public const PREDEFINED_STATES = 'states';
    public const PREDEFINED_STATES_TERRITORIES = 'states_territories';
    public const PREDEFINED_COUNTRIES = 'countries';
    public const PREDEFINED_LANGUAGES = 'languages';
    public const PREDEFINED_CURRENCIES = 'currencies';

    public function getOptionConfiguration(): ?OptionsConfigurationInterface;
}
