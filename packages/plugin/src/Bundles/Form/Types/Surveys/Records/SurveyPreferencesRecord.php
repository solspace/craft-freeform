<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\Records;

use craft\db\ActiveRecord;

/**
 * @property int    $id
 * @property int    $userId
 * @property int    $fieldId
 * @property string $chartType
 * @property string $dateCreated
 * @property string $dateUpdated
 * @property string $uid
 */
class SurveyPreferencesRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_survey_preferences}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }
}
