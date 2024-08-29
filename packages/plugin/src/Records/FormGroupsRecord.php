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
 * @property string $site
 * @property string $groups
 */
class FormGroupsRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_form_groups}}';

    /**
     * Returns the name of the associated database table.
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }
}
