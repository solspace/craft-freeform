<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\Records;

use craft\db\ActiveQuery;
use craft\db\ActiveRecord;
use Solspace\Freeform\Elements\Submission;

/**
 * @property int    $id
 * @property int    $submissionId
 * @property string $name
 * @property string $value
 */
class UrlTrackingParameterRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_submissions_tracking_parameters}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public static function getForSubmission(Submission $submission): ActiveQuery
    {
        return self::find()
            ->where(['submissionId' => $submission->id])
            ->orderBy(['name' => \SORT_ASC])
        ;
    }
}
