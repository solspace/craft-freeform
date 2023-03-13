<?php

namespace Solspace\Freeform\Fields\Interfaces;

interface ExternalOptionsInterface extends OptionsInterface
{
    public const SOURCE_CUSTOM = 'custom';
    public const SOURCE_ENTRIES = 'entries';
    public const SOURCE_CATEGORIES = 'categories';
    public const SOURCE_TAGS = 'tags';
    public const SOURCE_USERS = 'users';
    public const SOURCE_ASSETS = 'assets';
    public const SOURCE_COMMERCE_PRODUCTS = 'commerce_products';
    public const SOURCE_CALENDAR = 'calendar';
    public const SOURCE_PREDEFINED = 'predefined';

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

    /**
     * Returns the option source.
     */
    public function getOptionSource(): string;

    /**
     * @return mixed
     */
    public function getOptionTarget();

    public function getOptionConfiguration(): array;
}
