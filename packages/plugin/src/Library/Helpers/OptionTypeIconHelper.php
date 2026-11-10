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
            'Assets' => ['image', 'photo'],
            'Entries' => ['newspaper', 'newspaper'],
            'Users' => ['user-group', 'users'],
            'Categories' => ['sitemap', 'tree'],
            'Tags' => ['tags', 'tags'],
            'States' => ['map-location-dot', 'world'],
            'Provinces' => ['map-location-dot', 'world'],
            'Countries' => ['earth-americas', 'globe'],
            'Nationalities' => ['flag', 'user'],
            'Languages' => ['language', 'globe'],
            'Currencies' => ['coins', 'shopping-cart'],
            'Numbers' => ['hashtag', 'hash'],
            'Years' => ['calendar', 'clock'],
            'Months' => ['calendar-days', 'clock'],
            'Days' => ['calendar-day', 'clock'],
            'DaysOfWeek' => ['calendar-week', 'clock'],
            'Timezones' => ['earth-americas', 'world'],
            'AgeRanges' => ['users', 'users'],
            'CompanySizes' => ['building', 'users'],
            'Continents' => ['earth-americas', 'globe'],
            'EmploymentStatuses' => ['briefcase', 'user'],
            'Industries' => ['industry', 'tools'],
            'RegionalSubdivisions' => ['map', 'world'],
            'SurveyScales' => ['star', 'sliders'],
            'TimeIntervals' => ['clock', 'clock'],
        ];
        if (!isset($icons[$name])) {
            return null;
        }
        [$icon, $legacyIcon] = $icons[$name];
        $svg = \Craft::$container->get(FormIconService::class)->getSvg($icon);
        if ($svg) {
            return $svg;
        }

        // Craft 4 ships its system icons as standalone SVGs.
        $path = \Craft::getAlias('@app/icons/'.$legacyIcon.'.svg');

        return is_file($path) ? file_get_contents($path) : null;
    }
}
