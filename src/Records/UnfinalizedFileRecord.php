<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;
use craft\records\Asset;
use yii\db\ActiveQuery;

/**
 * Class Freeform_FieldRecord
 *
 * @property int $id
 * @property int $assetId
 */
class UnfinalizedFileRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_unfinalized_files}}';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return ActiveQuery|Asset
     */
    public function getAsset(): ActiveQuery
    {
        return $this->hasOne(Asset::class, ['assetId' => 'id']);
    }
}
