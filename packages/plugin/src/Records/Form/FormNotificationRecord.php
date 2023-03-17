<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Records\Form;

use craft\db\ActiveRecord;

/**
 * @property int       $id
 * @property int       $notificationId
 * @property int       $formId
 * @property bool      $enabled
 * @property string    $metadata
 * @property \DateTime $dateCreated
 * @property \DateTime $dateUpdated
 * @property string    $uid
 */
class FormNotificationRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_forms_notifications}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * {@inheritDoc}
     */
    public function rules(): array
    {
        return [
            [['formId', 'notificationId'], 'unique', 'targetAttribute' => ['formId', 'notificationId']],
            [['formId', 'notificationId'], 'required'],
        ];
    }
}
