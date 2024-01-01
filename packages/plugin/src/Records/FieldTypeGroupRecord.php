<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;

/**
 * @property int    $id
 * @property string $color
 * @property string $label
 * @property array  $types
 */
class FieldTypeGroupRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_fields_type_groups}}';

    /**
     * Returns the name of the associated database table.
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }
}
