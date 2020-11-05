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
use Solspace\Freeform\Library\DataObjects\EmailTemplate;
use Solspace\Freeform\Library\Mailing\NotificationInterface;

/**
 * Class Freeform_NotificationRecord
 *
 * @property int    $id
 * @property string $type
 * @property string $name
 */
class NotificationLogRecord extends ActiveRecord
{
    const TYPE_DIGEST = 'digest';

    const TABLE = '{{%freeform_notification_log}}';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }
}
