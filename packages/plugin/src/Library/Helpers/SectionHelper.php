<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\models\EntryType;
use craft\models\Section;

class SectionHelper
{
    public static function getEntryTypeById(int $id): ?EntryType
    {
        return \Craft::$app->getEntries()->getEntryTypeById($id);
    }

    public static function getAllSections(): array
    {
        return \Craft::$app->getEntries()->getAllSections();
    }

    public static function getSectionById(int $id): ?Section
    {
        return \Craft::$app->getEntries()->getSectionById($id);
    }
}
