<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\models\EntryType;
use craft\models\Section;

class SectionHelper
{
    public static function getEntryTypeById(int $id): ?EntryType
    {
        return self::getService()->getEntryTypeById($id);
    }

    public static function getAllSections(): array
    {
        return self::getService()->getAllSections();
    }

    public static function getSectionById(int $id): ?Section
    {
        return self::getService()->getSectionById($id);
    }

    private static function getService(): mixed
    {
        return \Craft::$app->getEntries();
    }
}
