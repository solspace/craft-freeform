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
use Solspace\Freeform\Library\DataObjects\SpamReason;

/**
 * Class SpamReasonRecord
 *
 * @property int    $id
 * @property int    $submissionId
 * @property string $reasonType
 * @property string $reasonMessage
 */
class SpamReasonRecord extends ActiveRecord
{
    const TABLE     = '{{%freeform_spam_reason}}';
    const TABLE_STD = 'freeform_spam_reason';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return SpamReason
     */
    public function getSpamReasonObject(): SpamReason
    {
        return new SpamReason($this->reasonType, $this->reasonMessage);
    }
}
