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

use craft\db\ActiveQuery;
use craft\db\ActiveRecord;

/**
 * @property int    $id
 * @property string $siteId
 * @property int    $order
 * @property string $label
 */
class FormGroupsRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_forms_groups}}';

    /**
     * Returns the name of the associated database table.
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function getEntries(): ActiveQuery
    {
        return $this
            ->hasMany(FormGroupsEntriesRecord::class, ['groupId' => 'id'])
            ->orderBy(['order' => \SORT_ASC])
        ;
    }
}
