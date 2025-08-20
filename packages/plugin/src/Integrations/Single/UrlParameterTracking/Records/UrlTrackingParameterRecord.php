<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\Records;

use craft\db\ActiveRecord;

class UrlTrackingParameterRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_submissions_tracking_parameters}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }
}
