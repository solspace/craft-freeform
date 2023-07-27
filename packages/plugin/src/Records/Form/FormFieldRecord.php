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
use yii\db\ActiveQuery;

/**
 * @property int       $id
 * @property int       $formId
 * @property int       $rowId
 * @property int       $order
 * @property string    $type
 * @property string    $metadata
 * @property \DateTime $dateCreated
 * @property \DateTime $dateUpdated
 * @property string    $uid
 */
class FormFieldRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_forms_fields}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function getRow(): ActiveQuery
    {
        return $this->hasOne(FormRowRecord::class, ['id' => 'rowId']);
    }

    public function rules(): array
    {
        return [
            [['formId'], 'required'],
        ];
    }
}
