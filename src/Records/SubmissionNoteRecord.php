<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Records;


use craft\db\ActiveRecord;

/**
 * Class IntegrationsQueueRecord
 *
 * @property int       $id
 * @property int       $submissionId
 * @property string    $note
 */
class SubmissionNoteRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_submission_notes}}';

    const NOTE_FIELD_NAME = 'freeform-submission-note';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }
}
