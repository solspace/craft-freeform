<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use yii\db\ActiveQuery;

/**
 * @property int    $integrationId
 * @property string $handle
 * @property string $label
 * @property string $type
 * @property bool   $required
 */
class CrmFieldRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_crm_fields}}';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return ActiveQuery|IntegrationRecord
     */
    public function getIntegration(): ActiveQuery
    {
        return $this->hasOne(IntegrationRecord::TABLE, ['integrationId' => 'id']);
    }
}
