<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Services\FormIconService;

class OptionTypeIconHelper
{
    public static function getSvg(string $typeClass): ?string
    {
        $name = substr($typeClass, strrpos($typeClass, '\\') + 1);
        $prefix = 'Solspace\Freeform\Fields\Properties\Options\\';
        if ($typeClass !== $prefix.'Elements\Types\\'.$name.'\\'.$name
            && $typeClass !== $prefix.'Predefined\Types\\'.$name.'\\'.$name) {
            return null;
        }

        $icons = [
            'Assets' => 'image',
            'Entries' => 'newspaper',
            'Users' => 'user-group',
            'Categories' => 'sitemap',
            'Tags' => 'tags',
            'States' => 'map-location-dot',
            'Provinces' => 'map-location-dot',
            'Countries' => 'earth-americas',
            'Nationalities' => 'flag',
            'Languages' => 'language',
            'Currencies' => 'coins',
            'Numbers' => 'hashtag',
            'Years' => 'calendar',
            'Months' => 'calendar-days',
            'Days' => 'calendar-day',
            'DaysOfWeek' => 'calendar-week',
            'Timezones' => 'earth-americas',
            'AgeRanges' => 'users',
            'CompanySizes' => 'building',
            'Continents' => 'earth-americas',
            'EmploymentStatuses' => 'briefcase',
            'Industries' => 'industry',
            'RegionalSubdivisions' => 'map',
            'SurveyScales' => 'star',
            'TimeIntervals' => 'clock',
        ];
        if (!isset($icons[$name])) {
            return null;
        }

        return \Craft::$container->get(FormIconService::class)->getSvg($icons[$name]);
    }
}
