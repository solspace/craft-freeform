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
class SurveyViewSettingsRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_surveys_view_settings}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }
}
