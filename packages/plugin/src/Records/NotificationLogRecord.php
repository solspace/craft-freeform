<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;

/**
 * Class Freeform_NotificationRecord.
 *
 * @property int       $id
 * @property string    $type
 * @property int       $identifier
 * @property string    $name
 * @property \DateTime $digestDate
 */
class NotificationLogRecord extends ActiveRecord
{
    public const TYPE_DIGEST_DEV = 'digest';
    public const TYPE_DIGEST_CLIENT = 'digest-client';

    public const TABLE = '{{%freeform_notification_log}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function rules(): array
    {
        return [
            [['type', 'digestDate'], 'required'],
            ['digestDate', 'date', 'format' => 'php:Y-m-d'],
        ];
    }
}
