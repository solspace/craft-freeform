<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields\Interfaces;

interface ExternalOptionsInterface extends OptionsInterface
{
    const SOURCE_CUSTOM = 'custom';
    const SOURCE_ENTRIES = 'entries';
    const SOURCE_CATEGORIES = 'categories';
    const SOURCE_TAGS = 'tags';
    const SOURCE_USERS = 'users';
    const SOURCE_ASSETS = 'assets';
    const SOURCE_COMMERCE_PRODUCTS = 'commerce_products';
    const SOURCE_PREDEFINED = 'predefined';

    const PREDEFINED_DAYS = 'days';
    const PREDEFINED_DAYS_OF_WEEK = 'days_of_week';
    const PREDEFINED_MONTHS = 'months';
    const PREDEFINED_NUMBERS = 'numbers';
    const PREDEFINED_YEARS = 'years';
    const PREDEFINED_PROVINCES = 'provinces';
    const PREDEFINED_PROVINCES_FR = 'provinces_fr';
    const PREDEFINED_PROVINCES_BIL = 'provinces_bil';
    const PREDEFINED_STATES = 'states';
    const PREDEFINED_STATES_TERRITORIES = 'states_territories';
    const PREDEFINED_COUNTRIES = 'countries';
    const PREDEFINED_LANGUAGES = 'languages';
    const PREDEFINED_CURRENCIES = 'currencies';

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
